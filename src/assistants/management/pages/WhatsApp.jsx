/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  BarChart3,
  Bell,
  SendHorizontal,
  RotateCcw,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Wifi,
  TrendingUp,
  AlertCircle,
  Zap,
  Users,
  Timer,
  Gauge,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { memo, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner, LoadingState } from "../components/Spinner.jsx";
import {
  useApiQuery,
  useApiMutation,
  useInvalidate,
} from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import {
  notifySuccess,
  notifyError,
  confirmToast,
  toast,
} from "../../../lib/notify";
import {
  fetchWhatsappTemplates,
  toggleWhatsappTemplateAction,
  fetchWhatsappStatus,
  fetchWhatsappStats,
  fetchWhatsappMessages,
  resetFailedWhatsappAction,
  deleteWhatsappMessageAction,
  fetchWhatsappDashboard,
  updateWhatsappTemplateAction,
  updateWhatsappSettingsAction,
} from "../../../api/assistant/actions";

const PAGE_SIZE = 20;
const REFRESH_INTERVAL = 45000;
const STATS_INTERVAL = 30000;

const TYPE_META = {
  welcome: {
    title: "رسالة الترحيب",
    hint: "بتتبعت أول ما الطالب يتسجل في السيستم",
    icon: MessageCircle,
  },
  absence: {
    title: "رسالة الغياب",
    hint: "بتتبعت للغائبين بعد تسجيل الغياب",
    icon: XCircle,
  },
  exam: {
    title: "رسالة الاختبار",
    hint: "بتتبعت بعد رصد درجات الامتحان الورقي",
    icon: Bell,
  },
  payment: {
    title: "رسالة المصاريف",
    hint: "بتتبعت لما تتسجل دفعة للطالب",
    icon: SendHorizontal,
  },
};

const TABS = [
  { key: "pending", label: "معلقة" },
  { key: "sent", label: "مرسلة" },
  { key: "failed", label: "فاشلة" },
];

const TYPE_FILTERS = [
  { key: "", label: "الكل" },
  { key: "welcome", label: "ترحيب" },
  { key: "absence", label: "غياب" },
  { key: "exam", label: "درجات" },
  { key: "payment", label: "مصاريف" },
];

function statusColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "sent" || s === "delivered") return "text-green-600 bg-green-50";
  if (s === "failed") return "text-red-600 bg-red-50";
  return "text-amber-600 bg-amber-50";
}

function statusIcon(status) {
  const s = String(status || "").toLowerCase();
  if (s === "sent" || s === "delivered")
    return <CheckCircle size={16} className="text-green-600" />;
  if (s === "failed") return <XCircle size={16} className="text-red-600" />;
  return <Clock size={16} className="text-amber-600" />;
}

function statusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (s === "sent") return "مرسلة";
  if (s === "delivered") return "تم التسليم";
  if (s === "failed") return "فاشلة";
  return "معلقة";
}

function typeLabel(type) {
  return TYPE_META[String(type || "").toLowerCase()]?.title || type || "رسالة";
}

function recipientLabel(recipient) {
  return recipient === "student" ? "الطالب" : "ولي الأمر";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MessageItem = memo(function MessageItem({
  msg,
  index,
  onDelete,
  deleting,
}) {
  const name = msg?.student_name || `طالب #${msg.student_id ?? ""}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: Math.min(index * 0.01, 0.15) }}
      className="flex items-start justify-between gap-3 p-4 rounded-xl hover:bg-gray-50 transition-all border border-gray-100 mb-2 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`p-2 rounded-lg shrink-0 ${statusColor(msg.status)}`}>
          {statusIcon(msg.status)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full shrink-0">
              {typeLabel(msg.type)}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
              {recipientLabel(msg.recipient)}
            </span>
            <span className="text-xs text-gray-400 shrink-0" dir="ltr">
              {msg.phone || "بدون رقم"}
            </span>
          </div>
          {msg.message && (
            <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap line-clamp-2">
              {msg.message}
            </p>
          )}
          {String(msg.status).toLowerCase() === "failed" &&
            msg.error_message && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {msg.error_message}
              </p>
            )}
          <p className="text-[10px] text-gray-300 mt-1">
            {formatDate(msg.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(msg.status)}`}
        >
          {statusLabel(msg.status)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(msg.id)}
          disabled={deleting}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          title="حذف الرسالة"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
});

