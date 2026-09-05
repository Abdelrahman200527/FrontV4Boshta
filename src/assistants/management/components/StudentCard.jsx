/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/purity */
import {
  BarChart3,
  Hash,
  Printer,
  X,
  Calendar,
  Phone,
  Barcode,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Wallet,
  Loader2,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../../../motion";
import { printBarcodeWindow, renderBarcode } from "../../../utils/barcode.js";
import { useApiQuery, useApiList } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import {
  fetchStudentStats,
  fetchStudentAttendanceHistory,
  fetchStudentPaperExams,
  fetchStudentOnlineExams,
} from "../../../api/assistant/actions";

/* ---------------- helpers ---------------- */

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** يجيب أول قيمة رقمية موجودة من عدة أسماء محتملة للحقل */
const pick = (obj, keys, fallback = null) => {
  if (!obj) return fallback;
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
};

const formatDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (t) => {
  if (!t) return "";
  if (typeof t === "string" && /^\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  const date = new Date(t);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitial = (name) => (name ? name.trim()[0] || "؟" : "؟");

const isPresent = (status) => {
  if (status === 1 || status === true) return true;
  const s = String(status || "").toLowerCase();
  return s === "present" || s === "حاضر" || s === "attended" || s === "1";
};

/** يطلّع { degree, max, label, date } من أي شكل امتحان ورقي/أونلاين */
const normalizeExam = (exam, online = false) => {
  const degree = num(
    pick(
      exam,
      online
        ? ["score", "total_score", "obtained_score", "degree", "student_score"]
        : ["degree", "score", "student_degree", "obtained_degree", "result"],
      0,
    ),
  );
  const max = num(
    pick(
      exam,
      online
        ? [
            "max_score",
            "total_degree",
            "exam_total_score",
            "full_mark",
            "total_marks",
            "max_degree",
            "questions_count",
          ]
        : [
            "max_degree",
            "total_degree",
            "full_mark",
            "full_degree",
            "exam_max_degree",
            "max_score",
            "total_marks",
            "out_of",
          ],
      0,
    ),
  );
  return {
    id: pick(
      exam,
      ["id", "exam_id", "attempt_id"],
      Math.random().toString(36).slice(2),
    ),
    label: pick(
      exam,
      ["exam_name", "title", "exam_title", "name"],
      online ? "امتحان أونلاين" : "امتحان ورقي",
    ),
    date: pick(
      exam,
      ["exam_date", "created_at", "date", "submitted_at", "finished_at"],
      null,
    ),
    degree,
    max,
    online,
  };
};

const SectionSpinner = ({ label = "جاري التحميل..." }) => (
  <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
    <Loader2 size={16} className="animate-spin text-primary" />
    <span>{label}</span>
  </div>
);

const SkeletonLines = ({ rows = 3 }) => (
  <div className="p-3 space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-8 rounded-lg bg-slate-100 animate-pulse" />
    ))}
  </div>
);

