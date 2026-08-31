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
  Layers,
  Monitor,
  PlayCircle,
  UserCog,
  CreditCard,
  CalendarClock,
  CheckCircle2,
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

// Image helper
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `https://backend.benb3n.cloud/${imagePath.replace(/^\//, "")}`;
};

const StudentAvatarModal = ({ student }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getImageUrl(student?.profile_image);

  return (
    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-200 shrink-0">
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={student?.full_name}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-bold text-green-600 text-lg">
          {student?.full_name?.charAt(0) || "ط"}
        </span>
      )}
    </div>
  );
};

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
  const [toastMessage, setToastMessage] = useState(null);

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

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadStudents()]);
    setRefreshing(false);
    showToast("تم التحديث بنجاح");
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setStudentLoading(true);
    setStudentStats(null);
    const result = await fetchStudentDetails(student.id);
    if (result.success) {
      setStudentStats(result.data.stats);
      if (result.data.profile) {
        setSelectedStudent((prev) => ({
          ...prev,
          ...result.data.profile,
        }));
      }
    }
    setStudentLoading(false);
  };

  const toNumber = useCallback((value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }, []);

  const overview = teacherDashboard?.overview || {};
  const attendanceToday = teacherDashboard?.attendance_today || {};
  const examsSummary = teacherDashboard?.exams || {};
  const assignmentsSummary = teacherDashboard?.assignments || {};
  const paymentsMonth = teacherDashboard?.payments_month || {};
  const lastPayment = teacherDashboard?.last_payment || null;
  const recentActivities = teacherDashboard?.recent_activities || [];

  const attendanceChartData = [
    { name: "حاضر", value: toNumber(attendanceToday.present_count) },
    { name: "غائب", value: toNumber(attendanceToday.absent_count) },
    { name: "غير محدد", value: toNumber(attendanceToday.not_marked_count) },
  ];

  const paymentsChartData = [
    { name: "مدفوع", value: toNumber(paymentsMonth.total_paid) },
    { name: "متبقي", value: toNumber(paymentsMonth.total_remaining) },
  ];

  const gradesChartData = [
    { name: "ورقي", value: toNumber(examsSummary.avg_paper_score) },
    { name: "إلكتروني", value: toNumber(examsSummary.avg_online_score) },
  ];

  const COLORS = ["#009966", "#dc2626", "#f59e0b", "#3b82f6", "#8b5cf6"];

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
      {/* ✅ Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm font-bold"
          >
            <CheckCircle2 size={16} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden text-white rounded-xl sm:rounded-2xl bg-linear-to-l from-[#003322] to-[#009966] p-4 sm:p-6"
      >
        <img
          className="absolute left-0 top-0 h-full w-24 sm:w-40 opacity-15 object-cover"
          src={Accent}
          alt=""
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <span className="text-xs sm:text-sm opacity-80">
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              مرحبا أ/ {user?.full_name || "أستاذ"}
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl text-sm font-bold transition"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <GraduationCap size={18} className="text-blue-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {overview.total_students || 0}
          </span>
          <span className="text-[10px] text-gray-500">الطلاب</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <Layers size={18} className="text-green-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {overview.total_grades || 0}
          </span>
          <span className="text-[10px] text-gray-500">الصفوف</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <Users size={18} className="text-orange-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {overview.total_groups || 0}
          </span>
          <span className="text-[10px] text-gray-500">المجموعات</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <UserCog size={18} className="text-purple-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {overview.total_assistants || 0}
          </span>
          <span className="text-[10px] text-gray-500">المساعدين</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <PlayCircle size={18} className="text-red-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {overview.total_videos || 0}
          </span>
          <span className="text-[10px] text-gray-500">الفيديوهات</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <Monitor size={18} className="text-indigo-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {overview.total_playlists || 0}
          </span>
          <span className="text-[10px] text-gray-500">قوائم التشغيل</span>
        </div>
      </motion.div>

      {/* Attendance Today */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <span className="text-lg font-bold text-green-700 block">
            {attendanceToday.present_count || 0}
          </span>
          <span className="text-[10px] text-green-600">حاضر اليوم</span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <span className="text-lg font-bold text-red-700 block">
            {attendanceToday.absent_count || 0}
          </span>
          <span className="text-[10px] text-red-600">غائب اليوم</span>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
          <span className="text-lg font-bold text-yellow-700 block">
            {attendanceToday.not_marked_count || 0}
          </span>
          <span className="text-[10px] text-yellow-600">غير محدد</span>
        </div>
      </motion.div>

      {/* Exams Summary */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <CalendarClock size={18} className="text-blue-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {examsSummary.upcoming_paper_exams || 0}
          </span>
          <span className="text-[10px] text-gray-500">ورقي قادم</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <Clock size={18} className="text-green-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {examsSummary.active_online_exams || 0}
          </span>
          <span className="text-[10px] text-gray-500">نشط الآن</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <FileCheck2 size={18} className="text-red-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {assignmentsSummary.pending_grading || 0}
          </span>
          <span className="text-[10px] text-gray-500">بانتظار التصحيح</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <TrendingUp size={18} className="text-orange-600 mx-auto mb-1" />
          <span className="text-lg font-bold text-gray-900 block">
            {toNumber(paymentsMonth.paid_percentage)}%
          </span>
          <span className="text-[10px] text-gray-500">نسبة الدفع</span>
        </div>
      </motion.div>

      {/* Payments Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
      >
        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <Wallet size={16} className="text-[#009966]" />
          ملخص المدفوعات
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <span className="text-base sm:text-lg font-bold text-emerald-700 block">
              {toNumber(paymentsMonth.total_paid)} ج.م
            </span>
            <span className="text-[10px] text-emerald-600">المدفوع</span>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <span className="text-base sm:text-lg font-bold text-green-700 block">
              {toNumber(paymentsMonth.paid_percentage)}%
            </span>
            <span className="text-[10px] text-green-600">نسبة الدفع</span>
          </div>
        </div>

        {lastPayment && (
          <div className="mt-3 bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CreditCard size={16} className="text-[#009966] shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-gray-900 block truncate">
                  {lastPayment.student_name}
                </span>
                <span className="text-[10px] text-gray-500">
                  {new Date(lastPayment.payment_date).toLocaleDateString(
                    "ar-EG",
                  )}
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-green-600 shrink-0">
              {lastPayment.amount} ج.م
            </span>
          </div>
        )}
      </motion.div>

      {/* Students Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-sm w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 shrink-0"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-125">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">
                  الباركود
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">
                  الصف
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">
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
                  <td className="py-3 px-4 text-center font-medium text-sm">
                    {student.full_name}
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-mono">
                    {student.barcode}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {student.grade_name || "-"}
                  </td>
                  <td className="py-3 px-4 text-center text-sm" dir="ltr">
                    {student.phone || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
            >
              <ChevronRight size={14} />
            </button>
            <span className="text-xs text-gray-600 font-bold">
              {page} من {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        )}
      </motion.div>

      {/* 3 Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h3 className="font-bold text-gray-900 text-xs mb-2 text-center">
            الحضور
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {attendanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-2 flex-wrap text-[9px] mt-1">
            {attendanceChartData.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx] }}
                />
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h3 className="font-bold text-gray-900 text-xs mb-2 text-center">
            المدفوعات
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} width={25} />
                <Tooltip
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
                <Bar dataKey="value" fill="#009966" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h3 className="font-bold text-gray-900 text-xs mb-2 text-center">
            الدرجات
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} width={25} />
                <Tooltip
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
        >
          <h3 className="font-bold text-gray-900 text-sm mb-3">آخر النشاطات</h3>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {recentActivities.slice(0, 10).map((activity, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-3 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#009966] shrink-0" />
                <span className="text-xs text-gray-700 truncate flex-1">
                  {activity.description}
                </span>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {activity.user_name}
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
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <StudentAvatarModal student={selectedStudent} />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {selectedStudent.full_name}
                    </h3>
                    <span className="text-[11px] text-gray-500">
                      {selectedStudent.barcode}
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

              <div className="p-5">
                {studentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : studentStats ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <CalendarCheck2
                        size={16}
                        className="text-green-600 mx-auto mb-1"
                      />
                      <span className="font-bold text-lg text-green-700 block">
                        {toNumber(studentStats.attendance_percentage)}%
                      </span>
                      <span className="text-[10px] text-gray-500">الحضور</span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <BarChart3
                        size={16}
                        className="text-blue-600 mx-auto mb-1"
                      />
                      <span className="font-bold text-lg text-blue-700 block">
                        {toNumber(studentStats.avg_paper_degree)}
                      </span>
                      <span className="text-[10px] text-gray-500">المتوسط</span>
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