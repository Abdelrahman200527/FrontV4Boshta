import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  fetchParentDashboard,
  fetchParentDashboardByToken,
} from "../api/parent/actions";
import getImageUrl from "../utils/imageUrl";
import { formatTime12 } from "../utils/timeFormat";
import { notifySuccess } from "../lib/notify";

// Assets & Icons
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import Background from "../assets/background.png";
import {
  CalendarCheck2,
  Wallet,
  FileCheck2,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  GraduationCap,
  Phone,
  MapPin,
  Clock,
  CalendarDays,
  ClipboardList,
  AlertCircle,
  Loader2,
  Barcode,
  User,
  Award,
  LogOut,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PIE_COLORS = ["#16a34a", "#dc2626"];

const ParentDashboard = () => {
  const { token: tokenParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get("token") || tokenParam;
  const phoneFromStorage = localStorage.getItem("phone");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [imgError, setImgError] = useState(false);

  // Filters for sub-lists
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let res;
      if (tokenFromUrl) {
        res = await fetchParentDashboardByToken(tokenFromUrl);
      } else if (phoneFromStorage) {
        res = await fetchParentDashboard(phoneFromStorage);
      } else {
        setError("لم يتم العثور على بيانات تسجيل الدخول. يرجى تسجيل الدخول برقم الهاتف.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (res && res.success && res.data) {
        setData(res.data);
        if (isRefresh) {
          notifySuccess("تم تحديث البيانات بنجاح");
        }
      } else {
        setError(res?.error || "تعذر تحميل بيانات الطالب، يرجى التأكد من الرقم والتواصل مع إدارة السنتر.");
      }
    } catch (err) {
      setError(err?.message || "حدث خطأ غير متوقع أثناء تحميل البيانات.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tokenFromUrl, phoneFromStorage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem("phone");
    navigate("/login?role=ولي الأمر");
  };

  const getInitials = (name) => {
    if (!name) return "ط";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2);
  };

  // Format date helper with fallback
  const formatDateArabic = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format deadline helper with 12-hour time if available
  const formatDeadline = (deadlineStr) => {
    if (!deadlineStr) return "بدون موعد محدد";
    const d = new Date(deadlineStr);
    if (Number.isNaN(d.getTime())) return deadlineStr;
    const dateText = d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const hasSpecificTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    return hasSpecificTime ? `${dateText} (الساعة ${formatTime12(d)})` : dateText;
  };

  // Loading Screen
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 border border-emerald-900/10">
          <img src={MrBoshta} alt="Mr Boshta" className="w-24 h-24 object-contain animate-pulse" />
          <Loader2 className="animate-spin text-[#1a5d1a]" size={36} />
          <p className="text-gray-700 font-bold text-sm">جاري تحميل بيانات الطالب...</p>
        </div>
      </div>
    );
  }

  // Error / Not Logged In Screen
  if (error || !data) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-md w-full gap-5 border border-red-100">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertCircle size={36} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">تنبيه</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{error || "لم يتم العثور على بيانات"}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <button
              onClick={() => loadData()}
              className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>إعادة المحاولة</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              <span>تسجيل الدخول</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    student,
    attendance = {},
    attendanceHistory = [],
    paymentHistory = [],
    allExams = [],
    assignments = [],
    groupInfo,
    overallStats = {},
  } = data;

  // Calculate total paid amount from recorded payments
  const totalPaid = paymentHistory.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Pie chart data
  const presentDays = parseInt(attendance?.present_days) || 0;
  const absentDays = parseInt(attendance?.absent_days) || 0;
  const pieData = [
    { name: "حضور", value: presentDays },
    { name: "غياب", value: absentDays },
  ].filter((item) => item.value > 0);

  // Filtered attendance records
  const filteredAttendance = attendanceHistory.filter((rec) => {
    if (attendanceFilter === "present") return rec.status === "present";
    if (attendanceFilter === "absent") return rec.status === "absent";
    if (attendanceFilter === "makeup") return rec.is_makeup;
    return true;
  });

  // Filtered exams
  const filteredExams = allExams.filter((exam) => {
    if (examFilter === "online") return exam.exam_type === "online";
    if (examFilter === "paper") return exam.exam_type === "paper";
    return true;
  });

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: TrendingUp },
    { id: "attendance", label: `الحضور (${attendance?.total_days || 0})`, icon: CalendarCheck2 },
    { id: "payments", label: `المدفوعات (${paymentHistory.length})`, icon: Wallet },
    { id: "exams", label: `الامتحانات (${allExams.length})`, icon: FileCheck2 },
    { id: "assignments", label: `الواجبات (${assignments.length})`, icon: ClipboardList },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-gray-50/70 pb-12"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      dir="rtl"
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={MrBoshta} alt="Mr Boshta" className="w-12 h-12 object-contain" />
            <div>
              <span className="font-mekalbaz text-lg text-[#1a5d1a] block leading-tight">
                أ / محمد بشتة
              </span>
              <span className="text-xs text-gray-500 font-medium">
                بوابة متابعة ولي الأمر
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="تحديث البيانات"
              className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin text-emerald-700" : ""} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 flex flex-col gap-5">
        {/* Student Hero Header Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden"
        >
          {/* Header Gradient Banner */}
          <div className="bg-linear-to-l from-[#003322] via-[#0f4a28] to-[#009966] p-5 sm:p-7 text-white relative overflow-hidden">
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
              {/* Student Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-amber-400/60 shadow-lg flex items-center justify-center bg-white/10 backdrop-blur-sm overflow-hidden shrink-0">
                {student?.profile_image && !imgError ? (
                  <img
                    src={getImageUrl(student.profile_image)}
                    alt={student.full_name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-amber-300 font-bold text-4xl">
                    {getInitials(student?.full_name)}
                  </span>
                )}
              </div>

              {/* Student Info */}
              <div className="flex-1 text-center sm:text-right">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <Sparkles size={12} className="text-amber-300" />
                    طالب مسجل
                  </span>
                  <span className="bg-white/15 text-white/90 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Barcode size={12} />
                    {student?.barcode}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-snug">
                  {student?.full_name}
                </h1>

                {/* Badges Bar */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xs">
                  <span className="bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-amber-300" />
                    {student?.grade_name || "الصف الدراسي"}
                  </span>
                  <span className="bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                    <Users size={14} className="text-amber-300" />
                    {student?.group_name || "المجموعة"}
                  </span>
                  <span className="bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5" dir="ltr">
                    <Phone size={14} className="text-amber-300" />
                    {student?.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-black text-amber-300 block">
                  {attendance?.attendance_percentage || 0}%
                </span>
                <span className="text-xs text-white/80 mt-0.5 block">نسبة الحضور</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-300 block">
                  {totalPaid} ج.م
                </span>
                <span className="text-xs text-white/80 mt-0.5 block">إجمالي المسدد</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-black text-white block">
                  {allExams.length}
                </span>
                <span className="text-xs text-white/80 mt-0.5 block">إجمالي الامتحانات</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-black text-white block">
                  {assignments.length}
                </span>
                <span className="text-xs text-white/80 mt-0.5 block">إجمالي الواجبات</span>
              </div>
            </div>
          </div>

          {/* Student Detailed Attributes Grid - Centered & Aligned */}
          <div className="p-4 sm:p-5 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User size={14} className="text-emerald-700" />
              بيانات التواصل والتسجيل
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-2xs text-center flex flex-col items-center justify-center">
                <span className="text-gray-400 block text-[11px] font-medium">كود الباركود</span>
                <span className="font-bold text-gray-800 text-sm sm:text-base mt-1 block">{student?.barcode || "—"}</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-2xs text-center flex flex-col items-center justify-center">
                <span className="text-gray-400 block text-[11px] font-medium">رقم ولي الأمر المسجل</span>
                <span className="font-bold text-gray-800 text-sm sm:text-base mt-1 block tracking-wide" dir="ltr">
                  {student?.parent_phone || phoneFromStorage || "—"}
                </span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-2xs text-center flex flex-col items-center justify-center">
                <span className="text-gray-400 block text-[11px] font-medium">الصف الدراسي</span>
                <span className="font-bold text-gray-800 text-sm sm:text-base mt-1 block">{student?.grade_name || "—"}</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-2xs text-center flex flex-col items-center justify-center">
                <span className="text-gray-400 block text-[11px] font-medium">المجموعة المحددة</span>
                <span className="font-bold text-gray-800 text-sm sm:text-base mt-1 block">{student?.group_name || "—"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Group / Class Schedule Card - Centered & Cleaned */}
        {groupInfo && (
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80"
          >
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Users size={16} className="text-emerald-700" />
              مواعيد مجموعة الطالب
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                <span className="text-[11px] text-gray-500 block mb-1">أيام الحضور</span>
                <span className="font-bold text-emerald-900 text-sm flex items-center justify-center gap-1.5">
                  <CalendarDays size={14} className="text-emerald-600" />
                  {groupInfo.days || "حسب الجدول"}
                </span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                <span className="text-[11px] text-gray-500 block mb-1">توقيت الحصة</span>
                <span className="font-bold text-emerald-900 text-sm flex items-center justify-center gap-1.5">
                  <Clock size={14} className="text-emerald-600" />
                  {groupInfo.start_time
                    ? `من ${formatTime12(groupInfo.start_time)} ${groupInfo.end_time ? `إلى ${formatTime12(groupInfo.end_time)}` : ""}`
                    : "حسب الجدول"}
                </span>
              </div>
              {groupInfo.room && (
                <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                  <span className="text-[11px] text-gray-500 block mb-1">القاعة</span>
                  <span className="font-bold text-emerald-900 text-sm flex items-center justify-center gap-1.5">
                    <MapPin size={14} className="text-emerald-600" />
                    {groupInfo.room}
                  </span>
                </div>
              )}
              <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                <span className="text-[11px] text-gray-500 block mb-1">عدد طلاب المجموعة</span>
                <span className="font-bold text-emerald-900 text-sm block">
                  {groupInfo.students_count || 0} طالب
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4 Performance KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Attendance KPI */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CalendarCheck2 size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">حضور الحصص</span>
              <span className="text-base font-bold text-gray-800 block">
                {attendance?.present_days || 0} من {attendance?.total_days || 0} حصة
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                غياب: {attendance?.absent_days || 0} حصة
              </span>
            </div>
          </div>

          {/* Paid Amounts KPI - ONLY PAID */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Wallet size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">المدفوعات المسددة</span>
              <span className="text-base font-bold text-emerald-700 block">
                {totalPaid} ج.م
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                إجمالي المسجل ({paymentHistory.length} إيصال)
              </span>
            </div>
          </div>

          {/* Exams KPI */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <FileCheck2 size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">سجل الاختبارات</span>
              <span className="text-base font-bold text-gray-800 block">
                {allExams.length} اختبار
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                ورقي: {overallStats?.total_paper_exams || 0} | أونلاين: {overallStats?.total_online_exams || 0}
              </span>
            </div>
          </div>

          {/* Avg Score KPI */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Award size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block">متوسط الدرجات</span>
              <span className="text-base font-bold text-gray-800 block">
                {overallStats?.avg_paper_score ? `${overallStats.avg_paper_score}%` : "-"}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                ورقي: {overallStats?.avg_paper_score || 0}% | أونلاين: {overallStats?.avg_online_score || 0}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl shadow-xs border border-gray-200/80 overflow-x-auto sticky top-16 z-20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[110px] px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#1a5d1a] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Attendance Distribution Card */}
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80 flex flex-col items-center">
                <span className="text-sm font-bold text-gray-800 self-start mb-2 flex items-center gap-2">
                  <CalendarCheck2 size={16} className="text-emerald-700" />
                  نسبة وتوزيع الحضور
                </span>
                {pieData.length > 0 ? (
                  <>
                    <div className="w-full h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px", direction: "rtl" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
                        <span>حضور: {presentDays} يوم</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
                        <span>غياب: {absentDays} يوم</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-xs py-14">لا توجد بيانات حضور مسجلة بعد</p>
                )}
              </div>

              {/* Financial Status Summary Card - ONLY PAID INFO */}
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-sm font-bold text-gray-800 block mb-3 flex items-center gap-2">
                    <Wallet size={16} className="text-emerald-700" />
                    المبالغ المسددة
                  </span>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">إجمالي المبالغ المسددة:</span>
                      <span className="text-lg font-black text-emerald-700">
                        {totalPaid} جنيه مصري
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">عدد الإيصالات المستلمة:</span>
                      <span className="font-bold text-gray-800">{paymentHistory.length} إيصال</span>
                    </div>

                    {paymentHistory.length > 0 && (
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-100">
                        <span className="text-gray-500">آخر دفعة مسددة:</span>
                        <span className="font-bold text-emerald-800">
                          {paymentHistory[0].amount} ج.م ({formatDateArabic(paymentHistory[0].payment_date)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>جميع المبالغ المسجلة تم سدادها وموثقة بإيصالات رسمية من إدارة السنتر.</span>
                </div>
              </div>
            </div>

            {/* Recent Attendance Preview */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-700" />
                  آخر الحصص المسجلة
                </span>
                <button
                  onClick={() => setActiveTab("attendance")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض سجل الحضور كاملاً</span>
                  <ArrowLeft size={13} />
                </button>
              </div>

              {attendanceHistory.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-6">لا توجد سجلات حضور حتى الآن</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {attendanceHistory.slice(0, 6).map((rec, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-800 block">{rec.day_name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-gray-400">
                            {formatDateArabic(rec.attendance_date)}
                          </span>
                          {rec.attendance_time && (
                            <span className="text-[10px] text-gray-500 font-medium flex items-center gap-0.5">
                              <span>•</span>
                              <span>{formatTime12(rec.attendance_time)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {rec.status === "present" ? (
                        <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          <CheckCircle2 size={12} /> حاضر
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-700 text-xs font-bold bg-red-100/70 px-2 py-0.5 rounded-md">
                          <XCircle size={12} /> غائب
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Attendance */}
        {activeTab === "attendance" && (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <CalendarCheck2 size={16} className="text-emerald-700" />
                  سجل الحضور والغياب التفصيلي
                </h3>
                <span className="text-xs text-gray-500">إجمالي الحصص المسجلة: {attendance?.total_days || 0}</span>
              </div>

              {/* Attendance Sub-filter */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setAttendanceFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${attendanceFilter === "all" ? "bg-white text-gray-800 shadow-2xs" : "text-gray-500"}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setAttendanceFilter("present")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${attendanceFilter === "present" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-500"}`}
                >
                  حاضر
                </button>
                <button
                  onClick={() => setAttendanceFilter("absent")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${attendanceFilter === "absent" ? "bg-white text-red-700 shadow-2xs" : "text-gray-500"}`}
                >
                  غائب
                </button>
                <button
                  onClick={() => setAttendanceFilter("makeup")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${attendanceFilter === "makeup" ? "bg-white text-amber-700 shadow-2xs" : "text-gray-500"}`}
                >
                  تعويض
                </button>
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                لا توجد حصص مسجلة مطابقة للاختيار
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                {filteredAttendance.map((record, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50/80 hover:bg-gray-100/60 transition-all border border-gray-100 rounded-xl p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${record.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {record.status === "present" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800">{record.day_name}</span>
                          {Boolean(record.is_makeup) && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                              حضور تعويضي
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 block">
                          {formatDateArabic(record.attendance_date)}
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      {record.status === "present" ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                          حاضر
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                          غائب
                        </span>
                      )}
                      {record.attendance_time && (
                        <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-1 justify-end">
                          <Clock size={11} className="text-gray-400" />
                          <span>{formatTime12(record.attendance_time)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 3: Payments - ONLY PAID AMOUNTS */}
        {activeTab === "payments" && (
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            {/* Payments Overview Card */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">إجمالي المبالغ المدفوعة</span>
                    <span className="text-2xl font-black text-emerald-800 block mt-0.5">
                      {totalPaid} جنيه مصري
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck size={16} />
                    <span>تم توثيق {paymentHistory.length} إيصال سداد</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Transactions Log */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-emerald-700" />
                سجل سندات القبض والإيصالات ({paymentHistory.length})
              </h3>

              {paymentHistory.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-10">لا توجد إيصالات مدفوعات مسجلة</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {paymentHistory.map((pmt, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          ج.م
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-gray-900 block">{pmt.amount} جنيه مصري</span>
                          <span className="text-xs text-gray-500">
                            {formatDateArabic(pmt.payment_date)}
                          </span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          مسدد
                        </span>
                        {pmt.notes && (
                          <span className="text-[11px] text-gray-400 block mt-1">
                            {pmt.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 4: Exams */}
        {activeTab === "exams" && (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FileCheck2 size={16} className="text-emerald-700" />
                  سجل الاختبارات والنتائج
                </h3>
                <span className="text-xs text-gray-500">إجمالي الاختبارات: {allExams.length}</span>
              </div>

              {/* Exam Sub-filter */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setExamFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${examFilter === "all" ? "bg-white text-gray-800 shadow-2xs" : "text-gray-500"}`}
                >
                  الكل ({allExams.length})
                </button>
                <button
                  onClick={() => setExamFilter("paper")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${examFilter === "paper" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-500"}`}
                >
                  ورقي ({overallStats?.total_paper_exams || 0})
                </button>
                <button
                  onClick={() => setExamFilter("online")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${examFilter === "online" ? "bg-white text-purple-700 shadow-2xs" : "text-gray-500"}`}
                >
                  إلكتروني ({overallStats?.total_online_exams || 0})
                </button>
              </div>
            </div>

            {filteredExams.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                لا توجد نتائج امتحانات مسجلة حتى الآن
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredExams.map((exam, i) => {
                  const isOnline = exam.exam_type === "online";
                  const score = Number(exam.score || 0);
                  const fullMark = Number(exam.full_mark || 0);
                  const percentage = parseFloat(exam.percentage) || (fullMark > 0 ? Math.round((score / fullMark) * 100) : 0);
                  
                  const isPending =
                    exam.status === "pending" ||
                    exam.status === "قيد التصحيح" ||
                    exam.score === null;

                  const isPassed =
                    !isPending &&
                    (exam.status === "passed" ||
                      exam.status === "ناجح" ||
                      percentage >= 50);

                  return (
                    <div
                      key={i}
                      className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOnline ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          <Award size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">{exam.title || "امتحان تقييمي"}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isOnline ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {isOnline ? "إلكتروني" : "ورقي"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <CalendarDays size={12} />
                            {formatDateArabic(exam.exam_date || exam.sort_date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="text-right sm:text-left">
                          <div className="text-base font-black text-gray-800 flex items-center gap-1 justify-end" dir="ltr">
                            <span>{score}</span>
                            <span className="text-gray-400 font-normal">/</span>
                            <span>{fullMark}</span>
                          </div>
                          <span className="text-xs text-gray-400 block font-medium">الدرجة المحققة</span>
                        </div>

                        <span className={`text-xs font-black px-3 py-1.5 rounded-xl border ${
                          isPending
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : isPassed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {isPending ? "قيد التصحيح" : `${percentage}% (${isPassed ? "ناجح" : "راسب"})`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 5: Assignments */}
        {activeTab === "assignments" && (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardList size={16} className="text-emerald-700" />
                  سجل الواجبات والمهام الدراسية
                </h3>
                <span className="text-xs text-gray-500">إجمالي الواجبات: {assignments.length}</span>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                لا توجد واجبات مسجلة حالياً
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {assignments.map((asg, i) => (
                  <div
                    key={i}
                    className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{asg.title}</h4>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {asg.deadline ? `آخر موعد للتسليم: ${formatDeadline(asg.deadline)}` : "بدون موعد محدد"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                      {asg.score != null && (
                        <span className="text-sm font-bold text-gray-800">
                          {asg.score} / {asg.full_mark || 10}
                        </span>
                      )}
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        asg.status === "graded"
                          ? "bg-green-100 text-green-700"
                          : asg.status === "submitted"
                            ? "bg-blue-100 text-blue-700"
                            : asg.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                      }`}>
                        {asg.status === "graded"
                          ? "تم التصحيح"
                          : asg.status === "submitted"
                            ? "تم التسليم"
                            : asg.status === "overdue"
                              ? "متأخر"
                              : "قيد الانتظار"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

export default ParentDashboard;
