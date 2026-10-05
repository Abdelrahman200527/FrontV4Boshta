import React, { useEffect, useState } from "react";
import { LogOut, ArrowRight, Sparkles, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { clearAllAuthCookies } from "../utils/cookies";
import { isDemoMode, clearDemoState } from "../utils/demo";

export default function DemoBadge() {
  const [isDemo, setIsDemo] = useState(() => isDemoMode());
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDemo(isDemoMode());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isDemo) return null;

  const exitDemo = () => {
    clearDemoState();
    clearAllAuthCookies();
    window.location.href = "/";
  };

  const backToDemo = () => {
    window.location.href = "/demo";
  };

  return (
    <aside aria-label="شريط النسخة التجريبية" className="fixed bottom-4 left-4 z-[9999]" dir="rtl">
      {isCollapsed ? (
        // Floating Collapsed Pill - Compact, non-intrusive, clear of content
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3.5 py-2 rounded-full shadow-lg shadow-red-500/40 border border-white/20 flex items-center gap-2 text-xs font-bold transition-all transform hover:scale-105 cursor-pointer backdrop-blur-md"
          title="انقر لفتح خيارات النسخة التجريبية"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-300" />
            نسخة تجريبية (Demo)
          </span>
          <ChevronUp size={14} className="opacity-80" />
        </button>
      ) : (
        // Expanded Panel with Minimize Option
        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col gap-2.5 max-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span>النسخة التجريبية</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded-lg transition"
              title="تصغير الزر العائم"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <p className="text-[11px] text-white/90 leading-relaxed font-medium">
            تتصفح الآن بيانات تجريبية تحاكي عاماً دراسياً كاملاً بدون الحاجة لخادم حقيقي.
          </p>

          <div className="flex flex-col gap-2 mt-1">
            <button
              onClick={backToDemo}
              className="w-full bg-white text-red-700 hover:bg-red-50 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <Layers size={14} />
              الرجوع لاختيار الديمو
            </button>

            <button
              onClick={exitDemo}
              className="w-full bg-black/20 hover:bg-black/35 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 border border-white/10"
            >
              <LogOut size={13} />
              إنهاء وتفريغ الديمو
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
