import {
  CreditCard,
  Pencil,
  Search,
  Trash2,
  X,
  DollarSign,
  Calendar,
  Building2,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  FileText,
  UserCheck,
  UserX,
  AlertCircle,
  Wallet,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  fetchAllPayments,
  createNewPayment,
  updatePaymentInfo,
  removePayment,
  fetchPaymentOverall,
  fetchStudentsPaymentStatus,
  fetchAllGrades,
  fetchAllGroups,
  createNewSubscription,
  fetchStudentSubscriptions,
} from "../../../api/assistant/actions";
import { exportPdfTable } from "../../../utils/office.js";
import { ARABIC_MONTHS } from "../../../utils/helpers.js";
import { toast, notifyError, notifySuccess, confirmToast } from "../../../lib/notify";
import { useApiQuery, useApiList, useInvalidate } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";

const PAGE_SIZE = 10;

const Payments = () => {
  /* كل الرسائل بقت toast */
  const setError = (message) => { if (message) notifyError(message); };
  const setSuccessMessage = (message) => { if (message) notifySuccess(message); };

  const invalidate = useInvalidate();

  /* fetch مرة واحدة + كاش — التحديث بيحصل بعد أي تعديل حقيقي بس */
  const studentsQuery = useApiList(qk.payments.statuses, fetchStudentsPaymentStatus, { showErrorToast: false });
  const gradesQuery = useApiList(qk.grades.all, fetchAllGrades, {
    select: (data) => (Array.isArray(data) ? data : []).filter((g) => g?.name && g.name.trim() !== ""),
    showErrorToast: false,
  });
  const groupsQuery = useApiList(qk.groups.all, fetchAllGroups, {
    select: (data) => (Array.isArray(data) ? data : []).filter((g) => g?.deleted === 0 || g?.deleted === undefined),
    showErrorToast: false,
  });
  const paymentsQuery = useApiList(qk.payments.list(1, ""), () => fetchAllPayments(1, ""), { showErrorToast: false });
  const overallQuery = useApiQuery(qk.payments.overview, fetchPaymentOverall, {
    showErrorToast: false,
    fallback: {
      total_students: 0, total_required: 0, total_paid: 0,
      total_remaining: 0, fully_paid: 0, not_paid: 0,
    },
  });

  const students = studentsQuery.data ?? [];
  const grades = gradesQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const overallStats = overallQuery.data ?? {
    total_students: 0, total_required: 0, total_paid: 0,
    total_remaining: 0, fully_paid: 0, not_paid: 0,
  };

  const loading = studentsQuery.isLoading || paymentsQuery.isLoading;
  const refreshing = studentsQuery.isFetching || paymentsQuery.isFetching || overallQuery.isFetching;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

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
  const [studentSubscriptions, setStudentSubscriptions] = useState([]);
  
  // ✅ الوقت بتوقيت القاهرة (UTC+3)
  const getCurrentDateTime = () => {
    const now = new Date();
    const cairoTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const year = cairoTime.getUTCFullYear();
    const month = String(cairoTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(cairoTime.getUTCDate()).padStart(2, "0");
    const hours = String(cairoTime.getUTCHours()).padStart(2, "0");
    const minutes = String(cairoTime.getUTCMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  // ✅ دالة لتحويل التاريخ لصيغة datetime-local
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return getCurrentDateTime();
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 16);
      }
    } catch (e) {}
    
    // لو التاريخ بصيغة ISO
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return dateStr.slice(0, 16);
    }
    
    // لو التاريخ بصيغة 'MM/DD/YYYY, HH:MM:SS AM'
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      try {
        const parts = dateStr.split(', ');
        const dateParts = parts[0].split('/');
        const timeParts = parts[1].split(' ');
        const time = timeParts[0].split(':');
        const period = timeParts[1];
        
        let hours = parseInt(time[0]);
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const date = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[0]) - 1,
          parseInt(dateParts[1]),
          hours,
          parseInt(time[1])
        );
        
        return date.toISOString().slice(0, 16);
      } catch (e) {}
    }
    
    return getCurrentDateTime();
  };

  const loadData = () =>
    invalidate(qk.payments.statuses, ["payments"], qk.assistant.dashboard);

  const handleRefresh = () => {
    loadData();
  };

  // ✅ تصدير PDF
  function handleExportPdf() {
    if (!students.length) {
      toast.error('لا يوجد طلاب لتصديرهم');
      return;
    }

    const columns = [
      { header: 'الطالب', key: 'full_name' },
      { header: 'المرحلة', key: 'grade_name' },
      { header: 'المجموعة', key: 'group_name' },
      { header: 'التاريخ', key: 'subscription_month' },
      { header: 'المبلغ', key: 'paid_amount' },
      { header: 'الحالة', key: 'subscription_status' }
    ];

    const pdfRows = students.map(s => {
      const isPaid = s.subscription_status === "paid";

      const amount = isPaid
        ? Number(s.paid_amount || 0)
        : Number(s.required_amount || 0);

      return {
        full_name: s.full_name || "غير معروف",
        grade_name: s.grade_name || "بدون مرحلة",
        group_name: s.group_name || "بدون مجموعة",
        subscription_month: s.subscription_month || currentMonthStr,
        paid_amount: `${amount} ج`,
        subscription_status: isPaid ? "مدفوع" : "غير مدفوع"
      };
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const currentMonthArabic = ARABIC_MONTHS[currentMonth - 1];

    exportPdfTable(
      `كشف_مدفوعات_المصاريف_${dateStr}.pdf`,
      `كشف مدفوعات المصاريف شهر ${currentMonthArabic} ${currentYear}`,
      columns,
      pdfRows
    );
  }

  const loadStudentSubscriptions = useCallback(
    async (studentId, studentGradeId) => {
      try {
        const result = await fetchStudentSubscriptions(studentId);
        if (result.success) {
          const data = Array.isArray(result.data) ? result.data : [];
          setStudentSubscriptions(data);

          const currentSubscription = data.find(
            (s) => s.month === currentMonthStr,
          );

          if (currentSubscription) {
            setPayment((prev) => ({
              ...prev,
              subscription_id: currentSubscription.id,
              amount: currentSubscription.required_amount || 0,
            }));
          } else {
            const grade = grades.find((g) => g.id === studentGradeId);
            setPayment((prev) => ({
              ...prev,
              subscription_id: "",
              amount: grade?.monthly_price || 0,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading subscriptions:", error);
      }
    },
    [grades, currentMonthStr],
  );

  const selectStudent = useCallback(
    (student) => {
      setSelectedStudent(student);
      setIsEditing(false);
      setError(null);

      const grade = grades.find((g) => g.id === student.grade_id);
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

  const createSubscriptionForStudent = async () => {
    if (!selectedStudent) return null;

    setIsSubmitting(true);
    try {
      const subscriptionData = {
        student_id: selectedStudent.id,
        month: currentMonthStr,
      };

      const result = await createNewSubscription(subscriptionData);
      if (result.success) {
        setSuccessMessage("تم إنشاء الاشتراك بنجاح!");
        await loadStudentSubscriptions(
          selectedStudent.id,
          selectedStudent.grade_id,
        );
        setTimeout(() => setSuccessMessage(null), 3000);
        return result.data;
      } else {
        setError(result.error || "حدث خطأ في إنشاء الاشتراك");
        return null;
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      setError("حدث خطأ في إنشاء الاشتراك");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const savePayment = async () => {
    if (!selectedStudent) {
      setError("يرجى اختيار طالب أولاً");
      return;
    }

    if (!isEditing && selectedStudent.payment_status === "paid") {
      setError("هذا الطالب دفع بالفعل هذا الشهر! لا يمكن الدفع مرة أخرى.");
      return;
    }

    let subscriptionId = payment.subscription_id;

    if (!subscriptionId) {
      const newSubscription = await createSubscriptionForStudent();
      if (newSubscription) {
        subscriptionId = newSubscription.id;
        setPayment((prev) => ({ ...prev, subscription_id: subscriptionId }));
      } else {
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const paymentData = {
        subscription_id: Number(subscriptionId),
        student_id: Number(selectedStudent.id),
        amount: payment.amount,
        payment_date: payment.payment_date || getCurrentDateTime(),
        notes: payment.notes || "",
      };

      let result;
      if (isEditing && payment.id) {
        result = await updatePaymentInfo(payment.id, paymentData);
        if (result.success) {
          setSuccessMessage("تم تحديث الدفعة بنجاح!");
        }
      } else {
        result = await createNewPayment(paymentData);
        if (result.success) {
          setSuccessMessage("تم تسجيل الدفعة بنجاح!");
        }
      }

      if (result?.success) {
        await loadData();
        if (selectedStudent) {
          await loadStudentSubscriptions(
            selectedStudent.id,
            selectedStudent.grade_id,
          );
        }
        resetPaymentForm();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result?.error || "حدث خطأ في حفظ الدفعة");
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      setError("حدث خطأ في حفظ الدفعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePaymentById = async (id) => {
    const confirmed = await new Promise((resolve) => {
      confirmToast("هل أنت متأكد من حذف هذه الدفعة؟", () => resolve(true), "حذف");
      setTimeout(() => resolve(false), 8500);
    });
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const result = await removePayment(id);
      if (result.success) {
        setSuccessMessage("تم حذف الدفعة بنجاح!");
        await loadData();
        if (selectedStudent) {
          await loadStudentSubscriptions(
            selectedStudent.id,
            selectedStudent.grade_id,
          );
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || "حدث خطأ في حذف الدفعة");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      setError("حدث خطأ في حذف الدفعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ تعديل الدالة editPayment عشان تحول التاريخ للصيغة الصحيحة
  const editPayment = (paymentData) => {
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
    setIsEditing(false);
    setError(null);
  };

  // الفلترة
  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (gradeFilter) {
      filtered = filtered.filter((s) => s.grade_id === Number(gradeFilter));
    }

    if (groupFilter) {
      filtered = filtered.filter((s) => s.group_id === Number(groupFilter));
    }

    if (paymentStatusFilter === "paid") {
      filtered = filtered.filter((s) => s.payment_status === "paid");
    } else if (paymentStatusFilter === "unpaid") {
      filtered = filtered.filter((s) => s.payment_status !== "paid");
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(term) ||
          s.barcode?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [students, search, gradeFilter, groupFilter, paymentStatusFilter]);

  // الباجنيشن
  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);

  const paginatedStudents = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, page]);

  useEffect(() => {
    setPage(1);
  }, [search, gradeFilter, groupFilter, paymentStatusFilter]);

  const filteredGroups = useMemo(() => {
    if (!gradeFilter) return groups;
    return groups.filter((g) => g.grade_id === Number(gradeFilter));
  }, [groups, gradeFilter]);

  const studentPayments = useMemo(() => {
    if (!selectedStudent) return [];
    return payments
      .filter((p) => p.student_id === selectedStudent.id)
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  }, [payments, selectedStudent]);

  const paidCount = useMemo(() => {
    return filteredStudents.filter((s) => s.payment_status === "paid").length;
  }, [filteredStudents]);

  const unpaidCount = useMemo(() => {
    return filteredStudents.filter((s) => s.payment_status !== "paid").length;
  }, [filteredStudents]);

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
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                <CreditCard size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  المدفوعات
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  تسجيل وإدارة دفعات الطلاب الشهرية
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {currentMonthStr}
                  </span>
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
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {refreshing ? "جاري التحديث..." : "تحديث"}
            </motion.button>

            {/* ✅ زر PDF شغال */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <FileText size={16} /> كشف Pdf
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            {
              label: "إجمالي الطلاب",
              value: overallStats.total_students || 0,
              icon: Users,
              color: "blue",
            },
            {
              label: "مدفوع بالكامل",
              value: overallStats.fully_paid || 0,
              icon: UserCheck,
              color: "green",
            },
            {
              label: "غير مدفوع",
              value: overallStats.not_paid || 0,
              icon: UserX,
              color: "red",
            },
            {
              label: "إجمالي المطلوب",
              value: `${overallStats.total_required || 0} ج`,
              icon: DollarSign,
              color: "green",
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
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-4 border-b border-gray-100">
              {/* Search */}
              <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو الباركود"
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

              {/* Filters */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <select
                  value={gradeFilter}
                  onChange={(e) => {
                    setGradeFilter(e.target.value);
                    setGroupFilter("");
                  }}
                  className="border-2 border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
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
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                >
                  <option value="">كل المجموعات</option>
                  {filteredGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>

                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                >
                  <option value="all">الكل</option>
                  <option value="paid">مدفوع</option>
                  <option value="unpaid">غير مدفوع</option>
                </select>
              </div>

              {/* Counts */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Users size={12} /> {filteredStudents.length} طالب
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {paidCount} مدفوع
                  </span>
                  <span className="text-xs text-orange-500 flex items-center gap-1">
                    <XCircle size={12} /> {unpaidCount} غير مدفوع
                  </span>
                </div>
              </div>
            </div>

            {/* Students List with Pagination */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
              <div className="p-2 space-y-1">
                <AnimatePresence>
                  {loading ? (
                    <div className="space-y-3">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : paginatedStudents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users size={40} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        {search ||
                          gradeFilter ||
                          groupFilter ||
                          paymentStatusFilter !== "all"
                          ? "لا توجد نتائج للفلترة"
                          : "لا يوجد طلاب"}
                      </p>
                    </div>
                  ) : (
                    paginatedStudents.map((student, index) => {
                      const isSelected = selectedStudent?.id === student.id;
                      const isPaid = student.payment_status === "paid";

                      return (
                        <motion.button
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(index * 0.02, 0.3) }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectStudent(student)}
                          className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 ${isSelected
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-md"
                            : "hover:bg-gray-50 border-2 border-transparent"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isPaid
                                  ? "bg-gradient-to-r from-green-400 to-green-600"
                                  : "bg-gradient-to-r from-gray-400 to-gray-600"
                                  }`}
                              >
                                {student.full_name?.charAt(0) || "?"}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-sm text-gray-800 flex items-center gap-1">
                                  {student.full_name}
                                  {isPaid && (
                                    <CheckCircle2
                                      size={14}
                                      className="text-green-500"
                                    />
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Building2 size={10} />
                                  {student.grade_name || "—"} •{" "}
                                  {student.group_name || "بدون مجموعة"}
                                </div>
                              </div>
                            </div>
                            <div className="text-left">
                              <div
                                className={`text-sm font-bold ${isPaid ? "text-green-600" : "text-orange-500"}`}
                              >
                                {isPaid ? "مدفوع" : "مستحق"}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                {student.required_amount
                                  ? `${student.required_amount} ج`
                                  : "—"}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-sm">
                <span className="text-gray-600 text-xs">
                  عرض {paginatedStudents.length} من {filteredStudents.length}{" "}
                  طالب
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${page === pageNum
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
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Panel - Payment Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            {selectedStudent ? (
              <div className="p-4 sm:p-6">
                {/* Student Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                      {selectedStudent.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {selectedStudent.full_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedStudent.grade_name || "—"} •{" "}
                        {selectedStudent.group_name || "بدون مجموعة"}
                        <span className="mr-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {selectedStudent.barcode}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                        <Pencil size={14} /> تعديل دفعة
                      </span>
                    )}
                    {selectedStudent.payment_status === "paid" ? (
                      <span className="flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                        <CheckCircle2 size={14} /> مدفوع
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium">
                        <XCircle size={14} /> مستحق{" "}
                        {selectedStudent.required_amount
                          ? `${selectedStudent.required_amount} ج`
                          : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subscription Info */}
                {studentSubscriptions.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        الاشتراكات
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {studentSubscriptions.map((sub) => (
                        <span
                          key={sub.id}
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${sub.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {sub.month} - {sub.required_amount} ج
                          {sub.status === "paid" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertCircle size={12} />
                          )}
                          {sub.status === "paid" ? "مدفوع" : "مستحق"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                      <DollarSign size={14} className="text-primary" />
                      المبلغ
                    </label>
                    <input
                      type="number"
                      value={payment.amount ?? ""}
                      onChange={(e) =>
                        setPayment({ ...payment, amount: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white hover:border-green-300 font-bold text-lg"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      تاريخ الدفع
                    </label>
                    <input
                      type="datetime-local"
                      value={payment.payment_date || getCurrentDateTime()}
                      onChange={(e) =>
                        setPayment({ ...payment, payment_date: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white hover:border-green-300"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1.5">
                      <Pencil size={14} className="text-gray-400" />
                      ملاحظات
                    </label>
                    <input
                      value={payment.notes}
                      onChange={(e) =>
                        setPayment({ ...payment, notes: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white hover:border-green-300"
                      placeholder="أي ملاحظات..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  {selectedStudent.payment_status !== "paid" || isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={savePayment}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          {isEditing ? (
                            <Pencil size={18} />
                          ) : (
                            <CreditCard size={18} />
                          )}
                          {isEditing ? "حفظ التعديل" : "تسجيل الدفع"}
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-medium">
                      <CheckCircle2 size={18} />
                      تم الدفع هذا الشهر
                    </div>
                  )}
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetPaymentForm}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                      <X size={18} /> إلغاء
                    </motion.button>
                  )}
                </div>

                {/* Payment History */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Clock size={18} className="text-primary" />
                      سجل المدفوعات
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {studentPayments.length} دفعة
                    </span>
                  </div>

                  <div className="max-h-[250px] overflow-y-auto overflow-x-auto custom-scrollbar">
                    {studentPayments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <CreditCard
                          size={32}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        لا يوجد مدفوعات مسجلة لهذا الطالب
                      </div>
                    ) : (
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-green-50/50 sticky top-0 z-10">
                          <tr>
                            <th className="text-right px-3 py-3 text-sm font-semibold text-gray-600">
                              التاريخ
                            </th>
                            <th className="text-right px-3 py-3 text-sm font-semibold text-gray-600">
                              المبلغ
                            </th>
                            <th className="text-right px-3 py-3 text-sm font-semibold text-gray-600">
                              ملاحظات
                            </th>
                            <th className="text-center px-3 py-3 text-sm font-semibold text-gray-600">
                              إجراءات
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <AnimatePresence>
                            {studentPayments.map((p, index) => (
                              <motion.tr
                                key={p.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`hover:bg-green-50/40 transition-all duration-200 ${payment.id === p.id
                                  ? "bg-amber-50 border-r-4 border-r-amber-400"
                                  : ""
                                  }`}
                              >
                                <td className="px-3 py-3 text-sm text-gray-600">
                                  {p.payment_date
                                    ? new Date(
                                      p.payment_date,
                                    ).toLocaleDateString("ar-EG")
                                    : "-"}
                                </td>
                                <td className="px-3 py-3 text-sm font-bold text-green-600">
                                  {p.amount} ج
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-500">
                                  {p.notes || "-"}
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => editPayment(p)}
                                      className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                                      title="تعديل"
                                    >
                                      <Pencil size={14} />
                                    </motion.button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary rounded-full">
                    <Users size={48} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-700">
                      اختر طالباً
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      قم باختيار طالب من القائمة لبدء تسجيل المدفوعات
                    </p>
                  </div>
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