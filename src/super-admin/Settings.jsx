import React, { useState, useEffect } from "react";
import {
  Settings,
  Power,
  Calendar,
  Save,
  Building,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  getPlatformSettings,
  updatePlatformSettings,
  togglePlatformStatus,
  updateAcademicYearStatus,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getPlatformSettings();
      setSettings(res || {});
    } catch (err) {
      toast.error("فشل تحميل إعدادات المنصة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updatePlatformSettings({
        center_name: settings.center_name,
        phone: settings.phone,
        address: settings.address,
        default_lock_minutes: parseInt(settings.default_lock_minutes) || 120,
      });
      toast.success("تم حفظ إعدادات السنتر بنجاح");
    } catch (err) {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePlatform = async () => {
    const isCurrentlyActive = settings.platform_status === "active";
    const confirmMsg = isCurrentlyActive
      ? "تنبيه هام: هل أنت متأكد من إيقاف المنصة؟ سيتم تسجيل خروج جميع المستخدمين فوراً وإيقاف استقبال الطلبات لحين إعادة التفعيل."
      : "هل تريد إعادة تفعيل وتشغيل المنصة للجميع الآن؟";

    if (!window.confirm(confirmMsg)) return;

    try {
      setToggling(true);
      await togglePlatformStatus();
      toast.success("تم تحديث حالة المنصة بنجاح");
      fetchSettings();
    } catch (err) {
      toast.error("فشل تغيير حالة المنصة");
    } finally {
      setToggling(false);
    }
  };

  const handleAcademicYearChange = async (newStatus) => {
    try {
      await updateAcademicYearStatus(newStatus);
      toast.success("تم تحديث حالة العام الدراسي");
      setSettings((prev) => ({ ...prev, academic_year_status: newStatus }));
    } catch (err) {
      toast.error("فشل تحديث حالة العام الدراسي");
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500 font-bold text-sm">جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  const isPlatformActive = settings.platform_status === "active";

  return (
    <div className="space-y-6 pb-12 font-sans max-w-4xl mx-auto" dir="rtl">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-gray-800 flex items-center gap-2">
          <Settings size={24} className="text-[#1a5d1a]" />
          إعدادات المنصة والتحكم المركزي
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          إدارة بيانات السنتر، حالة النظام، العام الدراسي، وميزات الأمان.
        </p>
      </div>

      {/* Critical Platform Status Card */}
      <div className={`rounded-2xl p-6 border shadow-sm transition-all ${
        isPlatformActive ? "bg-white border-gray-100" : "bg-red-50/70 border-red-200"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isPlatformActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              <h3 className="font-bold text-base sm:text-lg text-gray-900">
                حالة عمل المنصة: {isPlatformActive ? "نشطة وتعمل" : "متوقفة مؤقتاً"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              {isPlatformActive
                ? "المنصة متاحة الآن لجميع الطلاب، المدرسين، وأولياء الأمور."
                : "المنصة متوقفة حالياً ويتم منع تسجيل الدخول لكافة المستخدمين لحين إعادة التشغيل."}
            </p>
          </div>

          <button
            onClick={handleTogglePlatform}
            disabled={toggling}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition disabled:opacity-50 shrink-0 ${
              isPlatformActive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <Power size={18} />
            {isPlatformActive ? "إيقاف المنصة الآن" : "إعادة تشغيل المنصة"}
          </button>
        </div>
      </div>

      {/* Academic Year Control */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
          <Calendar size={18} className="text-[#1a5d1a]" />
          حالة العام الدراسي
        </h3>
        <p className="text-xs text-gray-500">
          تحديد ما إذا كان العام الدراسي الحالي سارياً ونشطاً، أو منتهياً.
        </p>

        <div className="flex gap-3 pt-2">
          {[
            { label: "عام دراسي ساري ونشط", value: "active" },
            { label: "عام دراسي منتهي", value: "ended" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleAcademicYearChange(item.value)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition border ${
                settings.academic_year_status === item.value
                  ? "bg-[#1a5d1a] text-white border-[#1a5d1a] shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center Details Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-gray-800 flex items-center gap-2 border-b pb-3">
          <Building size={18} className="text-[#1a5d1a]" />
          البيانات الأساسية للسنتر
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
              <Building size={14} className="text-gray-400" />
              اسم السنتر / الأكاديمية
            </label>
            <input
              type="text"
              required
              value={settings.center_name || ""}
              onChange={(e) => setSettings({ ...settings, center_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
              <Phone size={14} className="text-gray-400" />
              رقم هاتف التواصل الرسمي
            </label>
            <input
              type="tel"
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] focus:bg-white text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
            <MapPin size={14} className="text-gray-400" />
            عنوان السنتر ومقره
          </label>
          <input
            type="text"
            value={settings.address || ""}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] focus:bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
            <Clock size={14} className="text-gray-400" />
            مدة قفل جلسة الحضور التلقائي (بالدقائق)
          </label>
          <input
            type="number"
            min="15"
            max="1440"
            value={settings.default_lock_minutes || 120}
            onChange={(e) => setSettings({ ...settings, default_lock_minutes: e.target.value })}
            className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a5d1a] focus:bg-white text-left"
            dir="ltr"
          />
        </div>

        <div className="pt-3 border-t">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-[#1a5d1a] hover:bg-[#124112] text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
