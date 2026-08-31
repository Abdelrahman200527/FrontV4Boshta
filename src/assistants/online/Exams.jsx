import { notifyError, notifySuccess, notifyInfo, confirmToast } from "../../lib/notify";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../../motion";
import {
  BookIcon,
  Plus,
  Trash2,
  Pencil,
  X,
  CheckCircle,
  PlusCircle,
  Lock,
  FileText,
  Eye,
  Users,
  CheckCircle2,
  Award,
  TrendingUp,
  TrendingDown,
  Shuffle,
  Upload,
  Download,
  Filter,
  Check,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  fetchAllOnlineExams,
  createNewOnlineExam,
  updateOnlineExamInfo,
  removeOnlineExam,
  fetchAllGrades,
  fetchGroupsByGrade,
  fetchQuestionsByExam,
  createNewQuestion,
  fetchOptionsByQuestion,
  createNewOption,
  removeQuestion,
  updateQuestionInfo,
  removeOption,
  updateOptionInfo,
  fetchOnlineExamStats,
  fetchStudentExams,
  fetchAvailableOnlineExams,
  fetchExpiredOnlineExams,
  fetchOnlineExamsByGrade,
  fetchOnlineExamsByGroup,
  fetchGradeOnlineExamStats,
  permanentlyRemoveOnlineExam,
  createNewQuestionWithFile,
  updateQuestionInfoWithFile,
  previewQuestionFileAction,
  downloadQuestionFileDirect,
  fetchEssayAnswersByExam,
  gradeEssayAnswerAction,
  previewAnswerFileAction,
  downloadAnswerFileDirect,
} from "../../api/assistant/actions";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [examAttemptsMap, setExamAttemptsMap] = useState({});
  const [isSaving, setIsSaving] = useState(false); // ✅ حالة الحفظ

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
  const [deletedOptionIds, setDeletedOptionIds] = useState([]);

  const [examInfo, setExamInfo] = useState({
    title: "",
    description: "",
    grade_id: "",
    group_id: "",
    duration_minutes: "",
    start_at: "",
    end_at: "",
    full_mark: "",
    randomize_questions: 0,
  });

  const [questions, setQuestions] = useState([]);

  const [filterType, setFilterType] = useState("all");
  const [filterGradeId, setFilterGradeId] = useState("");
  const [filterGroupId, setFilterGroupId] = useState("");
  const [filterGroups, setFilterGroups] = useState([]);
  const [gradeStats, setGradeStats] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [examStudents, setExamStudents] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingAnswers, setGradingAnswers] = useState([]);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingSubmittingId, setGradingSubmittingId] = useState(null);

  useEffect(() => {
    loadGrades();
  }, []);

  useEffect(() => {
    loadExams();
  }, [filterType, filterGradeId, filterGroupId]);

  const isExamEnded = (exam) => {
    if (!exam.end_at) return false;
    return new Date(exam.end_at) < new Date();
  };

  const isExamActive = (exam) => {
    if (!exam.start_at || !exam.end_at) return true;
    const now = new Date();
    return new Date(exam.start_at) <= now && now <= new Date(exam.end_at);
  };

  const loadGrades = async () => {
    const result = await fetchAllGrades();
    if (result.success) setGrades(result.data);
  };

  const loadFilterGroups = async (gradeId) => {
    setFilterGroupId("");
    if (!gradeId) {
      setFilterGroups([]);
      setGradeStats(null);
      return;
    }
    const [groupsRes, statsRes] = await Promise.all([
      fetchGroupsByGrade(gradeId),
      fetchGradeOnlineExamStats(gradeId),
    ]);
    if (groupsRes.success) setFilterGroups(groupsRes.data || []);
    setGradeStats(statsRes.success ? statsRes.data : null);
  };

  const fetchFilteredExams = async () => {
    if (filterGroupId) return await fetchOnlineExamsByGroup(filterGroupId);
    if (filterGradeId) return await fetchOnlineExamsByGrade(filterGradeId);
    if (filterType === "available") return await fetchAvailableOnlineExams();
    if (filterType === "expired") return await fetchExpiredOnlineExams();
    return await fetchAllOnlineExams();
  };

  const loadExams = async () => {
    setLoading(true);
    const result = await fetchFilteredExams();
    if (result.success) {
      setExams(result.data);
      const attemptsMap = {};
      for (const exam of result.data) {
        const statsRes = await fetchOnlineExamStats(exam.id);
        if (statsRes.success) {
          attemptsMap[exam.id] = statsRes.data?.students_attempted || 0;
        }
      }
      setExamAttemptsMap(attemptsMap);
    }
    setLoading(false);
  };

  const handleGradeChange = async (gradeId) => {
    setExamInfo((prev) => ({ ...prev, grade_id: gradeId, group_id: "" }));
    if (gradeId) {
      const result = await fetchGroupsByGrade(gradeId);
      if (result.success) setGroups(result.data);
    } else {
      setGroups([]);
    }
  };

  const openExamDetails = async (exam) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
    setDetailsLoading(true);

    const [statsRes, studentsRes] = await Promise.all([
      fetchOnlineExamStats(exam.id),
      fetchStudentExams(exam.id),
    ]);

    if (statsRes.success) setExamStats(statsRes.data);
    if (studentsRes.success) setExamStudents(studentsRes.data || []);
    setDetailsLoading(false);
  };

  const openBuilder = async (exam = null) => {
    setDeletedQuestionIds([]);
    setDeletedOptionIds([]);

    if (exam) {
      const attemptsCount = examAttemptsMap[exam.id] || 0;
      if (attemptsCount > 0) {
        notifyError("لا يمكن تعديل هذا الامتحان - يوجد طلاب قد دخلوه بالفعل");
        return;
      }

      setEditingExam(exam);
      setExamInfo({
        title: exam.title || "",
        description: exam.description || "",
        grade_id: exam.grade_id || "",
        group_id: exam.group_id || "",
        duration_minutes: exam.duration_minutes || "",
        start_at: exam.start_at ? exam.start_at.slice(0, 16) : "",
        end_at: exam.end_at ? exam.end_at.slice(0, 16) : "",
        full_mark: exam.full_mark || "",
        randomize_questions: Number(exam.randomize_questions) === 1 ? 1 : 0,
      });

      await handleGradeChange(exam.grade_id);

      const qResult = await fetchQuestionsByExam(exam.id);
      const questionsWithOptions = [];

      if (qResult.success && Array.isArray(qResult.data)) {
        for (const q of qResult.data) {
          const oResult = await fetchOptionsByQuestion(q.id);
          questionsWithOptions.push({
            ...q,
            questionText: q.question_text || "",
            type: q.type || "mcq",
            file: null,
            filePath: q.file_path || null,
            options:
              oResult.success && Array.isArray(oResult.data)
                ? oResult.data.map((opt) => ({
                  ...opt,
                  optionText: opt.option_text || "",
                }))
                : [],
          });
        }
      }

      setQuestions(questionsWithOptions);
    } else {
      setEditingExam(null);
      setExamInfo({
        title: "",
        description: "",
        grade_id: "",
        group_id: "",
        duration_minutes: "",
        start_at: "",
        end_at: "",
        full_mark: "",
        randomize_questions: 0,
      });
      setQuestions([]);
    }
    setShowBuilder(true);
  };

  const addQuestion = (type = "mcq") => {
    let newQuestion = {
      id: Date.now() + Math.random(),
      isNew: true,
      questionText: "",
      type: type,
      order: questions.length + 1,
      file: null,
      filePath: null,
      options: [],
    };

    if (type === "mcq") {
      newQuestion.options = [
        {
          id: Date.now() + 1,
          isNew: true,
          optionText: "",
          isCorrect: 0,
          order: 1,
        },
        {
          id: Date.now() + 2,
          isNew: true,
          optionText: "",
          isCorrect: 0,
          order: 2,
        },
      ];
    } else if (type === "true_false") {
      newQuestion.options = [
        {
          id: Date.now() + 1,
          isNew: true,
          optionText: "صح",
          isCorrect: 0,
          order: 1,
        },
        {
          id: Date.now() + 2,
          isNew: true,
          optionText: "خطأ",
          isCorrect: 0,
          order: 2,
        },
      ];
    }

    setQuestions([...questions, newQuestion]);
  };

  const setQuestionFile = (questionId, file) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, file } : q)),
    );
  };

  const clearQuestionFile = (questionId) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, file: null } : q)),
    );
  };

  const updateQuestionText = (questionId, text) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, questionText: text } : q,
      ),
    );
  };

  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              {
                id: Date.now() + Math.random(),
                isNew: true,
                optionText: "",
                isCorrect: 0,
                order: q.options.length + 1,
              },
            ],
          };
        }
        return q;
      }),
    );
  };

  const updateOptionText = (questionId, optionId, text) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId ? { ...o, optionText: text } : o,
            ),
          };
        }
        return q;
      }),
    );
  };

  const setCorrectOption = (questionId, optionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId
                ? { ...o, isCorrect: 1 }
                : { ...o, isCorrect: 0 },
            ),
          };
        }
        return q;
      }),
    );
  };

  const removeQuestionFromList = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    if (!String(questionId).includes(".")) {
      setDeletedQuestionIds([...deletedQuestionIds, questionId]);
    }
  };

  const removeOptionFromList = (questionId, optionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((o) => o.id !== optionId),
          };
        }
        return q;
      }),
    );
    if (!String(optionId).includes(".")) {
      setDeletedOptionIds([...deletedOptionIds, optionId]);
    }
  };

  const saveQuestion = async (questionId, examId, q) => {
    const payload = {
      exam_id: examId,
      question_text: q.questionText,
      type: q.type,
      order: q.order,
    };

    if (q.file) {
      return questionId
        ? await updateQuestionInfoWithFile(questionId, payload, q.file)
        : await createNewQuestionWithFile(payload, q.file);
    }

    return questionId
      ? await updateQuestionInfo(questionId, payload)
      : await createNewQuestion(payload);
  };

  const saveExam = async () => {
    // ✅ منع الحفظ المزدوج
    if (isSaving) return;

    setMessage(null);

    if (
      !examInfo.title ||
      !examInfo.grade_id ||
      !examInfo.duration_minutes ||
      !examInfo.full_mark
    ) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    if (parseFloat(examInfo.full_mark) <= 0) {
      setMessage({
        type: "error",
        text: "الدرجة الكلية يجب أن تكون أكبر من صفر",
      });
      return;
    }

    if (parseInt(examInfo.duration_minutes) <= 0) {
      setMessage({ type: "error", text: "المدة يجب أن تكون أكبر من صفر" });
      return;
    }

    if (examInfo.start_at && examInfo.end_at) {
      if (new Date(examInfo.end_at) <= new Date(examInfo.start_at)) {
        setMessage({
          type: "error",
          text: "وقت النهاية يجب أن يكون بعد وقت البداية",
        });
        return;
      }
    }

    if (questions.length === 0) {
      setMessage({ type: "error", text: "يجب إضافة سؤال واحد على الأقل" });
      return;
    }

    for (const q of questions) {
      if (!q.questionText) {
        setMessage({ type: "error", text: "جميع الأسئلة يجب أن يكون لها نص" });
        return;
      }

      if (q.type === "mcq" && q.options.length < 2) {
        setMessage({
          type: "error",
          text: "كل سؤال اختيار من متعدد يحتاج اختيارين على الأقل",
        });
        return;
      }

      if (q.type !== "essay" && !q.options.some((o) => o.isCorrect === 1)) {
        setMessage({ type: "error", text: "كل سؤال يحتاج إجابة صحيحة واحدة" });
        return;
      }

      for (const o of q.options) {
        if (!o.optionText) {
          setMessage({
            type: "error",
            text: "جميع الخيارات يجب أن يكون لها نص",
          });
          return;
        }
      }
    }

    // ✅ تفعيل حالة الحفظ
    setIsSaving(true);

    try {
      const examData = {
        title: examInfo.title,
        description: examInfo.description || "",
        grade_id: parseInt(examInfo.grade_id),
        group_id: examInfo.group_id ? parseInt(examInfo.group_id) : null,
        duration_minutes: parseInt(examInfo.duration_minutes),
        start_at: examInfo.start_at || null,
        end_at: examInfo.end_at || null,
        full_mark: parseFloat(examInfo.full_mark),
        randomize_questions: Number(examInfo.randomize_questions) === 1 ? 1 : 0,
      };

      let examId = editingExam?.id;

      if (editingExam) {
        const result = await updateOnlineExamInfo(examId, examData);
        if (!result.success) {
          setMessage({ type: "error", text: result.error });
          setIsSaving(false);
          return;
        }

        for (const deletedId of deletedQuestionIds) {
          await removeQuestion(deletedId);
        }

        for (const deletedOptId of deletedOptionIds) {
          await removeOption(deletedOptId);
        }

        for (const q of questions) {
          if (q.isNew) {
            const qResult = await saveQuestion(null, examId, q);
            if (qResult.success) {
              const questionId = qResult.data.id;
              for (const o of q.options) {
                await createNewOption({
                  question_id: questionId,
                  option_text: o.optionText,
                  is_correct: o.isCorrect,
                  order: o.order,
                });
              }
            }
          } else {
            await saveQuestion(q.id, examId, q);

            for (const o of q.options) {
              if (o.isNew) {
                await createNewOption({
                  question_id: q.id,
                  option_text: o.optionText,
                  is_correct: o.isCorrect,
                  order: o.order,
                });
              } else {
                await updateOptionInfo(o.id, {
                  question_id: q.id,
                  option_text: o.optionText,
                  is_correct: o.isCorrect,
                  order: o.order,
                });
              }
            }
          }
        }
      } else {
        const result = await createNewOnlineExam(examData);
        if (!result.success) {
          setMessage({ type: "error", text: result.error });
          setIsSaving(false);
          return;
        }
        examId = result.data.id;

        for (const q of questions) {
          const qResult = await saveQuestion(null, examId, q);
          if (qResult.success) {
            const questionId = qResult.data.id;
            for (const o of q.options) {
              await createNewOption({
                question_id: questionId,
                option_text: o.optionText,
                is_correct: o.isCorrect,
                order: o.order,
              });
            }
          }
        }
      }

      setMessage({
        type: "success",
        text: editingExam ? "تم تحديث الامتحان بنجاح" : "تم إضافة الامتحان بنجاح",
      });
      setShowBuilder(false);
      loadExams();
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ أثناء الحفظ" });
      console.error(error);
    } finally {
      // ✅ إلغاء حالة الحفظ بغض النظر عن النتيجة
      setIsSaving(false);
    }
  };

  const handleDelete = async (examId) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    const attemptsCount = examAttemptsMap[examId] || 0;
    const ended = isExamEnded(exam);

    if (attemptsCount > 0 && !ended) {
      notifyError("لا يمكن حذف الامتحان - لسه فيه طلاب بيمتحنوا");
      return;
    }

    let confirmMessage = "حذف هذا الامتحان؟";
    if (attemptsCount > 0 && ended) {
      confirmMessage = `تحذير: هذا الامتحان فيه ${attemptsCount} طالب.\nحذف الامتحان سيحذف كل الدرجات.\nهل أنت متأكد؟`;
    }

    confirmToast(confirmMessage, async () => {
      const result = await removeOnlineExam(examId);
      if (result.success) {
        setMessage({ type: "success", text: "تم حذف الامتحان" });
        loadExams();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const handlePermanentDelete = async (examId) => {
    confirmToast(
      "حذف نهائي للامتحان وكل أسئلته ودرجاته؟ لا يمكن التراجع!",
      async () => {
        const result = await permanentlyRemoveOnlineExam(examId);
        if (result.success) {
          notifySuccess("تم حذف الامتحان نهائيًا");
          loadExams();
        } else {
          notifyError(result.error);
        }
      },
    );
  };

  const handlePreviewQuestionFile = async (questionId) => {
    const result = await previewQuestionFileAction(questionId);
    if (!result.success) notifyError(result.error);
  };

  const handleDownloadQuestionFile = async (questionId) => {
    const result = await downloadQuestionFileDirect(questionId);
    if (!result.success) notifyError(result.error);
  };

  const openGradingModal = async (exam) => {
    setShowGradingModal(true);
    setGradingLoading(true);
    setGradingAnswers([]);
    const result = await fetchEssayAnswersByExam(exam.id);
    if (result.success) {
      const raw = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.data)
          ? result.data.data
          : [];
      setGradingAnswers(
        raw.map((a) => ({
          ...a,
          id:
            a.id ??
            a.answer_id ??
            a.student_answer_id ??
            a.studentAnswerId ??
            a.ID ??
            null,
        })),
      );
    } else {
      notifyError(result.error);
    }
    setGradingLoading(false);
  };

  const handleGradeAnswer = async (answerId, isCorrect) => {
    if (!answerId) {
      notifyError("معرّف الإجابة غير موجود، حدّث الصفحة وحاول تاني");
      return;
    }
    setGradingSubmittingId(answerId);
    const result = await gradeEssayAnswerAction(answerId, isCorrect);
    if (result.success) {
      setGradingAnswers((prev) =>
        prev.map((a) => (a.id === answerId ? { ...a, is_correct: isCorrect } : a)),
      );
      notifySuccess(isCorrect === 1 ? "تم احتساب الإجابة صحيحة" : "تم احتساب الإجابة خاطئة");
    } else {
      notifyError(result.error);
    }
    setGradingSubmittingId(null);
  };

  const handlePreviewAnswerFile = async (answerId) => {
    if (!answerId) {
      notifyError("معرّف الإجابة غير موجود، حدّث الصفحة وحاول تاني");
      return;
    }
    const result = await previewAnswerFileAction(answerId);
    if (!result.success) notifyError(result.error);
  };

  const handleDownloadAnswerFile = async (answerId, fileName) => {
    if (!answerId) {
      notifyError("معرّف الإجابة غير موجود، حدّث الصفحة وحاول تاني");
      return;
    }
    const result = await downloadAnswerFileDirect(answerId, fileName || "answer-file");
    if (!result.success) notifyError(result.error);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-500">
        جاري التحميل...
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 w-full min-h-screen" dir="rtl">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            إدارة الامتحانات
          </h1>
          <span className="text-gray-500 text-sm">
            إنشاء وإدارة الامتحانات الإلكترونية
          </span>
        </div>
        <button
          onClick={() => openBuilder(null)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition"
        >
          <Plus size={16} />
          إضافة امتحان
        </button>
      </header>

      {/* رسائل toast */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-bold ${message.type === "success"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* فلاتر */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold shrink-0">
          <Filter size={14} /> فلترة
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "الكل" },
            { key: "available", label: "المتاحة" },
            { key: "expired", label: "المنتهية" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilterType(tab.key);
                setFilterGradeId("");
                setFilterGroupId("");
                setFilterGroups([]);
                setGradeStats(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === tab.key && !filterGradeId
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 sm:mr-auto">
          <select
            value={filterGradeId}
            onChange={(e) => {
              setFilterGradeId(e.target.value);
              loadFilterGroups(e.target.value);
            }}
            className="p-2 rounded-lg border border-gray-200 text-xs bg-white outline-none"
          >
            <option value="">كل الصفوف</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          <select
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
            disabled={!filterGradeId}
            className="p-2 rounded-lg border border-gray-200 text-xs bg-white outline-none disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">كل المجموعات</option>
            {filterGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {gradeStats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <span className="block font-bold text-lg text-primary">
              {gradeStats.total_exams || 0}
            </span>
            <span className="text-xs text-gray-500">امتحانات الصف</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <span className="block font-bold text-lg text-blue-600">
              {gradeStats.total_students_attempted || 0}
            </span>
            <span className="text-xs text-gray-500">طلاب دخلوا</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <span className="block font-bold text-lg text-green-600">
              {gradeStats.overall_average || 0}
            </span>
            <span className="text-xs text-gray-500">المتوسط العام</span>
          </div>
        </div>
      )}

      {showDetailsModal && selectedExam && (
        <div
          className="fixed inset-0 z-9999 bg-black/60 flex items-center justify-center p-3"
          dir="rtl"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {selectedExam.title}
                </h2>
                <span className="text-xs text-gray-500">
                  {selectedExam.grade_name || ""} |{" "}
                  {selectedExam.duration_minutes} دقيقة |{" "}
                  {selectedExam.full_mark} درجة
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openGradingModal(selectedExam)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition"
                >
                  <ClipboardCheck size={16} />
                  تصحيح الملفات
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {examStats && (
              <div className="shrink-0 px-5 py-4 bg-gray-50 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-white rounded-xl p-3">
                  <Users size={20} className="text-blue-600 mx-auto mb-1" />
                  <span className="font-bold text-lg text-blue-600 block">
                    {examStats.students_attempted || 0}
                  </span>
                  <span className="text-xs text-gray-500">دخلوا</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <CheckCircle2
                    size={20}
                    className="text-green-600 mx-auto mb-1"
                  />
                  <span className="font-bold text-lg text-green-600 block">
                    {examStats.students_submitted || 0}
                  </span>
                  <span className="text-xs text-gray-500">خلصوا</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <Award size={20} className="text-purple-600 mx-auto mb-1" />
                  <span className="font-bold text-lg text-purple-600 block">
                    {examStats.average_score || 0}
                  </span>
                  <span className="text-xs text-gray-500">المتوسط</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <TrendingUp
                    size={20}
                    className="text-orange-600 mx-auto mb-1"
                  />
                  <span className="font-bold text-lg text-orange-600 block">
                    {examStats.highest_score || 0}
                  </span>
                  <span className="text-xs text-gray-500">أعلى</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <TrendingDown
                    size={20}
                    className="text-red-600 mx-auto mb-1"
                  />
                  <span className="font-bold text-lg text-red-600 block">
                    {examStats.lowest_score || 0}
                  </span>
                  <span className="text-xs text-gray-500">أقل</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
              {detailsLoading ? (
                <p className="text-center text-gray-400 py-8">
                  جاري التحميل...
                </p>
              ) : examStudents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  لا يوجد طلاب دخلوا هذا الامتحان بعد
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {examStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Users size={18} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm block truncate">
                            {student.student_name || student.full_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            باركود: {student.barcode}
                          </span>
                          <span className="text-xs text-gray-400 block">
                            بدأ: {formatTime(student.started_at)} | سلم:{" "}
                            {formatTime(student.submitted_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${student.status === "submitted"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                            }`}
                        >
                          {student.status === "submitted" ? "خلص" : "جاري"}
                        </span>
                        <span className="font-bold text-lg text-gray-800">
                          {student.score != null
                            ? `${student.score}/${selectedExam.full_mark}`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showGradingModal && selectedExam && (
        <div
          className="fixed inset-0 z-10000 bg-black/60 flex items-center justify-center p-3"
          dir="rtl"
          onClick={() => setShowGradingModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  تصحيح إجابات الملفات
                </h2>
                <span className="text-xs text-gray-500">
                  {selectedExam.title} — الأسئلة المقالية/الملفات بس، الـ MCQ وصح وغلط بتتصحح تلقائيًا
                </span>
              </div>
              <button
                onClick={() => setShowGradingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {gradingLoading ? (
                <p className="text-center text-gray-400 py-8">جاري التحميل...</p>
              ) : gradingAnswers.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  لا توجد إجابات ملفات تحتاج تصحيح في هذا الامتحان
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {gradingAnswers.map((answer, answerIndex) => {
                    const answerId = answer.id;
                    const fileName = (answer.file_path || answer.answer_file || "")
                      .split("/")
                      .pop();
                    const graded = answer.is_correct === 1 || answer.is_correct === 0;
                    return (
                      <div
                        key={answerId ?? answerIndex}
                        className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                              <Users size={18} className="text-purple-600" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-sm block truncate">
                                {answer.student_name || answer.full_name}
                              </span>
                              {answer.barcode && (
                                <span className="text-xs text-gray-500">
                                  باركود: {answer.barcode}
                                </span>
                              )}
                            </div>
                          </div>
                          {graded && (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${answer.is_correct === 1
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                                }`}
                            >
                              {answer.is_correct === 1 ? "صحيحة ✓" : "خاطئة ✗"}
                            </span>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs text-gray-500 block mb-1">
                            السؤال ({answer.mark ?? answer.question_mark ?? "-"} درجة)
                          </span>
                          <p className="text-sm font-semibold text-gray-800">
                            {answer.question_text || answer.question || "-"}
                          </p>
                        </div>

                        {answer.answer_text && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <span className="text-xs text-blue-500 block mb-1">
                              إجابة الطالب
                            </span>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {answer.answer_text}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handlePreviewAnswerFile(answerId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-50 transition"
                          >
                            <Eye size={14} />
                            عرض الملف
                          </button>
                          <button
                            onClick={() => handleDownloadAnswerFile(answerId, fileName)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition"
                          >
                            <Download size={14} />
                            تحميل
                          </button>
                          {fileName && (
                            <span className="text-xs text-gray-400 truncate max-w-45 flex items-center gap-1">
                              <FileText size={12} />
                              {fileName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                          <button
                            disabled={gradingSubmittingId === answerId}
                            onClick={() => handleGradeAnswer(answerId, 1)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition disabled:opacity-50"
                          >
                            <Check size={16} />
                            صحيحة
                          </button>
                          <button
                            disabled={gradingSubmittingId === answerId}
                            onClick={() => handleGradeAnswer(answerId, 0)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-50"
                          >
                            <X size={16} />
                            خاطئة
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showBuilder && (
        <div
          className="fixed inset-0 z-9999 bg-black/40 flex items-center justify-center p-3"
          dir="rtl"
          onClick={() => !isSaving && setShowBuilder(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-base">
                {editingExam ? "تعديل الامتحان" : "إضافة امتحان"}
              </h2>
              <button
                onClick={() => !isSaving && setShowBuilder(false)}
                disabled={isSaving}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="عنوان الامتحان *"
                  value={examInfo.title}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, title: e.target.value })
                  }
                  disabled={isSaving}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#9224EB] sm:col-span-2 disabled:bg-gray-50"
                />
                <select
                  value={examInfo.grade_id}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  disabled={isSaving}
                  className="p-2 rounded-lg border border-gray-200 text-sm bg-white outline-none disabled:bg-gray-50"
                >
                  <option value="">الصف *</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
                <select
                  value={examInfo.group_id}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, group_id: e.target.value })
                  }
                  disabled={isSaving}
                  className="p-2 rounded-lg border border-gray-200 text-sm bg-white outline-none disabled:bg-gray-50"
                >
                  <option value="">كل المجموعات</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="المدة (دقائق) *"
                  value={examInfo.duration_minutes}
                  onChange={(e) =>
                    setExamInfo({
                      ...examInfo,
                      duration_minutes: e.target.value,
                    })
                  }
                  disabled={isSaving}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none disabled:bg-gray-50"
                />
                <input
                  type="number"
                  placeholder="الدرجة الكلية *"
                  value={examInfo.full_mark}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, full_mark: e.target.value })
                  }
                  disabled={isSaving}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none disabled:bg-gray-50"
                />
                <input
                  type="datetime-local"
                  value={examInfo.start_at}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, start_at: e.target.value })
                  }
                  disabled={isSaving}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none disabled:bg-gray-50"
                />
                <input
                  type="datetime-local"
                  value={examInfo.end_at}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, end_at: e.target.value })
                  }
                  disabled={isSaving}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none disabled:bg-gray-50"
                />
                <textarea
                  placeholder="وصف الامتحان (اختياري)"
                  value={examInfo.description}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, description: e.target.value })
                  }
                  disabled={isSaving}
                  rows={2}
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none sm:col-span-2 resize-none disabled:bg-gray-50"
                />
                <label className="sm:col-span-2 flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 disabled:opacity-50">
                  <input
                    type="checkbox"
                    checked={Number(examInfo.randomize_questions) === 1}
                    onChange={(e) =>
                      setExamInfo({
                        ...examInfo,
                        randomize_questions: e.target.checked ? 1 : 0,
                      })
                    }
                    disabled={isSaving}
                    className="w-4 h-4 accent-[#9224EB]"
                  />
                  <Shuffle size={15} className="text-[#9224EB]" />
                  <span className="text-sm font-semibold text-gray-700">
                    ترتيب عشوائي للأسئلة
                  </span>
                </label>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#9224EB] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`السؤال ${idx + 1}`}
                      value={q.questionText}
                      onChange={(e) => updateQuestionText(q.id, e.target.value)}
                      disabled={isSaving}
                      className="flex-1 p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#9224EB] disabled:bg-gray-50"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        setQuestions(
                          questions.map((item) =>
                            item.id === q.id
                              ? {
                                ...item,
                                type,
                                options:
                                  type === "true_false"
                                    ? [
                                      {
                                        id: Date.now() + 1,
                                        isNew: true,
                                        optionText: "صح",
                                        isCorrect: 0,
                                        order: 1,
                                      },
                                      {
                                        id: Date.now() + 2,
                                        isNew: true,
                                        optionText: "خطأ",
                                        isCorrect: 0,
                                        order: 2,
                                      },
                                    ]
                                    : type === "essay"
                                      ? []
                                      : item.options,
                              }
                              : item,
                          ),
                        );
                      }}
                      disabled={isSaving}
                      className="p-2 rounded-lg border border-gray-200 text-xs bg-white outline-none disabled:bg-gray-50"
                    >
                      <option value="mcq">اختيارات</option>
                      <option value="true_false">صح/خطأ</option>
                      <option value="essay">مقالي</option>
                    </select>
                    <button
                      onClick={() => removeQuestionFromList(q.id)}
                      disabled={isSaving}
                      className="p-1 text-red-400 hover:bg-red-50 rounded disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {q.type === "essay" ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FileText size={14} />
                        سؤال مقالي - الطالب سيرفع ملف الإجابة
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-dashed border-orange-400 text-orange-600 text-xs font-bold cursor-pointer hover:bg-orange-50 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Upload size={13} />
                          {q.file ? "تغيير الملف" : "رفع ملف السؤال"}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            disabled={isSaving}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setQuestionFile(q.id, file);
                            }}
                          />
                        </label>

                        {q.file && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg max-w-[180px]">
                            <span className="truncate">{q.file.name}</span>
                            <button
                              type="button"
                              onClick={() => clearQuestionFile(q.id)}
                              disabled={isSaving}
                              className="text-red-400 disabled:opacity-50"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        )}

                        {!q.isNew && q.filePath && (
                          <>
                            <button
                              type="button"
                              onClick={() => handlePreviewQuestionFile(q.id)}
                              disabled={isSaving}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 disabled:opacity-50"
                            >
                              <Eye size={12} /> عرض
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadQuestionFile(q.id)}
                              disabled={isSaving}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-bold hover:bg-green-100 disabled:opacity-50"
                            >
                              <Download size={12} /> تحميل
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {q.options.map((opt, optIdx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            onClick={() => setCorrectOption(q.id, opt.id)}
                            disabled={isSaving}
                            className={`shrink-0 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center disabled:opacity-50 ${opt.isCorrect === 1
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                              }`}
                          >
                            {opt.isCorrect === 1 && (
                              <CheckCircle size={12} className="text-white" />
                            )}
                          </button>
                          <input
                            type="text"
                            placeholder={`اختيار ${optIdx + 1}`}
                            value={opt.optionText}
                            onChange={(e) =>
                              updateOptionText(q.id, opt.id, e.target.value)
                            }
                            disabled={isSaving}
                            className="flex-1 p-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#9224EB] disabled:bg-gray-50"
                          />
                          {q.options.length > 2 && (
                            <button
                              onClick={() => removeOptionFromList(q.id, opt.id)}
                              disabled={isSaving}
                              className="text-red-400 disabled:opacity-50"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      {q.type === "mcq" && (
                        <button
                          onClick={() => addOption(q.id)}
                          disabled={isSaving}
                          className="flex items-center gap-1 text-[#9224EB] text-xs font-bold w-fit disabled:opacity-50"
                        >
                          <PlusCircle size={12} /> اختيار
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <button
                  onClick={() => addQuestion("mcq")}
                  disabled={isSaving}
                  className="flex-1 py-2.5 border-2 border-dashed border-primary text-primary rounded-lg text-xs font-bold hover:bg-purple-50 disabled:opacity-50"
                >
                  + اختيارات
                </button>
                <button
                  onClick={() => addQuestion("true_false")}
                  disabled={isSaving}
                  className="flex-1 py-2.5 border-2 border-dashed border-blue-500 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-50 disabled:opacity-50"
                >
                  + صح/خطأ
                </button>
                <button
                  onClick={() => addQuestion("essay")}
                  disabled={isSaving}
                  className="flex-1 py-2.5 border-2 border-dashed border-orange-500 text-orange-500 rounded-lg text-xs font-bold hover:bg-orange-50 disabled:opacity-50"
                >
                  + مقالي
                </button>
              </div>
            </div>

            <div className="shrink-0 px-4 py-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={saveExam}
                disabled={isSaving}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${isSaving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                  }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  editingExam ? "تحديث" : "حفظ"
                )}
              </button>
              <button
                onClick={() => !isSaving && setShowBuilder(false)}
                disabled={isSaving}
                className="px-4 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {exams.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            لا توجد امتحانات
          </div>
        ) : (
          exams.map((exam) => {
            const attemptsCount = examAttemptsMap[exam.id] || 0;
            const ended = isExamEnded(exam);
            const isEditLocked = attemptsCount > 0;
            const isDeleteLocked = attemptsCount > 0 && !ended;

            return (
              <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                key={exam.id}
                onClick={() => openExamDetails(exam)}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:border-[#9224EB] hover:shadow-md transition cursor-pointer"
              >
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2"
                >
                  <BookIcon className="text-[#9224EB] w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{exam.title}</h3>
                    <span className="text-xs text-gray-500">
                      {exam.duration_minutes} دقيقة | {exam.full_mark} درجة
                    </span>
                  </div>
                </motion.div>

                {(exam.start_at || exam.end_at) && (
                  <div className="text-[11px] text-gray-500 flex flex-col gap-0.5">
                    {exam.start_at && (
                      <span>
                        يبدأ: {formatDate(exam.start_at)}{" "}
                        {formatTime(exam.start_at)}
                      </span>
                    )}
                    {exam.end_at && (
                      <span>
                        ينتهي: {formatDate(exam.end_at)}{" "}
                        {formatTime(exam.end_at)}
                      </span>
                    )}
                  </div>
                )}

                {Number(exam.randomize_questions) === 1 && (
                  <div className="flex items-center gap-1.5 bg-purple-50 text-[#9224EB] text-xs font-bold px-2.5 py-1.5 rounded-lg w-fit">
                    <Shuffle size={12} />
                    ترتيب عشوائي للأسئلة
                  </div>
                )}

                {attemptsCount > 0 && !ended && (
                  <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                    <Lock size={12} />
                    {attemptsCount} طالب بيمتحنوا دلوقتي
                  </div>
                )}

                {attemptsCount > 0 && ended && (
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                    <CheckCircle2 size={12} />
                    الامتحان خلص - {attemptsCount} طالب دخلوا
                  </div>
                )}

                <motion.div
                  variants={itemVariants}
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => openExamDetails(exam)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    <Eye size={12} /> تفاصيل
                  </button>
                  <button
                    onClick={() => openBuilder(exam)}
                    disabled={isEditLocked}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${isEditLocked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                  >
                    <Pencil size={12} /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    disabled={isDeleteLocked}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${isDeleteLocked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                  >
                    <Trash2 size={12} /> حذف
                  </button>
                </motion.div>

                {ended && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePermanentDelete(exam.id);
                    }}
                    className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 size={12} /> حذف نهائي
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Exams;