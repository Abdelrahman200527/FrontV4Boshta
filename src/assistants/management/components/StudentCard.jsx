/* eslint-disable no-unused-vars */
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
  FileText,
  Video,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  AlertCircle,
  ExternalLink,
  Download,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../../../motion";
import { printBarcodeWindow, renderBarcode } from "../../../utils/barcode.js";
import { useApiQuery, useApiList } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import {
  fetchStudentStats,
  fetchStudentAttendanceHistory,
  fetchStudentPaperExams,
  fetchStudentOnlineExams,
  fetchStudentSubmissions,
  fetchStudentAssignments,
  fetchStudentPlaylists,
  fetchStudentPayments,
  fetchStudentCurrentSubscription,
  fetchStudentConsecutiveAbsences,
} from "../../../api/assistant/actions";

// ============================================
// HELPERS
// ============================================

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

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

const formatDateTime = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

const getPaymentStatus = (student, currentMonth) => {
  if (!student) return "unknown";
  const status = String(student.subscription_status || "").toLowerCase();
  const paymentStatus = String(student.payment_status || "").toLowerCase();

  if (status === "paid" || paymentStatus === "paid") return "paid";
  if (paymentStatus === "no_subscription") return "no_subscription";
  if (student.subscription_month === currentMonth) return "unpaid";
  if (status === "unpaid" || paymentStatus === "unpaid") return "unpaid";
  return "no_subscription";
};

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

// ============================================
// SMALL COMPONENTS
// ============================================

