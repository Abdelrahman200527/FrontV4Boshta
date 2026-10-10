import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  X,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  getGoogleStatus,
  getGoogleAuthUrl,
  disconnectGoogle,
  getLiveSessions,
  createLiveSession,
  syncLiveSessionRecording,
  getAllGrades,
  getAllGroups,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminLiveSessions() {
  const [googleStatus, setGoogleStatus] = useState(null);
  const [loadingGoogle, setLoadingGoogle] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    duration_minutes: 60,
    target_type: "grade",
    grade_id: "",
    group_id: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Google Status
  const fetchGoogle = async () => {
    try {
      setLoadingGoogle(true);
      const res = await getGoogleStatus();
      setGoogleStatus(res);
    } catch (err) {
      console.error(err);
      setGoogleStatus({ connected: false });
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Fetch Sessions
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await getLiveSessions();
      const list = Array.isArray(res) ? res : res?.sessions || res?.data || [];
      setSessions(list);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل حصص البث المباشر");
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch Grades & Groups
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [grdRes, grpRes] = await Promise.all([
          getAllGrades(),
          getAllGroups(),
        ]);
        const grdList = Array.isArray(grdRes)
          ? grdRes
          : grdRes?.grades || grdRes?.data || [];
        const grpList = Array.isArray(grpRes)
          ? grpRes
          : grpRes?.groups || grpRes?.data || [];

        setGrades(grdList);
        setGroups(grpList);
        if (grdList.length > 0) {
          setForm((prev) => ({ ...prev, grade_id: String(grdList[0].id) }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchGoogle();
    fetchSessions();
    fetchDependencies();
  }, []);

  // Connect Google
  const handleConnectGoogle = async () => {
    try {
      const res = await getGoogleAuthUrl();
      const url = res?.url || res?.authUrl;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("لم يتم العثور على رابط التفويض");
      }
    } catch (err) {
      toast.error("فشل بدء ربط حساب جوجل");
    }
  };

  // Disconnect Google
  const handleDisconnectGoogle = async () => {
    if (!window.confirm("قطع اتصال حساب Google؟")) return;
    try {
      await disconnectGoogle();
      toast.success("تم قطع الاتصال بنجاح");
      fetchGoogle();
    } catch (err) {
      toast.error("فشل قطع الاتصال");
    }
  };

  // Create Session
  const handleSubmitSession = async (e) => {
    e.preventDefault();
    if (!form.title || !form.start_time) {
      toast.error("يرجى ملء البيانات الإلزامية");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append(
        "start_time",
        new Date(form.start_time).toISOString()
      );
      formData.append("duration_minutes", form.duration_minutes);
      formData.append("target_type", form.target_type);
      if (form.grade_id) formData.append("grade_id", form.grade_id);
      if (form.group_id && form.target_type === "group")
        formData.append("group_id", form.group_id);
      if (selectedFile) formData.append("file", selectedFile);

      await createLiveSession(formData);
      toast.success(
        "تم إنشاء الحصة المباشرة وتوليد رابط Google Meet تلقائياً"
      );
      setIsModalOpen(false);
      setSelectedFile(null);
      fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشل إنشاء الحصة المباشرة");
    } finally {
      setSubmitting(false);
    }
  };

  // Sync Recording
  const handleSyncRecording = async (sessionId) => {
    try {
      await syncLiveSessionRecording(sessionId);
      toast.success("تمت مزامنة تسجيل الحصة بنجاح");
      fetchSessions();
    } catch (err) {
      toast.error("فشل مزامنة التسجيل");
    }
  };

  const isConnected = Boolean(googleStatus?.connected);

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] p-2 rounded-xl">
              <Video size={22} />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">
              حصص البث المباشر (Google Meet)
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-normal">
            إنشاء اجتماعات Google Meet الرسمية تلقائياً، إرفاق الملازم، ومزامنة تسجيلات الحصص
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSessions}
            className="p-2.5 text-gray-600 hover:text-[#1a5d1a] hover:bg-gray-50 rounded-xl border border-gray-200"
            title="تحديث"
          >
            <RefreshCw
              size={18}
              className={loadingSessions ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all"
          >
            <Plus size={18} />
            إنشاء حصة بث مباشر
          </button>
        </div>
      </div>

      {/* Google Account Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isConnected
            ? "bg-emerald-50/70 border-emerald-200"
            : "bg-amber-50/70 border-amber-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isConnected
                ? "bg-emerald-100 text-[#1a5d1a]"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <Video size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">
                حساب Google المربوط بالنظام
              </h3>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isConnected
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isConnected ? "متصل ومعتمد" : "غير متصل"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-normal">
              {isConnected
                ? `الحساب: ${googleStatus?.email || "معتمد للربط التلقائي"} • جاهز لإنشاء روابط Google Meet`
                : "يرجى ربط حساب Google الخاص بالمعلم لتوليد روابط Meet تلقائياً بدون تدخل يدوي"}
            </p>
          </div>
        </div>

        <div>
          {isConnected ? (
            <button
              onClick={handleDisconnectGoogle}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 text-xs font-medium rounded-xl transition-all"
            >
              قطع الاتصال بحساب Google
            </button>
          ) : (
            <button
              onClick={handleConnectGoogle}
              className="px-5 py-2.5 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-xs font-medium rounded-xl shadow-sm transition-all"
            >
              ربط حساب Google الآن
            </button>
          )}
        </div>
      </div>

      {/* Sessions Grid */}
      {loadingSessions ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">جاري تحميل الحصص المباشرة...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Video size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            لا توجد حصص بث مباشر مسجلة
          </h3>
          <p className="text-xs text-gray-500 mb-4 font-normal">
            قم بجدولة أول حصة لايف للطلاب عبر Google Meet
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1a5d1a] text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            إنشاء حصة لايف
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      sess.status === "live"
                        ? "bg-emerald-100 text-emerald-800 animate-pulse"
                        : sess.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {sess.status === "live"
                      ? "بث مباشر الآن"
                      : sess.status === "scheduled"
                      ? "مجدولة قادمة"
                      : "منتهية"}
                  </span>
                  <span className="text-xs text-gray-400 font-normal">
                    {sess.target_type === "grade"
                      ? "لكافة الصف"
                      : sess.target_type === "group"
                      ? "مجموعة محددة"
                      : "طالب خاص"}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 text-base mb-2">
                  {sess.title}
                </h3>
                {sess.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 font-normal">
                    {sess.description}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50/70 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>الموعد:</span>
                    <span className="font-semibold text-gray-800">
                      {sess.start_time
                        ? new Date(sess.start_time).toLocaleString("ar-EG")
                        : "--"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>المدة:</span>
                    <span className="font-semibold text-gray-800">
                      {sess.duration_minutes || 60} دقيقة
                    </span>
                  </div>
                  {sess.material_name && (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <FileText size={14} />
                      <span>الملزمة المرفقة: {sess.material_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-50">
                {sess.meet_link ? (
                  <a
                    href={sess.meet_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white py-2 rounded-xl text-xs font-medium transition-all shadow-sm"
                  >
                    <ExternalLink size={14} />
                    فتح Google Meet
                  </a>
                ) : (
                  <div className="text-center text-xs text-gray-400 py-2 font-normal">
                    رابط الاجتماع قيد المعالجة
                  </div>
                )}

                {sess.status === "ended" && (
                  <button
                    onClick={() => handleSyncRecording(sess.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    <RotateCcw size={14} />
                    مزامنة تسجيل الحصة
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE LIVE SESSION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  إنشاء حصة بث مباشر جديدة
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    عنوان الحصة *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="مثال: المراجعة النهائية لليلة الامتحان"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    الوصف
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="تفاصيل الحصة وما سيتم شرحه..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      تاريخ ووقت البدء *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={form.start_time}
                      onChange={(e) =>
                        setForm({ ...form, start_time: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      المدة (بالدقائق) *
                    </label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="480"
                      value={form.duration_minutes}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          duration_minutes: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      الفئة المستهدفة *
                    </label>
                    <select
                      value={form.target_type}
                      onChange={(e) =>
                        setForm({ ...form, target_type: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    >
                      <option value="grade">الصف بأكمله</option>
                      <option value="group">مجموعة محددة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      الصف الدراسي *
                    </label>
                    <select
                      value={form.grade_id}
                      onChange={(e) =>
                        setForm({ ...form, grade_id: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    >
                      {grades.map((gr) => (
                        <option key={gr.id} value={gr.id}>
                          {gr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.target_type === "group" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      المجموعة المحددة *
                    </label>
                    <select
                      value={form.group_id}
                      onChange={(e) =>
                        setForm({ ...form, group_id: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    >
                      <option value="">اختر المجموعة</option>
                      {groups
                        .filter(
                          (g) => String(g.grade_id) === String(form.grade_id)
                        )
                        .map((grp) => (
                          <option key={grp.id} value={grp.id}>
                            {grp.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    ملزمة الحصة المرفقة (PDF - اختياري)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="w-full text-xs text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-[#1a5d1a]/10 file:text-[#1a5d1a] hover:file:bg-[#1a5d1a]/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-sm font-medium rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "جاري الإنشاء والربط..." : "إنشاء حصة البث"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