function detectType(template) {
  const realType = String(template?.type || template?.Type || "").toLowerCase();
  if (["welcome", "absence", "exam", "payment"].includes(realType)) {
    return realType;
  }

  const raw = [
    template?.name,
    template?.Name,
    template?.template,
    template?.Template,
    template?.template_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/welcome|ترحيب/.test(raw)) return "welcome";
  if (/absen|غياب/.test(raw)) return "absence";
  if (/exam|امتحان|اختبار|درج/.test(raw)) return "exam";
  if (/pay|مصاريف|دفع|سداد/.test(raw)) return "payment";
  return "";
}

const TemplateToggle = memo(function TemplateToggle({
  template,
  onToggle,
  toggling,
  onUpdateSentTo,
}) {
  const type = detectType(template);
  const meta = TYPE_META[type] || {
    title: "قالب رسالة",
    hint: "رسالة واتساب تلقائية",
    icon: MessageSquare,
  };
  const Icon = meta.icon;
  const active = Number(template.is_active ?? template.IsActive ?? 0) === 1;
  const sentTo = String(template.sent_to || "parents").toLowerCase();

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm transition-all ${active ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"}`}
    >
      <div className="flex-1 flex items-center gap-3 text-right min-w-0">
        <div
          className={`p-2 rounded-full shrink-0 ${active ? "bg-green-100" : "bg-gray-100"}`}
        >
          <Icon
            size={16}
            className={active ? "text-green-600" : "text-gray-400"}
          />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">
            {meta.title}
          </p>
          <p className="text-xs text-gray-400 truncate">{meta.hint}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <select
          value={sentTo}
          onChange={(e) =>
            onUpdateSentTo(template.id ?? template.Id, e.target.value)
          }
          disabled={toggling}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="parents">ولي الأمر فقط</option>
          <option value="both">الطالب + ولي الأمر</option>
        </select>

        <button
          type="button"
          disabled={toggling}
          onClick={() => onToggle(template.id ?? template.Id)}
          className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${active ? "bg-green-500" : "bg-gray-300"}`}
          title={active ? "إيقاف" : "تفعيل"}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${active ? "right-0.5" : "right-6.5"}`}
          />
        </button>
        <span
          className={`text-xs font-semibold ${active ? "text-green-600" : "text-gray-400"}`}
        >
          {active ? "مفعل" : "موقوف"}
        </span>
      </div>
    </div>
  );
});

