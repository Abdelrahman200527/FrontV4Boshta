import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  CalendarCheck2,
  CalendarX2,
  AlertTriangle,
  BadgeDollarSign,
  FileCheck2,
  Clock,
  Power,
  RotateCcw,
  CheckCircle2,
  Activity,
  Layers,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getSuperAdminDashboard,
  togglePlatformStatus,
  updateAcademicYearStatus,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingPlatform, setTogglingPlatform] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getSuperAdminDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحميل بيانات لوحة التحكم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTogglePlatform = async () => {
    try {
      setTogglingPlatform(true);
      await togglePlatformStatus();
      toast.success("تم تحديث حالة المنصة بنجاح");
      await fetchDashboardData();
    } catch (err) {
      toast.error("فشل تغيير حالة المنصة");
    } finally {
      setTogglingPlatform(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-bold text-sm">جاري تحميل لوحة تحكم الإدارة العليا...</p>
      </div>
    );
  }

  const overview = data?.overview || {};
  const attendance = data?.attendance_today || {};
  const payments = data?.payments_month || {};
  const exams = data?.exams || {};
  const platform = data?.platform || {};
  const recentActivities = data?.recent_activities || [];
  const threeAbsences = data?.students_with_3_absences || 0;

  const isPlatformActive = platform.platform_status === "active";

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Top Welcome & Platform Control Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={14} />
              الإدارة العليا (Super Admin)
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                isPlatformActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isPlatformActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              المنصة {isPlatformActive ? "تعمل بكفاءة" : "متوقفة مؤقتاً"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800">
            لوحة قيادة النظام والتحكم المركزي
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            متابعة شاملة لجميع العمليات، الطلاب، الموظفين، والمالية في مكان واحد.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchDashboardData}
            title="تحديث البيانات"
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition border border-gray-200"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handleTogglePlatform}
            disabled={togglingPlatform}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
              isPlatformActive
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <Power size={18} />
            {isPlatformActive ? "إيقاف المنصة مؤقتاً" : "تشغيل وتفعيل المنصة"}
          </button>
        </div>
      </div>

      {/* 3 Absences Alert Banner if > 0 */}
      {threeAbsences > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-900"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">إنذار غيابات متكررة!</h4>
              <p className="text-xs sm:text-sm text-amber-700">
                يوجد <span className="font-bold underline">{threeAbsences} طالب</span> لديهم 3 غيابات متتالية أو أكثر بحاجة لمتابعة إدارية.
              </p>
            </div>
          </div>
          <Link
            to="/super-admin/attendance"
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition"
          >
            عرض القائمة
          </Link>
        </motion.div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-bold">إجمالي الطلاب</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1a5d1a] flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-800">
            {overview.total_students || 0}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <UserCheck size={13} /> {overview.active_students || 0} نشط
            </span>
            <span className="text-red-500 font-bold flex items-center gap-1">
              <UserX size={13} /> {overview.deleted_students || 0} موقوف
            </span>
          </div>
        </div>

        {/* New Students This Month */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-bold">طلاب جدد هذا الشهر</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-800">
            {overview.new_students_this_month || 0}
          </div>
          <p className="mt-2 text-xs text-gray-400">انضموا خلال الشهر الحالي</p>
        </div>

        {/* Staff Members */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-bold">فريق العمل والموظفين</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-800">
            {(parseInt(overview.total_teachers) || 0) + (parseInt(overview.total_assistants) || 0)}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>{overview.total_teachers || 0} مدرسين</span>
            <span>•</span>
            <span>{overview.total_assistants || 0} مساعدين</span>
          </div>
        </div>

        {/* Academic Groups & Grades */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-bold">الصفوف والمجموعات</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-800">
            {overview.total_groups || 0}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            موزعة على {overview.total_grades || 0} صفوف دراسية
          </div>
        </div>
      </div>

      {/* Grid Section: Attendance & Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today Attendance Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1a5d1a] flex items-center justify-center">
                <CalendarCheck2 size={18} />
              </div>
              <h3 className="font-bold text-gray-800 text-base">حضور وغياب اليوم</h3>
            </div>
            <Link
              to="/super-admin/attendance"
              className="text-xs text-[#1a5d1a] hover:underline font-bold flex items-center gap-1"
            >
              عرض التفاصيل
              <ChevronLeft size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-700 font-bold block mb-1">الحاضرين</span>
              <span className="text-2xl font-black text-emerald-800">{attendance.present_count || 0}</span>
            </div>
            <div className="bg-red-50/70 p-3 rounded-xl border border-red-100">
              <span className="text-xs text-red-700 font-bold block mb-1">الغائبين</span>
              <span className="text-2xl font-black text-red-800">{attendance.absent_count || 0}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-bold block mb-1">لم يُسجلوا</span>
              <span className="text-2xl font-black text-gray-700">{attendance.not_marked_count || 0}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl flex items-center justify-between">
            <span>إجمالي المقيدين في النظام:</span>
            <span className="font-bold text-gray-800">{attendance.total_students || 0} طالب</span>
          </div>
        </div>

        {/* Monthly Payments Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1a5d1a] flex items-center justify-center">
                <BadgeDollarSign size={18} />
              </div>
              <h3 className="font-bold text-gray-800 text-base">مالية الشهر الحالي</h3>
            </div>
            <Link
              to="/super-admin/payments"
              className="text-xs text-[#1a5d1a] hover:underline font-bold flex items-center gap-1"
            >
              عرض التفاصيل
              <ChevronLeft size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-bold block mb-1">المطلوب تحصيله</span>
              <span className="text-xl sm:text-2xl font-black text-gray-800">
                {Number(payments.total_required || 0).toLocaleString()} ج.م
              </span>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-700 font-bold block mb-1">تم تحصيله بالفعل</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800">
                {Number(payments.total_paid || 0).toLocaleString()} ج.م
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-2 pt-1 text-gray-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>{payments.fully_paid_students || 0} طلاب سددوا بالكامل</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <Clock size={15} />
              <span>{payments.unpaid_students || 0} طلاب متبقي عليهم مبالغ</span>
            </span>
          </div>
        </div>
      </div>

      {/* Exams & Assignments Overview */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileCheck2 size={18} />
            </div>
            <h3 className="font-bold text-gray-800 text-base">نشاط الامتحانات والواجبات</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-gray-500 block mb-1">امتحانات ورقية قادمة</span>
            <span className="text-xl font-bold text-gray-800">{exams.upcoming_paper_exams || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-gray-500 block mb-1">امتحانات أونلاين نشطة</span>
            <span className="text-xl font-bold text-emerald-600">{exams.active_online_exams || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-gray-500 block mb-1">واجبات مفتوحة للتسليم</span>
            <span className="text-xl font-bold text-blue-600">{exams.active_assignments || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs text-gray-500 block mb-1">واجبات معلقة للتصحيح</span>
            <span className="text-xl font-bold text-amber-600">{exams.pending_grading || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Log Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <h3 className="font-bold text-gray-800 text-base">آخر النشاطات والعمليات المنفذة</h3>
          </div>
          <Link
            to="/super-admin/activity-log"
            className="text-xs text-[#1a5d1a] hover:underline font-bold flex items-center gap-1"
          >
            عرض سجل النشاطات بالكامل
            <ChevronLeft size={14} />
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">لا توجد نشاطات مسجلة حديثاً.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1a5d1a] flex items-center justify-center text-xs font-bold">
                    {act.user_role === "teacher" ? "معلم" : act.user_role === "assistant" ? "مساعد" : "أدمن"}
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">{act.user_name || "مستخدم"}</span>
                    <span className="text-gray-500 mx-1.5">•</span>
                    <span className="text-gray-600">{act.description || act.action}</span>
                  </div>
                </div>
                <span className="text-gray-400 font-mono text-xs" dir="ltr">
                  {act.created_at ? new Date(act.created_at).toLocaleTimeString("ar-EG") : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