const ScoreBadge = ({ degree, max }) => {
  const pct = max > 0 ? Math.round((degree / max) * 100) : null;
  const color =
    pct === null
      ? "text-slate-700 bg-slate-100"
      : pct >= 85
        ? "text-green-700 bg-green-50"
        : pct >= 50
          ? "text-amber-700 bg-amber-50"
          : "text-red-700 bg-red-50";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${color}`}
      dir="ltr"
    >
      {degree}
      {max > 0 && <span className="opacity-70">/ {max}</span>}
    </span>
  );
};

/* ---------------- component ---------------- */

const StudentCard = ({
  student,
  stats: initialStats = null,
  onClose = () => {},
}) => {
  const {
    id,
    barcode,
    full_name,
    phone,
    parent_phone,
    grade_name,
    group_name,
    notes,
    parent_token,
    profile_image,
  } = student || {};

  const [imgError, setImgError] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && barcode)
      renderBarcode(svgRef.current, barcode, { height: 50, fontSize: 12 });
  }, [barcode]);

  // ✅ Build image URL
  const getStudentImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `https://backend.benb3n.cloud/${imagePath.replace(/^\//, "")}`;
  };

  const studentImageUrl = getStudentImageUrl(profile_image);

  /* كل جزء بيحمل لوحده */
  const statsQuery = useApiQuery(
    qk.students.stats(id),
    () => fetchStudentStats(id),
    {
      enabled: Boolean(id),
      initialData: initialStats
        ? { data: initialStats, pagination: null }
        : undefined,
      errorMessage: "فشل تحميل إحصائيات الطالب",
    },
  );

  const attendanceQuery = useApiList(
    qk.students.attendance(id),
    () => fetchStudentAttendanceHistory(id),
    { enabled: Boolean(id), errorMessage: "فشل تحميل سجل الحضور" },
  );

  const paperExamsQuery = useApiList(
    qk.students.paperExams(id),
    () => fetchStudentPaperExams(id),
    {
      enabled: Boolean(id),
      errorMessage: "فشل تحميل درجات الامتحانات الورقية",
    },
  );

  const onlineExamsQuery = useApiList(
    qk.students.onlineExams(id),
    () => fetchStudentOnlineExams(id),
    {
      enabled: Boolean(id),
      errorMessage: "فشل تحميل درجات الامتحانات الأونلاين",
    },
  );

  const stats = statsQuery.data || initialStats || null;

  const attendanceRows = useMemo(() => {
    const rows = attendanceQuery.data || [];
    return rows
      .map((row) => ({
        id: pick(
          row,
          ["id", "attendance_id"],
          Math.random().toString(36).slice(2),
        ),
        date: pick(
          row,
          ["attendance_date", "session_date", "date", "created_at"],
          null,
        ),
        time: pick(
          row,
          ["attended_at", "arrived_at", "time", "created_at"],
          null,
        ),
        present: isPresent(
          pick(
            row,
            ["status", "is_present", "present", "attendance_status"],
            0,
          ),
        ),
        group: pick(row, ["group_name", "group"], null),
        note: pick(row, ["notes", "note"], null),
      }))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [attendanceQuery.data]);

  const exams = useMemo(() => {
    const paper = (paperExamsQuery.data || []).map((e) =>
      normalizeExam(e, false),
    );
    const online = (onlineExamsQuery.data || []).map((e) =>
      normalizeExam(e, true),
    );
    return [...paper, ...online].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
    );
  }, [paperExamsQuery.data, onlineExamsQuery.data]);

  const examsTotals = useMemo(() => {
    const withMax = exams.filter((e) => e.max > 0);
    const degree = withMax.reduce((sum, e) => sum + e.degree, 0);
    const max = withMax.reduce((sum, e) => sum + e.max, 0);
    return {
      degree,
      max,
      pct: max > 0 ? Math.round((degree / max) * 100) : 0,
      count: exams.length,
    };
  }, [exams]);

  /* حضور */
  const presentDays =
    num(pick(stats, ["present_days", "attended_days"], 0)) ||
    attendanceRows.filter((r) => r.present).length;
  const totalDays =
    num(pick(stats, ["total_attendance_days", "total_days"], 0)) ||
    attendanceRows.length;
  const attendancePct = stats?.attendance_percentage
    ? Math.round(num(stats.attendance_percentage))
    : totalDays > 0
      ? Math.round((presentDays / totalDays) * 100)
      : 0;

  /* مدفوعات */
  const totalPaid = num(pick(stats, ["total_paid"], 0));
  const totalRequired = num(pick(stats, ["total_required"], 0));
  const remainingBalance = num(pick(stats, ["remaining_balance"], 0));
  const paidThisMonth =
    totalPaid > 0 && totalRequired > 0 && totalPaid >= totalRequired;

  const examsLoading = paperExamsQuery.isLoading || onlineExamsQuery.isLoading;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-225 max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ✅ Student Avatar */}
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl overflow-hidden border-2 border-primary/20 shrink-0">
              {studentImageUrl && !imgError ? (
                <img
                  src={studentImageUrl}
                  alt={full_name}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{getInitial(full_name)}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {full_name || "طالب"}
              </h2>
              <p className="text-xs text-slate-500">
                {grade_name || "-"} • {group_name || "-"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <Barcode size={14} className="text-slate-400" />
              <span className="text-slate-500">الباركود:</span>
              <span className="font-mono">{barcode || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              <span className="text-slate-500">الهاتف:</span>
              <span dir="ltr">{phone || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              <span className="text-slate-500">ولي الأمر:</span>
              <span dir="ltr">{parent_phone || "-"}</span>
            </div>
            {parent_token && (
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-400" />
                <span className="text-slate-500">كود ولي الأمر:</span>
                <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-xs">
                  {parent_token}
                </span>
              </div>
            )}
            {notes && (
              <div className="flex items-start gap-2">
                <span className="text-slate-500">ملاحظات:</span>
                <span className="text-slate-700">{notes}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-between">
            <div className="text-xs text-slate-400 mb-1">باركود الطالب</div>
            <svg ref={svgRef}></svg>
            <button
              onClick={() => printBarcodeWindow(student, "سنتر بشتة")}
              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              <Printer size={14} /> طباعة الباركود
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="text-xs text-slate-500 mb-1 text-right">
              نسبة الحضور
            </div>
            {statsQuery.isLoading && attendanceQuery.isLoading ? (
              <div className="h-7 w-20 rounded bg-slate-200 animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">
                  {attendancePct}%
                </div>
                <div className="text-xs text-slate-400">
                  {presentDays} / {totalDays} يوم
                </div>
              </>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mb-1">
              <span>مجموع الدرجات</span>
              <BarChart3 size={14} />
            </div>
            {examsLoading ? (
              <div className="h-7 w-24 rounded bg-slate-200 animate-pulse" />
            ) : examsTotals.max > 0 ? (
              <>
                <div className="text-2xl font-bold text-slate-900" dir="ltr">
                  {examsTotals.degree}{" "}
                  <span className="text-base text-slate-400">
                    / {examsTotals.max}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {examsTotals.pct}% • {examsTotals.count} امتحان
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">-</div>
                <div className="text-xs text-slate-400">
                  لا توجد درجات مسجلة
                </div>
              </>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mb-1">
              <span>المدفوعات</span>
              <Wallet size={14} />
            </div>
            {statsQuery.isLoading ? (
              <div className="h-7 w-24 rounded bg-slate-200 animate-pulse" />
            ) : (
              <>
                <div className="text-xl font-bold text-green-600">
                  {totalPaid} ج.م
                </div>
                <div className="text-xs text-slate-400">
                  المطلوب: {totalRequired} ج.م
                </div>
              </>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mb-1">
              <span>الاشتراك الحالي</span>
              <Calendar size={14} />
            </div>
            {statsQuery.isLoading ? (
              <div className="h-7 w-24 rounded bg-slate-200 animate-pulse" />
            ) : (
              <>
                <div
                  className="text-lg font-bold"
                  style={{ color: paidThisMonth ? "#10b981" : "#ef4444" }}
                >
                  {paidThisMonth ? "مدفوع" : "غير مدفوع"}
                </div>
                <div className="text-xs text-slate-400">
                  {paidThisMonth
                    ? "تم سداد هذا الشهر"
                    : `المتبقي: ${remainingBalance} ج.م`}
                </div>
              </>
            )}
          </div>
        </div>

        {/* درجات الامتحانات */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-200 font-bold text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" />
              درجات الامتحانات
            </span>
            {examsTotals.max > 0 && (
              <span className="text-xs font-normal text-slate-500" dir="ltr">
                {examsTotals.degree} / {examsTotals.max}
              </span>
            )}
          </div>

          {examsLoading ? (
            <SkeletonLines rows={3} />
          ) : exams.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              لا توجد امتحانات مسجلة لهذا الطالب
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs sticky top-0">
                  <tr>
                    <th className="py-2 px-3 text-right">الامتحان</th>
                    <th className="py-2 px-3 text-right">النوع</th>
                    <th className="py-2 px-3 text-right">التاريخ</th>
                    <th className="py-2 px-3 text-right">الدرجة</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr
                      key={`${exam.online ? "on" : "pa"}-${exam.id}`}
                      className="border-t border-slate-100"
                    >
                      <td className="py-2 px-3 text-right text-slate-700">
                        {exam.label}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-lg ${exam.online ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"}`}
                        >
                          {exam.online ? "أونلاين" : "ورقي"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500 text-xs">
                        {formatDate(exam.date)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <ScoreBadge degree={exam.degree} max={exam.max} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* سجل الحضور */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-200 font-bold text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              سجل الحضور
            </span>
            {attendanceRows.length > 0 && (
              <span className="text-xs font-normal text-slate-500">
                {presentDays} حاضر •{" "}
                {Math.max(
                  attendanceRows.length -
                    attendanceRows.filter((r) => r.present).length,
                  0,
                )}{" "}
                غائب
              </span>
            )}
          </div>

          {attendanceQuery.isLoading ? (
            <SkeletonLines rows={4} />
          ) : attendanceRows.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              لا يوجد سجل حضور لهذا الطالب
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs sticky top-0">
                  <tr>
                    <th className="py-2 px-3 text-right">التاريخ</th>
                    <th className="py-2 px-3 text-right">الحالة</th>
                    <th className="py-2 px-3 text-right">الوقت</th>
                    <th className="py-2 px-3 text-right">المجموعة</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="py-2 px-3 text-right text-slate-700">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {row.present ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">
                            <CheckCircle2 size={12} /> حاضر
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-lg">
                            <XCircle size={12} /> غائب
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500 text-xs">
                        {formatTime(row.time) || "-"}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500 text-xs">
                        {row.group || group_name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {statsQuery.isFetching && !statsQuery.isLoading && (
          <SectionSpinner label="جاري تحديث البيانات..." />
        )}
      </motion.div>
    </motion.div>
  );
};

export default StudentCard;