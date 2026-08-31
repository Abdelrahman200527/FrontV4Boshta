import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchParentDashboard } from "../api/parent/actions";
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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Area,
  YAxis,
  XAxis,
  CartesianGrid,
  AreaChart,
} from "recharts";

const COLORS = ["#16a34a", "#dc2626"];

const ParentDashboard = () => {
  const { token } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError("الرابط غير صالح - التوكن مطلوب");
        setLoading(false);
        return;
      }

      try {
        const res = await fetchParentDashboard(token);
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error || "حدث خطأ في تحميل البيانات");
        }
      } catch (err) {
        setError(err.message || "حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172B] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#009966]" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172B] flex flex-col items-center justify-center text-white gap-4 p-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <span className="text-center text-lg">{error}</span>
      </div>
    );
  }

  const {
    student,
    attendance,
    attendanceHistory = [],
    payments,
    paymentHistory = [],
    allExams = [],
    assignments = [],
    groupInfo,
    overallStats,
  } = data;

  const pieData = [
    { name: "حضور", value: parseInt(attendance?.present_days) || 0 },
    { name: "غياب", value: parseInt(attendance?.absent_days) || 0 },
  ].filter((item) => item.value > 0);

  const attendanceData = [...attendanceHistory]
    .slice(0, 10)
    .reverse()
    .map((record) => ({
      date: new Date(record.attendance_date).toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "short",
      }),
      status: record.status === "present" ? 1 : 0,
    }));

  const tabs = [
    { id: "overview", label: "نظرة عامة" },
    { id: "attendance", label: "الحضور" },
    { id: "payments", label: "المدفوعات" },
    { id: "exams", label: "الامتحانات" },
    { id: "assignments", label: "الواجبات" },
  ];

  const getInitials = (name) => {
    if (!name) return "؟";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2);
  };

  const getStudentImageUrl = (profileImage) => {
    if (!profileImage) return null;
    if (profileImage.startsWith("http")) return profileImage;
    return `https://backend.benb3n.cloud/${profileImage.replace(/^\//, "")}`;
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[#0F172B] p-3 sm:p-5"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="max-w-4xl mx-auto flex flex-col gap-4"
      >
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-linear-to-l from-[#003322] to-[#009966] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Large Avatar */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white/40 shadow-xl flex items-center justify-center bg-white/20 overflow-hidden shrink-0">
                {student?.profile_image && !imgError ? (
                  <img
                    src={getStudentImageUrl(student.profile_image)}
                    alt={student.full_name}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-white font-bold text-5xl">
                    {getInitials(student?.full_name)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-right">
                <span className="text-white/70 text-sm block">بوابة ولي الأمر</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate mt-1">
                  {student?.full_name}
                </h1>

                {/* Student Details */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Barcode size={12} />
                    {student?.barcode}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <GraduationCap size={12} />
                    {student?.grade_name}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Users size={12} />
                    {student?.group_name}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1" dir="ltr">
                    <Phone size={12} />
                    {student?.phone}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1" dir="ltr">
                    <Phone size={12} />
                    ولي: {student?.parent_phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats in Hero */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-bold text-white block">
                  {attendance?.attendance_percentage || 0}%
                </span>
                <span className="text-[10px] sm:text-xs text-white/70">نسبة الحضور</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-bold text-white block">
                  {allExams.length}
                </span>
                <span className="text-[10px] sm:text-xs text-white/70">الامتحانات</span>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-bold text-white block">
                  {payments?.remaining || 0}
                </span>
                <span className="text-[10px] sm:text-xs text-white/70">المتبقي</span>
              </div>
            </div>
          </div>

          {/* Full Student Data */}
          <div className="p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="text-[#009966]" size={18} />
              بيانات الطالب
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block">الاسم</span>
                <span className="font-bold text-sm mt-0.5 block">{student?.full_name}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block">الباركود</span>
                <span className="font-bold text-sm mt-0.5 block">{student?.barcode}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block">رقم الطالب</span>
                <span className="font-bold text-sm mt-0.5 block" dir="ltr">{student?.phone}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block">رقم ولي الأمر</span>
                <span className="font-bold text-sm mt-0.5 block" dir="ltr">{student?.parent_phone}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block">الصف</span>
                <span className="font-bold text-sm mt-0.5 block">{student?.grade_name}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500 block">المجموعة</span>
                <span className="font-bold text-sm mt-0.5 block">{student?.group_name}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="p-4 pt-0 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2.5">
              <CalendarCheck2 className="text-green-600 w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-bold block">
                  حضور: {attendance?.present_days || 0}
                </span>
                <span className="text-xs text-gray-500">
                  غياب: {attendance?.absent_days || 0} | إجمالي: {attendance?.total_days || 0}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2.5">
              <Wallet className="text-orange-600 w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-bold text-green-600 block">
                  مدفوع: {payments?.total_paid || 0}
                </span>
                <span className="text-xs text-gray-500">
                  مطلوب: {payments?.total_required || 0}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2.5">
              <FileCheck2 className="text-purple-600 w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-bold block">
                  ورق: {overallStats?.total_paper_exams || 0}
                </span>
                <span className="text-xs text-gray-500">
                  إلكتروني: {overallStats?.total_online_exams || 0}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2.5">
              <Award className="text-blue-600 w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm font-bold block">
                  ورقي: {overallStats?.avg_paper_score || 0}
                </span>
                <span className="text-xs text-gray-500">
                  إلكتروني: {overallStats?.avg_online_score || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Group Info */}
        {groupInfo && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="text-green-600 w-5 h-5" />
              معلومات المجموعة
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-xs text-gray-500 block">الأيام</span>
                <span className="font-bold text-sm flex items-center gap-1 mt-0.5">
                  <CalendarDays size={12} className="text-[#009966]" />
                  {groupInfo.days}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-xs text-gray-500 block">المواعيد</span>
                <span className="font-bold text-sm flex items-center gap-1 mt-0.5">
                  <Clock size={12} className="text-[#009966]" />
                  {groupInfo.start_time} - {groupInfo.end_time}
                </span>
              </div>
              {groupInfo.room && (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <span className="text-xs text-gray-500 block">القاعة</span>
                  <span className="font-bold text-sm flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-[#009966]" />
                    {groupInfo.room}
                  </span>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-xs text-gray-500 block">عدد الطلاب</span>
                <span className="font-bold text-sm mt-0.5 block">
                  {groupInfo.students_count} طالب
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm overflow-x-auto sticky top-0 z-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 sm:px-4 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#009966] text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <span className="text-base font-bold block mb-3 items-center gap-2">
                <TrendingUp className="text-[#009966]" size={18} />
                نسبة الحضور
              </span>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceData}>
                    <defs>
                      <linearGradient id="colorParent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#009966" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#009966" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={25} />
                    <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="status" stroke="#009966" strokeWidth={2} fill="url(#colorParent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <span className="text-base font-bold block mb-2 text-center">توزيع الحضور</span>
              {pieData.length > 0 ? (
                <>
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-3 flex-wrap mt-2">
                    {pieData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-sm">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                        <span>
                          {item.name}: <b>{item.value}</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">لا توجد بيانات</p>
              )}
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <CalendarCheck2 className="text-[#009966]" size={18} />
              سجل الحضور ({attendance?.total_days || 0} يوم)
            </h3>
            {attendanceHistory.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">لا توجد بيانات حضور</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                {attendanceHistory.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 gap-2">
                    <div>
                      <span className="text-sm font-bold text-gray-700 block">{record.day_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(record.attendance_date).toLocaleDateString("ar-EG")}
                      </span>
                      {record.method && (
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {record.method === "manual" ? "يدوي" : record.method === "barcode" ? "باركود" : record.method}
                        </span>
                      )}
                    </div>
                    {record.status === "present" ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-100 px-2.5 py-1 rounded-full shrink-0">
                        <CheckCircle2 size={14} /> حاضر
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm font-bold bg-red-100 px-2.5 py-1 rounded-full shrink-0">
                        <XCircle size={14} /> غائب
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <Wallet className="text-[#009966]" size={18} />
              سجل المدفوعات
            </h3>
            {paymentHistory.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">لا توجد مدفوعات</p>
            ) : (
              <div className="flex flex-col gap-2">
                {paymentHistory.map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div>
                      <span className="font-bold text-sm block">{payment.amount} ج.م</span>
                      <span className="text-xs text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                    <span className="text-sm text-green-600 font-bold">مدفوع</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === "exams" && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <FileCheck2 className="text-[#009966]" size={18} />
              الامتحانات ({allExams.length})
            </h3>
            {allExams.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">لا توجد امتحانات</p>
            ) : (
              <div className="flex flex-col gap-2">
                {allExams.map((exam, idx) => {
                  const isOnline = exam.exam_type === "online";
                  const isPending = exam.status === "pending";
                  const isPassed = exam.status === "passed";
                  const percentage = parseFloat(exam.percentage) || 0;
                  const score = parseFloat(exam.score) || 0;
                  const fullMark = parseFloat(exam.full_mark) || 0;

                  return (
                    <div
                      key={`${exam.exam_type}-${exam.exam_id || idx}`}
                      className={`rounded-lg p-3 ${isOnline ? "bg-purple-50" : "bg-blue-50"}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-sm block truncate">{exam.title}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <CalendarDays size={11} />
                            {new Date(exam.exam_date || exam.sort_date).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${isOnline ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {isOnline ? "إلكتروني" : "ورقي"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-sm text-gray-900">
                          {score}/{fullMark}
                        </span>
                        <span className={`text-sm font-bold ${isPending ? "text-yellow-600" : isPassed ? "text-green-600" : "text-red-600"}`}>
                          {isPending ? "لم يتم التصحيح" : `${percentage}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <ClipboardList className="text-[#009966]" size={18} />
              الواجبات ({assignments.length})
            </h3>
            {assignments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">لا توجد واجبات</p>
            ) : (
              <div className="flex flex-col gap-2">
                {assignments.map((assignment, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-sm block truncate">{assignment.title}</span>
                      <span className="text-xs text-gray-500 block">
                        {assignment.score != null
                          ? `الدرجة: ${assignment.score}/${assignment.full_mark}`
                          : `آخر موعد: ${new Date(assignment.deadline).toLocaleDateString("ar-EG")}`}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                      assignment.status === "graded"
                        ? "bg-green-100 text-green-700"
                        : assignment.status === "submitted"
                          ? "bg-blue-100 text-blue-700"
                          : assignment.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                    }`}>
                      {assignment.status === "graded"
                        ? "مصحح"
                        : assignment.status === "submitted"
                          ? "مسلم"
                          : assignment.status === "overdue"
                            ? "متأخر"
                            : "قيد الانتظار"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ParentDashboard;