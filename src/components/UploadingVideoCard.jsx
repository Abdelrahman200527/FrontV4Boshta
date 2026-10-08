import React from "react";
import {
  FileVideo,
  Loader2,
  Pause,
  Play,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { useUploadManager } from "../utils/uploadManager";

/**
 * Optimistic Uploading Video Card
 * Renders in the lecture grid while a video is uploading, giving the user
 * the natural feel that the video is already added and processing in place.
 */
export default function UploadingVideoCard() {
  const {
    active,
    title,
    gradeName,
    thumbnailPreview,
    progress,
    stage,
    isPaused,
    pause,
    resume,
    cancel,
  } = useUploadManager();

  if (!active || stage === "done" || stage === "error") {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="group bg-white rounded-xl overflow-hidden border-2 border-emerald-500/40 shadow-md relative transition flex flex-col"
    >
      {/* Thumbnail Area with Upload Overlay */}
      <div className="relative aspect-video bg-gray-900 overflow-hidden flex items-center justify-center">
        {thumbnailPreview ? (
          <img
            src={thumbnailPreview}
            alt={title}
            className="w-full h-full object-cover opacity-50 blur-[1px]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-950/80">
            <FileVideo size={42} className="text-emerald-500/40" />
          </div>
        )}

        {/* Center Progress Circle / Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 bg-black/40 backdrop-blur-[2px]">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/20"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-[#009966] transition-all duration-300 ease-out"
                fill="none"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * progress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-bold text-xs text-white font-mono">
              {progress}%
            </span>
          </div>

          <span className="text-[11px] font-bold text-white/90 text-center leading-tight">
            {stage === "confirming"
              ? "جاري المعالجة والتوثيق..."
              : isPaused
              ? "الرفع متوقف مؤقتاً"
              : "جاري رفع الفيديو..."}
          </span>
        </div>

        {/* Live Status Badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {stage === "confirming" ? "قيد الحفظ" : isPaused ? "مؤقت" : "قيد الرفع"}
          </span>
        </div>

        {/* Control Buttons (Pause / Cancel) */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {isPaused ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resume();
              }}
              className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
              title="استئناف"
            >
              <Play size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                pause();
              }}
              className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
              title="إيقاف مؤقت"
            >
              <Pause size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cancel();
            }}
            className="p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition cursor-pointer"
            title="إلغاء الرفع"
          >
            <X size={13} />
          </button>
        </div>

        {/* Bottom Shimmer Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Info Area */}
      <div className="p-2.5 flex-1 flex flex-col justify-between bg-emerald-50/20">
        <div>
          <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug text-gray-900">
            {title || "فيديو قيد الرفع..."}
          </h3>
          <span className="text-[10px] sm:text-xs text-gray-500 block mt-0.5">
            {gradeName || "محاضرة جديدة"}
          </span>
        </div>

        <div className="mt-2 pt-2 border-t border-emerald-100/60 flex items-center justify-between text-[11px] text-emerald-800">
          <span className="flex items-center gap-1 font-medium">
            <Clock size={11} />
            يتم التجهيز للإتاحة للطلاب
          </span>
          <span className="font-bold font-mono">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
