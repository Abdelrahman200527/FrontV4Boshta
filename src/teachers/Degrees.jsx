import {
  FileText,
  Monitor,
  ArrowRight,
  GraduationCap,
  Search,
  X,
  Clock,
  Calendar,
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllExams,
  fetchExamsByGrade,
  fetchOnlineExamsByGrade,
  fetchStudentFilters,
} from "../api/teacher/actions";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Degrees = () => {
  const navigate = useNavigate();
  const [paperExams, setPaperExams] = useState([]);
  const [onlineExams, setOnlineExams] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("paper");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [examsResult, filtersResult] = await Promise.all([
        fetchAllExams(),
        fetchStudentFilters(),
      ]);

      if (examsResult.success) {
        setPaperExams(examsResult.data.paperExams || []);
        setOnlineExams(examsResult.data.onlineExams || []);
      } else {
        setError(examsResult.error || "فشل تحميل الامتحانات");
      }

      if (filtersResult.success) {
        setGrades(filtersResult.data.grades || []);
      }
    } catch (err) {
      console.error("Error loading exams:", err);
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

  const handleGradeFilter = async (grade) => {
    setSelectedGrade(grade);
    if (grade === "all") {
      const result = await fetchAllExams();
      if (result.success) {
        setPaperExams(result.data.paperExams || []);
        setOnlineExams(result.data.onlineExams || []);
      }
    } else {
      setLoading(true);
      const [paperResult, onlineResult] = await Promise.all([
        fetchExamsByGrade(grade),
        fetchOnlineExamsByGrade(grade),
      ]);
      if (paperResult.success) setPaperExams(paperResult.data || []);
      if (onlineResult.success) setOnlineExams(onlineResult.data || []);
      setLoading(false);
    }
  };

  const getExamStatus = useCallback((exam, type) => {
    const now = new Date();

    if (type === "paper") {
      const examDate = new Date(exam.exam_date);
      if (examDate > now) {
        return {
          label: "لم يبدأ بعد",
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          dotColor: "bg-yellow-500",
          icon: Clock,
        };
      }
      return {
        label: "منتهي",
        color: "bg-gray-50 text-gray-600 border-gray-200",
        dotColor: "bg-gray-400",
        icon: CheckCircle2,
      };
    }

    const startAt = new Date(exam.start_at);
    const endAt = new Date(exam.end_at);

    if (now < startAt) {
      return {
        label: "لم يبدأ بعد",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        dotColor: "bg-yellow-500",
        icon: Clock,
      };
    }
    if (now > endAt) {
      return {
        label: "منتهي",
        color: "bg-gray-50 text-gray-600 border-gray-200",
        dotColor: "bg-gray-400",
        icon: CheckCircle2,
      };
    }
    return {
      label: "جاري الآن",
      color: "bg-green-50 text-green-700 border-green-200",
      dotColor: "bg-green-500",
      icon: AlertCircle,
    };
  }, []);

  const filteredPaper = useMemo(
    () =>
      paperExams.filter(
        (exam) =>
          searchQuery.trim() === "" ||
          exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.grade_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [paperExams, searchQuery],
  );

  const filteredOnline = useMemo(
    () =>
      onlineExams.filter(
        (exam) =>
          searchQuery.trim() === "" ||
          exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exam.grade_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [onlineExams, searchQuery],
  );

  const handleRetry = () => {
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الامتحانات...</p>
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
            onClick={handleRetry}
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
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="w-full flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              الدرجات والتقييمات
            </h1>
            <span className="text-xs sm:text-sm text-gray-500">
              متابعة درجات الطلاب في الامتحانات
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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex-1 sm:flex-none sm:w-80 focus-within:border-[#009966] transition">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث عن امتحان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:border-[#009966] transition"
          >
            <Filter size={14} />
            تصفية
            {showFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <label className="text-sm text-gray-600 mb-2 block">
                  الصف الدراسي
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => handleGradeFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:border-[#009966]"
                >
                  <option value="all">كل الصفوف</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 w-full"
      >
        <button
          onClick={() => setActiveTab("paper")}
          className={`flex-1 px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "paper"
              ? "bg-[#009966] text-white shadow"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText size={15} />
          <span>ورقي</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "paper" ? "bg-white/20" : "bg-gray-100"}`}
          >
            {filteredPaper.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("online")}
          className={`flex-1 px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "online"
              ? "bg-[#009966] text-white shadow"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Monitor size={15} />
          <span>إلكتروني</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "online" ? "bg-white/20" : "bg-gray-100"}`}
          >
            {filteredOnline.length}
          </span>
        </button>
      </motion.div>

      {/* Exams Grid */}
      <AnimatePresence mode="wait">
        {activeTab === "paper" ? (
          <motion.div
            key="paper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
          >
            {filteredPaper.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <FileText size={48} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">
                  {searchQuery || selectedGrade !== "all"
                    ? "لا توجد نتائج مطابقة"
                    : "لا توجد امتحانات ورقية"}
                </p>
              </div>
            ) : (
              filteredPaper.map((exam) => {
                const status = getExamStatus(exam, "paper");
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={exam.id}
                    whileHover={{
                      y: -3,
                      shadow: "0 10px 25px rgba(0,0,0,0.08)",
                    }}
                    onClick={() => navigate(`/teacher/exams/paper/${exam.id}`)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#009966] transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-blue-50 rounded-xl p-2.5 group-hover:bg-blue-100 transition">
                        <FileText size={20} className="text-blue-500" />
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-gray-300 group-hover:text-[#009966] transition"
                      />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-2">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-3">
                      <span className="flex items-center gap-1">
                        <GraduationCap size={13} />
                        {exam.grade_name || "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 size={13} />
                        {exam.total_degree || "-"} درجة
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(exam.exam_date).toLocaleDateString("ar-EG")}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}
                        />
                        {status.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            key="online"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
          >
            {filteredOnline.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <Monitor size={48} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">
                  {searchQuery || selectedGrade !== "all"
                    ? "لا توجد نتائج مطابقة"
                    : "لا توجد امتحانات إلكترونية"}
                </p>
              </div>
            ) : (
              filteredOnline.map((exam) => {
                const status = getExamStatus(exam, "online");
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={exam.id}
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(`/teacher/exams/online/${exam.id}`)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#009966] transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-purple-50 rounded-xl p-2.5 group-hover:bg-purple-100 transition">
                        <Monitor size={20} className="text-purple-500" />
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-gray-300 group-hover:text-[#009966] transition"
                      />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-2">
                      {exam.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-3">
                      <span className="flex items-center gap-1">
                        <GraduationCap size={13} />
                        {exam.grade_name || "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 size={13} />
                        {exam.full_mark || "-"} درجة
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {exam.duration_minutes || "-"} دقيقة
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}
                        />
                        {status.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Degrees;
