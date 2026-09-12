/* eslint-disable no-unused-vars */
import {
  CreditCard,
  Search,
  X,
  DollarSign,
  Calendar,
  Users,
  FileText,
  UserCheck,
  UserX,
  AlertCircle,
  Wallet,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Receipt,
  Tag,
  Percent,
  Pencil,
  Trash2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useCallback, useEffect } from "react";
import {
  fetchAllPayments,
  fetchAllStudents,
  createNewPayment,
  updatePaymentInfo,
  removePayment,
  fetchPaymentOverall,
  fetchStudentsPaymentStatus,
  fetchAllGrades,
  fetchAllGroups,
  fetchStudentSubscriptions,
  createNewSubscription,
} from "../../../api/assistant/actions";
import { exportPdfTable } from "../../../utils/office.js";
import { ARABIC_MONTHS } from "../../../utils/helpers.js";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  toast,
  notifyError,
  notifySuccess,
  confirmToast,
} from "../../../lib/notify";
import {
  useApiQuery,
  useApiList,
  useInvalidate,
} from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import Pagination from "../../../components/Pagination";
import ResponsiveTable from "../../../components/ResponsiveTable";

// ============================================
// CONSTANTS
// ============================================

const PAYMENT_MODES = {
  normal: {
    value: "normal",
    label: "عادي",
    description: "المبلغ ثابت حسب سعر المجموعة",
    icon: Tag,
    color: "blue",
  },
  custom: {
    value: "custom",
    label: "مخصص",
    description: "خصم أو حالة خاصة",
    icon: Percent,
    color: "amber",
  },
};

// ============================================
// HELPERS
// ============================================

const getEgyptNow = () => {
  const now = new Date();
  return new Date(now.getTime() + 3 * 60 * 60 * 1000);
};

const getCurrentMonthStr = () => {
  const now = getEgyptNow();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getCurrentDateTime = () => {
  const now = getEgyptNow();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return getCurrentDateTime();
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return getCurrentDateTime();
    const cairoDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    return cairoDate.toISOString().slice(0, 16);
  } catch {
    return getCurrentDateTime();
  }
};

const getPaymentStatus = (student, currentMonth) => {
  if (!student) return "no_subscription";
  const isPaid =
    student.subscription_status === "paid" || student.payment_status === "paid";
  if (isPaid) return "paid";
  if (
    student.subscription_month === currentMonth ||
    student.payment_status === "no_subscription"
  ) {
    return "unpaid";
  }
  return student.payment_status || "unpaid";
};

// ============================================
// MAIN COMPONENT
// ============================================

