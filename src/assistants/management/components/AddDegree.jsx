/* eslint-disable no-unused-vars */
import { memo, useCallback, useMemo, useState, useEffect } from "react";
import {
  ArrowRight,
  Save,
  BookOpen,
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Download,
  Upload,
  X,
  School,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchExamResults,
  upsertExamResultAction,
  fetchExamResultStats,
  fetchAllStudents,
} from "../../../api/assistant/actions";
import {
  pickExcelFile,
  exportPdfTable,
  exportAoaExcel,
} from "../../../utils/office.js";
import { LoadingState } from "../components/Spinner";
import { toast } from "sonner";

const PAGE_SIZE = 50;

const DegreeRow = memo(function DegreeRow({
  student,
  index,
  rowNumber,
  value,
  status,
  maxScore,
  isSaving,
  onChange,
}) {
  const isPassing = status === "pass";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className={`hover:bg-green-50/40 transition-all duration-200 group ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
      } ${isPassing ? "border-r-4 border-r-green-400" : ""}`}
    >
      <td className="text-right pr-6 py-4 text-sm text-gray-400">
        {rowNumber}
      </td>
      <td className="text-right py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            {(student.full_name || "").charAt(0)}
          </div>
          <span className="font-medium text-gray-800">{student.full_name}</span>
        </div>
      </td>
      <td className="text-right py-4">
        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {student.barcode || "-"}
        </span>
      </td>
      <td className="text-right py-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max={maxScore}
            value={
              value !== undefined && value !== null && value !== "" ? value : ""
            }
            onChange={(e) => onChange(student.id, e.target.value)}
            placeholder="الدرجة"
            disabled={isSaving}
            className={`w-28 rounded-xl border-2 px-4 py-2 text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
              isPassing
                ? "border-green-300 bg-green-50 text-green-700"
                : status === "fail"
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-gray-200 bg-gray-50 text-gray-700"
            } disabled:opacity-60`}
          />
          <span className="text-xs text-gray-400">/ {maxScore}</span>
        </div>
      </td>
      <td className="text-right pr-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            isPassing
              ? "bg-green-100 text-green-700"
              : status === "fail"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {isPassing ? "ناجح" : status === "fail" ? "راسب" : "غير مدخل"}
        </span>
      </td>
    </motion.tr>
  );
});

