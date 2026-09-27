/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersRound,
  UserX,
  Users,
  CalendarCheck2,
  TrendingUp,
  Activity,
  Clock,
  Zap,
  Wallet,
  GraduationCap,
  BookOpen,
  Video,
  ListVideo,
  CreditCard,
  DollarSign,
  UserCog,
  AlertTriangle,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  Info,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchTeacherDashboard,
  fetchActivityLog,
  fetchAttendanceDashboard,
} from "../api/teacher/actions";
import getUser from "../utils/getUser";
import { motion, AnimatePresence } from "framer-motion";

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const PIE_COLORS = ["#1a5d1a", "#dc2626", "#f59e0b", "#2c5282", "#991b1b"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "صباح الخير";
  return "مساء الخير";
}

function getActionIcon(action) {
  const actionMap = {
    create_student: UsersRound,
    update_student: UsersRound,
    delete_student: UserX,
    create_payment: Wallet,
    update_payment: Wallet,
    delete_payment: Wallet,
    create_subscription: CreditCard,
    update_subscription_status: CreditCard,
    delete_subscription: CreditCard,
    start_session: CalendarCheck2,
    lock_session: CalendarCheck2,
    create_grade: GraduationCap,
    update_grade: GraduationCap,
    delete_grade: GraduationCap,
    create_group: Users,
    update_group: Users,
    delete_group: Users,
    create_online_exam: BookOpen,
    update_online_exam: BookOpen,
    delete_online_exam: BookOpen,
    create_video: Video,
    update_video: Video,
    delete_video: Video,
    create_playlist: ListVideo,
    update_playlist: ListVideo,
    delete_playlist: ListVideo,
    login: Activity,
    logout: Activity,
  };
  return actionMap[action] || Activity;
}

function getActionColor(action) {
  if (action?.includes("create")) return { bg: "bg-green-100", fg: "text-green-600" };
  if (action?.includes("update")) return { bg: "bg-blue-100", fg: "text-blue-600" };
  if (action?.includes("delete") || action?.includes("lock")) return { bg: "bg-red-100", fg: "text-red-600" };
  if (action?.includes("start")) return { bg: "bg-primary/10", fg: "text-primary" };
  return { bg: "bg-gray-100", fg: "text-gray-600" };
}

function translateAction(action) {
  const actionMap = {
    create_student: "إنشاء طالب",
    update_student: "تعديل طالب",
    delete_student: "حذف طالب",
    create_payment: "تسجيل دفعة",
    update_payment: "تعديل دفعة",
    delete_payment: "حذف دفعة",
    create_subscription: "إنشاء اشتراك",
    update_subscription_status: "تعديل حالة اشتراك",
    delete_subscription: "حذف اشتراك",
    start_session: "بدء جلسة حضور",
    lock_session: "قفل جلسة حضور",
    create_grade: "إنشاء صف",
    update_grade: "تعديل صف",
    delete_grade: "حذف صف",
    create_group: "إنشاء مجموعة",
    update_group: "تعديل مجموعة",
    delete_group: "حذف مجموعة",
    create_online_exam: "إنشاء امتحان أونلاين",
    update_online_exam: "تعديل امتحان أونلاين",
    delete_online_exam: "حذف امتحان أونلاين",
    create_video: "إضافة فيديو",
    update_video: "تعديل فيديو",
    delete_video: "حذف فيديو",
    create_playlist: "إنشاء قائمة تشغيل",
    update_playlist: "تعديل قائمة تشغيل",
    delete_playlist: "حذف قائمة تشغيل",
    login: "تسجيل دخول",
    logout: "تسجيل خروج",
  };
  return actionMap[action] || action || "نشاط";
}

function translateRole(role) {
  if (role === "teacher" || role === "admin") return "مدرس";
  if (role === "assistant") return "مساعد";
  if (role === "super_admin") return "مشرف عام";
  return role || "مستخدم";
}

