/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Phone,
  Users,
  GraduationCap,
  RotateCcw,
  Eye,
  Barcode,
  Loader2,
  FileText,
  CalendarCheck2,
  BarChart3,
  Award,
} from "lucide-react";
import {
  fetchAllStudents,
  fetchStudentFilters,
  fetchStudentDetails,
} from "../api/teacher/actions";
import { exportPdfTable, exportAoaExcel } from "../utils/office";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../components/Pagination";
import ResponsiveTable from "../components/ResponsiveTable";
import getImageUrl from "../utils/imageUrl";

const PAGE_SIZE = 20;

const Students = () => {
  const navigate = useNavigate();

  // State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Exports
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Preview Student Modal
  const [previewStudent, setPreviewStudent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const debounceRef = useRef(null);

  // Load Grade & Group Filters
  const loadFilters = useCallback(async () => {
    try {
      const result = await fetchStudentFilters();
      if (result.success && result.data) {
        setGrades(result.data.grades || []);
        setGroups(result.data.groups || []);
      }
    } catch (err) {
      console.error("Failed to load student filters:", err);
    }
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  // Load Students List
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAllStudents(
        page,
        searchQuery,
        selectedGrade,
        selectedGroup,
      );
      if (result.success) {
        setStudents(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalStudents(result.pagination?.total || (result.data?.length ?? 0));
      } else {
        setError(result.error || "فشل تحميل قائمة الطلاب");
      }
    } catch (err) {
      console.error("Load students error:", err);
      setError("حدث خطأ أثناء تحميل بيانات الطلاب");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedGrade, selectedGroup]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Search input handler with debounce
  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
      setPage(1);
    }, 450);
  };

  const handleClearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const clearAllFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchQuery("");
    setSelectedGrade("");
    setSelectedGroup("");
    setPage(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFilters(), loadStudents()]);
    setRefreshing(false);
  };

  // Quick view student modal
  const handleQuickView = async (student) => {
    setPreviewStudent(student);
    setPreviewLoading(true);
    setImgError(false);
    try {
      const result = await fetchStudentDetails(student.id);
      if (result.success && result.data) {
        setPreviewStudent({
          ...student,
          ...result.data.profile,
          stats: result.data.stats,
        });
      }
    } catch (err) {
      console.error("Student detail error:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Filtered groups based on selected grade
  const filteredGroups = useMemo(() => {
    if (!selectedGrade) return groups;
    return groups.filter(
      (g) => String(g.grade_id) === String(selectedGrade),
    );
  }, [groups, selectedGrade]);

  // PDF Export
  const handleExportPDF = async () => {
    try {
      setExportingPdf(true);
      const result = await fetchAllStudents(
        1,
        searchQuery,
        selectedGrade,
        selectedGroup,
        "all",
      );
      const studentList =
        result.success && Array.isArray(result.data) && result.data.length > 0
          ? result.data
          : students;

      if (!studentList || studentList.length === 0) return;

      const gradeLabel = selectedGrade
        ? grades.find((g) => String(g.id) === String(selectedGrade))?.name
        : "";
      const groupLabel = selectedGroup
        ? groups.find((g) => String(g.id) === String(selectedGroup))?.name
        : "";

      let title = "قائمة جميع الطلاب";
      if (gradeLabel && groupLabel) {
        title = `قائمة طلاب (${gradeLabel} - ${groupLabel})`;
      } else if (gradeLabel) {
        title = `قائمة طلاب (${gradeLabel})`;
      } else if (groupLabel) {
        title = `قائمة طلاب (${groupLabel})`;
      }
      title += ` - إجمالي: ${studentList.length} طالب`;

      const filterDesc = [gradeLabel, groupLabel].filter(Boolean).join("_");
      const filename = `كشف_الطلاب_${filterDesc ? `${filterDesc.replace(/\s+/g, "_")}_` : ""}${new Date().toISOString().slice(0, 10)}.pdf`;

      exportPdfTable(
        filename,
        title,
        [
          { header: "#", key: "index", width: 8 },
          { header: "الاسم", key: "full_name", width: 35 },
          { header: "الباركود", key: "barcode", width: 18 },
          { header: "الصف", key: "grade_name", width: 22 },
          { header: "المجموعة", key: "group_name", width: 18 },
          { header: "هاتف الطالب", key: "phone", width: 22 },
          { header: "هاتف ولي الأمر", key: "parent_phone", width: 22 },
        ],
        studentList.map((s, idx) => ({
          ...s,
          index: idx + 1,
        })),
      );
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  // Excel Export
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const result = await fetchAllStudents(
        1,
        searchQuery,
        selectedGrade,
        selectedGroup,
        "all",
      );
      const studentList =
        result.success && Array.isArray(result.data) && result.data.length > 0
          ? result.data
          : students;

      if (!studentList || studentList.length === 0) return;

      const headers = [
        "م",
        "اسم الطالب",
        "الباركود",
        "الصف",
        "المجموعة",
        "هاتف الطالب",
        "هاتف ولي الأمر",
      ];

      const rows = studentList.map((s, idx) => [
        idx + 1,
        s.full_name || "",
        s.barcode || "",
        s.grade_name || "",
        s.group_name || "",
        s.phone || "",
        s.parent_phone || "",
      ]);

      const gradeLabel = selectedGrade
        ? grades.find((g) => String(g.id) === String(selectedGrade))?.name
        : "";
      const groupLabel = selectedGroup
        ? groups.find((g) => String(g.id) === String(selectedGroup))?.name
        : "";
      const filterDesc = [gradeLabel, groupLabel].filter(Boolean).join("_");
      const filename = `كشف_الطلاب_${filterDesc ? `${filterDesc.replace(/\s+/g, "_")}_` : ""}${new Date().toISOString().slice(0, 10)}.xlsx`;

      exportAoaExcel(filename, "الطلاب", [headers, ...rows]);
    } catch (err) {
      console.error("Excel export error:", err);
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen pb-10"
      dir="rtl"
    >
      {/* ==================== HEADER ==================== */}
      <motion.header
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                الطلاب
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                إدارة بيانات الطلاب والبحث السريع والمتابعة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportPDF}
              disabled={exportingPdf}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-xs disabled:opacity-50"
              title="تصدير كشف PDF للطلاب"
            >
              {exportingPdf ? (
                <Loader2 size={14} className="animate-spin text-gray-500" />
              ) : (
                <FileText size={15} className="text-gray-600" />
              )}
              <span>{exportingPdf ? "جاري التجهيز..." : "كشف PDF"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportExcel}
              disabled={exportingExcel}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-xs disabled:opacity-50"
              title="تصدير كشف Excel للطلاب"
            >
              {exportingExcel ? (
                <Loader2 size={14} className="animate-spin text-gray-500" />
              ) : (
                <FileText size={15} className="text-gray-600" />
              )}
              <span>{exportingExcel ? "جاري التجهيز..." : "كشف Excel"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-all shadow-sm disabled:opacity-60"
              title="تحديث البيانات"
            >
              <RotateCcw
                size={14}
                className={refreshing ? "animate-spin text-primary" : ""}
              />
            </motion.button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mt-4 grid grid-cols-3 gap-2 sm:gap-3"
        >
          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">إجمالي الطلاب</span>
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                {totalStudents}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl shrink-0">
              <GraduationCap size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">المراحل</span>
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                {grades.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">المجموعات</span>
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                {groups.length}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* ==================== FILTERS & SEARCH ==================== */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 mb-4"
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedGroup("");
                setPage(1);
              }}
              className="border-2 border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700 font-medium min-w-36"
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
              className="border-2 border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700 font-medium min-w-36 disabled:opacity-50"
              disabled={!selectedGrade && filteredGroups.length === 0}
            >
              <option value="">كل المجموعات</option>
              {filteredGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>

            {(selectedGrade || selectedGroup || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1 transition"
              >
                إلغاء الفلترة
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 flex-1 lg:max-w-md focus-within:border-primary/50 transition-colors">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="بحث بالاسم أو الباركود أو رقم الهاتف..."
              className="bg-transparent focus:outline-none text-xs sm:text-sm w-full font-normal"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ==================== STUDENTS TABLE ==================== */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
      >
        {/* Table Title Bar */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h2 className="text-sm sm:text-base font-bold text-gray-800">
              قائمة الطلاب
            </h2>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {totalStudents} طالب
          </span>
        </div>

        {/* Responsive Table Body */}
        <ResponsiveTable
          minWidth={850}
          maxHeight="max-h-[65vh]"
          className="border-t border-gray-100"
        >
          <table className="w-full min-w-full text-right">
            <thead className="bg-linear-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
              <tr>
                <th className="pr-4 py-3 text-xs font-semibold text-gray-600 w-36">
                  الباركود
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-600">
                  الصف
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-600">
                  المجموعة
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-600">
                  الهاتف
                </th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-600">
                  ولي الأمر
                </th>
                <th className="pl-4 py-3 text-xs font-semibold text-gray-600 text-left">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={32} className="animate-spin text-primary" />
                      <span className="text-xs sm:text-sm text-gray-500 font-medium">
                        جاري تحميل الطلاب...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3.5 bg-gray-100 rounded-full">
                        <Users size={36} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-700">لا يوجد طلاب مطابقين</p>
                      <p className="text-xs text-gray-400">
                        جرب تعديل كلمات البحث أو إلغاء فلاتر الصف والمجموعة
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.015, 0.2) }}
                    onClick={() => navigate(`/teacher/students/${student.id}`)}
                    className="hover:bg-blue-50/40 transition-all duration-200 group cursor-pointer"
                  >
                    {/* Barcode */}
                    <td className="pr-4 py-3">
                      <span
                        dir="ltr"
                        className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-mono text-gray-600 group-hover:bg-blue-100 transition-colors"
                      >
                        <Barcode size={11} className="text-gray-400" />
                        {student.barcode || "-"}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {student.full_name?.charAt(0) || "ط"}
                        </div>
                        <span className="font-medium text-sm text-gray-800 truncate max-w-44 group-hover:text-primary transition-colors">
                          {student.full_name}
                        </span>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3 px-3">
                      <span className="inline-block bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
                        {student.grade_name || "-"}
                      </span>
                    </td>

                    {/* Group */}
                    <td className="py-3 px-3">
                      <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
                        {student.group_name || "-"}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3">
                      <span
                        dir="ltr"
                        className="inline-flex items-center gap-1 text-xs text-gray-600 font-medium whitespace-nowrap"
                      >
                        <Phone size={11} className="text-gray-400" />
                        {student.phone || "-"}
                      </span>
                    </td>

                    {/* Parent Phone */}
                    <td className="py-3 px-3">
                      <span
                        dir="ltr"
                        className="inline-flex items-center gap-1 text-xs text-gray-600 font-medium whitespace-nowrap"
                      >
                        <Phone size={11} className="text-gray-400" />
                        {student.parent_phone || "-"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="pl-4 py-3 text-left">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickView(student);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض سريع"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={totalStudents}
          limit={PAGE_SIZE}
          onChange={(newPage) => setPage(newPage)}
        />
      </motion.div>

      {/* ==================== QUICK PREVIEW MODAL ==================== */}
      <AnimatePresence>
        {previewStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setPreviewStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0 overflow-hidden border border-primary/20">
                    {previewStudent.profile_image && !imgError ? (
                      <img
                        src={getImageUrl(previewStudent.profile_image)}
                        alt={previewStudent.full_name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      previewStudent.full_name?.charAt(0) || "ط"
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">
                      {previewStudent.full_name}
                    </h3>
                    <span className="text-xs font-mono text-gray-500 block" dir="ltr">
                      {previewStudent.barcode}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewStudent(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {previewLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={28} className="animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block mb-0.5">الصف</span>
                        <span className="font-bold text-gray-800">
                          {previewStudent.grade_name || "-"}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block mb-0.5">المجموعة</span>
                        <span className="font-bold text-gray-800">
                          {previewStudent.group_name || "-"}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block mb-0.5">هاتف الطالب</span>
                        <span className="font-bold text-gray-800" dir="ltr">
                          {previewStudent.phone || "-"}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block mb-0.5">هاتف ولي الأمر</span>
                        <span className="font-bold text-gray-800" dir="ltr">
                          {previewStudent.parent_phone || "-"}
                        </span>
                      </div>
                    </div>

                    {previewStudent.stats && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-green-50 p-2.5 rounded-xl border border-green-100 text-center">
                          <CalendarCheck2 size={16} className="text-green-600 mx-auto mb-1" />
                          <span className="font-bold text-base text-green-700 block">
                            {previewStudent.stats.attendance_percentage ?? 0}%
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">نسبة الحضور</span>
                        </div>
                        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-center">
                          <BarChart3 size={16} className="text-blue-600 mx-auto mb-1" />
                          <span className="font-bold text-base text-blue-700 block">
                            {previewStudent.stats.avg_paper_degree ?? 0}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">متوسط الامتحانات</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const sid = previewStudent.id;
                        setPreviewStudent(null);
                        navigate(`/teacher/students/${sid}`);
                      }}
                      className="w-full py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={15} />
                      <span>عرض الملف الشخصي الكامل للطالب</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Students;