const WhatsApp = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [delayInput, setDelayInput] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const invalidate = useInvalidate();

  const dashboardQuery = useApiQuery(
    qk.whatsapp.dashboard,
    fetchWhatsappDashboard,
    {
      fallback: { stats: {}, templates: [] },
      select: (d) => d?.data ?? d,
      errorMessage: "فشل تحميل بيانات الواتساب",
      refetchInterval: STATS_INTERVAL,
      staleTime: 15000,
    },
  );

  const messagesQuery = useApiQuery(
    qk.whatsapp.messages(activeTab, typeFilter, page),
    () =>
      fetchWhatsappMessages({
        status: activeTab,
        type: typeFilter || undefined,
        page,
        limit: PAGE_SIZE,
      }),
    {
      fallback: [],
      select: (d) => (Array.isArray(d) ? d : []),
      refetchInterval: REFRESH_INTERVAL,
      staleTime: 20000,
    },
  );

  const templatesQuery = useApiQuery(
    qk.whatsapp.templates,
    fetchWhatsappTemplates,
    {
      fallback: [],
      select: (d) => (Array.isArray(d) ? d : (d?.data ?? [])),
      staleTime: 30000,
    },
  );

  const refreshQueue = useCallback(() => {
    invalidate(qk.whatsapp.all);
  }, [invalidate]);

  const toggleMutation = useApiMutation(
    (id) => toggleWhatsappTemplateAction(id),
    {
      invalidateKeys: [qk.whatsapp.templates, qk.whatsapp.dashboard],
      successMessage: "تم تحديث حالة القالب",
      errorMessage: "فشل تحديث حالة القالب",
    },
  );

  const updateSentToMutation = useApiMutation(
    ({ id, sent_to }) => updateWhatsappTemplateAction(id, { sent_to }),
    {
      invalidateKeys: [qk.whatsapp.templates, qk.whatsapp.dashboard],
      successMessage: "تم تحديث الإرسال",
      errorMessage: "فشل تحديث الإرسال",
    },
  );

  const updateSettingsMutation = useApiMutation(
    (settingsData) => updateWhatsappSettingsAction(settingsData),
    {
      invalidateKeys: [qk.whatsapp.dashboard],
      onSuccess: () => {
        notifySuccess("تم تحديث الإعدادات");
        setDelayInput("");
        setLimitInput("");
      },
      errorMessage: "فشل تحديث الإعدادات",
    },
  );

  const resetFailedMutation = useApiMutation(
    () => resetFailedWhatsappAction(),
    {
      onSuccess: (data) => {
        notifySuccess(
          `تم إعادة تعيين ${Array.isArray(data) ? data.length : 0} رسالة`,
        );
        refreshQueue();
      },
      errorMessage: "فشل إعادة تعيين الرسائل الفاشلة",
    },
  );

  const deleteMutation = useApiMutation(
    (id) => deleteWhatsappMessageAction(id),
    {
      onSuccess: () => {
        notifySuccess("تم حذف الرسالة");
        refreshQueue();
      },
      errorMessage: "فشل حذف الرسالة",
    },
  );

  const handleDelete = async (id) => {
    const ok = await confirmToast("متأكد إنك عايز تحذف الرسالة؟");
    if (ok) deleteMutation.mutate(id);
  };

  const handleUpdateSentTo = (id, sent_to) => {
    updateSentToMutation.mutate({ id, sent_to });
  };

  const handleUpdateDelay = () => {
    const value = Number(delayInput);
    if (Number.isFinite(value) && value > 0) {
      updateSettingsMutation.mutate({ whatsapp_delay_seconds: value });
    } else {
      toast.error("يرجى إدخال رقم صحيح أكبر من صفر");
    }
  };

  const handleUpdateLimit = () => {
    const value = Number(limitInput);
    if (Number.isFinite(value) && value > 0) {
      updateSettingsMutation.mutate({ whatsapp_daily_limit: value });
    } else {
      toast.error("يرجى إدخال رقم صحيح أكبر من صفر");
    }
  };

  const dashboardData = dashboardQuery.data || {};
  const stats = dashboardData.stats || {};
  const templates = dashboardData.templates || templatesQuery.data || [];
  const messages = messagesQuery.data || [];
  const pagination = messagesQuery.pagination;
  const totalPages = pagination?.totalPages || 1;

  const refreshing =
    dashboardQuery.isFetching ||
    messagesQuery.isFetching ||
    templatesQuery.isFetching;

  const statCards = useMemo(
    () => [
      {
        label: "إجمالي الرسائل",
        value: stats.total ?? 0,
        icon: BarChart3,
        color: "bg-gray-100 text-gray-600",
      },
      {
        label: "معلقة",
        value: stats.pending ?? 0,
        icon: Clock,
        color: "bg-amber-50 text-amber-600",
      },
      {
        label: "مرسلة",
        value: stats.sent ?? 0,
        icon: CheckCircle,
        color: "bg-green-50 text-green-600",
      },
      {
        label: "فاشلة",
        value: stats.failed ?? 0,
        icon: XCircle,
        color: "bg-red-50 text-red-600",
      },
      {
        label: "تم التسليم",
        value: stats.delivered ?? 0,
        icon: SendHorizontal,
        color: "bg-blue-50 text-blue-600",
      },
      {
        label: "أرسلت اليوم",
        value: stats.sent_today ?? 0,
        icon: Zap,
        color: "bg-purple-50 text-purple-600",
      },
      {
        label: "الحد اليومي",
        value: `${stats.sent_today ?? 0}/${stats.daily_limit ?? 250}`,
        icon: Gauge,
        color: "bg-cyan-50 text-cyan-600",
      },
      {
        label: "التأخير (ثانية)",
        value: stats.delay_seconds ?? 45,
        icon: Timer,
        color: "bg-orange-50 text-orange-600",
      },
    ],
    [stats],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-3 md:p-6 space-y-5 md:space-y-6"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <MessageSquare className="text-primary" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">رسائل الواتساب</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              إدارة الرسائل التلقائية وطابور الإرسال
              {refreshing && (
                <RefreshCw size={12} className="animate-spin text-primary" />
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium bg-green-50 border-green-200 text-green-700">
          <Wifi size={16} />
          متصل
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-3 md:p-4 flex items-center gap-3 shadow-sm"
            >
              <div className={`p-2 rounded-lg ${card.color} shrink-0`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 truncate">{card.label}</p>
                <p className="text-lg font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Settings - Delay & Limit */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 md:p-5 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-800">إعدادات الإرسال</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Delay */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap">
              التأخير (ثانية):
            </label>
            <input
              type="number"
              min={1}
              placeholder={String(stats.delay_seconds ?? 45)}
              value={delayInput}
              onChange={(e) => setDelayInput(e.target.value)}
              className="w-20 rounded-lg border-2 border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={handleUpdateDelay}
              disabled={updateSettingsMutation.isPending}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              حفظ
            </button>
          </div>

          {/* Daily Limit */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap">
              الحد اليومي:
            </label>
            <input
              type="number"
              min={1}
              placeholder={String(stats.daily_limit ?? 250)}
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-20 rounded-lg border-2 border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={handleUpdateLimit}
              disabled={updateSettingsMutation.isPending}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              حفظ
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => resetFailedMutation.mutate()}
          disabled={resetFailedMutation.isPending}
          className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 shrink-0"
        >
          {resetFailedMutation.isPending ? (
            <Spinner size={15} />
          ) : (
            <RotateCcw size={15} />
          )}
          إعادة محاولة الفاشلة
        </button>
      </motion.div>

      {/* Templates */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5"
      >
        <h2 className="font-semibold text-gray-800 mb-1">
          تفعيل الرسائل التلقائية
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          نصوص الرسائل متظبطة من قوالب الواتساب الرسمية، هنا بتتحكم في تشغيلها
          وإيقافها ومن تستهدف.
        </p>
        {templatesQuery.isLoading ? (
          <LoadingState message="جاري تحميل القوالب..." />
        ) : templates.length ? (
          <div className="grid md:grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <TemplateToggle
                key={tpl.id ?? tpl.Id}
                template={tpl}
                onToggle={(id) => toggleMutation.mutate(id)}
                toggling={
                  toggleMutation.isPending &&
                  toggleMutation.variables === (tpl.id ?? tpl.Id)
                }
                onUpdateSentTo={handleUpdateSentTo}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">لا توجد قوالب متاحة حالياً.</p>
        )}
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap sm:mr-auto">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.key || "all"}
                type="button"
                onClick={() => {
                  setTypeFilter(filter.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  typeFilter === filter.key
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => messagesQuery.refetch()}
            disabled={messagesQuery.isFetching}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border-2 border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 shrink-0"
            title="تحديث الرسائل"
          >
            <RefreshCw
              size={16}
              className={messagesQuery.isFetching ? "animate-spin" : ""}
            />
            تحديث
          </button>
        </div>

        {messagesQuery.isLoading ? (
          <LoadingState message="جاري تحميل الرسائل..." />
        ) : messages.length ? (
          <>
            <AnimatePresence>
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  index={index}
                  onDelete={handleDelete}
                  deleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === msg.id
                  }
                />
              ))}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-all"
              >
                <ChevronRight size={15} /> السابق
              </button>
              <span className="text-xs text-gray-400">
                صفحة {page} من {totalPages} • إجمالي{" "}
                {pagination?.total ?? messages.length}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-all"
              >
                التالي <ChevronLeft size={15} />
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">
            لا توجد رسائل في هذه القائمة.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WhatsApp;