const entityTypes = [
  { value: "", label: "الكل" },
  { value: "student", label: "طلاب" },
  { value: "payment", label: "مدفوعات" },
  { value: "subscription", label: "اشتراكات" },
  { value: "attendance_session", label: "جلسات حضور" },
  { value: "grade", label: "صفوف" },
  { value: "group", label: "مجموعات" },
  { value: "online_exam", label: "امتحانات أونلاين" },
  { value: "video", label: "فيديوهات" },
  { value: "playlist", label: "قوائم تشغيل" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
};

const Dashboard = () => {
  const user = getUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [activityPagination, setActivityPagination] = useState(null);

  const [filterEntity, setFilterEntity] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [activityPage, setActivityPage] = useState(1);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Selected Activity for Detail Modal
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Initial data load: runs once on mount
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, actRes, attRes] = await Promise.allSettled([
        fetchTeacherDashboard(),
        fetchActivityLog("", "", 1),
        fetchAttendanceDashboard(),
      ]);

      let recentFallback = [];

      if (dashRes.status === "fulfilled" && dashRes.value?.success && dashRes.value.data) {
        setDashboardData(dashRes.value.data);
        recentFallback = dashRes.value.data.recent_activities || [];
      } else if (dashRes.status === "rejected" || !dashRes.value?.success) {
        setError(dashRes.value?.error || "فشل تحميل بيانات لوحة التحكم");
      }

      if (attRes.status === "fulfilled" && attRes.value?.success && attRes.value.data) {
        setAttendanceData(attRes.value.data);
      }

      if (actRes.status === "fulfilled" && actRes.value?.success && Array.isArray(actRes.value.data)) {
        setActivityLog(actRes.value.data);
        setActivityPagination(actRes.value.pagination || null);
      } else if (recentFallback.length > 0) {
        setActivityLog(recentFallback);
      }
    } catch (err) {
      console.error("Dashboard init error:", err);
      setError("فشل تحميل بيانات لوحة التحكم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Separate effect for filter or page changes (skips initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let isCurrent = true;
    setActivitiesLoading(true);

    fetchActivityLog(filterEntity, filterDate, activityPage)
      .then((res) => {
        if (!isCurrent) return;
        if (res?.success && Array.isArray(res.data)) {
          setActivityLog(res.data);
          setActivityPagination(res.pagination || null);
        }
      })
      .catch((err) => {
        console.error("Filter activities error:", err);
      })
      .finally(() => {
        if (isCurrent) setActivitiesLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [filterEntity, filterDate, activityPage]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [dashRes, actRes, attRes] = await Promise.allSettled([
        fetchTeacherDashboard(),
        fetchActivityLog(filterEntity, filterDate, activityPage),
        fetchAttendanceDashboard(),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value?.success && dashRes.value.data) {
        setDashboardData(dashRes.value.data);
      }

      if (attRes.status === "fulfilled" && attRes.value?.success && attRes.value.data) {
        setAttendanceData(attRes.value.data);
      }

      if (actRes.status === "fulfilled" && actRes.value?.success && Array.isArray(actRes.value.data)) {
        setActivityLog(actRes.value.data);
        setActivityPagination(actRes.value.pagination || null);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Safe numeric helper
  const toNumber = useCallback((val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }, []);

  // Stats extracted from dashboardData
  const overview = dashboardData?.overview || {};
  const attendanceToday = dashboardData?.attendance_today || {};
  const examsSummary = dashboardData?.exams || {};
  const assignmentsSummary = dashboardData?.assignments || {};
  const paymentsMonth = dashboardData?.payments_month || {};

  const totalStudents = toNumber(overview.total_students);
  const presentCount = toNumber(attendanceToday.present_count);
  const absentCount = toNumber(attendanceToday.absent_count);
  const totalAttended = presentCount + absentCount;
  const attendanceRate = totalAttended > 0 ? Math.round((presentCount / totalAttended) * 100) : 0;
  const totalPaid = toNumber(paymentsMonth.total_paid);
  const unpaidStudents = toNumber(paymentsMonth.unpaid_students || 0);

  // Main 4 Stat Cards
  const cards = [
    {
      label: "عدد الطلاب",
      value: totalStudents,
      Icon: UsersRound,
      gradient: "from-primary to-green-700",
      iconBg: "bg-green-100",
      iconColor: "text-primary",
      trend: `${overview.total_groups || 0} مجموعة`,
      trendUp: true,
      onClick: () => navigate("/teacher/students"),
    },
    {
      label: "الحاضرون اليوم",
      value: presentCount,
      Icon: CalendarCheck2,
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: `${attendanceRate}% نسبة الحضور`,
      trendUp: attendanceRate >= 50,
      onClick: () => navigate("/teacher/attendance"),
    },
    {
      label: "الغائبون اليوم",
      value: absentCount,
      Icon: UserX,
      gradient: "from-red-500 to-rose-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      trend: absentCount > 0 ? "تنبيه غياب" : "لا يوجد غياب",
      trendUp: absentCount === 0,
      onClick: () => navigate("/teacher/attendance"),
    },
    {
      label: "المدفوعات هذا الشهر",
      value: `${totalPaid.toLocaleString()} ج.م`,
      Icon: DollarSign,
      gradient: "from-amber-500 to-yellow-600",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      trend: unpaidStudents > 0 ? `${unpaidStudents} غير مسدد` : "مسدد بالكامل",
      trendUp: unpaidStudents === 0,
      onClick: () => navigate("/teacher/payments"),
    },
  ];

  // Extra Quick Cards
  const extraCards = [
    {
      label: "الصفوف",
      value: toNumber(overview.total_grades),
      Icon: GraduationCap,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/teacher/courses"),
    },
    {
      label: "المجموعات",
      value: toNumber(overview.total_groups),
      Icon: Users,
      gradient: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/teacher/students"),
    },
    {
      label: "المساعدين",
      value: toNumber(overview.total_assistants),
      Icon: UserCog,
      gradient: "from-teal-500 to-cyan-600",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      onClick: () => navigate("/teacher/assistants"),
    },
    {
      label: "الفيديوهات",
      value: toNumber(overview.total_videos),
      Icon: Video,
      gradient: "from-red-500 to-rose-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      onClick: () => navigate("/teacher/courses"),
    },
  ];

  // Attendance Trend Area Chart Data
  const attendanceTrendData = useMemo(() => {
    const sources = [attendanceData, dashboardData];
    const arrayKeys = [
      "weekly_attendance",
      "weekly",
      "last_7_days",
      "last7days",
      "daily_attendance",
      "attendance_trend",
      "trend",
      "days",
      "week",
      "attendance_by_day",
      "daily",
    ];

    let raw = null;
    for (const source of sources) {
      if (!source) continue;
      if (Array.isArray(source)) {
        raw = source;
        break;
      }
      for (const key of arrayKeys) {
        if (Array.isArray(source[key]) && source[key].length) {
          raw = source[key];
          break;
        }
      }
      if (raw) break;
    }
    if (!raw) return [];

    const pickValue = (item) => {
      const keys = [
        "present",
        "present_count",
        "presents",
        "attended",
        "attendance_count",
        "count",
        "total_present",
        "total",
        "value",
        "students_present",
      ];
      for (const key of keys) {
        const v = Number(item?.[key]);
        if (Number.isFinite(v)) return v;
      }
      return 0;
    };
    const pickLabel = (item) => {
      const raw =
        item?.day_name ??
        item?.weekday ??
        item?.day ??
        item?.name ??
        item?.label ??
        item?.attendance_date ??
        item?.session_date ??
        item?.date;
      if (!raw) return "";
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("ar-EG", {
          weekday: "short",
          day: "numeric",
        });
      }
      return String(raw);
    };

    return raw
      .slice(-7)
      .map((item) => ({ name: pickLabel(item), value: pickValue(item) }));
  }, [attendanceData, dashboardData]);

  // Attendance Pie Data
  const pieData = [
    { name: "حاضر", value: presentCount },
    { name: "غائب", value: absentCount },
    ...(toNumber(attendanceToday.not_marked_count) > 0
      ? [{ name: "غير مسجل", value: toNumber(attendanceToday.not_marked_count) }]
      : []),
  ];

  const now = new Date();
  const todayLabel = `${now.getDate()} ${ARABIC_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const timeGreeting = greeting();

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-md max-w-sm text-center">
          <AlertTriangle size={48} className="text-red-500" />
          <p className="text-gray-700 font-bold text-sm">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-10"
      dir="rtl"
    >
      {/* ==================== HEADER ==================== */}
      <motion.header
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-2 mt-0.5">
                <span>{timeGreeting}، أ/ {user?.full_name || "المدرس"}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>{todayLabel}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <Activity size={14} /> نشط
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60 text-gray-700"
            >
              <Zap size={16} className={`text-primary ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "جارٍ التحديث..." : "تحديث"}</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ==================== STATS CARDS - MAIN ==================== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
      >
        {cards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={card.onClick}
            className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 p-5 group cursor-pointer"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${card.gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
                  <card.Icon className={`${card.iconColor} w-5 h-5`} />
                </div>
                {card.trend && (
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      card.trendUp
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {card.trend}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {card.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ==================== STATS CARDS - EXTRA ==================== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
      >
        {extraCards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={card.onClick}
            className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 group cursor-pointer"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${card.gradient} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}
            />
            <div className="relative flex items-center gap-3">
              <div className={`p-2.5 ${card.iconBg} rounded-xl shrink-0`}>
                <card.Icon className={`${card.iconColor} w-5 h-5`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">{card.label}</p>
                <p className="text-xl font-bold text-gray-800">
                  {card.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ==================== EXAMS & HOMEWORK HIGHLIGHTS ==================== */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-gray-800">متابعة الامتحانات والواجبات</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teacher/degrees")}
              className="text-xs font-medium text-primary hover:underline"
            >
              الامتحانات &larr;
            </button>
            <button
              onClick={() => navigate("/teacher/homework")}
              className="text-xs font-medium text-primary hover:underline"
            >
              الواجبات &larr;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div
            onClick={() => navigate("/teacher/degrees")}
            className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-center cursor-pointer hover:bg-blue-50 transition"
          >
            <span className="text-xs text-gray-600 block mb-0.5 font-medium">امتحانات ورقية</span>
            <span className="text-lg font-bold text-blue-700">
              {toNumber(examsSummary.upcoming_paper_exams)}
            </span>
          </div>

          <div
            onClick={() => navigate("/teacher/degrees")}
            className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-center cursor-pointer hover:bg-emerald-50 transition"
          >
            <span className="text-xs text-gray-600 block mb-0.5 font-medium">امتحانات إلكترونية</span>
            <span className="text-lg font-bold text-emerald-700">
              {toNumber(examsSummary.active_online_exams)}
            </span>
          </div>

          <div
            onClick={() => navigate("/teacher/homework")}
            className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-center cursor-pointer hover:bg-amber-50 transition"
          >
            <span className="text-xs text-gray-600 block mb-0.5 font-medium">بانتظار التصحيح</span>
            <span className="text-lg font-bold text-amber-700">
              {toNumber(assignmentsSummary.pending_grading)}
            </span>
          </div>

          <div
            onClick={() => navigate("/teacher/payments")}
            className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 text-center cursor-pointer hover:bg-purple-50 transition"
          >
            <span className="text-xs text-gray-600 block mb-0.5 font-medium">نسبة تحصيل الشهر</span>
            <span className="text-lg font-bold text-purple-700" dir="ltr">
              {toNumber(paymentsMonth.paid_percentage)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* ==================== CHARTS SECTION ==================== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
      >
        {/* Attendance Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-md p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                اتجاه الحضور الأسبوعي
              </h3>
              <p className="text-xs text-gray-400">معدل حضور الطلاب خلال الأسبوع</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-xs text-gray-600 font-medium">عدد الحضور</span>
            </div>
          </div>

          {attendanceTrendData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-20">لا توجد بيانات حضور كافية</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendanceTrendData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a5d1a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1a5d1a" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1a5d1a"
                  strokeWidth={3}
                  fill="url(#colorAttendance)"
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart: Today's Attendance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <CalendarCheck2 size={20} className="text-primary" />
                حضور اليوم
              </h3>
              <p className="text-xs text-gray-400">توزيع الحضور والغياب اليوم</p>
            </div>
          </div>

          {presentCount + absentCount === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">لم يتم تسجيل حضور اليوم بعد</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600">{item.name}:</span>
                    <span className="text-xs font-bold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* ==================== FILTERS FOR ACTIVITY LOG ==================== */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex flex-wrap items-center gap-3 mb-4"
      >
        <select
          value={filterEntity}
          onChange={(e) => {
            setFilterEntity(e.target.value);
            setActivityPage(1);
          }}
          className="border-2 border-gray-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700 font-medium"
        >
          {entityTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => {
            setFilterDate(e.target.value);
            setActivityPage(1);
          }}
          className="border-2 border-gray-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700 font-medium"
        />

        {(filterEntity || filterDate) && (
          <button
            onClick={() => {
              setFilterEntity("");
              setFilterDate("");
              setActivityPage(1);
            }}
            className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            إلغاء الفلترة
          </button>
        )}
      </motion.div>

      {/* ==================== ACTIVITY LOG TABLE ==================== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              سجل النشاطات والعمليات
            </h3>
            <p className="text-xs text-gray-400">
              اضغط على أي عملية لعرض تفاصيلها الكاملة
            </p>
          </div>
          <span className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium">
            {activityLog.length} عملية
          </span>
        </div>

        {activitiesLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : activityLog.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">لا توجد نشاطات مسجلة بعد</p>
        ) : (
          <div className="space-y-2.5">
            {activityLog.slice(0, 10).map((log, i) => {
              const Icon = getActionIcon(log.action);
              const colors = getActionColor(log.action);
              const translated = translateAction(log.action);
              const userDisplayName = log.user_name || "مستخدم";
              const desc = log.description ? ` (${log.description})` : "";

              return (
                <motion.div
                  key={log.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedActivity(log)}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 group gap-3 cursor-pointer"
                  title="اضغط لعرض التفاصيل"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${colors.bg} group-hover:scale-105 transition-transform duration-200 shrink-0`}
                    >
                      <Icon size={16} className={colors.fg} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-primary transition-colors truncate block">
                        <b className="text-gray-900 font-bold ml-1">{userDisplayName}</b> — {translated}
                        {desc}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </span>
                    <Info size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Activity Log Pagination */}
        {activityPagination && activityPagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              صفحة {activityPagination.page} من {activityPagination.totalPages} • إجمالي {activityPagination.total} نشاط
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                disabled={activityPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition"
              >
                السابق
              </button>
              <span className="text-xs sm:text-sm text-gray-600 font-bold">
                {activityPage}
              </span>
              <button
                onClick={() =>
                  setActivityPage((p) => Math.min(activityPagination.totalPages, p + 1))
                }
                disabled={activityPage === activityPagination.totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ==================== ACTIVITY DETAIL DIALOG ==================== */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Activity size={18} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                    تفاصيل العملية
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 text-right">
                {/* Action Badge */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  {(() => {
                    const Icon = getActionIcon(selectedActivity.action);
                    const colors = getActionColor(selectedActivity.action);
                    return (
                      <div className={`p-2.5 rounded-lg ${colors.bg} shrink-0`}>
                        <Icon size={18} className={colors.fg} />
                      </div>
                    );
                  })()}
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">نوع العملية</span>
                    <span className="text-sm font-bold text-gray-800">
                      {translateAction(selectedActivity.action)}
                    </span>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">المنفّذ:</span>
                    <span className="text-gray-900 font-bold">
                      {selectedActivity.user_name || "مستخدم غير محدد"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">صفة المستخدم:</span>
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md font-semibold text-xs">
                      {translateRole(selectedActivity.user_role)}
                    </span>
                  </div>

                  {selectedActivity.entity_type && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">نوع العنصر:</span>
                      <span className="text-gray-800 font-medium">
                        {selectedActivity.entity_type}
                        {selectedActivity.entity_id ? ` (#${selectedActivity.entity_id})` : ""}
                      </span>
                    </div>
                  )}

                  {selectedActivity.description && (
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">الوصف:</span>
                      <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg text-xs leading-relaxed">
                        {selectedActivity.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500 font-medium">التاريخ والوقت:</span>
                    <span className="text-gray-700 font-medium" dir="ltr">
                      {formatDate(selectedActivity.created_at)}
                    </span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Dashboard;