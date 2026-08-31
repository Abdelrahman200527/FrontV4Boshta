import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  FileText,
  Monitor,
  CalendarDays,
  TrendingUp,
  Target,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchStudentStats,
  fetchPaperExams,
  fetchExamResults,
} from "../api/student/actions";

const toNumber = (value) => {
  const num = parseFloat(value);
  return Number.isNaN(num) ? 0 : num;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getGrade = (percentage, graded) => {
  if (!graded)
    return {
      label: "لم تُرصد",
      text: "text-gray-600",
      bg: "bg-gray-100",
      bar: "#9ca3af",
    };
  if (percentage >= 85)
    return { label: "ممتاز", text: "text-green-700", bg: "bg-green-100", bar: "#16a34a" };
  if (percentage >= 75)
    return { label: "جيد جداً", text: "text-blue-700", bg: "bg-blue-100", bar: "#3b82f6" };
  if (percentage >= 65)
    return { label: "جيد", text: "text-purple-700", bg: "bg-purple-100", bar: "#9224EB" };
  if (percentage >= 50)
    return { label: "مقبول", text: "text-orange-700", bg: "bg-orange-100", bar: "#f59e0b" };
  return { label: "راسب", text: "text-red-700", bg: "bg-red-100", bar: "#dc2626" };
};

const Degrees = () => {
  const [stats, setStats] = useState(null);
  const [paperExams, setPaperExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, paperRes, resultsRes] = await Promise.all([
        fetchStudentStats(),
        fetchPaperExams(),
        fetchExamResults(),
      ]);

      if (statsRes?.success) setStats(statsRes.data || null);
      if (paperRes?.success) setPaperExams(paperRes.data || []);
      if (resultsRes?.success) setExamResults(resultsRes.data || []);
    } catch (err) {
      console.error("Degrees load error:", err);
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // نتائج (ورقي + إلكتروني) موحّدة
  const resultExams = useMemo(
    () =>
      (examResults || []).map((r) => {
        const score = toNumber(r.score);
        const total = toNumber(r.full_mark);
        const percentage =
          r.percentage != null
            ? Math.round(toNumber(r.percentage))
            : total > 0
              ? Math.round((score / total) * 100)
              : 0;
        return {
          key: `result-${r.exam_type}-${r.result_id}`,
          type: r.exam_type === "online" ? "online" : "paper",
          title: r.exam_title,
          date: r.exam_date,
          score,
          total,
          percentage,
          graded: true,
          status: r.result_status,
        };
      }),
    [examResults],
  );

  // امتحانات ورقية من غير درجة مرصودة (غياب/لسه) ومش موجودة في النتائج
  const pendingPaperExams = useMemo(() => {
    const gradedTitles = new Set(
      resultExams.filter((e) => e.type === "paper").map((e) => `${e.title}|${e.date}`),
    );
    return (paperExams || [])
      .filter(
        (e) =>
          e.student_degree == null ||
          !gradedTitles.has(`${e.exam_title}|${e.exam_date}`),
      )
      .filter((e) => e.student_degree == null)
      .map((e) => ({
        key: `paper-${e.exam_id}`,
        type: "paper",
        title: e.exam_title,
        date: e.exam_date,
        score: null,
        total: toNumber(e.total_degree),
        percentage: 0,
        graded: false,
        status: e.exam_status,
      }));
  }, [paperExams, resultExams]);

  const allExams = useMemo(
    () =>
      [...resultExams, ...pendingPaperExams].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    [resultExams, pendingPaperExams],
  );

  const filteredExams = useMemo(
    () =>
      allExams.filter((exam) => {
        if (activeTab === "paper") return exam.type === "paper";
        if (activeTab === "online") return exam.type === "online";
        return true;
      }),
    [allExams, activeTab],
  );

  const gradedExams = useMemo(() => allExams.filter((e) => e.graded), [allExams]);

  const highestScore = useMemo(
    () =>
      gradedExams.length > 0
        ? Math.max(...gradedExams.map((e) => e.percentage))
        : 0,
    [gradedExams],
  );

  const avgScore = useMemo(() => {
    if (gradedExams.length > 0) {
      const sum = gradedExams.reduce((acc, e) => acc + e.percentage, 0);
      return Math.round(sum / gradedExams.length);
    }
    const paper = toNumber(stats?.avg_paper_degree);
    const online = toNumber(stats?.avg_online_score);
    const values = [paper, online].filter((v) => v > 0);
    return values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  }, [gradedExams, stats]);

  const totalExamsCount = allExams.length;
  const paperExamsCount = useMemo(
    () => allExams.filter((e) => e.type === "paper").length,
    [allExams],
  );
  const onlineExamsCount = useMemo(
    () => allExams.filter((e) => e.type === "online").length,
    [allExams],
  );

  const performanceData = useMemo(
    () =>
      [...gradedExams]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((exam, idx) => ({
          name: `اختبار ${idx + 1}`,
          percentage: exam.percentage,
        })),
    [gradedExams],
  );

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الدرجات...</p>
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
            الدرجات والتقييمات
          </h1>
          <span className="text-sm sm:text-base text-gray-500">متابعة درجاتي</span>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          تحديث
        </button>
      </motion.header>

      {/* Summary Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3"
      >
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Target className="text-blue-600" size={20} />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xl sm:text-3xl block text-gray-900">
              {avgScore}%
            </span>
            <span className="text-[10px] sm:text-sm text-gray-500">متوسط الدرجات</span>
          </div>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xl sm:text-3xl block text-gray-900">
              {highestScore}%
            </span>
            <span className="text-[10px] sm:text-sm text-gray-500">أعلى درجة</span>
          </div>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <BarChart3 className="text-purple-600" size={20} />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xl sm:text-3xl block text-gray-900">
              {totalExamsCount}
            </span>
            <span className="text-[10px] sm:text-sm text-gray-500">
              إجمالي الامتحانات
            </span>
          </div>
        </div>
      </motion.div>

      {/* Performance Chart */}
      {performanceData.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5"
        >
          <h2 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">تطور الأداء</h2>
          <div className="h-45 sm:h-55">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={30} />
                <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 border-b border-gray-200 bg-white rounded-t-xl px-2 overflow-x-auto custom-scrollbar"
      >
        {[
          { id: "all", label: `الكل (${totalExamsCount})` },
          { id: "paper", label: `ورقي (${paperExamsCount})` },
          { id: "online", label: `إلكتروني (${onlineExamsCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Exam Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col gap-2.5"
        >
          {filteredExams.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10 text-center">
              <FileText size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">لا توجد امتحانات</p>
            </div>
          ) : (
            filteredExams.map((exam, idx) => {
              const grade = getGrade(exam.percentage, exam.graded);

              return (
                <motion.div
                  key={exam.key}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ${
                          exam.type === "paper" ? "bg-orange-50" : "bg-purple-50"
                        }`}
                      >
                        {exam.type === "paper" ? (
                          <FileText className="text-orange-600" size={18} />
                        ) : (
                          <Monitor className="text-purple-600" size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm block truncate">
                          {exam.title}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <CalendarDays size={11} />
                          {formatDate(exam.date)}
                          {exam.status === "absent" && (
                            <span className="text-red-500 font-bold">• غياب</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="text-center">
                        <span className="font-bold text-base sm:text-lg text-gray-900 block">
                          {exam.graded ? `${exam.score}/${exam.total}` : `—/${exam.total}`}
                        </span>
                        <span className="text-[10px] text-gray-500">الدرجة</span>
                      </div>
                      <div className="text-center">
                        <span
                          className="font-bold text-base sm:text-lg block"
                          style={{ color: grade.bar }}
                        >
                          {exam.graded ? `${exam.percentage}%` : "—"}
                        </span>
                        <span className="text-[10px] text-gray-500">النسبة</span>
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${grade.bg} ${grade.text} whitespace-nowrap`}
                      >
                        {grade.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 sm:mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${exam.graded ? exam.percentage : 0}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: grade.bar }}
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
};

export default Degrees;
