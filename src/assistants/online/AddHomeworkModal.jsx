/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { X, Upload, FileText, Trash2, Download } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../../motion";
import { fetchGroupsByGrade } from "../../api/assistant/actions";

const AddHomeworkModal = ({
  open = true,
  onClose = () => {},
  grades = [],
  groups = [],
  onSubmit = async (data) => console.log("homework:", data),
  requireFile = false,
  accept = ".pdf,.doc,.docx",
  editingAssignment = null,
}) => {
  const fileRef = useRef(null);
  const groupsCache = useRef({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    gradeId: "",
    groupId: "",
    deadline: "",
    maxScore: "",
    isClosed: 0,
  });
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [localGroups, setLocalGroups] = useState(groups);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const cairoDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
        return cairoDate.toISOString().slice(0, 16);
      }
    } catch (e) {}

    if (typeof dateStr === "string" && dateStr.includes("T")) {
      try {
        const date = new Date(dateStr);
        const cairoDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
        return cairoDate.toISOString().slice(0, 16);
      } catch (e) {}
    }

    return "";
  };

  useEffect(() => {
    if (editingAssignment) {
      setForm({
        title: editingAssignment.title || "",
        description: editingAssignment.description || "",
        gradeId: editingAssignment.grade_id || "",
        groupId: editingAssignment.group_id || "",
        deadline: formatDateForInput(editingAssignment.deadline),
        maxScore: editingAssignment.full_mark || "",
        isClosed: editingAssignment.is_closed || 0,
      });

      if (editingAssignment.grade_id) {
        const cached = groupsCache.current[editingAssignment.grade_id];
        if (cached) {
          setLocalGroups(cached);
        } else {
          fetchGroupsByGrade(editingAssignment.grade_id).then((result) => {
            if (result.success) {
              groupsCache.current[editingAssignment.grade_id] =
                result.data || [];
              setLocalGroups(groupsCache.current[editingAssignment.grade_id]);
            }
          });
        }
      }
    } else {
      setForm({
        title: "",
        description: "",
        gradeId: "",
        groupId: "",
        deadline: "",
        maxScore: "",
        isClosed: 0,
      });
      setFile(null);
      setLocalGroups(groups);
    }
  }, [editingAssignment, groups]);

  const handleGradeChange = async (gradeId) => {
    setForm((prev) => ({ ...prev, gradeId, groupId: "" }));
    if (gradeId) {
      if (groupsCache.current[gradeId]) {
        setLocalGroups(groupsCache.current[gradeId]);
      } else {
        const result = await fetchGroupsByGrade(gradeId);
        if (result.success) {
          groupsCache.current[gradeId] = result.data || [];
          setLocalGroups(groupsCache.current[gradeId]);
        }
      }
    } else {
      setLocalGroups([]);
    }
  };

  const handleClose = () => {
    const hasChanges =
      form.title.trim() !== "" ||
      form.description.trim() !== "" ||
      file !== null;

    if (hasChanges && !editingAssignment) {
      if (window.confirm("في تعديلات غير محفوظة. متأكد إنك عايز تقفل؟")) {
        onClose();
      }
    } else if (hasChanges && editingAssignment) {
      if (window.confirm("في تعديلات غير محفوظة. متأكد إنك عايز تقفل؟")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!open) return null;

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const isAllowed = (f) => /\.(pdf|docx?|jpe?g|png|webp)$/i.test(f.name);

  const pickFile = (fileList) => {
    const f = Array.from(fileList || [])[0];
    if (!f) return;
    if (!isAllowed(f)) {
      setError("الملف لازم يكون PDF أو Word أو صورة فقط");
      return;
    }
    setError("");
    setFile(f);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;
    return `https://backend.benb3n.cloud/${filePath.replace(/^\//, "")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("عنوان الواجب مطلوب");
    if (!form.gradeId) return setError("الصف مطلوب");
    if (requireFile && !file && !editingAssignment)
      return setError("ملف أسئلة الواجب مطلوب");
    if (form.maxScore && Number(form.maxScore) <= 0)
      return setError("الدرجة الكلية لازم تكون رقم أكبر من صفر");
    if (form.deadline && new Date(form.deadline) < new Date())
      return setError("آخر موعد للتسليم لازم يكون في المستقبل");

    setError("");
    setSaving(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || null,
        gradeId: form.gradeId,
        groupId: form.groupId || null,
        deadline: form.deadline || null,
        maxScore: form.maxScore ? Number(form.maxScore) : null,
        isClosed: form.isClosed,
        file,
      });
      onClose();
    } catch (err) {
      setError(err?.message || "حصلت مشكلة أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      dir="rtl"
      className="fixed inset-0 z-9999 bg-black/50 flex items-center justify-center p-3"
      onClick={handleClose}
    >
      <motion.div
        variants={itemVariants}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[88vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center z-10">
          <h2 className="font-bold text-base">
            {editingAssignment ? "تعديل واجب" : "إضافة واجب"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <input
            value={form.title}
            onChange={setField("title")}
            placeholder="عنوان الواجب *"
            className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500"
          />

          <textarea
            value={form.description}
            onChange={setField("description")}
            placeholder="وصف الواجب (اختياري)"
            rows={3}
            className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.gradeId}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 bg-white"
            >
              <option value="">الصف *</option>
              {grades.map((g) => (
                <option key={g.id ?? g._id} value={g.id ?? g._id}>
                  {g.name ?? g.title}
                </option>
              ))}
            </select>

            <select
              value={form.groupId}
              onChange={setField("groupId")}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500 bg-white"
            >
              <option value="">كل المجموعات</option>
              {localGroups.map((gr) => (
                <option key={gr.id ?? gr._id} value={gr.id ?? gr._id}>
                  {gr.name ?? gr.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400">
                آخر موعد للتسليم (اختياري)
              </label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={setField("deadline")}
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400">
                الدرجة الكلية (اختياري)
              </label>
              <input
                type="number"
                min="1"
                value={form.maxScore}
                onChange={setField("maxScore")}
                placeholder="مثال: 20"
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* is_closed toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              إغلاق الواجب (منع التسليم)
            </label>
            <input
              type="checkbox"
              checked={form.isClosed === 1}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isClosed: e.target.checked ? 1 : 0,
                }))
              }
              className="w-4 h-4"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-gray-400">
              ملف أسئلة الواجب {requireFile ? "*" : "(اختياري)"} — PDF أو Word
              أو صورة
            </label>

            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  pickFile(e.dataTransfer.files);
                }}
                onClick={() => fileRef.current?.click()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition ${
                  isDragging
                    ? "border-primary bg-purple-50"
                    : "border-gray-200 hover:border-primary/90"
                }`}
              >
                <Upload size={22} className="mx-auto mb-1.5 text-gray-400" />
                <p className="text-xs text-gray-500">
                  {editingAssignment && !file
                    ? "اترك الملف القديم أو اختر ملف جديد"
                    : "اسحب الملف هنا أو اضغط للاختيار"}
                </p>
                {editingAssignment?.file_path && (
                  <a
                    href={getFileUrl(editingAssignment.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-primary hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    <Download size={12} />
                    الملف الحالي: {editingAssignment.file_path.split("/").pop()}
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={18} className="text-purple-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => pickFile(e.target.files)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg p-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : editingAssignment ? "تحديث" : "حفظ"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 border border-gray-200 rounded-lg text-sm text-gray-500"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddHomeworkModal;
