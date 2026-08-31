import {
  ArrowRight,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Monitor,
  Calendar,
  Wallet,
  GraduationCap,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  Search,
  BookOpen,
  Award,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStudentFullDetails } from "../api/teacher/actions";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

// ✅ Image helpers
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `https://backend.benb3n.cloud/${imagePath.replace(/^\//, "")}`;
};

const StudentAvatar = ({ profile }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getImageUrl(profile?.profile_image);

  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 shrink-0 backdrop-blur-sm">
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={profile?.full_name}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-xl sm:text-2xl font-bold text-white">
          {profile?.full_name?.charAt(0) || "ط"}
        </span>
      )}
    </div>
  );
};

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchStudentFullDetails(studentId);
    if (result.success) {
      setStudentDetails(result.data);
    } else {
      setError(result.error || "فشل تحميل بيانات الطالب");
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDetails();
    setRefreshing(false);
  };

  const toNumber = useCallback((value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const filterAttendance = useMemo(() => {
    if (!studentDetails?.attendance) return [];
    return studentDetails.attendance.filter((att) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        att.day_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatDate(att.attendance_date).includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || att.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [studentDetails, searchQuery, statusFilter]);

  const filterPayments = useMemo(() => {
    if (!studentDetails?.payments) return [];
    return studentDetails.payments.filter((payment) => {
      return (
        searchQuery.trim() === "" ||
        payment.subscription_month
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        formatDate(payment.payment_date).includes(searchQuery)
      );
    });
  }, [studentDetails, searchQuery]);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل بيانات الطالب...</p>
        </div>
      </div>
    );
  }

  if (error || !studentDetails) {
    return (
      <div className="flex flex-col items-center gap-4 p-10 text-center min-h-screen bg-gray-50">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-gray-600">{error || "لا توجد بيانات"}</p>
        <button
          onClick={() => navigate("/teacher/students")}
          className="px-4 py-2 bg-[#009966] text-white rounded-lg text-sm font-bold hover:bg-[#007a52] transition"
        >
          رجوع للطلاب
        </button>
      </div>
    );
  }

  const profile = studentDetails.profile || {};
  const stats = studentDetails.stats || {};
  const monthlyAttendance = studentDetails.monthlyAttendance || [];
  const payments = studentDetails.payments || [];
  const balance = studentDetails.balance || {};
  const paperExams = studentDetails.paperExams || [];
  const examResults = studentDetails.examResults || [];
  const onlineExams = studentDetails.onlineExams || [];
  const assignments = studentDetails.assignments || [];
  const submissions = studentDetails.submissions || [];

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 p-3 sm:p-4 md:p-6 w-full min-h-screen bg-gray-50"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <button
          onClick={() => navigate("/teacher/students")}
          className="flex items-center gap-1 text-[#009966] text-sm font-bold hover:underline"
        >
          <ArrowRight size={16} />
          رجوع للطلاب
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          تحديث
        </button>
      </motion.div>

      {/* Student Header Card */}
      <motion.div
        variants={itemVariants}
        className="bg-linear-to-l from-[#009966] to-[#003322] rounded-2xl p-4 sm:p-6 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <StudentAvatar profile={profile} />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              {profile.full_name}
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mt-1 text-white/80">
              <span className="text-[11px] sm:text-sm">
                باركود: {profile.barcode}
              </span>
              <span className="text-[11px] sm:text-sm flex items-center gap-1">
                <GraduationCap size={12} />
                {profile.grade_name} - {profile.group_name}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 w-full overflow-x-auto shadow-sm"
      >
        {[
          { id: "overview", label: "نظرة عامة", icon: Users },
          { id: "attendance", label: "الحضور", icon: Calendar },
          { id: "exams", label: "الامتحانات", icon: FileText },
          { id: "payments", label: "المدفوعات", icon: Wallet },
          { id: "assignments", label: "الواجبات", icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 justify-center ${
              activeTab === tab.id
                ? "bg-[#009966] text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: "نسبة الحضور",
                  value: `${toNumber(stats.attendance_percentage)}%`,
                  icon: TrendingUp,
                  color: "text-green-600",
                  bg: "bg-green-50",
                  border: "border-green-200",
                },
                {
                  label: "أيام الحضور",
                  value: toNumber(stats.present_days),
                  icon: CheckCircle2,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  border: "border-blue-200",
                },
                {
                  label: "أيام الغياب",
                  value: toNumber(stats.absent_days),
                  icon: XCircle,
                  color: "text-red-600",
                  bg: "bg-red-50",
                  border: "border-red-200",
                },
                {
                  label: "متوسط الدرجات",
                  value: toNumber(stats.avg_paper_degree),
                  icon: Award,
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                  border: "border-purple-200",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`${item.bg} ${item.border} border rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center`}
                >
                  <item.icon size={20} className={`${item.color} mb-1.5`} />
                  <span className="text-lg sm:text-2xl font-bold text-gray-900 block text-center">
                    {item.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 text-center">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "المدفوع",
                  value: toNumber(balance.total_paid || stats.total_paid),
                  color: "text-emerald-700",
                  bg: "bg-emerald-50",
                  border: "border-emerald-200",
                },
                {
                  label: "المطلوب",
                  value: toNumber(balance.total_required || stats.total_required),
                  color: "text-orange-700",
                  bg: "bg-orange-50",
                  border: "border-orange-200",
                },
                {
                  label: "المتبقي",
                  value: toNumber(balance.remaining_balance || stats.remaining_balance),
                  color: "text-red-700",
                  bg: "bg-red-50",
                  border: "border-red-200",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`${item.bg} ${item.border} border rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center`}
                >
                  <span className={`text-base sm:text-xl font-bold ${item.color} block text-center`}>
                    {item.value} ج.م
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 text-center">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: "الهاتف", value: profile.phone, icon: Phone, dir: "ltr" },
                { label: "ولي الأمر", value: profile.parent_phone, icon: Phone, dir: "ltr" },
                { label: "الصف", value: profile.grade_name, icon: GraduationCap, dir: "rtl" },
                { label: "المجموعة", value: profile.group_name, icon: Users, dir: "rtl" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl p-3 hover:border-[#009966] transition-colors flex flex-col items-center justify-center"
                >
                  <span className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
                    <item.icon size={11} />
                    {item.label}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-center" dir={item.dir}>
                    {item.value || "-"}
                  </span>
                </div>
              ))}
            </div>

            {/* Monthly Attendance */}
            {monthlyAttendance.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2 justify-center">
                    <Calendar size={16} className="text-[#009966]" />
                    ملخص الحضور الشهري
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الشهر</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">حضور</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">غياب</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">النسبة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {monthlyAttendance.map((month, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-xs sm:text-sm font-medium text-center">{month.month}</td>
                          <td className="py-3 px-4 text-xs sm:text-sm text-green-600 font-bold text-center">{month.present_days}</td>
                          <td className="py-3 px-4 text-xs sm:text-sm text-red-600 font-bold text-center">{month.absent_days}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                              toNumber(month.attendance_percentage) >= 75
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}>
                              {toNumber(month.attendance_percentage)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                سجل الحضور ({filterAttendance.length})
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                  <Search size={13} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs w-full min-w-20"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                >
                  <option value="all">الكل</option>
                  <option value="present">حضور</option>
                  <option value="absent">غياب</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full min-w-100">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">#</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">التاريخ</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">اليوم</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filterAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">لا يوجد سجل</td>
                    </tr>
                  ) : (
                    filterAttendance.map((att, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-4 text-xs text-gray-400 text-center">{index + 1}</td>
                        <td className="py-2.5 px-4 text-xs sm:text-sm text-center">{formatDate(att.attendance_date)}</td>
                        <td className="py-2.5 px-4 text-xs sm:text-sm text-center">{att.day_name || "-"}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                            att.status === "present" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}>
                            {att.status === "present" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {att.status === "present" ? "حضور" : "غياب"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Exams Tab */}
        {activeTab === "exams" && (
          <motion.div
            key="exams"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="بحث في الامتحانات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent focus:outline-none text-sm w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 shrink-0">
                  <XIcon />
                </button>
              )}
            </div>

            {/* Paper Exams */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/50 flex items-center gap-2 justify-center">
                <FileText size={16} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  الامتحانات الورقية ({paperExams.length})
                </h3>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full min-w-87.5">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الامتحان</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الدرجة</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paperExams.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-gray-400 text-sm">لا توجد امتحانات</td>
                      </tr>
                    ) : (
                      paperExams.map((exam, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-xs sm:text-sm font-medium text-center">
                            {exam.exam_title || exam.title || "-"}
                          </td>
                          <td className="py-3 px-4 text-xs sm:text-sm font-bold text-center">
                            {exam.student_degree ?? exam.degree ?? "-"} / {exam.total_degree || "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                              exam.exam_status === "attended" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}>
                              {exam.exam_status === "attended" ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                              {exam.exam_status === "attended" ? "حضر" : "غائب"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exam Results */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 bg-green-50/50 flex items-center gap-2 justify-center">
                <BarChart3 size={16} className="text-green-600" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  نتائج الامتحانات ({examResults.length})
                </h3>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full min-w-87.5">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الامتحان</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الدرجة</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {examResults.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-gray-400 text-sm">لا توجد نتائج</td>
                      </tr>
                    ) : (
                      examResults.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-xs sm:text-sm font-medium text-center">
                            {result.exam_title || result.title || "-"}
                          </td>
                          <td className="py-3 px-4 text-xs sm:text-sm font-bold text-center">
                            {result.degree ?? "-"} / {result.total_degree || "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                              toNumber(result.percentage) >= 50 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}>
                              {toNumber(result.percentage)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Online Exams */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 bg-purple-50/50 flex items-center gap-2 justify-center">
                <Monitor size={16} className="text-purple-600" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  الامتحانات الإلكترونية ({onlineExams.length})
                </h3>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full min-w-87.5">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الامتحان</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الدرجة</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {onlineExams.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-gray-400 text-sm">لا توجد امتحانات</td>
                      </tr>
                    ) : (
                      onlineExams.map((exam, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-xs sm:text-sm font-medium text-center">
                            {exam.exam_title || exam.title || "-"}
                          </td>
                          <td className="py-3 px-4 text-xs sm:text-sm font-bold text-center">
                            {exam.score ?? "-"} / {exam.full_mark || "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                              toNumber(exam.percentage) >= 50 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}>
                              {toNumber(exam.percentage)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                المدفوعات ({filterPayments.length})
              </h3>
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs w-full min-w-20"
                />
              </div>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full min-w-87.5">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">#</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">التاريخ</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">المبلغ</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الشهر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filterPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">لا توجد مدفوعات</td>
                    </tr>
                  ) : (
                    filterPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-xs text-gray-400 text-center">{index + 1}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm text-center">{formatDate(payment.payment_date)}</td>
                        <td className="py-3 px-4 text-xs sm:text-sm font-bold text-emerald-600 text-center">
                          {payment.amount} ج.م
                        </td>
                        <td className="py-3 px-4 text-xs sm:text-sm text-center">
                          {payment.subscription_month || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <motion.div
            key="assignments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Assignments */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/50 flex items-center gap-2 justify-center">
                <FileText size={16} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  الواجبات ({assignments.length})
                </h3>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full min-w-87.5">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الواجب</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الدرجة</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-gray-400 text-sm">لا توجد واجبات</td>
                      </tr>
                    ) : (
                      assignments.map((assignment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-xs sm:text-sm font-medium text-center">
                            {assignment.title || "-"}
                          </td>
                          <td className="py-3 px-4 text-xs sm:text-sm font-bold text-center">
                            {assignment.full_mark || "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                              assignment.assignment_status === "graded"
                                ? "bg-green-50 text-green-700"
                                : assignment.assignment_status === "submitted"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-yellow-50 text-yellow-700"
                            }`}>
                              {assignment.assignment_status === "graded" ? (
                                <CheckCircle2 size={11} />
                              ) : assignment.assignment_status === "submitted" ? (
                                <FileText size={11} />
                              ) : (
                                <Clock size={11} />
                              )}
                              {assignment.assignment_status === "graded"
                                ? "مصحح"
                                : assignment.assignment_status === "submitted"
                                  ? "مسلم"
                                  : "معلق"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submissions */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 bg-green-50/50 flex items-center gap-2 justify-center">
                <CheckCircle2 size={16} className="text-green-600" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  التسليمات ({submissions.length})
                </h3>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full min-w-87.5">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الواجب</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">الدرجة</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">التوقيت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-gray-400 text-sm">لا توجد تسليمات</td>
                      </tr>
                    ) : (
                      submissions.map((submission, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-xs sm:text-sm font-medium text-center">
                            {submission.assignment_title || "-"}
                          </td>
                          <td className="py-3 px-4 text-xs sm:text-sm font-bold text-center">
                            {submission.score ?? "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                              submission.submission_timing === "on_time"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}>
                              {submission.submission_timing === "on_time" ? (
                                <CheckCircle2 size={11} />
                              ) : (
                                <Clock size={11} />
                              )}
                              {submission.submission_timing === "on_time" ? "في الوقت" : "متأخر"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default StudentDetails;