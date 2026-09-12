/* eslint-disable no-unused-vars */
import {
  RotateCcw,
  Download,
  Eye,
  FileText,
  Printer,
  Search,
  SquarePen,
  Trash2,
  Upload,
  UserPlus,
  GraduationCap,
  Phone,
  Users,
  Barcode,
  X,
  Filter,
  Undo2,
  AlertTriangle,
  CheckSquare,
  Square,
  RefreshCw,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddStudentDialog from "../components/AddStudentDialog.jsx";
import StudentCard from "../components/StudentCard.jsx";
import { memo, useMemo, useState, useCallback } from "react";
import {
  useApiQuery,
  useApiList,
  useApiMutation,
  useInvalidate,
} from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import {
  notifyError,
  notifySuccess,
  confirmToast,
  toast,
} from "../../../lib/notify";
import { useDebounce } from "../../../hooks/useDebounce";
import { SkeletonRows } from "../components/Spinner";
import { printBarcodeWindow } from "../../../utils/barcode.js";
import { exportPdfTable } from "../../../utils/office.js";
import {
  fetchAllStudents,
  fetchDeletedStudents,
  createNewStudent,
  updateStudentInfo,
  removeStudent,
  restoreStudent,
  permanentlyRemoveStudent,
  searchStudentByBarcode,
  fetchStudentProfile,
  fetchStudentStats,
  fetchAllGrades,
  fetchAllGroups,
  bulkUploadStudentsAction,
  downloadStudentsTemplateAction,
} from "../../../api/assistant/actions";
import Pagination from "../../../components/Pagination";
import ResponsiveTable from "../../../components/ResponsiveTable";

const PAGE_SIZE = 20;

// ============================================
// HELPERS
// ============================================

const emptyStudent = {
  id: "",
  barcode: "",
  full_name: "",
  phone: "",
  parent_phone: "",
  grade_id: "",
  group_id: "",
  notes: "",
};

// ============================================
// STUDENT ROW
// ============================================

const StudentRow = memo(function StudentRow({
  student,
  index,
  onView,
  onEdit,
  onRemove,
  onRestore,
  onHardDelete,
  onPrint,
  onToggleSelect,
  isSelected,
  isDeleted,
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.25) }}
      className={`hover:bg-blue-50/40 transition-all duration-200 group ${
        isDeleted ? "opacity-60" : ""
      } ${isSelected ? "bg-blue-50/60" : ""}`}
    >
      {/* Checkbox */}
      <td className="text-right pr-3 py-3 w-10">
        {!isDeleted && (
          <button
            type="button"
            onClick={() => onToggleSelect(student.id)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            title={isSelected ? "إلغاء التحديد" : "تحديد"}
          >
            {isSelected ? (
              <CheckSquare size={16} className="text-primary" />
            ) : (
              <Square size={16} className="text-gray-400" />
            )}
          </button>
        )}
      </td>

      {/* Barcode */}
      <td className="text-right py-3">
        <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-mono text-gray-600 group-hover:bg-blue-100 transition-colors">
          <Barcode size={11} className="text-gray-400" />
          {student.barcode || "-"}
        </span>
      </td>

      {/* Name */}
      <td className="text-right py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {student.full_name?.charAt(0) || "?"}
          </div>
          <span className="font-medium text-sm text-gray-800 truncate max-w-37.5">
            {student.full_name}
          </span>
        </div>
      </td>

      {/* Grade */}
      <td className="text-right py-3">
        <span className="inline-block bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap">
          {student.grade_name || "-"}
        </span>
      </td>

      {/* Group - hidden on mobile */}
      <td className="text-right py-3 hidden md:table-cell">
        <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap">
          {student.group_name || "-"}
        </span>
      </td>

      {/* Phone - hidden on tablet */}
      <td className="text-right py-3 hidden lg:table-cell">
        <span className="inline-flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
          <Phone size={11} className="text-gray-400" />
          {student.phone || "-"}
        </span>
      </td>

      {/* Parent Phone - hidden on tablet */}
      <td className="text-right py-3 hidden lg:table-cell text-xs text-gray-600 whitespace-nowrap">
        {student.parent_phone || "-"}
      </td>

      {/* Actions */}
      <td className="text-left pl-3 py-3">
        <div className="flex items-center gap-1 justify-end">
          {!isDeleted ? (
            <>
              <button
                type="button"
                onClick={() => onView(student)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="عرض البيانات"
              >
                <Eye size={15} />
              </button>
              <button
                type="button"
                onClick={() => onEdit(student)}
                className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                title="تعديل"
              >
                <SquarePen size={15} />
              </button>
              <button
                type="button"
                onClick={() => onPrint(student)}
                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                title="طباعة الباركود"
              >
                <Printer size={15} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(student.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onRestore(student.id)}
                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                title="استرجاع الطالب"
              >
                <Undo2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => onHardDelete(student.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="حذف نهائي"
              >
                <AlertTriangle size={15} />
              </button>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
});

// ============================================
// BULK ACTIONS BAR
// ============================================

const BulkActionsBar = ({ selectedCount, onClear, onExport, onDelete }) => {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl"
    >
      <div className="flex items-center gap-2 text-sm text-blue-800 font-medium">
        <CheckSquare size={16} />
        <span>تم تحديد {selectedCount} طالب</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
        >
          <FileText size={13} />
          تصدير PDF
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
        >
          <Trash2 size={13} />
          حذف المحدد
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
        >
          <X size={13} />
          إلغاء
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const Students = () => {
  // Modal state
  const [modal, setModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [student, setStudent] = useState(emptyStudent);

  // View state
  const [viewing, setViewing] = useState(null);
  const [viewingStats, setViewingStats] = useState(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Import state
  const [importing, setImporting] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedBarcode = useDebounce(barcodeInput, 500);

  const invalidate = useInvalidate();

  // ============================================
  // QUERIES
  // ============================================

  const gradesQuery = useApiList(qk.grades.all, fetchAllGrades, {
    select: (data) =>
      (Array.isArray(data) ? data : []).filter(
        (g) => g?.name && g.name.trim() !== "",
      ),
    showErrorToast: false,
    staleTime: 10 * 60 * 1000,
  });

  const groupsQuery = useApiList(qk.groups.all, fetchAllGroups, {
    select: (data) =>
      (Array.isArray(data) ? data : []).filter(
        (g) => g?.deleted === 0 || g?.deleted === undefined,
      ),
    showErrorToast: false,
    staleTime: 10 * 60 * 1000,
  });

  const studentsQuery = useApiQuery(
    showDeleted
      ? qk.students.deleted(page)
      : qk.students.list(page, debouncedSearch, selectedGrade, selectedGroup),
    () =>
      showDeleted
        ? fetchDeletedStudents(page)
        : fetchAllStudents(page, debouncedSearch, selectedGrade, selectedGroup),
    {
      fallback: [],
      select: (data) => (Array.isArray(data) ? data : []),
      enabled: !debouncedBarcode,
      showErrorToast: false,
      staleTime: 30 * 1000,
    },
  );

  const barcodeQuery = useApiQuery(
    ["students", "barcode", debouncedBarcode],
    () => searchStudentByBarcode(debouncedBarcode),
    {
      enabled: !!debouncedBarcode,
      showErrorToast: false,
      staleTime: 0,
    },
  );

  // ============================================
  // MEMOIZED DATA
  // ============================================

  const grades = useMemo(() => gradesQuery.data ?? [], [gradesQuery.data]);

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  const students = useMemo(() => {
    let data = [];

    if (debouncedBarcode) {
      const found = barcodeQuery.data;
      data = found && found.id ? [found] : [];
    } else {
      const raw = studentsQuery.data;
      data = Array.isArray(raw) ? raw : [];
    }

    return [...data].sort((a, b) => {
      const aNum = Number(a?.barcode) || 0;
      const bNum = Number(b?.barcode) || 0;
      return aNum - bNum;
    });
  }, [debouncedBarcode, barcodeQuery.data, studentsQuery.data]);

  const tableLoading = debouncedBarcode
    ? barcodeQuery.isLoading
    : studentsQuery.isLoading;

  const refreshing = studentsQuery.isFetching && !studentsQuery.isLoading;

  const pagination = studentsQuery.pagination;
  const total = debouncedBarcode
    ? students.length
    : (pagination?.total ?? students.length);
  const totalPages = debouncedBarcode ? 1 : (pagination?.totalPages ?? 1);
  const limit = pagination?.limit ?? PAGE_SIZE;

  // ============================================
  // MUTATIONS
  // ============================================

  const refreshStudents = useCallback(() => {
    invalidate(
      ["students"],
      qk.students.list(),
      qk.students.deleted(),
      qk.assistant.dashboard,
    );
  }, [invalidate]);

  const saveMutation = useApiMutation(
    ({ id, payload }) =>
      id ? updateStudentInfo(id, payload) : createNewStudent(payload),
    {
      invalidateKeys: [["students"], qk.assistant.dashboard],
      errorMessage: "حدث خطأ في حفظ البيانات",
      onSuccess: (_d, variables) => {
        notifySuccess(
          variables.id ? "تم تحديث الطالب بنجاح" : "تم إضافة الطالب بنجاح",
        );
        closeDialog();
      },
    },
  );

  const deleteMutation = useApiMutation((id) => removeStudent(id), {
    invalidateKeys: [["students"], qk.assistant.dashboard],
    successMessage: "تم حذف الطالب بنجاح",
    errorMessage: "حدث خطأ في حذف الطالب",
  });

  const restoreMutation = useApiMutation((id) => restoreStudent(id), {
    invalidateKeys: [["students"], qk.assistant.dashboard],
    successMessage: "تم استرجاع الطالب بنجاح",
    errorMessage: "حدث خطأ في استرجاع الطالب",
  });

  const hardDeleteMutation = useApiMutation(
    (id) => permanentlyRemoveStudent(id),
    {
      invalidateKeys: [["students"], qk.assistant.dashboard],
      successMessage: "تم حذف الطالب نهائياً",
      errorMessage: "حدث خطأ في الحذف النهائي",
    },
  );

  // ============================================
  // CRUD HANDLERS
  // ============================================

  const saveStudent = () => {
    if (!student.full_name || student.full_name.trim() === "")
      return notifyError("يرجى إدخال اسم الطالب");
    if (!student.barcode || student.barcode.trim() === "")
      return notifyError("يرجى إدخال الباركود");
    if (!student.grade_id) return notifyError("يرجى اختيار المرحلة الدراسية");
    if (!student.group_id) return notifyError("يرجى اختيار المجموعة");

    const payload = {
      barcode: student.barcode.trim(),
      full_name: student.full_name.trim(),
      phone: student.phone || "",
      parent_phone: student.parent_phone || "",
      grade_id: Number(student.grade_id),
      group_id: Number(student.group_id),
      notes: student.notes || "",
    };

    saveMutation.mutate({
      id: isEditing && student.id ? student.id : null,
      payload,
    });
  };

  const removeStudentById = (id) => {
    if (!id) return;
    confirmToast(
      "هل أنت متأكد من حذف هذا الطالب؟",
      () => deleteMutation.mutate(id),
      "حذف",
    );
  };

  const restoreStudentById = (id) => {
    if (!id) return;
    confirmToast(
      "هل أنت متأكد من استرجاع هذا الطالب؟",
      () => restoreMutation.mutate(id),
      "استرجاع",
    );
  };

  const hardDeleteStudentById = (id) => {
    if (!id) return;
    confirmToast(
      "تحذير! سيتم حذف الطالب نهائياً ولا يمكن التراجع. هل أنت متأكد؟",
      () => hardDeleteMutation.mutate(id),
      "حذف نهائي",
    );
  };

  // ============================================
  // VIEW STUDENT
  // ============================================

  const viewStudent = async (studentData) => {
    try {
      const [profileResult, statsResult] = await Promise.all([
        fetchStudentProfile(studentData.id),
        fetchStudentStats(studentData.id),
      ]);

      const profile = profileResult.success ? profileResult.data : studentData;
      const stats = statsResult.success ? statsResult.data : null;

      setViewing(profile);
      setViewingStats(stats);
    } catch (error) {
      console.error("Error viewing student:", error);
      notifyError("تعذر تحميل بيانات الطالب");
      setViewing(studentData);
      setViewingStats(null);
    }
  };

  // ============================================
  // MODAL HANDLERS
  // ============================================

  const openNew = () => {
    setStudent(emptyStudent);
    setIsEditing(false);
    setModal(true);
  };

  const openEdit = (studentData) => {
    setStudent({
      id: studentData.id,
      barcode: studentData.barcode || "",
      full_name: studentData.full_name || "",
      phone: studentData.phone || "",
      parent_phone: studentData.parent_phone || "",
      grade_id: studentData.grade_id || "",
      group_id: studentData.group_id || "",
      notes: studentData.notes || "",
    });
    setIsEditing(true);
    setModal(true);
  };

  const closeDialog = () => {
    setModal(false);
    setIsEditing(false);
    setStudent(emptyStudent);
  };

  // ============================================
  // SEARCH
  // ============================================

  const searchByBarcode = () => {
    const term = searchInput.trim();
    if (!term) {
      setBarcodeInput("");
      return;
    }
    setBarcodeInput(term);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setBarcodeInput("");
    setSelectedGrade("");
    setSelectedGroup("");
    setPage(1);
    setSelectedIds(new Set());
  };

  // ============================================
  // BULK ACTIONS
  // ============================================

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkExport = () => {
    const selected = students.filter((s) => selectedIds.has(s.id));
    if (!selected.length) {
      toast.error("لا يوجد طلاب محددين");
      return;
    }

    const columns = [
      { header: "الاسم الكامل", key: "full_name" },
      { header: "الباركود", key: "barcode" },
      { header: "رقم الجوال", key: "phone" },
      { header: "رقم ولي الامر", key: "parent_phone" },
      { header: "المرحلة", key: "grade_name" },
      { header: "المجموعة", key: "group_name" },
    ];

    const pdfRows = selected.map((s) => ({
      full_name: s.full_name,
      barcode: s.barcode,
      phone: s.phone || "-",
      parent_phone: s.parent_phone || "-",
      grade_name: s.grade_name,
      group_name: s.group_name,
    }));

    const dateStr = new Date().toISOString().split("T")[0];
    exportPdfTable(
      `كشف_طلاب_محددين_${dateStr}.pdf`,
      `كشف الطلاب المحددين (${selected.length})`,
      columns,
      pdfRows,
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = await new Promise((resolve) => {
      confirmToast(
        `هل أنت متأكد من حذف ${selectedIds.size} طالب؟`,
        () => resolve(true),
        "حذف",
      );
      setTimeout(() => resolve(false), 8500);
    });
    if (!confirmed) return;

    const ids = Array.from(selectedIds);
    let successCount = 0;
    let failCount = 0;

    for (const id of ids) {
      try {
        const result = await removeStudent(id);
        if (result.success) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      notifySuccess(`تم حذف ${successCount} طالب بنجاح`);
    }
    if (failCount > 0) {
      notifyError(`فشل حذف ${failCount} طالب`);
    }

    clearSelection();
    refreshStudents();
  };

  // ============================================
  // OTHER HANDLERS
  // ============================================

  const refreshPage = () => {
    clearAllFilters();
    refreshStudents();
  };

  const handlePrint = (studentData) => {
    printBarcodeWindow(
      {
        full_name: studentData.full_name,
        barcode: studentData.barcode,
      },
      "سنتر بشتة",
    );
  };

  const handleDownloadTemplate = async () => {
    try {
      const result = await downloadStudentsTemplateAction();
      if (!result.success) {
        toast.error(result.error || "حدث خطأ في تحميل القالب");
      }
    } catch (error) {
      console.error("Download template error:", error);
      toast.error("حدث خطأ في تحميل القالب");
    }
  };

  const handleImportExcel = async () => {
    try {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".xlsx,.xls";

      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);

        try {
          const formData = new FormData();
          formData.append("file", file);

          const result = await bulkUploadStudentsAction(formData);

          if (result.success) {
            const data = result.data;
            const successCount = data?.success_count ?? 0;
            const errorCount = data?.error_count ?? 0;

            if (successCount > 0) {
              notifySuccess(`تم استيراد ${successCount} طالب بنجاح`);
            }
            if (errorCount > 0) {
              notifyError(`فشل استيراد ${errorCount} طالب`);
            }
          } else {
            notifyError(result.error || "حدث خطأ في رفع الملف");
          }

          refreshStudents();
        } catch (error) {
          console.error("Import excel error:", error);
          notifyError(error.message || "تعذر رفع ملف الإكسل");
        } finally {
          setImporting(false);
        }
      };

      fileInput.click();
    } catch (error) {
      console.error("Import excel error:", error);
      notifyError("تعذر فتح نافذة اختيار الملف");
    }
  };

  const handleExportPdf = () => {
    if (!students.length) {
      toast.error("لا يوجد طلاب لتصديرهم");
      return;
    }

    const columns = [
      { header: "الاسم الكامل", key: "full_name" },
      { header: "الباركود", key: "barcode" },
      { header: "رقم الجوال", key: "phone" },
      { header: "رقم ولي الامر", key: "parent_phone" },
      { header: "المرحلة", key: "grade_name" },
      { header: "المجموعة", key: "group_name" },
    ];

    const pdfRows = students.map((s) => ({
      full_name: s.full_name,
      barcode: s.barcode,
      phone: s.phone || "-",
      parent_phone: s.parent_phone || "-",
      grade_name: s.grade_name,
      group_name: s.group_name,
    }));

    const dateStr = new Date().toISOString().split("T")[0];
    exportPdfTable(`كشف_الطلاب_${dateStr}.pdf`, "كشف الطلاب", columns, pdfRows);
  };

  // ============================================
  // MEMOIZED HELPERS
  // ============================================

  const groupsForSelectedGrade = useMemo(() => {
    if (!selectedGrade) return groups;
    return groups.filter((g) => String(g.grade_id) === String(selectedGrade));
  }, [groups, selectedGrade]);

  const stats = useMemo(
    () => ({
      total: students.length,
      grades: grades.length,
      groups: groups.length,
    }),
    [students, grades, groups],
  );

  const allSelected =
    students.length > 0 && selectedIds.size === students.length;

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
        dir="rtl"
      >
        {/* ==================== HEADER ==================== */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          {/* Title + Actions */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {showDeleted ? "الطلاب المحذوفين" : "الطلاب"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {showDeleted
                    ? "إدارة الطلاب المحذوفين واسترجاعهم"
                    : "إدارة بيانات الطلاب والبحث السريع"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setShowDeleted((current) => !current);
                  setPage(1);
                  setSelectedIds(new Set());
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm border-2 ${
                  showDeleted
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">
                  {showDeleted ? "عرض النشطين" : "المحذوفين"}
                </span>
              </motion.button>

              {!showDeleted && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Download size={14} />
                    <span className="hidden lg:inline">قالب Excel</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleImportExcel}
                    disabled={importing}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-60"
                  >
                    <Upload size={14} />
                    <span className="hidden lg:inline">
                      {importing ? "جاري الرفع..." : "رفع Excel"}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExportPdf}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <FileText size={14} />
                    <span className="hidden lg:inline">كشف PDF</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={refreshPage}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-60"
                  >
                    <RotateCcw
                      size={14}
                      className={refreshing ? "animate-spin" : ""}
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
                  >
                    <UserPlus size={14} />
                    <span>إضافة طالب</span>
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          {!showDeleted && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="mt-4 grid grid-cols-3 gap-2 sm:gap-3"
            >
              {[
                {
                  label: "إجمالي الطلاب",
                  value: stats.total,
                  icon: Users,
                  color: "blue",
                },
                {
                  label: "المراحل",
                  value: stats.grades,
                  icon: GraduationCap,
                  color: "green",
                },
                {
                  label: "المجموعات",
                  value: stats.groups,
                  icon: Users,
                  color: "amber",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 sm:gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <div
                    className={`p-2 rounded-lg bg-${stat.color}-100 shrink-0`}
                  >
                    <stat.icon size={16} className={`text-${stat.color}-600`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                      {stat.label}
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-gray-800 truncate">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.header>

        {/* ==================== FILTERS ==================== */}
        {!showDeleted && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedGroup("");
                    setPage(1);
                    setSelectedIds(new Set());
                  }}
                  className="flex-1 min-w-35 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
                >
                  <option value="">كل الصفوف</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setPage(1);
                    setSelectedIds(new Set());
                  }}
                  className="flex-1 min-w-35 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
                >
                  <option value="">كل المجموعات</option>
                  {groupsForSelectedGrade.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 lg:w-80 focus-within:border-primary/50 transition-colors">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setBarcodeInput("");
                    setPage(1);
                    setSelectedIds(new Set());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchByBarcode();
                  }}
                  placeholder="بحث بالباركود الخاص بالطالب..."
                  className="bg-transparent focus:outline-none text-sm w-full"
                />
                {searchInput && (
                  <button
                    onClick={clearAllFilters}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <div className="mt-3">
                  <BulkActionsBar
                    selectedCount={selectedIds.size}
                    onClear={clearSelection}
                    onExport={handleBulkExport}
                    onDelete={handleBulkDelete}
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ==================== TABLE ==================== */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {/* Table Header */}
          <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h2 className="text-sm sm:text-base font-bold text-gray-800">
                {showDeleted ? "قائمة المحذوفين" : "قائمة الطلاب"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {!showDeleted && students.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[10px] sm:text-xs text-gray-500 hover:text-primary flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare size={12} />
                  ) : (
                    <Square size={12} />
                  )}
                  <span>{allSelected ? "إلغاء الكل" : "تحديد الكل"}</span>
                </button>
              )}
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {total} طالب
              </span>
            </div>
          </div>

          {/* Table Body */}
          <ResponsiveTable
            minWidth={900}
            maxHeight="max-h-[65vh]"
            className="border-t border-gray-100"
          >
            <table className="w-full min-w-full">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                <tr>
                  <th className="text-right pr-3 py-3 w-10 text-xs font-semibold text-gray-600">
                    {/* checkbox column */}
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600">
                    الباركود ↓
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600">
                    الاسم
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600">
                    الصف
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">
                    المجموعة
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600 hidden lg:table-cell">
                    الهاتف
                  </th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600 hidden lg:table-cell">
                    ولي الأمر
                  </th>
                  <th className="text-left pl-3 py-3 text-xs font-semibold text-gray-600">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="wait">
                  {tableLoading ? (
                    <SkeletonRows rows={8} cols={8} />
                  ) : students.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <Users size={40} className="text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            {showDeleted
                              ? "لا يوجد طلاب محذوفين"
                              : "لا يوجد طلاب"}
                          </p>
                          {!showDeleted && (
                            <button
                              type="button"
                              onClick={openNew}
                              className="text-primary text-sm hover:underline font-medium"
                            >
                              إضافة طالب جديد
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    students.map((item, index) => (
                      <StudentRow
                        key={item.id || index}
                        student={item}
                        index={index}
                        onView={viewStudent}
                        onEdit={openEdit}
                        onRemove={removeStudentById}
                        onRestore={restoreStudentById}
                        onHardDelete={hardDeleteStudentById}
                        onPrint={handlePrint}
                        onToggleSelect={toggleSelect}
                        isSelected={selectedIds.has(item.id)}
                        isDeleted={showDeleted}
                      />
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </ResponsiveTable>

          {/* Pagination */}
          {!debouncedBarcode && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onChange={setPage}
              className="border-t border-gray-100"
            />
          )}
        </motion.div>
      </motion.section>

      {/* ==================== MODALS ==================== */}
      {viewing && (
        <StudentCard
          student={viewing}
          stats={viewingStats}
          onClose={() => {
            setViewing(null);
            setViewingStats(null);
          }}
        />
      )}

      {modal && (
        <AddStudentDialog
          grades={grades}
          groups={groups}
          student={student}
          setStudent={setStudent}
          isEditing={isEditing}
          onSave={saveStudent}
          onClose={closeDialog}
        />
      )}
    </>
  );
};

export default Students;
