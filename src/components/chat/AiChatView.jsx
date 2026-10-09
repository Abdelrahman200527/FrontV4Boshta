import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Clock,
  ChevronDown,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MrBoshtaAvatar from "../../assets/Mr-Boshta-removebg.png";
import MarkdownRenderer from "../MarkdownRenderer";
import {
  getAiHistory,
  getAiQuota,
  sendAiMessage,
  clearAiHistory,
} from "../../api/ai/services";
import { notifySuccess, notifyError, notifyInfo } from "../../lib/notify";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ROLE_CONFIG = {
  student: {
    pageTitle: "اسأل مستر محمد بشتة",
    pageSubtitle: "معلمك الخصوصي لمادة اللغة العربية",
    welcomeTitle: "أهلاً بك يا بطل في شات مستر محمد بشتة!",
    welcomeDesc:
      "أنا معك هنا لشرح أي قاعدة، إعراب أي بيت شعري، أو حل أي سؤال وتدريب يقف أمامك. يمكنك أيضاً إرفاق صورة مسألة أو ملف PDF لتحليله وشرحه.",
    quickPrompts: [
      "اشرح لي قاعدة إعراب الممنوع من الصرف باختصار مع أمثلة",
      "أعرب جملة: (كان حقاً علينا نصرُ المؤمنين)",
      "ما الفرق بين الاستعارة المكنية والتصريحية؟",
      "حلل لي البيت الشعري: ولستُ أرى السعادةَ جمعَ مالٍ ولكنَّ التقيَّ هو السعيدُ",
    ],
  },
  assistant: {
    pageTitle: "المساعد الذكي لإدارة المادة والامتحانات",
    pageSubtitle: "المستشار الأكاديمي لإعداد بنوك الأسئلة ومراجعة الواجبات",
    welcomeTitle: "مرحباً بك يا زميلي العزيز!",
    welcomeDesc:
      "أنا في خدمتك لمساعدتك في صياغة نماذج الامتحانات، مراجعة الأسئلة وتوليد التمارين والواجبات والتأكد من صياغتها وفقاً لمعايير الثانوية العامة.",
    quickPrompts: [
      "اقترح 5 أسئلة اختيار من متعدد على الوحدة الأولى نحو لمستوى متفوقين",
      "صغ سؤالاً مقالياً يقيس الفهم البلاغي مع نموذج الإجابة وتوزيع الدرجات",
      "راجع صياغة هذا السؤال واقترح مشتتات دقيقة",
      "لخص النقاط الجدلية الشائعة في إعراب المصدر المؤول",
    ],
  },
  teacher: {
    pageTitle: "المستشار الأكاديمي وتحضير الحصص",
    pageSubtitle: "مساعدك الأكاديمي لتحضير الدروس، الاختبارات، والشواهد النحوية",
    welcomeTitle: "أهلاً بك يا أستاذنا الفاضل!",
    welcomeDesc:
      "أنا في خدمتك للمساعدة في تحضير خطط الحصص، مراجعة الشواهد البلاغية والنحوية، صياغة امتحانات شاملة، ومناقشة دقائق اللغة.",
    quickPrompts: [
      "اقترح خطة تدريس لحصة مراجعة نهائية في النحو لمدة ساعتين",
      "اجمع لي أهم الشواهد الشعرية على جواز تقديم الخبر على المبتدأ وجوباً وجوازاً",
      "صغ 10 أسئلة بنمط الثانوية العامة الجديد لقياس مستويات التفكير العليا",
      "اكتب تمهيداً مشوقاً لشرح درس الإيجاز والإطناب في البلاغة",
    ],
  },
  super_admin: {
    pageTitle: "المستشار الأكاديمي وإدارة المحتوى",
    pageSubtitle: "المستشار الذكي لإدارة المنهج والامتحانات",
    welcomeTitle: "مرحباً بك في المستشار الأكاديمي!",
    welcomeDesc:
      "يمكنك استخدام هذه الشاشة لاختبار بنوك الأسئلة، مراجعة المناهج والتحضيرات وصياغة الاختبارات المعيارية.",
    quickPrompts: [
      "مراجعة معايير امتحانات الثانوية العامة في مادة اللغة العربية",
      "توليد نموذج اختبار تجريبي شامل مع مفتاح الإجابة",
      "اقتراح محاور توزيع الدرجات على فروع اللغة العربية",
    ],
  },
};

