import React, { useEffect, useState, useCallback, useMemo } from "react";
import Accent from "../assets/Accent.svg";
import {
  Users,
  UserCheck,
  GraduationCap,
  Wallet,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  CalendarCheck2,
  AlertTriangle,
  FileCheck2,
  BookOpen,
  Clock,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  fetchDashboardStats,
  fetchAllStudents,
  fetchAttendanceOverview,
  fetchStudentDetails,
  fetchTeacherDashboard,
  fetchCourses,
  fetchAllExams,
} from "../api/teacher/actions";
import getUser from "../utils/getUser";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [teacherDashboard, setTeacherDashboard] = useState(null);
  const [courses, setCourses] = useState(null);
  const [exams, setExams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const user = getUser();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, attendanceRes, dashboardRes, coursesRes, examsRes] =
        await Promise.all([
          fetchDashboardStats(),
          fetchAttendanceOverview(),
          fetchTeacherDashboard(),
          fetchCourses(),
          fetchAllExams(),
        ]);

      if (statsRes.success) setStats(statsRes.data);
      if (attendanceRes.success) setAttendanceOverview(attendanceRes.data);
      if (dashboardRes.success) setTeacherDashboard(dashboardRes.data);
      if (coursesRes.success) setCourses(coursesRes.data);
      if (examsRes.success) setExams(examsRes.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    const result = await fetchAllStudents(page, "");
    if (result.success) {
      setStudents(result.data || []);
      setTotalStudents(result.pagination?.total || result.data.length);
      setTotalPages(result.pagination?.totalPages || 1);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadStudents()]);
    setRefreshing(false);
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setStudentLoading(true);
    const result = await fetchStudentDetails(student.id);
    if (result.success) {
      setStudentStats(result.data.stats);
    }
    setStudentLoading(false);
  };

  const toNumber = useCallback((value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }, []);

  const attendanceStats = stats?.attendance || {};
  const firstMonth = Array.isArray(attendanceStats)
    ? attendanceStats[0] || {}
    : attendanceStats;
  const paymentStats = stats?.payments || {};
  const gradesStats = stats?.grades || [];
  const consecutiveAbsences = attendanceOverview?.consecutiveAbsences || [];

  const attendanceData = useMemo(
    () =>
      Array.isArray(attendanceStats)
        ? attendanceStats.map((item) => ({
            month: item.month,
            attendance: toNumber(item.present_count),
            absence: toNumber(item.absent_count),
          }))
        : [],
    [attendanceStats, toNumber],
  );

  const pieData = useMemo(
    () =>
      [
        {
          name: "حضور",
          value: toNumber(firstMonth.present_count),
          color: "#16a34a",
        },
        {
          name: "غياب",
          value: toNumber(firstMonth.absent_count),
          color: "#dc2626",
        },
      ].filter((item) => item.value > 0),
    [firstMonth, toNumber],
  );

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          searchQuery.trim() === "" ||
          student.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.barcode?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [students, searchQuery],
  );

  const teacherOverview = teacherDashboard?.overview || {};
  const teacherExams = teacherDashboard?.exams || {};
  const teacherAssignments = teacherDashboard?.assignments || {};
  const recentActivities = teacherDashboard?.recent_activities || [];
  const lastPayment = teacherDashboard?.last_payment || null;

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle size={48} className="text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#009966] text-white rounded-lg hover:bg-[#007a52] transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 sm:gap-4 w-full min-h-screen p-3 sm:p-5"
      dir="rtl"
    >
      {/* Hero Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden text-white rounded-xl sm:rounded-2xl bg-linear-to-l from-[#003322] to-[#009966] p-4 sm:p-6 md:p-7"
      >
        <img
          className="absolute left-0 top-0 h-full w-24 sm:w-40 opacity-15 object-cover"
          src={Accent}
          alt=""
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs sm:text-sm opacity-80">
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
              مرحبا {user?.full_name || "أستاذ"}
            </span>
            <span className="text-xs sm:text-sm opacity-80">
              نظرة شاملة على المنصة
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl text-sm font-bold transition backdrop-blur-sm self-start sm:self-auto"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
      >
        {[
          {
            label: "عدد الصفوف",
            value: teacherOverview.total_grades || gradesStats.length || 0,
            Icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "hover:border-blue-200",
          },
          {
            label: "نسبة الحضور",
            value: `${toNumber(firstMonth.attendance_percentage)}%`,
            Icon: UserCheck,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "hover:border-green-200",
          },
          {
            label: "الطلاب",
            value: teacherOverview.total_students || totalStudents || 0,
            Icon: GraduationCap,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "hover:border-orange-200",
          },
          {
            label: "المدفوع",
            value: `${toNumber(paymentStats.total_paid)} ج.م`,
            Icon: Wallet,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "hover:border-purple-200",
          },
        ].map(({ label, value, Icon, color, bg, border }) => (
          <div
            key={label}
            className={`bg-white border-2 border-transparent ${border} hover:translate-y-1 hover:shadow-lg transition-all duration-200 rounded-2xl shadow-sm p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3`}
          >
            <div className={`${bg} rounded-xl p-2 sm:p-3 shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 block truncate">
                {value}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                {label}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 sm:gap-4"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#009966]" />
            نسبة الحضور الشهرية
          </h3>
          <div className="w-full h-48 sm:h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip
                  contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey="attendance"
                  name="حضور"
                  fill="#009966"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="absence"
                  name="غياب"
                  fill="#dc2626"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-3 text-center flex items-center justify-center gap-2">
            <TrendingUp size={16} className="text-[#009966]" />
            توزيع الحضور
          </h3>
          {pieData.length > 0 ? (
            <>
              <div className="w-full h-40 sm:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3 flex-wrap mt-3">
                {pieData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">
                      {item.name}: <b className="text-gray-900">{item.value}</b>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 text-sm py-10">
              لا توجد بيانات
            </p>
          )}
        </div>
      </motion.div>

      {/* Payment Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5"
      >
        <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
          <Wallet size={16} className="text-[#009966]" />
          ملخص المدفوعات
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 sm:p-4 text-center">
            <span className="text-base sm:text-xl font-bold text-emerald-700 block truncate">
              {toNumber(paymentStats.total_paid)} ج.م
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600">
              المدفوع
            </span>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 sm:p-4 text-center">
            <span className="text-base sm:text-xl font-bold text-red-700 block truncate">
              {toNumber(paymentStats.total_remaining)} ج.م
            </span>
            <span className="text-[10px] sm:text-xs text-red-600">المتبقي</span>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 sm:p-4 text-center">
            <span className="text-base sm:text-xl font-bold text-green-700 block">
              {toNumber(paymentStats.fully_paid_students)}
            </span>
            <span className="text-[10px] sm:text-xs text-green-600">
              مدفوع بالكامل
            </span>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 sm:p-4 text-center">
            <span className="text-base sm:text-xl font-bold text-yellow-700 block">
              {toNumber(paymentStats.unpaid_students)}
            </span>
            <span className="text-[10px] sm:text-xs text-yellow-600">
              لم يدفع
            </span>
          </div>
        </div>
      </motion.div>

      {/* Exams & Assignments Summary */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="bg-blue-50 rounded-lg p-2.5 shrink-0">
            <BookOpen size={18} className="text-blue-600" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-bold text-gray-900 block">
              {teacherExams.upcoming_paper_exams || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500">
              امتحانات قادمة
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="bg-green-50 rounded-lg p-2.5 shrink-0">
            <CalendarCheck2 size={18} className="text-green-600" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-bold text-gray-900 block">
              {teacherExams.active_online_exams || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500">
              امتحانات نشطة
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="bg-orange-50 rounded-lg p-2.5 shrink-0">
            <FileCheck2 size={18} className="text-orange-600" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-bold text-gray-900 block">
              {teacherAssignments.active_assignments || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500">
              واجبات نشطة
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="bg-purple-50 rounded-lg p-2.5 shrink-0">
            <Clock size={18} className="text-purple-600" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-bold text-gray-900 block">
              {teacherAssignments.pending_grading || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500">
              بانتظار التصحيح
            </span>
          </div>
        </div>
      </motion.div>

      {/* Students List */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              الطلاب ({totalStudents})
            </h3>
            <span className="text-xs text-gray-400">
              اضغط على طالب لعرض التفاصيل
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#009966] transition">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-xs sm:text-sm w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden">
          {filteredStudents.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-8">
              لا يوجد طلاب
            </p>
          ) : (
            <div className="flex flex-col gap-2 p-2.5">
              {filteredStudents.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-green-50/50 hover:border-green-200 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <GraduationCap size={16} className="text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-gray-900 block truncate">
                        {student.full_name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        باركود: {student.barcode}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {student.grade_name || "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-125">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                  الباركود
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                  الصف
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                  الهاتف
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.slice(0, 5).map((student) => (
                <tr
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className="cursor-pointer hover:bg-green-50/50 transition"
                >
                  <td className="py-3 px-4 text-xs font-mono">
                    {student.barcode}
                  </td>
                  <td className="py-3 px-4 font-medium text-xs">
                    {student.full_name}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {student.grade_name || "-"}
                  </td>
                  <td className="py-3 px-4 text-xs" dir="ltr">
                    {student.phone || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-3 sm:px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-gray-500">
              صفحة {page} من {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
              >
                <ChevronRight size={14} />
              </button>
              <span className="text-xs text-gray-600 px-1">{page}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Alerts */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-red-50 rounded-lg p-2">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
            تنبيهات الغياب ({consecutiveAbsences.length})
          </h3>
        </div>
        {consecutiveAbsences.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            لا توجد تنبيهات
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {consecutiveAbsences.map((student, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-100 rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={14} className="text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-gray-900 block truncate">
                      {student.full_name}
                    </span>
                    <span className="text-[10px] text-red-500">
                      {student.consecutive_absences} أيام غياب
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5"
        >
          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
            <Clock size={16} className="text-[#009966]" />
            آخر النشاطات
          </h3>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto custom-scrollbar">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-[#009966] shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-gray-700 block truncate">
                    {activity.description}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {activity.user_name || activity.user_role}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Student Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-xs sm:max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <GraduationCap size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {selectedStudent.full_name}
                    </h3>
                    <span className="text-[11px] text-gray-500">
                      باركود: {selectedStudent.barcode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-4 sm:p-5">
                {studentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : studentStats ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <CalendarCheck2
                        size={16}
                        className="text-green-600 mx-auto mb-1.5"
                      />
                      <span className="font-bold text-lg text-green-700 block">
                        {toNumber(studentStats.attendance_percentage)}%
                      </span>
                      <span className="text-[10px] text-gray-500">
                        نسبة الحضور
                      </span>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                      <BarChart3
                        size={16}
                        className="text-blue-600 mx-auto mb-1.5"
                      />
                      <span className="font-bold text-lg text-blue-700 block">
                        {toNumber(studentStats.avg_paper_degree)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        متوسط الدرجات
                      </span>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                      <Wallet
                        size={16}
                        className="text-orange-600 mx-auto mb-1.5"
                      />
                      <span className="font-bold text-lg text-orange-700 block">
                        {toNumber(studentStats.total_paid)}
                      </span>
                      <span className="text-[10px] text-gray-500">المدفوع</span>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                      <FileCheck2
                        size={16}
                        className="text-purple-600 mx-auto mb-1.5"
                      />
                      <span className="font-bold text-lg text-purple-700 block">
                        {toNumber(studentStats.total_online_exams)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        امتحانات
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-sm py-6">
                    لا توجد بيانات
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Dashboard;
