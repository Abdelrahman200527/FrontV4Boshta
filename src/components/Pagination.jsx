/* eslint-disable no-unused-vars */
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  total = 0,
  limit = 20,
  onChange,
  className = "",
  showTotal = true,
}) => {
  if (totalPages <= 1) return null;

  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const hasTotal = typeof total === "number" && total > 0;
  const startItem = hasTotal ? (validCurrentPage - 1) * limit + 1 : 0;
  const endItem = hasTotal ? Math.min(validCurrentPage * limit, total) : 0;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (validCurrentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
      return pages;
    }

    if (validCurrentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    pages.push("...");
    for (let i = validCurrentPage - 1; i <= validCurrentPage + 1; i++) pages.push(i);
    pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const handleChange = (page) => {
    if (page === "..." || page === validCurrentPage) return;
    if (page < 1 || page > totalPages) return;
    onChange?.(page);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-gray-100 bg-gray-50/70 select-none ${className}`}
    >
      {/* Item summary / Page info */}
      {showTotal && (
        <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-right font-medium order-2 sm:order-1">
          {hasTotal ? (
            <>
              عرض <strong className="text-gray-900 font-bold">{startItem}</strong> -{" "}
              <strong className="text-gray-900 font-bold">{endItem}</strong> من{" "}
              <strong className="text-primary font-bold">{total}</strong>
            </>
          ) : (
            <>
              صفحة <strong className="text-gray-900 font-bold">{validCurrentPage}</strong> من{" "}
              <strong className="text-gray-900 font-bold">{totalPages}</strong>
            </>
          )}
        </span>
      )}

      {/* Mobile Pagination (< sm) */}
      <div className="flex sm:hidden items-center justify-between w-full gap-2 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => handleChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-bold text-gray-700 shadow-xs"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight size={15} />
          <span>السابق</span>
        </button>

        <span className="shrink-0 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 shadow-xs">
          {validCurrentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => handleChange(validCurrentPage + 1)}
          disabled={validCurrentPage === totalPages}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-bold text-gray-700 shadow-xs"
          aria-label="الصفحة التالية"
        >
          <span>التالي</span>
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* Desktop / Tablet Pagination (>= sm) */}
      <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center order-2">
        <button
          type="button"
          onClick={() => handleChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-gray-700 shadow-xs"
          aria-label="السابق"
          title="الصفحة السابقة"
        >
          <ChevronRight size={16} />
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={`${page}-${idx}`}
            type="button"
            onClick={() => handleChange(page)}
            disabled={page === "..."}
            className={`min-w-[36px] h-9 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              page === validCurrentPage
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : page === "..."
                  ? "bg-transparent text-gray-400 cursor-default"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 active:scale-95 shadow-xs"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => handleChange(validCurrentPage + 1)}
          disabled={validCurrentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-gray-700 shadow-xs"
          aria-label="التالي"
          title="الصفحة التالية"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default Pagination;