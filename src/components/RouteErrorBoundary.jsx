import React, { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const errorMessage = error?.message || error?.statusText || String(error || "");

  const isChunkLoadFailed =
    errorMessage.includes("Failed to fetch dynamically imported module") ||
    errorMessage.includes("Importing a module script failed") ||
    errorMessage.includes("error loading dynamically imported module") ||
    error?.name === "ChunkLoadError" ||
    /dynamically imported module/i.test(errorMessage);

  // Auto-reload on chunk load failures (new deployment)
  useEffect(() => {
    if (isChunkLoadFailed) {
      const storageKey = "chunk_error_boundary_reload";
      const lastReload = Number(sessionStorage.getItem(storageKey) || 0);
      const now = Date.now();
      if (now - lastReload > 8000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  }, [isChunkLoadFailed]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        {isChunkLoadFailed ? "تم تحديث المنصة بنسخة جديدة" : "حدث خطأ غير متوقع أثناء تحميل الصفحة"}
      </h2>
      <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
        {isChunkLoadFailed
          ? "تم نشر تحديثات جديدة على النظام. جاري تحديث الصفحة تلقائياً لتطبيق التعديلات..."
          : "نعتذر عن هذا الخطأ المؤقت. يمكنك محاولة إعادة تحميل الصفحة أو العودة للصفحة الرئيسية."}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#009966] text-white rounded-xl text-sm font-semibold hover:bg-[#007a52] transition shadow-sm cursor-pointer"
        >
          <RefreshCw size={16} />
          إعادة تحميل الصفحة
        </button>
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition cursor-pointer"
        >
          <Home size={16} />
          الصفحة الرئيسية
        </button>
      </div>

      {import.meta.env.DEV && error && !isChunkLoadFailed && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left font-mono text-xs text-red-800 max-w-xl overflow-auto" dir="ltr">
          <p className="font-bold mb-1">{errorMessage}</p>
          {error.stack && (
            <pre className="whitespace-pre-wrap text-[11px] text-red-700 opacity-80">{error.stack}</pre>
          )}
        </div>
      )}
    </div>
  );
}
