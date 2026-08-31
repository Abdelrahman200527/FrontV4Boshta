import {
  MessageCircle, RotateCcw, Save, Clock, CheckCircle, XCircle,
  MessageSquare, QrCode, BarChart3, Bell, LogOut, SendHorizontal, AlertCircle,
  ChevronRight, ChevronLeft, Users, User, UsersRound, Square, Timer, Trash2
} from "lucide-react";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner, LoadingState } from "../components/Spinner.jsx";

// ============ Config ============
const PAGE_SIZE = 30;

const TEMPLATE_TYPES = [
  {
    key: "welcome",
    title: "رسالة الترحيب",
    hint: "بتتبعت مرة واحدة بس أول ما الطالب يتسجل في السيستم",
    icon: MessageCircle,
    color: "blue",
  },
  {
    key: "absence",
    title: "رسالة الغياب",
    hint: "بتتبعت للغائبين فقط بعد إنهاء الجلسة",
    icon: XCircle,
    color: "red",
  },
  {
    key: "exam",
    title: "رسالة الاختبار",
    hint: "بتتبعت لكل اختبار بعد رصد درجات الطلبة",
    icon: Bell,
    color: "purple",
  },
  {
    key: "payment",
    title: "رسالة المصاريف",
    hint: "بتتبعت أوتوماتيك لما تتسجل دفعة للطالب",
    icon: SendHorizontal,
    color: "green",
  },
];

const SEND_TO = [
  { key: "student", label: "الطالب", icon: User },
  { key: "parent", label: "ولي الأمر", icon: Users },
  { key: "both", label: "الاتنين", icon: UsersRound },
];

const TABS = [
  { key: "Pending", label: "معلقة", color: "amber" },
  { key: "Sent", label: "مرسلة", color: "green" },
  { key: "Failed", label: "فاشلة", color: "red" },
];

const MOCK_STATS = { total: 42, pending: 5, sent: 33, failed: 4 };

const MOCK_MESSAGES = {
  Pending: [
    { Id: 1, StudentName: "أحمد محمد علي", Recipient: "parent", Phone: "01012345678", Status: "Pending", Content: "مرحباً، تم تسجيل ابنكم أحمد في السنتر بنجاح." },
    { Id: 2, StudentName: "سارة إبراهيم فؤاد", Recipient: "student", Phone: "01098765432", Status: "Pending", Content: "تذكير: موعد اختبار الغد الساعة 5 مساءً." },
  ],
  Sent: [
    { Id: 3, StudentName: "محمود سيد حسن", Recipient: "parent", Phone: "01111222333", Status: "Sent", Content: "تم تسجيل دفعة بقيمة 300 جنيه لشهر يناير." },
  ],
  Failed: [
    { Id: 4, StudentName: "منة الله عادل", Recipient: "parent", Phone: "01055556666", Status: "Failed", Content: "تم تسجيل غياب اليوم", ErrorMessage: "رقم الهاتف غير صحيح" },
  ],
};

const MOCK_TEMPLATES = {
  welcome: { Id: 1, Type: "welcome", Name: "رسالة الترحيب", Content: "أهلاً بك {student} في {center}!", SendTo: "parent", IsActive: 1 },
  absence: { Id: 2, Type: "absence", Name: "رسالة الغياب", Content: "نأسف لغياب {student} بتاريخ {date}.", SendTo: "parent", IsActive: 1 },
  exam: { Id: 3, Type: "exam", Name: "رسالة الاختبار", Content: "درجة {student} في {exam}: {score}/{max}.", SendTo: "both", IsActive: 0 },
  payment: { Id: 4, Type: "payment", Name: "رسالة المصاريف", Content: "تم استلام {amount} ج من {student} لشهر {month}.", SendTo: "parent", IsActive: 1 },
};

