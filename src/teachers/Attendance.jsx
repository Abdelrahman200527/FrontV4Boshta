import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  Search,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Calendar,
  GraduationCap,
  Phone,
  Barcode,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  fetchAttendanceOverview,
  fetchAttendanceDashboard,
  fetchGradeAttendance,
  fetchGroupAttendanceByDate,
  fetchGroupAttendanceByMonth,
  fetchAttendanceSummary,
  searchStudentByBarcode,
  fetchStudentDetails,
  fetchStudentAttendance,
  fetchStudentFilters,
} from "../api/teacher/actions";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [gradeAttendance, setGradeAttendance] = useState(null);
  const [groupDateAttendance, setGroupDateAttendance] = useState(null);
  const [groupMonthAttendance, setGroupMonthAttendance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [overviewResult, dashboardResult] = await Promise.all([
      fetchAttendanceOverview(),
      fetchAttendanceDashboard(),
    ]);

    if (overviewResult.success) {
      setAttendanceData(overviewResult.data);
    }
    if (dashboardResult.success) {
      setDashboardData(dashboardResult.data);
    }
    setLoading(false);
  }, []);

  const loadFilters = useCallback(async () => {
    const result = await fetchStudentFilters();
    if (result.success) {
      setGrades(result.data.grades || []);
      setGroups(result.data.groups || []);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadFilters();
  }, [loadData, loadFilters]);

  const filteredGroups = useMemo(() => {
    if (!selectedGrade) return groups;
    return groups.filter((group) => group.grade_id === parseInt(selectedGrade));
  }, [groups, selectedGrade]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleGradeChange = async (gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedGroup("");
    setGradeAttendance(null);
    setGroupDateAttendance(null);
    setGroupMonthAttendance(null);
    setAttendanceSummary(null);

    if (gradeId) {
      setLoadingFilters(true);
      const result = await fetchGradeAttendance(gradeId);
      if (result.success) {
        setGradeAttendance(result.data);
      }
      setLoadingFilters(false);
    }
  };

  const handleGroupDateSearch = async () => {
    if (!selectedGroup || !selectedDate) {
      setSearchError("اختر المجموعة والتاريخ");
      return;
    }
    setLoadingFilters(true);
    setSearchError(null);
    const result = await fetchGroupAttendanceByDate(
      selectedGroup,
      selectedDate,
    );
    if (result.success) {
      setGroupDateAttendance(result.data);
    } else {
      setSearchError(result.error || "فشل تحميل البيانات");
    }
    setLoadingFilters(false);
  };

  const handleGroupMonthSearch = async () => {
    if (!selectedGroup || !selectedMonth) {
      setSearchError("اختر المجموعة والشهر");
      return;
    }
    setLoadingFilters(true);
    setSearchError(null);
    const result = await fetchGroupAttendanceByMonth(
      selectedGroup,
      selectedMonth,
    );
    if (result.success) {
      setGroupMonthAttendance(result.data);
    } else {
      setSearchError(result.error || "فشل تحميل البيانات");
    }
    setLoadingFilters(false);
  };

  const handleSummarySearch = async () => {
    if (!selectedGroup || !selectedDate) {
      setSearchError("اختر المجموعة والتاريخ");
      return;
    }
    setLoadingFilters(true);
    setSearchError(null);
    const result = await fetchAttendanceSummary(selectedGroup, selectedDate);
    if (result.success) {
      setAttendanceSummary(result.data);
    } else {
      setSearchError(result.error || "فشل تحميل الملخص");
    }
    setLoadingFilters(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("ادخل باركود الطالب");
      return;
    }

    setSearchError(null);
    setSearchLoading(true);

    const result = await searchStudentByBarcode(searchQuery);
    if (result.success && result.data) {
      setSearchResult(result.data);

      // ✅ جلب سجل الحضور المفصل
      const attendanceResult = await fetchStudentAttendance(result.data.id);
      if (attendanceResult.success) {
        setStudentHistory(attendanceResult.data || []);
      }

      // ✅ جلب الإحصائيات
      const detailsResult = await fetchStudentDetails(result.data.id);
      if (detailsResult.success) {
        setStudentStats(detailsResult.data.stats);
      }

      setShowStudentModal(true);
    } else {
      setSearchResult(null);
      setSearchError("لا يوجد طالب بهذا الباركود");
    }
    setSearchLoading(false);
  };

  const closeModal = () => {
    setShowStudentModal(false);
    setSearchResult(null);
    setStudentStats(null);
    setStudentHistory([]);
  };

  const toNumber = useCallback((value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }, []);

  const overallAttendance = attendanceData?.overall || [];
  const consecutiveAbsences = attendanceData?.consecutiveAbsences || [];
  const firstMonth = overallAttendance[0] || {};

  const chartData = useMemo(
    () =>
      overallAttendance
        .slice(0, 12)
        .map((item) => ({
          month: item.month,
          attendance: toNumber(item.present_count),
          absence: toNumber(item.absent_count),
        }))
        .reverse(),
    [overallAttendance, toNumber],
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

  const todayStats = dashboardData || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل بيانات الحضور...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="w-full flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              الحضور والغياب
            </h1>
            <span className="text-sm sm:text-base text-gray-500">
              متابعة حضور الطلاب
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition self-start sm:self-auto"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>

        {/* Search Student */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-full lg:w-96 focus-within:border-[#009966] transition">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="ابحث عن طالب بالباركود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-transparent focus:outline-none text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="text-[#009966] text-sm font-bold whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {searchLoading ? "جاري..." : "بحث"}
          </button>
        </div>
      </motion.header>

      {/* Search Error */}
      <AnimatePresence>
        {searchError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-600 text-sm flex items-center gap-2"
          >
            <AlertTriangle size={16} className="shrink-0" />
            {searchError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
      >
        {[
          {
            label: "إجمالي الطلاب",
            value: toNumber(todayStats.total_students),
            Icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            label: "حاضر اليوم",
            value: toNumber(todayStats.present_today),
            Icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-50",
            border: "border-green-100",
          },
          {
            label: "غائب اليوم",
            value: toNumber(todayStats.absent_today),
            Icon: UserX,
            color: "text-red-500",
            bg: "bg-red-50",
            border: "border-red-100",
          },
          {
            label: "لم يسجل بعد",
            value: toNumber(todayStats.not_marked_today),
            Icon: Clock,
            color: "text-yellow-500",
            bg: "bg-yellow-50",
            border: "border-yellow-100",
          },
        ].map(({ label, value, Icon, color, bg, border }) => (
          <div
            key={label}
            className={`bg-white p-3.5 sm:p-4 rounded-2xl border ${border} shadow-sm flex items-center gap-3 hover:shadow-md transition`}
          >
            <div className={`${bg} rounded-xl p-2.5 sm:p-3 shrink-0`}>
              <Icon className={color} size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-lg sm:text-2xl font-bold text-gray-900 block">
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
      >
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">
            التطور الشهري للحضور
          </h3>
          <div className="w-full h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6B7280", fontSize: 9 }}
                />
                <YAxis
                  tickMargin={20}
                  width={30}
                  tick={{ fill: "#6B7280", fontSize: 9 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "9px" }} />
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

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">
            توزيع الحضور
          </h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
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
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 flex-wrap mt-3">
                {pieData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs sm:text-sm"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">
                      {item.name}: <b>{item.value}</b>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 py-10 text-sm">
              لا توجد بيانات
            </p>
          )}
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-50 rounded-lg p-2">
              <Filter size={16} className="text-[#009966]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              تصفية الحضور
            </h3>
          </div>
          {showFilters ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col gap-4">
                {loadingFilters && (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs sm:text-sm text-gray-600 mb-1.5 block font-bold">
                      الصف الدراسي
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => handleGradeChange(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#009966] bg-white"
                    >
                      <option value="">اختر الصف</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-gray-600 mb-1.5 block font-bold">
                      المجموعة
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      disabled={!selectedGrade}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#009966] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {selectedGrade ? "اختر المجموعة" : "اختر الصف أولاً"}
                      </option>
                      {filteredGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-gray-600 mb-1.5 block font-bold">
                      التاريخ
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#009966] bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleGroupDateSearch}
                    className="px-4 py-2.5 bg-[#009966] text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-[#007a52] transition"
                  >
                    عرض حضور يوم
                  </button>
                  <button
                    onClick={handleSummarySearch}
                    className="px-4 py-2.5 bg-purple-500 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-purple-600 transition"
                  >
                    عرض الملخص
                  </button>
                </div>

                {/* Grade Attendance Table */}
                {gradeAttendance && gradeAttendance.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 mb-2">
                      إحصائيات الصف الشهرية
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-white">
                          <tr className="text-gray-600">
                            <th className="py-2.5 px-3 text-right font-semibold">
                              الشهر
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              الحضور
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              الغياب
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              النسبة
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {gradeAttendance.map((item, idx) => (
                            <tr
                              key={idx}
                              className="bg-white hover:bg-gray-50 transition"
                            >
                              <td className="py-2.5 px-3 font-medium">
                                {item.month}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                                  <CheckCircle2 size={12} />
                                  {item.present_count}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                                  <XCircle size={12} />
                                  {item.absent_count}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 font-bold">
                                  <TrendingUp
                                    size={12}
                                    className="text-blue-500"
                                  />
                                  {item.attendance_percentage}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Group Date Attendance Table */}
                {groupDateAttendance && groupDateAttendance.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 mb-2">
                      حضور المجموعة - {selectedDate}
                    </h4>
                    <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-white sticky top-0 z-10">
                          <tr className="text-gray-600">
                            <th className="py-2.5 px-3 text-right font-semibold">
                              #
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              الطالب
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              الباركود
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              الحالة
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {groupDateAttendance.map((item, idx) => (
                            <tr
                              key={idx}
                              className="bg-white hover:bg-gray-50 transition"
                            >
                              <td className="py-2.5 px-3 text-gray-400">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3 font-medium">
                                {item.full_name}
                              </td>
                              <td className="py-2.5 px-3 text-gray-500">
                                {item.barcode || "-"}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                >
                                  {item.status === "present" ? (
                                    <CheckCircle2 size={11} />
                                  ) : (
                                    <XCircle size={11} />
                                  )}
                                  {item.status === "present" ? "حاضر" : "غائب"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Attendance Summary */}
                {attendanceSummary && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 mb-2">
                      ملخص الحضور - {selectedDate}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {[
                        {
                          label: "إجمالي الطلاب",
                          value: attendanceSummary.total_students || 0,
                          Icon: Users,
                          bg: "bg-blue-50",
                          text: "text-blue-700",
                        },
                        {
                          label: "حاضر",
                          value: attendanceSummary.present_count || 0,
                          Icon: CheckCircle2,
                          bg: "bg-green-50",
                          text: "text-green-700",
                        },
                        {
                          label: "غائب",
                          value: attendanceSummary.absent_count || 0,
                          Icon: XCircle,
                          bg: "bg-red-50",
                          text: "text-red-700",
                        },
                        {
                          label: "لم يسجل",
                          value: attendanceSummary.not_marked_count || 0,
                          Icon: Clock,
                          bg: "bg-yellow-50",
                          text: "text-yellow-700",
                        },
                      ].map(({ label, value, Icon, bg, text }) => (
                        <div
                          key={label}
                          className={`${bg} rounded-xl p-3 text-center`}
                        >
                          <Icon size={16} className={`${text} mx-auto mb-1`} />
                          <span
                            className={`text-lg sm:text-xl font-bold ${text} block`}
                          >
                            {value}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Consecutive Absences */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              تنبيهات الغياب المتتالي
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
              طلاب لديهم 3 أيام غياب متتالية أو أكثر
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-2">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
        </div>

        {consecutiveAbsences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {consecutiveAbsences.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 rounded-xl p-3 sm:p-3.5 flex items-center gap-3"
              >
                <AlertTriangle size={14} className="text-red-500 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-xs sm:text-sm text-gray-900 block truncate">
                    {item.full_name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-red-500">
                    {item.consecutive_absences} أيام غياب متتالية
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-6 text-sm">
            لا توجد تنبيهات غياب
          </p>
        )}
      </motion.div>

      {/* Student Modal */}
      <AnimatePresence>
        {showStudentModal && searchResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3"
            dir="rtl"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="shrink-0 px-4 sm:px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-base sm:text-lg text-gray-900">
                    {searchResult.full_name}
                  </h2>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {searchResult.grade_name} - {searchResult.group_name}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {/* Student Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2">
                    <Barcode size={14} className="text-gray-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] text-gray-500 block">
                        الباركود
                      </span>
                      <span className="font-bold text-xs truncate">
                        {searchResult.barcode}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2">
                    <GraduationCap
                      size={14}
                      className="text-green-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] text-gray-500 block">
                        الصف
                      </span>
                      <span className="font-bold text-xs truncate">
                        {searchResult.grade_name || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2">
                    <Users size={14} className="text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] text-gray-500 block">
                        المجموعة
                      </span>
                      <span className="font-bold text-xs truncate">
                        {searchResult.group_name || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2">
                    <Phone size={14} className="text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] text-gray-500 block">
                        الهاتف
                      </span>
                      <span className="font-bold text-xs truncate" dir="ltr">
                        {searchResult.phone || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendance Stats */}
                {studentStats && (
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4">
                    <div className="bg-green-50 rounded-xl p-3.5 text-center">
                      <CheckCircle2
                        size={20}
                        className="text-green-500 mx-auto mb-1.5"
                      />
                      <span className="text-lg sm:text-xl font-bold text-green-700 block">
                        {toNumber(studentStats.present_days)}
                      </span>
                      <span className="text-[9px] sm:text-xs text-green-600">
                        أيام الحضور
                      </span>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3.5 text-center">
                      <XCircle
                        size={20}
                        className="text-red-500 mx-auto mb-1.5"
                      />
                      <span className="text-lg sm:text-xl font-bold text-red-700 block">
                        {toNumber(studentStats.absent_days)}
                      </span>
                      <span className="text-[9px] sm:text-xs text-red-600">
                        أيام الغياب
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3.5 text-center">
                      <TrendingUp
                        size={20}
                        className="text-blue-500 mx-auto mb-1.5"
                      />
                      <span className="text-lg sm:text-xl font-bold text-blue-700 block">
                        {toNumber(studentStats.attendance_percentage)}%
                      </span>
                      <span className="text-[9px] sm:text-xs text-blue-600">
                        نسبة الحضور
                      </span>
                    </div>
                  </div>
                )}

                {/* Attendance History Table */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar size={14} className="text-[#009966]" />
                    سجل الحضور المفصل ({studentHistory.length})
                  </h4>
                  {studentHistory.length === 0 ? (
                    <p className="text-center text-gray-400 py-6 text-sm">
                      لا يوجد سجل حضور
                    </p>
                  ) : (
                    <div className="overflow-x-auto max-h-48 overflow-y-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-white sticky top-0 z-10">
                          <tr className="text-gray-600">
                            <th className="py-2.5 px-3 text-right font-semibold">
                              #
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              التاريخ
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              اليوم
                            </th>
                            <th className="py-2.5 px-3 text-right font-semibold">
                              الحالة
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {studentHistory.map((att, idx) => (
                            <tr
                              key={idx}
                              className="bg-white hover:bg-gray-50 transition"
                            >
                              <td className="py-2 px-3 text-gray-400">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 font-medium">
                                {new Date(
                                  att.attendance_date,
                                ).toLocaleDateString("ar-EG")}
                              </td>
                              <td className="py-2 px-3 text-gray-500">
                                {att.day_name || "-"}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${att.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                >
                                  {att.status === "present" ? (
                                    <CheckCircle2 size={10} />
                                  ) : (
                                    <XCircle size={10} />
                                  )}
                                  {att.status === "present" ? "حاضر" : "غائب"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Attendance;
