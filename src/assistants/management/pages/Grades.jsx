import {
    Download,
    FileText,
    GraduationCap,
    Upload,
    Plus,
    Users,
    Edit,
    Trash,
    RotateCcw,
    School,
    DollarSign,
    TrendingUp,
    Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useApiList, useApiMutation } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import { notifyError, notifySuccess, confirmToast, toast } from "../../../lib/notify";
import { downloadExcelTemplate, pickExcelFile, exportPdfTable } from "../../../utils/office"
import {
    fetchAllGrades,
    createNewGrade,
    updateGradeInfo,
    removeGrade,
} from "../../../api/assistant/actions";

const Grades = () => {
    const [grade, setGrade] = useState({
        id: "",
        name: "",
        monthlyPrice: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });


    /* fetch مرة واحدة + كاش مشترك مع باقي الصفحات */
    const gradesQuery = useApiList(qk.grades.all, fetchAllGrades, {
        select: (data) => (Array.isArray(data) ? data : []).filter((item) => item?.name && item.name.trim() !== ""),
        errorMessage: "حدث خطأ في تحميل البيانات",
    });
    const grades = gradesQuery.data ?? [];
    const loading = gradesQuery.isLoading;

    const handleDownloadTemplate = () => {
        const headers = ['المصاريف الشهرية', 'اسم الصف'];
        const sampleRow = ['200', 'مثال: الصف الاول الثانوي'];
        downloadExcelTemplate('قالب_الصفوف.xlsx', headers, sampleRow);
    };
    const handleImportExcel = async () => {
        try {
            const rows = await pickExcelFile();
            if (!rows) return;
            if (!rows.length) return notifyError("الملف فارغ");

            setImporting(true);

            const norm = (v) => String(v ?? "").trim();
            let ok = 0;
            const errors = [];
            setProgress({ done: 0, total: rows.length });

            for (let i = 0; i < rows.length; i++) {
                const r = rows[i];
                const line = i + 2;
                setProgress({ done: i, total: rows.length });


                const name = norm(r["اسم الصف"]);
                const price = Number(norm(r["المصاريف الشهرية"]));

                if (!name) { errors.push(`صف ${line}: اسم الصف ناقص`); continue; }
                if (!price || price <= 0) { errors.push(`صف ${line}: المصاريف الشهرية غير صحيحة`); continue; }
                if (grades.some((g) => norm(g.name) === name)) { errors.push(`صف ${line}: الصف "${name}" موجود بالفعل`); continue; }

                try {
                    const res = await createNewGrade({ name, monthlyPrice: price });
                    if (res?.success === false) errors.push(`صف ${line}: ${res?.message || "فشل الحفظ"}`);
                    else ok++;
                } catch (e) {
                    errors.push(`صف ${line}: ${e?.message || "فشل الحفظ"}`);
                }
            }

            setProgress({ done: rows.length, total: rows.length });

            await gradesQuery.refetch();

            if (ok) notifySuccess(`تم إضافة ${ok} صف بنجاح`);
            if (errors.length) {
                notifyError(`فشل ${errors.length} صف`);
                console.warn("Excel import errors:", errors);
            }
        } catch (e) {
            notifyError(e?.message || "حدث خطأ أثناء رفع الملف");
        } finally {
            setImporting(false);
            setProgress({ done: 0, total: 0 });
        }
    };

    const handleExportPdf = () => {
        if (!grades.length) {
            toast.error('لا يوجد صفوف لتصديرها');
            return;
        }

        const columns = [
            { header: 'الصف', key: 'name' },
            { header: 'المصاريف الشهرية (ج)', key: 'monthly_price' }
        ];

        const pdfRows = grades.map(g => ({
            name: g.name,
            monthly_price: `${g.monthly_price} ج`
        }));

        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const fileName = `كشف_الصفوف_${dateStr}.pdf`;

        exportPdfTable(
            fileName,
            'كشف الصفوف الدراسية والمصاريف',
            columns,
            pdfRows
        );
    };

    const calculateStats = (gradesData) => {
        const prices = gradesData?.map((g) => Number(g.monthly_price) || 0) || [];
        const validPrices = prices.filter((p) => p > 0);

        return {
            total: gradesData?.length || 0,
            avgPrice:
                validPrices.length > 0
                    ? Math.round(
                        validPrices.reduce((a, b) => a + b, 0) / validPrices.length,
                    )
                    : 0,
            maxPrice: validPrices.length > 0 ? Math.max(...validPrices) : 0,
            minPrice: validPrices.length > 0 ? Math.min(...validPrices) : 0,
        };
    };

    const stats = calculateStats(grades);

    const saveMutation = useApiMutation(
        ({ id, payload }) => (id ? updateGradeInfo(id, payload) : createNewGrade(payload)),
        {
            invalidateKeys: [qk.grades.all, qk.assistant.dashboard],
            errorMessage: "حدث خطأ في حفظ البيانات",
            onSuccess: (_d, variables) => {
                notifySuccess(variables.id ? "تم تحديث الصف بنجاح" : "تم إضافة الصف بنجاح");
                setIsEditing(false);
                setGrade({ id: "", name: "", monthlyPrice: "" });
            },
        },
    );

    const deleteMutation = useApiMutation((id) => removeGrade(id), {
        invalidateKeys: [qk.grades.all, qk.assistant.dashboard],
        successMessage: "تم حذف الصف بنجاح",
        errorMessage: "حدث خطأ في حذف الصف",
    });

    function saveGrade() {
        if (!grade.name || grade.name.trim() === "") return notifyError("يرجى إدخال اسم الصف");
        if (!grade.monthlyPrice || Number(grade.monthlyPrice) <= 0) return notifyError("يرجى إدخال المصاريف الشهرية");

        saveMutation.mutate({
            id: isEditing && grade.id ? grade.id : null,
            payload: { name: grade.name.trim(), monthlyPrice: Number(grade.monthlyPrice) },
        });
    }

    function removeGradeById(id) {
        if (!id) return;
        confirmToast("هل أنت متأكد من حذف هذا الصف؟", () => deleteMutation.mutate(id), "حذف");
    }

    function editGrade(gradeData) {
        setGrade({
            id: gradeData.id,
            name: gradeData.name || "",
            monthlyPrice: gradeData.monthly_price || 0,
        });
        setIsEditing(true);
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
            },
        },
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        },
    };

    return (
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
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                                <GraduationCap size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    الصفوف الدراسية
                                </h1>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    إدارة الصفوف والأسعار
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <Download size={16} /> قالب Excel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleImportExcel}
                            disabled={importing}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60"
                        >
                            <Upload size={16} /> {importing ? `جاري الرفع... ${progress.total ? `${progress.done}/${progress.total}` : ""}` : "رفع Excel"}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExportPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <FileText size={16} /> كشف Pdf
                        </motion.button>
                    </div>
                </div>

                {importing && progress.total > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>جاري رفع الصفوف...</span>
                            <span>{progress.done} / {progress.total} ({Math.round((progress.done / progress.total) * 100)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-200"
                                style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}


                {/* Stats */}
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                    {[
                        {
                            label: "إجمالي الصفوف",
                            value: stats.total,
                            icon: School,
                            color: "green",
                        },
                        {
                            label: "متوسط المصاريف",
                            value: `${stats.avgPrice} ج`,
                            icon: DollarSign,
                            color: "green",
                        },
                        {
                            label: "أعلى مصاريف",
                            value: `${stats.maxPrice} ج`,
                            icon: TrendingUp,
                            color: "amber",
                        },
                        {
                            label: "أقل مصاريف",
                            value: `${stats.minPrice} ج`,
                            icon: Award,
                            color: "amber",
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                        >
                            <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                                <stat.icon size={16} className={`text-${stat.color}-600`} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.header>

            {/* Add/Edit Form */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                    <div className="bg-primary px-4 sm:px-6 py-4">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            {isEditing ? <RotateCcw size={20} /> : <Plus size={20} />}
                            {isEditing ? "تعديل الصف" : "إضافة صف جديد"}
                        </h2>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <School size={18} className="text-primary" />
                                    اسم المرحلة
                                </label>
                                <input
                                    type="text"
                                    value={grade.name}
                                    onChange={(e) => setGrade({ ...grade, name: e.target.value })}
                                    placeholder="مثال: الصف الاول الثانوي"
                                    className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <DollarSign size={18} className="text-primary" />
                                    المصاريف الشهرية (ج)
                                </label>
                                <input
                                    type="number"
                                    value={grade.monthlyPrice}
                                    onChange={(e) =>
                                        setGrade({ ...grade, monthlyPrice: e.target.value })
                                    }
                                    placeholder="200"
                                    className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                                    required
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={saveGrade}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
                                >
                                    {isEditing ? <RotateCcw size={18} /> : <Plus size={18} />}
                                    {isEditing ? "تحديث" : "إضافة"}
                                </motion.button>
                                {isEditing && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setIsEditing(false);
                                            setGrade({ id: "", name: "", monthlyPrice: "" });
                                        }}
                                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
                                    >
                                        إلغاء
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Grades List */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-primary" />
                        <h2 className="text-lg font-bold text-gray-800">قائمة الصفوف</h2>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {grades?.length || 0} صف
                    </span>
                </div>

                <div className="max-h-[500px] overflow-x-auto overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : grades && grades.length > 0 ? (
                        <table className="w-full min-w-[500px]">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                                <tr>
                                    <th className="text-right pr-6 py-4 w-[40%]">
                                        <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                                            <School size={16} /> الصف
                                        </span>
                                    </th>
                                    <th className="text-right py-4 w-[30%]">
                                        <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                                            <DollarSign size={16} /> المصاريف الشهرية
                                        </span>
                                    </th>
                                    <th className="text-right pl-6 py-4 w-[30%]">
                                        <span className="text-gray-600 font-semibold text-sm">
                                            الإجراءات
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence>
                                    {grades.map((item, index) => (
                                        <motion.tr
                                            key={item.id || index}
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delay: index * 0.05 }}
                                            className={`hover:bg-blue-50/40 transition-all duration-200 group ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                                        >
                                            <td className="text-right pr-6 py-4">
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="font-medium text-gray-800">
                                                        {item.name}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="text-right py-4">
                                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                                    <DollarSign size={14} />
                                                    {Number(item.monthly_price) || 0} ج
                                                </span>
                                            </td>
                                            <td className="text-left pl-0 py-4">
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => editGrade(item)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                                                        title="تعديل"
                                                    >
                                                        <Edit size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeGradeById(item.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                                                        title="حذف"
                                                    >
                                                        <Trash size={18} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <School size={48} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-sm">لا توجد صفوف دراسية</p>
                            <p className="text-xs text-gray-300">أضف صفاً جديداً من الأعلى</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.section>
    );
};

export default Grades;