// ============ Helpers ============
function statusColor(status) {
  if (status === "Sent") return "text-green-600 bg-green-50";
  if (status === "Failed") return "text-red-600 bg-red-50";
  return "text-amber-600 bg-amber-50";
}
function statusIcon(status) {
  if (status === "Sent") return <CheckCircle size={16} className="text-green-600" />;
  if (status === "Failed") return <XCircle size={16} className="text-red-600" />;
  return <Clock size={16} className="text-amber-600" />;
}
function statusLabel(status) {
  if (status === "Sent") return "مرسلة";
  if (status === "Failed") return "فاشلة";
  return "معلقة";
}
function recipientLabel(recipient) {
  return recipient === "student" ? "الطالب" : "ولي الأمر";
}

// ============ عنصر الرسالة ============
const MessageItem = memo(function MessageItem({ msg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.25) }}
      className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all border border-gray-100 mb-2"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className={`p-2 rounded-lg shrink-0 ${statusColor(msg.Status)}`}>
          {statusIcon(msg.Status)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {msg.StudentName || "طالب"}
            <span className="text-xs text-gray-400 mr-2">
              {recipientLabel(msg.Recipient)} • {msg.Phone || "بدون رقم"}
            </span>
          </p>
          <p className="text-xs text-gray-500 line-clamp-2 whitespace-pre-wrap">
            {String(msg.Content || msg.Title || "").slice(0, 120)}
          </p>
          {msg.Status === "Failed" && msg.ErrorMessage && (
            <p className="text-[11px] text-red-500 mt-1">{msg.ErrorMessage}</p>
          )}
        </div>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusColor(msg.Status)}`}>
        {statusLabel(msg.Status)}
      </span>
    </motion.div>
  );
});

// ============ كارت القالب ============
const TemplateCard = memo(function TemplateCard({ meta, template, onChange, onSave, saving }) {
  const Icon = meta.icon;
  const textareaRef = useRef(null);

  const insertVar = useCallback((token) => {
    const field = textareaRef.current;
    const current = String(template.Content || "");
    if (!field) {
      onChange(meta.key, { Content: `${current}${token}` });
      return;
    }
    const start = field.selectionStart ?? current.length;
    const end = field.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${token}${current.slice(end)}`;
    onChange(meta.key, { Content: next });
    requestAnimationFrame(() => {
      field.focus();
      const caret = start + token.length;
      field.setSelectionRange(caret, caret);
    });
  }, [meta.key, onChange, template.Content]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <div className="p-1.5 rounded-lg bg-gray-100">
          <Icon size={16} className="text-primary" />
        </div>
        <span className="font-semibold text-gray-800">{meta.title}</span>

        <button
          type="button"
          onClick={() => onChange(meta.key, { IsActive: template.IsActive ? 0 : 1 })}
          className={`mr-auto relative w-12 h-6 rounded-full transition-colors ${template.IsActive ? "bg-primary" : "bg-gray-300"}`}
          title={template.IsActive ? "القالب مفعّل" : "القالب متوقف"}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${template.IsActive ? "translate-x-6" : ""}`}></span>
        </button>
        <span className={`text-xs font-medium ${template.IsActive ? "text-primary" : "text-gray-400"}`}>
          {template.IsActive ? "مفعّل" : "متوقف"}
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-3">{meta.hint}</p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs text-gray-500">تتبعت لمين؟</span>
        {SEND_TO.map((option) => {
          const OptionIcon = option.icon;
          const active = (template.SendTo || "parent") === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(meta.key, { SendTo: option.key })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                active
                  ? "bg-primary/10 text-primary border-primary/40"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <OptionIcon size={13} /> {option.label}
            </button>
          );
        })}
      </div>


      <div className="flex items-center justify-end gap-2 mt-3 flex-wrap">
        <button
          type="button"
          onClick={() => onSave(meta.key)}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-white text-xs font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
        >
          {saving ? <Spinner size={14} className="text-white" /> : <Save size={14} />}
          حفظ القالب
        </button>
      </div>
    </motion.div>
  );
});

const WhatsApp = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState({ isReady: false, isAuthenticated: false, isSending: false });
  const [progress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState("");
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [delaySeconds, setDelaySeconds] = useState(60);
  const [savingSettings, setSavingSettings] = useState(false);
  const [stats, setStats] = useState(MOCK_STATS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const isConnected = Boolean(status.isReady);
  const isAuthenticated = Boolean(status.isAuthenticated);
  const isSending = Boolean(status.isSending);

  // ============ أفعال (no-ops في وضع العرض) ============
  const refreshPage = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const connect = useCallback(() => {
    setConnecting(true);
    setTimeout(() => {
      setStatus({ isReady: true, isAuthenticated: true, isSending: false });
      setConnecting(false);
    }, 800);
  }, []);

  const logout = useCallback(() => {
    setStatus({ isReady: false, isAuthenticated: false, isSending: false });
  }, []);

  const sendPending = useCallback(() => {}, []);
  const retryFailed = useCallback(() => {}, []);
  const stopSending = useCallback(() => {}, []);

  const clearSent = useCallback(() => {
    setMessages((prev) => ({ ...prev, Sent: [] }));
    setStats((prev) => ({ ...prev, sent: 0 }));
  }, []);

  const changeTemplate = useCallback((key, patch) => {
    setTemplates((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), ...patch } }));
  }, []);

  const saveTemplate = useCallback((key) => {
    setSavingTemplate(key);
    setTimeout(() => setSavingTemplate(""), 500);
  }, []);

  const saveSettings = useCallback(() => {
    setSavingSettings(true);
    setTimeout(() => setSavingSettings(false), 500);
  }, []);

  const refreshMessages = useCallback(() => {}, []);

  // ============ بيانات العرض ============
  const rows = messages[activeTab] || [];
  const total = rows.length;
  const totalPages = 1;
  const currentPage = 1;

  const statCards = useMemo(() => ([
    { label: "إجمالي الرسائل", value: stats.total, icon: MessageSquare },
    { label: "رسائل معلقة", value: stats.pending, icon: Clock },
    { label: "رسائل مرسلة", value: stats.sent, icon: CheckCircle },
    { label: "رسائل فاشلة", value: stats.failed, icon: XCircle },
  ]), [stats]);

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen">
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <MessageCircle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">الواتساب</h1>
              <p className="text-sm text-gray-500">إدارة القوالب والرسائل وحالة الاتصال</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshPage}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60"
          >
            <RotateCcw size={16} className={refreshing ? "animate-spin" : ""} /> تحديث الصفحة
          </motion.button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border ${
            isConnected ? "bg-green-50 border-green-200 text-green-700"
            : isAuthenticated ? "bg-yellow-50 border-yellow-200 text-yellow-700"
            : "bg-red-50 border-red-200 text-red-700"}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : isAuthenticated ? "bg-yellow-500" : "bg-red-500"}`}></span>
            <span className="text-sm font-medium">{isConnected ? "متصل" : isAuthenticated ? "جاري الاتصال..." : "غير متصل"}</span>
          </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((stat, idx) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-2 rounded-lg bg-gray-100">
                <stat.icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============ يمين: الاتصال + إعدادات الإرسال ============ */}
        <div className="lg:col-span-1 space-y-4">

          {/* إعدادات الإرسال */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-xl"><Timer size={18} className="text-white" /></div>
              <h4 className="font-bold text-gray-800">إعدادات الإرسال</h4>
            </div>

            <label className="text-sm font-medium text-gray-700">التأخير بين كل رسالة والتي بعدها (بالثواني)</label>
            <input
              type="number" min="0" value={delaySeconds}
              onChange={(e) => setDelaySeconds(e.target.value)}
              className="mt-1.5 w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button type="button" onClick={saveSettings} disabled={savingSettings}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50">
              {savingSettings ? <Spinner size={16} className="text-white" /> : <Save size={16} />} حفظ الإعدادات
            </button>
          </div>

          {/* إحصائيات سريعة */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-xl"><BarChart3 size={18} className="text-white" /></div>
              <h4 className="font-bold text-gray-800">إحصائيات سريعة</h4>
            </div>
            <div className="space-y-2">
              {[
                { label: "رسائل معلقة", value: stats.pending },
                { label: "رسائل مرسلة", value: stats.sent },
                { label: "رسائل فاشلة", value: stats.failed },
                { label: "المجموع الكلي", value: stats.total },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-bold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ شمال: الرسائل + القوالب ============ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary rounded-xl"><MessageSquare size={18} className="text-white" /></div>
                <h3 className="font-bold text-gray-800">الرسائل</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {TABS.map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.key ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {tab.label} ({tab.key === "Pending" ? stats.pending : tab.key === "Sent" ? stats.sent : stats.failed})
                  </button>
                ))}
              </div>
            </div>

            {/* أزرار الإرسال */}
            <div className="px-4 pt-3 pb-2 border-b border-gray-100 bg-gray-50/60">
              <div className="flex flex-wrap gap-3">
                <button onClick={sendPending} disabled={!isConnected || stats.pending === 0 || isSending}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    isConnected && stats.pending > 0 && !isSending
                      ? "bg-primary text-white hover:shadow-lg hover:shadow-primary/30"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                  {isSending ? <Spinner size={16} className="text-white" /> : <SendHorizontal size={18} />}
                  {isSending ? "جاري الإرسال..." : `إرسال المعلقة (${stats.pending})`}
                </button>

                <button onClick={retryFailed} disabled={!isConnected || stats.failed === 0 || isSending}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    isConnected && stats.failed > 0 && !isSending
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                  <RotateCcw size={18} /> إعادة إرسال الفاشلة ({stats.failed})
                </button>

                {isSending && (
                  <button onClick={stopSending}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all">
                    <Square size={16} /> إيقاف
                  </button>
                )}

                <button onClick={refreshMessages}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all">
                  <RotateCcw size={16} /> تحديث
                </button>

                {stats.sent > 0 && (
                  <button onClick={clearSent}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all">
                    <Trash2 size={16} /> مسح المرسلة
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-2 text-xs">
                {progress && (
                  <p className="text-blue-600 flex items-center gap-1">
                    <Spinner size={12} /> {progress.done || 0} / {progress.total || 0} — ناجحة {progress.sent || 0} / فاشلة {progress.failed || 0}
                  </p>
                )}
                {!isConnected && (
                  <p className="text-red-600 flex items-center gap-1"><AlertCircle size={12} /> الواتساب غير متصل، اتصل أولاً</p>
                )}
                {isConnected && stats.pending === 0 && stats.failed === 0 && (
                  <p className="text-green-600 flex items-center gap-1"><CheckCircle size={12} /> مفيش رسائل في الانتظار</p>
                )}
              </div>
            </div>

            <div className="p-4 max-h-[340px] overflow-y-auto">
              {rows.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">
                    لا توجد رسائل {activeTab === "Pending" ? "معلقة" : activeTab === "Sent" ? "مرسلة" : "فاشلة"}
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {rows.map((msg, idx) => <MessageItem key={msg.Id} msg={msg} index={idx} />)}
                </AnimatePresence>
              )}
            </div>

            {total > PAGE_SIZE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-sm">
                <span className="text-gray-600">
                  عرض {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, total)} من {total}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40">
                    <ChevronRight size={16} />
                  </button>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-medium">{currentPage} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40">
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* القوالب */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl"><Save size={18} className="text-white" /></div>
              <div>
                <h3 className="font-bold text-gray-800">قوالب الرسائل</h3>
                <p className="text-xs text-gray-400">3 قوالب: الترحيب، الغياب، الاختبار</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {TEMPLATE_TYPES.map((meta) => (
                <TemplateCard
                  key={meta.key}
                  meta={meta}
                  template={templates[meta.key] || { Content: "", SendTo: "parent", IsActive: 1 }}
                  onChange={changeTemplate}
                  onSave={saveTemplate}
                  saving={savingTemplate === meta.key}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default WhatsApp;