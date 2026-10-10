import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Power,
  RefreshCw,
  Bell,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  getWhatsAppDashboard,
  getWhatsAppQueueStats,
  sendWhatsAppQueue,
  resetFailedWhatsApp,
  getWhatsAppTemplates,
  toggleWhatsAppTemplate,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminWhatsApp() {
  const [dashboard, setDashboard] = useState(null);
  const [queueStats, setQueueStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingQueue, setSendingQueue] = useState(false);
  const [resettingFailed, setResettingFailed] = useState(false);
  const [togglingTemplateId, setTogglingTemplateId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, queueRes, tmplRes] = await Promise.allSettled([
        getWhatsAppDashboard(),
        getWhatsAppQueueStats(),
        getWhatsAppTemplates(),
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboard(dashRes.value || {});
      }
      if (queueRes.status === "fulfilled") {
        setQueueStats(queueRes.value || {});
      }
      if (tmplRes.status === "fulfilled") {
        const rawTemplates = tmplRes.value;
        setTemplates(Array.isArray(rawTemplates) ? rawTemplates : rawTemplates?.templates || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل بيانات منظومة الواتساب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendQueue = async () => {
    try {
      setSendingQueue(true);
      await sendWhatsAppQueue();
      toast.success("تم إطلاق إرسال طابور رسائل الواتساب بنجاح");
      fetchData();
    } catch (err) {
      toast.error(err?.data?.message || "فشل إرسال طابور الرسائل");
    } finally {
      setSendingQueue(false);
    }
  };

  const handleResetFailed = async () => {
    try {
      setResettingFailed(true);
      await resetFailedWhatsApp();
      toast.success("تمت إعادة جدولة الرسائل الفاشلة لإعادة المحاولة");
      fetchData();
    } catch (err) {
      toast.error(err?.data?.message || "فشل إعادة تعيين الرسائل الفاشلة");
    } finally {
      setResettingFailed(false);
    }
  };

  const handleToggleTemplate = async (templateId) => {
    try {
      setTogglingTemplateId(templateId);
      await toggleWhatsAppTemplate(templateId);
      toast.success("تم تحديث حالة القالب بنجاح");
      setTemplates((prev) =>
        prev.map((tmpl) =>
          tmpl.id === templateId ? { ...tmpl, is_active: !tmpl.is_active } : tmpl
        )
      );
    } catch (err) {
      toast.error(err?.data?.message || "فشل تغيير حالة القالب");
    } finally {
      setTogglingTemplateId(null);
    }
  };

  const overview = dashboard?.overview || dashboard || {};
  const queue = queueStats?.queue || queueStats || {};

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={14} />
              منظومة المراسلات والربط التلقائي
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare size={24} className="text-[#1a5d1a]" />
            إدارة رسائل الواتساب الآلية
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            متابعة طابور الإرسال، نماذج الإشعارات للغياب والمصاريف والدرجات، وحالة السيرفر.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition border border-gray-200"
            title="تحديث البيانات"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleSendQueue}
            disabled={sendingQueue}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1a5d1a] hover:bg-[#124112] text-white font-medium text-sm shadow-md transition disabled:opacity-50"
          >
            <Send size={16} />
            {sendingQueue ? "جاري الإرسال..." : "إرسال الطابور الآن"}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-medium block mb-1">إجمالي الرسائل</span>
          <span className="text-2xl font-semibold text-gray-800">
            {overview.total_messages || overview.total || 0}
          </span>
          <span className="text-[11px] text-gray-400 block mt-1">سجل المراسلات الكلي</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <span className="text-xs text-emerald-700 font-medium block mb-1">رسائل تم تسليمها</span>
          <span className="text-2xl font-semibold text-emerald-700">
            {overview.sent_messages || overview.sent || 0}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-1">بنجاح إلى أولياء الأمور</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <span className="text-xs text-amber-700 font-medium block mb-1">في طابور الانتظار</span>
          <span className="text-2xl font-semibold text-amber-700">
            {queue.pending_count || queue.pending || overview.pending_messages || 0}
          </span>
          <span className="text-[11px] text-amber-600 block mt-1">بانتظار دور الإرسال</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <span className="text-xs text-red-700 font-medium block mb-1">رسائل تعذر إرسالها</span>
          <span className="text-2xl font-semibold text-red-700">
            {queue.failed_count || queue.failed || overview.failed_messages || 0}
          </span>
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={handleResetFailed}
              disabled={resettingFailed}
              className="text-xs text-red-600 hover:text-red-800 font-medium underline transition flex items-center gap-1"
            >
              <RotateCcw size={12} />
              إعادة الجدولة
            </button>
          </div>
        </div>
      </div>

      {/* Queue Controller Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-[#1a5d1a] text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-semibold text-base sm:text-lg">طابور الإرسال المبرمج (Automation Queue)</h3>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl font-normal">
            يقوم النظام بإرسال الرسائل بفاصل زمني آمن لتجنب حظر الأرقام. يمكنك إطلاق المعالجة الفورية للطابور أو إعادة محاولة الرسائل التي فشلت بسبب انقطاع الاتصال.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleResetFailed}
            disabled={resettingFailed}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/20 transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={14} />
            {resettingFailed ? "جاري التصفير..." : "إعادة محاولة الفاشل"}
          </button>
          <button
            onClick={handleSendQueue}
            disabled={sendingQueue}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white hover:bg-gray-100 text-[#1a5d1a] rounded-xl text-xs font-medium shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Zap size={14} className="text-[#1a5d1a]" />
            {sendingQueue ? "جاري المعالجة..." : "إطلاق الطابور الآن"}
          </button>
        </div>
      </div>

      {/* Templates Management */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1a5d1a] flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">نماذج الرسائل الآلية المعتمدة</h3>
              <p className="text-xs text-gray-400">تفعيل أو تعطيل النماذج التي يرسلها النظام تلقائياً للطلاب وأولياء الأمور.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">جاري تحميل النماذج...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">لا توجد نماذج مسجلة في النظام.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => {
              const isActive = tmpl.is_active === 1 || tmpl.is_active === true;
              const isToggling = togglingTemplateId === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive ? "bg-white border-gray-200" : "bg-gray-50/60 border-gray-200 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-medium text-sm text-gray-800">{tmpl.name || tmpl.title || "نموذج رسالة"}</h4>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {tmpl.type ? `نوع الحدث: ${tmpl.type}` : ""}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleTemplate(tmpl.id)}
                      disabled={isToggling}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      <Power size={13} />
                      {isActive ? "مفعل تلقائياً" : "معطل"}
                    </button>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                    <p className="text-xs text-gray-600 leading-relaxed font-sans whitespace-pre-line">
                      {tmpl.content || tmpl.template_text || tmpl.message || "نص القالب غير متوفر"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
