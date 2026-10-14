import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    const msg = error?.message || String(error || "");
    const isChunkLoadFailed =
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("error loading dynamically imported module") ||
      error?.name === "ChunkLoadError" ||
      /dynamically imported module/i.test(msg);

    if (isChunkLoadFailed) {
      const storageKey = "chunk_error_boundary_reload";
      const lastReload = Number(sessionStorage.getItem(storageKey) || 0);
      const now = Date.now();
      if (now - lastReload > 8000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const msg = this.state.error?.message || String(this.state.error || "");
      const isChunkLoadFailed =
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("error loading dynamically imported module") ||
        this.state.error?.name === "ChunkLoadError" ||
        /dynamically imported module/i.test(msg);

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {isChunkLoadFailed ? "تم تحديث المنصة بنسخة جديدة" : "حدث خطأ غير متوقع أثناء عرض هذه الصفحة"}
          </h2>
          <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
            {isChunkLoadFailed
              ? "تم نشر تحديثات جديدة على النظام. جاري تحديث الصفحة تلقائياً لتطبيق التعديلات..."
              : "نعتذر عن هذا الخطأ المؤقت. يمكنك محاولة إعادة تحميل الصفحة أو العودة للصفحة الرئيسية."}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm"
            >
              <RefreshCw size={16} />
              إعادة تحميل الصفحة
            </button>
            <button
              onClick={() => {
                this.handleReset();
                window.location.href = "/";
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
            >
              <Home size={16} />
              الصفحة الرئيسية
            </button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-left font-mono text-xs text-red-800 max-w-xl overflow-auto text-left" dir="ltr">
              <p className="font-bold mb-1">{this.state.error.toString()}</p>
              {this.state.error.stack && (
                <pre className="whitespace-pre-wrap text-[11px] text-red-700 opacity-80">{this.state.error.stack}</pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
