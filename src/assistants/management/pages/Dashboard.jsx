/* eslint-disable no-unused-vars */
import {
  CalendarCheck2,
  DownloadCloud,
  TriangleAlert,
  UsersRound,
  UserX,
  TrendingUp,
  Activity,
  Clock,
  Award,
  Zap,
  CheckCircle,
  Wallet,
  GraduationCap,
  Users,
  BookOpen,
  Video,
  ListVideo,
  CreditCard,
  DollarSign,
  Info,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  fetchAssistantDashboard,
  fetchActivityLog,
  fetchAttendanceDashboard,
} from "../../../api/assistant/actions";
import { useApiQuery, useInvalidate } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import getUser from "../../../utils/getUser";
import Pagination from "../../../components/Pagination";

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const COLORS = [
  "#1a5d1a",
  "#b8860b",
  "#10b981",
  "#f59e0b",
  "#2c5282",
  "#991b1b",
];

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
  if (action?.includes("create"))
    return { bg: "bg-green-100", fg: "text-green-600" };
  if (action?.includes("update"))
    return { bg: "bg-blue-100", fg: "text-blue-600" };
  if (action?.includes("delete") || action?.includes("lock"))
    return { bg: "bg-red-100", fg: "text-red-600" };
  if (action?.includes("start"))
    return { bg: "bg-primary/10", fg: "text-primary" };
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
  if (role === "assistant") return "مساعد";
  if (role === "teacher" || role === "admin") return "مدرس";
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
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [filterEntity, setFilterEntity] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);

  // Selected Activity for Detail Modal
  const [selectedActivity, setSelectedActivity] = useState(null);

  /* fetch مرة واحدة ويتخزن في الكاش — التحديث بيحصل بس لما الداتا تتغير */
  const dashboardQuery = useApiQuery(
    qk.assistant.dashboard,
    fetchAssistantDashboard,
    {
      errorMessage: "حدث خطأ في تحميل لوحة التحكم",
    },
  );

  const activityQuery = useApiQuery(
    qk.assistant.activityLog(filterEntity, filterDate, page),
    () => fetchActivityLog(filterEntity, filterDate, page),
    { errorMessage: "حدث خطأ في تحميل سجل النشاط" },
  );

  /* بيانات الحضور الحقيقية للأسبوع */
  const attendanceQuery = useApiQuery(
    qk.attendance.dashboard,
    fetchAttendanceDashboard,
    {
      showErrorToast: false,
    },
  );

  const invalidate = useInvalidate();

  const dashboardData = dashboardQuery.data ?? null;
  const activityLog = useMemo(
    () => (Array.isArray(activityQuery.data) ? activityQuery.data : []),
    [activityQuery.data],
  );
  const pagination = activityQuery.pagination;
  const isFetching = dashboardQuery.isFetching || activityQuery.isFetching;

  const refreshAll = () =>
    invalidate(
      qk.assistant.dashboard,
      ["assistant", "activity-log"],
      qk.attendance.dashboard,
    );

  const stats = useMemo(() => {
    if (!dashboardData)
      return {
        students: 0,
        present: 0,
        absent: 0,
        attendanceRate: 0,
        grades: 0,
        groups: 0,
        onlineExams: 0,
        assignments: 0,
        pendingGrading: 0,
        videos: 0,
        playlists: 0,
        totalPaid: 0,
        unpaid: 0,
      };

    const totalStudents = Number(dashboardData.total_students) || 0;
    const present = Number(dashboardData.present_today) || 0;
    const absent = Number(dashboardData.absent_today) || 0;
    const totalAttendance = present + absent;

    return {
      students: totalStudents,
      present: present,
      absent: absent,
      attendanceRate:
        totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0,
      grades: Number(dashboardData.total_grades) || 0,
      groups: Number(dashboardData.total_groups) || 0,
      onlineExams: Number(dashboardData.active_online_exams) || 0,
      assignments: Number(dashboardData.active_assignments) || 0,
      pendingGrading: Number(dashboardData.pending_grading) || 0,
      videos: Number(dashboardData.total_videos) || 0,
      playlists: Number(dashboardData.total_playlists) || 0,
      totalPaid: Number(dashboardData.total_paid_month) || 0,
      unpaid: Number(dashboardData.unpaid_students) || 0,
    };
  }, [dashboardData]);

  /**
   * اتجاه الحضور الأسبوعي — من الـ API فقط.
   */
  const attendanceTrend = useMemo(() => {
    const sources = [attendanceQuery.data, dashboardData];
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
  }, [attendanceQuery.data, dashboardData]);

  const pieData = [
    { name: "حاضر", value: stats.present },
    { name: "غائب", value: stats.absent },
  ];

  const now = new Date();
  const todayLabel = `${now.getDate()} ${ARABIC_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const timeGreeting = greeting();

  const cards = [
    {
      label: "عدد الطلاب",
      value: stats.students,
      Icon: UsersRound,
      gradient: "from-primary to-green-700",
      iconBg: "bg-green-100",
      iconColor: "text-primary",
      trend: `${stats.groups} مجموعة`,
      trendUp: true,
      onClick: () => navigate("/assistant/management/students"),
    },
    {
      label: "الحاضرون اليوم",
      value: stats.present,
      Icon: CalendarCheck2,
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: `${stats.attendanceRate}% نسبة الحضور`,
      trendUp: stats.attendanceRate >= 50,
      onClick: () => navigate("/assistant/management/attendance"),
    },
    {
      label: "الغائبون اليوم",
      value: stats.absent,
      Icon: UserX,
      gradient: "from-red-500 to-rose-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      trend: stats.absent > 0 ? "تنبيه غياب" : "لا يوجد غياب",
      trendUp: stats.absent === 0,
      onClick: () => navigate("/assistant/management/attendance"),
    },
    {
      label: "المدفوعات هذا الشهر",
      value: `${(Number(stats.totalPaid) || 0).toLocaleString()} ج.م`,
      Icon: DollarSign,
      gradient: "from-amber-500 to-yellow-600",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      trend: stats.unpaid > 0 ? `${stats.unpaid} غير مسدد` : "مسدد بالكامل",
      trendUp: stats.unpaid === 0,
      onClick: () => navigate("/assistant/management/payments"),
    },
  ];

  const extraCards = [
    {
      label: "الصفوف",
      value: stats.grades,
      Icon: GraduationCap,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/assistant/management/grades"),
    },
    {
      label: "المجموعات",
      value: stats.groups,
      Icon: Users,
      gradient: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/assistant/management/groups"),
    },
    {
      label: "امتحانات نشطة",
      value: stats.onlineExams,
      Icon: BookOpen,
      gradient: "from-cyan-500 to-teal-600",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      onClick: () => navigate("/assistant/management/exams"),
    },
    {
      label: "فيديوهات",
      value: stats.videos,
      Icon: Video,
      gradient: "from-red-500 to-rose-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      onClick: () => navigate("/assistant/online/videos"),
    },
  ];

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
                <span>
                  {timeGreeting}، م/ {user?.full_name || "المساعد"}
                </span>
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
              onClick={() => {
                setPage(1);
                refreshAll();
              }}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60 text-gray-700"
            >
              <Zap size={16} className={`text-primary ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "جارٍ التحديث..." : "تحديث"}</span>
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
                <p className="text-sm text-gray-500 font-medium mb-1">
                  {card.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {dashboardQuery.isLoading ? (
                    <span className="inline-block h-8 w-20 rounded bg-gray-100 animate-pulse" />
                  ) : (
                    card.value
                  )}
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
                  {dashboardQuery.isLoading ? (
                    <span className="inline-block h-6 w-12 rounded bg-gray-100 animate-pulse" />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
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
              <p className="text-xs text-gray-400">آخر 7 أيام مسجلة بالسنتر</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-xs text-gray-600 font-medium">عدد الحضور</span>
            </div>
          </div>
          {attendanceQuery.isLoading ? (
            <div className="h-60 rounded-2xl bg-gray-100 animate-pulse" />
          ) : attendanceTrend.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-20">
              لا توجد بيانات حضور كافية
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a5d1a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1a5d1a" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  allowDecimals={false}
                />
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
                  fill="url(#colorValue)"
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
          {stats.present + stats.absent === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">
              لم يتم تسجيل حضور اليوم بعد
            </p>
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
                      <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
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
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600">{item.name}:</span>
                    <span className="text-xs font-bold text-gray-800">
                      {item.value}
                    </span>
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
            setPage(1);
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
            setPage(1);
          }}
          className="border-2 border-gray-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700 font-medium"
        />
        {(filterEntity || filterDate) && (
          <button
            onClick={() => {
              setFilterEntity("");
              setFilterDate("");
              setPage(1);
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

        {activityQuery.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : activityLog.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            لا توجد نشاطات مسجلة بعد
          </p>
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
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={20}
              onChange={setPage}
            />
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
