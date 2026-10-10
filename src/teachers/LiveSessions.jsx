/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Video,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Link2,
  RefreshCw,
  Loader2,
  RotateCcw,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  WifiOff,
  Download,
  FileText,
  Clock,
  Calendar,
  Users,
  User,
  GraduationCap,
  Radio,
  Pencil,
  Save,
  ExternalLink,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  pageVariants,
  itemVariants,
  modalBackdrop,
  modalPanel,
} from "../motion";
import {
  teacherGetGoogleStatus,
  teacherGetLiveSessions,
  teacherCreateLiveSession,
  teacherUpdateLiveSession,
  teacherDeleteLiveSession,
  teacherUpdateRecordingUrl,
  teacherGetDownloadMaterialUrl,
  teacherGetPreviewMaterialUrl,
} from "../api/live-sessions/services";
import {
  getGrades,
  getGroupsByGrade,
  searchStudentByBarcode,
} from "../api/teacher/services";
import {
  notifySuccess,
  notifyError,
  notifyInfo,
} from "../lib/notify";
import Pagination from "../components/Pagination";

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const STATUS_META = {
  scheduled: {
    label: "مجدولة",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  live: {
    label: "مباشر الآن",
    classes: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500 animate-pulse",
  },
  ended: {
    label: "منتهية",
    classes: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "ملغاة",
    classes: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const TARGET_LABELS = {
  grade: "صف دراسي",
  group: "مجموعة",
  student: "طالب",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  start_time: "",
  duration_minutes: 60,
  target_type: "grade",
  grade_id: "",
  group_id: "",
  student_barcode: "",
  recording_url: "",
  status: "scheduled",
  material: null,
};

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function formatDateTime(iso) {
  if (!iso) return "-";
  try {
    const safeIso = typeof iso === "string" ? iso.replace(" ", "T") : iso;
    return new Date(safeIso).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function toLocalDateTimeInput(iso) {
  if (!iso) return "";
  try {
    const safeIso = typeof iso === "string" ? iso.replace(" ", "T") : iso;
    const d = new Date(safeIso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.scheduled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// ConfirmDeleteModal
// ─────────────────────────────────────────────────────────
function ConfirmDeleteModal({ session, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      variants={modalBackdrop}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        variants={modalPanel}
        initial="hidden"
        animate="show"
        exit="exit"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-gray-800 text-base">تأكيد الحذف</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          هل تريد حذف الحصة:
        </p>
        <p className="text-sm font-semibold text-gray-800 mb-5 truncate">
          {session?.title}
        </p>
        <p className="text-xs text-red-500 mb-5">
          لا يمكن التراجع عن هذه العملية.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            تأكيد الحذف
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// SessionCard
// ─────────────────────────────────────────────────────────
function SessionCard({ session, onEdit, onDelete, onRecordingUpdated }) {
  const [recordingInput, setRecordingInput] = useState(session.recording_url || "");
  const [savingUrl, setSavingUrl] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);

  useEffect(() => {
    setRecordingInput(session.recording_url || "");
  }, [session.recording_url]);

  const hasMaterial = Boolean(session.material_file_path || session.material_name);
  const downloadUrl = hasMaterial ? teacherGetDownloadMaterialUrl(session.id) : null;
  const previewUrl = hasMaterial ? teacherGetPreviewMaterialUrl(session.id) : null;

  const handleSaveRecordingUrl = async (customVal) => {
    const val = typeof customVal === "string" ? customVal.trim() : recordingInput.trim();
    setSavingUrl(true);
    try {
      await teacherUpdateRecordingUrl(session.id, val);
      notifySuccess(val ? "تم تحديث رابط تسجيل الحصة بنجاح" : "تم حذف رابط التسجيل بنجاح");
      session.recording_url = val || null;
      setRecordingInput(val);
      setEditingUrl(false);
      if (onRecordingUpdated) onRecordingUpdated(session.id, val || null);
    } catch (err) {
      notifyError(err, "فشل حفظ رابط التسجيل");
    } finally {
      setSavingUrl(false);
    }
  };

  const handleDeleteRecordingUrl = async () => {
    if (!window.confirm("هل تريد بالتأكيد حذف رابط تسجيل هذه الحصة؟")) return;
    await handleSaveRecordingUrl("");
  };

  const targetIcon =
    session.target_type === "grade" ? (
      <GraduationCap size={13} className="text-emerald-600" />
    ) : session.target_type === "group" ? (
      <Users size={13} className="text-blue-600" />
    ) : (
      <User size={13} className="text-amber-600" />
    );

  const targetLabel = TARGET_LABELS[session.target_type] || session.target_type;
  const targetValue =
    session.grade_name ||
    session.group_name ||
    session.student_name ||
    "-";

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      {/* Card header stripe */}
      <div className="h-1.5 w-full bg-gradient-to-l from-[#009966] to-[#1a5d1a]" />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Top row: status + actions */}
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={session.status} />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(session)}
              className="p-1.5 text-gray-400 hover:text-[#1a5d1a] hover:bg-green-50 rounded-lg transition"
              title="تعديل"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(session)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="حذف"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
          {session.title}
        </h3>

        {/* Description */}
        {session.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {session.description}
          </p>
        )}

        {/* Meta info */}
        <div className="space-y-1.5">
          {/* Target */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            {targetIcon}
            <span className="text-gray-400">{targetLabel}:</span>
            <span className="font-medium truncate">{targetValue}</span>
          </div>

          {/* Start time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar size={13} className="text-gray-400 shrink-0" />
            <span>{formatDateTime(session.start_time)}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock size={13} className="text-gray-400 shrink-0" />
            <span>{session.duration_minutes} دقيقة</span>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-gray-50">
          {/* Meet link */}
          {session.meet_link && (
            <a
              href={session.meet_link.startsWith("http") ? session.meet_link : `https://${session.meet_link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#009966] text-white rounded-lg text-xs font-medium hover:bg-[#00815a] transition"
            >
              <Video size={12} />
              الانضمام
            </a>
          )}

          {/* Material download & preview */}
          {hasMaterial && (
            <div className="flex items-center gap-1">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4B45C]/10 text-[#a08830] border border-[#D4B45C]/40 rounded-lg text-xs font-medium hover:bg-[#D4B45C]/20 transition"
                title={session.material_name || "تحميل الملزمة"}
              >
                <Download size={12} />
                {session.material_name
                  ? session.material_name.length > 14
                    ? session.material_name.slice(0, 14) + "..."
                    : session.material_name
                  : "الملزمة"}
              </a>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 transition"
                  title="معاينة الملزمة"
                >
                  <Eye size={12} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Recording section — ended sessions */}
        {session.status === "ended" && (
          <div className="border-t border-gray-100 pt-3 space-y-2">
            {session.recording_url && !editingUrl ? (
              <div className="flex items-center gap-2">
                <a
                  href={session.recording_url.startsWith("http") ? session.recording_url : `https://${session.recording_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium truncate flex-1"
                >
                  <ExternalLink size={12} />
                  مشاهدة التسجيل
                </a>
                <button
                  onClick={() => {
                    setRecordingInput(session.recording_url || "");
                    setEditingUrl(true);
                  }}
                  className="p-1 text-gray-400 hover:text-[#009966] rounded transition cursor-pointer"
                  title="تعديل الرابط"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={handleDeleteRecordingUrl}
                  disabled={savingUrl}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition cursor-pointer disabled:opacity-50"
                  title="حذف رابط التسجيل"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : editingUrl ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={recordingInput}
                  onChange={(e) => setRecordingInput(e.target.value)}
                  placeholder="رابط التسجيل (YouTube أو Drive أو غيره)..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#009966]"
                  dir="ltr"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveRecordingUrl(recordingInput)}
                    disabled={savingUrl}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#1a5d1a] text-white rounded-lg text-xs font-medium hover:bg-[#144d14] transition disabled:opacity-60 cursor-pointer"
                  >
                    {savingUrl ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    حفظ
                  </button>
                  <button
                    onClick={() => {
                      setEditingUrl(false);
                      setRecordingInput(session.recording_url || "");
                    }}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingUrl(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-gray-300 hover:border-[#009966] text-gray-600 hover:text-[#009966] rounded-lg text-xs font-medium hover:bg-green-50/40 transition cursor-pointer"
              >
                <Link2 size={12} />
                إضافة رابط تسجيل الحصة
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// SessionFormModal  (Create / Edit)
// ─────────────────────────────────────────────────────────
function SessionFormModal({ mode, session, onClose, onSuccess }) {
  const isEdit = mode === "edit";

  // Form state
  const [form, setForm] = useState(() => {
    if (isEdit && session) {
      return {
        title: session.title || "",
        description: session.description || "",
        start_time: toLocalDateTimeInput(session.start_time),
        duration_minutes: session.duration_minutes || 60,
        target_type: session.target_type || "grade",
        grade_id: session.grade_id || "",
        group_id: session.group_id || "",
        student_barcode: "",
        recording_url: session.recording_url || "",
        status: session.status || "scheduled",
        material: null,
      };
    }
    return { ...EMPTY_FORM };
  });

  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [studentFound, setStudentFound] = useState(
    isEdit && session?.student_id
      ? { id: session.student_id, full_name: session.student_name || "" }
      : null
  );
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  // Load grades on mount
  useEffect(() => {
    const loadGrades = async () => {
      setLoadingGrades(true);
      try {
        const data = await getGrades();
        setGrades(Array.isArray(data) ? data : data?.grades || []);
      } catch {
        // silent
      } finally {
        setLoadingGrades(false);
      }
    };
    loadGrades();
  }, []);

  // Load groups when grade_id changes (for group target)
  useEffect(() => {
    if (form.target_type === "group" && form.grade_id) {
      setLoadingGroups(true);
      getGroupsByGrade(form.grade_id)
        .then((data) => setGroups(Array.isArray(data) ? data : data?.groups || []))
        .catch(() => setGroups([]))
        .finally(() => setLoadingGroups(false));
    } else {
      setGroups([]);
    }
  }, [form.grade_id, form.target_type]);

  const set = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleBarcodeSearch = async () => {
    if (!form.student_barcode.trim()) return;
    setSearchingStudent(true);
    setStudentError("");
    setStudentFound(null);
    try {
      const data = await searchStudentByBarcode(form.student_barcode.trim());
      const student = Array.isArray(data) ? data[0] : data;
      if (student?.id) {
        setStudentFound(student);
      } else {
        setStudentError("لم يتم العثور على الطالب");
      }
    } catch {
      setStudentError("فشل البحث عن الطالب");
    } finally {
      setSearchingStudent(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "العنوان مطلوب";
    if (!form.start_time) errs.start_time = "وقت البدء مطلوب";
    if (!form.duration_minutes || form.duration_minutes < 15)
      errs.duration_minutes = "المدة يجب أن تكون 15 دقيقة على الأقل";
    if (form.target_type === "grade" && !form.grade_id)
      errs.grade_id = "اختر الصف الدراسي";
    if (form.target_type === "group") {
      if (!form.grade_id) errs.grade_id = "اختر الصف أولاً";
      if (!form.group_id) errs.group_id = "اختر المجموعة";
    }
    if (form.target_type === "student" && !studentFound)
      errs.student_barcode = "ابحث عن الطالب أولاً";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      let startTimeIso = form.start_time;
      try {
        if (form.start_time) {
          startTimeIso = new Date(form.start_time).toISOString();
        }
      } catch {
        startTimeIso = form.start_time;
      }
      fd.append("start_time", startTimeIso);
      fd.append("duration_minutes", String(form.duration_minutes));
      if (!isEdit) {
        fd.append("target_type", form.target_type);
        if (form.target_type === "grade") fd.append("grade_id", form.grade_id);
        if (form.target_type === "group") {
          fd.append("grade_id", form.grade_id);
          fd.append("group_id", form.group_id);
        }
        if (form.target_type === "student" && studentFound) {
          fd.append("student_id", String(studentFound.id));
        }
      }
      if (isEdit) {
        fd.append("status", form.status);
        if (form.recording_url) fd.append("recording_url", form.recording_url);
      }
      if (form.material) fd.append("file", form.material);

      if (isEdit) {
        await teacherUpdateLiveSession(session.id, fd);
        notifySuccess("تم تحديث الحصة بنجاح");
      } else {
        await teacherCreateLiveSession(fd);
        notifySuccess("تم إنشاء الحصة بنجاح");
      }
      onSuccess();
    } catch (err) {
      notifyError(err, "فشل حفظ الحصة");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent bg-white text-gray-700 transition";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";
  const errorCls = "text-xs text-red-500 mt-1";

  return (
    <motion.div
      variants={modalBackdrop}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        variants={modalPanel}
        initial="hidden"
        animate="show"
        exit="exit"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a5d1a]/10 rounded-xl">
              <Video size={18} className="text-[#1a5d1a]" />
            </div>
            <h2 className="font-bold text-gray-800 text-base">
              {isEdit ? "تعديل الحصة" : "إنشاء حصة جديدة"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Title */}
          <div>
            <label className={labelCls}>العنوان *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="عنوان الحصة..."
              className={inputCls}
            />
            {errors.title && <p className={errorCls}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>الوصف (اختياري)</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="وصف مختصر للحصة..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Start time + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>وقت البدء *</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
                className={inputCls}
              />
              {errors.start_time && <p className={errorCls}>{errors.start_time}</p>}
            </div>
            <div>
              <label className={labelCls}>المدة (دقيقة) *</label>
              <input
                type="number"
                value={form.duration_minutes}
                min={15}
                max={480}
                onChange={(e) => set("duration_minutes", Number(e.target.value))}
                className={inputCls}
              />
              {errors.duration_minutes && (
                <p className={errorCls}>{errors.duration_minutes}</p>
              )}
            </div>
          </div>

          {/* Target type — create only */}
          {!isEdit && (
            <div>
              <label className={labelCls}>الجمهور المستهدف *</label>
              <div className="flex gap-3">
                {[
                  { val: "grade", label: "صف دراسي", Icon: GraduationCap },
                  { val: "group", label: "مجموعة", Icon: Users },
                  { val: "student", label: "طالب", Icon: User },
                ].map(({ val, label, Icon }) => (
                  <label
                    key={val}
                    className={`flex-1 flex flex-col items-center gap-1.5 p-2.5 border-2 rounded-xl cursor-pointer transition text-xs font-medium ${
                      form.target_type === val
                        ? "border-[#009966] bg-green-50 text-[#009966]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="target_type"
                      value={val}
                      checked={form.target_type === val}
                      onChange={() => {
                        set("target_type", val);
                        set("grade_id", "");
                        set("group_id", "");
                        setStudentFound(null);
                        setStudentError("");
                      }}
                      className="sr-only"
                    />
                    <Icon size={16} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Grade select */}
          {!isEdit && (form.target_type === "grade" || form.target_type === "group") && (
            <div>
              <label className={labelCls}>
                {form.target_type === "grade" ? "الصف الدراسي *" : "الصف (لاختيار المجموعة) *"}
              </label>
              <select
                value={form.grade_id}
                onChange={(e) => {
                  set("grade_id", e.target.value);
                  set("group_id", "");
                }}
                className={inputCls}
                disabled={loadingGrades}
              >
                <option value="">-- اختر الصف --</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {errors.grade_id && <p className={errorCls}>{errors.grade_id}</p>}
            </div>
          )}

          {/* Group select */}
          {!isEdit && form.target_type === "group" && form.grade_id && (
            <div>
              <label className={labelCls}>المجموعة *</label>
              <select
                value={form.group_id}
                onChange={(e) => set("group_id", e.target.value)}
                className={inputCls}
                disabled={loadingGroups}
              >
                <option value="">-- اختر المجموعة --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {errors.group_id && <p className={errorCls}>{errors.group_id}</p>}
            </div>
          )}

          {/* Student barcode */}
          {!isEdit && form.target_type === "student" && (
            <div>
              <label className={labelCls}>كود الطالب (Barcode) *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.student_barcode}
                  onChange={(e) => {
                    set("student_barcode", e.target.value);
                    setStudentFound(null);
                    setStudentError("");
                  }}
                  placeholder="أدخل الباركود..."
                  className={`${inputCls} flex-1`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleBarcodeSearch}
                  disabled={searchingStudent || !form.student_barcode.trim()}
                  className="px-4 py-2.5 bg-[#1a5d1a] text-white rounded-xl text-sm font-medium hover:bg-[#144d14] transition disabled:opacity-60 flex items-center gap-1.5 shrink-0"
                >
                  {searchingStudent ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  بحث
                </button>
              </div>
              {studentFound && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  {studentFound.full_name}
                </p>
              )}
              {studentError && <p className={errorCls}>{studentError}</p>}
              {errors.student_barcode && (
                <p className={errorCls}>{errors.student_barcode}</p>
              )}
            </div>
          )}

          {/* Status — edit only */}
          {isEdit && (
            <div>
              <label className={labelCls}>الحالة</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls}
              >
                <option value="scheduled">مجدولة</option>
                <option value="live">مباشر الآن</option>
                <option value="ended">منتهية</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>
          )}

          {/* Recording URL — edit only */}
          {isEdit && (
            <div>
              <label className={labelCls}>رابط التسجيل (اختياري)</label>
              <input
                type="url"
                value={form.recording_url}
                onChange={(e) => set("recording_url", e.target.value)}
                placeholder="https://..."
                className={inputCls}
                dir="ltr"
              />
            </div>
          )}

          {/* Material file */}
          <div>
            <label className={labelCls}>مادة الحصة (اختياري)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#009966]/50 hover:bg-green-50/30 transition"
            >
              {form.material ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <FileText size={16} className="text-[#009966]" />
                  <span className="truncate max-w-xs">{form.material.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      set("material", null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <Download size={20} />
                  <span className="text-xs">
                    انقر لرفع ملف (PDF، Word، صورة...)
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => set("material", e.target.files?.[0] || null)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#1a5d1a] text-white rounded-xl text-sm font-medium hover:bg-[#144d14] transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#1a5d1a]/30"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "حفظ التعديلات" : "إنشاء الحصة"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component: LiveSessions
// ─────────────────────────────────────────────────────────
const LiveSessions = () => {
  const location = useLocation();

  // Google connection state
  const [googleStatus, setGoogleStatus] = useState(null); // null | { connected: bool, email? }
  const [googleLoading, setGoogleLoading] = useState(true);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [deleteSession, setDeleteSession] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debounceRef = useRef(null);

  // ── Detect google_connected / google_error query param ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("google_connected") === "true") {
      notifySuccess("تم ربط حساب Google بنجاح");
      loadGoogleStatus();
      // clean URL
      window.history.replaceState({}, "", location.pathname);
    }
    const googleErr = params.get("google_error");
    if (googleErr) {
      notifyError(decodeURIComponent(googleErr), "فشل ربط حساب Google");
      window.history.replaceState({}, "", location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Google Status ──
  const loadGoogleStatus = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const data = await teacherGetGoogleStatus();
      setGoogleStatus(data);
    } catch {
      setGoogleStatus({ connected: false });
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoogleStatus();
  }, [loadGoogleStatus]);

  // ── Sessions ──
  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
      };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (targetFilter) params.target_type = targetFilter;

      const data = await teacherGetLiveSessions(params);

      // Support both { sessions, pagination } and flat array
      const list = Array.isArray(data) ? data : (data?.sessions || data?.data || []);
      const pagination = data?.pagination;

      setSessions(list);
      setTotalPages(pagination?.totalPages || 1);
      setTotal(pagination?.total || list.length);
    } catch (err) {
      setError("فشل تحميل الحصص");
      notifyError(err, "فشل تحميل الحصص");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, targetFilter]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ── Handlers ──
  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(val.trim());
      setPage(1);
    }, 450);
  };

  const clearFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("");
    setTargetFilter("");
    setPage(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };


  const handleDelete = async () => {
    if (!deleteSession) return;
    setDeleting(true);
    try {
      await teacherDeleteLiveSession(deleteSession.id);
      notifySuccess("تم حذف الحصة");
      setDeleteSession(null);
      loadSessions();
    } catch (err) {
      notifyError(err, "فشل حذف الحصة");
    } finally {
      setDeleting(false);
    }
  };


  const googleConnected = googleStatus?.is_connected === true || googleStatus?.connected === true;

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen pb-10"
      dir="rtl"
    >
      {/* ══════════════ HEADER ══════════════ */}
      <motion.header variants={itemVariants} className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1a5d1a] rounded-2xl shadow-lg shadow-[#1a5d1a]/30">
              <Video size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  حصص البث المباشر
                </h1>
                {/* Google Connection Badge */}
                {googleLoading ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                    <Loader2 size={12} className="animate-spin text-[#009966]" />
                    جاري التحقق...
                  </span>
                ) : googleConnected ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 shadow-xs"
                    title={googleStatus?.email ? `حساب Google مرتبط: ${googleStatus.email}` : "حساب Google مرتبط"}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Google مرتبط
                  </span>
                ) : (
                  <Link
                    to="/teacher/profile"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition shadow-xs cursor-pointer group"
                    title="حساب Google غير مرتبط - اضغط للانتقال إلى الملف الشخصي وربطه"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Google غير مرتبط
                    <span className="text-[11px] font-normal text-amber-600 underline mr-0.5 group-hover:text-amber-800">
                      (ربط)
                    </span>
                  </Link>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                إدارة وجدولة حصص Google Meet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition disabled:opacity-60 cursor-pointer"
              title="تحديث"
            >
              <RotateCcw size={15} className={refreshing ? "animate-spin" : ""} />
            </motion.button>

            {googleConnected ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1a5d1a] text-white rounded-xl text-sm font-medium hover:bg-[#144d14] transition shadow-lg shadow-[#1a5d1a]/30 cursor-pointer"
              >
                <Plus size={16} />
                إنشاء حصة
              </motion.button>
            ) : (
              <Link
                to="/teacher/profile"
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-medium transition cursor-pointer"
                title="قم بربط حساب Google من الملف الشخصي لإنشاء حصص"
              >
                <Plus size={16} />
                إنشاء حصة
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* ══════════════ FILTER BAR ══════════════ */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-5"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 flex-1 focus-within:border-[#009966]/60 transition-colors">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="بحث بالعنوان..."
              className="bg-transparent focus:outline-none text-sm w-full"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009966] bg-white text-gray-700 min-w-36"
          >
            <option value="">كل الحالات</option>
            <option value="scheduled">مجدولة</option>
            <option value="live">مباشر الآن</option>
            <option value="ended">منتهية</option>
            <option value="cancelled">ملغاة</option>
          </select>

          {/* Target filter */}
          <select
            value={targetFilter}
            onChange={(e) => {
              setTargetFilter(e.target.value);
              setPage(1);
            }}
            className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009966] bg-white text-gray-700 min-w-36"
          >
            <option value="">كل الأنواع</option>
            <option value="grade">صف دراسي</option>
            <option value="group">مجموعة</option>
            <option value="student">طالب</option>
          </select>

          {/* Clear filters */}
          {(searchQuery || statusFilter || targetFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 font-medium px-2 transition whitespace-nowrap"
            >
              إلغاء الفلترة
            </button>
          )}
        </div>
      </motion.div>

      {/* ══════════════ SESSIONS GRID ══════════════ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={36} className="animate-spin text-[#009966]" />
          <span className="text-sm text-gray-500">جاري تحميل الحصص...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700">{error}</p>
          <button
            onClick={loadSessions}
            className="px-4 py-2 bg-[#1a5d1a] text-white rounded-xl text-sm font-medium hover:bg-[#144d14] transition"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 bg-gray-100 rounded-full">
            <Video size={36} className="text-gray-400" />
          </div>
          <p className="text-base font-bold text-gray-700">لا توجد حصص</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            {searchQuery || statusFilter || targetFilter
              ? "لا توجد حصص مطابقة للبحث، جرب تعديل الفلاتر"
              : googleConnected
              ? "لم يتم إنشاء أي حصة بعد. ابدأ بإنشاء حصتك الأولى"
              : "قم بربط حساب Google أولاً لإنشاء حصص البث"}
          </p>
          {googleConnected && !searchQuery && !statusFilter && !targetFilter && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a5d1a] text-white rounded-xl text-sm font-medium hover:bg-[#144d14] transition"
            >
              <Plus size={16} />
              إنشاء أول حصة
            </button>
          )}
        </motion.div>
      ) : (
        <>
          {/* Count bar */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-3 px-1"
          >
            <span className="text-xs text-gray-500 font-medium">
              {total} حصة
            </span>
          </motion.div>

          {/* Grid */}
          <motion.div
            variants={pageVariants}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {sessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onEdit={(sess) => setEditSession(sess)}
                onDelete={(sess) => setDeleteSession(sess)}
                onRecordingUpdated={(id, newUrl) => {
                  setSessions((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, recording_url: newUrl } : item))
                  );
                }}
              />
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
                limit={PAGE_SIZE}
                onChange={(p) => setPage(p)}
              />
            </div>
          )}
        </>
      )}

      {/* ══════════════ MODALS ══════════════ */}
      <AnimatePresence>
        {/* Create */}
        {showCreate && (
          <SessionFormModal
            key="create"
            mode="create"
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              setShowCreate(false);
              loadSessions();
            }}
          />
        )}

        {/* Edit */}
        {editSession && (
          <SessionFormModal
            key="edit"
            mode="edit"
            session={editSession}
            onClose={() => setEditSession(null)}
            onSuccess={() => {
              setEditSession(null);
              loadSessions();
            }}
          />
        )}

        {/* Delete confirm */}
        {deleteSession && (
          <ConfirmDeleteModal
            key="delete"
            session={deleteSession}
            onConfirm={handleDelete}
            onCancel={() => setDeleteSession(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default LiveSessions;
