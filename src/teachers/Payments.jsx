import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  Wallet,
  Receipt,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  X,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Calendar,
  Users,
  Eye,
  Loader2,
} from "lucide-react";
import {
  fetchPaymentOverall,
  fetchPaymentCollections,
  fetchStudentsPaymentStatus,
  fetchPayments,
  fetchStudentFilters,
} from "../api/teacher/actions";
import { exportPdfTable } from "../utils/office";

const Payments = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("status"); // "status" | "history" | "monthly"

  // Data States
  const [overallStats, setOverallStats] = useState(null);
  const [studentsStatus, setStudentsStatus] = useState([]);
  const [collections, setCollections] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filter States
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "paid" | "unpaid" | "no_subscription"

  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [statusPage, setStatusPage] = useState(1);
  const [statusLimit, setStatusLimit] = useState(20);

  // Load General Data
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    const [overallRes, statusRes, collectionsRes, filtersRes] = await Promise.all([
      fetchPaymentOverall(),
      fetchStudentsPaymentStatus(),
      fetchPaymentCollections(),
      fetchStudentFilters(),
    ]);

    if (overallRes.success) setOverallStats(overallRes.data);
    if (statusRes.success) setStudentsStatus(statusRes.data || []);
    if (collectionsRes.success) setCollections(collectionsRes.data || []);
    if (filtersRes.success) {
      setGrades(filtersRes.data.grades || []);
      setGroups(filtersRes.data.groups || []);
    }

    setLoading(false);
  }, []);

  // Load Payments History (Paginated)
  const loadHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    const res = await fetchPayments(page, searchQuery, selectedGrade, selectedGroup);
    if (res.success) {
      setPaymentHistory(res.data || []);
      if (res.pagination) {
        setPagination({
          page: res.pagination.page || 1,
          totalPages: res.pagination.totalPages || 1,
          total: res.pagination.total || 0,
        });
      }
    }
    setHistoryLoading(false);
  }, [searchQuery, selectedGrade, selectedGroup]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory(historyPage);
    }
  }, [activeTab, historyPage, loadHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (activeTab === "history") {
      await loadHistory(historyPage);
    }
    setRefreshing(false);
  };

  // Filtered groups based on selectedGrade
  const filteredGroups = useMemo(() => {
    if (!selectedGrade) return groups;
    return groups.filter((g) => String(g.grade_id) === String(selectedGrade));
  }, [groups, selectedGrade]);

  // Filtered Students Status List
  const filteredStudents = useMemo(() => {
    return studentsStatus.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGrade =
        !selectedGrade || String(s.grade_id) === String(selectedGrade);

      const matchesGroup =
        !selectedGroup || String(s.group_id) === String(selectedGroup);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && s.payment_status === "paid") ||
        (statusFilter === "unpaid" && s.payment_status === "unpaid") ||
        (statusFilter === "no_subscription" && s.payment_status === "no_subscription");

      return matchesSearch && matchesGrade && matchesGroup && matchesStatus;
    });
  }, [studentsStatus, searchQuery, selectedGrade, selectedGroup, statusFilter]);

  // Reset status pagination on filter change
  useEffect(() => {
    setStatusPage(1);
  }, [searchQuery, selectedGrade, selectedGroup, statusFilter]);

  const totalStatusPages = useMemo(() => {
    if (statusLimit === "all") return 1;
    return Math.max(1, Math.ceil(filteredStudents.length / Number(statusLimit)));
  }, [filteredStudents.length, statusLimit]);

  const paginatedStudents = useMemo(() => {
    if (statusLimit === "all") return filteredStudents;
    const limitNum = Number(statusLimit);
    const start = (statusPage - 1) * limitNum;
    return filteredStudents.slice(start, start + limitNum);
  }, [filteredStudents, statusPage, statusLimit]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const totalCollected = Number(overallStats?.total_paid || 0);
    const totalRequired = Number(overallStats?.total_required || 0);
    const totalRemaining = Math.max(0, totalRequired - totalCollected);
    const collectionRate =
      totalRequired > 0
        ? Math.round((totalCollected / totalRequired) * 100)
        : 0;

    const fullyPaid = Number(overallStats?.fully_paid || 0);
    const notPaid = Number(overallStats?.not_paid || 0);
    const totalStudents = Number(overallStats?.total_students || 0);

    return {
      totalCollected,
      totalRequired,
      totalRemaining,
      collectionRate,
      fullyPaid,
      notPaid,
      totalStudents,
    };
  }, [overallStats]);

  // Format Date & Time in 12-hour format
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const formattedDate = date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate} - ${formattedTime}`;
  };

  // PDF Export
  const handleExportPDF = () => {
    setExporting(true);
    try {
      const gradeLabel = selectedGrade
        ? grades.find((g) => String(g.id) === String(selectedGrade))?.name
        : "";
      const groupLabel = selectedGroup
        ? groups.find((g) => String(g.id) === String(selectedGroup))?.name
        : "";
      const filterDesc = [gradeLabel, groupLabel].filter(Boolean).join(" - ");
      const title = filterDesc
        ? `تقرير مدفوعات واشتراكات الطلاب (${filterDesc})`
        : "تقرير مدفوعات واشتراكات الطلاب العام";

      const rows = filteredStudents.map((s, index) => {
        const req = Number(s.required_amount || 0);
        const paid = Number(s.paid_amount || 0);
        const rem = Math.max(0, req - paid);
        let statusText = "غير مسدد";
        if (s.payment_status === "paid") statusText = "مسدد بالكامل";
        else if (s.payment_status === "no_subscription") statusText = "بدون اشتراك";

        return {
          index: index + 1,
          full_name: s.full_name || "-",
          barcode: s.barcode || "-",
          grade_name: s.grade_name || "-",
          group_name: s.group_name || "-",
          required: `${req} ج.م`,
          paid: `${paid} ج.م`,
          remaining: `${rem} ج.م`,
          status: statusText,
        };
      });

      exportPdfTable(
        `تقرير_المدفوعات_${new Date().toISOString().slice(0, 10)}.pdf`,
        `${title} - إجمالي الطلاب: ${rows.length}`,
        [
          { header: "#", key: "index", width: 6 },
          { header: "اسم الطالب", key: "full_name", width: 32 },
          { header: "الباركود", key: "barcode", width: 16 },
          { header: "الصف", key: "grade_name", width: 18 },
          { header: "المجموعة", key: "group_name", width: 16 },
          { header: "المطلوب", key: "required", width: 16 },
          { header: "المدفوع", key: "paid", width: 16 },
          { header: "المتبقي", key: "remaining", width: 16 },
          { header: "الحالة", key: "status", width: 16 },
        ],
        rows
      );
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل بيانات المدفوعات والاشتراكات...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 w-full min-h-screen p-3 sm:p-6"
      dir="rtl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-[#009966]" size={28} />
            المدفوعات والاشتراكات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            متابعة دقيقة لتحصيلات واشتراكات الطلاب والمبالغ المتبقية
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleExportPDF}
            disabled={exporting || filteredStudents.length === 0}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            title="تصدير كشف PDF للمدفوعات"
          >
            {exporting ? (
              <Loader2 size={15} className="animate-spin text-gray-400" />
            ) : (
              <FileText size={15} className="text-gray-500" />
            )}
            <span>{exporting ? "جاري التجهيز..." : "كشف PDF"}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:border-[#009966] hover:text-[#009966] transition disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-[#009966]" : ""} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* Total Collected */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-3.5">
          <div className="bg-emerald-50 rounded-xl p-3 shrink-0 text-emerald-600">
            <Wallet size={24} />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-500 font-medium block">إجمالي المحصل</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              <span dir="ltr">{metrics.totalCollected.toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-600 mr-1.5">ج.م</span>
            </div>
          </div>
        </div>

        {/* Total Required */}
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs flex items-center gap-3.5">
          <div className="bg-blue-50 rounded-xl p-3 shrink-0 text-blue-600">
            <Receipt size={24} />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-500 font-medium block">إجمالي المطلوب</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              <span dir="ltr">{metrics.totalRequired.toLocaleString()}</span>
              <span className="text-xs font-bold text-blue-600 mr-1.5">ج.م</span>
            </div>
          </div>
        </div>

        {/* Total Remaining */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-3.5">
          <div className="bg-amber-50 rounded-xl p-3 shrink-0 text-amber-600">
            <AlertCircle size={24} />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-gray-500 font-medium block">المتبقي للتحصيل</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              <span dir="ltr">{metrics.totalRemaining.toLocaleString()}</span>
              <span className="text-xs font-bold text-amber-600 mr-1.5">ج.م</span>
            </div>
          </div>
        </div>

        {/* Collection Rate & Paid Ratio */}
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex items-center gap-3.5">
          <div className="bg-purple-50 rounded-xl p-3 shrink-0 text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs text-gray-500 font-medium block">نسبة التحصيل العامة</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-gray-900" dir="ltr">
                {metrics.collectionRate}%
              </span>
              <span className="text-[11px] text-gray-400">
                ({metrics.fullyPaid} مسدد / {metrics.totalStudents} طالب)
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#009966] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.collectionRate)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants} className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("status")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "status"
              ? "border-[#009966] text-[#009966]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users size={16} />
          <span>حالة اشتراكات الطلاب</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            {filteredStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "history"
              ? "border-[#009966] text-[#009966]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <CreditCard size={16} />
          <span>سجل المعاملات اليومية</span>
        </button>

        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "monthly"
              ? "border-[#009966] text-[#009966]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar size={16} />
          <span>إحصائيات الشهور</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {collections.length}
          </span>
        </button>
      </motion.div>

      {/* TAB 1: STUDENTS PAYMENT STATUS */}
      {activeTab === "status" && (
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-md focus-within:border-[#009966] focus-within:bg-white transition">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="بحث باسم الطالب أو الباركود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-3 gap-2 flex-wrap items-center">
              {/* Grade */}
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedGroup("");
                }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-gray-700 focus:outline-none focus:border-[#009966]"
              >
                <option value="">كل الصفوف</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              {/* Group */}
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={!selectedGrade}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-gray-700 focus:outline-none focus:border-[#009966] disabled:opacity-50"
              >
                <option value="">كل المجموعات</option>
                {filteredGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              {/* Payment Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-gray-700 focus:outline-none focus:border-[#009966]"
              >
                <option value="all">كل الحالات</option>
                <option value="paid">مسدد بالكامل</option>
                <option value="unpaid">غير مسدد</option>
                <option value="no_subscription">بدون اشتراك</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                <Users size={40} className="text-gray-300" />
                <p className="text-sm font-bold">لا يوجد طلاب يطابقون شروط البحث</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[11px] sm:text-xs text-gray-500 font-bold">
                      <th className="p-3.5 pr-4">#</th>
                      <th className="p-3.5">الطالب</th>
                      <th className="p-3.5">الباركود</th>
                      <th className="p-3.5">الصف والمجموعة</th>
                      <th className="p-3.5">المطلوب</th>
                      <th className="p-3.5">المدفوع</th>
                      <th className="p-3.5">المتبقي</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {paginatedStudents.map((student, idx) => {
                      const required = Number(student.required_amount || 0);
                      const paid = Number(student.paid_amount || 0);
                      const remaining = Math.max(0, required - paid);
                      const isPaid = student.payment_status === "paid";
                      const isNoSub = student.payment_status === "no_subscription";
                      const itemIndex =
                        statusLimit === "all"
                          ? idx + 1
                          : (statusPage - 1) * Number(statusLimit) + idx + 1;

                      return (
                        <tr
                          key={student.id || idx}
                          className="hover:bg-gray-50/80 transition group"
                        >
                          <td className="p-3.5 pr-4 text-gray-400 font-bold text-xs">
                            {itemIndex}
                          </td>
                          <td className="p-3.5">
                            <span
                              onClick={() => navigate(`/teacher/students/${student.id}`)}
                              className="font-bold text-gray-900 group-hover:text-[#009966] cursor-pointer transition block"
                            >
                              {student.full_name}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600" dir="ltr">
                              {student.barcode || "-"}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-600 text-xs">
                            <div>{student.grade_name || "-"}</div>
                            <div className="text-gray-400 text-[11px]">{student.group_name || "-"}</div>
                          </td>
                          <td className="p-3.5 font-bold text-gray-700">
                            <span dir="ltr">{required.toLocaleString()}</span> ج.م
                          </td>
                          <td className="p-3.5 font-bold text-emerald-600">
                            <span dir="ltr">{paid.toLocaleString()}</span> ج.م
                          </td>
                          <td className="p-3.5 font-bold">
                            <span
                              className={remaining > 0 ? "text-amber-600" : "text-gray-400"}
                              dir="ltr"
                            >
                              {remaining.toLocaleString()} ج.م
                            </span>
                          </td>
                          <td className="p-3.5">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={12} />
                                مسدد
                              </span>
                            ) : isNoSub ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                <Clock size={12} />
                                بدون اشتراك
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                <XCircle size={12} />
                                غير مسدد
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => navigate(`/teacher/students/${student.id}`)}
                              className="p-1.5 text-gray-400 hover:text-[#009966] hover:bg-emerald-50 rounded-lg transition"
                              title="عرض ملف الطالب"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls for Tab 1 */}
            {filteredStudents.length > 0 && (
              <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 bg-white">
                <div className="flex items-center gap-3 flex-wrap">
                  <span>
                    عرض{" "}
                    <strong className="text-gray-900 font-bold">
                      {statusLimit === "all" ? 1 : (statusPage - 1) * Number(statusLimit) + 1}
                    </strong>{" "}
                    إلى{" "}
                    <strong className="text-gray-900 font-bold">
                      {statusLimit === "all"
                        ? filteredStudents.length
                        : Math.min(statusPage * Number(statusLimit), filteredStudents.length)}
                    </strong>{" "}
                    من إجمالي{" "}
                    <strong className="text-[#009966] font-bold">{filteredStudents.length}</strong> طالب
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span>لكل صفحة:</span>
                    <select
                      value={statusLimit}
                      onChange={(e) => {
                        const val = e.target.value === "all" ? "all" : Number(e.target.value);
                        setStatusLimit(val);
                        setStatusPage(1);
                      }}
                      className="border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-gray-700 font-medium focus:outline-none focus:border-[#009966]"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="all">الكل</option>
                    </select>
                  </div>
                </div>

                {statusLimit !== "all" && totalStatusPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStatusPage((p) => Math.max(1, p - 1))}
                      disabled={statusPage <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-[#009966] hover:text-[#009966] disabled:opacity-40 transition font-medium text-gray-700 bg-white shadow-xs"
                    >
                      <ChevronRight size={14} />
                      <span>السابق</span>
                    </button>

                    <span className="px-2 font-medium text-gray-700">
                      صفحة {statusPage} من {totalStatusPages}
                    </span>

                    <button
                      onClick={() => setStatusPage((p) => Math.min(totalStatusPages, p + 1))}
                      disabled={statusPage >= totalStatusPages}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-[#009966] hover:text-[#009966] disabled:opacity-40 transition font-medium text-gray-700 bg-white shadow-xs"
                    >
                      <span>التالي</span>
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 2: PAYMENTS HISTORY (LEDGER) */}
      {activeTab === "history" && (
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {historyLoading ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin text-[#009966]" />
                <p className="text-sm">جاري تحميل سجل المعاملات...</p>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                <CreditCard size={40} className="text-gray-300" />
                <p className="text-sm font-bold">لا توجد عمليات دفع مسجلة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[11px] sm:text-xs text-gray-500 font-bold">
                      <th className="p-3.5 pr-4">#</th>
                      <th className="p-3.5">اسم الطالب</th>
                      <th className="p-3.5">الباركود</th>
                      <th className="p-3.5">المبلغ المحصل</th>
                      <th className="p-3.5">شهر الاشتراك</th>
                      <th className="p-3.5">طريقة الدفع</th>
                      <th className="p-3.5">تاريخ ووقت المعاملة</th>
                      <th className="p-3.5">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {paymentHistory.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/80 transition">
                        <td className="p-3.5 pr-4 text-gray-400 font-bold text-xs">
                          {(pagination.page - 1) * 20 + idx + 1}
                        </td>
                        <td className="p-3.5 font-bold text-gray-900">
                          <span
                            onClick={() => navigate(`/teacher/students/${item.student_id}`)}
                            className="cursor-pointer hover:text-[#009966] transition"
                          >
                            {item.student_name || "-"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600" dir="ltr">
                            {item.barcode || "-"}
                          </span>
                        </td>
                        <td className="p-3.5 font-black text-emerald-600">
                          <span dir="ltr">{Number(item.amount || 0).toLocaleString()}</span> ج.م
                        </td>
                        <td className="p-3.5 font-bold text-gray-600">
                          {item.subscription_month || "-"}
                        </td>
                        <td className="p-3.5 text-gray-600">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-700">
                            {item.payment_mode === "custom" ? "مخصص" : "اشتراك شهري"}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-gray-500 font-medium">
                          {formatDateTime(item.payment_date)}
                        </td>
                        <td className="p-3.5 text-xs text-gray-400">
                          {item.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span>
                  صفحة {pagination.page} من {pagination.totalPages} (إجمالي: {pagination.total} معاملة)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                    className="p-1.5 border border-gray-200 rounded-lg hover:border-[#009966] disabled:opacity-40 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setHistoryPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-1.5 border border-gray-200 rounded-lg hover:border-[#009966] disabled:opacity-40 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 3: MONTHLY COLLECTIONS SUMMARY */}
      {activeTab === "monthly" && (
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.length === 0 ? (
              <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
                <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold">لا توجد بيانات تحصيلات شهرية سابقة</p>
              </div>
            ) : (
              collections.map((col, idx) => (
                <div
                  key={col.month || idx}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#009966]/40 transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Calendar size={18} className="text-[#009966]" />
                      شهر {col.month}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                      {col.total_payments || 0} معاملة
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-baseline justify-between">
                    <span className="text-xs text-gray-500 font-medium">إجمالي المحصل:</span>
                    <div className="text-xl font-black text-emerald-600">
                      <span dir="ltr">{Number(col.total_collected || 0).toLocaleString()}</span>
                      <span className="text-xs font-bold text-gray-500 mr-1">ج.م</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                    <span>الطلاب المسددين:</span>
                    <span className="font-bold text-gray-700">{col.students_paid || 0} طالب</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default Payments;
