import React from 'react';

export default function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center p-6"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        {/* Inner brand emblem dot */}
        <div className="absolute w-6 h-6 rounded-full bg-emerald-600/80 animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
        جاري تحميل الصفحة...
      </p>
      <span className="sr-only">جاري تحميل المحتوى، يرجى الانتظار</span>
    </div>
  );
}
