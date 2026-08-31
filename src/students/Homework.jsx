import {
  BookIcon,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  Download,
  Upload,
  Eye,
  Lock,
  Star,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  parseBackendDate,
  isDeadlineExpired,
  formatDate,
} from "../utils/dateUtils";
import {
  fetchAssignments,
  fetchAssignmentById,
  fetchSubmissions,
  submitStudentAssignment,
  updateStudentAssignment,
  downloadAssignmentFile,
} from "../api/student/actions";

const Homework = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        fetchAssignments(),
        fetchSubmissions(),
      ]);

      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.data || []);
      } else {
        setError(assignmentsRes.error || "فشل تحميل الواجبات");
      }

      if (submissionsRes.success) {
        setSubmissions(submissionsRes.data || []);
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

  const handleViewDetails = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    setAssignmentDetails(null);

    const result = await fetchAssignmentById(assignment.assignment_id);
    if (result.success) {
      setAssignmentDetails(result.data);
    }
    setDetailsLoading(false);
  };

  const handleViewResult = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowResultModal(true);
    setDetailsLoading(true);
    setAssignmentDetails(null);

    const result = await fetchAssignmentById(assignment.assignment_id);
    if (result.success) {
      setAssignmentDetails(result.data);
    }
    setDetailsLoading(false);
  };

  const handleSubmitAssignment = async () => {
    if (!uploadFile) {
      setUploadMessage({ type: "error", text: "يرجى اختيار ملف" });
      return;
    }

    setUploadLoading(true);
    setUploadMessage(null);

    const result = await submitStudentAssignment(
      selectedAssignment.assignment_id,
      uploadFile,
    );

    if (result.success) {
      setUploadMessage({ type: "success", text: "تم تسليم الواجب بنجاح" });
      setTimeout(async () => {
        setShowSubmitModal(false);
        setUploadFile(null);
        await loadData();
      }, 800);
    } else {
      setUploadMessage({ type: "error", text: result.error || "فشل التسليم" });
    }

    setUploadLoading(false);
  };

  const handleUpdateAssignment = async () => {
    if (!uploadFile) {
      setUploadMessage({ type: "error", text: "يرجى اختيار ملف" });
      return;
    }

    setUploadLoading(true);
    setUploadMessage(null);

    const result = await updateStudentAssignment(
      selectedAssignment.assignment_id,
      uploadFile,
    );

    if (result.success) {
      setUploadMessage({ type: "success", text: "تم تحديث التسليم بنجاح" });
      setTimeout(async () => {
        setShowSubmitModal(false);
        setUploadFile(null);
        await loadData();
      }, 800);
    } else {
      setUploadMessage({ type: "error", text: result.error || "فشل التحديث" });
    }

    setUploadLoading(false);
  };

  const handleDownload = async (assignment) => {
    const result = await downloadAssignmentFile(assignment.assignment_id);
    if (!result.success) {
      alert(result.error || "فشل التحميل");
    }
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setUploadFile(null);
    setUploadMessage(null);
    setShowSubmitModal(true);
  };

  const closeAllModals = () => {
    setSelectedAssignment(null);
    setAssignmentDetails(null);
    setShowDetailsModal(false);
    setShowResultModal(false);
    setShowSubmitModal(false);
    setUploadFile(null);
    setUploadMessage(null);
  };

  // ✅ دالة تحديد الحالة مع إصلاح مشكلة الوقت
  const getAssignmentStatus = useCallback((assignment) => {
    // استخدام isDeadlineExpired من dateUtils
    const isExpired = isDeadlineExpired(assignment.deadline);

    // 1. مغلق من المدرس
    if (assignment.is_closed === 1) {
      return {
        key: "closed",
        text: "مغلق",
        color: "bg-gray-100 text-gray-600",
        icon: Lock,
        badge: "bg-gray-100 text-gray-600",
      };
    }

    // 2. مصحح
    if (assignment.assignment_status === "graded") {
      return {
        key: "graded",
        text: "مصحح",
        color: "bg-blue-100 text-blue-700",
        icon: Star,
        badge: "bg-blue-100 text-blue-700",
      };
    }

    // 3. مسلم
    if (assignment.assignment_status === "submitted") {
      return {
        key: "submitted",
        text: "مسلم",
        color: "bg-green-100 text-green-700",
        icon: CheckCircle2,
        badge: "bg-green-100 text-green-700",
      };
    }

    // 4. متأخر
    if (isExpired) {
      return {
        key: "overdue",
        text: "متأخر",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
        badge: "bg-red-100 text-red-700",
      };
    }

    // 5. مطلوب
    return {
      key: "pending",
      text: "مطلوب",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock3,
      badge: "bg-yellow-100 text-yellow-700",
    };
  }, []);

  const categorizedAssignments = useMemo(() => {
    const pending = [];
    const submitted = [];
    const overdue = [];
    const closed = [];
    const graded = [];

    assignments.forEach((assignment) => {
      const status = getAssignmentStatus(assignment);

      switch (status.key) {
        case "pending":
          pending.push(assignment);
          break;
        case "submitted":
          submitted.push(assignment);
          break;
        case "graded":
          graded.push(assignment);
          submitted.push(assignment);
          break;
        case "overdue":
          overdue.push(assignment);
          break;
        case "closed":
          closed.push(assignment);
          break;
        default:
          break;
      }
    });

    return { pending, submitted, overdue, closed, graded };
  }, [assignments, getAssignmentStatus]);

  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (activeTab === "pending") {
      filtered = categorizedAssignments.pending;
    } else if (activeTab === "submitted") {
      filtered = categorizedAssignments.submitted;
    } else if (activeTab === "overdue") {
      filtered = categorizedAssignments.overdue;
    } else if (activeTab === "closed") {
      filtered = categorizedAssignments.closed;
    } else if (activeTab === "graded") {
      filtered = categorizedAssignments.graded;
    }

    return filtered;
  }, [assignments, searchQuery, activeTab, categorizedAssignments]);

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

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-full sm:w-80">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="بحث في الواجبات..."
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
      </motion.header>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
      >
        <button
          onClick={() => {
            setActiveTab("pending");
            setSearchQuery("");
          }}
          className={`bg-white w-full flex flex-col gap-1 items-center border-2 border-transparent rounded-2xl p-3 sm:p-4 shadow-sm transition-all ${
            activeTab === "pending"
              ? "border-[#3E7AFD] shadow-[5px_2px_0_#3E7AFD]"
              : "hover:border-[#3E7AFD]"
          }`}
        >
          <ClipboardList className="text-[#3E7AFD]" size={20} />
          <span className="text-lg sm:text-xl font-bold">
            {categorizedAssignments.pending.length}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-gray-600">
            مطلوبة
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("submitted");
            setSearchQuery("");
          }}
          className={`bg-white w-full flex flex-col gap-1 items-center border-2 border-transparent rounded-2xl p-3 sm:p-4 shadow-sm transition-all ${
            activeTab === "submitted"
              ? "border-[#009966] shadow-[5px_2px_0_#009966]"
              : "hover:border-[#009966]"
          }`}
        >
          <ClipboardCheck className="text-[#00A63E]" size={20} />
          <span className="text-lg sm:text-xl font-bold">
            {categorizedAssignments.submitted.length}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-gray-600">
            مسلمة
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("overdue");
            setSearchQuery("");
          }}
          className={`bg-white w-full flex flex-col gap-1 items-center border-2 border-transparent rounded-2xl p-3 sm:p-4 shadow-sm transition-all ${
            activeTab === "overdue"
              ? "border-[#E17100] shadow-[5px_2px_0_#E17100]"
              : "hover:border-[#E17100]"
          }`}
        >
          <Clock3 className="text-[#E17100]" size={20} />
          <span className="text-lg sm:text-xl font-bold">
            {categorizedAssignments.overdue.length}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-gray-600">
            متأخرة
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("closed");
            setSearchQuery("");
          }}
          className={`bg-white w-full flex flex-col gap-1 items-center border-2 border-transparent rounded-2xl p-3 sm:p-4 shadow-sm transition-all ${
            activeTab === "closed"
              ? "border-gray-400 shadow-[5px_2px_0_#9ca3af]"
              : "hover:border-gray-400"
          }`}
        >
          <Lock className="text-gray-500" size={20} />
          <span className="text-lg sm:text-xl font-bold">
            {categorizedAssignments.closed.length}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-gray-600">
            مغلقة
          </span>
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 border-b border-gray-200 overflow-x-auto custom-scrollbar"
      >
        <button
          onClick={() => {
            setActiveTab("all");
            setSearchQuery("");
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === "all" ? "border-[#009966] text-[#009966]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          الكل ({assignments.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("pending");
            setSearchQuery("");
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === "pending" ? "border-[#009966] text-[#009966]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          مطلوبة ({categorizedAssignments.pending.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("submitted");
            setSearchQuery("");
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === "submitted" ? "border-[#009966] text-[#009966]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          مسلمة ({categorizedAssignments.submitted.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("graded");
            setSearchQuery("");
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === "graded" ? "border-[#009966] text-[#009966]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          مصححة ({categorizedAssignments.graded.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("overdue");
            setSearchQuery("");
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === "overdue" ? "border-[#009966] text-[#009966]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          متأخرة ({categorizedAssignments.overdue.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("closed");
            setSearchQuery("");
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === "closed" ? "border-[#009966] text-[#009966]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          مغلقة ({categorizedAssignments.closed.length})
        </button>
      </motion.div>

      {/* Assignments List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + searchQuery}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col gap-2.5"
        >
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm">
                {searchQuery ? "لا توجد نتائج مطابقة" : "لا توجد واجبات"}
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const status = getAssignmentStatus(assignment);
              const StatusIcon = status.icon;
              const isClosed = status.key === "closed";
              const isGraded = status.key === "graded";
              const isSubmitted = status.key === "submitted";
              const isOverdue = status.key === "overdue";
              const isPending = status.key === "pending";

              return (
                <motion.div
                  key={assignment.assignment_id}
                  whileHover={{ scale: 1.005 }}
                  className={`bg-white border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${isClosed ? "border-gray-200 bg-gray-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${isClosed ? "bg-gray-100" : "bg-orange-50 border border-orange-200"}`}
                    >
                      <BookIcon
                        className={
                          isClosed ? "text-gray-400" : "text-[#ea580c]"
                        }
                        size={20}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                          {assignment.title}
                        </h3>
                        {isClosed && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Lock size={10} />
                            مغلق
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(assignment.deadline)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <ClipboardList size={11} />
                          {assignment.full_mark} درجة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${status.badge}`}
                    >
                      <StatusIcon size={11} />
                      {status.text}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleViewDetails(assignment)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        title="عرض التفاصيل"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => handleDownload(assignment)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="تحميل الملف"
                      >
                        <Download size={14} />
                      </button>

                      {isGraded && (
                        <button
                          onClick={() => handleViewResult(assignment)}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1"
                        >
                          <Star size={12} />
                          النتيجة
                        </button>
                      )}

                      {(isPending || isOverdue) && (
                        <button
                          onClick={() => openSubmitModal(assignment)}
                          className="bg-[#009966] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#007a52] transition flex items-center gap-1"
                        >
                          <Upload size={12} />
                          تسليم
                        </button>
                      )}

                      {isSubmitted && (
                        <button
                          onClick={() => openSubmitModal(assignment)}
                          className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 transition flex items-center gap-1"
                        >
                          <Upload size={12} />
                          تحديث
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* Submissions Summary */}
      {submissions.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
        >
          <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" />
            ملخص التسليمات ({submissions.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
            {submissions.map((submission, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2"
              >
                <span className="text-xs sm:text-sm font-medium truncate max-w-full sm:max-w-50">
                  {submission.assignment_title}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {submission.score !== null &&
                  submission.score !== undefined ? (
                    <span className="text-xs text-blue-600 font-bold">
                      {submission.score} / {submission.full_mark}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">غير مصحح</span>
                  )}
                  <span
                    className={`text-xs font-bold ${submission.submission_timing === "on_time" ? "text-green-600" : "text-red-600"}`}
                  >
                    {submission.submission_timing === "on_time"
                      ? "في الوقت"
                      : "متأخر"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
            onClick={closeAllModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="font-bold text-sm sm:text-base text-gray-900">
                  تفاصيل الواجب
                </h3>
                <button
                  onClick={closeAllModals}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 sm:p-5">
                {detailsLoading ? (
                  <p className="text-center text-gray-400 text-sm py-8">
                    جاري التحميل...
                  </p>
                ) : assignmentDetails ? (
                  <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-base sm:text-lg text-gray-900">
                      {assignmentDetails.title || selectedAssignment.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {assignmentDetails.description || "لا يوجد وصف"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <span className="text-[10px] text-gray-500 block">
                          الدرجة الكلية
                        </span>
                        <span className="font-bold text-sm">
                          {assignmentDetails.full_mark || "-"} درجة
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <span className="text-[10px] text-gray-500 block">
                          آخر موعد
                        </span>
                        <span className="font-bold text-sm">
                          {formatDate(assignmentDetails.deadline)}
                        </span>
                      </div>
                    </div>
                    {assignmentDetails.file_path && (
                      <button
                        onClick={() => handleDownload(assignmentDetails)}
                        className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline w-fit"
                      >
                        <Download size={14} />
                        تحميل ملف الواجب
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-sm py-8">
                    لا توجد بيانات
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {showResultModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
            onClick={closeAllModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm sm:text-base text-gray-900">
                  نتيجة الواجب
                </h3>
                <button
                  onClick={closeAllModals}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 sm:p-5">
                {detailsLoading ? (
                  <p className="text-center text-gray-400 text-sm py-8">
                    جاري التحميل...
                  </p>
                ) : assignmentDetails ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                      <Star size={28} className="text-blue-500" />
                    </div>
                    <h4 className="font-bold text-base text-gray-900">
                      {assignmentDetails.title}
                    </h4>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-[#009966] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((assignmentDetails.score || 0) / (assignmentDetails.full_mark || 1)) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-900">
                        {assignmentDetails.score || 0}
                      </span>
                      <span className="text-sm text-gray-400">/</span>
                      <span className="text-sm text-gray-500">
                        {assignmentDetails.full_mark}
                      </span>
                    </div>

                    <span className="text-sm font-bold text-[#009966]">
                      {Math.round(
                        ((assignmentDetails.score || 0) /
                          (assignmentDetails.full_mark || 1)) *
                          100,
                      )}
                      %
                    </span>

                    {assignmentDetails.feedback && (
                      <div className="bg-gray-50 rounded-lg p-3 w-full text-right">
                        <span className="text-xs text-gray-500 block mb-1">
                          ملاحظات المدرس:
                        </span>
                        <p className="text-sm text-gray-700">
                          {assignmentDetails.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-sm py-8">
                    لا توجد نتيجة بعد
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
            onClick={closeAllModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm sm:text-base text-gray-900">
                  {selectedAssignment.assignment_status === "submitted"
                    ? "تحديث التسليم"
                    : "تسليم الواجب"}
                </h3>
                <button
                  onClick={closeAllModals}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {selectedAssignment.title}
                  </p>

                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-[#009966] transition">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="hidden"
                    />
                    <Upload size={24} className="text-gray-400 mx-auto mb-1" />
                    <span className="text-xs sm:text-sm text-gray-500">
                      {uploadFile ? uploadFile.name : "اختر ملف للتسليم"}
                    </span>
                  </label>

                  <AnimatePresence>
                    {uploadMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`text-xs sm:text-sm font-bold ${uploadMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
                      >
                        {uploadMessage.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={
                      selectedAssignment.assignment_status === "submitted"
                        ? handleUpdateAssignment
                        : handleSubmitAssignment
                    }
                    disabled={uploadLoading}
                    className="py-2.5 rounded-lg text-sm font-bold bg-[#009966] text-white hover:bg-[#007a52] transition disabled:opacity-50"
                  >
                    {uploadLoading
                      ? "جاري الرفع..."
                      : selectedAssignment.assignment_status === "submitted"
                        ? "تحديث التسليم"
                        : "تسليم الواجب"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Homework;
