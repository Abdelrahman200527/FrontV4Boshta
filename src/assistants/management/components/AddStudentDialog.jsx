/* eslint-disable no-unused-vars */
import {
  UserPlus,
  X,
  User,
  Phone,
  Barcode,
  GraduationCap,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AddStudentDialog = ({
  onClose,
  onSave,
  groups = [],
  grades = [],
  student,
  setStudent,
  isEditing,
  error: externalError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState(null);

  if (!student) return null;

  const setField = (key, value) => {
    setStudent((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
    if (localError) setLocalError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!String(student.full_name ?? "").trim())
      newErrors.full_name = "الاسم مطلوب";
    if (!String(student.barcode ?? "").trim())
      newErrors.barcode = "الباركود مطلوب";
    if (!student.grade_id) newErrors.grade_id = "المرحلة مطلوبة";
    if (!student.group_id) newErrors.group_id = "المجموعة مطلوبة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLocalError(null);
    try {
      await onSave();
    } catch (error) {
      setLocalError(error.message || "حدث خطأ في حفظ البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.9, y: 30, transition: { duration: 0.2 } },
  };

  const filteredGroups = groups.filter(
    (g) => !student.grade_id || Number(g.grade_id) === Number(student.grade_id),
  );

  const inputClass = (hasError) =>
    `w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
      hasError
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-gray-50 hover:border-primary/50"
    }`;

  const errorMessage = externalError || localError;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          dir="rtl"
          className="w-full max-w-150 bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary px-6 py-5 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <UserPlus size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
                </h2>
                <p className="text-sm text-white/80">
                  {isEditing
                    ? "قم بتحديث بيانات الطالب في المنظومة"
                    : "أدخل بيانات الطالب لتسجيله في المنظومة"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              {/* الاسم والباركود */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      الاسم الكامل <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={student.full_name ?? ""}
                    onChange={(e) => setField("full_name", e.target.value)}
                    placeholder="أدخل اسم الطالب"
                    className={inputClass(errors.full_name)}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <Barcode size={16} className="text-primary" />
                      الباركود <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={student.barcode ?? ""}
                    onChange={(e) => setField("barcode", e.target.value)}
                    placeholder="امسح أو اكتب الباركود"
                    className={inputClass(errors.barcode)}
                  />
                  {errors.barcode && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.barcode}
                    </p>
                  )}
                </div>
              </div>

              {/* رقم الجوال وولي الأمر */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <Phone size={16} className="text-primary" />
                      رقم الجوال
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={student.phone ?? ""}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className={inputClass(errors.phone)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <Phone size={16} className="text-primary" />
                      رقم ولي الأمر
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={student.parent_phone ?? ""}
                    onChange={(e) => setField("parent_phone", e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className={inputClass(errors.parent_phone)}
                  />
                </div>
              </div>

              {/* المرحلة والمجموعة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-primary" />
                      المرحلة الدراسية <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <select
                    value={student.grade_id ?? ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : "";
                      setStudent((prev) => ({
                        ...prev,
                        grade_id: value,
                        group_id: "",
                      }));
                      if (errors.grade_id)
                        setErrors((prev) => ({ ...prev, grade_id: null }));
                    }}
                    className={inputClass(errors.grade_id)}
                  >
                    <option value="">اختر المرحلة</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                  {errors.grade_id && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.grade_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      المجموعة <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <select
                    value={student.group_id ?? ""}
                    onChange={(e) =>
                      setField(
                        "group_id",
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    disabled={!student.grade_id}
                    className={`${inputClass(errors.group_id)} disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {student.grade_id
                        ? "اختر المجموعة"
                        : "اختر المرحلة أولاً"}
                    </option>
                    {filteredGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  {errors.group_id && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.group_id}
                    </p>
                  )}
                </div>
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    ملاحظات
                  </span>
                </label>
                <textarea
                  value={student.notes ?? ""}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows="3"
                  placeholder="أي ملاحظات إضافية عن الطالب..."
                  className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hover:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 text-sm"
            >
              إلغاء
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  {isEditing ? <UserPlus size={18} /> : <UserPlus size={18} />}
                  {isEditing ? "حفظ التعديلات" : "تسجيل الطالب"}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddStudentDialog;