export default function AiChatView({ role = "student" }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  const [messages, setMessages] = useState([]);
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Load History and Quota
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [historyData, quotaData] = await Promise.all([
        getAiHistory(role).catch(() => []),
        getAiQuota(role).catch(() => null),
      ]);
      setMessages(historyData || []);
      setQuota(quotaData);
    } catch (error) {
      console.error("Failed to load AI data:", error);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Scroll to bottom when messages update or after loading
  useEffect(() => {
    if (!loading) {
      scrollToBottom("auto");
    }
  }, [messages, loading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // File selection handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      notifyError("يرجى اختيار ملف PDF أو صورة بحجم لا يتعدى 25 ميجابايت (JPG, PNG, WEBP)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      notifyError("حجم الملف كبير جداً. الحد الأقصى المسموح به هو 25 ميجابايت");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const removeSelectedFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Copy message text
  const handleCopy = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    notifySuccess("تم نسخ الرد بنجاح");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Send message
  const handleSendMessage = async (customText = null) => {
    const textToSend = customText !== null ? customText : inputText;
    const hasText = Boolean(textToSend && textToSend.trim());
    const hasFile = Boolean(selectedFile);

    if ((!hasText && !hasFile) || sending) return;

    // Check quota
    if (quota?.messages?.remaining !== undefined && quota.messages.remaining <= 0) {
      notifyError("لقد استنفدت الحد اليومي المسموح به من الرسائل. يتجدد رصيدك تلقائياً غداً.");
      return;
    }

    if (hasFile && quota?.files?.remaining !== undefined && quota.files.remaining <= 0) {
      notifyError("لقد استنفدت الحد اليومي المسموح به لرفع الملفات (3 ملفات يومياً). يمكنك إرسال سؤالك نصياً.");
      return;
    }

    const currentFile = selectedFile;
    const currentFileName = currentFile ? currentFile.name : null;

    // Optimistic user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      message: textToSend.trim() || (currentFileName ? `[ملف مرفق: ${currentFileName}]` : "ملف مرفق"),
      file_name: currentFileName,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText("");
    removeSelectedFile();
    setSending(true);

    try {
      const result = await sendAiMessage(role, {
        message: textToSend,
        file: currentFile,
      });

      if (result?.success && result?.data) {
        const { reply, message_id, quota: updatedQuota } = result.data;
        const modelMsg = {
          id: message_id || Date.now(),
          role: "model",
          message: reply,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, modelMsg]);

        if (updatedQuota) {
          setQuota(updatedQuota);
        }
      } else {
        notifyError(result?.message || "تعذر الحصول على رد من المساعد");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errMsg =
        error?.data?.message ||
        error?.message ||
        "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.";

      if (error?.status === 429) {
        notifyError("لقد استنفدت الحد اليومي المسموح به. يتجدد الرصيد تلقائياً كل 24 ساعة.");
      } else {
        notifyError(errMsg);
      }
    } finally {
      setSending(false);
      setTimeout(() => scrollToBottom("smooth"), 100);
    }
  };

  // Clear history (Start new chat)
  const handleClearHistory = async () => {
    if (!window.confirm("هل تريد بالتأكيد بدء محادثة جديدة وتصفير السجل السابق؟")) {
      return;
    }

    setClearing(true);
    try {
      await clearAiHistory(role);
      setMessages([]);
      notifySuccess("تم بدء محادثة جديدة بنجاح");
    } catch (error) {
      notifyError(error?.message || "فشل تصفير سجل المحادثة");
    } finally {
      setClearing(false);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isQuotaExceeded = quota?.messages?.remaining !== undefined && quota.messages.remaining <= 0;

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] lg:h-[calc(100vh-5rem)] max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200/90 overflow-hidden">
      {/* 1. CHAT HEADER */}
      <header className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-50/70 via-white to-gray-50/90 border-b border-gray-200/80 flex items-center justify-between gap-3 shrink-0">
        {/* Right: Teacher Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-100/80 border-2 border-[#009966]/40 p-0.5 flex items-center justify-center overflow-hidden shadow-xs">
              <img
                src={MrBoshtaAvatar}
                alt="مستر محمد بشتة"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"
              title="متصل الآن"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                مستر محمد بشتة
              </h2>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                {config.pageTitle}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1 font-medium truncate">
              <span>معلم اللغة العربية</span>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-600 font-semibold">متصل الآن</span>
            </p>
          </div>
        </div>

        {/* Center / Left: Daily Quota & New Chat Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Daily Quota Badge */}
          {quota && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isQuotaExceeded
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-gray-50/90 text-gray-700 border-gray-200"
              }`}
              title="رصيد الرسائل والملفات اليومي، يتجدد تلقائياً كل 24 ساعة"
            >
              <Clock size={13} className={isQuotaExceeded ? "text-red-500" : "text-[#009966]"} />
              <span>
                متبقي:{" "}
                <strong className={isQuotaExceeded ? "text-red-700" : "text-gray-900"}>
                  {quota.messages?.remaining ?? 100}
                </strong>{" "}
                رسالة
              </span>
              <span className="text-gray-300">•</span>
              <span>
                <strong>{quota.files?.remaining ?? 3}</strong> ملفات
              </span>
            </div>
          )}

          {/* New Chat Button */}
          <button
            onClick={handleClearHistory}
            disabled={clearing || messages.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
            title="بدء محادثة جديدة وتصفير السجل السابق"
          >
            <RotateCcw
              size={14}
              className={`text-[#009966] ${clearing ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">محادثة جديدة</span>
          </button>
        </div>
      </header>

      {/* Mobile Quota Sub-bar */}
      {quota && (
        <div className="sm:hidden px-3 py-1 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
          <span className="flex items-center gap-1 font-medium">
            <Clock size={11} className="text-[#009966]" />
            الرصيد اليومي:
          </span>
          <span className="font-semibold text-gray-800">
            {quota.messages?.remaining ?? 100} رسالة • {quota.files?.remaining ?? 3} ملفات
          </span>
        </div>
      )}

      {/* 2. MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 touch-scroll bg-[#f8faf9]/50">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="w-9 h-9 border-3 border-gray-200 border-t-[#009966] rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-medium">جاري تجهيز المحادثة...</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center text-center p-4 max-w-lg mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 p-1 flex items-center justify-center mb-3 shadow-xs">
              <img
                src={MrBoshtaAvatar}
                alt="مستر محمد بشتة"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5">
              {config.welcomeTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
              {config.welcomeDesc}
            </p>

            {/* Quick Prompt Capsules */}
            {config.quickPrompts && config.quickPrompts.length > 0 && (
              <div className="w-full text-right">
                <span className="text-[11px] font-bold text-gray-400 block mb-2 px-1">
                  💡 أمثلة مقترحة يمكنك البدء بها:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {config.quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-right p-2.5 rounded-xl border border-gray-200/90 bg-white hover:bg-emerald-50/60 hover:border-emerald-300 text-xs text-gray-700 transition shadow-2xs leading-snug cursor-pointer group"
                    >
                      <span className="group-hover:text-emerald-800">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Messages List */
          <>
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const timeStr = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start gap-2.5 sm:gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar for Mr. Boshta only */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 shrink-0 overflow-hidden p-0.5 shadow-2xs mt-1">
                      <img
                        src={MrBoshtaAvatar}
                        alt="مستر محمد بشتة"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Attached File Card if present */}
                    {msg.file_name && (
                      <div
                        className={`mb-1.5 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border shadow-2xs ${
                          isUser
                            ? "bg-emerald-800/10 text-emerald-900 border-emerald-700/20"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        <FileText size={14} className="text-emerald-700" />
                        <span className="font-semibold truncate max-w-[200px]" dir="ltr">
                          {msg.file_name}
                        </span>
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl shadow-xs transition ${
                        isUser
                          ? "bg-[#1a5d1a] text-white rounded-br-xs selection:bg-emerald-300 selection:text-emerald-950"
                          : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed">
                          {msg.message}
                        </p>
                      ) : (
                        <MarkdownRenderer content={msg.message} />
                      )}
                    </div>

                    {/* Footer Info: Time & Copy Action */}
                    <div className="flex items-center gap-2 mt-1 px-1">
                      {timeStr && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          {timeStr}
                        </span>
                      )}

                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id || index, msg.message)}
                          className="text-[11px] text-gray-400 hover:text-emerald-700 flex items-center gap-1 transition cursor-pointer"
                          title="نسخ نص الإجابة"
                        >
                          {copiedId === (msg.id || index) ? (
                            <>
                              <Check size={11} className="text-emerald-600" />
                              <span className="text-emerald-600 font-bold">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {sending && (
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 shrink-0 overflow-hidden p-0.5 shadow-2xs mt-1">
                  <img
                    src={MrBoshtaAvatar}
                    alt="مستر محمد بشتة"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white border border-gray-200/80 rounded-2xl rounded-bl-xs p-3.5 shadow-xs flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">
                    مستر محمد يكتب الآن
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009966] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009966] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009966] animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT BAR */}
      <footer className="p-3 sm:p-4 bg-white border-t border-gray-200/80 shrink-0 space-y-2">
        {/* Quota Exceeded Notice */}
        {isQuotaExceeded && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle size={15} className="text-amber-600 shrink-0" />
            <span>
              لقد استنفدت الحد اليومي المسموح به من الرسائل (100 رسالة). يتجدد رصيدك تلقائياً مع بداية اليوم الجديد.
            </span>
          </div>
        )}

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="flex items-center justify-between gap-3 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {filePreviewUrl ? (
                <img
                  src={filePreviewUrl}
                  alt="معاينة"
                  className="w-9 h-9 rounded-lg object-cover border border-emerald-300"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0">
                  <FileText size={18} />
                </div>
              )}
              <div className="min-w-0">
                <span className="font-bold text-gray-900 block truncate" dir="ltr">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-gray-500 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} ميجابايت
                </span>
              </div>
            </div>

            <button
              onClick={removeSelectedFile}
              className="p-1 hover:bg-emerald-100 rounded-lg text-gray-500 hover:text-red-600 transition cursor-pointer"
              title="إلغاء الملف المرفق"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-end gap-2 bg-gray-50/90 border border-gray-200 rounded-2xl p-1.5 sm:p-2 focus-within:border-[#009966] focus-within:ring-2 focus-within:ring-[#009966]/10 transition">
          {/* File Attachment Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={sending || isQuotaExceeded}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || isQuotaExceeded}
            className="p-2 sm:p-2.5 text-gray-500 hover:text-[#009966] hover:bg-gray-200/60 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            title="إرفاق ملف PDF أو صورة (بحد أقصى 25 ميجابايت)"
          >
            <Paperclip size={19} />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isQuotaExceeded
                ? "تم استنفاد الرصيد اليومي للرسائل..."
                : "اسأل مستر محمد بشتة في أي قاعدة أو مسألة... (أو ارفع ملف PDF / صورة)"
            }
            disabled={sending || isQuotaExceeded}
            rows={1}
            className="flex-1 bg-transparent resize-none border-0 p-1.5 sm:p-2 text-sm sm:text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none max-h-36 disabled:opacity-60 leading-relaxed font-normal"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={
              sending ||
              isQuotaExceeded ||
              (!inputText.trim() && !selectedFile)
            }
            className="p-2.5 sm:p-3 rounded-xl bg-[#1a5d1a] hover:bg-[#144d14] text-white transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            title="إرسال (Enter)"
          >
            <Send size={17} className="transform rotate-180" />
          </button>
        </div>

        {/* Small Bottom Helper */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
          <span>اضغط Enter للإرسال، أو Shift + Enter لسطر جديد</span>
          <span className="hidden sm:inline">يقبل ملفات PDF والصور حتى 25 ميجابايت</span>
        </div>
      </footer>
    </div>
  );
}
