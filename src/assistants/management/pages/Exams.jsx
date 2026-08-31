import {
  FilePlus2,
  Trash2,
  ExternalLink,
  Calendar,
  School,
  Award,
  Clock,
  BookOpen,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Users,
  Edit,
  X,
  Search,
  RefreshCw,
  Loader2,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
} from "lucide-react";
import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  fetchAllExams,
  createNewExam,
  updateExamInfo,
  removeExam,
  permanentlyRemoveExam,
  fetchAllGrades,
  fetchAllGroups,
  fetchExamsByGrade,
  fetchExamsByGroup,
  fetchExamResultStats,
} from "../../../api/assistant/actions";
import { LoadingState } from "../components/Spinner";
import { toast, notifyError, notifySuccess, confirmToast } from "../../../lib/notify";
import { useApiQuery, useApiList, useInvalidate } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";

const PAGE_SIZE = 10;

const emptyForm = {
  title: "",
  grade_id: "",
  group_id: "",
  total_degree: 100,
  exam_date: "",
  notes: "",
};

function formatDate(d) {
  if (!d) return "";
  try {
    const date = new Date(d);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

// ✅ مكون الإحصائيات المظبوط
const ExamStatsModal = ({ isOpen, onClose, exam, stats, loading }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500 rounded-xl">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  إحصائيات النتائج
                </h2>
                <p className="text-sm text-gray-500">{exam?.title || ""}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2
                size={40}
                className="animate-spin mx-auto text-primary"
              />
              <p className="mt-3 text-gray-500">جاري تحميل الإحصائيات...</p>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {/* ✅ الحقول الصحيحة من الـ API */}
              <div className="grid grid-cols-2 gap-3">
                {/* عدد الطلاب */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-blue-600" />
                    <p className="text-xs text-blue-600 font-medium">
                      عدد الطلاب
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-800">
                    {stats.students_count || 0}
                  </p>
                </div>

                {/* متوسط الدرجات */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={16} className="text-green-600" />
                    <p className="text-xs text-green-600 font-medium">
                      متوسط الدرجات
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {stats.average_degree || 0}
                  </p>
                </div>

                {/* أعلى درجة */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <p className="text-xs text-emerald-600 font-medium">
                      أعلى درجة
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-800">
                    {stats.highest_degree || 0}
                  </p>
                </div>

                {/* أقل درجة */}
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown size={16} className="text-red-600" />
                    <p className="text-xs text-red-600 font-medium">أقل درجة</p>
                  </div>
                  <p className="text-2xl font-bold text-red-800">
                    {stats.lowest_degree || 0}
                  </p>
                </div>

                {/* الناجحين */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-green-600" />
                    <p className="text-xs text-green-600 font-medium">
                      الناجحين
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {stats.passed_count || 0}
                  </p>
                </div>

                {/* الراسبين */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <p className="text-xs text-amber-600 font-medium">
                      الراسبين
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-amber-800">
                    {stats.failed_count || 0}
                  </p>
                </div>
              </div>

              {/* نسبة النجاح */}
              {stats.students_count > 0 && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent size={16} className="text-purple-600" />
                    <p className="text-xs text-purple-600 font-medium">
                      نسبة النجاح
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-purple-800">
                      {Math.round(
                        (Number(stats.passed_count) /
                          Number(stats.students_count)) *
                          100,
                      )}
                      %
                    </p>
                    <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (Number(stats.passed_count) /
                              Number(stats.students_count)) *
                              100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">
                لا توجد إحصائيات متاحة لهذا الامتحان
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const ExamRow = memo(function ExamRow({
  exam,
  index,
  onDelete,
  onEdit,
  onEnterGrades,
  onViewStats,
}) {
  const isUpcoming = exam.exam_date
    ? new Date(exam.exam_date) > new Date()
    : false;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className={`hover:bg-green-50/40 transition-all duration-200 group ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
    >
      <td className="text-right pr-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">{exam.title}</span>
          {exam.notes && (
            <span className="text-xs text-gray-400">({exam.notes})</span>
          )}
          {isUpcoming ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full">
              <Clock size={10} /> قادم
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
              <CheckCircle size={10} /> منتهي
            </span>
          )}
        </div>
      </td>
      <td className="text-right py-4">
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
          <School size={14} />
          {exam.grade_name || "-"}
        </span>
      </td>
      <td className="text-right py-4">
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
          <Users size={14} />
          {exam.group_name || "كل الصف"}
        </span>
      </td>
      <td className="text-right py-4">
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Award size={14} />
          {exam.total_degree}
        </span>
      </td>
      <td className="text-right py-4">
        <span className="inline-flex items-center gap-1.5 text-gray-600">
          <Calendar size={14} className="text-gray-400" />
          {exam.exam_date ? formatDate(exam.exam_date) : "-"}
        </span>
      </td>
      <td className="text-left pl-6 py-4">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEnterGrades(exam)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/30 duration-300 transition-all"
          >
            <ExternalLink size={14} /> إدخال الدرجات
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onViewStats(exam)}
            className="p-2 text-purple-500 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-md"
            title="إحصائيات النتائج"
          >
            <BarChart3 size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(exam)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
            title="تعديل"
          >
            <Edit size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(exam)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
            title="حذف"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
});

const Exams = () => {
  const navigate = useNavigate();
  /* كل الرسائل toast */
  const setError = (message) => { if (message) notifyError(message); };
  const setSuccessMessage = (message) => { if (message) notifySuccess(message); };
  const invalidate = useInvalidate();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // فلاتر
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  // ✅ إحصائيات
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ✅ أخطاء الفورم
  const [formErrors, setFormErrors] = useState({});

  /* الفلاتر جزء من مفتاح الكاش: كل فلتر بيتحمل مرة واحدة وبعدها من الكاش */
  const [gradeFilterKey, groupFilterKey] = [gradeFilter, groupFilter];

  const examsQuery = useApiQuery(
    groupFilterKey
      ? qk.exams.byGroup(groupFilterKey)
      : gradeFilterKey
        ? qk.exams.byGrade(gradeFilterKey)
        : ["exams", "page", page],
    () =>
      groupFilterKey
        ? fetchExamsByGroup(groupFilterKey)
        : gradeFilterKey
          ? fetchExamsByGrade(gradeFilterKey)
          : fetchAllExams(page),
    {
      fallback: [],
      select: (data) => (Array.isArray(data) ? data : []),
      errorMessage: "حدث خطأ في تحميل الامتحانات",
    },
  );

  const gradesQuery = useApiList(qk.grades.all, fetchAllGrades, {
    select: (data) => (Array.isArray(data) ? data : []).filter((g) => g?.name && g.name.trim() !== ""),
    showErrorToast: false,
  });
  const groupsQuery = useApiList(qk.groups.all, fetchAllGroups, {
    select: (data) => (Array.isArray(data) ? data : []).filter((g) => g?.deleted === 0 || g?.deleted === undefined),
    showErrorToast: false,
  });

  const exams = examsQuery.data ?? [];
  const grades = gradesQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const loading = examsQuery.isLoading;
  const refreshing = examsQuery.isFetching && !examsQuery.isLoading;

  const isFiltered = !!(gradeFilterKey || groupFilterKey);
  const totalExams = isFiltered ? exams.length : (examsQuery.pagination?.total ?? exams.length);
  const totalPages = isFiltered
    ? Math.max(1, Math.ceil(exams.length / PAGE_SIZE))
    : (examsQuery.pagination?.totalPages ?? 1);

  const loadData = () => invalidate(["exams"], qk.assistant.dashboard);
  const handleRefresh = () => loadData();

  const handleGradeFilterChange = (gradeId) => {
    setGradeFilter(gradeId);
    setGroupFilter("");
    setPage(1);
  };

  const handleGroupFilterChange = (groupId) => {
    setGroupFilter(groupId);
    setPage(1);
  };

  // ✅ عرض الإحصائيات
  const handleViewStats = async (exam) => {
    setSelectedExam(exam);
    setStatsModalOpen(true);
    setStatsLoading(true);
    setExamStats(null);

    try {
      const result = await fetchExamResultStats(exam.id);
      if (result.success) {
        setExamStats(result.data);
      } else {
        toast.error(result.error || "حدث خطأ في تحميل الإحصائيات");
        setExamStats(null);
      }
    } catch (error) {
      console.error("Error fetching exam stats:", error);
      toast.error("حدث خطأ في تحميل الإحصائيات");
      setExamStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  // ✅ التحقق من صحة الفورم
  const validateForm = () => {
    const errors = {};

    if (!form.title?.trim()) {
      errors.title = "عنوان الاختبار مطلوب";
    } else if (form.title.trim().length < 2) {
      errors.title = "عنوان الاختبار يجب أن يكون حرفين على الأقل";
    }

    if (!form.grade_id) {
      errors.grade_id = "المرحلة الدراسية مطلوبة";
    }

    if (!form.total_degree || Number(form.total_degree) <= 0) {
      errors.total_degree = "الدرجة الكلية يجب أن تكون أكبر من صفر";
    } else if (Number(form.total_degree) > 1000) {
      errors.total_degree = "الدرجة الكلية لا يمكن أن تتجاوز 1000";
    }

    if (!form.exam_date) {
      errors.exam_date = "تاريخ الاختبار مطلوب";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const examData = {
        title: form.title.trim(),
        grade_id: Number(form.grade_id),
        group_id: form.group_id ? Number(form.group_id) : null,
        total_degree: Number(form.total_degree),
        exam_date: form.exam_date || null,
        notes: form.notes?.trim() || "",
      };

      let result;
      if (isEditing && editingId) {
        result = await updateExamInfo(editingId, examData);
        if (result.success) {
          toast.success("تم تحديث الامتحان بنجاح!");
        }
      } else {
        result = await createNewExam(examData);
        if (result.success) {
          toast.success("تم إنشاء الامتحان بنجاح!");
        }
      }

      if (result?.success) {
        setModalOpen(false);
        resetForm();
        await loadData();
      } else {
        setError(result?.error || "حدث خطأ في حفظ الامتحان");
        toast.error(result?.error || "حدث خطأ في حفظ الامتحان");
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      setError("حدث خطأ في حفظ الامتحان");
      toast.error("حدث خطأ في حفظ الامتحان");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (exam) => {
    const confirmed = await new Promise((resolve) => {
      confirmToast(`هل أنت متأكد من حذف امتحان "${exam.title}"؟`, () => resolve(true), "حذف");
      setTimeout(() => resolve(false), 8500);
    });
    if (!confirmed) return;

    try {
      const result = await removeExam(exam.id);
      if (result.success) {
        toast.success("تم حذف الامتحان بنجاح!");
        await loadData();
      } else {
        toast.error(result.error || "حدث خطأ في حذف الامتحان");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("حدث خطأ في حذف الامتحان");
    }
  };

  const handleEdit = (exam) => {
    setIsEditing(true);
    setEditingId(exam.id);
    setForm({
      title: exam.title || "",
      grade_id: exam.grade_id || "",
      group_id: exam.group_id || "",
      total_degree: exam.total_degree || 100,
      exam_date: exam.exam_date ? exam.exam_date.split("T")[0] : "",
      notes: exam.notes || "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEnterGrades = (exam) => {
    navigate(`/assistant/management/exams/${exam.id}`, {
      state: { exam },
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setError(null);
    setFormErrors({});
  };

  const groupsForGrade = useMemo(() => {
    if (!form.grade_id) return [];
    return groups.filter((g) => String(g.grade_id) === String(form.grade_id));
  }, [groups, form.grade_id]);

  const filteredExams = useMemo(() => {
    let filtered = exams;

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title?.toLowerCase().includes(term) ||
          e.notes?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [exams, search]);

  const filteredGroups = useMemo(() => {
    if (!gradeFilter) return groups;
    return groups.filter((g) => g.grade_id === Number(gradeFilter));
  }, [groups, gradeFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = filteredExams.filter(
      (e) => e.exam_date && new Date(e.exam_date) > now,
    ).length;
    return {
      total: filteredExams.length,
      upcoming,
      passed: filteredExams.length - upcoming,
    };
  }, [filteredExams]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  الامتحانات
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  إدارة الامتحانات والدرجات
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {refreshing ? "جاري التحديث..." : "تحديث"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium shadow-lg shadow-primary/30 transition-all"
            >
              <FilePlus2 size={18} /> إضافة امتحان
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        {filteredExams.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {[
              {
                label: "إجمالي الامتحانات",
                value: stats.total,
                icon: BookOpen,
                color: "green",
              },
              {
                label: "امتحانات قادمة",
                value: stats.upcoming,
                icon: Calendar,
                color: "green",
              },
              {
                label: "امتحانات منتهية",
                value: stats.passed,
                icon: Clock,
                color: "amber",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon size={16} className={`text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.header>

      {/* Exams List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        {/* Filters Bar */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالعنوان..."
                className="bg-transparent focus:outline-none w-full text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => handleGradeFilterChange(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
            >
              <option value="">كل الصفوف</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <select
              value={groupFilter}
              onChange={(e) => handleGroupFilterChange(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
            >
              <option value="">كل المجموعات</option>
              {filteredGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[500px] overflow-x-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-3">
                <BookOpen size={48} className="text-gray-300" />
                <p className="text-gray-400 font-medium">
                  {search || gradeFilter || groupFilter
                    ? "لا توجد نتائج للفلترة"
                    : "لا يوجد امتحانات"}
                </p>
                <p className="text-sm text-gray-300">
                  قم بإضافة امتحان جديد باستخدام الزر أعلاه
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                <tr>
                  <th className="text-right pr-6 py-4">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <BookOpen size={16} /> العنوان
                    </span>
                  </th>
                  <th className="text-right py-4">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <School size={16} /> المرحلة
                    </span>
                  </th>
                  <th className="text-right py-4">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <Users size={16} /> المجموعة
                    </span>
                  </th>
                  <th className="text-right py-4">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <Award size={16} /> الدرجة الكلية
                    </span>
                  </th>
                  <th className="text-right py-4">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <Calendar size={16} /> التاريخ
                    </span>
                  </th>
                  <th className="text-right pl-6 py-4">
                    <span className="text-gray-600 font-semibold text-sm">
                      الإجراءات
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredExams.map((exam, index) => (
                    <ExamRow
                      key={exam.id}
                      exam={exam}
                      index={index}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      onEnterGrades={handleEnterGrades}
                      onViewStats={handleViewStats}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-sm">
            <span className="text-gray-600">
              عرض {filteredExams.length} من {totalExams}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      page === pageNum
                        ? "bg-primary text-white shadow-md"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Exam Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl">
                      <FilePlus2 size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? "تعديل امتحان" : "إضافة امتحان جديد"}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {isEditing
                          ? "قم بتحديث بيانات الامتحان"
                          : "املأ البيانات أدناه لإنشاء اختبار جديد"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* ✅ عنوان الاختبار */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <BookOpen size={16} className="text-primary" />
                      عنوان الاختبار <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="مثال: اختبار الشهر الأول"
                      value={form.title}
                      onChange={(e) => {
                        setForm({ ...form, title: e.target.value });
                        if (formErrors.title)
                          setFormErrors({ ...formErrors, title: null });
                      }}
                      className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 ${
                        formErrors.title ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {formErrors.title && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  {/* ✅ المرحلة */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <School size={16} className="text-primary" />
                      المرحلة الدراسية <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.grade_id}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          grade_id: e.target.value,
                          group_id: "",
                        });
                        if (formErrors.grade_id)
                          setFormErrors({ ...formErrors, grade_id: null });
                      }}
                      className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 ${
                        formErrors.grade_id
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    >
                      <option value="">اختر المرحلة</option>
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.grade_id && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.grade_id}
                      </p>
                    )}
                  </div>

                  {/* ✅ المجموعة */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      المجموعة (اختياري)
                    </label>
                    <select
                      value={form.group_id}
                      onChange={(e) =>
                        setForm({ ...form, group_id: e.target.value })
                      }
                      disabled={!form.grade_id}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 disabled:opacity-60"
                    >
                      <option value="">
                        {form.grade_id
                          ? "كل مجموعات الصف"
                          : "اختر المرحلة أولاً"}
                      </option>
                      {groupsForGrade.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ✅ الدرجة الكلية */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Award size={16} className="text-primary" />
                      الدرجة الكلية <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="مثال: 100"
                      value={form.total_degree}
                      onChange={(e) => {
                        setForm({ ...form, total_degree: e.target.value });
                        if (formErrors.total_degree)
                          setFormErrors({ ...formErrors, total_degree: null });
                      }}
                      className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 ${
                        formErrors.total_degree
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />
                    {formErrors.total_degree && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.total_degree}
                      </p>
                    )}
                  </div>

                  {/* ✅ تاريخ الاختبار */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      تاريخ الاختبار <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.exam_date}
                      onChange={(e) => {
                        setForm({ ...form, exam_date: e.target.value });
                        if (formErrors.exam_date)
                          setFormErrors({ ...formErrors, exam_date: null });
                      }}
                      className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 ${
                        formErrors.exam_date
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />
                    {formErrors.exam_date && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.exam_date}
                      </p>
                    )}
                  </div>

                  {/* ✅ ملاحظات */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <FilePlus2 size={16} className="text-gray-400" />
                      ملاحظات
                    </label>
                    <textarea
                      placeholder="أي ملاحظات إضافية..."
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t-2 border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    إلغاء
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : isEditing ? (
                      "تحديث الامتحان"
                    ) : (
                      "حفظ الامتحان"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Stats Modal */}
      <ExamStatsModal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        exam={selectedExam}
        stats={examStats}
        loading={statsLoading}
      />
    </motion.section>
  );
};

export default Exams;
