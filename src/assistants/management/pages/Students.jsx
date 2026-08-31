import { RotateCcw, Download, Eye, FileText, Printer, Search, SquarePen, Trash2, Upload, UserPlus, GraduationCap, Phone, Users, Barcode, X, Filter, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddStudentDialog from "../components/AddStudentDialog.jsx";
import StudentCard from "../components/StudentCard.jsx";
import { memo, useMemo, useState, useEffect } from "react";
import { useApiQuery, useApiList, useApiMutation, useInvalidate } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import { notifyError, notifySuccess, confirmToast, toast } from "../../../lib/notify";
import { SkeletonRows } from "../components/Spinner";
import { printBarcodeWindow } from "../../../utils/barcode.js"
import { downloadExcelTemplate, pickExcelFile, exportPdfTable } from "../../../utils/office.js"
import {
    fetchAllStudents,
    createNewStudent,
    updateStudentInfo,
    removeStudent,
    restoreStudent,
    permanentlyRemoveStudent,
    searchStudentByBarcode,
    fetchStudentProfile,
    fetchStudentStats,
    fetchAllGrades,
    fetchAllGroups
} from "../../../api/assistant/actions";

const PAGE_SIZE = 20;

const emptyStudent = {
    id: "",
    barcode: "",
    full_name: "",
    phone: "",
    parent_phone: "",
    grade_id: "",
    group_id: "",
    notes: ""
};

const StudentRow = memo(function StudentRow({ student, index, onView, onEdit, onRemove, onPrint }) {
    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.02, 0.3) }}
            className="hover:bg-blue-50/40 transition-all duration-200 group"
        >
            <td className="text-right pr-6 py-4">
                <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono text-gray-600 group-hover:bg-blue-100 transition-colors">
                    <Barcode size={12} className="text-gray-400" />
                    {student.barcode || '-'}
                </span>
            </td>
            <td className="text-right py-4 font-medium text-gray-800">{student.full_name}</td>
            <td className="text-right py-4">
                <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm">
                    {student.grade_name || '-'}
                </span>
            </td>
            <td className="text-right py-4">
                <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm">
                    {student.group_name || '-'}
                </span>
            </td>
            <td className="text-right py-4">
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    {student.phone || '-'}
                </span>
            </td>
            <td className="text-right pr-6 py-4 text-sm text-gray-600">{student.parent_phone || '-'}</td>
            <td className="text-right pr-6 py-4">
                <div className="flex items-center gap-1.5">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onView(student)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                        title="عرض البيانات">
                        <Eye size={18} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(student)}
                        className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-xl transition-all duration-200 hover:shadow-md"
                        title="تعديل">
                        <SquarePen size={18} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onRemove(student.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                        title="حذف">
                        <Trash2 size={18} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onPrint(student)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all duration-200 hover:shadow-md"
                        title="طباعة الباركود">
                        <Printer size={18} />
                    </motion.button>
                </div>
            </td>
        </motion.tr>
    );
});