const Payments = () => {
  const invalidate = useInvalidate();

  // ------ View state ------
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [listPage, setListPage] = useState(1);

  // ------ Filters ------
  const [searchInput, setSearchInput] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const debouncedSearch = useDebounce(searchInput, 350);

  // ------ Payment form ------
  const [paymentMode, setPaymentMode] = useState("normal");
  const [payment, setPayment] = useState({
    id: "",
    student_id: "",
    subscription_id: "",
    amount: "",
    payment_date: "",
    notes: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [studentSubscriptions, setStudentSubscriptions] = useState([]);

  const currentMonthStr = getCurrentMonthStr();
  const currentYear = parseInt(currentMonthStr.split("-")[0], 10);
  const currentMonth = parseInt(currentMonthStr.split("-")[1], 10);

  // ============================================
  // QUERIES - OPTIMIZED
  // ============================================

  // 1. Overall stats (small, single record)
  const overallQuery = useApiQuery(qk.payments.overview, fetchPaymentOverall, {
    showErrorToast: false,
    staleTime: 60 * 1000,
    fallback: {
      total_students: 0,
      total_required: 0,
      total_paid: 0,
      total_remaining: 0,
      fully_paid: 0,
      not_paid: 0,
    },
  });

  // 2. Grades + Groups (for filters) - cached
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

  // 3. Students list (paginated) - the main list
  const studentsQuery = useApiQuery(
    qk.payments.statuses,
    fetchStudentsPaymentStatus,
    {
      showErrorToast: false,
      staleTime: 30 * 1000,
      enabled: true,
    },
  );

  // 4. Payments history (only when a student is selected)
  const paymentsQuery = useApiQuery(
    selectedStudent
      ? qk.payments.list(1, "", "", "")
      : ["payments", "disabled"],
    () => fetchAllPayments(1, "", "", ""),
    {
      enabled: !!selectedStudent,
      showErrorToast: false,
      staleTime: 30 * 1000,
      fallback: [],
      select: (data) => (Array.isArray(data) ? data : []),
    },
  );

  // ============================================
  // MEMOIZED DATA
  // ============================================

  const overallStats = overallQuery.data ?? {
    total_students: 0,
    total_required: 0,
    total_paid: 0,
    total_remaining: 0,
    fully_paid: 0,
    not_paid: 0,
  };

  const grades = useMemo(() => gradesQuery.data ?? [], [gradesQuery.data]);

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  const allStudents = useMemo(() => {
    const raw = studentsQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [studentsQuery.data]);

  const payments = useMemo(
    () => paymentsQuery.data ?? [],
    [paymentsQuery.data],
  );

  // ============================================
  // FILTERED STUDENTS (client-side)
  // ============================================

  const filteredStudents = useMemo(() => {
    let filtered = allStudents;

    if (gradeFilter) {
      filtered = filtered.filter((s) => s.grade_id === Number(gradeFilter));
    }
    if (groupFilter) {
      filtered = filtered.filter((s) => s.group_id === Number(groupFilter));
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (s) => getPaymentStatus(s, currentMonthStr) === statusFilter,
      );
    }

    if (debouncedSearch) {
      const term = debouncedSearch.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(term) ||
          s.barcode?.toLowerCase().includes(term) ||
          s.phone?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [
    allStudents,
    gradeFilter,
    groupFilter,
    statusFilter,
    debouncedSearch,
    currentMonthStr,
  ]);

  const filteredGroups = useMemo(() => {
    if (!gradeFilter) return groups;
    return groups.filter((g) => g.grade_id === Number(gradeFilter));
  }, [groups, gradeFilter]);

  // Counters based on filtered students
  const paidCount = useMemo(
    () =>
      filteredStudents.filter(
        (s) => getPaymentStatus(s, currentMonthStr) === "paid",
      ).length,
    [filteredStudents, currentMonthStr],
  );

  const unpaidCount = useMemo(
    () =>
      filteredStudents.filter(
        (s) => getPaymentStatus(s, currentMonthStr) === "unpaid",
      ).length,
    [filteredStudents, currentMonthStr],
  );

  // ============================================
  // CLIENT-SIDE PAGINATION
  // ============================================

  const PAGE_SIZE = 20;
  const listTotal = filteredStudents.length;
  const listTotalPages = Math.max(1, Math.ceil(listTotal / PAGE_SIZE));

  const paginatedStudents = useMemo(() => {
    const start = (listPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, listPage]);

  // ============================================
  // SUBSCRIPTIONS LOADER
  // ============================================

  const loadStudentSubscriptions = useCallback(
    async (studentId, studentGradeId) => {
      setIsLoadingSubs(true);
      try {
        const result = await fetchStudentSubscriptions(studentId);
        if (result.success) {
          const data = Array.isArray(result.data) ? result.data : [];
          setStudentSubscriptions(data);

          const currentSub = data.find((s) => s.month === currentMonthStr);

          if (currentSub) {
            setPayment((prev) => ({
              ...prev,
              subscription_id: currentSub.id,
              amount: currentSub.required_amount || 0,
            }));
          } else {
            const grade = grades.find((g) => g.id === studentGradeId);
            setPayment((prev) => ({
              ...prev,
              subscription_id: "",
              amount: grade?.monthly_price || 0,
            }));
          }
        } else {
          setStudentSubscriptions([]);
        }
      } catch (error) {
        console.error("Error loading subscriptions:", error);
        setStudentSubscriptions([]);
      } finally {
        setIsLoadingSubs(false);
      }
    },
    [grades, currentMonthStr],
  );

  // ============================================
  // STUDENT SELECTION
  // ============================================

  const selectStudent = useCallback(
    (student) => {
      setSelectedStudent(student);
      setIsEditing(false);

      const grade = grades.find((g) => g.id === student.grade_id);
      setPaymentMode("normal");
      setPayment({
        id: "",
        student_id: student.id,
        subscription_id: "",
        amount: grade?.monthly_price || student.required_amount || 0,
        payment_date: getCurrentDateTime(),
        notes: "",
      });

      loadStudentSubscriptions(student.id, student.grade_id);
    },
    [grades, loadStudentSubscriptions],
  );

  // ============================================
  // SUBSCRIPTION AUTO-CREATE
  // ============================================

  const createSubscriptionForStudent = async () => {
    if (!selectedStudent) return null;

    setIsSubmitting(true);
    try {
      const result = await createNewSubscription({
        student_id: selectedStudent.id,
        month: currentMonthStr,
      });

      if (result.success) {
        notifySuccess("تم إنشاء الاشتراك بنجاح");
        await loadStudentSubscriptions(
          selectedStudent.id,
          selectedStudent.grade_id,
        );
        return result.data;
      }

      notifyError(result.error || "حدث خطأ في إنشاء الاشتراك");
      return null;
    } catch (error) {
      console.error("Error creating subscription:", error);
      notifyError("حدث خطأ في إنشاء الاشتراك");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // SAVE PAYMENT
  // ============================================

  const savePayment = async () => {
    if (!selectedStudent) {
      notifyError("يرجى اختيار طالب أولاً");
      return;
    }

    const studentStatus = getPaymentStatus(selectedStudent, currentMonthStr);
    if (!isEditing && studentStatus === "paid") {
      notifyError("هذا الطالب دفع بالفعل هذا الشهر");
      return;
    }

    if (!payment.amount || Number(payment.amount) <= 0) {
      notifyError("يرجى إدخال مبلغ صحيح");
      return;
    }

    let subscriptionId = payment.subscription_id;

    if (!subscriptionId) {
      const newSub = await createSubscriptionForStudent();
      if (newSub) {
        subscriptionId = newSub.id;
        setPayment((prev) => ({ ...prev, subscription_id: subscriptionId }));
      } else {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        subscription_id: Number(subscriptionId),
        student_id: Number(selectedStudent.id),
        amount: Number(payment.amount),
        payment_date: payment.payment_date || getCurrentDateTime(),
        payment_mode: paymentMode,
        notes: payment.notes || "",
      };

      let result;
      if (isEditing && payment.id) {
        result = await updatePaymentInfo(payment.id, paymentData);
        if (result.success) {
          notifySuccess("تم تحديث الدفعة بنجاح");
        }
      } else {
        result = await createNewPayment(paymentData);
        if (result.success) {
          notifySuccess("تم تسجيل الدفعة بنجاح");
        }
      }

      if (result?.success) {
        await invalidate(
          qk.payments.statuses,
          ["payments"],
          qk.assistant.dashboard,
          qk.payments.overview,
          qk.subscriptions.student(selectedStudent.id),
        );
        await loadStudentSubscriptions(
          selectedStudent.id,
          selectedStudent.grade_id,
        );
        resetPaymentForm();
      } else {
        notifyError(result?.error || "حدث خطأ في حفظ الدفعة");
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      notifyError("حدث خطأ في حفظ الدفعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // DELETE PAYMENT
  // ============================================

  const removePaymentById = async (id) => {
    const confirmed = await new Promise((resolve) => {
      confirmToast(
        "هل أنت متأكد من حذف هذه الدفعة؟",
        () => resolve(true),
        "حذف",
      );
      setTimeout(() => resolve(false), 8500);
    });
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const result = await removePayment(id);
      if (result.success) {
        notifySuccess("تم حذف الدفعة بنجاح");
        await invalidate(
          qk.payments.statuses,
          ["payments"],
          qk.assistant.dashboard,
          qk.payments.overview,
        );
        if (selectedStudent) {
          await loadStudentSubscriptions(
            selectedStudent.id,
            selectedStudent.grade_id,
          );
        }
      } else {
        notifyError(result.error || "حدث خطأ في حذف الدفعة");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      notifyError("حدث خطأ في حذف الدفعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // EDIT + RESET
  // ============================================

  const editPayment = (paymentData) => {
    setPaymentMode(paymentData.payment_mode || "normal");
    setPayment({
      id: paymentData.id,
      student_id: paymentData.student_id,
      subscription_id: paymentData.subscription_id,
      amount: paymentData.amount,
      payment_date: formatDateForInput(paymentData.payment_date),
      notes: paymentData.notes || "",
    });
    setIsEditing(true);
  };

  const resetPaymentForm = () => {
    const grade = grades.find((g) => g.id === selectedStudent?.grade_id);
    setPayment({
      id: "",
      student_id: selectedStudent?.id || "",
      subscription_id: "",
      amount: grade?.monthly_price || selectedStudent?.required_amount || 0,
      payment_date: getCurrentDateTime(),
      notes: "",
    });
    setPaymentMode("normal");
    setIsEditing(false);
  };

  // ============================================
  // REFRESH + EXPORT
  // ============================================

  const handleRefresh = () => {
    invalidate(
      qk.payments.statuses,
      ["payments"],
      qk.payments.overview,
      qk.assistant.dashboard,
    );
  };

  const handleExportPdf = () => {
    if (!filteredStudents.length) {
      toast.error("لا يوجد طلاب لتصديرهم");
      return;
    }

    const columns = [
      { header: "الطالب", key: "full_name" },
      { header: "المرحلة", key: "grade_name" },
      { header: "المجموعة", key: "group_name" },
      { header: "المطلوب", key: "required_amount" },
      { header: "المدفوع", key: "paid_amount" },
      { header: "الحالة", key: "status_label" },
    ];

    const pdfRows = filteredStudents.map((s) => {
      const status = getPaymentStatus(s, currentMonthStr);
      return {
        full_name: s.full_name || "غير معروف",
        grade_name: s.grade_name || "—",
        group_name: s.group_name || "—",
        required_amount: `${s.required_amount || 0} ج`,
        paid_amount: `${s.paid_amount || 0} ج`,
        status_label:
          status === "paid"
            ? "مدفوع"
            : status === "unpaid"
              ? "مستحق"
              : "بدون اشتراك",
      };
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const currentMonthArabic = ARABIC_MONTHS[currentMonth - 1];

    exportPdfTable(
      `كشف_مدفوعات_المصاريف_${dateStr}.pdf`,
      `كشف مدفوعات المصاريف - شهر ${currentMonthArabic} ${currentYear}`,
      columns,
      pdfRows,
    );
  };

  // ============================================
  // STUDENT PAYMENTS HISTORY
  // ============================================

  const studentPayments = useMemo(() => {
    if (!selectedStudent) return [];
    return payments
      .filter((p) => p.student_id === selectedStudent.id)
      .sort(
        (a, b) =>
          new Date(b.payment_date).getTime() -
          new Date(a.payment_date).getTime(),
      );
  }, [payments, selectedStudent]);

  // ============================================
  // FORM VALIDATION
  // ============================================

  const currentSub = useMemo(() => {
    return studentSubscriptions.find((s) => s.month === currentMonthStr);
  }, [studentSubscriptions, currentMonthStr]);

  const expectedAmount = useMemo(() => {
    if (currentSub?.required_amount) {
      return Number(currentSub.required_amount);
    }
    if (selectedStudent?.required_amount) {
      return Number(selectedStudent.required_amount);
    }
    const grade = grades.find((g) => g.id === selectedStudent?.grade_id);
    return Number(grade?.monthly_price) || 0;
  }, [currentSub, selectedStudent, grades]);

  const amountMismatch =
    paymentMode === "normal" &&
    expectedAmount > 0 &&
    Number(payment.amount) !== expectedAmount;

  const isLoading = studentsQuery.isLoading || overallQuery.isLoading;
  const refreshing =
    studentsQuery.isFetching ||
    overallQuery.isFetching ||
    paymentsQuery.isFetching;

  // ============================================
  // RENDER
  // ============================================

  return (
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
        className="mb-5"
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                المدفوعات
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-2">
                <span>تسجيل وإدارة دفعات الطلاب</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                  {currentMonthStr}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">
                {refreshing ? "جاري التحديث" : "تحديث"}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
            >
              <FileText size={14} />
              <span className="hidden sm:inline">كشف PDF</span>
            </motion.button>
          </div>
        </div>

        {/* ==================== STATS CARDS ==================== */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3"
        >
          {/* إجمالي الطلاب */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-2 rounded-lg bg-blue-100 shrink-0">
              <Users size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                إجمالي الطلاب
              </p>
              <p className="text-sm sm:text-lg font-bold text-gray-800 truncate">
                {overallStats.total_students || 0}
              </p>
            </div>
          </div>

          {/* مدفوع بالكامل */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-2 rounded-lg bg-green-100 shrink-0">
              <UserCheck size={16} className="text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                مدفوع بالكامل
              </p>
              <p className="text-sm sm:text-lg font-bold text-green-600 truncate">
                {overallStats.fully_paid || 0}
              </p>
            </div>
          </div>

          {/* غير مدفوع */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-2 rounded-lg bg-red-100 shrink-0">
              <UserX size={16} className="text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                غير مدفوع
              </p>
              <p className="text-sm sm:text-lg font-bold text-red-600 truncate">
                {overallStats.not_paid || 0}
              </p>
            </div>
          </div>

          {/* إجمالي المدفوع */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-2 rounded-lg bg-amber-100 shrink-0">
              <TrendingUp size={16} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                إجمالي المدفوع
              </p>
              <p className="text-sm sm:text-lg font-bold text-amber-600 truncate">
                {overallStats.total_paid || 0} ج
              </p>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* ==================== MAIN GRID ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* ==================== LEFT PANEL - STUDENTS LIST ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden flex flex-col h-[75vh] lg:h-[80vh]">
            {/* Filters */}
            <div className="p-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setListPage(1);
                  }}
                  placeholder="بحث بالاسم أو الباركود..."
                  className="bg-transparent focus:outline-none w-full text-sm"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <select
                  value={gradeFilter}
                  onChange={(e) => {
                    setGradeFilter(e.target.value);
                    setGroupFilter("");
                    setListPage(1);
                  }}
                  className="border-2 border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                >
                  <option value="">كل الصفوف</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>

                <select
                  value={groupFilter}
                  onChange={(e) => {
                    setGroupFilter(e.target.value);
                    setListPage(1);
                  }}
                  className="border-2 border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                >
                  <option value="">كل المجموعات</option>
                  {filteredGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-1.5 mt-2">
                {[
                  {
                    value: "all",
                    label: "الكل",
                    count: filteredStudents.length,
                  },
                  { value: "paid", label: "مدفوع", count: paidCount },
                  { value: "unpaid", label: "مستحق", count: unpaidCount },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.value);
                      setListPage(1);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === tab.value
                        ? "bg-primary text-white shadow-md shadow-primary/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        statusFilter === tab.value
                          ? "bg-white/20"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Students List (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-2 space-y-1">
                {isLoading ? (
                  <div className="space-y-2 p-2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl bg-gray-100 animate-pulse"
                      />
                    ))}
                  </div>
                ) : paginatedStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={40} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      {searchInput ||
                      gradeFilter ||
                      groupFilter ||
                      statusFilter !== "all"
                        ? "لا توجد نتائج للفلترة"
                        : "لا يوجد طلاب"}
                    </p>
                  </div>
                ) : (
                  paginatedStudents.map((student, index) => {
                    const isSelected = selectedStudent?.id === student.id;
                    const status = getPaymentStatus(student, currentMonthStr);
                    const isPaid = status === "paid";

                    return (
                      <motion.button
                        key={student.id}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.015, 0.2) }}
                        onClick={() => selectStudent(student)}
                        className={`w-full text-right px-3 py-2.5 rounded-xl transition-all duration-200 border-2 ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-sm"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                isPaid
                                  ? "bg-linear-to-br from-green-400 to-green-600"
                                  : "bg-linear-to-br from-orange-400 to-orange-600"
                              }`}
                            >
                              {student.full_name?.charAt(0) || "?"}
                            </div>
                            <div className="text-right min-w-0 flex-1">
                              <p className="font-semibold text-sm text-gray-800 truncate">
                                {student.full_name}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {student.grade_name || "—"}
                                {student.group_name &&
                                  ` • ${student.group_name}`}
                                {student.barcode && ` • ${student.barcode}`}
                              </p>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPaid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {isPaid ? "مدفوع" : "مستحق"}
                            </span>
                            {student.required_amount > 0 && (
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {student.required_amount} ج
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pagination for students list */}
            {listTotalPages > 1 && (
              <Pagination
                currentPage={listPage}
                totalPages={listTotalPages}
                total={listTotal}
                limit={PAGE_SIZE}
                onChange={setListPage}
                className="border-t border-gray-100"
              />
            )}
          </div>
        </motion.div>

        {/* ==================== RIGHT PANEL - PAYMENT FORM ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden h-[75vh] lg:h-[80vh] flex flex-col">
            {selectedStudent ? (
              <>
                {/* Student Header - Sticky */}
                <div className="p-4 border-b-2 border-gray-100 bg-linear-to-l from-primary/5 to-transparent shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                        {selectedStudent.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                          {selectedStudent.full_name}
                        </h2>
                        <p className="text-xs text-gray-500 truncate">
                          {selectedStudent.grade_name || "—"}
                          {selectedStudent.group_name &&
                            ` • ${selectedStudent.group_name}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isEditing && (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-[10px] font-medium">
                          <Pencil size={10} /> تعديل
                        </span>
                      )}
                      {getPaymentStatus(selectedStudent, currentMonthStr) ===
                      "paid" ? (
                        <span className="flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">
                          <CheckCircle2 size={12} /> مدفوع
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-medium">
                          <XCircle size={12} /> مستحق
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  {/* Subscriptions */}
                  {isLoadingSubs ? (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 animate-pulse">
                      <div className="h-4 bg-blue-200 rounded w-32" />
                    </div>
                  ) : (
                    studentSubscriptions.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet size={14} className="text-blue-600" />
                          <span className="text-xs font-semibold text-blue-800">
                            الاشتراكات المسجلة
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {studentSubscriptions.slice(0, 6).map((sub) => (
                            <span
                              key={sub.id}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 ${
                                sub.status === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {sub.month}
                              <span className="opacity-70">
                                {sub.required_amount} ج
                              </span>
                              {sub.status === "paid" ? (
                                <CheckCircle2 size={10} />
                              ) : (
                                <AlertCircle size={10} />
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {/* Payment Mode Selector */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">
                      نوع الدفع
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(PAYMENT_MODES).map((mode) => {
                        const Icon = mode.icon;
                        const isActive = paymentMode === mode.value;
                        const colorConfig = {
                          blue: {
                            border: "border-blue-500",
                            bg: "bg-blue-50",
                            icon: "text-blue-600",
                            text: "text-blue-700",
                            shadow: "shadow-blue-500/20",
                          },
                          amber: {
                            border: "border-amber-500",
                            bg: "bg-amber-50",
                            icon: "text-amber-600",
                            text: "text-amber-700",
                            shadow: "shadow-amber-500/20",
                          },
                        }[mode.color];

                        return (
                          <motion.button
                            key={mode.value}
                            type="button"
                            whileHover={!isEditing ? { scale: 1.02 } : {}}
                            whileTap={!isEditing ? { scale: 0.98 } : {}}
                            onClick={() =>
                              !isEditing && setPaymentMode(mode.value)
                            }
                            disabled={isEditing}
                            className={`p-3 rounded-xl border-2 text-right transition-all ${
                              isActive
                                ? `${colorConfig.border} ${colorConfig.bg} shadow-md ${colorConfig.shadow}`
                                : "border-gray-200 bg-white hover:border-gray-300"
                            } ${
                              isEditing ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                size={16}
                                className={
                                  isActive ? colorConfig.icon : "text-gray-400"
                                }
                              />
                              <span
                                className={`font-bold text-sm ${
                                  isActive ? colorConfig.text : "text-gray-600"
                                }`}
                              >
                                {mode.label}
                              </span>
                              {isActive && (
                                <CheckCircle2
                                  size={14}
                                  className={`${colorConfig.icon} mr-auto`}
                                />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 text-right">
                              {mode.description}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount + Date + Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <DollarSign size={12} className="text-primary" />
                        المبلغ
                      </label>
                      <input
                        type="number"
                        value={payment.amount ?? ""}
                        onChange={(e) =>
                          setPayment({ ...payment, amount: e.target.value })
                        }
                        readOnly={
                          paymentMode === "normal" && expectedAmount > 0
                        }
                        className={`w-full border-2 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-bold text-lg ${
                          amountMismatch
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200"
                        } ${
                          paymentMode === "normal" && expectedAmount > 0
                            ? "bg-gray-50 cursor-not-allowed"
                            : "bg-white"
                        }`}
                        placeholder="0.00"
                      />
                      {paymentMode === "normal" && expectedAmount > 0 && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          المبلغ الثابت: {expectedAmount} ج
                        </p>
                      )}
                      {paymentMode === "custom" && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          يمكن تعديل المبلغ يدوياً
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <Calendar size={12} className="text-primary" />
                        تاريخ الدفع
                      </label>
                      <input
                        type="datetime-local"
                        value={payment.payment_date || getCurrentDateTime()}
                        onChange={(e) =>
                          setPayment({
                            ...payment,
                            payment_date: e.target.value,
                          })
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <Receipt size={12} className="text-gray-400" />
                        ملاحظات
                      </label>
                      <input
                        value={payment.notes}
                        onChange={(e) =>
                          setPayment({ ...payment, notes: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition-all text-sm"
                        placeholder="اختياري..."
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {getPaymentStatus(selectedStudent, currentMonthStr) !==
                      "paid" || isEditing ? (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={savePayment}
                        disabled={isSubmitting || amountMismatch}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>جاري الحفظ...</span>
                          </>
                        ) : (
                          <>
                            {isEditing ? (
                              <Pencil size={18} />
                            ) : (
                              <CreditCard size={18} />
                            )}
                            <span>
                              {isEditing ? "حفظ التعديلات" : "تسجيل الدفع"}
                            </span>
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-semibold border-2 border-green-200">
                        <CheckCircle2 size={18} />
                        <span>تم الدفع لهذا الشهر</span>
                      </div>
                    )}

                    {isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={resetPaymentForm}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                      >
                        <X size={16} />
                        <span>إلغاء</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Payment History */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                        <Clock size={14} className="text-primary" />
                        سجل المدفوعات
                      </h3>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {studentPayments.length} دفعة
                      </span>
                    </div>

                    {paymentsQuery.isLoading ? (
                      <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className="h-12 rounded-lg bg-gray-100 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : studentPayments.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <CreditCard
                          size={24}
                          className="mx-auto mb-1.5 text-gray-300"
                        />
                        <p className="text-xs">
                          لا يوجد مدفوعات مسجلة لهذا الطالب
                        </p>
                      </div>
                    ) : (
                      <ResponsiveTable minWidth={500} maxHeight="max-h-[35vh]">
                        <table className="w-full text-right">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-2 py-2 text-[11px] font-semibold text-gray-600">
                                التاريخ
                              </th>
                              <th className="px-2 py-2 text-[11px] font-semibold text-gray-600">
                                المبلغ
                              </th>
                              <th className="px-2 py-2 text-[11px] font-semibold text-gray-600">
                                النوع
                              </th>
                              <th className="px-2 py-2 text-[11px] font-semibold text-gray-600 text-center">
                                إجراءات
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {studentPayments.map((p, index) => {
                              const mode =
                                PAYMENT_MODES[p.payment_mode] ||
                                PAYMENT_MODES.normal;
                              return (
                                <motion.tr
                                  key={p.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: index * 0.02 }}
                                  className={`hover:bg-green-50/40 transition-colors ${
                                    payment.id === p.id
                                      ? "bg-amber-50 border-r-2 border-r-amber-400"
                                      : ""
                                  }`}
                                >
                                  <td className="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">
                                    {p.payment_date
                                      ? new Date(
                                          p.payment_date,
                                        ).toLocaleDateString("ar-EG")
                                      : "-"}
                                  </td>
                                  <td className="px-2 py-2 text-xs font-bold text-green-600 whitespace-nowrap">
                                    {p.amount} ج
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                        p.payment_mode === "custom"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {mode.label}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => editPayment(p)}
                                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                        title="تعديل"
                                      >
                                        <Pencil size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removePaymentById(p.id)}
                                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                        title="حذف"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </ResponsiveTable>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex p-4 bg-primary/10 rounded-full mb-4"
                  >
                    <Users size={48} className="text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">
                    اختر طالباً
                  </h3>
                  <p className="text-sm text-gray-400 max-w-xs">
                    اختر طالباً من القائمة لبدء تسجيل الدفعات وعرض السجل الكامل
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Payments;
