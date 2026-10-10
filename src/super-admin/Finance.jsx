import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeDollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  FileText,
  X,
  Phone,
} from "lucide-react";
import {
  getAllPayments,
  recordPayment,
  getMonthlyCollections,
  getOverallPaymentStats,
  getUnpaidStudents,
  exportPaymentsExcel,
  exportPaymentsPdf,
  getSubscriptionsByMonth,
  createSubscription,
  updateSubscriptionStatus,
  searchStudentByBarcode,
  searchStudentByPhone,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminFinance() {
  const [activeTab, setActiveTab] = useState("collections"); // "collections" | "unpaid" | "subscriptions"

  // Data
  const [payments, setPayments] = useState([]);
  const [collectionsStats, setCollectionsStats] = useState(null);
  const [overallStats, setOverallStats] = useState(null);
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  // Loading
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // Record Payment Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "cash",
    notes: "",
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Create Subscription Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subForm, setSubForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    required_amount: 300,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [colRes, ovRes, paymentsRes] = await Promise.allSettled([
        getMonthlyCollections(),
        getOverallPaymentStats(),
        getAllPayments(),
      ]);

      if (colRes.status === "fulfilled") {
        setCollectionsStats(colRes.value?.data || colRes.value);
      }
      if (ovRes.status === "fulfilled") {
        setOverallStats(ovRes.value?.data || ovRes.value);
      }
      if (paymentsRes.status === "fulfilled") {
        const list = Array.isArray(paymentsRes.value)
          ? paymentsRes.value
          : paymentsRes.value?.payments || paymentsRes.value?.data || [];
        setPayments(list);
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحميل البيانات المالية");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaid = async () => {
    try {
      setLoading(true);
      const res = await getUnpaidStudents();
      const list = Array.isArray(res) ? res : res?.students || res?.data || [];
      setUnpaidStudents(list);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل قائمة غير المسددين");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionsByMonth(currentMonth);
      const list = Array.isArray(res)
        ? res
        : res?.subscriptions || res?.data || [];
      setSubscriptions(list);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل الاشتراكات الشهرية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "collections") {
      fetchData();
    } else if (activeTab === "unpaid") {
      fetchUnpaid();
    } else if (activeTab === "subscriptions") {
      fetchSubscriptions();
    }
  }, [activeTab, currentMonth]);

  // Export handlers
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await exportPaymentsExcel({ month: currentMonth });
      toast.success("تم تصدير كشف المدفوعات بصيغة Excel");
    } catch (err) {
      toast.error("فشل تصدير ملف Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      toast.info("جاري تجهيز تقرير المدفوعات للطباعة...");
      await exportPaymentsPdf({ month: currentMonth });
      toast.success("تم فتح تقرير المدفوعات للطباعة أو الحفظ كـ PDF");
    } catch (err) {
      toast.error("فشل فتح تقرير PDF");
    } finally {
      setExporting(false);
    }
  };

  // Search student for payment
  const handleSearchStudent = async () => {
    const q = studentSearchQuery.trim();
    if (!q) return;
    try {
      let res = null;
      if (/^\d{11}$/.test(q)) {
        res = await searchStudentByPhone(q);
      } else {
        res = await searchStudentByBarcode(q);
      }
      const st = res?.student || res?.data || res;
      if (st && st.id) {
        setFoundStudent(st);
        setPaymentForm((prev) => ({
          ...prev,
          amount: st.monthly_price || 300,
        }));
        toast.success(`تم العثور على الطالب: ${st.full_name}`);
      } else {
        toast.error("لم يتم العثور على طالب بهذا الكود أو الهاتف");
      }
    } catch (err) {
      toast.error("لم يتم العثور على طالب مطابق");
    }
  };

  const handleOpenRecordForStudent = (student) => {
    setFoundStudent(student);
    setPaymentForm({
      amount: student.required_amount || 300,
      payment_method: "cash",
      notes: "",
    });
    setIsRecordModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!foundStudent?.id || !paymentForm.amount) {
      toast.error("يرجى اختيار الطالب وتحديد المبلغ");
      return;
    }

    try {
      setSubmittingPayment(true);
      await recordPayment({
        student_id: foundStudent.id,
        subscription_id: foundStudent.subscription_id || null,
        amount: Number(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        notes: paymentForm.notes,
      });

      toast.success("تم تسجيل الدفعة بنجاح");
      setIsRecordModalOpen(false);
      setFoundStudent(null);
      setStudentSearchQuery("");
      if (activeTab === "collections") fetchData();
      if (activeTab === "unpaid") fetchUnpaid();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشل تسجيل الدفعة");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleUpdateSubStatus = async (id, status) => {
    try {
      await updateSubscriptionStatus(id, status);
      toast.success("تم تحديث حالة الاشتراك بنجاح");
      fetchSubscriptions();
    } catch (err) {
      toast.error("فشل تحديث حالة الاشتراك");
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.notes || "").toLowerCase().includes(search.toLowerCase());

    const matchesMethod = paymentMethodFilter
      ? p.payment_method === paymentMethodFilter
      : true;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] p-2 rounded-xl">
              <BadgeDollarSign size={22} />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">
              الماليات والاشتراكات الشهرية
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-normal">
            متابعة إيرادات السنتر، تسجيل مدفوعات الطلاب، وحصر غير المسددين
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFoundStudent(null);
              setStudentSearchQuery("");
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all"
          >
            <Plus size={18} />
            تسجيل دفعة جديدة
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="p-2.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-gray-200 transition-colors"
            title="تصدير كشف Excel"
          >
            <FileSpreadsheet size={18} />
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="p-2.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-gray-200 transition-colors"
            title="تصدير كشف PDF"
          >
            <FileText size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("collections")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "collections"
              ? "bg-[#1a5d1a] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <TrendingUp size={16} />
          المحصل وسجل المدفوعات
        </button>
        <button
          onClick={() => setActiveTab("unpaid")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "unpaid"
              ? "bg-[#1a5d1a] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <AlertCircle size={16} />
          الطلاب غير المسددين
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "subscriptions"
              ? "bg-[#1a5d1a] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <CreditCard size={16} />
          الاشتراكات الشهرية
        </button>
      </div>

      {/* TAB 1: COLLECTIONS */}
      {activeTab === "collections" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium block mb-1">
                إجمالي المطلوب تحصيله
              </span>
              <h3 className="text-2xl font-semibold text-gray-900">
                {(collectionsStats?.total_required || 0).toLocaleString()} ج.م
              </h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium block mb-1">
                إجمالي المحصل الفعلي
              </span>
              <h3 className="text-2xl font-semibold text-emerald-600">
                {(collectionsStats?.total_paid || 0).toLocaleString()} ج.م
              </h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium block mb-1">
                المتبقي غير المحصل
              </span>
              <h3 className="text-2xl font-semibold text-red-600">
                {(collectionsStats?.total_remaining || 0).toLocaleString()} ج.م
              </h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs text-gray-500 font-medium block mb-1">
                نسبة التحصيل للشهر
              </span>
              <h3 className="text-2xl font-semibold text-[#1a5d1a]">
                {collectionsStats?.total_required
                  ? Math.round(
                      (collectionsStats.total_paid /
                        collectionsStats.total_required) *
                        100
                    )
                  : 0}
                %
              </h3>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search
                size={18}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="البحث باسم الطالب أو الباركود أو الملاحظات..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={16} className="text-gray-400" />
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full md:w-48 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
              >
                <option value="">كافة طرق الدفع</option>
                <option value="cash">نقداً (كاش)</option>
                <option value="vodafone_cash">فودافون كاش</option>
                <option value="visa">فيزا / ماستركارد</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">جاري تحميل المدفوعات...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm font-medium">
                لا توجد مدفوعات مسجلة تطابق البحث
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-3.5 font-medium">#</th>
                      <th className="p-3.5 font-medium">اسم الطالب</th>
                      <th className="p-3.5 font-medium">الباركود</th>
                      <th className="p-3.5 font-medium">المبلغ المدفوع</th>
                      <th className="p-3.5 font-medium">طريقة الدفع</th>
                      <th className="p-3.5 font-medium">تاريخ الدفع</th>
                      <th className="p-3.5 font-medium">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredPayments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-gray-50/50">
                        <td className="p-3.5 text-gray-400">{idx + 1}</td>
                        <td className="p-3.5 font-semibold text-gray-900">
                          {p.student_name || "طالب"}
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">
                          {p.barcode || "--"}
                        </td>
                        <td className="p-3.5 font-semibold text-emerald-700">
                          {(p.amount || 0).toLocaleString()} ج.م
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                            {p.payment_method === "cash"
                              ? "نقداً (كاش)"
                              : p.payment_method === "vodafone_cash"
                              ? "فودافون كاش"
                              : p.payment_method === "visa"
                              ? "فيزا"
                              : p.payment_method || "نقداً"}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-500 font-normal">
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString("ar-EG")
                            : "--"}
                        </td>
                        <td className="p-3.5 text-gray-500 font-normal">
                          {p.notes || "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UNPAID STUDENTS */}
      {activeTab === "unpaid" && (
        <div className="space-y-6">
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-950 mb-0.5">
                قائمة الطلاب غير المسددين لاشتراك الشهر الحالي
              </h3>
              <p className="text-xs text-amber-800 font-normal">
                تتيح هذه القائمة مراجعة المتخلفين عن السداد وتسجيل الدفع بنقرة
                زر أو التواصل مع ولي الأمر هاتفياً أو عبر واتساب.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">
                  جاري حصر غير المسددين...
                </p>
              </div>
            ) : unpaidStudents.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm font-normal">
                ممتاز! جميع الطلاب قاموا بالسداد لهذا الشهر.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-3.5 font-medium">#</th>
                      <th className="p-3.5 font-medium">اسم الطالب</th>
                      <th className="p-3.5 font-medium">الباركود</th>
                      <th className="p-3.5 font-medium">الصف والمجموعة</th>
                      <th className="p-3.5 font-medium">المبلغ المطلوب</th>
                      <th className="p-3.5 font-medium">هاتف ولي الأمر</th>
                      <th className="p-3.5 text-center font-medium">إجراء فوري</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {unpaidStudents.map((st, idx) => (
                      <tr key={st.id || idx} className="hover:bg-amber-50/20">
                        <td className="p-3.5 text-gray-400">{idx + 1}</td>
                        <td className="p-3.5 font-semibold text-gray-900">
                          {st.full_name}
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">
                          {st.barcode || "--"}
                        </td>
                        <td className="p-3.5">
                          <span className="block text-gray-800 font-medium">
                            {st.grade_name || "--"}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {st.group_name || "--"}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-red-600">
                          {(st.required_amount || 300).toLocaleString()} ج.م
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-gray-900">
                          {st.parent_phone || "--"}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenRecordForStudent(st)}
                              className="px-3 py-1.5 bg-[#1a5d1a] hover:bg-[#154a15] text-white rounded-lg font-medium text-xs shadow-sm transition-all"
                            >
                              سداد الآن
                            </button>
                            {st.parent_phone && (
                              <a
                                href={`https://wa.me/2${st.parent_phone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg"
                                title="واتساب ولي الأمر"
                              >
                                <Phone size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTIONS */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <label className="text-xs font-medium text-gray-700">
                الشهر المالي:
              </label>
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#1a5d1a]"
              />
            </div>

            <button
              onClick={fetchSubscriptions}
              className="p-2.5 text-gray-600 hover:text-[#1a5d1a] border border-gray-200 rounded-xl"
              title="تحديث"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">
                  جاري تحميل الاشتراكات...
                </p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm font-normal">
                لا توجد سجلات اشتراكات مسجلة لهذا الشهر
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-3.5 font-medium">#</th>
                      <th className="p-3.5 font-medium">اسم الطالب</th>
                      <th className="p-3.5 font-medium">الشهر</th>
                      <th className="p-3.5 font-medium">المبلغ المطلوب</th>
                      <th className="p-3.5 font-medium">حالة الاشتراك</th>
                      <th className="p-3.5 text-center font-medium">تعديل الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {subscriptions.map((sub, idx) => (
                      <tr key={sub.id || idx} className="hover:bg-gray-50/50">
                        <td className="p-3.5 text-gray-400">{idx + 1}</td>
                        <td className="p-3.5 font-semibold text-gray-900">
                          {sub.student_name || "طالب"}
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">
                          {sub.month}
                        </td>
                        <td className="p-3.5 font-semibold text-gray-900">
                          {(sub.required_amount || 0).toLocaleString()} ج.م
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full font-medium ${
                              sub.status === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : sub.status === "partial"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {sub.status === "paid"
                              ? "مدفوع بالكامل"
                              : sub.status === "partial"
                              ? "مدفوع جزئياً"
                              : "غير مسدد"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <select
                            value={sub.status}
                            onChange={(e) =>
                              handleUpdateSubStatus(sub.id, e.target.value)
                            }
                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                          >
                            <option value="paid">مدفوع</option>
                            <option value="partial">جزئي</option>
                            <option value="unpaid">غير مسدد</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  تسجيل دفعة اشتراك لطالب
                </h3>
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search if student not yet selected */}
              {!foundStudent ? (
                <div className="space-y-4 mb-4">
                  <label className="block text-xs font-medium text-gray-700">
                    البحث عن الطالب (بالباركود أو رقم الهاتف)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      placeholder="اكتب كود الباركود أو رقم الهاتف واضغط بحث..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                    <button
                      type="button"
                      onClick={handleSearchStudent}
                      className="px-4 py-2.5 bg-[#1a5d1a] text-white rounded-xl text-xs font-medium"
                    >
                      بحث
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-emerald-950 text-sm">
                      {foundStudent.full_name}
                    </h4>
                    <span className="text-xs text-emerald-700 font-normal">
                      باركود: {foundStudent.barcode || "--"} • الصف:{" "}
                      {foundStudent.grade_name || "--"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFoundStudent(null)}
                    className="text-xs text-emerald-800 underline font-normal"
                  >
                    تغيير الطالب
                  </button>
                </div>
              )}

              <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    المبلغ المدفوع (ج.م) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                    placeholder="مثال: 300"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    طريقة الدفع *
                  </label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="cash">نقداً في السنتر (كاش)</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                    <option value="visa">فيزا / ماستركارد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    ملاحظات أو رقم الإيصال
                  </label>
                  <textarea
                    rows={2}
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, notes: e.target.value })
                    }
                    placeholder="تم سداد اشتراك شهر أكتوبر بالكامل..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment || !foundStudent}
                    className="px-5 py-2.5 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                  >
                    {submittingPayment ? "جاري التسجيل..." : "تأكيد واستلام المبلغ"}
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
