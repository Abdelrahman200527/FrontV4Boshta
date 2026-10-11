import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardPlus,
  FileText,
  Globe,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Clock,
  Award,
  BookOpen,
  X,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getAllPaperExams,
  createPaperExam,
  updatePaperExam,
  deletePaperExam,
  batchUpsertExamResults,
  downloadExamResultsTemplate,
  bulkUploadExamResults,
  exportExamResultsPdf,
  exportExamResultsExcel,
  getAllOnlineExams,
  createOnlineExam,
  deleteOnlineExam,
  createExamQuestion,
  createQuestionOption,
  getPendingEssayAnswers,
  gradeEssayAnswer,
  getAllGrades,
  getAllStudents,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminExams() {
  const [activeTab, setActiveTab] = useState("paper"); // "paper" | "online" | "essay"

  // Common dependencies
  const [grades, setGrades] = useState([]);

  // Paper Exams State
  const [paperExams, setPaperExams] = useState([]);
  const [loadingPaper, setLoadingPaper] = useState(true);
  const [paperSearch, setPaperSearch] = useState("");
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [paperForm, setPaperForm] = useState({
    title: "",
    grade_id: "",
    total_degree: 50,
    exam_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Batch Grading Modal for Paper Exam
  const [batchModal, setBatchModal] = useState({
    isOpen: false,
    exam: null,
    students: [],
    loading: false,
    saving: false,
  });

  // Online Exams State
  const [onlineExams, setOnlineExams] = useState([]);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [onlineForm, setOnlineForm] = useState({
    title: "",
    description: "",
    grade_id: "",
    duration_minutes: 45,
    start_at: new Date().toISOString().slice(0, 16),
    end_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    full_mark: 60,
    randomize_questions: 1,
  });

  // Pending Essay Grading State
  const [pendingEssays, setPendingEssays] = useState([]);
  const [loadingEssay, setLoadingEssay] = useState(false);
  const [essayGradingModal, setEssayGradingModal] = useState({
    isOpen: false,
    answer: null,
    score: "",
    feedback: "",
    saving: false,
  });

  // Fetch Grades
  useEffect(() => {
    const fetchG = async () => {
      try {
        const res = await getAllGrades();
        const list = Array.isArray(res) ? res : res?.grades || res?.data || [];
        setGrades(list);
        if (list.length > 0) {
          setPaperForm((prev) => ({ ...prev, grade_id: String(list[0].id) }));
          setOnlineForm((prev) => ({ ...prev, grade_id: String(list[0].id) }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchG();
  }, []);

  // Fetch Paper Exams
  const fetchPaperExams = async () => {
    try {
      setLoadingPaper(true);
      const res = await getAllPaperExams();
      const list = Array.isArray(res) ? res : res?.exams || res?.data || [];
      setPaperExams(list);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل الامتحانات الورقية");
    } finally {
      setLoadingPaper(false);
    }
  };

  // Fetch Online Exams
  const fetchOnlineExams = async () => {
    try {
      setLoadingOnline(true);
      const res = await getAllOnlineExams();
      const list = Array.isArray(res) ? res : res?.exams || res?.data || [];
      setOnlineExams(list);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل الامتحانات الإلكترونية");
    } finally {
      setLoadingOnline(false);
    }
  };

  // Fetch Pending Essays
  const fetchPendingEssays = async () => {
    try {
      setLoadingEssay(true);
      const res = await getPendingEssayAnswers();
      const list = Array.isArray(res) ? res : res?.answers || res?.data || [];
      setPendingEssays(list);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل الإجابات المقالية المنتظرة");
    } finally {
      setLoadingEssay(false);
    }
  };

  useEffect(() => {
    if (activeTab === "paper") fetchPaperExams();
    if (activeTab === "online") fetchOnlineExams();
    if (activeTab === "essay") fetchPendingEssays();
  }, [activeTab]);

  // Handle Paper Exam Create
  const handlePaperSubmit = async (e) => {
    e.preventDefault();
    if (!paperForm.title || !paperForm.grade_id) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    try {
      await createPaperExam({
        title: paperForm.title,
        grade_id: Number(paperForm.grade_id),
        group_id: null,
        total_degree: Number(paperForm.total_degree) || 50,
        exam_date: paperForm.exam_date,
        notes: paperForm.notes,
      });

      toast.success("تم إنشاء الامتحان الورقي بنجاح");
      setIsPaperModalOpen(false);
      fetchPaperExams();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشل إنشاء الامتحان");
    }
  };

  // Handle Paper Exam Delete
  const handleDeletePaper = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الامتحان؟")) return;
    try {
      await deletePaperExam(id);
      toast.success("تم حذف الامتحان الورقي");
      fetchPaperExams();
    } catch (err) {
      toast.error("فشل حذف الامتحان");
    }
  };

  // Open Batch Grading Modal
  const handleOpenBatchGrading = async (exam) => {
    setBatchModal({
      isOpen: true,
      exam,
      students: [],
      loading: true,
      saving: false,
    });

    try {
      // Fetch students for this grade
      const res = await getAllStudents({ grade_id: exam.grade_id, limit: 100 });
      const list = Array.isArray(res) ? res : res?.students || res?.data || [];

      // Build initial results array
      const mapped = list.map((st) => ({
        student_id: st.id,
        full_name: st.full_name,
        barcode: st.barcode,
        degree: "",
        notes: "",
      }));

      setBatchModal((prev) => ({
        ...prev,
        students: mapped,
        loading: false,
      }));
    } catch (err) {
      toast.error("فشل تحميل طلاب الصف لرصد الدرجات");
      setBatchModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Save Batch Grading
  const handleSaveBatchGrading = async () => {
    const { exam, students } = batchModal;
    if (!exam || students.length === 0) return;

    const payloadResults = students
      .filter((s) => s.degree !== "" && s.degree !== null)
      .map((s) => ({
        student_id: s.student_id,
        degree: Number(s.degree),
        notes: s.notes || "",
      }));

    if (payloadResults.length === 0) {
      toast.error("يرجى إدخال درجة واحدة على الأقل قبل الحفظ");
      return;
    }

    try {
      setBatchModal((prev) => ({ ...prev, saving: true }));
      await batchUpsertExamResults(exam.id, payloadResults);
      toast.success("تم رصد وحفظ درجات الطلاب بنجاح");
      setBatchModal((prev) => ({ ...prev, isOpen: false, saving: false }));
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشل حفظ الدرجات");
      setBatchModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Bulk upload results from Excel
  const handleBulkUploadExcel = async (examId, file) => {
    if (!file) return;
    try {
      await bulkUploadExamResults(examId, file);
      toast.success("تم رفع وتحديث درجات الطلاب بنجاح من الشيت");
      fetchPaperExams();
      if (batchModal.isOpen && batchModal.exam?.id === examId) {
        handleOpenBatchGrading(batchModal.exam);
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "فشل رفع ملف الدرجات");
    }
  };

  // Handle Online Exam Submit
  const handleOnlineSubmit = async (e) => {
    e.preventDefault();
    if (!onlineForm.title || !onlineForm.grade_id) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    try {
      await createOnlineExam({
        title: onlineForm.title,
        description: onlineForm.description,
        grade_id: Number(onlineForm.grade_id),
        group_id: null,
        duration_minutes: Number(onlineForm.duration_minutes),
        start_at: new Date(onlineForm.start_at).toISOString(),
        end_at: new Date(onlineForm.end_at).toISOString(),
        full_mark: Number(onlineForm.full_mark),
        randomize_questions: Number(onlineForm.randomize_questions),
      });

      toast.success("تم إنشاء الامتحان الإلكتروني بنجاح");
      setIsOnlineModalOpen(false);
      fetchOnlineExams();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشل إنشاء الامتحان الإلكتروني");
    }
  };

  // Submit Essay Grade
  const handleSaveEssayGrade = async (e) => {
    e.preventDefault();
    const { answer, score, feedback } = essayGradingModal;
    if (!answer?.id || score === "") {
      toast.error("يرجى إدخال الدرجة");
      return;
    }

    try {
      setEssayGradingModal((prev) => ({ ...prev, saving: true }));
      await gradeEssayAnswer(answer.id, {
        score: Number(score),
        feedback,
      });

      toast.success("تم رصد درجة السؤال المقالي بنجاح");
      setEssayGradingModal({
        isOpen: false,
        answer: null,
        score: "",
        feedback: "",
        saving: false,
      });
      fetchPendingEssays();
    } catch (err) {
      console.error(err);
      toast.error("فشل رصد درجة المقالي");
      setEssayGradingModal((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] p-2 rounded-xl">
              <ClipboardPlus size={22} />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">
              منظومة الامتحانات ورصد الدرجات
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-normal">
            الامتحانات الورقية والرصد الجماعي السريع، الامتحانات الإلكترونية، وتصحيح المقالي
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("paper")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "paper"
                ? "bg-white text-[#1a5d1a] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText size={16} />
            الامتحانات الورقية
          </button>
          <button
            onClick={() => setActiveTab("online")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "online"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Globe size={16} />
            الامتحانات الإلكترونية
          </button>
          <button
            onClick={() => setActiveTab("essay")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "essay"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Award size={16} />
            تصحيح الأسئلة المقالية
            {pendingEssays.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                {pendingEssays.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: PAPER EXAMS */}
      {activeTab === "paper" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={paperSearch}
                onChange={(e) => setPaperSearch(e.target.value)}
                placeholder="البحث باسم الامتحان الورقي..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
              />
            </div>

            <button
              onClick={() => setIsPaperModalOpen(true)}
              className="flex items-center gap-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all"
            >
              <Plus size={18} />
              إنشاء امتحان ورقي جديد
            </button>
          </div>

          {loadingPaper ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">جاري تحميل الامتحانات...</p>
            </div>
          ) : paperExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                لا توجد امتحانات ورقية مسجلة
              </h3>
              <p className="text-xs text-gray-500 mb-4 font-normal">
                قم بإنشاء أول امتحان ورقي لرصد درجات الطلاب بالسنتر
              </p>
              <button
                onClick={() => setIsPaperModalOpen(true)}
                className="bg-[#1a5d1a] text-white px-4 py-2 rounded-xl text-sm font-medium"
              >
                إنشاء امتحان
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paperExams
                .filter((ex) =>
                  (ex.title || "")
                    .toLowerCase()
                    .includes(paperSearch.toLowerCase())
                )
                .map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-emerald-50 text-[#1a5d1a] text-xs font-medium px-2.5 py-1 rounded-lg">
                          {ex.grade_name || "صف عام"}
                        </span>
                        <button
                          onClick={() => handleDeletePaper(ex.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h3 className="font-semibold text-gray-900 text-base mb-2">
                        {ex.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-gray-500 mb-4 bg-gray-50/70 p-3 rounded-xl font-normal">
                        <div className="flex items-center justify-between">
                          <span>الدرجة الكلية:</span>
                          <span className="font-semibold text-gray-800">
                            {ex.total_degree} درجة
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>تاريخ الامتحان:</span>
                          <span className="font-semibold text-gray-800">
                            {ex.exam_date || "--"}
                          </span>
                        </div>
                        {ex.notes && (
                          <div className="pt-1 text-[11px] text-gray-400">
                            {ex.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => handleOpenBatchGrading(ex)}
                        className="w-full flex items-center justify-center gap-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white py-2 rounded-xl text-xs font-medium transition-all shadow-sm"
                      >
                        <Award size={15} />
                        رصد درجات الطلاب (Batch Upsert)
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => exportExamResultsPdf(ex.id)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-[11px] font-medium transition-colors"
                        >
                          <FileText size={13} />
                          شهادات PDF
                        </button>
                        <button
                          onClick={() => exportExamResultsExcel(ex.id)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-[11px] font-medium transition-colors"
                        >
                          <FileSpreadsheet size={13} />
                          تصدير Excel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ONLINE EXAMS */}
      {activeTab === "online" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-gray-900 text-base">
              الامتحانات الإلكترونية وبنك الأسئلة
            </h3>
            <button
              onClick={() => setIsOnlineModalOpen(true)}
              className="flex items-center gap-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all"
            >
              <Plus size={18} />
              إنشاء امتحان إلكتروني جديد
            </button>
          </div>

          {loadingOnline ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">جاري التحميل...</p>
            </div>
          ) : onlineExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Globe size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                لا توجد امتحانات إلكترونية مسجلة
              </h3>
              <p className="text-xs text-gray-500 mb-4 font-normal">
                أنشئ امتحاناً أونلاين محدد بوقت وبنك أسئلة لاختبار الطلاب
              </p>
              <button
                onClick={() => setIsOnlineModalOpen(true)}
                className="bg-[#1a5d1a] text-white px-4 py-2 rounded-xl text-sm font-medium"
              >
                إنشاء امتحان إلكتروني
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {onlineExams.map((ox) => (
                <div
                  key={ox.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                        {ox.grade_name || "صف عام"}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        #{ox.id}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-base mb-2">
                      {ox.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 font-normal">
                      {ox.description || "لا يوجد وصف إضافي"}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs bg-gray-50/70 p-3 rounded-xl mb-4">
                      <div>
                        <span className="text-[11px] text-gray-400 block font-normal">
                          المدة
                        </span>
                        <span className="font-semibold text-gray-800">
                          {ox.duration_minutes} دقيقة
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 block font-normal">
                          الدرجة
                        </span>
                        <span className="font-semibold text-[#1a5d1a]">
                          {ox.full_mark} درجة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      بدء:{" "}
                      {ox.start_at
                        ? new Date(ox.start_at).toLocaleDateString("ar-EG")
                        : "--"}
                    </span>
                    <button
                      onClick={async () => {
                        if (window.confirm("حذف الامتحان؟")) {
                          await deleteOnlineExam(ox.id);
                          fetchOnlineExams();
                        }
                      }}
                      className="text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ESSAY ANSWERS */}
      {activeTab === "essay" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  إجابات الأسئلة المقالية بانتظار التصحيح
                </h3>
                <p className="text-xs text-gray-500 font-normal">
                  إجمالي الإجابات المعلقة: {pendingEssays.length}
                </p>
              </div>
              <button
                onClick={fetchPendingEssays}
                className="p-2 text-gray-600 hover:text-[#1a5d1a] border border-gray-200 rounded-xl"
              >
                <RefreshCw
                  size={16}
                  className={loadingEssay ? "animate-spin" : ""}
                />
              </button>
            </div>

            {loadingEssay ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">جاري جلب الإجابات...</p>
              </div>
            ) : pendingEssays.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm font-normal">
                رائع! تم تصحيح كافة الأسئلة المقالية ولا توجد أسئلة معلقة.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingEssays.map((ans) => (
                  <div key={ans.id} className="p-5 hover:bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {ans.student_name || "طالب"}
                        </span>
                        <span className="text-xs text-gray-400 font-normal">
                          (امتحان: {ans.exam_title || "--"})
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setEssayGradingModal({
                            isOpen: true,
                            answer: ans,
                            score: "",
                            feedback: "",
                            saving: false,
                          })
                        }
                        className="px-3.5 py-1.5 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-xs font-medium rounded-xl shadow-sm transition-all"
                      >
                        تصحيح ورصد الدرجة
                      </button>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
                      <span className="font-semibold text-gray-700 block mb-1">
                        السؤال: {ans.question_text}
                      </span>
                      <p className="text-gray-900 font-normal whitespace-pre-wrap">
                        إجابة الطالب: {ans.answer_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE PAPER EXAM MODAL */}
      <AnimatePresence>
        {isPaperModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  إنشاء امتحان ورقي جديد
                </h3>
                <button
                  onClick={() => setIsPaperModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePaperSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    عنوان الامتحان *
                  </label>
                  <input
                    type="text"
                    required
                    value={paperForm.title}
                    onChange={(e) =>
                      setPaperForm({ ...paperForm, title: e.target.value })
                    }
                    placeholder="مثال: امتحان نصف الفصل الأول - النحو والبلاغة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    الصف الدراسي *
                  </label>
                  <select
                    required
                    value={paperForm.grade_id}
                    onChange={(e) =>
                      setPaperForm({ ...paperForm, grade_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  >
                    {grades.map((gr) => (
                      <option key={gr.id} value={gr.id}>
                        {gr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      الدرجة الكلية *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={paperForm.total_degree}
                      onChange={(e) =>
                        setPaperForm({
                          ...paperForm,
                          total_degree: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      تاريخ الامتحان *
                    </label>
                    <input
                      type="date"
                      required
                      value={paperForm.exam_date}
                      onChange={(e) =>
                        setPaperForm({
                          ...paperForm,
                          exam_date: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    ملاحظات أو تنبيهات
                  </label>
                  <textarea
                    rows={2}
                    value={paperForm.notes}
                    onChange={(e) =>
                      setPaperForm({ ...paperForm, notes: e.target.value })
                    }
                    placeholder="ملاحظات للطلاب أو المساعدين..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsPaperModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-sm font-medium rounded-xl transition-all shadow-sm"
                  >
                    إنشاء الامتحان
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BATCH GRADING SCREEN MODAL (Tab & Enter friendly) */}
      <AnimatePresence>
        {batchModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    رصد درجات: {batchModal.exam?.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-normal">
                    الدرجة العظمى: {batchModal.exam?.total_degree} درجة • تنقل
                    بين الخانات باستخدام Tab أو Enter للسرعة
                  </p>
                </div>
                <button
                  onClick={() =>
                    setBatchModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Sub-header: Quick Template & Excel Actions */}
              <div className="bg-gray-50/80 px-6 py-2.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-gray-500 font-medium">خيارات الاستيراد السريع:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadExamResultsTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl transition shadow-xs"
                  >
                    <Download size={13} />
                    تحميل القالب (.xlsx)
                  </button>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1a5d1a] border border-emerald-200 rounded-xl transition cursor-pointer shadow-xs">
                    <FileSpreadsheet size={13} />
                    استيراد شيت إكسيل
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      hidden
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleBulkUploadExcel(batchModal.exam?.id, e.target.files[0]);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {batchModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 font-medium">جاري تحميل الطلاب...</p>
                  </div>
                ) : batchModal.students.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-sm font-normal">
                    لا يوجد طلاب مسجلين في هذا الصف
                  </div>
                ) : (
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0">
                      <tr>
                        <th className="p-3 font-medium">#</th>
                        <th className="p-3 font-medium">اسم الطالب</th>
                        <th className="p-3 font-medium">الباركود</th>
                        <th className="p-3 w-36 font-medium">الدرجة المكتسبة</th>
                        <th className="p-3 font-medium">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {batchModal.students.map((st, idx) => (
                        <tr key={st.student_id} className="hover:bg-gray-50/50">
                          <td className="p-3 text-gray-400">{idx + 1}</td>
                          <td className="p-3 font-semibold text-gray-900">
                            {st.full_name}
                          </td>
                          <td className="p-3 font-mono text-gray-600">
                            {st.barcode || "--"}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={batchModal.exam?.total_degree}
                              value={st.degree}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBatchModal((prev) => {
                                  const updated = [...prev.students];
                                  updated[idx].degree = val;
                                  return { ...prev, students: updated };
                                });
                              }}
                              placeholder={`من ${batchModal.exam?.total_degree}`}
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#1a5d1a] focus:outline-none focus:border-[#1a5d1a]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={st.notes}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBatchModal((prev) => {
                                  const updated = [...prev.students];
                                  updated[idx].notes = val;
                                  return { ...prev, students: updated };
                                });
                              }}
                              placeholder="ممتاز، يحتاج مراجعة..."
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#1a5d1a]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  سيتم حفظ وتحديث كل الطلاب الذين تم إدخال درجات لهم فقط
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setBatchModal((prev) => ({ ...prev, isOpen: false }))
                    }
                    className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-200 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveBatchGrading}
                    disabled={batchModal.saving}
                    className="px-6 py-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-xs font-medium rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {batchModal.saving
                      ? "جاري الحفظ..."
                      : "حفظ كافة الدرجات بنقرة واحدة"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE ONLINE EXAM MODAL */}
      <AnimatePresence>
        {isOnlineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  إنشاء امتحان إلكتروني جديد
                </h3>
                <button
                  onClick={() => setIsOnlineModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleOnlineSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    عنوان الامتحان *
                  </label>
                  <input
                    type="text"
                    required
                    value={onlineForm.title}
                    onChange={(e) =>
                      setOnlineForm({ ...onlineForm, title: e.target.value })
                    }
                    placeholder="مثال: امتحان شامل على الوحدة الثانية نحو"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    الوصف أو التوجيهات
                  </label>
                  <textarea
                    rows={2}
                    value={onlineForm.description}
                    onChange={(e) =>
                      setOnlineForm({
                        ...onlineForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="تعليمات الامتحان للطالب..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      الصف الدراسي *
                    </label>
                    <select
                      required
                      value={onlineForm.grade_id}
                      onChange={(e) =>
                        setOnlineForm({
                          ...onlineForm,
                          grade_id: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    >
                      {grades.map((gr) => (
                        <option key={gr.id} value={gr.id}>
                          {gr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      المدة (بالدقائق) *
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      value={onlineForm.duration_minutes}
                      onChange={(e) =>
                        setOnlineForm({
                          ...onlineForm,
                          duration_minutes: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      تاريخ البدء
                    </label>
                    <input
                      type="datetime-local"
                      value={onlineForm.start_at}
                      onChange={(e) =>
                        setOnlineForm({ ...onlineForm, start_at: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      تاريخ الانتهاء
                    </label>
                    <input
                      type="datetime-local"
                      value={onlineForm.end_at}
                      onChange={(e) =>
                        setOnlineForm({ ...onlineForm, end_at: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      الدرجة الكلية *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={onlineForm.full_mark}
                      onChange={(e) =>
                        setOnlineForm({
                          ...onlineForm,
                          full_mark: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                  <div className="pt-5">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(onlineForm.randomize_questions)}
                        onChange={(e) =>
                          setOnlineForm({
                            ...onlineForm,
                            randomize_questions: e.target.checked ? 1 : 0,
                          })
                        }
                        className="rounded text-[#1a5d1a] focus:ring-0"
                      />
                      ترتيب عشوائي للأسئلة
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOnlineModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-sm font-medium rounded-xl transition-all shadow-sm"
                  >
                    إنشاء الامتحان الإلكتروني
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ESSAY GRADING MODAL */}
      <AnimatePresence>
        {essayGradingModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  تصحيح السؤال المقالي
                </h3>
                <button
                  onClick={() =>
                    setEssayGradingModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs mb-4 space-y-2">
                <div>
                  <span className="text-gray-400 block font-normal">السؤال:</span>
                  <span className="font-semibold text-gray-800">
                    {essayGradingModal.answer?.question_text}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-normal">إجابة الطالب:</span>
                  <p className="font-normal text-gray-900 whitespace-pre-wrap">
                    {essayGradingModal.answer?.answer_text}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveEssayGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    الدرجة المستحقة *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={essayGradingModal.score}
                    onChange={(e) =>
                      setEssayGradingModal({
                        ...essayGradingModal,
                        score: e.target.value,
                      })
                    }
                    placeholder="مثال: 5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    ملاحظات أو تعليق للطالب (Feedback)
                  </label>
                  <textarea
                    rows={2}
                    value={essayGradingModal.feedback}
                    onChange={(e) =>
                      setEssayGradingModal({
                        ...essayGradingModal,
                        feedback: e.target.value,
                      })
                    }
                    placeholder="صياغة ممتازة مع مراعاة علامات الترقيم..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEssayGradingModal((prev) => ({
                        ...prev,
                        isOpen: false,
                      }))
                    }
                    className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={essayGradingModal.saving}
                    className="px-5 py-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-xs font-medium rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    {essayGradingModal.saving ? "جاري الحفظ..." : "اعتماد الدرجة"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
