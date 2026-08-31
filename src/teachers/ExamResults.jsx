import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  Search,
  X,
  ArrowRight,
  Users,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Monitor,
  Clock,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Minus,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Filter,
  ChevronDown,
  ChevronUp,
  Trophy,
  Medal,
  Star,
  Target,
  Percent,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPaperExamResults,
  fetchOnlineExamStats,
  fetchExamResultsByGrade,
  fetchGradeExamResultsStats,
} from "../api/teacher/actions";

const ExamResults = () => {
  const { type, examId } = useParams();
  const navigate = useNavigate();

  const [examResults, setExamResults] = useState([]);
  const [examStats, setExamStats] = useState(null);
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [examStatus, setExamStatus] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [gradeStats, setGradeStats] = useState(null);
  const [gradeResultStats, setGradeResultStats] = useState(null);
  const [sortBy, setSortBy] = useState("rank");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showGradeStats, setShowGradeStats] = useState(false);
  const [showGradeResultStats, setShowGradeResultStats] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearchQuery("");
    setPage(1);
    setFilterStatus("all");
    setGradeStats(null);
    setGradeResultStats(null);
    setShowGradeStats(false);
    setShowGradeResultStats(false);

    try {
      if (type === "paper") {
        const result = await fetchPaperExamResults(examId);
        if (result.success) {
          const results = result.data.results || [];
          const stats = result.data.stats || {};
          setExamResults(results);
          setExamStats(stats);
          setExamInfo({
            title: stats.title || "امتحان ورقي",
            totalMark: stats.total_degree || 100,
            date: stats.exam_date,
            type: "paper",
            gradeId: stats.grade_id,
          });

          const examDate = new Date(stats.exam_date).getTime();
          setExamStatus(examDate > Date.now() ? "upcoming" : "finished");

          // ✅ استخدام fetchExamResultsByGrade - جلب نتائج الصف
          if (stats.grade_id) {
            const gradeStatsResult = await fetchExamResultsByGrade(
              stats.grade_id,
            );
            if (gradeStatsResult.success) {
              setGradeStats(gradeStatsResult.data);
            }
          }

          // ✅ استخدام fetchGradeExamResultsStats - إحصائيات الصف
          if (stats.grade_id) {
            const gradeResultStats = await fetchGradeExamResultsStats(
              stats.grade_id,
            );
            if (gradeResultStats.success) {
              setGradeResultStats(gradeResultStats.data);
            }
          }
        } else {
          setError(result.error || "فشل تحميل النتائج");
        }
      } else {
        const result = await fetchOnlineExamStats(examId);
        if (result.success) {
          const attempts = result.data.attempts || [];
          const stats = result.data.stats || {};
          setExamResults(attempts);
          setExamStats(stats);
          setExamInfo({
            title: stats.title || "امتحان إلكتروني",
            totalMark: stats.full_mark || 100,
            type: "online",
            gradeId: stats.grade_id,
          });

          const now = Date.now();
          const startAt = stats.start_at
            ? new Date(stats.start_at).getTime()
            : 0;
          const endAt = stats.end_at
            ? new Date(stats.end_at).getTime()
            : Infinity;

          if (now < startAt) setExamStatus("upcoming");
          else if (now > endAt) setExamStatus("finished");
          else setExamStatus("ongoing");

          // ✅ استخدام fetchExamResultsByGrade - جلب نتائج الصف
          if (stats.grade_id) {
            const gradeStatsResult = await fetchExamResultsByGrade(
              stats.grade_id,
            );
            if (gradeStatsResult.success) {
              setGradeStats(gradeStatsResult.data);
            }
          }

          // ✅ استخدام fetchGradeExamResultsStats - إحصائيات الصف
          if (stats.grade_id) {
            const gradeResultStats = await fetchGradeExamResultsStats(
              stats.grade_id,
            );
            if (gradeResultStats.success) {
              setGradeResultStats(gradeResultStats.data);
            }
          }
        } else {
          setError(result.error || "فشل تحميل النتائج");
        }
      }
    } catch (error) {
      console.error("Error loading results:", error);
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [type, examId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const toNumber = useCallback((value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }, []);

  const totalMark = useMemo(
    () =>
      examInfo?.totalMark ||
      examStats?.total_degree ||
      examStats?.full_mark ||
      100,
    [examInfo, examStats],
  );

  const getStudentScore = useCallback(
    (student) => toNumber(student.degree || student.score),
    [toNumber],
  );

  const getStudentPercentage = useCallback(
    (student) => {
      const score = getStudentScore(student);
      return (
        student.percentage ||
        (totalMark ? Math.round((score / totalMark) * 100) : 0)
      );
    },
    [getStudentScore, totalMark],
  );

  const filteredResults = useMemo(() => {
    let results = examResults.filter((student) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

      const percentage = getStudentPercentage(student);
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "passed" && percentage >= 50) ||
        (filterStatus === "failed" && percentage < 50);

      return matchesSearch && matchesFilter;
    });

    switch (sortBy) {
      case "rank":
        results = [...results].sort(
          (a, b) => getStudentScore(b) - getStudentScore(a),
        );
        break;
      case "name":
        results = [...results].sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || ""),
        );
        break;
      case "percentage":
        results = [...results].sort(
          (a, b) => getStudentPercentage(b) - getStudentPercentage(a),
        );
        break;
      default:
        break;
    }

    return results;
  }, [
    examResults,
    searchQuery,
    sortBy,
    filterStatus,
    getStudentScore,
    getStudentPercentage,
  ]);

  const passedStudents = useMemo(
    () => examResults.filter((student) => getStudentPercentage(student) >= 50),
    [examResults, getStudentPercentage],
  );

  const failedStudents = useMemo(
    () => examResults.filter((student) => getStudentPercentage(student) < 50),
    [examResults, getStudentPercentage],
  );

  const highestScore = useMemo(() => {
    if (examResults.length === 0) return 0;
    return Math.max(...examResults.map(getStudentScore));
  }, [examResults, getStudentScore]);

  const lowestScore = useMemo(() => {
    if (examResults.length === 0) return 0;
    return Math.min(...examResults.map(getStudentScore));
  }, [examResults, getStudentScore]);

  const averageScore = useMemo(() => {
    if (examResults.length === 0) return 0;
    const sum = examResults.reduce((acc, s) => acc + getStudentScore(s), 0);
    return (sum / examResults.length).toFixed(2);
  }, [examResults, getStudentScore]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResults.length / itemsPerPage),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const passPercentage =
    examResults.length > 0
      ? Math.round((passedStudents.length / examResults.length) * 100)
      : 0;

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={16} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={16} className="text-gray-400" />;
    if (rank === 3) return <Medal size={16} className="text-amber-600" />;
    return <span className="text-xs font-bold text-gray-400">{rank}</span>;
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل النتائج...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <XCircle size={48} className="text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadResults}
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
      className="flex flex-col gap-3 sm:gap-4 w-full min-h-screen p-3 sm:p-5 bg-gray-50"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <button
          onClick={() => navigate("/teacher/degrees")}
          className="flex items-center gap-1 text-[#009966] text-xs sm:text-sm font-bold w-fit hover:underline"
        >
          <ArrowRight size={15} />
          رجوع للامتحانات
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold text-gray-600 hover:border-[#009966] transition"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          تحديث
        </button>
      </motion.div>

      {/* Exam Info Card */}
      <motion.div
        variants={itemVariants}
        className="bg-linear-to-l from-[#003322] to-[#009966] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg"
      >
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-white/20">
            {type === "paper" ? <FileText size={15} /> : <Monitor size={15} />}
            {type === "paper" ? "ورقي" : "إلكتروني"}
          </div>

          {examStatus === "upcoming" && (
            <div className="flex items-center gap-1.5 bg-yellow-500/30 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold">
              <Clock size={15} />
              لم يبدأ بعد
            </div>
          )}
          {examStatus === "ongoing" && (
            <div className="flex items-center gap-1.5 bg-green-500/30 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold">
              <AlertCircle size={15} />
              جاري الآن
            </div>
          )}
          {examStatus === "finished" && (
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold">
              <CheckCircle2 size={15} />
              منتهي
            </div>
          )}
        </div>
        <h2 className="text-lg sm:text-2xl font-bold mt-1">
          {examInfo?.title || "نتائج الامتحان"}
        </h2>
        {examInfo?.date && (
          <p className="text-xs sm:text-sm opacity-80 mt-1">
            {new Date(examInfo.date).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </motion.div>

      {/* Upcoming / Ongoing */}
      <AnimatePresence>
        {examStatus === "upcoming" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center"
          >
            <Clock size={40} className="text-yellow-500 mx-auto mb-3" />
            <h3 className="font-bold text-yellow-700 text-base sm:text-lg">
              لم يبدأ الامتحان بعد
            </h3>
            <p className="text-sm text-yellow-600 mt-1">لا توجد نتائج متاحة</p>
          </motion.div>
        )}

        {examStatus === "ongoing" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
          >
            <AlertCircle size={40} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-green-700 text-base sm:text-lg">
              الامتحان جاري الآن
            </h3>
            <p className="text-sm text-green-600 mt-1">
              النتائج ستظهر بعد انتهاء الامتحان
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finished Content */}
      {examStatus === "finished" && (
        <>
          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3"
          >
            {[
              {
                icon: Users,
                label: "الطلاب",
                value: examResults.length,
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                icon: TrendingUp,
                label: "المتوسط",
                value: averageScore,
                color: "text-green-500",
                bg: "bg-green-50",
              },
              {
                icon: Award,
                label: "الأعلى",
                value: highestScore,
                color: "text-yellow-500",
                bg: "bg-yellow-50",
              },
              {
                icon: Minus,
                label: "الأدنى",
                value: lowestScore,
                color: "text-gray-500",
                bg: "bg-gray-50",
              },
              {
                icon: CheckCircle2,
                label: "ناجح",
                value: passedStudents.length,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },
              {
                icon: XCircle,
                label: "راسب",
                value: failedStudents.length,
                color: "text-red-500",
                bg: "bg-red-50",
              },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className={`${bg} rounded-lg p-2 w-fit mx-auto mb-2`}>
                  <Icon size={18} className={color} />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gray-900 block">
                  {value}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Pass Rate Bar */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#009966]" />
                نسبة النجاح
              </span>
              <span
                className={`text-sm font-bold ${passPercentage >= 50 ? "text-green-600" : "text-red-600"}`}
              >
                {passPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${passPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${passPercentage >= 50 ? "bg-green-500" : "bg-red-500"}`}
              />
            </div>
          </motion.div>

          {/* Search & Sort & Filter */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex-1">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الباركود..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent focus:outline-none text-sm w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-[#009966]"
              >
                <option value="rank">ترتيب بالدرجة</option>
                <option value="name">ترتيب بالاسم</option>
                <option value="percentage">ترتيب بالنسبة</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-[#009966]"
              >
                <option value="all">الكل</option>
                <option value="passed">ناجح فقط</option>
                <option value="failed">راسب فقط</option>
              </select>
            </div>
          </motion.div>

          {/* Mobile Cards */}
          <motion.div
            variants={itemVariants}
            className="sm:hidden flex flex-col gap-2"
          >
            {paginatedResults.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                لا توجد نتائج
              </p>
            ) : (
              paginatedResults.map((student, index) => {
                const score = getStudentScore(student);
                const percentage = getStudentPercentage(student);
                const isPassed = percentage >= 50;
                const rank = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <motion.div
                    key={student.id || index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl border p-3 ${isPassed ? "border-green-100" : "border-red-100"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${rank <= 3 ? "bg-yellow-100" : "bg-gray-100"}`}
                        >
                          {getRankIcon(rank)}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-gray-900 block truncate">
                            {student.full_name}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            باركود: {student.barcode}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold ${isPassed ? "text-green-600" : "text-red-600"}`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        الدرجة: {score}/{totalMark}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                      >
                        {isPassed ? "ناجح" : "راسب"}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Desktop Table */}
          <motion.div
            variants={itemVariants}
            className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-175">
                <thead>
                  <tr className="bg-linear-to-l from-gray-50 to-gray-100">
                    <th className="text-right py-3.5 px-4 text-xs font-bold text-gray-700">
                      الترتيب
                    </th>
                    <th className="text-right py-3.5 px-4 text-xs font-bold text-gray-700">
                      الباركود
                    </th>
                    <th className="text-right py-3.5 px-4 text-xs font-bold text-gray-700">
                      الاسم
                    </th>
                    <th className="text-right py-3.5 px-4 text-xs font-bold text-gray-700">
                      الدرجة
                    </th>
                    <th className="text-right py-3.5 px-4 text-xs font-bold text-gray-700">
                      النسبة
                    </th>
                    <th className="text-right py-3.5 px-4 text-xs font-bold text-gray-700">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedResults.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-gray-400 text-sm"
                      >
                        لا توجد نتائج
                      </td>
                    </tr>
                  ) : (
                    paginatedResults.map((student, index) => {
                      const score = getStudentScore(student);
                      const percentage = getStudentPercentage(student);
                      const isPassed = percentage >= 50;
                      const rank = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <tr
                          key={student.id || index}
                          className="hover:bg-green-50/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${rank <= 3 ? "bg-yellow-100" : "bg-gray-100"}`}
                            >
                              {getRankIcon(rank)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono">
                            {student.barcode}
                          </td>
                          <td className="py-3 px-4 font-medium text-sm">
                            {student.full_name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-sm">{score}</span>
                            <span className="text-gray-400 text-xs">
                              /{totalMark}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isPassed ? "bg-green-500" : "bg-red-500"}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold">
                                {percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                            >
                              {isPassed ? (
                                <CheckCircle2 size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}
                              {isPassed ? "ناجح" : "راسب"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl border border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between flex-wrap gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500">
                  صفحة {currentPage} من {totalPages}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-200 rounded-md px-2 py-1 text-xs"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronRight size={14} />
                </button>
                <span className="px-2 text-xs text-gray-600">
                  {currentPage}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ✅ fetchExamResultsByGrade - إحصائيات الصف */}
          {gradeStats && gradeStats.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setShowGradeStats(!showGradeStats)}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition"
              >
                <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#009966]" />
                  نتائج امتحانات الصف ({gradeStats.length})
                </h3>
                {showGradeStats ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {showGradeStats && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="overflow-x-auto border-t border-gray-100">
                      <table className="w-full min-w-125">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                              الامتحان
                            </th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                              التاريخ
                            </th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                              الطلاب
                            </th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                              المتوسط
                            </th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                              الأعلى
                            </th>
                            <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                              الأدنى
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {gradeStats.map((stat, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-2.5 px-3 text-xs sm:text-sm font-medium">
                                {stat.exam_title || stat.title || "-"}
                              </td>
                              <td className="py-2.5 px-3 text-xs sm:text-sm">
                                {new Date(stat.exam_date).toLocaleDateString(
                                  "ar-EG",
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-xs sm:text-sm">
                                {stat.students_count || "-"}
                              </td>
                              <td className="py-2.5 px-3 text-xs sm:text-sm font-bold">
                                {toNumber(stat.average_degree)}
                              </td>
                              <td className="py-2.5 px-3 text-xs sm:text-sm font-bold text-green-600">
                                {toNumber(stat.highest_degree)}
                              </td>
                              <td className="py-2.5 px-3 text-xs sm:text-sm font-bold text-red-600">
                                {toNumber(stat.lowest_degree)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ✅ fetchGradeExamResultsStats - إحصائيات إضافية للصف */}
          {gradeResultStats && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setShowGradeResultStats(!showGradeResultStats)}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition"
              >
                <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <Target size={18} className="text-blue-600" />
                  إحصائيات الصف الشاملة
                </h3>
                {showGradeResultStats ? (
                  <ChevronUp size={18} className="text-gray-400" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {showGradeResultStats && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-100">
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <Percent
                          size={16}
                          className="text-blue-600 mx-auto mb-1"
                        />
                        <span className="text-base sm:text-xl font-bold text-blue-700 block">
                          {toNumber(gradeResultStats.overall_average)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-blue-600">
                          المتوسط العام
                        </span>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <Award
                          size={16}
                          className="text-green-600 mx-auto mb-1"
                        />
                        <span className="text-base sm:text-xl font-bold text-green-700 block">
                          {toNumber(gradeResultStats.highest_degree)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-green-600">
                          أعلى درجة
                        </span>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 text-center">
                        <Minus
                          size={16}
                          className="text-red-600 mx-auto mb-1"
                        />
                        <span className="text-base sm:text-xl font-bold text-red-700 block">
                          {toNumber(gradeResultStats.lowest_degree)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-red-600">
                          أدنى درجة
                        </span>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <FileText
                          size={16}
                          className="text-purple-600 mx-auto mb-1"
                        />
                        <span className="text-base sm:text-xl font-bold text-purple-700 block">
                          {toNumber(gradeResultStats.total_exams)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-purple-600">
                          إجمالي الامتحانات
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </motion.section>
  );
};

export default ExamResults;
