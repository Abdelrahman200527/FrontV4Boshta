import {
  FileText,
  Search,
  X,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  GraduationCap,
  Eye,
  Download,
  Users,
  ArrowRight,
  BarChart3,
  Layers,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllHomework,
  fetchAssignmentsByGrade,
  fetchAssignmentDetails,
  fetchStudentFilters,
} from "../api/teacher/actions";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Homeworks = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [homeworkResult, filtersResult] = await Promise.all([
        fetchAllHomework(),
        fetchStudentFilters(),
      ]);

      if (homeworkResult.success) {
        setAssignments(homeworkResult.data || []);
      } else {
        setError(homeworkResult.error || "فشل تحميل الواجبات");
      }

      if (filtersResult.success) {
        setGrades(filtersResult.data.grades || []);
      }
    } catch (err) {
      console.error("Error loading homework:", err);
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
      const result = await fetchAllHomework();
      if (result.success) setAssignments(result.data || []);
    } else {
      setLoading(true);
      const result = await fetchAssignmentsByGrade(grade);
      if (result.success) setAssignments(result.data || []);
      setLoading(false);
    }
  };

  const handleViewDetails = async (assignment) => {
    setSelectedAssignment(assignment);
    setDetailsLoading(true);
    const result = await fetchAssignmentDetails(assignment.id);
    if (result.success) {
      setAssignmentDetails(result.data);
    }
    setDetailsLoading(false);
  };

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }, []);

  const getStatusBadge = useCallback((assignment) => {
    if (assignment.is_closed === 1) {
      return { text: "مغلق", bg: "bg-gray-100 text-gray-600", icon: XCircle };
    }
    if (assignment.deadline && new Date(assignment.deadline) < new Date()) {
      return {
        text: "منتهي",
        bg: "bg-red-100 text-red-600",
        icon: AlertCircle,
      };
    }
    return {
      text: "مفتوح",
      bg: "bg-green-100 text-green-600",
      icon: CheckCircle2,
    };
  }, []);

  const filteredAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          searchQuery.trim() === "" ||
          assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assignment.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          assignment.grade_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [assignments, searchQuery],
  );

  const openAssignments = useMemo(
    () => filteredAssignments.filter((a) => getStatusBadge(a).text === "مفتوح"),
    [filteredAssignments, getStatusBadge],
  );

  const closedAssignments = useMemo(
    () => filteredAssignments.filter((a) => getStatusBadge(a).text === "مغلق"),
    [filteredAssignments, getStatusBadge],
  );

  const expiredAssignments = useMemo(
    () => filteredAssignments.filter((a) => getStatusBadge(a).text === "منتهي"),
    [filteredAssignments, getStatusBadge],
  );

  const handleRetry = () => {
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الواجبات...</p>
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
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5 bg-gray-50"
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
              الواجبات المنزلية
            </h1>
            <span className="text-sm sm:text-base text-gray-500">
              متابعة وإدارة الواجبات ({assignments.length})
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
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex-1 sm:flex-none sm:w-80">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث عن واجب..."
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
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:border-[#009966] transition"
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
              <div className="bg-white border border-gray-200 rounded-lg p-3">
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

      {/* Stats Summary */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        <div className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm">
          <div className="bg-green-50 rounded-lg p-2 w-fit mx-auto mb-2">
            <CheckCircle2 size={18} className="text-green-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-green-700 block">
            {openAssignments.length}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">مفتوح</span>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm">
          <div className="bg-red-50 rounded-lg p-2 w-fit mx-auto mb-2">
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-red-700 block">
            {expiredAssignments.length}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">منتهي</span>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm">
          <div className="bg-gray-50 rounded-lg p-2 w-fit mx-auto mb-2">
            <XCircle size={18} className="text-gray-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-gray-700 block">
            {closedAssignments.length}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">مغلق</span>
        </div>
      </motion.div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200"
        >
          <FileText size={48} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm">
            {searchQuery || selectedGrade !== "all"
              ? "لا توجد نتائج مطابقة"
              : "لا توجد واجبات"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 w-full"
        >
          {filteredAssignments.map((assignment) => {
            const status = getStatusBadge(assignment);
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={assignment.id}
                whileHover={{
                  y: -3,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                }}
                className="bg-white w-full flex flex-col gap-3 rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm hover:border-[#009966] transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="bg-blue-50 rounded-lg p-2 shrink-0">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {assignment.title}
                      </h3>
                      <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <GraduationCap size={11} />
                        {assignment.grade_name || "-"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shrink-0 ${status.bg}`}
                  >
                    <StatusIcon size={10} />
                    {status.text}
                  </span>
                </div>

                {/* Description */}
                {assignment.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                {/* Info */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(assignment.deadline)}
                  </span>
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <BarChart3 size={12} />
                    {assignment.full_mark} درجة
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleViewDetails(assignment)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#009966] transition-colors py-2 rounded-lg hover:bg-green-50"
                  >
                    <Eye size={13} />
                    التفاصيل
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/teacher/assignments/${assignment.id}`)
                    }
                    className="flex-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#009966] transition-colors py-2 rounded-lg hover:bg-green-50"
                  >
                    <ArrowRight size={13} />
                    فتح
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Assignment Details Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
            onClick={() => {
              setSelectedAssignment(null);
              setAssignmentDetails(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-base sm:text-lg text-gray-900">
                  تفاصيل الواجب
                </h3>
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setAssignmentDetails(null);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {detailsLoading ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    جاري التحميل...
                  </div>
                ) : assignmentDetails ? (
                  <div className="flex flex-col gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-500 block mb-1">
                        العنوان
                      </span>
                      <span className="font-bold text-sm text-gray-900">
                        {assignmentDetails.assignment?.title ||
                          selectedAssignment.title}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-500 block mb-1">
                        الوصف
                      </span>
                      <span className="text-sm text-gray-700">
                        {assignmentDetails.assignment?.description ||
                          selectedAssignment.description ||
                          "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <span className="text-xs text-gray-500 block mb-1">
                          الدرجة الكلية
                        </span>
                        <span className="font-bold text-sm text-gray-900">
                          {assignmentDetails.assignment?.full_mark ||
                            selectedAssignment.full_mark}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <span className="text-xs text-gray-500 block mb-1">
                          التسليمات
                        </span>
                        <span className="font-bold text-sm text-gray-900">
                          {assignmentDetails.submissions?.length || 0}
                        </span>
                      </div>
                    </div>
                    {assignmentDetails.stats && (
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <span className="text-xs text-green-600 block mb-1">
                          متوسط الدرجات
                        </span>
                        <span className="font-bold text-base text-green-700">
                          {assignmentDetails.stats.average_score || 0}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
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

export default Homeworks;
