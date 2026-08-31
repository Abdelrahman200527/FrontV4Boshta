import {
  Users,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Phone,
  User,
  Shield,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import React, { memo, useEffect, useMemo, useState, useCallback } from "react";
import { fetchAssistants, fetchAssistantById } from "../api/teacher/actions";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const PAGE_SIZE = 10;

const AssistantRow = memo(function AssistantRow({ assistant, index, onView }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="hover:bg-blue-50/40 transition-all duration-200 group"
    >
      <td className="text-right pr-4 sm:pr-6 py-3.5">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-sm font-mono text-gray-600 group-hover:bg-blue-100 transition-colors">
          {assistant.id}
        </span>
      </td>
      <td className="text-right py-3.5 font-medium text-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-50 to-emerald-50 flex items-center justify-center shrink-0">
            <User size={18} className="text-green-600" />
          </div>
          <div className="min-w-0">
            <span className="block truncate">{assistant.full_name}</span>
          </div>
        </div>
      </td>
      <td className="text-right py-3.5">
        <span
          className="inline-flex items-center gap-2 text-sm text-gray-600"
          dir="ltr"
        >
          <Phone size={14} className="text-gray-400" />
          {assistant.phone}
        </span>
      </td>
      <td className="text-right py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
            assistant.is_active === 1
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${assistant.is_active === 1 ? "bg-green-500" : "bg-red-500"}`}
          />
          {assistant.is_active === 1 ? "نشط" : "موقوف"}
        </span>
      </td>
      <td className="text-right pr-4 sm:pr-6 py-3.5">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onView(assistant)}
          className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
          title="عرض البيانات"
        >
          <Eye size={17} />
        </motion.button>
      </td>
    </motion.tr>
  );
});

const Assistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewing, setViewing] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssistants = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAssistants();
    if (result.success) {
      setAssistants(result.data || []);
    } else {
      setError(result.error || "فشل تحميل المساعدين");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAssistants();
  }, [loadAssistants]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssistants();
    setRefreshing(false);
  };

  const filteredAssistants = useMemo(() => {
    if (searchQuery.trim() === "") return assistants;
    return assistants.filter(
      (assistant) =>
        assistant.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        assistant.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [assistants, searchQuery]);

  const total = filteredAssistants.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAssistants = useMemo(
    () =>
      filteredAssistants.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredAssistants, currentPage],
  );

  const firstRowNumber = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastRowNumber = Math.min(currentPage * PAGE_SIZE, total);

  const activeCount = assistants.filter((a) => a.is_active === 1).length;
  const inactiveCount = assistants.length - activeCount;

  const handleView = useCallback(async (assistant) => {
    setViewing(assistant);
    setLoadingDetails(true);
    setViewingDetails(null);

    const result = await fetchAssistantById(assistant.id);
    if (result.success) {
      setViewingDetails(result.data);
    }
    setLoadingDetails(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setViewing(null);
    setViewingDetails(null);
  }, []);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل المساعدين...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <XCircle size={48} className="text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadAssistants}
            className="px-4 py-2 bg-[#009966] text-white rounded-lg hover:bg-[#007a52] transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="w-full flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              المساعدون
            </h1>
            <span className="text-sm sm:text-base text-gray-500">
              {assistants.length} مساعد في المنصة
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition self-start sm:self-auto"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <span className="text-lg sm:text-2xl font-bold text-gray-900 block">
              {assistants.length}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500">
              الإجمالي
            </span>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-3 text-center">
            <span className="text-lg sm:text-2xl font-bold text-green-700 block">
              {activeCount}
            </span>
            <span className="text-[10px] sm:text-xs text-green-600">نشط</span>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
            <span className="text-lg sm:text-2xl font-bold text-red-700 block">
              {inactiveCount}
            </span>
            <span className="text-[10px] sm:text-xs text-red-600">موقوف</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-full sm:w-80 focus-within:border-[#009966] transition">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="bg-transparent focus:outline-none text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </motion.header>

      {/* Mobile Cards */}
      <motion.div
        variants={itemVariants}
        className="sm:hidden flex flex-col gap-2"
      >
        {pagedAssistants.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">
              {searchQuery ? "لا يوجد نتائج" : "لا يوجد مساعدين"}
            </p>
          </div>
        ) : (
          pagedAssistants.map((assistant, index) => (
            <motion.div
              key={assistant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
              className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <User size={18} className="text-green-600" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-gray-900 block truncate">
                    {assistant.full_name}
                  </span>
                  <span className="text-xs text-gray-500" dir="ltr">
                    {assistant.phone}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${assistant.is_active === 1 ? "bg-green-500" : "bg-red-500"}`}
                />
                <button
                  onClick={() => handleView(assistant)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                >
                  <Eye size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Desktop Table */}
      <motion.div
        variants={itemVariants}
        className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 rounded-lg p-2">
              <Users size={18} className="text-[#009966]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">
              قائمة المساعدين
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {total} مساعد
          </span>
        </div>

        <div className="max-h-125 overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-150">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 w-20">
                  #
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600">
                  الهاتف
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600">
                  الحالة
                </th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 w-20">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedAssistants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={48} className="text-gray-300" />
                      <p className="text-gray-400 font-medium">
                        {searchQuery
                          ? "لا يوجد مساعدين مطابقين للبحث"
                          : "لا يوجد مساعدين"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedAssistants.map((item, index) => (
                  <AssistantRow
                    key={item.id}
                    assistant={item}
                    index={index}
                    onView={handleView}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <span className="text-sm text-gray-600">
              عرض {firstRowNumber} - {lastRowNumber} من {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg text-gray-900">
                  بيانات المساعد
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Profile Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                      <User size={26} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {viewingDetails?.full_name || viewing.full_name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        #{viewingDetails?.id || viewing.id}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={16} />
                      الهاتف
                    </span>
                    <span className="text-sm font-bold text-gray-800" dir="ltr">
                      {viewingDetails?.phone || viewing.phone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield size={16} />
                      الدور
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {viewingDetails?.role === "assistant"
                        ? "مساعد"
                        : viewingDetails?.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield size={16} />
                      الصلاحيات
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {viewingDetails?.permissions === "center_management"
                        ? "إدارة كاملة"
                        : viewingDetails?.permissions === "online_management"
                          ? "إدارة المنصة التعليمية"
                          : "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle2 size={16} />
                      الحالة
                    </span>
                    <span
                      className={`text-sm font-bold ${(viewingDetails?.is_active ?? viewing.is_active) === 1 ? "text-green-600" : "text-red-600"}`}
                    >
                      {(viewingDetails?.is_active ?? viewing.is_active) === 1
                        ? "نشط"
                        : "موقوف"}
                    </span>
                  </div>

                  {viewingDetails?.created_at && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5">
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} />
                        تاريخ الإنشاء
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {new Date(viewingDetails.created_at).toLocaleDateString(
                          "ar-EG",
                        )}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleCloseModal}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition mt-2"
                  >
                    إغلاق
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Assistants;
