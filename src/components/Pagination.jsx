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
}) => {
  if (totalPages <= 1) return null;

  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    pages.push("...");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
    pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const handleChange = (page) => {
    if (page === "..." || page === currentPage) return;
    if (page < 1 || page > totalPages) return;
    onChange?.(page);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-gray-100 bg-gray-50/50 ${className}`}
    >
      <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
        عرض <b className="text-gray-800">{startItem}</b> -{" "}
        <b className="text-gray-800">{endItem}</b> من{" "}
        <b className="text-gray-800">{total}</b>
      </span>

      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => handleChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="السابق"
        >
          <ChevronRight size={14} />
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={`${page}-${idx}`}
            type="button"
            onClick={() => handleChange(page)}
            disabled={page === "..."}
            className={`min-w-8.5 h-8.5 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              page === currentPage
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : page === "..."
                  ? "bg-transparent text-gray-400 cursor-default"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => handleChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="التالي"
        >
          <ChevronLeft size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default Pagination;