const AddDegree = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exam = location.state?.exam;

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [existingResults, setExistingResults] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!exam) {
      navigate("/assistant/management/exams");
    }
  }, [exam, navigate]);

  const maxScore = Number(exam?.total_degree) || 0;

  useEffect(() => {
    async function loadData() {
      if (!exam) return;

      setLoading(true);
      try {
        const [studentsResult, resultsResult, statsResult] = await Promise.all([
          fetchAllStudents(1, "", exam.grade_id, exam.group_id || ""),
          fetchExamResults(exam.id),
          fetchExamResultStats(exam.id),
        ]);

        if (studentsResult.success) {
          const data = Array.isArray(studentsResult.data)
            ? studentsResult.data
            : [];
          setStudents(data);
        }

        if (resultsResult.success) {
          const data = Array.isArray(resultsResult.data)
            ? resultsResult.data
            : [];
          const resultsMap = {};
          data.forEach((item) => {
            resultsMap[item.student_id] = item.degree;
          });
          setExistingResults(resultsMap);
          setResults(resultsMap);
        }

        if (statsResult.success) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [exam]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter(
      (s) =>
        String(s.full_name || "")
          .toLowerCase()
          .includes(term) ||
        String(s.barcode || "")
          .toLowerCase()
          .includes(term),
    );
  }, [students, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pagedStudents = useMemo(
    () =>
      filteredStudents.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredStudents, currentPage],
  );

  const totalStudents = students.length;
  const enteredCount = useMemo(
    () =>
      Object.values(results).filter(
        (v) => v !== "" && v !== null && v !== undefined && v !== "",
      ).length,
    [results],
  );

  const getStudentStatus = useCallback(
    (studentId) => {
      const score = results[studentId];
      if (score === undefined || score === null || score === "" || score === "")
        return "pending";
      if (maxScore > 0 && Number(score) >= maxScore * 0.5) return "pass";
      return "fail";
    },
    [results, maxScore],
  );

  const passedCount = useMemo(
    () => students.filter((s) => getStudentStatus(s.id) === "pass").length,
    [students, getStudentStatus],
  );

  const handleDegreeChange = useCallback((studentId, value) => {
    setResults((prev) => ({ ...prev, [studentId]: value }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const changedStudents = students.filter((s) => {
        const newValue = results[s.id];
        const oldValue = existingResults[s.id];
        return (
          newValue !== undefined &&
          newValue !== null &&
          newValue !== "" &&
          String(newValue) !== String(oldValue)
        );
      });

      if (changedStudents.length === 0) {
        toast.info("لا توجد تغييرات لحفظها");
        setIsSaving(false);
        return;
      }

      let successCount = 0;
      for (const student of changedStudents) {
        const degree = Number(results[student.id]);

        try {
          const result = await upsertExamResultAction({
            exam_id: exam.id,
            student_id: student.id,
            degree: degree,
            notes: "",
          });

          if (result.success) {
            successCount++;
            setExistingResults((prev) => ({
              ...prev,
              [student.id]: degree,
            }));
          }
        } catch (error) {
          console.error(
            `Error saving degree for student ${student.id}:`,
            error,
          );
        }
      }

      if (successCount > 0) {
        toast.success(`تم حفظ ${successCount} درجة بنجاح!`);
        const statsResult = await fetchExamResultStats(exam.id);
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      } else {
        toast.error("حدث خطأ في حفظ الدرجات");
      }
    } catch (error) {
      console.error("Error saving degrees:", error);
      toast.error("حدث خطأ في حفظ الدرجات");
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    navigate("/assistant/management/exams");
  };

  const handleDownloadTemplate = () => {
    const headers = ["الدرجة", "الباركود", "اسم الطالب"];
    const rows = students.map((s) => [results[s.id], s.barcode, s.full_name]);
    const filename = `درجات_${String(exam?.title || "الامتحان").replace(/[\\/:*?"<>|]/g, "")}.xlsx`;
    exportAoaExcel(filename, "Degrees", [headers, ...rows]);
  };

  const handleImportExcel = async () => {
    try {
      const rows = await pickExcelFile();
      if (!rows) return;
      if (!rows.length) return toast.error("الملف فارغ");

      setImporting(true);

      const norm = (v) => String(v ?? "").trim();
      const byBarcode = new Map(students.map((s) => [norm(s.barcode), s]));
      const byName = new Map(students.map((s) => [norm(s.full_name), s]));

      const next = {};
      let ok = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const line = i + 2;

        const barcode = norm(r["الباركود"]);
        const name = norm(r["اسم الطالب"]);
        const raw = norm(r["الدرجة"]);

        const student = byBarcode.get(barcode) || byName.get(name);
        if (!student) {
          errors.push(`صف ${line}: الطالب غير موجود (${barcode || name})`);
          continue;
        }
        if (raw === "") continue;

        const degree = Number(raw);
        if (Number.isNaN(degree) || degree < 0) {
          errors.push(`صف ${line}: درجة غير صحيحة`);
          continue;
        }
        if (maxScore > 0 && degree > maxScore) {
          errors.push(`صف ${line}: الدرجة أكبر من الدرجة الكلية (${maxScore})`);
          continue;
        }

        next[student.id] = degree;
        ok++;
      }

      if (ok) {
        setResults((prev) => ({ ...prev, ...next }));
        toast.success(`تم تحميل ${ok} درجة — اضغط "حفظ الدرجات" للحفظ`);
      } else {
        toast.error("لم يتم تحميل أي درجة");
      }

      if (errors.length) {
        toast.error(`تم تجاهل ${errors.length} صف`);
        console.warn("Excel import errors:", errors);
      }
    } catch (e) {
      toast.error(e?.message || "حدث خطأ أثناء رفع الملف");
    } finally {
      setImporting(false);
    }
  };

  const handleExportPdf = () => {
    const columns = [
      { header: "اسم الطالب", key: "full_name" },
      { header: "الباركود", key: "barcode" },
      { header: "الدرجة", key: "degree" },
      { header: "الدرجة الكلية", key: "total_degree" },
    ];

    const pdfRows = students.map((s) => ({
      full_name: s.full_name,
      barcode: s.barcode,
      degree: results[s.id] == null ? "-" : results[s.id],
      total_degree: maxScore,
    }));

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const fileName = `كشف_درجات_${String(exam?.title)}_${dateStr}.pdf`;

    exportPdfTable(fileName, "كشف الدرجات", columns, pdfRows);
  };

  if (loading) {
    return <LoadingState label="جاري تحميل بيانات الامتحان..." />;
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">لم يتم العثور على الامتحان</p>
          <button
            onClick={goBack}
            className="mt-4 text-primary hover:underline"
          >
            العودة للامتحانات
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              title="رجوع"
            >
              <ArrowRight size={20} className="text-gray-600" />
            </button>
            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {exam.title}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <School size={14} />
                  {exam.grade_name || "-"}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>الدرجة الكلية: {maxScore}</span>
                {exam.group_name && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {exam.group_name}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-60"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "جاري الحفظ..." : "حفظ الدرجات"}
          </motion.button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "عدد الطلاب",
              value: totalStudents,
              icon: Users,
              color: "green",
            },
            {
              label: "درجات مُدخلة",
              value: enteredCount,
              icon: CheckCircle,
              color: "green",
            },
            { label: "ناجح", value: passedCount, icon: Award, color: "amber" },
            {
              label: "بدون درجة",
              value: Math.max(0, totalStudents - enteredCount),
              icon: AlertCircle,
              color: "red",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon size={16} className={`text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {stats && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">متوسط الدرجات</p>
              <p className="text-lg font-bold text-blue-700">
                {stats.average_degree || 0}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">أعلى درجة</p>
              <p className="text-lg font-bold text-green-700">
                {stats.highest_degree || 0}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">أقل درجة</p>
              <p className="text-lg font-bold text-red-700">
                {stats.lowest_degree || 0}
              </p>
            </div>
          </div>
        )}
      </motion.header>

      {/* Search & Actions */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-3"
      >
        <div className="relative flex-1 min-w-60">
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الباركود..."
            className="w-full border-2 border-gray-200 rounded-xl pr-10 pl-9 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="مسح البحث"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          <Download size={16} /> قالب Excel
        </button>
        <button
          onClick={handleImportExcel}
          disabled={importing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60"
        >
          <Upload size={16} /> {importing ? "جاري الرفع..." : "رفع Excel"}
        </button>
        <button
          onClick={handleExportPdf}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          <FileText size={16} /> كشف Pdf
        </button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <div className="max-h-140 overflow-x-auto overflow-y-auto custom-scrollbar">
          {students.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Users size={48} className="text-gray-300" />
                <p className="text-gray-400 font-medium">
                  لا يوجد طلاب في هذه المجموعة
                </p>
                <p className="text-sm text-gray-300">
                  تأكد من اختيار المجموعة الصحيحة
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-175">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                <tr>
                  <th className="text-right pr-6 py-4 w-[8%] text-gray-600 font-semibold text-sm">
                    #
                  </th>
                  <th className="text-right py-4 w-[32%] text-gray-600 font-semibold text-sm">
                    اسم الطالب
                  </th>
                  <th className="text-right py-4 w-[20%] text-gray-600 font-semibold text-sm">
                    الباركود
                  </th>
                  <th className="text-right py-4 w-[25%] text-gray-600 font-semibold text-sm">
                    الدرجة
                  </th>
                  <th className="text-right pr-6 py-4 w-[15%] text-gray-600 font-semibold text-sm">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedStudents.map((student, index) => (
                  <DegreeRow
                    key={student.id}
                    student={student}
                    index={index}
                    rowNumber={(currentPage - 1) * PAGE_SIZE + index + 1}
                    value={results[student.id]}
                    status={getStudentStatus(student.id)}
                    maxScore={maxScore}
                    isSaving={isSaving}
                    onChange={handleDegreeChange}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredStudents.length > PAGE_SIZE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-sm">
            <span className="text-gray-600">
              عرض {(currentPage - 1) * PAGE_SIZE + 1}
              {" - "}
              {Math.min(currentPage * PAGE_SIZE, filteredStudents.length)}
              {" من "}
              {filteredStudents.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
                title="السابق"
              >
                <ChevronRight size={16} />
              </button>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
                title="التالي"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.section>
  );
};

export default AddDegree;
