import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  CircleCheck,
  CircleX,
  CirclePercent,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  fetchStudentStats,
  fetchAttendanceHistory,
  fetchMonthlyAttendance,
  fetchConsecutiveAbsences,
} from "../api/student/actions";

const Attendance = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [consecutiveAbsences, setConsecutiveAbsences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, historyRes, monthlyRes, consecutiveRes] =
        await Promise.all([
          fetchStudentStats(),
          fetchAttendanceHistory("", page),
          fetchMonthlyAttendance(),
          fetchConsecutiveAbsences(),
        ]);

      if (statsRes.success) setStats(statsRes.data);
      if (historyRes.success) {
        setHistory(historyRes.data || []);
        setTotalPages(historyRes.pagination?.totalPages || 1);
      }
      if (monthlyRes.success) setMonthlyStats(monthlyRes.data || []);
      if (consecutiveRes.success) setConsecutiveAbsences(consecutiveRes.data);
    } catch (err) {
      console.error("Error loading attendance:", err);
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Format time - remove milliseconds
  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const match = timeString.match(/^(\d{2}):(\d{2})/);
    if (match) return `${match[1]}:${match[2]}`;
    return timeString;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format month for display
  const formatMonth = (monthString) => {
    if (!monthString) return "-";
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("ar-EG", {
      month: "long",
      year: "numeric",
    });
  };

  const pieData = useMemo(
    () => [
      { name: "حضور", value: Number(stats?.present_days || 0) },
      { name: "غياب", value: Number(stats?.absent_days || 0) },
    ],
    [stats],
  );

  const COLORS = ["#16a34a", "#dc2626"];

  const filteredHistory = useMemo(
    () =>
      history.filter((record) => {
        if (filter === "present") return record.status === "present";
        if (filter === "absent") return record.status === "absent";
        return true;
      }),
    [history, filter],
  );

  const presentCount = useMemo(
    () => history.filter((h) => h.status === "present").length,
    [history],
  );

  const absentCount = useMemo(
    () => history.filter((h) => h.status === "absent").length,
    [history],
  );

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الحضور...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle size={48} className="text-red-400" />
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
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            الحضور والغياب
          </h1>
          <span className="text-sm sm:text-base text-gray-500">
            سجل حضوري الكامل
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          تحديث
        </button>
      </motion.header>

      {/* Consecutive Absences Alert */}
      {consecutiveAbsences &&
        Number(consecutiveAbsences.consecutive_absences) >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 justify-center"
          >
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <div className="text-center">
              <span className="font-bold text-sm text-red-700 block">
                تنبيه: لديك {consecutiveAbsences.consecutive_absences} أيام غياب
                متتالية
              </span>
              <span className="text-xs text-red-500">
                من {formatDate(consecutiveAbsences.from_date)} إلى{" "}
                {formatDate(consecutiveAbsences.to_date)}
              </span>
            </div>
          </motion.div>
        )}

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4 flex flex-col items-center justify-center">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-50 flex items-center justify-center mb-1.5 sm:mb-2">
            <CircleCheck className="text-green-600" size={16} />
          </div>
          <span className="font-bold text-xl sm:text-2xl block text-center">
            {stats?.present_days || 0}
          </span>
          <span className="text-[10px] sm:text-sm text-gray-500 text-center">
            حضور
          </span>
        </div>

        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4 flex flex-col items-center justify-center">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center mb-1.5 sm:mb-2">
            <CircleX className="text-red-600" size={16} />
          </div>
          <span className="font-bold text-xl sm:text-2xl block text-center">
            {stats?.absent_days || 0}
          </span>
          <span className="text-[10px] sm:text-sm text-gray-500 text-center">
            غياب
          </span>
        </div>

        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4 flex flex-col items-center justify-center">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-50 flex items-center justify-center mb-1.5 sm:mb-2">
            <CirclePercent className="text-purple-600" size={16} />
          </div>
          <span className="font-bold text-xl sm:text-2xl block text-center">
            {stats?.attendance_percentage || 0}%
          </span>
          <span className="text-[10px] sm:text-sm text-gray-500 text-center">
            النسبة
          </span>
        </div>
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
      >
        <h2 className="font-bold text-sm sm:text-base mb-2 text-center">
          توزيع الحضور
        </h2>
        <div className="h-44 sm:h-52 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 flex-wrap text-xs sm:text-sm mt-2">
          {pieData.map((item, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: COLORS[idx] }}
              />
              {item.name}: {item.value}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Monthly Stats */}
      {monthlyStats.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
        >
          <h2 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2 justify-center">
            <TrendingUp size={16} className="text-[#009966]" />
            الإحصائيات الشهرية
          </h2>
          <div className="flex flex-col gap-3">
            {monthlyStats.slice(0, 6).map((month, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-gray-600 w-20 sm:w-24 shrink-0 text-center">
                  {formatMonth(month.month)}
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${month.attendance_percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-green-600 w-12 text-center shrink-0">
                  {month.attendance_percentage}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1.5 sm:gap-2 pb-2 flex-wrap justify-center"
      >
        <button
          onClick={() => setFilter("all")}
          className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"
          }`}
        >
          الكل ({history.length})
        </button>
        <button
          onClick={() => setFilter("present")}
          className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
            filter === "present"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-500 border border-gray-200 hover:border-green-300"
          }`}
        >
          حضور ({presentCount})
        </button>
        <button
          onClick={() => setFilter("absent")}
          className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
            filter === "absent"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-500 border border-gray-200 hover:border-red-300"
          }`}
        >
          غياب ({absentCount})
        </button>
      </motion.div>

      {/* History Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto overflow-y-auto max-h-100">
          <table className="w-full min-w-125">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                  التاريخ
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                  اليوم
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                  الوقت
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                  الطريقة
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    لا يوجد سجل
                  </td>
                </tr>
              ) : (
                filteredHistory.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-center text-gray-800 whitespace-nowrap">
                      {formatDate(record.attendance_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600 whitespace-nowrap">
                      {record.day_name || "-"}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-center text-gray-600 whitespace-nowrap"
                      dir="ltr"
                    >
                      {formatTime(record.attendance_time)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600 whitespace-nowrap">
                      {record.method === "barcode"
                        ? "باركود"
                        : record.method === "manual"
                          ? "يدوي"
                          : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          record.status === "present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {record.status === "present" ? (
                          <CircleCheck size={11} />
                        ) : (
                          <CircleX size={11} />
                        )}
                        {record.status === "present" ? "حاضر" : "غائب"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-gray-50 transition text-gray-600"
          >
            <ChevronRight size={14} />
            السابق
          </button>
          <span className="text-sm text-gray-600 font-bold">
            {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-gray-50 transition text-gray-600"
          >
            التالي
            <ChevronLeft size={14} />
          </button>
        </div>
      )}
    </motion.section>
  );
};

export default Attendance;