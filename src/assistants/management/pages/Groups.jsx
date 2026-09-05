/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Download,
  Edit,
  FileText,
  Plus,
  RotateCcw,
  Trash,
  Upload,
  Calendar,
  Clock,
  Users,
  School,
  MapPin,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useApiList, useApiMutation } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import {
  notifyError,
  notifySuccess,
  confirmToast,
  toast,
} from "../../../lib/notify";
import { motion, AnimatePresence } from "framer-motion";
import { exportPdfTable } from "../../../utils/office.js";
import { ARABIC_DAYS, formatTime } from "../../../utils/helpers.js";
import {
  fetchAllGroups,
  createNewGroup,
  updateGroupInfo,
  removeGroup,
  fetchAllGrades,
  downloadGroupsTemplateAction,
  bulkUploadGroupsAction,
} from "../../../api/assistant/actions";

const Groups = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [importing, setImporting] = useState(false);

  const groupsQuery = useApiList(qk.groups.all, fetchAllGroups, {
    select: (data) =>
      (Array.isArray(data) ? data : []).filter(
        (item) => item?.deleted === 0 || item?.deleted === undefined,
      ),
    errorMessage: "حدث خطأ في تحميل المجموعات",
  });
  const gradesQuery = useApiList(qk.grades.all, fetchAllGrades, {
    select: (data) =>
      (Array.isArray(data) ? data : []).filter(
        (item) =>
          item?.name &&
          item.name.trim() !== "" &&
          (item.deleted === 0 || item.deleted === undefined),
      ),
    showErrorToast: false,
  });
  const groups = groupsQuery.data ?? [];
  const grades = gradesQuery.data ?? [];
  const loading = groupsQuery.isLoading;

  const emptyGroup = {
    id: "",
    grade_id: "",
    name: "",
    room: "",
    days: "",
    start_time: "",
    end_time: "",
  };

  const [group, setGroup] = useState(emptyGroup);

  const calculateStats = (groupsData) => {
    const daysCount = groupsData.reduce((sum, g) => {
      if (g.days) {
        return sum + g.days.split(",").filter((d) => d.trim()).length;
      }
      return sum;
    }, 0);

    const uniqueGrades = new Set(groupsData.map((g) => g.grade_id));
    const uniqueRooms = new Set(groupsData.map((g) => g.room).filter(Boolean));

    return {
      total: groupsData.length,
      totalGrades: uniqueGrades.size,
      avgDays:
        groupsData.length > 0 ? Math.round(daysCount / groupsData.length) : 0,
      rooms: uniqueRooms.size,
    };
  };

  const stats = useMemo(() => calculateStats(groups), [groups]);

  const saveMutation = useApiMutation(
    ({ id, payload }) =>
      id ? updateGroupInfo(id, payload) : createNewGroup(payload),
    {
      invalidateKeys: [qk.groups.all, qk.assistant.dashboard],
      errorMessage: "حدث خطأ في حفظ البيانات",
      onSuccess: (_d, variables) => {
        notifySuccess(
          variables.id ? "تم تحديث المجموعة بنجاح" : "تم إضافة المجموعة بنجاح",
        );
        resetForm();
      },
    },
  );

  const deleteMutation = useApiMutation((id) => removeGroup(id), {
    invalidateKeys: [qk.groups.all, qk.assistant.dashboard],
    successMessage: "تم حذف المجموعة بنجاح",
    errorMessage: "حدث خطأ في حذف المجموعة",
  });

  function saveGroup() {
    if (!group.name || group.name.trim() === "")
      return notifyError("يرجى إدخال اسم المجموعة");
    if (!group.grade_id) return notifyError("يرجى اختيار المرحلة الدراسية");
    if (!group.days || group.days.trim() === "")
      return notifyError("يرجى اختيار أيام الدراسة");
    if (!group.start_time) return notifyError("يرجى تحديد وقت البداية");
    if (!group.end_time) return notifyError("يرجى تحديد وقت النهاية");
    if (group.start_time >= group.end_time)
      return notifyError("وقت البداية يجب أن يكون قبل وقت النهاية");

    saveMutation.mutate({
      id: isEditing && group.id ? group.id : null,
      payload: {
        name: group.name.trim(),
        grade_id: Number(group.grade_id),
        days: group.days,
        start_time: group.start_time,
        end_time: group.end_time,
        room: group.room || "",
      },
    });
  }

  function removeGroupById(id) {
    if (!id) return;
    confirmToast(
      "هل أنت متأكد من حذف هذه المجموعة؟",
      () => deleteMutation.mutate(id),
      "حذف",
    );
  }

  function editGroup(groupData) {
    setGroup({
      id: groupData.id,
      grade_id: groupData.grade_id || "",
      name: groupData.name || "",
      room: groupData.room || "",
      days: groupData.days || "",
      start_time: groupData.start_time ? groupData.start_time.slice(0, 5) : "",
      end_time: groupData.end_time ? groupData.end_time.slice(0, 5) : "",
    });
    setIsEditing(true);
  }

  function resetForm() {
    setIsEditing(false);
    setGroup(emptyGroup);
  }

  function toggleDay(day) {
    const currentDays = group.days
      ? group.days
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d)
      : [];

    let newDays;
    if (currentDays.includes(day)) {
      newDays = currentDays.filter((d) => d !== day);
    } else {
      newDays = [...currentDays, day];
    }

    setGroup({
      ...group,
      days: newDays.join(", "),
    });
  }

  function isDaySelected(day) {
    if (!group.days) return false;
    const daysList = group.days.split(",").map((d) => d.trim());
    return daysList.includes(day);
  }

  const handleDownloadTemplate = async () => {
    try {
      const result = await downloadGroupsTemplateAction();
      if (!result.success) {
        toast.error(result.error || "حدث خطأ في تحميل القالب");
      }
    } catch (error) {
      console.error("Download template error:", error);
      toast.error("حدث خطأ في تحميل القالب");
    }
  };

  const handleImportExcel = async () => {
    try {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".xlsx,.xls";

      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);

        try {
          const formData = new FormData();
          formData.append("file", file);

          const result = await bulkUploadGroupsAction(formData);

          if (result.success) {
            const data = result.data;
            const successCount = data?.success_count ?? 0;
            const errorCount = data?.error_count ?? 0;

            if (successCount > 0) {
              notifySuccess(`تم استيراد ${successCount} مجموعة بنجاح`);
            }
            if (errorCount > 0) {
              notifyError(`فشل استيراد ${errorCount} مجموعة`);
            }
            if (data?.error_records?.length > 0) {
              console.warn("Import errors:", data.error_records);
            }
          } else {
            notifyError(result.error || "حدث خطأ في رفع الملف");
          }

          groupsQuery.refetch();
        } catch (error) {
          console.error("Import excel error:", error);
          notifyError(error.message || "تعذر رفع ملف الإكسل");
        } finally {
          setImporting(false);
        }
      };

      fileInput.click();
    } catch (error) {
      console.error("Import excel error:", error);
      notifyError("تعذر فتح نافذة اختيار الملف");
    }
  };

  const handleExportPdf = () => {
    if (!groups.length) {
      toast.error("لا يوجد مجموعات لتصديرها");
      return;
    }

    const columns = [
      { header: "المجموعة", key: "name" },
      { header: "المرحلة", key: "gradeName" },
      { header: "القاعة", key: "room" },
      { header: "الأيام", key: "days" },
      { header: "التوقيت", key: "start_time" },
    ];

    const pdfRows = groups.map((g) => {
      const grade = grades.find((grade) => grade.id === g.grade_id);
      const gradeName = grade ? grade.name : "-";

      return {
        name: g.name,
        gradeName: gradeName,
        room: g.room || "-",
        days: g.days,
        start_time: formatTime(g.start_time),
      };
    });

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const fileName = `كشف_المجموعات_${dateStr}.pdf`;

    exportPdfTable(fileName, "كشف المجموعات الدراسية", columns, pdfRows);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
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
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  المجموعات
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  إدارة المجموعات والجداول الدراسية
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
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Upload size={16} /> {importing ? "جاري الرفع..." : "رفع Excel"}
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

        {importing && (
          <div className="mt-4">
            <div className="flex items-center justify-center text-xs text-gray-600">
              <span>جاري رفع المجموعات...</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary animate-pulse" />
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
              label: "إجمالي المجموعات",
              value: stats.total,
              icon: Users,
              color: "green",
            },
            {
              label: "المراحل المغطاة",
              value: stats.totalGrades,
              icon: School,
              color: "amber",
            },
            {
              label: "متوسط الأيام",
              value: stats.avgDays,
              icon: Calendar,
              color: "green",
            },
            {
              label: "عدد القاعات",
              value: stats.rooms,
              icon: MapPin,
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
              {isEditing ? "تعديل المجموعة" : "إضافة مجموعة جديدة"}
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Grade */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <School size={18} className="text-primary" />
                  المرحلة الدراسية
                </label>
                <select
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                  value={group.grade_id}
                  onChange={(e) =>
                    setGroup({ ...group, grade_id: e.target.value })
                  }
                >
                  <option value="">اختر المرحلة</option>
                  {grades.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  اسم المجموعة
                </label>
                <input
                  type="text"
                  placeholder="مجموعة السبت"
                  value={group.name}
                  onChange={(e) => setGroup({ ...group, name: e.target.value })}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                />
              </div>

              {/* Room */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  القاعة
                </label>
                <input
                  type="text"
                  placeholder="قاعة 101"
                  value={group.room}
                  onChange={(e) => setGroup({ ...group, room: e.target.value })}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                />
              </div>
            </div>

            {/* Days */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-primary" />
                <label className="text-sm font-medium text-gray-700">
                  أيام الدراسة
                </label>
                <span className="text-xs text-gray-400">
                  (اختر يوم أو أكثر)
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {ARABIC_DAYS.map((day) => {
                  const active = isDaySelected(day);
                  return (
                    <motion.button
                      key={day}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        active
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {day}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Times */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> وقت البداية
                </label>
                <input
                  type="time"
                  value={group.start_time}
                  onChange={(e) =>
                    setGroup({ ...group, start_time: e.target.value })
                  }
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> وقت النهاية
                </label>
                <input
                  type="time"
                  value={group.end_time}
                  onChange={(e) =>
                    setGroup({ ...group, end_time: e.target.value })
                  }
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t-2 border-gray-100 flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveGroup}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/30 duration-300 transition-all"
              >
                {isEditing ? <RotateCcw size={18} /> : <Plus size={18} />}
                {isEditing ? "تحديث المجموعة" : "إضافة المجموعة"}
              </motion.button>
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  إلغاء التعديل
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Groups List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-800">قائمة المجموعات</h2>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {groups.length} مجموعة
          </span>
        </div>

        <div className="max-h-125 overflow-x-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <table className="w-full min-w-225">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                <tr>
                  <th className="text-right pr-4 py-4 w-[5%]">
                    <span className="text-gray-600 font-semibold text-sm">
                      #
                    </span>
                  </th>
                  <th className="text-right pr-4 py-4 w-[20%]">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <Users size={16} /> المجموعة
                    </span>
                  </th>
                  <th className="text-right pr-4 py-4 w-[15%]">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <School size={16} /> المرحلة
                    </span>
                  </th>
                  <th className="text-right pr-4 py-4 w-[17%]">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <Calendar size={16} /> الأيام
                    </span>
                  </th>
                  <th className="text-right pr-4 py-4 w-[15%]">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <Clock size={16} /> الميعاد
                    </span>
                  </th>
                  <th className="text-right pr-4 py-4 w-[10%]">
                    <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                      <MapPin size={16} /> القاعة
                    </span>
                  </th>
                  <th className="text-center py-4 w-[13%]">
                    <span className="text-gray-600 font-semibold text-sm">
                      الإجراءات
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {groups.map((item, index) => {
                    const grade = grades.find((g) => g.id === item.grade_id);
                    const gradeName = grade ? grade.name : "-";

                    return (
                      <motion.tr
                        key={item.id || index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-blue-50/40 transition-all duration-200 group ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                      >
                        <td className="text-right pr-4 py-4 text-sm text-gray-400">
                          {index + 1}
                        </td>
                        <td className="text-right pr-4 py-4">
                          <span className="font-medium text-gray-800">
                            {item.name}
                          </span>
                        </td>
                        <td className="text-right pr-4 py-4">
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                            <School size={14} />
                            {gradeName}
                          </span>
                        </td>
                        <td className="text-right pr-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {item.days ? (
                              item.days.split(",").map((d) => (
                                <span
                                  key={d.trim()}
                                  className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg text-xs"
                                >
                                  {d.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="text-right pr-4 py-4">
                          {item.start_time && item.end_time ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                              <Clock size={14} />
                              {formatTime(item.start_time)} -{" "}
                              {formatTime(item.end_time)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-right pr-4 py-4">
                          {item.room ? (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              <MapPin size={14} />
                              {item.room}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-center py-4">
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => editGroup(item)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                              title="تعديل"
                            >
                              <Edit size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeGroupById(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                              title="حذف"
                            >
                              <Trash size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Users size={48} className="text-gray-300" />
                <p className="text-gray-400 font-medium">
                  لا يوجد مجموعات مضافة
                </p>
                <p className="text-sm text-gray-300">
                  قم بإضافة مجموعة جديدة من النموذج أعلاه
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Groups;
