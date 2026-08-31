import {
  Play,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  CalendarClock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Monitor,
  BarChart3,
  Calendar,
  ChevronDown,
} from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAvailableExams,
  fetchExamHistory,
  fetchPaperExams,
  fetchExamResults,
  checkExamAttempt,
} from "../api/student/actions";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const PAGE_SIZE = 10;

const Exams = () => {
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [historyExams, setHistoryExams] = useState([]);
  const [paperExams, setPaperExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("online");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [startingExam, setStartingExam] = useState(null);

  // Pagination states
  const [historyPage, setHistoryPage] = useState(1);
  const [resultsPage, setResultsPage] = useState(1);
  const [paperPage, setPaperPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [hasMorePaper, setHasMorePaper] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [availableRes, historyRes, paperRes, resultsRes] =
        await Promise.all([
          fetchAvailableExams(1),
          fetchExamHistory("", 1),
          fetchPaperExams("", 1),
          fetchExamResults("", 1),
        ]);

      if (availableRes.success) {
        setAvailableExams(availableRes.data || []);
      }
      if (historyRes.success) {
        setHistoryExams(historyRes.data || []);
        setHasMoreHistory((historyRes.data || []).length >= PAGE_SIZE);
      }
      if (paperRes.success) {
        setPaperExams(paperRes.data || []);
        setHasMorePaper((paperRes.data || []).length >= PAGE_SIZE);
      }
      if (resultsRes.success) {
        setExamResults(resultsRes.data || []);
        setHasMoreResults((resultsRes.data || []).length >= PAGE_SIZE);
      }
    } catch (err) {
      console.error("Exams load error:", err);
      setError("فشل تحميل البيانات، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setHistoryPage(1);
    setResultsPage(1);
    setPaperPage(1);
    await loadData();
    setRefreshing(false);
  };

  // Load more history
  const loadMoreHistory = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = historyPage + 1;
    const response = await fetchExamHistory("", nextPage);
    if (response.success) {
      const newData = response.data || [];
      setHistoryExams((prev) => [...prev, ...newData]);
      setHistoryPage(nextPage);
      setHasMoreHistory(newData.length >= PAGE_SIZE);
    }
    setLoadingMore(false);
  };

  // Load more results
  const loadMoreResults = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = resultsPage + 1;
    const response = await fetchExamResults("", nextPage);
    if (response.success) {
      const newData = response.data || [];
      setExamResults((prev) => [...prev, ...newData]);
      setResultsPage(nextPage);
      setHasMoreResults(newData.length >= PAGE_SIZE);
    }
    setLoadingMore(false);
  };

  // Load more paper exams
  const loadMorePaper = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = paperPage + 1;
    const response = await fetchPaperExams("", nextPage);
    if (response.success) {
      const newData = response.data || [];
      setPaperExams((prev) => [...prev, ...newData]);
      setPaperPage(nextPage);
      setHasMorePaper(newData.length >= PAGE_SIZE);
    }
    setLoadingMore(false);
  };

  const stats = useMemo(() => {
    const totalExams = historyExams.length;
    const passedExams = historyExams.filter(
      (exam) => exam.result_status === "passed",
    ).length;
    const completedExams = historyExams.filter(
      (exam) => exam.score !== null && exam.score !== undefined,
    );
    const avgScore =
      completedExams.length > 0
        ? Math.round(
            completedExams.reduce(
              (sum, exam) => sum + (parseFloat(exam.percentage) || 0),
              0,
            ) / completedExams.length,
          )
        : 0;
    const bestScore =
      completedExams.length > 0
        ? Math.max(
            ...completedExams.map((exam) => parseFloat(exam.percentage) || 0),
          )
        : 0;

    return { totalExams, passedExams, avgScore, bestScore };
  }, [historyExams]);

  const handleStartExam = async (exam) => {
    if (startingExam) return;

    const now = Date.now();
    const startTime = new Date(exam.start_at).getTime();
    const endTime = new Date(exam.end_at).getTime();

    if (now > endTime) {
      setMessage({ type: "error", text: "عذراً، هذا الامتحان انتهى وقته" });
      loadData();
      return;
    }

    if (now < startTime) {
      setMessage({ type: "error", text: "عذراً، هذا الامتحان لم يبدأ بعد" });
      return;
    }

    setStartingExam(exam.exam_id);

    try {
      const checkResult = await checkExamAttempt(exam.exam_id);
      if (checkResult.success && checkResult.data?.has_active_attempt) {
        setMessage({ type: "error", text: "لقد بدأت هذا الامتحان بالفعل" });
        return;
      }
      if (checkResult.success && checkResult.data?.submitted) {
        setMessage({
          type: "error",
          text: "لقد قمت بحل هذا الامتحان من قبل",
        });
        loadData();
        return;
      }

      navigate(`/student/exams/${exam.exam_id}`);
    } catch (err) {
      setMessage({ type: "error", text: "حدث خطأ، حاول مرة أخرى" });
    } finally {
      setStartingExam(null);
    }
  };

  const getExamStatus = useCallback((exam) => {
    const now = Date.now();
    const startTime = new Date(exam.start_at).getTime();
    const endTime = new Date(exam.end_at).getTime();

    if (now > endTime)
      return { label: "منتهي", color: "text-red-500", bg: "bg-red-50" };
    if (now < startTime)
      return {
        label: "قادم",
        color: "text-yellow-500",
        bg: "bg-yellow-50",
      };
    return { label: "متاح الآن", color: "text-green-500", bg: "bg-green-50" };
  }, []);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الامتحانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            الامتحانات
          </h1>
          <span className="text-xs sm:text-sm text-gray-500">
            الامتحانات الإلكترونية والورقية وسجل الدرجات
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

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <AlertCircle size={16} />
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="mr-auto text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
      >
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
              الامتحانات الإلكترونية
            </span>
            <FileText size={14} className="text-blue-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-gray-900">
            {stats.totalExams}
          </span>
        </div>

        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
              الامتحانات الناجحة
            </span>
            <CheckCircle2 size={14} className="text-green-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-green-600">
            {stats.passedExams}
          </span>
        </div>

        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
              متوسط الدرجات
            </span>
            <TrendingUp size={14} className="text-purple-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-gray-900">
            {stats.avgScore}%
          </span>
        </div>

        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
              أفضل نتيجة
            </span>
            <Award size={14} className="text-yellow-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-yellow-600">
            {stats.bestScore}%
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 w-full overflow-x-auto"
      >
        <button
          onClick={() => setActiveTab("online")}
          className={`flex-1 px-3 sm:px-5 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === "online"
              ? "bg-[#009966] text-white shadow"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Monitor size={14} />
          الإلكترونية
        </button>
        <button
          onClick={() => setActiveTab("paper")}
          className={`flex-1 px-3 sm:px-5 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === "paper"
              ? "bg-[#009966] text-white shadow"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText size={14} />
          الورقية
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`flex-1 px-3 sm:px-5 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === "results"
              ? "bg-[#009966] text-white shadow"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BarChart3 size={14} />
          النتائج
        </button>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Online Exams Tab */}
        {activeTab === "online" && (
          <motion.div
            key="online"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3 sm:gap-4"
          >
            {/* Available Exams */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
                <CalendarClock size={16} className="text-blue-500" />
                امتحانات متاحة الآن
              </h2>

              {availableExams.filter(
                (e) => getExamStatus(e).label === "متاح الآن",
              ).length === 0 ? (
                <p className="text-gray-400 text-xs sm:text-sm text-center py-8">
                  لا توجد امتحانات متاحة حالياً
                </p>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3">
                  {availableExams
                    .filter((e) => getExamStatus(e).label === "متاح الآن")
                    .map((exam) => {
                      const isStarting = startingExam === exam.exam_id;
                      return (
                        <motion.div
                          key={exam.exam_id}
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:border-green-200 hover:shadow-sm transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm">
                                {exam.title || exam.exam_title}
                              </span>
                              <span className="text-[10px] sm:text-xs font-medium text-green-600">
                                • متاح الآن
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {exam.duration_minutes} دقيقة
                              </span>
                              <span className="flex items-center gap-1">
                                <BarChart3 size={11} />
                                {exam.full_mark} درجة
                              </span>
                              {exam.questions_count && (
                                <span className="flex items-center gap-1">
                                  <FileText size={11} />
                                  {exam.questions_count} سؤال
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartExam(exam)}
                            disabled={isStarting}
                            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 justify-center transition-colors shrink-0 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isStarting ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                جاري التحقق...
                              </>
                            ) : (
                              <>
                                <Play size={13} />
                                ابدأ الآن
                              </>
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Upcoming & Ended Exams */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
                <FileText size={16} className="text-yellow-500" />
                قادمة ومنتهية
              </h2>

              {availableExams.filter(
                (e) => getExamStatus(e).label !== "متاح الآن",
              ).length === 0 ? (
                <p className="text-gray-400 text-xs sm:text-sm text-center py-8">
                  لا توجد امتحانات
                </p>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3">
                  {availableExams
                    .filter((e) => getExamStatus(e).label !== "متاح الآن")
                    .map((exam) => {
                      const status = getExamStatus(exam);
                      return (
                        <motion.div
                          key={exam.exam_id}
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:border-green-200 hover:shadow-sm transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm">
                                {exam.title || exam.exam_title}
                              </span>
                              <span
                                className={`text-[10px] sm:text-xs font-medium ${status.color}`}
                              >
                                • {status.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {exam.duration_minutes} دقيقة
                              </span>
                              <span className="flex items-center gap-1">
                                <BarChart3 size={11} />
                                {exam.full_mark} درجة
                              </span>
                            </div>
                          </div>

                          <button
                            disabled
                            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 justify-center transition-colors shrink-0 bg-gray-100 text-gray-400 cursor-not-allowed"
                          >
                            {status.label}
                          </button>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Exam History with Pagination */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
                <FileText size={16} className="text-green-500" />
                سجل الامتحانات ({historyExams.length})
              </h2>

              {historyExams.length === 0 ? (
                <p className="text-gray-400 text-xs sm:text-sm text-center py-8">
                  لا يوجد سجل امتحانات بعد
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {historyExams.map((exam) => {
                    const isPending =
                      exam.score === null || exam.score === undefined;
                    const isPassed = exam.result_status === "passed";
                    const percentage = parseFloat(exam.percentage) || 0;

                    return (
                      <motion.div
                        key={exam.attempt_id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:border-green-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs sm:text-sm block truncate">
                            {exam.exam_title}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar size={11} />
                            {exam.submitted_at
                              ? new Date(exam.submitted_at).toLocaleDateString(
                                  "ar-EG",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )
                              : "غير محدد"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          {isPending ? (
                            <span className="text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 flex items-center gap-1">
                              <Loader2 size={12} className="animate-spin" />
                              لم يتم التصحيح
                            </span>
                          ) : (
                            <>
                              <span
                                className={`font-bold text-xs sm:text-sm ${
                                  isPassed ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {exam.score}/{exam.full_mark}
                              </span>
                              <span
                                className={`text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1 ${
                                  isPassed
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {isPassed ? (
                                  <CheckCircle2 size={13} />
                                ) : (
                                  <XCircle size={13} />
                                )}
                                {percentage}%
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Load More Button */}
                  {hasMoreHistory && (
                    <button
                      onClick={loadMoreHistory}
                      disabled={loadingMore}
                      className="w-full py-2.5 mt-2 rounded-lg text-sm font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          جاري التحميل...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          عرض المزيد
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Paper Exams Tab */}
        {activeTab === "paper" && (
          <motion.div
            key="paper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
          >
            <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              الامتحانات الورقية ({paperExams.length})
            </h2>

            {paperExams.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm text-center py-8">
                لا توجد امتحانات ورقية
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {paperExams.map((exam) => (
                  <motion.div
                    key={exam.exam_id || exam.id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:border-green-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs sm:text-sm block truncate">
                        {exam.title || exam.exam_title}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(exam.exam_date).toLocaleDateString("ar-EG")}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 size={11} />
                          {exam.total_degree} درجة
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {exam.student_degree !== null &&
                      exam.student_degree !== undefined ? (
                        <>
                          <span className="font-bold text-xs sm:text-sm text-gray-900">
                            {exam.student_degree}/{exam.total_degree}
                          </span>
                          <span
                            className={`text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full ${
                              exam.exam_status === "attended"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {exam.exam_status === "attended" ? "حضر" : "غائب"}
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-gray-400">
                          لم يعقد بعد
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Load More Button */}
                {hasMorePaper && (
                  <button
                    onClick={loadMorePaper}
                    disabled={loadingMore}
                    className="w-full py-2.5 mt-2 rounded-lg text-sm font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        عرض المزيد
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Results Tab with Pagination */}
        {activeTab === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
          >
            <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-500" />
              نتائج الامتحانات ({examResults.length})
            </h2>

            {examResults.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm text-center py-8">
                لا توجد نتائج
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {examResults.map((result, index) => (
                  <motion.div
                    key={`${result.exam_type}-${result.result_id || index}`}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:border-green-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm block truncate">
                          {result.exam_title}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${
                            result.exam_type === "online"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {result.exam_type === "online" ? "إلكتروني" : "ورقي"}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={11} />
                        {new Date(result.exam_date).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        {result.score}/{result.full_mark}
                      </span>
                      <span className="text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">
                        {result.percentage}%
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Load More Button */}
                {hasMoreResults && (
                  <button
                    onClick={loadMoreResults}
                    disabled={loadingMore}
                    className="w-full py-2.5 mt-2 rounded-lg text-sm font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        عرض المزيد
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Exams;
