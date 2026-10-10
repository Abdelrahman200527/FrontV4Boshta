import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  Plus,
  Edit2,
  Trash2,
  Users,
  Clock,
  MapPin,
  Calendar,
  Search,
  RefreshCw,
  AlertTriangle,
  X,
  GraduationCap,
  Filter,
} from "lucide-react";
import {
  getAllGroups,
  getAllGrades,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminGroups() {
  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    const parts = String(timeStr).split(":");
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "م" : "ص";
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  const [groups, setGroups] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    grade_id: "",
    days: "",
    start_time: "10:00",
    end_time: "12:00",
    room: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    group: null,
    isPermanent: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, gradesRes] = await Promise.all([
        getAllGroups(),
        getAllGrades(),
      ]);

      const groupsList = Array.isArray(groupsRes)
        ? groupsRes
        : groupsRes?.groups || groupsRes?.data || [];
      const gradesList = Array.isArray(gradesRes)
        ? gradesRes
        : gradesRes?.grades || gradesRes?.data || [];

      setGroups(groupsList);
      setGrades(gradesList);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحميل بيانات المجموعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setFormData({
      name: "",
      grade_id: grades[0]?.id ? String(grades[0].id) : "",
      days: "",
      start_time: "10:00",
      end_time: "12:00",
      room: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (groupItem) => {
    setEditingGroup(groupItem);
    setFormData({
      name: groupItem.name || "",
      grade_id: String(groupItem.grade_id || ""),
      days: groupItem.days || "",
      start_time: groupItem.start_time || "10:00",
      end_time: groupItem.end_time || "12:00",
      room: groupItem.room || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.grade_id) {
      toast.error("يرجى إدخال اسم المجموعة واختيار الصف الدراسي");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        grade_id: Number(formData.grade_id),
        days: formData.days.trim(),
        start_time: formData.start_time,
        end_time: formData.end_time,
        room: formData.room.trim(),
      };

      if (editingGroup) {
        await updateGroup(editingGroup.id, payload);
        toast.success("تم تحديث بيانات المجموعة بنجاح");
      } else {
        await createGroup(payload);
        toast.success("تم إنشاء المجموعة بنجاح");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشلت العملية");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.group) return;
    try {
      setSubmitting(true);
      await deleteGroup(deleteModal.group.id, deleteModal.isPermanent);
      toast.success("تم حذف المجموعة بنجاح");
      setDeleteModal({ isOpen: false, group: null, isPermanent: false });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "فشل حذف المجموعة");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      (g.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.days || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.room || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.grade_name || "").toLowerCase().includes(search.toLowerCase());

    const matchesGrade = selectedGradeId
      ? String(g.grade_id) === String(selectedGradeId)
      : true;

    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] p-2 rounded-xl">
              <CalendarClock size={22} />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">
              إدارة المجموعات الدراسية
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-normal">
            توزيع الجداول والمواعيد وتعيين القاعات وربط المجموعات بالصفوف الدراسية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
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
            إضافة مجموعة جديدة
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم المجموعة أو اليوم أو القاعة..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            className="w-full md:w-56 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
          >
            <option value="">كافة الصفوف الدراسية</option>
            {grades.map((gr) => (
              <option key={gr.id} value={gr.id}>
                {gr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">جاري تحميل المجموعات...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <CalendarClock size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            لا توجد مجموعات مطابقة
          </h3>
          <p className="text-xs text-gray-500 mb-4 font-normal">
            لم نجد مجموعات مطابقة لمعايير البحث الحالية
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#1a5d1a] text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            إضافة مجموعة جديدة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGroups.map((grp) => (
            <div
              key={grp.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-emerald-50 text-[#1a5d1a] text-xs font-medium px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                    <GraduationCap size={13} />
                    {grp.grade_name || "صف غير محدد"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(grp)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="تعديل المجموعة"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          group: grp,
                          isPermanent: false,
                        })
                      }
                      className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف المجموعة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 text-base mb-2">
                  {grp.name}
                </h3>

                <div className="space-y-2 text-xs text-gray-600 mb-4 bg-gray-50/70 p-3 rounded-xl border border-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>الأيام:</span>
                    <span className="font-medium text-gray-800">
                      {grp.days || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>الموعد:</span>
                    <span className="font-medium text-gray-800">
                      {formatTime(grp.start_time)} إلى {formatTime(grp.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>المكان:</span>
                    <span className="font-medium text-gray-800">
                      {grp.room || "القاعة العامة"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1.5 font-normal text-gray-600">
                  <Users size={14} className="text-[#1a5d1a]" />
                  <span>الطلاب المقيدون</span>
                </span>
                <span className="font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full text-xs">
                  {grp.students_count ?? grp.total_students ?? 0} طالب
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
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingGroup ? "تعديل المجموعة الدراسية" : "إضافة مجموعة جديدة"}
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
                    اسم المجموعة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: مجموعة السبت والثلاثاء - 10 صباحاً"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    الصف الدراسي *
                  </label>
                  <select
                    required
                    value={formData.grade_id}
                    onChange={(e) =>
                      setFormData({ ...formData, grade_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  >
                    <option value="">اختر الصف الدراسي</option>
                    {grades.map((gr) => (
                      <option key={gr.id} value={gr.id}>
                        {gr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    أيام الحصة
                  </label>
                  <input
                    type="text"
                    value={formData.days}
                    onChange={(e) =>
                      setFormData({ ...formData, days: e.target.value })
                    }
                    placeholder="مثال: السبت والثلاثاء"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      وقت البدء
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      وقت الانتهاء
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    القاعة / الغرفة
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                    placeholder="مثال: قاعة أ - الدور الثاني"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
                  />
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
                      : editingGroup
                      ? "تحديث المجموعة"
                      : "إنشاء المجموعة"}
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
                تأكيد حذف المجموعة
              </h3>
              <p className="text-xs text-gray-500 mb-4 font-normal">
                هل أنت متأكد من رغبتك في حذف المجموعة{" "}
                <span className="font-semibold text-gray-800">
                  {deleteModal.group?.name}
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
                      group: null,
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