const Students = () => {
    const [modal, setModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [student, setStudent] = useState(emptyStudent);

    const [viewing, setViewing] = useState(null);
    const [viewingStats, setViewingStats] = useState(null);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [barcodeTerm, setBarcodeTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    const [page, setPage] = useState(1);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });


    /* debounce للبحث: مفيش request مع كل حرف */
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const invalidate = useInvalidate();

    /* الصفوف والمجموعات بتتحمل مرة واحدة وتتخزن في الكاش لكل الصفحات */
    const gradesQuery = useApiList(qk.grades.all, fetchAllGrades, {
        select: (data) => (Array.isArray(data) ? data : []).filter((item) => item?.name && item.name.trim() !== ""),
        showErrorToast: false,
    });
    const groupsQuery = useApiList(qk.groups.all, fetchAllGroups, {
        select: (data) => (Array.isArray(data) ? data : []).filter((item) => item?.deleted === 0 || item?.deleted === undefined),
        showErrorToast: false,
    });

    const studentsQuery = useApiQuery(
        qk.students.list(page, search, selectedGrade, selectedGroup),
        () => fetchAllStudents(page, search, selectedGrade, selectedGroup),
        {
            fallback: [],
            select: (data) => (Array.isArray(data) ? data : []),
            errorMessage: "حدث خطأ في تحميل الطلاب",
            enabled: !barcodeTerm,
        },
    );

    /* بحث بالباركود — query منفصل يشتغل بس لما المستخدم يطلبه */
    const barcodeQuery = useApiQuery(
        ["students", "barcode", barcodeTerm],
        () => searchStudentByBarcode(barcodeTerm),
        { enabled: !!barcodeTerm, errorMessage: "حدث خطأ في البحث" },
    );

    const grades = gradesQuery.data ?? [];
    const groups = groupsQuery.data ?? [];

    const students = useMemo(() => {
        let data = [];
        if (barcodeTerm) {
            const found = barcodeQuery.data;
            data = found && found.id ? [found] : [];
        } else {
            data = studentsQuery.data ?? [];
        }
        return [...data].sort((a, b) => {
            const aNum = Number(a?.barcode) || 0;
            const bNum = Number(b?.barcode) || 0;
            return aNum - bNum;
        });
    }, [barcodeTerm, barcodeQuery.data, studentsQuery.data]);

    const tableLoading = barcodeTerm
        ? barcodeQuery.isLoading || barcodeQuery.isFetching
        : studentsQuery.isLoading || studentsQuery.isFetching;
    const refreshing = studentsQuery.isFetching && !studentsQuery.isLoading;

    const total = barcodeTerm ? students.length : (studentsQuery.pagination?.total ?? students.length);
    const totalPages = barcodeTerm ? 1 : (studentsQuery.pagination?.totalPages ?? 1);

    const refreshStudents = () => invalidate(["students"]);

    const saveMutation = useApiMutation(
        ({ id, payload }) => (id ? updateStudentInfo(id, payload) : createNewStudent(payload)),
        {
            invalidateKeys: [["students"], qk.assistant.dashboard],
            errorMessage: "حدث خطأ في حفظ البيانات",
            onSuccess: (_data, variables) => {
                notifySuccess(variables.id ? "تم تحديث الطالب بنجاح" : "تم إضافة الطالب بنجاح");
                closeDialog();
            },
        },
    );

    const deleteMutation = useApiMutation((id) => removeStudent(id), {
        invalidateKeys: [["students"], qk.assistant.dashboard],
        successMessage: "تم حذف الطالب بنجاح",
        errorMessage: "حدث خطأ في حذف الطالب",
    });

    function saveStudent() {
        if (!student.full_name || student.full_name.trim() === "") return notifyError("يرجى إدخال اسم الطالب");
        if (!student.barcode || student.barcode.trim() === "") return notifyError("يرجى إدخال الباركود");
        if (!student.grade_id) return notifyError("يرجى اختيار المرحلة الدراسية");
        if (!student.group_id) return notifyError("يرجى اختيار المجموعة");

        const payload = {
            barcode: student.barcode.trim(),
            full_name: student.full_name.trim(),
            phone: student.phone || "",
            parent_phone: student.parent_phone || "",
            grade_id: Number(student.grade_id),
            group_id: Number(student.group_id),
            notes: student.notes || "",
        };

        saveMutation.mutate({ id: isEditing && student.id ? student.id : null, payload });
    }

    function removeStudentById(id) {
        if (!id) return;
        confirmToast("هل أنت متأكد من حذف هذا الطالب؟", () => deleteMutation.mutate(id), "حذف");
    }

    function searchByBarcode() {
        const term = searchInput.trim();
        if (!term) {
            setBarcodeTerm("");
            return;
        }
        setBarcodeTerm(term);
    }

    async function viewStudent(studentData) {
        try {
            const [profileResult, statsResult] = await Promise.all([
                fetchStudentProfile(studentData.id),
                fetchStudentStats(studentData.id)
            ]);

            const profile = profileResult.success ? profileResult.data : studentData;
            const stats = statsResult.success ? statsResult.data : null;

            setViewing(profile);
            setViewingStats(stats);
        } catch (error) {
            console.error("Error viewing student:", error);
            notifyError(error, "تعذر تحميل بيانات الطالب");
            setViewing(studentData);
            setViewingStats(null);
        }
    }

    function openNew() {
        setStudent(emptyStudent);
        setIsEditing(false);
        setModal(true);
    }

    function openEdit(studentData) {
        setStudent({
            id: studentData.id,
            barcode: studentData.barcode || "",
            full_name: studentData.full_name || "",
            phone: studentData.phone || "",
            parent_phone: studentData.parent_phone || "",
            grade_id: studentData.grade_id || "",
            group_id: studentData.group_id || "",
            notes: studentData.notes || ""
        });
        setIsEditing(true);
        setModal(true);
    }

    function closeDialog() {
        setModal(false);
        setIsEditing(false);
        setStudent(emptyStudent);
    }

    function refreshPage() {
        setSearchInput("");
        setSearch("");
        setBarcodeTerm("");
        setSelectedGrade("");
        setSelectedGroup("");
        setPage(1);
        refreshStudents();
    }

    const groupsForSelectedGrade = useMemo(() => {
        if (!selectedGrade) return groups;
        return groups.filter(g => String(g.grade_id) === String(selectedGrade));
    }, [groups, selectedGrade]);

    const stats = useMemo(() => ({
        total: students.length,
        grades: grades.length,
        groups: groups.length,
    }), [students, grades, groups]);

    const firstRowNumber = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const lastRowNumber = Math.min((page - 1) * PAGE_SIZE + students.length, total);

    const handlePrint = (student) => {
        const studentForPrint = {
            full_name: student.full_name,
            barcode: student.barcode
        };

        printBarcodeWindow(studentForPrint, "سنتر بشتة")
    };
    const handleDownloadTemplate = () => {
        const headers = ['ملاحظات', 'المجموعة', 'المرحلة الدراسية', 'رقم ولي الامر', 'رقم الجوال', 'الباركود', 'الاسم الكامل'];
        const sampleRow = ['ليس لدي ملاحظات لهذا الطالب', 'بكالوريا', 'الاول الثانوي', '01000000000', '01000000000', '1', 'مثال: عبدالله رافت'];
        downloadExcelTemplate('قالب_الطلاب.xlsx', headers, sampleRow);
    };
    const handleImportExcel = async () => {
        try {
            const rows = await pickExcelFile();
            if (!rows) return;
            if (!rows.length) return notifyError("الملف فارغ");

            setImporting(true);

            const norm = (v) => String(v ?? "").trim();
            const findId = (list, name) => {
                const n = norm(name);
                if (!n) return null;
                const found = list.find((item) => norm(item.name) === n);
                return found ? found.id : null;
            };

            let ok = 0;
            const errors = [];
            setProgress({ done: 0, total: rows.length });

            for (let i = 0; i < rows.length; i++) {
                const r = rows[i];
                const line = i + 2;
                setProgress({ done: i, total: rows.length });


                const full_name = norm(r["الاسم الكامل"]);
                const barcode = norm(r["الباركود"]);
                const gradeName = norm(r["المرحلة الدراسية"]);
                const groupName = norm(r["المجموعة"]);

                if (!full_name || !barcode) {
                    errors.push(`صف ${line}: الاسم أو الباركود ناقص`);
                    continue;
                }

                const grade_id = findId(grades, gradeName);
                if (!grade_id) {
                    errors.push(`صف ${line}: المرحلة "${gradeName}" غير موجودة`);
                    continue;
                }

                const group_id = findId(
                    groups.filter((g) => String(g.grade_id) === String(grade_id)),
                    groupName
                );
                if (!group_id) {
                    errors.push(`صف ${line}: المجموعة "${groupName}" غير موجودة`);
                    continue;
                }

                const payload = {
                    barcode,
                    full_name,
                    phone: norm(r["رقم الجوال"]),
                    parent_phone: norm(r["رقم ولي الامر"]),
                    grade_id: Number(grade_id),
                    group_id: Number(group_id),
                    notes: norm(r["ملاحظات"]),
                };

                try {
                    const res = await createNewStudent(payload);
                    if (res && res.success === false) throw new Error(res.message || "فشل الحفظ");
                    ok++;
                } catch (err) {
                    errors.push(`صف ${line}: ${err?.message || "فشل الحفظ"}`);
                }
            }

            setProgress({ done: rows.length, total: rows.length });

            refreshStudents();
            invalidate(qk.assistant.dashboard);

            if (ok) notifySuccess(`تم استيراد ${ok} طالب بنجاح`);
            if (errors.length) {
                console.warn("Excel import errors:", errors);
                notifyError(`فشل استيراد ${errors.length} صف: ${errors.slice(0, 3).join(" | ")}`);
            }
        } catch (error) {
            console.error("Import excel error:", error);
            notifyError(error, "تعذر قراءة ملف الإكسل");
        } finally {
            setImporting(false);
            setProgress({ done: 0, total: 0 });
        }
    };

    const handleExportPdf = () => {
        if (!students.length) {
            toast.error('لا يوجد طلاب لتصديرهم');
            return;
        }

        const columns = [
            { header: 'الاسم الكامل', key: 'full_name' },
            { header: 'الباركود', key: 'barcode' },
            { header: 'رقم الجوال', key: 'phone' },
            { header: 'رقم ولي الامر', key: 'parent_phone' },
            { header: 'المرحلة الدراسية', key: 'grade_name' },
            { header: 'المجموعة', key: 'group_name' },
        ];

        const pdfRows = students.map(s => ({
            full_name: s.full_name,
            barcode: s.barcode,
            phone: s.phone === "" ? "-" : s.phone,
            parent_phone: s.parent_phone === "" ? "-" : s.parent_phone,
            grade_name: s.grade_name,
            group_name: s.group_name
        }))

        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const fileName = `كشف_الطلاب_${dateStr}.pdf`;

        exportPdfTable(
            fileName,
            'كشف الطلاب',
            columns,
            pdfRows
        );
    };

    return (
        <>
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen"
            >
                {/* Header */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mb-5 relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl p-3 sm:p-6"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-primary to-green-700 rounded-2xl shadow-lg shadow-primary/30">
                                    <GraduationCap size={28} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        الطلاب
                                    </h1>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        إدارة بيانات الطلاب والبحث السريع
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                <Download size={16} /> قالب Excel
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleImportExcel} disabled={importing}
                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                <Upload size={16} /> {importing ? `جاري الرفع... ${progress.total ? `${progress.done}/${progress.total}` : ""}` : "رفع Excel"}
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportPdf}
                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                <FileText size={16} /> كشف Pdf
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={refreshPage} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60">
                                <RotateCcw size={16} className={refreshing ? "animate-spin" : ""} /> تحديث الصفحة
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                                onClick={openNew}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                                <UserPlus size={16} /> إضافة طالب
                            </motion.button>
                        </div>
                    </div>

                    {importing && progress.total > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>جاري رفع الطلاب...</span>
                                <span>{progress.done} / {progress.total} ({Math.round((progress.done / progress.total) * 100)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-200"
                                    style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}


                    {/* Stats */}
                    <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'إجمالي الطلاب', value: stats.total, icon: Users, color: 'green' },
                            { label: 'المراحل', value: stats.grades, icon: GraduationCap, color: 'amber' },
                            { label: 'المجموعات', value: stats.groups, icon: Users, color: 'blue' },
                        ].map((stat, idx) => (
                            <motion.div key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100">
                                <div className={`p-2.5 rounded-xl bg-${stat.color}-100`}>
                                    <stat.icon size={20} className={`text-${stat.color}-600`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.header>

                {/* Filters */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl p-3 sm:p-5"
                >
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                <Filter size={16} className="text-gray-400" />
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => {
                                        setSelectedGrade(e.target.value);
                                        setSelectedGroup("");
                                        setPage(1);
                                    }}
                                    className="bg-transparent focus:outline-none text-sm min-w-[120px]"
                                >
                                    <option value="">كل الصفوف</option>
                                    {grades.map(grade => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                <Users size={16} className="text-gray-400" />
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => { setSelectedGroup(e.target.value); setPage(1); }}
                                    className="bg-transparent focus:outline-none text-sm min-w-[120px]"
                                >
                                    <option value="">كل المجموعات</option>
                                    {groupsForSelectedGrade.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 sm:min-w-[250px]">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => { setSearchInput(e.target.value); setBarcodeTerm(""); }}
                                onKeyDown={(e) => { if (e.key === "Enter") searchByBarcode(); }}
                                placeholder="بحث بالاسم أو الباركود..."
                                className="bg-transparent focus:outline-none text-sm w-full"
                            />
                            {searchInput && (
                                <button onClick={() => { setSearchInput(''); setSearch(''); setBarcodeTerm(''); }} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                            <button onClick={searchByBarcode} className="text-primary hover:text-primary/80">
                                <Search size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {viewing && <StudentCard student={viewing} stats={viewingStats} onClose={() => { setViewing(null); setViewingStats(null); }} />}

                {/* Table */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden"
                >
                    <div className="px-3 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Users size={20} className="text-primary" />
                            <h2 className="text-lg font-bold text-gray-800">قائمة الطلاب</h2>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {total} طالب
                        </span>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                                <tr>
                                    {['الباركود ↓', 'الاسم', 'الصف', 'المجموعة', 'الهاتف', 'ولي الأمر', 'الإجراءات'].map((header, idx) => (
                                        <th key={idx} className={`text-right py-4 ${idx === 0 ? 'pr-6' : ''} ${idx === 6 ? 'pr-6' : ''} text-sm font-semibold text-gray-600`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence>
                                    {tableLoading ? (
                                        <tr>
                                            <td colSpan={7} className="py-6">
                                                <SkeletonRows rows={6} />
                                            </td>
                                        </tr>
                                    ) : students.length === 0 ? (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <td colSpan={7} className="text-center py-16">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Users size={48} className="text-gray-300" />
                                                    <p className="text-gray-400 font-medium">لا يوجد طلاب</p>
                                                    <p className="text-sm text-gray-300">قم بإضافة طالب جديد</p>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        students.map((item, index) => (
                                            <StudentRow
                                                key={item.id || index}
                                                student={item}
                                                index={index}
                                                onView={viewStudent}
                                                onEdit={openEdit}
                                                onRemove={removeStudentById}
                                                onPrint={handlePrint}
                                            />
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-sm">
                            <span className="text-gray-600">
                                عرض {firstRowNumber} - {lastRowNumber} من {total}
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || tableLoading}
                                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="السابق"
                                >
                                    <ChevronRight size={16} />
                                </button>

                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum = page;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }

                                    if (pageNum > 0 && pageNum <= totalPages) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                disabled={tableLoading}
                                                className={`px-3 py-1 rounded-lg border font-medium transition-colors ${pageNum === page
                                                    ? "bg-primary text-white border-primary"
                                                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages || tableLoading}
                                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="التالي"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.section>

            {modal && (
                <AddStudentDialog
                    grades={grades}
                    groups={groups}
                    student={student}
                    setStudent={setStudent}
                    isEditing={isEditing}
                    onSave={saveStudent}
                    onClose={closeDialog}
                />
            )}
        </>
    );
};

export default Students;
