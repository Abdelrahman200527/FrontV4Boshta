import {
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Phone,
  Users,
  GraduationCap,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  UserCheck,
  Calendar,
  Wallet,
  Barcode,
  Layers,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllStudents,
  fetchStudentFilters,
  fetchStudentDetails,
} from "../api/teacher/actions";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [previewStudent, setPreviewStudent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadFilters = useCallback(async () => {
    const result = await fetchStudentFilters();
    if (result.success) {
      setGrades(result.data?.grades || []);
      setGroups(result.data?.groups || []);
    }
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAllStudents(
      page,
      searchQuery,
      selectedGrade,
      selectedGroup,
    );
    if (result.success) {
      setStudents(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalStudents(result.pagination?.total || result.data.length);
    } else {
      setError(result.error || "فشل تحميل الطلاب");
    }
    setLoading(false);
  }, [page, searchQuery, selectedGrade, selectedGroup]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleSearch = () => {
    setPage(1);
    loadStudents();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
    loadStudents();
  };

  const handleStudentClick = (student) => {
    navigate(`/teacher/students/${student.id}`);
  };

  const handleQuickView = async (student) => {
    setPreviewStudent(student);
    setPreviewLoading(true);
    const result = await fetchStudentDetails(student.id);
    if (result.success) {
      setPreviewStudent({
        ...student,
        ...result.data.profile,
        stats: result.data.stats,
      });
    }
    setPreviewLoading(false);
  };

  const filteredGroups = useMemo(
    () =>
      selectedGrade
        ? groups.filter((group) => group.grade_id === parseInt(selectedGrade))
        : groups,
    [groups, selectedGrade],
  );

  const handleRetry = () => {
    loadStudents();
  };

  if (loading && !refreshing && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#009966]/20 border-t-[#009966] rounded-full animate-spin"></div>
            <Users
              size={28}
              className="absolute inset-0 m-auto text-[#009966]"
            />
          </div>
          <p className="text-gray-500 text-sm font-bold">
            جاري تحميل الطلاب...
          </p>
        </div>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4 bg-white rounded-2xl p-8 shadow-lg">
          <Users size={48} className="text-red-300" />
          <p className="text-gray-600 font-bold">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-[#009966] text-white rounded-lg hover:bg-[#007a52] transition font-bold text-sm"
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
          <div className="flex items-center gap-3">
            <div className="bg-[#009966]/10 rounded-xl p-2.5">
              <Users size={22} className="text-[#009966]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                الطلاب
              </h1>
              <span className="text-xs sm:text-sm text-gray-500">
                {totalStudents} طالب في المنصة
              </span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] hover:text-[#009966] transition self-start sm:self-auto shadow-sm"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            تحديث البيانات
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex-1 lg:flex-none lg:w-96 shadow-sm">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-transparent focus:outline-none text-xs sm:text-sm w-full"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X size={14} />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="text-xs sm:text-sm font-bold text-white bg-[#009966] px-3 py-1.5 rounded-lg hover:bg-[#007a52] transition shrink-0"
            >
              بحث
            </button>
          </div>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition border ${
              showFilter
                ? "bg-[#009966] text-white border-[#009966]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#009966]"
            }`}
          >
            <Filter size={14} />
            تصفية متقدمة
            {showFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    الصف الدراسي
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedGroup("");
                      setPage(1);
                    }}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-xs sm:text-sm outline-none focus:border-[#009966] bg-gray-50"
                  >
                    <option value="">كل الصفوف</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    المجموعة
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      setPage(1);
                    }}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-xs sm:text-sm outline-none focus:border-[#009966] bg-gray-50 disabled:opacity-50"
                    disabled={!selectedGrade}
                  >
                    <option value="">كل المجموعات</option>
                    {filteredGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Cards */}
      <motion.div variants={itemVariants} className="lg:hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-[#009966] rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm font-bold">لا يوجد طلاب</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {students.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md hover:border-[#009966]/30 transition"
              >
                <div
                  onClick={() => handleStudentClick(student)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#009966]/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-[#009966] text-sm">
                          {student.full_name?.charAt(0) || "ط"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-gray-900 block truncate">
                          {student.full_name}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Barcode size={10} />
                          {student.barcode}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full shrink-0">
                      {student.grade_name || "-"}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-2.5 text-[10px] text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Phone size={10} className="text-gray-400" />
                      {student.phone || "-"}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Layers size={10} className="text-gray-400" />
                      {student.group_name || "-"}
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => handleQuickView(student)}
                    className="text-[10px] font-bold text-[#009966] hover:text-[#007a52] flex items-center gap-1"
                  >
                    <Eye size={11} />
                    عرض سريع
                  </button>
                  <button
                    onClick={() => handleStudentClick(student)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    الملف الكامل
                    <ChevronLeft size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Desktop Table */}
      <motion.div
        variants={itemVariants}
        className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-linear-to-l from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <div className="bg-[#009966]/10 rounded-lg p-1.5">
              <Users size={16} className="text-[#009966]" />
            </div>
            <h2 className="font-bold text-gray-800 text-sm">قائمة الطلاب</h2>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {totalStudents} طالب
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-175">
            <thead>
              <tr className="bg-gray-50/80">
                {[
                  { label: "الباركود", icon: Barcode },
                  { label: "الاسم", icon: Users },
                  { label: "الصف", icon: GraduationCap },
                  { label: "المجموعة", icon: Layers },
                  { label: "الهاتف", icon: Phone },
                  { label: "ولي الأمر", icon: Phone },
                  { label: "إجراء", icon: null },
                ].map((header, idx) => (
                  <th
                    key={idx}
                    className="text-right py-3.5 px-4 text-xs font-bold text-gray-600 whitespace-nowrap border-b border-gray-200"
                  >
                    <span className="flex items-center gap-1.5">
                      {header.icon && (
                        <header.icon size={13} className="text-gray-400" />
                      )}
                      {header.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#009966] rounded-full animate-spin"></div>
                      <span className="text-gray-400 text-sm">
                        جاري التحميل...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Users size={48} className="mx-auto mb-2 text-gray-200" />
                    <span className="text-gray-400 text-sm font-bold">
                      لا يوجد طلاب
                    </span>
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-[#009966]/5 transition-colors group"
                  >
                    <td
                      onClick={() => handleStudentClick(student)}
                      className="py-3 px-4 text-xs font-mono cursor-pointer"
                    >
                      {student.barcode}
                    </td>
                    <td
                      onClick={() => handleStudentClick(student)}
                      className="py-3 px-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#009966]/10 flex items-center justify-center shrink-0">
                          <span className="font-bold text-[#009966] text-xs">
                            {student.full_name?.charAt(0) || "ط"}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-gray-900">
                          {student.full_name}
                        </span>
                      </div>
                    </td>
                    <td
                      onClick={() => handleStudentClick(student)}
                      className="py-3 px-4 text-xs cursor-pointer"
                    >
                      <span className="bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-full text-[11px]">
                        {student.grade_name || "-"}
                      </span>
                    </td>
                    <td
                      onClick={() => handleStudentClick(student)}
                      className="py-3 px-4 text-xs cursor-pointer"
                    >
                      {student.group_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600" dir="ltr">
                      {student.phone || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600" dir="ltr">
                      {student.parent_phone || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleQuickView(student)}
                        className="p-2 text-[#009966] hover:bg-[#009966]/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="عرض سريع"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2 shadow-sm"
        >
          <span className="text-xs text-gray-500 font-bold">
            عرض صفحة {page} من {totalPages} - إجمالي {totalStudents} طالب
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
            >
              <ChevronRight size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = page <= 3 ? i + 1 : page - 2 + i;
              if (pageNum > totalPages || pageNum < 1) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                    page === pageNum
                      ? "bg-[#009966] text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Quick View Modal */}
      <AnimatePresence>
        {previewStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3"
            onClick={() => setPreviewStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-linear-to-l from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#009966]/10 flex items-center justify-center">
                    <span className="font-bold text-[#009966] text-lg">
                      {previewStudent.full_name?.charAt(0) || "ط"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {previewStudent.full_name}
                    </h3>
                    <span className="text-[11px] text-gray-500">
                      باركود: {previewStudent.barcode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewStudent(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="p-5">
                {previewLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#009966] rounded-full animate-spin"></div>
                  </div>
                ) : previewStudent.stats ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-green-50 rounded-xl p-3.5 text-center">
                      <Calendar
                        size={18}
                        className="text-green-600 mx-auto mb-1.5"
                      />
                      <span className="font-bold text-lg text-green-700 block">
                        {previewStudent.stats.attendance_percentage || 0}%
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        نسبة الحضور
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3.5 text-center">
                      <GraduationCap
                        size={18}
                        className="text-blue-600 mx-auto mb-1.5"
                      />
                      <span className="font-bold text-lg text-blue-700 block">
                        {previewStudent.stats.avg_paper_degree || 0}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        متوسط الدرجات
                      </span>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3.5 text-center">
                      <Wallet
                        size={18}
                        className="text-orange-600 mx-auto mb-1.5"
                      />
                      <span className="font-bold text-lg text-orange-700 block">
                        {previewStudent.stats.total_paid || 0}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        المدفوع
                      </span>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3.5 text-center">
                      <UserCheck
                        size={18}
                        className="text-purple-600 mx-auto mb-1.5"
                      />
                      <span className="font-bold text-lg text-purple-700 block">
                        {previewStudent.stats.total_online_exams || 0}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        امتحانات
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-sm py-6">
                    لا توجد بيانات
                  </p>
                )}

                <button
                  onClick={() => {
                    setPreviewStudent(null);
                    navigate(`/teacher/students/${previewStudent.id}`);
                  }}
                  className="w-full mt-4 py-2.5 bg-[#009966] text-white rounded-xl text-sm font-bold hover:bg-[#007a52] transition flex items-center justify-center gap-2"
                >
                  عرض الملف الكامل
                  <ChevronLeft size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Students;
