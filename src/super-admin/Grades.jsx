import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Users,
  Layers,
  DollarSign,
  Search,
  RefreshCw,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  getGradesStats,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({ name: "", monthly_price: "" });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    grade: null,
    isPermanent: false,
  });

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await getGradesStats();
      const list = Array.isArray(res) ? res : res?.grades || res?.data || [];
      setGrades(list);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحميل الصفوف الدراسية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleOpenCreate = () => {
    setEditingGrade(null);
    setFormData({ name: "", monthly_price: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gradeItem) => {
    setEditingGrade(gradeItem);
    setFormData({
      name: gradeItem.name || "",
      monthly_price: gradeItem.monthly_price || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم الصف الدراسي");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        monthly_price: Number(formData.monthly_price) || 0,
      };

      if (editingGrade) {
        await updateGrade(editingGrade.id, payload);
        toast.success("تم تحديث بيانات الصف بنجاح");
      } else {
        await createGrade(payload);
        toast.success("تم إنشاء الصف الدراسي بنجاح");
      }
      setIsModalOpen(false);
      fetchGrades();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشلت العملية");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.grade) return;
    try {
      setSubmitting(true);
      await deleteGrade(deleteModal.grade.id, deleteModal.isPermanent);
      toast.success("تم حذف الصف بنجاح");
      setDeleteModal({ isOpen: false, grade: null, isPermanent: false });
      fetchGrades();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشل حذف الصف");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGrades = grades.filter((g) =>
    (g.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = grades.reduce(
    (acc, g) => acc + (Number(g.students_count) || Number(g.total_students) || 0),
    0
  );
  const totalGroups = grades.reduce(
    (acc, g) => acc + (Number(g.groups_count) || Number(g.total_groups) || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] p-2 rounded-xl">
              <GraduationCap size={22} />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">
              إدارة الصفوف الدراسية
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-normal">
            إنشاء وتعديل المراحل التعليمية وضبط قيمة الاشتراك الشهري ومتابعة الأعداد
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGrades}
            className="p-2.5 text-gray-600 hover:text-[#1a5d1a] hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all"
          >
            <Plus size={18} />
            إضافة صف دراسي جديد
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">
              إجمالي الصفوف الدراسية
            </p>
            <h3 className="text-2xl font-semibold text-gray-900">{grades.length}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-[#1a5d1a]">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">
              إجمالي المجموعات
            </p>
            <h3 className="text-2xl font-semibold text-gray-900">{totalGroups}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">
              إجمالي الطلاب المقيدين
            </p>
            <h3 className="text-2xl font-semibold text-gray-900">{totalStudents}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم الصف الدراسي..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
          />
        </div>
      </div>

      {/* Grades Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">جاري تحميل الصفوف...</p>
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            لا توجد صفوف دراسية مسجلة
          </h3>
          <p className="text-xs text-gray-500 mb-4 font-normal">
            قم بإضافة أول صف دراسي لبدء ربط المجموعات والطلاب
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#1a5d1a] text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            إضافة صف جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGrades.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1a5d1a]/10 text-[#1a5d1a] flex items-center justify-center font-medium">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        {g.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        معرف الصف #{g.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="تعديل الصف"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          grade: g,
                          isPermanent: false,
                        })
                      }
                      className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف الصف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-50 text-center mb-4">
                  <div className="bg-gray-50/70 p-2 rounded-xl">
                    <span className="text-[11px] text-gray-400 block font-normal">
                      المجموعات
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {g.groups_count ?? g.total_groups ?? 0}
                    </span>
                  </div>
                  <div className="bg-gray-50/70 p-2 rounded-xl">
                    <span className="text-[11px] text-gray-400 block font-normal">
                      الطلاب
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {g.students_count ?? g.total_students ?? 0}
                    </span>
                  </div>
                  <div className="bg-gray-50/70 p-2 rounded-xl">
                    <span className="text-[11px] text-gray-400 block font-normal">
                      الاشتراك
                    </span>
                    <span className="text-sm font-semibold text-[#1a5d1a]">
                      {g.monthly_price ? `${g.monthly_price} ج.م` : "مجاني"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                <span>تاريخ التحديث</span>
                <span>
                  {g.updated_at
                    ? new Date(g.updated_at).toLocaleDateString("ar-EG")
                    : "حديثاً"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingGrade ? "تعديل الصف الدراسي" : "إضافة صف دراسي جديد"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    اسم الصف الدراسي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: الصف الثالث الثانوي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    قيمة الاشتراك الشهري (ج.م)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.monthly_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly_price: e.target.value,
                        })
                      }
                      placeholder="مثال: 300"
                      className="w-full pr-3.5 pl-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      ج.م
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#1a5d1a] hover:bg-[#154a15] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                  >
                    {submitting
                      ? "جاري الحفظ..."
                      : editingGrade
                      ? "تحديث الصف"
                      : "إنشاء الصف"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                تأكيد حذف الصف الدراسي
              </h3>
              <p className="text-xs text-gray-500 mb-4 font-normal">
                هل أنت متأكد من رغبتك في حذف الصف{" "}
                <span className="font-semibold text-gray-800">
                  {deleteModal.grade?.name}
                </span>
                ؟
              </p>

              <div className="flex items-center justify-center gap-2 mb-4">
                <label className="text-xs text-gray-600 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteModal.isPermanent}
                    onChange={(e) =>
                      setDeleteModal({
                        ...deleteModal,
                        isPermanent: e.target.checked,
                      })
                    }
                    className="rounded text-red-600 focus:ring-0"
                  />
                  حذف نهائي من قاعدة البيانات
                </label>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setDeleteModal({
                      isOpen: false,
                      grade: null,
                      isPermanent: false,
                    })
                  }
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  {submitting ? "جاري الحذف..." : "نعم، حذف"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
