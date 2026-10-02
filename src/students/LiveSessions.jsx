import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  Users,
  PlayCircle,
  Download,
  RefreshCw,
  AlertCircle,
  Radio,
  CheckCircle2,
  XCircle,
  BookOpen,
  Loader2,
  WifiOff,
} from "lucide-react";
import { pageVariants, itemVariants } from "../motion";
import {
  studentGetLiveSessions,
  studentJoinSession,
  studentGetDownloadMaterialUrl,
} from "../api/live-sessions/services";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_META = {
  scheduled: {
    label: "مجدولة",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    pulse: false,
  },
  live: {
    label: "مباشر الآن",
    badge: "bg-green-100 text-[#009966] border-green-200",
    dot: "bg-green-500",
    pulse: true,
  },
  ended: {
    label: "منتهية",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
    pulse: false,
  },
  cancelled: {
    label: "ملغاة",
    badge: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-500",
    pulse: false,
  },
};

const TARGET_LABELS = {
  grade: "صف دراسي",
  group: "مجموعة",
  private: "خاص",
};

function formatArabicDateTime(isoString) {
  if (!isoString) return "—";
  try {
    const safeString = typeof isoString === "string" ? isoString.replace(" ", "T") : isoString;
    const date = new Date(safeString);
    const dayName = date.toLocaleDateString("ar-EG", { weekday: "long" });
    const dayNum = date.toLocaleDateString("ar-EG", { day: "numeric" });
    const month = date.toLocaleDateString("ar-EG", { month: "long" });
    const year = date.toLocaleDateString("ar-EG", { year: "numeric" });
    const time = date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${dayName} ${dayNum} ${month} ${year} | ${time}`;
  } catch {
    return isoString;
  }
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.scheduled;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.badge}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`inline-flex rounded-full h-2 w-2 ${meta.dot} ${meta.pulse ? "opacity-75" : ""}`}
        />
        {meta.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${meta.dot} opacity-60`}
          />
        )}
      </span>
      {meta.label}
    </span>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ filtered }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 gap-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
        <Video size={36} className="text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium">
        {filtered
          ? "لا توجد حصص تطابق هذا الفلتر"
          : "لا توجد حصص متاحة حالياً"}
      </p>
      <p className="text-gray-400 text-sm">
        ستظهر هنا حصص البث المباشر عند إضافتها
      </p>
    </motion.div>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session, onJoin, joiningId }) {
  const { status, title, description, start_time, duration_minutes, target_type, recording_url, material_name, id } = session;

  const isJoining = joiningId === id;
  const canJoin = status === "scheduled" || status === "live";
  const hasRecording = status === "ended" && recording_url;
  const materialUrl = material_name ? studentGetDownloadMaterialUrl(id) : null;

  const targetLabel = TARGET_LABELS[target_type] ?? target_type ?? "—";

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white border rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow
        ${status === "live" ? "border-green-300 ring-1 ring-green-200" : "border-gray-200"}`}
    >
      {/* Top row: status + target */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <StatusBadge status={status} />
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
          <Users size={11} />
          {targetLabel}
        </span>
      </div>

      {/* Title & description */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
        )}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {start_time && (
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-[#009966]" />
            {formatArabicDateTime(start_time)}
          </span>
        )}
        {duration_minutes && (
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-[#009966]" />
            {duration_minutes} دقيقة
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        {/* Join button */}
        {canJoin && (
          <button
            onClick={() => onJoin(session)}
            disabled={isJoining}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition
              ${isJoining
                ? "bg-[#009966]/60 cursor-not-allowed"
                : "bg-[#009966] hover:bg-[#007a52] active:scale-95"
              }`}
          >
            {isJoining ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Radio size={15} />
            )}
            {isJoining ? "جاري الانضمام..." : "انضمام للحصة"}
          </button>
        )}

        {/* Watch recording */}
        {hasRecording && (
          <a
            href={recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition"
          >
            <PlayCircle size={15} />
            مشاهدة التسجيل
          </a>
        )}

        {/* Download material */}
        {materialUrl && (
          <a
            href={materialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active:scale-95 transition"
          >
            <Download size={15} />
            تحميل المادة
          </a>
        )}

        {/* Ended / no actions placeholder */}
        {status === "ended" && !hasRecording && (
          <span className="flex items-center gap-1 text-xs text-gray-400 py-2">
            <CheckCircle2 size={13} />
            انتهت الحصة
          </span>
        )}

        {status === "cancelled" && (
          <span className="flex items-center gap-1 text-xs text-red-400 py-2">
            <XCircle size={13} />
            تم إلغاء هذه الحصة
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "all", label: "الكل" },
  { id: "scheduled", label: "مجدولة" },
  { id: "live", label: "مباشر" },
  { id: "ended", label: "منتهية" },
];

function FilterTabs({ active, counts, onChange }) {
  return (
    <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
      {TABS.map((tab) => {
        const count = tab.id === "all" ? counts.all : (counts[tab.id] ?? 0);
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap
              ${isActive
                ? "border-[#009966] text-[#009966]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
            <span
              className={`mr-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold
                ${isActive ? "bg-[#009966] text-white" : "bg-gray-100 text-gray-500"}`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-green-50 border-green-200 text-[#1a5d1a]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 border px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${colors}`}
    >
      {type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {message}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const LiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [joiningId, setJoiningId] = useState(null);
  const [toast, setToast] = useState(null);

  // ── fetch ────────────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setError(null);
    try {
      const data = await studentGetLiveSessions();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      // Sort: live first, then scheduled, then ended, then cancelled
      const ORDER = { live: 0, scheduled: 1, ended: 2, cancelled: 3 };
      list.sort((a, b) => {
        const od = (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9);
        if (od !== 0) return od;
        return new Date(a.start_time.replace(" ", "T")) - new Date(b.start_time.replace(" ", "T"));
      });
      setSessions(list);
    } catch (err) {
      console.error("LiveSessions fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "فشل تحميل الحصص، يرجى المحاولة مرة أخرى"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
  };

  // ── join flow ────────────────────────────────────────────────────────────
  const handleJoin = useCallback(async (session) => {
    setJoiningId(session.id);
    try {
      const data = await studentJoinSession(session.id);
      // Backend returns meet_link inside the response
      const link = data?.meet_link || session.meet_link;
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        setToast({ type: "error", message: "لا يوجد رابط للحصة حالياً" });
      }
    } catch (err) {
      console.error("Join session error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "تعذر الانضمام للحصة، تحقق من صلاحياتك";
      setToast({ type: "error", message: msg });
    } finally {
      setJoiningId(null);
    }
  }, []);

  // ── derived counts & filtered list ──────────────────────────────────────
  const counts = useMemo(() => {
    const c = { all: sessions.length, scheduled: 0, live: 0, ended: 0, cancelled: 0 };
    sessions.forEach((s) => {
      if (c[s.status] !== undefined) c[s.status]++;
    });
    return c;
  }, [sessions]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return sessions;
    return sessions.filter((s) => s.status === activeTab);
  }, [sessions, activeTab]);

  // ── full-page loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">جاري تحميل الحصص...</p>
        </div>
      </div>
    );
  }

  // ── full-page error ──────────────────────────────────────────────────────
  if (error && sessions.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-50 p-4"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <WifiOff size={28} className="text-red-400" />
          </div>
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadSessions();
            }}
            className="px-5 py-2.5 bg-[#009966] text-white rounded-xl font-bold text-sm hover:bg-[#007a52] transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // ── main render ──────────────────────────────────────────────────────────
  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-6 w-full min-h-screen p-3 sm:p-5"
      dir="rtl"
    >
      {/* ── Page Header ── */}
      <motion.header variants={itemVariants} className="flex flex-col gap-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1a5d1a]/10 flex items-center justify-center shrink-0">
                <Video size={18} className="text-[#1a5d1a]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                حصص البث المباشر
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 mr-11">
              تابع حصصك المباشرة وانضم إليها بسهولة
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 self-start sm:self-auto bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:border-[#009966] hover:text-[#009966] transition"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>

        {/* Soft error banner (non-blocking) */}
        {error && sessions.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertCircle size={13} />
            {error}
          </div>
        )}
      </motion.header>

      {/* ── Summary Cards ── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
      >
        {[
          { id: "live",      label: "مباشر الآن",  icon: Radio,        color: "text-green-600",  bg: "bg-green-50"  },
          { id: "scheduled", label: "مجدولة",       icon: Calendar,     color: "text-blue-600",   bg: "bg-blue-50"   },
          { id: "ended",     label: "منتهية",       icon: CheckCircle2, color: "text-gray-500",   bg: "bg-gray-50"   },
          { id: "all",       label: "الكل",         icon: BookOpen,     color: "text-[#1a5d1a]",  bg: "bg-[#1a5d1a]/5" },
        ].map(({ id, label, icon: Icon, color, bg }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`bg-white rounded-2xl p-3 sm:p-4 text-center border-2 transition
              ${activeTab === id
                ? "border-[#009966] shadow-[4px_4px_0_#009966]"
                : "border-transparent hover:border-[#009966]/40"
              }`}
          >
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
              <Icon size={17} className={color} />
            </div>
            <span className="text-lg sm:text-xl font-bold block text-gray-900">
              {id === "all" ? counts.all : (counts[id] ?? 0)}
            </span>
            <span className="text-[10px] text-gray-500">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── Filter Tabs ── */}
      <motion.div variants={itemVariants}>
        <FilterTabs active={activeTab} counts={counts} onChange={setActiveTab} />
      </motion.div>

      {/* ── Sessions Grid ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
        >
          {filtered.length === 0 ? (
            <div className="col-span-full">
              <EmptyState filtered={activeTab !== "all"} />
            </div>
          ) : (
            filtered.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onJoin={handleJoin}
                joiningId={joiningId}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            key="toast"
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default LiveSessions;
