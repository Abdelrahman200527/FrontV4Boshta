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
import { formatDate } from "../utils/dateUtils";
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

  // ✅ دالة التحقق من حالة الواجب
  const getAssignmentStatus = useCallback((assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isExpired = now > deadline;

    // 1. مغلق من المدرس
    if (assignment.is_closed === 1 || assignment.is_closed === true) {
      return {
        key: "closed",
        text: "مغلق",
        badge: "bg-gray-100 text-gray-600",
        icon: Lock,
        canSubmit: false,
        canUpdate: false,
        canViewResult: false,
      };
    }

    // 2. مصحح
    if (assignment.assignment_status === "graded") {
      return {
        key: "graded",
        text: "مصحح",
        badge: "bg-blue-100 text-blue-700",
        icon: Star,
        canSubmit: false,
        canUpdate: false,
        canViewResult: true,
      };
    }

    // 3. مسلم
    if (assignment.assignment_status === "submitted") {
      // لو مسلم والوقت لسه شغال → يقدر يحدث
      if (!isExpired) {
        return {
          key: "submitted",
          text: "مسلم",
          badge: "bg-green-100 text-green-700",
          icon: CheckCircle2,
          canSubmit: false,
          canUpdate: true,
          canViewResult: false,
        };
      }
      // مسلم والوقت خلص → مش يقدر يحدث
      return {
        key: "submitted",
        text: "مسلم",
        badge: "bg-green-100 text-green-700",
        icon: CheckCircle2,
        canSubmit: false,
        canUpdate: false,
        canViewResult: false,
      };
    }

    // 4. متأخر
    if (isExpired) {
      return {
        key: "overdue",
        text: "متأخر",
        badge: "bg-red-100 text-red-700",
        icon: XCircle,
        canSubmit: false,
        canUpdate: false,
        canViewResult: false,
      };
    }

    // 5. مطلوب - يقدر يسلم
    return {
      key: "pending",
      text: "مطلوب",
      badge: "bg-yellow-100 text-yellow-700",
      icon: Clock3,
      canSubmit: true,
      canUpdate: false,
      canViewResult: false,
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
            <span className="text-sm text-gray-500">
              متابعة الواجبات ({assignments.length})
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition"
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
          className={`bg-white rounded-2xl p-3 sm:p-4 text-center border-2 border-transparent transition ${activeTab === "pending" ? "border-[#009966] shadow-[5px_2px_0_#009966]" : "hover:border-[#009966]"}`}
        >
          <ClipboardList className="text-blue-600 mx-auto mb-1" size={20} />
          <span className="text-lg sm:text-xl font-bold block">
            {categorizedAssignments.pending.length}
          </span>
          <span className="text-[10px] text-gray-500">مطلوبة</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("submitted");
            setSearchQuery("");
          }}
          className={`bg-white rounded-2xl p-3 sm:p-4 text-center border-2 border-transparent transition ${activeTab === "submitted" ? "border-[#009966] shadow-[5px_2px_0_#009966]" : "hover:border-[#009966]"}`}
        >
          <ClipboardCheck className="text-green-600 mx-auto mb-1" size={20} />
          <span className="text-lg sm:text-xl font-bold block">
            {categorizedAssignments.submitted.length}
          </span>
          <span className="text-[10px] text-gray-500">مسلمة</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("overdue");
            setSearchQuery("");
          }}
          className={`bg-white rounded-2xl p-3 sm:p-4 text-center border-2 border-transparent transition ${activeTab === "overdue" ? "border-[#009966] shadow-[5px_2px_0_#009966]" : "hover:border-[#009966]"}`}
        >
          <Clock3 className="text-red-600 mx-auto mb-1" size={20} />
          <span className="text-lg sm:text-xl font-bold block">
            {categorizedAssignments.overdue.length}
          </span>
          <span className="text-[10px] text-gray-500">متأخرة</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("closed");
            setSearchQuery("");
          }}
          className={`bg-white rounded-2xl p-3 sm:p-4 text-center border-2 border-transparent transition ${activeTab === "closed" ? "border-[#009966] shadow-[5px_2px_0_#009966]" : "hover:border-[#009966]"}`}
        >
          <Lock className="text-gray-500 mx-auto mb-1" size={20} />
          <span className="text-lg sm:text-xl font-bold block">
            {categorizedAssignments.closed.length}
          </span>
          <span className="text-[10px] text-gray-500">مغلقة</span>
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 border-b border-gray-200 overflow-x-auto"
      >
        {[
          { id: "all", label: `الكل (${assignments.length})` },
          {
            id: "pending",
            label: `مطلوبة (${categorizedAssignments.pending.length})`,
          },
          {
            id: "submitted",
            label: `مسلمة (${categorizedAssignments.submitted.length})`,
          },
          {
            id: "graded",
            label: `مصححة (${categorizedAssignments.graded.length})`,
          },
          {
            id: "overdue",
            label: `متأخرة (${categorizedAssignments.overdue.length})`,
          },
          {
            id: "closed",
            label: `مغلقة (${categorizedAssignments.closed.length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery("");
            }}
            className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? "border-[#009966] text-[#009966]" : "border-transparent text-gray-500"}`}
          >
            {tab.label}
          </button>
        ))}
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
              <p className="text-sm">لا توجد واجبات</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const status = getAssignmentStatus(assignment);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={assignment.assignment_id}
                  className={`bg-white border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${status.key === "closed" ? "border-gray-200 bg-gray-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status.key === "closed" ? "bg-gray-100" : "bg-orange-50"}`}
                    >
                      <BookIcon
                        className={
                          status.key === "closed"
                            ? "text-gray-400"
                            : "text-orange-600"
                        }
                        size={20}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-gray-900 truncate">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(assignment.deadline)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {assignment.full_mark} درجة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${status.badge}`}
                    >
                      <StatusIcon size={11} />
                      {status.text}
                    </span>

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

                    {/* ✅ نتيجة */}
                    {status.canViewResult && (
                      <button
                        onClick={() => handleViewResult(assignment)}
                        className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition"
                      >
                        النتيجة
                      </button>
                    )}

                    {/* ✅ تسليم */}
                    {status.canSubmit && (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        className="bg-[#009966] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#007a52] transition"
                      >
                        تسليم
                      </button>
                    )}

                    {/* ✅ تحديث */}
                    {status.canUpdate && (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 transition"
                      >
                        تحديث
                      </button>
                    )}
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
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" />
            ملخص التسليمات ({submissions.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {submissions.map((submission, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2"
              >
                <span className="text-xs font-medium truncate max-w-40">
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
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="font-bold text-sm text-gray-900">
                  تفاصيل الواجب
                </h3>
                <button
                  onClick={closeAllModals}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
                {detailsLoading ? (
                  <p className="text-center text-gray-400 text-sm py-8">
                    جاري التحميل...
                  </p>
                ) : assignmentDetails ? (
                  <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-base text-gray-900">
                      {assignmentDetails.title || selectedAssignment.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {assignmentDetails.description || "لا يوجد وصف"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <span className="text-[10px] text-gray-500 block">
                          الدرجة الكلية
                        </span>
                        <span className="font-bold text-sm">
                          {assignmentDetails.full_mark || "-"}
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
                        className="flex items-center gap-2 text-blue-600 text-sm font-bold"
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
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-900">
                  نتيجة الواجب
                </h3>
                <button
                  onClick={closeAllModals}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
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
                        className="bg-[#009966] h-full rounded-full"
                        style={{
                          width: `${Math.min(100, ((assignmentDetails.score || 0) / (assignmentDetails.full_mark || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
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
                    لا توجد نتيجة
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
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-900">
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
              <div className="p-4">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-600">
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
                    <span className="text-sm text-gray-500">
                      {uploadFile ? uploadFile.name : "اختر ملف للتسليم"}
                    </span>
                  </label>

                  {uploadMessage && (
                    <p
                      className={`text-sm font-bold ${uploadMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
                    >
                      {uploadMessage.text}
                    </p>
                  )}

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