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
  Barcode,
  Loader2,
} from "lucide-react";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  const [searchInput, setSearchInput] = useState("");
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
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

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

  // ✅ Debounce Search - يبحث تلقائياً بعد التوقف عن الكتابة
  const handleSearchChange = (value) => {
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
      setPage(1);
    }, 500);
  };

  // ✅ زرار البحث
  const handleSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  // ✅ مسح البحث
  const handleClearSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleStudentClick = (student) => {
    navigate(`/teacher/students/${student.id}`);
  };

  const handleQuickView = async (student) => {
    setPreviewStudent(student);
    const result = await fetchStudentDetails(student.id);
    if (result.success) {
      setPreviewStudent({
        ...student,
        ...result.data.profile,
        stats: result.data.stats,
      });
    }
  };

  const filteredGroups = useMemo(
    () =>
      selectedGrade
        ? groups.filter((group) => group.grade_id === parseInt(selectedGrade))
        : groups,
    [groups, selectedGrade],
  );

  if (loading && !refreshing && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الطلاب...</p>
        </div>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Users size={48} className="text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadStudents}
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
          <div className="flex items-center gap-3">
            <div className="bg-[#009966]/10 rounded-xl p-2.5">
              <Users size={22} className="text-[#009966]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                الطلاب
              </h1>
              <span className="text-xs sm:text-sm text-gray-500">
                {totalStudents} طالب في المنصة
              </span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {refreshing ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود أو الهاتف..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-transparent focus:outline-none text-sm w-full"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="text-gray-400 shrink-0 hover:text-red-500 transition"
              >
                <X size={14} />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#009966] text-white rounded-lg text-xs font-bold hover:bg-[#007a52] transition shrink-0"
            >
              بحث
            </button>
          </div>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition border shrink-0 ${
              showFilter
                ? "bg-[#009966] text-white border-[#009966]"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            <Filter size={14} />
            تصفية
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border border-gray-200 rounded-lg p-3">
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedGroup("");
                    setPage(1);
                  }}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#009966]"
                >
                  <option value="">كل الصفوف</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#009966]"
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Desktop Table */}
      <motion.div
        variants={itemVariants}
        className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-[20%] px-4 py-3.5 text-center text-xs font-bold text-gray-600">
                  الطالب
                </th>
                <th className="w-[12%] px-4 py-3.5 text-center text-xs font-bold text-gray-600">
                  الباركود
                </th>
                <th className="w-[15%] px-4 py-3.5 text-center text-xs font-bold text-gray-600">
                  الصف
                </th>
                <th className="w-[15%] px-4 py-3.5 text-center text-xs font-bold text-gray-600">
                  المجموعة
                </th>
                <th className="w-[20%] px-4 py-3.5 text-center text-xs font-bold text-gray-600">
                  الهاتف
                </th>
                <th className="w-[10%] px-4 py-3.5 text-center text-xs font-bold text-gray-600">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    لا يوجد طلاب
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-sm text-gray-900 truncate">
                        {student.full_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600 text-center">
                      {student.barcode}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                      {student.grade_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                      {student.group_name || "-"}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-600 text-center"
                      dir="ltr"
                    >
                      {student.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickView(student);
                        }}
                        className="p-2 text-[#009966] hover:bg-[#009966]/10 rounded-lg transition inline-flex"
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

      {/* Mobile Cards */}
      <motion.div
        variants={itemVariants}
        className="lg:hidden flex flex-col gap-2.5"
      >
        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm font-bold">لا يوجد طلاب</p>
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-gray-200 p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm text-gray-900 block truncate">
                    {student.full_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {student.barcode}
                  </span>
                </div>
                <button
                  onClick={() => handleQuickView(student)}
                  className="p-2 text-[#009966] hover:bg-[#009966]/10 rounded-lg transition"
                >
                  <Eye size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-gray-50 transition text-gray-600"
          >
            <ChevronRight size={14} />
            السابق
          </button>
          <span className="text-sm text-gray-600 font-bold">
            {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-gray-50 transition text-gray-600"
          >
            التالي
            <ChevronLeft size={14} />
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <AnimatePresence>
        {previewStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3"
            onClick={() => setPreviewStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {previewStudent.full_name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {previewStudent.barcode}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewStudent(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Details */}
              <div className="p-5 flex flex-col gap-3">
                {/* Grade */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="bg-green-50 rounded-lg p-2 shrink-0">
                    <GraduationCap size={16} className="text-[#009966]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 block">الصف</span>
                    <span className="font-bold text-sm text-gray-900">
                      {previewStudent.grade_name || "-"}
                    </span>
                  </div>
                </div>

                {/* Group */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="bg-blue-50 rounded-lg p-2 shrink-0">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 block">
                      المجموعة
                    </span>
                    <span className="font-bold text-sm text-gray-900">
                      {previewStudent.group_name || "-"}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="bg-purple-50 rounded-lg p-2 shrink-0">
                    <Phone size={16} className="text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 block">
                      رقم الهاتف
                    </span>
                    <span className="font-bold text-sm text-gray-900" dir="ltr">
                      {previewStudent.phone || "-"}
                    </span>
                  </div>
                </div>

                {/* Parent Phone */}
                {previewStudent.parent_phone && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="bg-orange-50 rounded-lg p-2 shrink-0">
                      <Phone size={16} className="text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-gray-500 block">
                        هاتف ولي الأمر
                      </span>
                      <span
                        className="font-bold text-sm text-gray-900"
                        dir="ltr"
                      >
                        {previewStudent.parent_phone}
                      </span>
                    </div>
                  </div>
                )}

                {/* View Full Profile Button */}
                <button
                  onClick={() => {
                    setPreviewStudent(null);
                    navigate(`/teacher/students/${previewStudent.id}`);
                  }}
                  className="w-full mt-2 py-2.5 bg-[#009966] text-white rounded-xl text-sm font-bold hover:bg-[#007a52] transition flex items-center justify-center gap-2"
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