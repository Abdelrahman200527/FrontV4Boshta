import React, { useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  FileVideo,
} from "lucide-react";
import { useUploadManager } from "../utils/uploadManager";

/**
 * Floating Upload Dock Widget
 * Appears dynamically when an upload is active, allowing the user to
 * freely browse any page while the video continues uploading in the background.
 */
export default function FloatingUploadDock({ onExpandModal = null }) {
  const {
    active,
    title,
    gradeName,
    thumbnailPreview,
    progress,
    uploadedBytes,
    totalBytes,
    stage,
    error,
    isPaused,
    pause,
    resume,
    cancel,
    dismiss,
  } = useUploadManager();

  const [minimized, setMinimized] = useState(false);

  if (!active && stage !== "done" && stage !== "error") {
    return null;
  }

  const formatMB = (bytes) => {
    if (!bytes) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
  };

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 left-4 z-50 transition-all duration-300 pointer-events-auto"
      style={{ maxWidth: "calc(100vw - 2rem)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden w-80 sm:w-96 text-right transition-all">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-[#1a5d1a] text-white px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {stage === "done" ? (
              <CheckCircle2 size={17} className="text-emerald-300 shrink-0" />
            ) : stage === "error" ? (
              <AlertCircle size={17} className="text-red-300 shrink-0" />
            ) : (
              <div className="relative shrink-0 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-emerald-200" />
              </div>
            )}

            <div className="min-w-0">
              <span className="font-bold text-xs truncate block leading-tight">
                {stage === "done"
                  ? "تم حفظ الفيديو بنجاح"
                  : stage === "error"
                  ? "حدث خطأ أثناء الرفع"
                  : stage === "confirming"
                  ? "جاري المعالجة والتوثيق..."
                  : isPaused
                  ? "الرفع متوقف مؤقتاً"
                  : `جاري رفع الفيديو (${progress}%)`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setMinimized(!minimized)}
              className="p-1 hover:bg-white/10 rounded-md text-white/80 hover:text-white transition cursor-pointer"
              title={minimized ? "تكبير" : "تصغير"}
            >
              {minimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            <button
              type="button"
              onClick={stage === "done" || stage === "error" ? dismiss : cancel}
              className="p-1 hover:bg-white/10 rounded-md text-white/80 hover:text-white transition cursor-pointer"
              title={stage === "done" || stage === "error" ? "إغلاق" : "إلغاء الرفع"}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {!minimized && (
          <div className="p-3.5 flex flex-col gap-2.5 bg-white">
            <div className="flex items-center gap-2.5">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt={title}
                  className="w-12 h-9 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-50"
                />
              ) : (
                <div className="w-12 h-9 rounded-lg bg-emerald-50 text-[#1a5d1a] border border-emerald-100 flex items-center justify-center shrink-0">
                  <FileVideo size={18} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate" title={title}>
                  {title || "بدون عنوان"}
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
                  <span>{gradeName || "محاضرة عامة"}</span>
                  <span className="font-mono text-emerald-800 font-bold">{progress}%</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {stage !== "done" && stage !== "error" && (
              <div className="flex flex-col gap-1">
                <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-[#1a5d1a] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(progress, 3)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>{formatMB(uploadedBytes)}</span>
                  <span>{formatMB(totalBytes)}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {stage === "error" && error && (
              <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 leading-tight">
                {error}
              </p>
            )}

            {/* Bottom Actions */}
            {stage !== "done" && stage !== "error" && (
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-1.5">
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={resume}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold transition cursor-pointer"
                    >
                      <Play size={12} />
                      <span>استئناف</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pause}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold transition cursor-pointer"
                    >
                      <Pause size={12} />
                      <span>إيقاف مؤقت</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={cancel}
                    className="text-[11px] text-red-600 hover:text-red-700 px-2 py-1 transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

                {onExpandModal && (
                  <button
                    type="button"
                    onClick={onExpandModal}
                    className="text-[11px] text-emerald-800 hover:underline font-bold"
                  >
                    عرض التفاصيل
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