const SectionSkeleton = ({ rows = 3 }) => (
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

const EmptyState = ({ icon: Icon, message, action }) => (
  <div className="p-6 text-center">
    <Icon size={32} className="mx-auto mb-2 text-gray-300" />
    <p className="text-xs sm:text-sm text-gray-400">{message}</p>
    {action}
  </div>
);

const StatCard = ({ label, value, icon: Icon, color = "blue", subtitle }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-slate-50 rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-end gap-1 text-[10px] sm:text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <div className={`p-1 rounded-md ${colorMap[color]}`}>
          <Icon size={11} />
        </div>
      </div>
      <div className="text-lg sm:text-2xl font-bold text-slate-900">
        {value}
      </div>
      {subtitle && (
        <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ============================================
// TABS
// ============================================

const TABS = [
  { key: "overview", label: "نظرة عامة", icon: BarChart3 },
  { key: "attendance", label: "الحضور", icon: Calendar },
  { key: "exams", label: "الامتحانات", icon: BookOpen },
  { key: "payments", label: "المدفوعات", icon: Wallet },
  { key: "homework", label: "الواجبات", icon: ClipboardList },
];

// ============================================
// MAIN COMPONENT
// ============================================

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

  const [activeTab, setActiveTab] = useState("overview");
  const [imgError, setImgError] = useState(false);
  const svgRef = useRef(null);

  const currentMonthStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  useEffect(() => {
    if (svgRef.current && barcode)
      renderBarcode(svgRef.current, barcode, { height: 50, fontSize: 12 });
  }, [barcode]);

  // Build image URL
  const getStudentImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `https://backend.benb3n.cloud/${imagePath.replace(/^\//, "")}`;
  };

  const studentImageUrl = getStudentImageUrl(profile_image);

  // ============================================
  // QUERIES (lazy-loaded per tab)
  // ============================================

  // Stats (always fetched — used in overview)
  const statsQuery = useApiQuery(
    qk.students.stats(id),
    () => fetchStudentStats(id),
    {
      enabled: Boolean(id),
      initialData: initialStats
        ? { data: initialStats, pagination: null }
        : undefined,
      errorMessage: "فشل تحميل إحصائيات الطالب",
      staleTime: 60 * 1000,
    },
  );

  // Attendance (fetch when tab is active)
  const attendanceQuery = useApiList(
    qk.students.attendance(id),
    () => fetchStudentAttendanceHistory(id),
    {
      enabled: Boolean(id) && activeTab === "attendance",
      errorMessage: "فشل تحميل سجل الحضور",
    },
  );

  const consecutiveAbsencesQuery = useApiQuery(
    qk.students.consecutiveAbsences(id),
    () => fetchStudentConsecutiveAbsences(id),
    {
      enabled: Boolean(id) && activeTab === "attendance",
      showErrorToast: false,
    },
  );

  // Exams (fetch when tab is active)
  const paperExamsQuery = useApiList(
    qk.students.paperExams(id),
    () => fetchStudentPaperExams(id),
    {
      enabled: Boolean(id) && activeTab === "exams",
      errorMessage: "فشل تحميل الامتحانات الورقية",
    },
  );

  const onlineExamsQuery = useApiList(
    qk.students.onlineExams(id),
    () => fetchStudentOnlineExams(id),
    {
      enabled: Boolean(id) && activeTab === "exams",
      errorMessage: "فشل تحميل امتحانات الأونلاين",
    },
  );

  // Payments (fetch when tab is active)
  const paymentsQuery = useApiList(
    qk.students.payments(id),
    () => fetchStudentPayments(id),
    {
      enabled: Boolean(id) && activeTab === "payments",
      errorMessage: "فشل تحميل المدفوعات",
    },
  );

  const currentSubQuery = useApiQuery(
    qk.students.currentSubscription(id),
    () => fetchStudentCurrentSubscription(id),
    {
      enabled: Boolean(id) && activeTab === "payments",
      showErrorToast: false,
    },
  );

  // Homework (fetch when tab is active)
  const assignmentsQuery = useApiList(
    qk.students.assignments(id),
    () => fetchStudentAssignments(id),
    {
      enabled: Boolean(id) && activeTab === "homework",
      errorMessage: "فشل تحميل الواجبات",
    },
  );

  const submissionsQuery = useApiList(
    qk.students.submissions(id),
    () => fetchStudentSubmissions(id),
    {
      enabled: Boolean(id) && activeTab === "homework",
      errorMessage: "فشل تحميل التسليمات",
    },
  );

  const playlistsQuery = useApiList(
    qk.students.playlists(id),
    () => fetchStudentPlaylists(id),
    {
      enabled: Boolean(id),
      showErrorToast: false,
    },
  );

  // ============================================
  // DATA PROCESSING
  // ============================================

  const stats = statsQuery.data || initialStats || null;

  // Attendance
  const attendanceRows = useMemo(() => {
    const rows = attendanceQuery.data || [];
    return rows
      .map((row, index) => ({
        id: pick(row, ["id", "attendance_id"], `attendance-${index}`),
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
        isMakeup: pick(row, ["is_makeup"], 0) === 1,
      }))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [attendanceQuery.data]);

  // Exams
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

  // Payments
  const payments = useMemo(() => {
    const raw = paymentsQuery.data || [];
    return raw
      .map((p) => ({
        id: pick(
          p,
          ["id"],
          `payment-${String(p?.payment_date ?? p?.date ?? p?.created_at ?? "")}-${String(p?.amount ?? "")}-${String(p?.notes ?? "")}`,
        ),
        amount: num(pick(p, ["amount"], 0)),
        mode: pick(p, ["payment_mode", "mode"], "normal"),
        date: pick(p, ["payment_date", "date", "created_at"], null),
        notes: pick(p, ["notes"], null),
      }))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [paymentsQuery.data]);

  const totalPaid = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  // Homework
  const assignments = useMemo(() => {
    const raw = assignmentsQuery.data || [];
    return raw
      .map((a) => ({
        id: pick(
          a,
          ["id", "assignment_id"],
          `assignment-${String(a?.title ?? "")}-${String(a?.deadline ?? "")}-${String(a?.full_mark ?? a?.max_score ?? "")}`,
        ),
        title: pick(a, ["title"], "واجب"),
        deadline: pick(a, ["deadline"], null),
        fullMark: num(pick(a, ["full_mark", "max_score"], 0)),
        submitted: Boolean(pick(a, ["submission_id", "submitted_at"], null)),
        score: pick(a, ["submission_score", "score"], null),
        status: pick(a, ["assignment_status"], "pending"),
      }))
      .sort((a, b) => new Date(b.deadline || 0) - new Date(a.deadline || 0));
  }, [assignmentsQuery.data]);

  const submissions = useMemo(() => {
    const raw = submissionsQuery.data || [];
    return raw
      .map((s) => ({
        id: pick(
          s,
          ["submission_id", "id"],
          `submission-${String(s?.assignment_title ?? s?.title ?? "")}-${String(s?.submitted_at ?? "")}-${String(s?.score ?? "")}`,
        ),
        assignmentTitle: pick(s, ["assignment_title", "title"], "واجب"),
        score: pick(s, ["score"], null),
        fullMark: num(pick(s, ["full_mark", "max_score"], 0)),
        submittedAt: pick(s, ["submitted_at"], null),
        feedback: pick(s, ["feedback"], null),
        timing: pick(s, ["submission_timing"], null),
      }))
      .sort(
        (a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0),
      );
  }, [submissionsQuery.data]);

  const playlists = useMemo(() => {
    const raw = playlistsQuery.data || [];
    return raw.map((p) => ({
      id: pick(
        p,
        ["playlist_id", "id"],
        `playlist-${String(p?.title ?? "")}-${String(p?.videos_count ?? p?.count ?? "")}`,
      ),
      title: pick(p, ["title"], "قائمة"),
      videosCount: num(pick(p, ["videos_count", "count"], 0)),
      thumbnail: pick(p, ["thumbnail_url"], null),
    }));
  }, [playlistsQuery.data]);

  // Overview summary values
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

  const totalPaidFromStats = num(pick(stats, ["total_paid"], 0)) || totalPaid;
  const totalRequired = num(pick(stats, ["total_required"], 0));
  const remainingBalance = num(pick(stats, ["remaining_balance"], 0));
  const currentSub = currentSubQuery.data;
  const paymentStatus = currentSub
    ? String(currentSub.status || "").toLowerCase() === "paid"
      ? "paid"
      : "unpaid"
    : getPaymentStatus(stats, currentMonthStr);

  // ============================================
  // RENDER TABS CONTENT
  // ============================================

  const renderOverview = () => (
    <div className="space-y-3 sm:space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          label="نسبة الحضور"
          value={`${attendancePct}%`}
          subtitle={`${presentDays} / ${totalDays} يوم`}
          icon={Calendar}
          color="green"
        />
        <StatCard
          label="مجموع الدرجات"
          value={
            examsTotals.max > 0
              ? `${examsTotals.degree} / ${examsTotals.max}`
              : "-"
          }
          subtitle={
            examsTotals.max > 0
              ? `${examsTotals.pct}% • ${examsTotals.count} امتحان`
              : "لا توجد درجات"
          }
          icon={Award}
          color="purple"
        />
        <StatCard
          label="إجمالي المدفوع"
          value={`${totalPaidFromStats} ج`}
          subtitle={`المطلوب: ${totalRequired} ج`}
          icon={Wallet}
          color="amber"
        />
        <StatCard
          label="حالة الاشتراك"
          value={
            paymentStatus === "paid"
              ? "مدفوع"
              : paymentStatus === "unpaid"
                ? "غير مدفوع"
                : "غير محدد"
          }
          subtitle={
            remainingBalance > 0
              ? `المتبقي: ${remainingBalance} ج`
              : "لا يوجد متأخرات"
          }
          icon={TrendingUp}
          color={paymentStatus === "paid" ? "green" : "red"}
        />
      </div>

      {/* Basic Info */}
      <div className="bg-slate-50 rounded-2xl p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <User size={14} className="text-primary" />
          البيانات الأساسية
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Barcode size={13} className="text-gray-400 shrink-0" />
            <span className="text-gray-500">الباركود:</span>
            <span className="font-mono text-gray-800">{barcode || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-gray-400 shrink-0" />
            <span className="text-gray-500">الهاتف:</span>
            <span dir="ltr" className="text-gray-800">
              {phone || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-gray-400 shrink-0" />
            <span className="text-gray-500">ولي الأمر:</span>
            <span dir="ltr" className="text-gray-800">
              {parent_phone || "-"}
            </span>
          </div>
          {parent_token && (
            <div className="flex items-center gap-2">
              <Hash size={13} className="text-gray-400 shrink-0" />
              <span className="text-gray-500">كود ولي الأمر:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded text-[10px] border">
                {parent_token}
              </span>
            </div>
          )}
        </div>
        {notes && (
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-start gap-2 text-xs sm:text-sm">
            <FileText size={13} className="text-gray-400 shrink-0 mt-0.5" />
            <span className="text-gray-500 shrink-0">ملاحظات:</span>
            <span className="text-gray-700">{notes}</span>
          </div>
        )}
      </div>

      {/* Consecutive Absences Alert */}
      {consecutiveAbsencesQuery.data &&
        num(consecutiveAbsencesQuery.data?.consecutive_absences) >= 3 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-red-800">
              <p className="font-bold">تحذير: غياب متتالي</p>
              <p className="text-xs mt-0.5">
                هذا الطالب لديه{" "}
                {consecutiveAbsencesQuery.data.consecutive_absences} غيابات
                متتالية
                {consecutiveAbsencesQuery.data?.from_date &&
                  ` من ${formatDate(consecutiveAbsencesQuery.data.from_date)}`}
              </p>
            </div>
          </div>
        )}

      {/* Playlists Count */}
      {playlists.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <Video size={14} />
            قوائم التشغيل
          </h3>
          <div className="flex flex-wrap gap-2">
            {playlists.slice(0, 5).map((pl) => (
              <span
                key={pl.id}
                className="inline-flex items-center gap-1 bg-white text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-blue-100"
              >
                {pl.title}
                <span className="text-blue-400 text-[10px]">
                  ({pl.videosCount})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-3">
      {attendanceQuery.isLoading ? (
        <SectionSkeleton rows={5} />
      ) : attendanceRows.length === 0 ? (
        <EmptyState icon={Calendar} message="لا يوجد سجل حضور لهذا الطالب" />
      ) : (
        <div className="max-h-[55vh] overflow-y-auto custom-scrollbar rounded-xl border border-slate-200">
          <table className="w-full text-right">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600">
                  التاريخ
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600">
                  الحالة
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600 hidden sm:table-cell">
                  الوقت
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600 hidden md:table-cell">
                  المجموعة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-xs text-slate-700 whitespace-nowrap">
                    {formatDate(row.date)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      {row.present ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 size={11} /> حاضر
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded-lg">
                          <XCircle size={11} /> غائب
                        </span>
                      )}
                      {row.isMakeup && (
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          تعويضي
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-xs text-slate-500 hidden sm:table-cell">
                    {formatTime(row.time) || "-"}
                  </td>
                  <td className="py-2 px-3 text-xs text-slate-500 hidden md:table-cell">
                    {row.group || group_name || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderExams = () => (
    <div className="space-y-3">
      {paperExamsQuery.isLoading || onlineExamsQuery.isLoading ? (
        <SectionSkeleton rows={5} />
      ) : exams.length === 0 ? (
        <EmptyState icon={BookOpen} message="لا توجد امتحانات مسجلة" />
      ) : (
        <div className="max-h-[55vh] overflow-y-auto custom-scrollbar rounded-xl border border-slate-200">
          <table className="w-full text-right">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600">
                  الامتحان
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600">
                  النوع
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600 hidden sm:table-cell">
                  التاريخ
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600">
                  الدرجة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <tr
                  key={`${exam.online ? "on" : "pa"}-${exam.id}`}
                  className="hover:bg-slate-50"
                >
                  <td className="py-2 px-3 text-xs text-slate-700 max-w-37.5 truncate">
                    {exam.label}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                        exam.online
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {exam.online ? "أونلاين" : "ورقي"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-slate-500 hidden sm:table-cell whitespace-nowrap">
                    {formatDate(exam.date)}
                  </td>
                  <td className="py-2 px-3">
                    <ScoreBadge degree={exam.degree} max={exam.max} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-3">
      {/* Summary */}
      {currentSub && (
        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-blue-600">الاشتراك الحالي</p>
            <p className="text-sm font-bold text-blue-900">
              {currentSub.month || currentMonthStr}
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-blue-600">المطلوب</p>
            <p className="text-sm font-bold text-blue-900">
              {num(currentSub.required_amount)} ج
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-blue-600">المدفوع</p>
            <p className="text-sm font-bold text-green-600">
              {num(currentSub.paid_amount)} ج
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              String(currentSub.status || "").toLowerCase() === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {String(currentSub.status || "").toLowerCase() === "paid"
              ? "مدفوع"
              : "غير مدفوع"}
          </span>
        </div>
      )}

      {/* History */}
      {paymentsQuery.isLoading ? (
        <SectionSkeleton rows={4} />
      ) : payments.length === 0 ? (
        <EmptyState icon={Wallet} message="لا يوجد سجل مدفوعات" />
      ) : (
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar rounded-xl border border-slate-200">
          <table className="w-full text-right">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600">
                  التاريخ
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600">
                  المبلغ
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600">
                  النوع
                </th>
                <th className="py-2 px-3 text-[11px] font-semibold text-slate-600 hidden sm:table-cell">
                  ملاحظات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-xs text-slate-700 whitespace-nowrap">
                    {formatDate(p.date)}
                  </td>
                  <td className="py-2 px-3 text-xs font-bold text-green-600 whitespace-nowrap">
                    {p.amount} ج
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                        p.mode === "custom"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {p.mode === "custom" ? "مخصص" : "عادي"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-slate-500 hidden sm:table-cell max-w-37.5 truncate">
                    {p.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Total */}
      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-800">
          إجمالي المدفوعات
        </span>
        <span className="text-lg font-bold text-amber-900">{totalPaid} ج</span>
      </div>
    </div>
  );

  const renderHomework = () => (
    <div className="space-y-4">
      {/* Assignments */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <ClipboardList size={14} className="text-primary" />
          الواجبات ({assignments.length})
        </h3>
        {assignmentsQuery.isLoading ? (
          <SectionSkeleton rows={3} />
        ) : assignments.length === 0 ? (
          <EmptyState icon={ClipboardList} message="لا توجد واجبات" />
        ) : (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm text-gray-800 truncate">
                      {a.title}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      آخر موعد: {formatDateTime(a.deadline)}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    {a.status === "graded" ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          تم التصحيح
                        </span>
                        {a.score !== null && (
                          <ScoreBadge degree={a.score} max={a.fullMark} />
                        )}
                      </div>
                    ) : a.status === "submitted" ? (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        تم التسليم
                      </span>
                    ) : a.status === "overdue" ? (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        متأخر
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        معلق
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submissions */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <Download size={14} className="text-primary" />
          التسليمات ({submissions.length})
        </h3>
        {submissionsQuery.isLoading ? (
          <SectionSkeleton rows={3} />
        ) : submissions.length === 0 ? (
          <EmptyState icon={FileText} message="لا توجد تسليمات" />
        ) : (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
            {submissions.map((s) => (
              <div
                key={s.id}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm text-gray-800 truncate">
                      {s.assignmentTitle}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{formatDateTime(s.submittedAt)}</span>
                      {s.timing === "late" && (
                        <span className="text-red-500">(متأخر)</span>
                      )}
                      {s.timing === "on_time" && (
                        <span className="text-green-600">(في الوقت)</span>
                      )}
                    </p>
                  </div>
                  {s.score !== null && s.score !== undefined && (
                    <ScoreBadge degree={s.score} max={s.fullMark} />
                  )}
                </div>
                {s.feedback && (
                  <p className="text-[10px] text-gray-500 mt-1.5 p-1.5 bg-slate-50 rounded">
                    {s.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "attendance":
        return renderAttendance();
      case "exams":
        return renderExams();
      case "payments":
        return renderPayments();
      case "homework":
        return renderHomework();
      default:
        return null;
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================== HEADER ==================== */}
        <div className="shrink-0 p-3 sm:p-5 border-b border-slate-200 bg-linear-to-l from-primary/5 to-transparent">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg sm:text-xl overflow-hidden border-2 border-primary/20 shrink-0">
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
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">
                  {full_name || "طالب"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 truncate">
                  {grade_name || "-"} • {group_name || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  printBarcodeWindow({ full_name, barcode }, "سنتر بشتة")
                }
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="طباعة الباركود"
              >
                <Printer size={15} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Barcode preview */}
          <div className="mt-3 flex items-center justify-center bg-slate-50 rounded-xl py-2 px-3">
            <svg ref={svgRef}></svg>
          </div>
        </div>

        {/* ==================== TABS ==================== */}
        <div className="shrink-0 border-b border-slate-200 overflow-x-auto custom-scrollbar">
          <div className="flex gap-1 px-2 sm:px-4 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================== CONTENT ==================== */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentCard;
