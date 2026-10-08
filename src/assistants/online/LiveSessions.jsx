/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Search,
  Loader2,
  Video,
  Calendar,
  Clock,
  Users,
  Link2,
  FileDown,
  RefreshCw,
  Edit2,
  Trash2,
  Radio,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Upload,
  Save,
  ChevronDown,
  User,
  BookOpen,
  Layers,
  Eye,
} from "lucide-react";
import {
  notifySuccess,
  notifyError,
  notifyInfo,
  confirmToast,
} from "../../lib/notify";
import {
  assistantGetLiveSessions,
  assistantCreateLiveSession,
  assistantUpdateLiveSession,
  assistantDeleteLiveSession,
  assistantUpdateRecordingUrl,
  assistantGetDownloadMaterialUrl,
  assistantGetPreviewMaterialUrl,
} from "../../api/live-sessions/services";
import { fetchAllGrades, fetchGroupsByGrade } from "../../api/assistant/actions";
import { pageVariants, itemVariants, modalBackdrop, modalPanel } from "../../motion";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STATUS_MAP = {
  scheduled: { label: "مجدول", color: "bg-blue-100 text-blue-700", icon: Calendar },
  live: { label: "مباشر الان", color: "bg-red-100 text-red-700", icon: Radio },
  ended: { label: "انتهى", color: "bg-gray-100 text-gray-600", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-orange-100 text-orange-700", icon: XCircle },
};

const TARGET_TYPE_MAP = {
  grade: { label: "صف", icon: BookOpen },
  group: { label: "مجموعة", icon: Layers },
  student: { label: "طالب", icon: User },
};

const EMPTY_FORM = {
  title: "",
  description: "",
  start_time: "",
  duration_minutes: 60,

  target_type: "grade",
  grade_id: "",
  group_id: "",
  student_id: "",
  material_file: null,
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDateTime(dt) {
  if (!dt) return "—";
  try {
    const safeDt = typeof dt === "string" ? dt.replace(" ", "T") : dt;
    return new Date(safeDt).toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dt;
  }
}

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-500", icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const LiveSessions = () => {
  // ── Data State ──
  const [sessions, setSessions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);

  // ── Loading ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTargetType, setFilterTargetType] = useState("");

  // ── Modal State ──
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Recording Modal ──
  const [recordingModal, setRecordingModal] = useState(null); // session object
  const [recordingUrl, setRecordingUrl] = useState("");
  const [savingRecording, setSavingRecording] = useState(false);

  const materialFileRef = useRef(null);

  // ─────────────────────────────────────────────
  // Load Data
  // ─────────────────────────────────────────────

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterTargetType) params.target_type = filterTargetType;
      const data = await assistantGetLiveSessions(params);
      setSessions(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      notifyError(err?.message || "فشل تحميل الجلسات");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterTargetType]);

  const loadGrades = useCallback(async () => {
    const result = await fetchAllGrades();
    if (result.success) setGrades(result.data ?? []);
  }, []);

  const loadGroupsByGrade = useCallback(async (gradeId) => {
    if (!gradeId) { setGroups([]); return; }
    setLoadingGroups(true);
    const result = await fetchGroupsByGrade(gradeId);
    if (result.success) setGroups(result.data ?? []);
    else setGroups([]);
    setLoadingGroups(false);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  // ─────────────────────────────────────────────
  // Filtered Sessions
  // ─────────────────────────────────────────────

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.trim().toLowerCase();
    return sessions.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.meet_link?.toLowerCase().includes(q),
    );
  }, [sessions, search]);

  // ─────────────────────────────────────────────
  // Modal Helpers
  // ─────────────────────────────────────────────

  const openCreate = () => {
    setEditingSession(null);
    setForm(EMPTY_FORM);
    setGroups([]);
    setShowModal(true);
  };

  const openEdit = (session) => {
    setEditingSession(session);
    setForm({
      title: session.title || "",
      description: session.description || "",
      start_time: session.start_time
        ? session.start_time.replace(" ", "T").slice(0, 16)
        : "",
      duration_minutes: session.duration_minutes ?? 60,
      meet_link: session.meet_link || "",
      target_type: session.target_type || "grade",
      grade_id: session.grade_id ? String(session.grade_id) : "",
      group_id: session.group_id ? String(session.group_id) : "",
      student_id: session.student_id ? String(session.student_id) : "",
      material_file: null,
    });
    if (session.grade_id) loadGroupsByGrade(session.grade_id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSession(null);
    setForm(EMPTY_FORM);
    setGroups([]);
  };

  // ─────────────────────────────────────────────
  // Form Submit
  // ─────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      notifyError("عنوان الجلسة مطلوب");
      return;
    }
    if (!form.start_time) {
      notifyError("وقت البدء مطلوب");
      return;
    }
    if (!form.duration_minutes || Number(form.duration_minutes) <= 0) {
      notifyError("مدة الجلسة مطلوبة");
      return;
    }
    if (form.target_type === "grade" && !form.grade_id) {
      notifyError("اختر الصف المستهدف");
      return;
    }
    if (form.target_type === "group" && !form.group_id) {
      notifyError("اختر المجموعة المستهدفة");
      return;
    }
    if (form.target_type === "student" && !form.student_id.trim()) {
      notifyError("معرّف الطالب مطلوب");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("start_time", form.start_time);
      fd.append("duration_minutes", Number(form.duration_minutes));
      fd.append("target_type", form.target_type);
      if (form.target_type === "grade" && form.grade_id)
        fd.append("grade_id", form.grade_id);
      if (form.target_type === "group" && form.group_id)
        fd.append("group_id", form.group_id);
      if (form.target_type === "student" && form.student_id)
        fd.append("student_barcode", form.student_id.trim());
      if (form.material_file) fd.append("file", form.material_file);

      if (editingSession) {
        await assistantUpdateLiveSession(editingSession.id, fd);
        notifySuccess("تم تعديل الجلسة بنجاح");
      } else {
        await assistantCreateLiveSession(fd);
        notifySuccess("تم إنشاء الجلسة بنجاح");
      }
      closeModal();
      loadSessions();
    } catch (err) {
      notifyError(err?.message || "فشل حفظ الجلسة");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────

  const handleDelete = (session) => {
    confirmToast(`حذف جلسة "${session.title}"؟`, async () => {
      setDeletingId(session.id);
      try {
        await assistantDeleteLiveSession(session.id);
        notifySuccess("تم حذف الجلسة");
        loadSessions();
      } catch (err) {
        notifyError(err?.message || "فشل حذف الجلسة");
      } finally {
        setDeletingId(null);
      }
    });
  };

  // ─────────────────────────────────────────────
  // Recording URL Modal
  // ─────────────────────────────────────────────

  const openRecordingModal = (session) => {
    setRecordingModal(session);
    setRecordingUrl(session.recording_url || "");
  };

  const handleSaveRecordingUrl = async (customUrl) => {
    const val = typeof customUrl === "string" ? customUrl.trim() : recordingUrl.trim();
    setSavingRecording(true);
    try {
      await assistantUpdateRecordingUrl(recordingModal.id, val);
      notifySuccess(val ? "تم تحديث رابط تسجيل الحصة بنجاح" : "تم حذف رابط التسجيل بنجاح");
      setRecordingModal(null);
      loadSessions();
    } catch (err) {
      notifyError(err?.message || "فشل حفظ رابط التسجيل");
    } finally {
      setSavingRecording(false);
    }
  };

  const handleDeleteRecordingUrl = async () => {
    if (!window.confirm("هل تريد بالتأكيد حذف رابط تسجيل هذه الحصة؟")) return;
    await handleSaveRecordingUrl("");
  };

  // ─────────────────────────────────────────────
  // Material Download & Preview
  // ─────────────────────────────────────────────

  const handleDownloadMaterial = (session) => {
    const url = assistantGetDownloadMaterialUrl(session.id);
    window.open(url, "_blank");
  };

  const handlePreviewMaterial = (session) => {
    const url = assistantGetPreviewMaterialUrl(session.id);
    window.open(url, "_blank");
  };

  // ─────────────────────────────────────────────
  // Form field handlers
  // ─────────────────────────────────────────────

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleTargetTypeChange = (type) => {
    setField("target_type", type);
    setField("grade_id", "");
    setField("group_id", "");
    setField("student_id", "");
    setGroups([]);
  };

  const handleGradeChange = (gradeId) => {
    setField("grade_id", gradeId);
    setField("group_id", "");
    if (form.target_type === "group") loadGroupsByGrade(gradeId);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20" dir="rtl">
        <Loader2 size={36} className="animate-spin" style={{ color: "#009966" }} />
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 w-full min-h-screen pb-28 sm:pb-32"
      dir="rtl"
    >
      {/* ── Header ── */}
      <motion.header
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            الجلسات المباشرة
          </h1>
          <span className="text-gray-500 text-sm">إدارة جلسات البث المباشر</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm transition hover:opacity-90 active:scale-95"
          style={{ background: "#1a5d1a" }}
        >
          <Plus size={16} />
          جلسة جديدة
        </button>
      </motion.header>

      {/* ── Filter Bar ── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-2"
      >
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5 shadow-sm">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="بحث بالعنوان أو الرابط..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white shadow-sm min-w-[140px]"
        >
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_MAP).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        {/* Target Type Filter */}
        <select
          value={filterTargetType}
          onChange={(e) => setFilterTargetType(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white shadow-sm min-w-[140px]"
        >
          <option value="">كل الاستهدافات</option>
          {Object.entries(TARGET_TYPE_MAP).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={loadSessions}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition"
        >
          <RefreshCw size={15} />
          <span className="hidden sm:inline">تحديث</span>
        </button>
      </motion.div>

      {/* ── Sessions Grid ── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {filteredSessions.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <Video size={52} className="text-gray-200 mb-3" />
            <p className="text-base font-medium">لا توجد جلسات مباشرة</p>
            <p className="text-sm mt-1">انقر على "جلسة جديدة" لإنشاء أول جلسة</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={() => openEdit(session)}
              onDelete={() => handleDelete(session)}
              onOpenRecordingModal={() => openRecordingModal(session)}
              onDownloadMaterial={() => handleDownloadMaterial(session)}
              onPreviewMaterial={() => handlePreviewMaterial(session)}
              isDeleting={deletingId === session.id}
            />
          ))
        )}
      </motion.div>

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <SessionModal
            form={form}
            setField={setField}
            editing={editingSession}
            grades={grades}
            groups={groups}
            loadingGroups={loadingGroups}
            saving={saving}
            materialFileRef={materialFileRef}
            onTargetTypeChange={handleTargetTypeChange}
            onGradeChange={handleGradeChange}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>

      {/* ── Recording URL Modal ── */}
      <AnimatePresence>
        {recordingModal && (
          <RecordingModal
            session={recordingModal}
            recordingUrl={recordingUrl}
            setRecordingUrl={setRecordingUrl}
            saving={savingRecording}
            onSave={() => handleSaveRecordingUrl(recordingUrl)}
            onDelete={handleDeleteRecordingUrl}
            onClose={() => setRecordingModal(null)}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

// ─────────────────────────────────────────────
// Session Card
// ─────────────────────────────────────────────

function SessionCard({
  session,
  onEdit,
  onDelete,
  onOpenRecordingModal,
  onDownloadMaterial,
  onPreviewMaterial,
  isDeleting,
}) {
  const TargetIcon = TARGET_TYPE_MAP[session.target_type]?.icon || Users;
  const targetLabel = TARGET_TYPE_MAP[session.target_type]?.label || session.target_type;
  const isEnded = session.status === "ended";
  const hasRecording = !!session.recording_url;
  const hasMaterial = !!session.material_file_path || !!session.material_name;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      {/* Card Header */}
      <div
        className="px-4 py-3 flex items-start justify-between gap-2"
        style={{ background: "linear-gradient(135deg,#1a5d1a12 0%,#00996608 100%)" }}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
            {session.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
            <TargetIcon size={12} />
            <span>{targetLabel}</span>
          </div>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {/* Card Body */}
      <div className="px-4 py-3 flex flex-col gap-2 flex-1">
        {session.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{session.description}</p>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="shrink-0 text-gray-400" />
            <span>{formatDateTime(session.start_time)}</span>
          </div>
          {session.duration_minutes && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="shrink-0 text-gray-400" />
              <span>{session.duration_minutes} دقيقة</span>
            </div>
          )}
          {session.meet_link && (
            <a
              href={session.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:underline max-w-full"
              style={{ color: "#009966" }}
            >
              <Link2 size={13} className="shrink-0" />
              <span className="truncate">رابط الاجتماع</span>
              <ExternalLink size={11} className="shrink-0" />
            </a>
          )}
          {hasRecording && (
            <a
              href={session.recording_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:underline"
              style={{ color: "#D4B45C" }}
            >
              <Video size={13} className="shrink-0" />
              <span className="truncate">التسجيل</span>
              <ExternalLink size={11} className="shrink-0" />
            </a>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="border-t border-gray-100 px-3 py-2 flex flex-wrap items-center gap-1.5">
        {/* Edit */}
        <ActionBtn
          icon={Edit2}
          label="تعديل"
          onClick={onEdit}
          color="#1a5d1a"
          variant="ghost"
        />

        {/* Delete */}
        <ActionBtn
          icon={isDeleting ? Loader2 : Trash2}
          label="حذف"
          onClick={onDelete}
          color="#dc2626"
          variant="ghost"
          disabled={isDeleting}
          iconClass={isDeleting ? "animate-spin" : ""}
        />

        {/* Material Download & Preview */}
        {hasMaterial && (
          <>
            <ActionBtn
              icon={FileDown}
              label="تحميل الملزمة"
              onClick={onDownloadMaterial}
              color="#009966"
              variant="ghost"
            />
            <ActionBtn
              icon={Eye}
              label="معاينة"
              onClick={onPreviewMaterial}
              color="#4b5563"
              variant="ghost"
            />
          </>
        )}

        {/* Recording actions for ended sessions */}
        {isEnded && (
          <ActionBtn
            icon={hasRecording ? Edit2 : Link2}
            label={hasRecording ? "تعديل رابط التسجيل" : "إضافة رابط التسجيل"}
            onClick={onOpenRecordingModal}
            color={hasRecording ? "#7c3aed" : "#009966"}
            variant="ghost"
          />
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Action Button (icon + label)
// ─────────────────────────────────────────────

function ActionBtn({ icon: Icon, label, onClick, color, disabled, iconClass = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ color }}
    >
      <Icon size={13} className={iconClass} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// Session Modal (Create / Edit)
// ─────────────────────────────────────────────

function SessionModal({
  form,
  setField,
  editing,
  grades,
  groups,
  loadingGroups,
  saving,
  materialFileRef,
  onTargetTypeChange,
  onGradeChange,
  onSubmit,
  onClose,
}) {
  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-[#009966] focus:ring-1 focus:ring-[#009966]/20 transition";
  const labelCls = "block text-xs font-bold text-gray-600 mb-1";

  return (
    <motion.div
      variants={modalBackdrop}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalPanel}
        initial="hidden"
        animate="show"
        exit="exit"
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10 rounded-t-2xl"
        >
          <h2 className="font-bold text-base text-gray-900">
            {editing ? "تعديل الجلسة المباشرة" : "جلسة مباشرة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="p-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className={labelCls}>عنوان الجلسة <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputCls}
              placeholder="مثال: مراجعة الفصل الثالث"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>الوصف</label>
            <textarea
              className={inputCls + " resize-none"}
              placeholder="وصف اختياري للجلسة..."
              rows={2}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          {/* Start Time + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>وقت البدء <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.start_time}
                onChange={(e) => setField("start_time", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls}>المدة (دقيقة) <span className="text-red-500">*</span></label>
              <input
                type="number"
                className={inputCls}
                min={1}
                max={480}
                placeholder="60"
                value={form.duration_minutes}
                onChange={(e) => setField("duration_minutes", e.target.value)}
                required
              />
            </div>
          </div>


          {/* Target Type */}
          <div>
            <label className={labelCls}>الاستهداف <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TARGET_TYPE_MAP).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const active = form.target_type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onTargetTypeChange(key)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-bold transition ${
                      active
                        ? "border-[#009966] bg-[#009966]/10 text-[#009966]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Target Fields */}
          {form.target_type === "grade" && (
            <div>
              <label className={labelCls}>الصف <span className="text-red-500">*</span></label>
              <select
                className={inputCls}
                value={form.grade_id}
                onChange={(e) => onGradeChange(e.target.value)}
                required
              >
                <option value="">اختر الصف</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {form.target_type === "group" && (
            <>
              <div>
                <label className={labelCls}>الصف <span className="text-red-500">*</span></label>
                <select
                  className={inputCls}
                  value={form.grade_id}
                  onChange={(e) => onGradeChange(e.target.value)}
                  required
                >
                  <option value="">اختر الصف أولاً</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>المجموعة <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    className={inputCls}
                    value={form.group_id}
                    onChange={(e) => setField("group_id", e.target.value)}
                    disabled={!form.grade_id || loadingGroups}
                    required
                  >
                    <option value="">
                      {loadingGroups ? "جاري التحميل..." : "اختر المجموعة"}
                    </option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  {loadingGroups && (
                    <Loader2
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {form.target_type === "student" && (
            <div>
              <label className={labelCls}>معرّف الطالب <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={inputCls}
                placeholder="رقم أو معرف الطالب"
                value={form.student_id}
                onChange={(e) => setField("student_id", e.target.value)}
                required
              />
            </div>
          )}

          {/* Material File */}
          <div className="border border-dashed border-gray-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                <FileDown size={13} />
                ملف مرفق (اختياري)
              </span>
              <button
                type="button"
                onClick={() => materialFileRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                <Plus size={12} />
                إضافة ملف
              </button>
            </div>
            {form.material_file && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-700 truncate">{form.material_file.name}</span>
                <button
                  type="button"
                  onClick={() => setField("material_file", null)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-200 transition"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <input
              ref={materialFileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.pptx,.xlsx"
              onChange={(e) => {
                setField("material_file", e.target.files[0] || null);
                e.target.value = "";
              }}
              style={{ display: "none" }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "#1a5d1a" }}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={15} />
                  {editing ? "حفظ التعديلات" : "إنشاء الجلسة"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Recording URL Modal
// ─────────────────────────────────────────────

function RecordingModal({ session, recordingUrl, setRecordingUrl, saving, onSave, onDelete, onClose }) {
  const hasExisting = Boolean(session.recording_url && session.recording_url.trim());

  return (
    <motion.div
      variants={modalBackdrop}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalPanel}
        initial="hidden"
        animate="show"
        exit="exit"
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-gray-900">
            {hasExisting ? "تعديل رابط التسجيل" : "إضافة رابط تسجيل الحصة"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            الحصة: <span className="font-bold text-gray-700">{session.title}</span>
          </p>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              رابط التسجيل (YouTube أو غيره)
            </label>
            <input
              type="url"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-[#009966] focus:ring-1 focus:ring-[#009966]/20 transition"
              placeholder="https://..."
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
              style={{ background: "#009966" }}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={15} />
                  حفظ الرابط
                </>
              )}
            </button>
            {hasExisting && (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="px-3 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
              >
                حذف الرابط
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LiveSessions;
