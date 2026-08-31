import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  Users,
  UserCheck,
  Wallet,
  TrendingDown,
  AlertTriangle,
  GraduationCap,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Phone,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Calendar,
  FileText,
  Monitor,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  fetchDashboardStats,
  fetchAttendanceOverview,
  fetchAllStudents,
  fetchStudentDetails,
  fetchStudentFilters,
  fetchTeacherDashboard,
} from "../api/teacher/actions";
import getImageUrl from "../utils/imageUrl";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [teacherDashboard, setTeacherDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchDebounce, setSearchDebounce] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, attendanceRes, filtersRes, dashboardRes] =
        await Promise.all([
          fetchDashboardStats(),
          fetchAttendanceOverview(),
          fetchStudentFilters(),
          fetchTeacherDashboard(),
        ]);

      if (statsRes.success) setStats(statsRes.data);
      if (attendanceRes.success) setAttendanceOverview(attendanceRes.data);
      if (filtersRes.success) setGrades(filtersRes.data.grades || []);
      if (dashboardRes.success) setTeacherDashboard(dashboardRes.data);
    } catch (error) {
      console.error("Error loading reports:", error);
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    const result = await fetchAllStudents(
      page,
      searchQuery,
      selectedGrade === "all" ? "" : selectedGrade,
    );
    if (result.success) {
      setStudents(result.data || []);
      setTotalStudents(result.pagination?.total || result.data.length);
      setTotalPages(result.pagination?.totalPages || 1);
    }
  }, [page, searchQuery, selectedGrade]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Debounce search
    if (searchDebounce) clearTimeout(searchDebounce);
    setSearchDebounce(
      setTimeout(() => {
        loadStudents();
      }, 500),
    );
    return () => {
      if (searchDebounce) clearTimeout(searchDebounce);
    };
  }, [searchQuery, selectedGrade, page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadStudents()]);
    setRefreshing(false);
  };

  const toNumber = useCallback((value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }, []);

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    const result = await fetchStudentDetails(student.id);
    if (result.success) {
      setStudentDetails(result.data);
    }
    setDetailsLoading(false);
  };

  const closeDetails = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  const attendanceStats = stats?.attendance || [];
  const paymentStats = stats?.payments || {};
  const consecutiveAbsences = attendanceOverview?.consecutiveAbsences || [];
  const teacherOverview = teacherDashboard?.overview || {};
  const teacherExams = teacherDashboard?.exams || {};
  const teacherAssignments = teacherDashboard?.assignments || {};

  const attendanceData = useMemo(
    () =>
      Array.isArray(attendanceStats)
        ? attendanceStats.map((item) => ({
            month: item.month,
            attendance: toNumber(item.present_count),
            absence: toNumber(item.absent_count),
            percentage: toNumber(item.attendance_percentage),
          }))
        : [],
    [attendanceStats, toNumber],
  );

  const firstMonth = attendanceData[0] || {};

  const pieData = useMemo(
    () =>
      [
        {
          name: "حضور",
          value: toNumber(firstMonth.attendance),
          color: "#16a34a",
        },
        { name: "غياب", value: toNumber(firstMonth.absence), color: "#dc2626" },
      ].filter((item) => item.value > 0),
    [firstMonth, toNumber],
  );

  const quickStats = useMemo(
    () => [
      {
        label: "إجمالي الطلاب",
        value: toNumber(teacherOverview.total_students) || totalStudents || 0,
        Icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "hover:border-blue-200",
      },
      {
        label: "نسبة الحضور",
        value: `${toNumber(firstMonth.percentage)}%`,
        Icon: UserCheck,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "hover:border-green-200",
      },
      {
        label: "المدفوع",
        value: `${toNumber(paymentStats.total_paid)} ج.م`,
        Icon: Wallet,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "hover:border-emerald-200",
      },
      {
        label: "المتبقي",
        value: `${toNumber(paymentStats.total_remaining)} ج.م`,
        Icon: TrendingDown,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "hover:border-red-200",
      },
    ],
    [teacherOverview, paymentStats, firstMonth, totalStudents, toNumber],
  );

  const handleRetry = () => {
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل التقارير...</p>
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
            onClick={handleRetry}
            className="px-5 py-2.5 bg-[#009966] text-white rounded-xl hover:bg-[#007a52] transition text-sm font-bold"
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
      className="flex flex-col gap-4 sm:gap-6 w-full min-h-screen p-3 sm:p-5 md:p-6"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="w-full flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={28} className="text-[#009966]" />
              التقارير والإحصائيات
            </h1>
            <span className="text-sm sm:text-base text-gray-500 mt-1 block">
              نظرة شاملة على أداء المنصة
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:border-[#009966] hover:text-[#009966] transition self-start sm:self-auto disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>
      </motion.header>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {quickStats.map(
          ({ label, value, Icon, color, bgColor, borderColor }) => (
            <div
              key={label}
              className={`bg-white border border-gray-100 ${borderColor} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm`}
            >
              <div className={`${bgColor} rounded-xl p-2 sm:p-3 shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-xl font-bold text-gray-900 block truncate">
                  {value}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {label}
                </span>
              </div>
            </div>
          ),
        )}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-[#009966]" />
              الحضور الشهري
            </h3>
            <span className="text-xs text-gray-400">
              {attendanceData.length} شهر
            </span>
          </div>
          <div className="w-full h-56 sm:h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} width={35} />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey="attendance"
                  name="حضور"
                  fill="#16a34a"
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

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#009966]" />
              توزيع الحضور
            </h3>
            <span className="text-xs text-gray-400">
              {firstMonth.month || "-"}
            </span>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 flex-wrap mt-3">
                {pieData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 rounded-full px-3 py-1.5"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">
                      {item.name}: <b className="text-gray-900">{item.value}</b>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 py-12 text-sm">
              لا توجد بيانات
            </p>
          )}
        </div>
      </motion.div>

      {/* Payment Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm"
      >
        <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-4 flex items-center gap-2">
          <Wallet size={18} className="text-[#009966]" />
          ملخص المدفوعات
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-emerald-50 rounded-xl p-4 text-center hover:bg-emerald-100 transition">
            <span className="text-lg sm:text-2xl font-bold text-emerald-700 block">
              {toNumber(paymentStats.total_paid)} ج.م
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">
              المدفوع
            </span>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center hover:bg-red-100 transition">
            <span className="text-lg sm:text-2xl font-bold text-red-700 block">
              {toNumber(paymentStats.total_remaining)} ج.م
            </span>
            <span className="text-[10px] sm:text-xs text-red-600 font-bold">
              المتبقي
            </span>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center hover:bg-green-100 transition">
            <span className="text-lg sm:text-2xl font-bold text-green-700 block">
              {toNumber(paymentStats.fully_paid_students)}
            </span>
            <span className="text-[10px] sm:text-xs text-green-600 font-bold">
              مدفوع بالكامل
            </span>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center hover:bg-yellow-100 transition">
            <span className="text-lg sm:text-2xl font-bold text-yellow-700 block">
              {toNumber(paymentStats.unpaid_students)}
            </span>
            <span className="text-[10px] sm:text-xs text-yellow-600 font-bold">
              لم يدفع
            </span>
          </div>
        </div>
      </motion.div>

      {/* Exams & Assignments Summary */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transition">
          <div className="bg-blue-50 rounded-xl p-2 sm:p-3 shrink-0">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-bold text-gray-900 block">
              {teacherExams.upcoming_paper_exams || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500">
              امتحانات ورقية قادمة
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transition">
          <div className="bg-purple-50 rounded-xl p-2 sm:p-3 shrink-0">
            <Monitor size={18} className="text-purple-600" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-bold text-gray-900 block">
              {teacherExams.active_online_exams || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500">
              امتحانات إلكترونية نشطة
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transition">
          <div className="bg-orange-50 rounded-xl p-2 sm:p-3 shrink-0">
            <BarChart3 size={18} className="text-orange-600" />
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
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transition">
          <div className="bg-green-50 rounded-xl p-2 sm:p-3 shrink-0">
            <TrendingUp size={18} className="text-green-600" />
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

      {/* Students Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Users size={18} className="text-[#009966]" />
            الطلاب
            <span className="bg-gray-100 rounded-full px-2.5 py-0.5 text-xs text-gray-500">
              {totalStudents}
            </span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#009966] transition">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الباركود..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent focus:outline-none text-xs sm:text-sm w-full min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#009966] transition"
            >
              <option value="all">كل الصفوف</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden">
          {students.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              لا يوجد طلاب
            </p>
          ) : (
            <div className="flex flex-col gap-2 p-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-green-50/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-gray-900 block truncate">
                        {student.full_name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        باركود: {student.barcode}
                      </span>
                    </div>
                    <Eye size={14} className="text-gray-400 shrink-0" />
                  </div>
                  <div className="flex gap-2 mt-2 text-[10px] text-gray-500 flex-wrap">
                    <span>{student.grade_name || "-"}</span>
                    <span>•</span>
                    <span>{student.group_name || "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-150">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600">
                  #
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600">
                  الباركود
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600">
                  الاسم
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600">
                  الصف
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600">
                  المجموعة
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600">
                  الهاتف
                </th>
                <th className="text-right py-3 px-4 text-xs font-bold text-gray-600">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    لا يوجد طلاب
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-green-50/30 transition-colors group"
                  >
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">
                      {student.barcode}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="font-bold text-xs sm:text-sm text-gray-900 cursor-pointer hover:text-[#009966] transition"
                        onClick={() => handleStudentClick(student)}
                      >
                        {student.full_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {student.grade_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {student.group_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600" dir="ltr">
                      {student.phone || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleStudentClick(student)}
                        className="p-2 text-gray-400 hover:text-[#009966] hover:bg-green-50 rounded-lg transition"
                        title="عرض التفاصيل"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs sm:text-sm text-gray-500">
              عرض {(page - 1) * 10 + 1} - {Math.min(page * 10, totalStudents)}{" "}
              من {totalStudents}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
              >
                <ChevronRight size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      page === pageNum
                        ? "bg-[#009966] text-white"
                        : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
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

      {/* Consecutive Absences */}
      {consecutiveAbsences.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-50 rounded-xl p-2">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                تنبيهات الغياب
              </h3>
              <span className="text-xs text-gray-500">
                {consecutiveAbsences.length} طلاب لديهم غياب متتالي
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {consecutiveAbsences.map((student, index) => (
              <div
                key={index}
                className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex items-center gap-2 hover:bg-red-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-red-500" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs sm:text-sm text-gray-900 block truncate">
                    {student.full_name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-red-500 font-bold">
                    {student.consecutive_absences} أيام غياب متتالية
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4"
            dir="rtl"
            onClick={closeDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#009966]/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-[#009966]">
                      {selectedStudent.full_name?.charAt(0) || "ط"}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-bold text-sm sm:text-lg text-gray-900">
                      {selectedStudent.full_name}
                    </h2>
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      باركود: {selectedStudent.barcode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeDetails}
                  className="p-2 hover:bg-gray-100 rounded-full transition shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {detailsLoading ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    جاري تحميل التفاصيل...
                  </div>
                ) : studentDetails ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <Phone size={16} className="text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-gray-500 block">
                            الهاتف
                          </span>
                          <span
                            className="font-bold text-xs sm:text-sm truncate"
                            dir="ltr"
                          >
                            {selectedStudent.phone || "-"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <GraduationCap
                          size={16}
                          className="text-green-500 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] text-gray-500 block">
                            الصف
                          </span>
                          <span className="font-bold text-xs sm:text-sm truncate">
                            {selectedStudent.grade_name || "-"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <Users size={16} className="text-purple-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-gray-500 block">
                            المجموعة
                          </span>
                          <span className="font-bold text-xs sm:text-sm truncate">
                            {selectedStudent.group_name || "-"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <Phone size={16} className="text-orange-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-gray-500 block">
                            ولي الأمر
                          </span>
                          <span
                            className="font-bold text-xs sm:text-sm truncate"
                            dir="ltr"
                          >
                            {selectedStudent.parent_phone || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <span className="text-base sm:text-xl font-bold text-green-700 block">
                          {toNumber(
                            studentDetails.stats?.attendance_percentage,
                          )}
                          %
                        </span>
                        <span className="text-[10px] sm:text-xs text-green-600 font-bold">
                          نسبة الحضور
                        </span>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <span className="text-base sm:text-xl font-bold text-blue-700 block">
                          {toNumber(studentDetails.stats?.present_days)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-blue-600 font-bold">
                          أيام الحضور
                        </span>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 text-center">
                        <span className="text-base sm:text-xl font-bold text-red-700 block">
                          {toNumber(studentDetails.stats?.absent_days)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-red-600 font-bold">
                          أيام الغياب
                        </span>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <span className="text-base sm:text-xl font-bold text-purple-700 block">
                          {toNumber(studentDetails.stats?.avg_paper_degree)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-purple-600 font-bold">
                          متوسط الدرجات
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <span className="text-base sm:text-xl font-bold text-emerald-700 block">
                          {toNumber(studentDetails.stats?.total_paid)} ج.م
                        </span>
                        <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">
                          إجمالي المدفوع
                        </span>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-3 text-center">
                        <span className="text-base sm:text-xl font-bold text-orange-700 block">
                          {toNumber(studentDetails.stats?.total_required)} ج.م
                        </span>
                        <span className="text-[10px] sm:text-xs text-orange-600 font-bold">
                          إجمالي المطلوب
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    لا توجد بيانات
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Reports;
