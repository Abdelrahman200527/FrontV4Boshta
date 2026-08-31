import { notifyError, notifySuccess, notifyInfo, confirmToast } from "../../lib/notify";
import {
  FileText,
  Plus,
  Trash2,
  Pencil,
  X,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import AddHomeworkModal from "./AddHomeworkModal";
import {
  fetchAllAssignments,
  createNewAssignment,
  updateAssignmentInfo,
  removeAssignment,
  fetchAllGrades,
  fetchGroupsByGrade,
  fetchSubmissions,
  fetchSubmissionStats,
  fetchSubmittedStudents,
  fetchNotSubmittedStudents,
  gradeStudentSubmission,
} from "../../api/assistant/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../../motion";

const Homeworks = () => {
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  /* كل الرسائل toast */
  const setMessage = (msg) => {
    if (!msg?.text) return;
    if (msg.type === "success") notifySuccess(msg.text);
    else notifyError(msg.text);
  };
  const [modal, setModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [notSubmittedStudents, setNotSubmittedStudents] = useState([]);
  const [submissionStats, setSubmissionStats] = useState(null);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("submitted");

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [assignmentsRes, gradesRes] = await Promise.all([
      fetchAllAssignments(),
      fetchAllGrades(),
    ]);
    if (assignmentsRes.success) setAssignments(assignmentsRes.data);
    if (gradesRes.success) setGrades(gradesRes.data);
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("grade_id", data.gradeId);
    if (data.groupId) formData.append("group_id", data.groupId);
    formData.append("full_mark", data.maxScore || 10);
    if (data.deadline) formData.append("deadline", data.deadline);
    formData.append("is_closed", data.isClosed || 0);
    if (data.file) formData.append("file", data.file);

    const result = editingAssignment
      ? await updateAssignmentInfo(editingAssignment.id, formData)
      : await createNewAssignment(formData);

    if (result.success) {
      setMessage({
        type: "success",
        text: editingAssignment ? "تم تحديث الواجب" : "تم إضافة الواجب",
      });
      setModal(false);
      setEditingAssignment(null);
      loadData();
    } else {
      setMessage({ type: "error", text: result.error });
    }
  };

  const handleDelete = async (assignmentId) => {
    confirmToast("حذف هذا الواجب؟", async () => {
      const result = await removeAssignment(assignmentId);
      if (result.success) {
        setMessage({ type: "success", text: "تم حذف الواجب" });
        loadData();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const handleEdit = async (assignment) => {
    setEditingAssignment(assignment);
    setGroups([]);
    if (assignment.grade_id) {
      const result = await fetchGroupsByGrade(assignment.grade_id);
      if (result.success) setGroups(result.data || []);
    }
    setModal(true);
  };

  const openSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissions(true);
    setSubmissionsLoading(true);
    setActiveTab("submitted");
    setSubmissions([]);
    setSubmittedStudents([]);
    setNotSubmittedStudents([]);
    setSubmissionStats(null);

    const [submissionsRes, statsRes, submittedRes, notSubmittedRes] =
      await Promise.all([
        fetchSubmissions(assignment.id),
        fetchSubmissionStats(assignment.id),
        fetchSubmittedStudents(assignment.id),
        fetchNotSubmittedStudents(assignment.id),
      ]);

    if (submissionsRes.success) setSubmissions(submissionsRes.data || []);
    if (statsRes.success) setSubmissionStats(statsRes.data);
    if (submittedRes.success) setSubmittedStudents(submittedRes.data || []);
    if (notSubmittedRes.success)
      setNotSubmittedStudents(notSubmittedRes.data || []);
    setSubmissionsLoading(false);
  };

  const openGradeModal = (submission) => {
    setGradingSubmission(submission);
    setScore(submission.score || "");
    setFeedback(submission.feedback || "");
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async () => {
    if (!score || parseFloat(score) < 0) {
      setMessage({ type: "error", text: "يرجى إدخال درجة صحيحة" });
      return;
    }

    setGradingLoading(true);
    const result = await gradeStudentSubmission(
      gradingSubmission.id,
      parseFloat(score),
      feedback,
    );
    setGradingLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "تم حفظ التصحيح" });
      setShowGradeModal(false);
      setGradingSubmission(null);
      openSubmissions(selectedAssignment);
    } else {
      setMessage({ type: "error", text: result.error });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (assignment) => {
    if (assignment.is_closed === 1 || assignment.is_closed === true) {
      return { text: "مغلق", bg: "bg-gray-100 text-gray-600" };
    }
    if (assignment.deadline && new Date(assignment.deadline) < new Date()) {
      return { text: "منتهي", bg: "bg-red-100 text-red-600" };
    }
    return { text: "مفتوح", bg: "bg-green-100 text-green-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-500">
        جاري التحميل...
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 min-h-screen"
      dir="rtl"
    >
      <header className="w-full flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">
            الواجبات المنزلية
          </h1>
          <span className="text-base text-gray-500">
            متابعة وإدارة الواجبات ({assignments.length})
          </span>
        </div>
        <button
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition shadow-md"
          onClick={() => {
            setEditingAssignment(null);
            setGroups([]);
            setModal(true);
          }}
        >
          <Plus size={18} /> اضافة واجب
        </button>
      </header>


      {assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={48} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm">لا توجد واجبات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {assignments.map((assignment) => {
            const status = getStatusBadge(assignment);

            return (
              <motion.div
                key={assignment.id}
                variants={itemVariants}
                className="bg-white w-full flex flex-col gap-4 border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl p-5 shadow-[5px_2px_0_#009966]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {assignment.description || "-"}
                    </p>
                    <span className="text-xs text-gray-400 mt-1">
                      {assignment.grade_name || "-"}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.bg}`}
                  >
                    {status.text}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock size={14} />
                      آخر موعد: {formatDate(assignment.deadline)}
                    </span>
                    <span className="font-bold text-gray-800">
                      {assignment.full_mark} درجة
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => openSubmissions(assignment)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold text-[#009966] hover:bg-green-50 rounded-lg py-2 transition"
                  >
                    <Eye size={14} /> التسليمات
                  </button>
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg py-2 transition"
                  >
                    <Pencil size={14} /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg py-2 transition"
                  >
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {modal && (
        <AddHomeworkModal
          open={modal}
          onClose={() => {
            setModal(false);
            setEditingAssignment(null);
          }}
          grades={grades}
          groups={groups}
          onSubmit={handleSubmit}
          requireFile={!editingAssignment}
          editingAssignment={editingAssignment}
        />
      )}

      {showSubmissions && selectedAssignment && (
        <div
          className="fixed inset-0 z-9999 bg-black/60 flex items-center justify-center p-3"
          dir="rtl"
          onClick={() => setShowSubmissions(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  تسليمات: {selectedAssignment.title}
                </h2>
                <span className="text-xs text-gray-500">
                  {submissionStats?.submitted_count || submissions.length} من{" "}
                  {submissionStats?.total_students || 0} طالب سلموا
                </span>
              </div>
              <button
                onClick={() => setShowSubmissions(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {submissionStats && (
              <div className="shrink-0 px-5 py-3 bg-gray-50 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="font-bold text-lg text-green-600 block">
                    {submissionStats.submitted_count || 0}
                  </span>
                  <span className="text-xs text-gray-500">سلموا</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-blue-600 block">
                    {submissionStats.not_submitted_count || 0}
                  </span>
                  <span className="text-xs text-gray-500">مسلموش</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-purple-600 block">
                    {submissionStats.average_score || 0}
                  </span>
                  <span className="text-xs text-gray-500">متوسط الدرجات</span>
                </div>
              </div>
            )}

            <div className="shrink-0 px-5 py-2 border-b border-gray-100 flex gap-2">
              <button
                onClick={() => setActiveTab("submitted")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  activeTab === "submitted"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <UserCheck size={14} className="inline ml-1" />
                سلموا ({submittedStudents.length})
              </button>
              <button
                onClick={() => setActiveTab("not_submitted")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  activeTab === "not_submitted"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <UserX size={14} className="inline ml-1" />
                مسلموش ({notSubmittedStudents.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {submissionsLoading ? (
                <p className="text-center text-gray-400 py-8">
                  جاري التحميل...
                </p>
              ) : activeTab === "submitted" ? (
                submissions.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    لا توجد تسليمات بعد
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                            <Users size={18} className="text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-sm block truncate">
                              {submission.full_name || submission.student_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              باركود: {submission.barcode}
                            </span>
                            <span className="text-xs text-gray-400 block">
                              سلم: {formatDate(submission.submitted_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <span
                              className={`font-bold text-lg block ${
                                submission.score != null
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {submission.score != null
                                ? `${submission.score}/${selectedAssignment.full_mark}`
                                : "غير مصحح"}
                            </span>
                            {submission.feedback && (
                              <span className="text-xs text-gray-500 truncate block max-w-40">
                                {submission.feedback}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1.5">
                            {submission.file_path && (
                              <button
                                onClick={() => {
                                  window.open(
                                    `https://backend.benb3n.cloud/${submission.file_path}`,
                                    "_blank",
                                  );
                                }}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                title="تحميل الملف"
                              >
                                <Download size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => openGradeModal(submission)}
                              className={`p-2 rounded-lg ${
                                submission.score != null
                                  ? "text-orange-500 hover:bg-orange-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title="تصحيح"
                            >
                              <CheckCircle size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : notSubmittedStudents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  كل الطلاب سلموا 🎉
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {notSubmittedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                          <UserX size={18} className="text-red-500" />
                        </div>
                        <div>
                          <span className="font-bold text-sm block">
                            {student.full_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            باركود: {student.barcode}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-red-500 font-bold">
                        لم يسلم
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showGradeModal && gradingSubmission && (
        <div
          className="fixed inset-0 z-99999 bg-black/60 flex items-center justify-center p-3"
          dir="rtl"
          onClick={() => setShowGradeModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">
                تصحيح:{" "}
                {gradingSubmission.full_name || gradingSubmission.student_name}
              </h3>
              <button
                onClick={() => setShowGradeModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  الدرجة (من {selectedAssignment?.full_mark || 10})
                </label>
                <input
  type="number"
  value={score}
  onChange={(e) => {
    const value = e.target.value;
    const maxMark = parseFloat(selectedAssignment?.full_mark);
    
    if (value === "") {
      setScore("");
      return;
    }
    
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxMark) {
      setScore(value);
    }
  }}
  min="0"
  max={selectedAssignment?.full_mark || 10}
  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#009966]"
/>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#009966] resize-none"
                />
              </div>

              {gradingSubmission.file_path && (
                <button
                  onClick={() => {
                    window.open(
                      `https://backend.benb3n.cloud/${gradingSubmission.file_path}`,
                      "_blank",
                    );
                  }}
                  className="flex items-center gap-2 text-blue-600 text-sm font-bold"
                >
                  <Download size={14} />
                  تحميل ملف الحل
                </button>
              )}

              <button
                onClick={handleGradeSubmit}
                disabled={gradingLoading}
                className="w-full py-2.5 rounded-lg bg-[#009966] text-white font-bold text-sm hover:bg-[#007a52] transition disabled:opacity-50"
              >
                {gradingLoading ? "جاري الحفظ..." : "حفظ التصحيح"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Homeworks;
