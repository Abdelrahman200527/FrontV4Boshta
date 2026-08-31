import {
  CalendarCheck,
  Search,
  ScanLine,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  BarChart3,
  Play,
  Square,
  RefreshCw,
  CalendarDays,
  ClipboardList,
  Trash2,
  Pencil,
  Info,
  TrendingUp,
  AlertTriangle,
  X,
} from "lucide-react";
import { memo, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useApiList } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import {
  notifyError,
  notifySuccess,
  notifyInfo,
  confirmToast,
} from "../../../lib/notify";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAllGroups,
  fetchAllGrades,
  fetchStudentsByGroup,
  fetchActiveSession,
  startAttendanceSession,
  scanStudentBarcode,
  lockAttendanceSession,
  toggleMakeupMode,
  createNewAttendance,
  markRestAsAbsent,
  fetchAttendanceById,
  updateAttendanceInfo,
  removeAttendance,
  fetchAttendanceDashboard,
  fetchAttendanceOverview,
  fetchGradeAttendance,
  fetchGroupAttendanceByDate,
  fetchGroupAttendanceByMonth,
  fetchAttendanceSummary,
} from "../../../api/assistant/actions";

/* ============================ Helpers ============================ */

function toLocalDate(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA");
}

function toLocalMonth(value = new Date()) {
  return toLocalDate(value).slice(0, 7);
}

function shortTime(t) {
  if (!t) return "-";
  return String(t).slice(0, 5);
}

function formatTimeLabel(t) {
  const s = shortTime(t);
  if (s === "-") return "-";
  const d = new Date(`1970-01-01T${s}:00`);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

function nowTimeValue() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const num = (v) => Number(v ?? 0) || 0;

/* ============================ Row ============================ */

const AttendanceRow = memo(function AttendanceRow({
  student,
  index,
  record,
  canEdit,
  isLoading,
  onMarkPresent,
  onMarkAbsent,
  onDetails,
  onDelete,
}) {
  const isPresent = record?.status === "present";
  const isAbsent = record?.status === "absent";
  const statusLabel = record ? (isPresent ? "حاضر" : "غائب") : "غير مسجل";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="hover:bg-blue-50/40 transition-all duration-200 group"
    >
      <td className="px-5 py-3 font-medium text-gray-800">
        <div className="flex items-center gap-2">
          <span>{student.full_name}</span>
          {record?.is_makeup === 1 && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
              تعويضي
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-3 text-sm font-mono text-gray-500">
        {student.barcode}
      </td>
      <td className="px-5 py-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isPresent
              ? "bg-green-100 text-green-700"
              : isAbsent
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {isPresent && <CheckCircle size={12} />}
          {isAbsent && <XCircle size={12} />}
          {!record && <AlertCircle size={12} />}
          {statusLabel}
        </span>
      </td>
      <td className="px-5 py-3 text-sm text-gray-500">
        {formatTimeLabel(record?.attendance_time)}
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onMarkPresent(student)}
            disabled={!canEdit || isPresent || isLoading}
            title="تسجيل حضور"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs text-white font-medium hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none transition-all"
          >
            <UserCheck size={14} />
            حضور
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onMarkAbsent(student)}
            disabled={!canEdit || isAbsent || isLoading}
            title="تسجيل غياب"
            className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-xs text-white font-medium hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300 transition-all"
          >
            <UserX size={14} />
            غياب
          </motion.button>
          <button
            type="button"
            onClick={() => onDetails(record)}
            disabled={!record}
            title="تفاصيل السجل"
            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Info size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(record, student)}
            disabled={!record || isLoading}
            title="حذف السجل"
            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
});

/* ============================ Page ============================ */

const Attendance = () => {
  const gradesQuery = useApiList(qk.grades.all, fetchAllGrades, {
    select: (data) =>
      (Array.isArray(data) ? data : []).filter(
        (g) => g?.name && g.name.trim() !== "",
      ),
    showErrorToast: false,
  });
  const groupsQuery = useApiList(qk.groups.all, fetchAllGroups, {
    select: (data) =>
      (Array.isArray(data) ? data : []).filter(
        (g) => g?.deleted === 0 || g?.deleted === undefined,
      ),
    showErrorToast: false,
  });
  const grades = gradesQuery.data ?? [];
  const groups = groupsQuery.data ?? [];

  const [students, setStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState(toLocalDate());
  const [selectedMonth, setSelectedMonth] = useState(toLocalMonth());

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionLocked, setSessionLocked] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isMakeupEnabled, setIsMakeupEnabled] = useState(false);
  const [lockAt, setLockAt] = useState("");

  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const [serverSummary, setServerSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [overview, setOverview] = useState({
    overall: [],
    consecutiveAbsences: [],
  });
  const [gradeStats, setGradeStats] = useState([]);
  const [monthRecords, setMonthRecords] = useState([]);
  const [monthLoading, setMonthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("day");

  const [detailsRecord, setDetailsRecord] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const barcodeInputRef = useRef(null);
  const isToday = selectedDate === toLocalDate();
  const canEdit = sessionActive || !isToday;

  const loadDashboard = useCallback(async () => {
    const [dash, over] = await Promise.all([
      fetchAttendanceDashboard(),
      fetchAttendanceOverview(),
    ]);
    if (dash.success) setDashboard(dash.data || null);
    if (over.success) {
      setOverview({
        overall: Array.isArray(over.data?.overall) ? over.data.overall : [],
        consecutiveAbsences: Array.isArray(over.data?.consecutiveAbsences)
          ? over.data.consecutiveAbsences
          : [],
      });
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!selectedGrade) {
      setGradeStats([]);
      return;
    }
    (async () => {
      const res = await fetchGradeAttendance(selectedGrade);
      setGradeStats(res.success && Array.isArray(res.data) ? res.data : []);
    })();
  }, [selectedGrade]);

  function showMessage(text, type = "info") {
    if (!text) return;
    if (type === "error") notifyError(text);
    else if (type === "success") notifySuccess(text);
    else notifyInfo(text);
  }

  const loadAttendanceRecords = useCallback(
    async (groupId = selectedGroup, date = selectedDate) => {
      if (!groupId) return;
      const [recRes, sumRes] = await Promise.all([
        fetchGroupAttendanceByDate(groupId, date),
        fetchAttendanceSummary(groupId, date),
      ]);

      if (recRes.success && Array.isArray(recRes.data)) {
        const records = {};
        recRes.data.forEach((r) => {
          records[r.student_id] = r;
        });
        setAttendanceRecords(records);
      } else {
        setAttendanceRecords({});
      }
      setServerSummary(sumRes.success ? sumRes.data || null : null);
    },
    [selectedGroup, selectedDate],
  );

  const checkActiveSession = useCallback(async (groupId) => {
    if (!groupId) return;
    try {
      const result = await fetchActiveSession(groupId);
      if (result.success && result.data) {
        setSessionInfo(result.data);
        setSessionId(result.data.id);
        setIsMakeupEnabled(result.data.is_makeup_enabled === 1);
        setSessionLocked(result.data.status === "locked");
        setSessionActive(result.data.status === "active");
      } else {
        setSessionInfo(null);
        setSessionActive(false);
        setSessionId(null);
        setSessionLocked(false);
        setIsMakeupEnabled(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setSessionActive(false);
    }
  }, []);

  const loadGroupStudents = useCallback(
    async (groupId) => {
      if (!groupId) return;
      setLoading(true);
      try {
        const result = await fetchStudentsByGroup(groupId);
        setStudents(
          result.success && Array.isArray(result.data) ? result.data : [],
        );
        await loadAttendanceRecords(groupId, selectedDate);
      } catch (error) {
        console.error("Error loading students:", error);
        showMessage("حدث خطأ في تحميل الطلاب", "error");
      } finally {
        setLoading(false);
      }
    },
    [loadAttendanceRecords, selectedDate],
  );

  useEffect(() => {
    if (!selectedGroup) {
      setStudents([]);
      setAttendanceRecords({});
      setServerSummary(null);
      setSessionActive(false);
      setSessionId(null);
      setSessionInfo(null);
      setMonthRecords([]);
      return;
    }
    checkActiveSession(selectedGroup);
    loadGroupStudents(selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroup) loadAttendanceRecords(selectedGroup, selectedDate);
  }, [selectedDate]);

  const loadMonth = useCallback(async () => {
    if (!selectedGroup) return;
    setMonthLoading(true);
    try {
      const res = await fetchGroupAttendanceByMonth(selectedGroup, selectedMonth);
      setMonthRecords(res.success && Array.isArray(res.data) ? res.data : []);
    } finally {
      setMonthLoading(false);
    }
  }, [selectedGroup, selectedMonth]);

  useEffect(() => {
    if (activeTab === "month") loadMonth();
  }, [activeTab, loadMonth]);

  async function startSession() {
    if (!selectedGroup || !selectedGrade) {
      showMessage("يرجى اختيار المرحلة والمجموعة أولاً", "error");
      return;
    }
    setSubmitting(true);
    try {
      const lockDate = lockAt
        ? new Date(lockAt)
        : new Date(Date.now() + 2 * 60 * 60 * 1000);
      const result = await startAttendanceSession({
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade),
        lock_at: lockDate.toISOString(),
      });
      if (result.success) {
        setSessionInfo(result.data);
        setSessionActive(true);
        setSessionLocked(false);
        setSessionId(result.data.id);
        setIsMakeupEnabled(result.data.is_makeup_enabled === 1);
        showMessage("تم بدء الجلسة بنجاح!", "success");
        requestAnimationFrame(() => barcodeInputRef.current?.focus());
      } else {
        showMessage(result.error || "حدث خطأ في بدء الجلسة", "error");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      showMessage("حدث خطأ في بدء الجلسة", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function endSession() {
    if (!sessionId || !selectedGroup) {
      showMessage("لا توجد جلسة نشطة", "error");
      return;
    }
    const confirmed = await new Promise((resolve) => {
      confirmToast(
        "هل أنت متأكد من إنهاء الجلسة؟ سيتم تسجيل الطلاب غير المسجلين كغائبين",
        () => resolve(true),
        "إنهاء",
      );
      setTimeout(() => resolve(false), 8500);
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const result = await lockAttendanceSession(
        sessionId,
        Number(selectedGroup),
      );
      if (result.success) {
        setSessionActive(false);
        setSessionLocked(true);
        showMessage("تم إنهاء الجلسة وتسجيل الغائبين", "success");
        await loadAttendanceRecords();
        await loadDashboard();
      } else {
        showMessage(result.error || "حدث خطأ في إنهاء الجلسة", "error");
      }
    } catch (error) {
      console.error("Error ending session:", error);
      showMessage("حدث خطأ في إنهاء الجلسة", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleMakeup() {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const result = await toggleMakeupMode(sessionId);
      if (result.success) {
        const enabled = result.data?.is_makeup_enabled === 1;
        setIsMakeupEnabled(enabled);
        showMessage(
          `تم ${enabled ? "تفعيل" : "إلغاء"} الحضور التعويضي`,
          "success",
        );
      } else {
        showMessage(result.error || "حدث خطأ", "error");
      }
    } catch (error) {
      console.error("Error toggling makeup:", error);
      showMessage("حدث خطأ في تبديل وضع الحضور التعويضي", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function markRestAbsent() {
    if (!selectedGroup) return;
    const confirmed = await new Promise((resolve) => {
      confirmToast(
        `سيتم تسجيل كل الطلاب غير المسجلين كغائبين بتاريخ ${selectedDate}`,
        () => resolve(true),
        "تأكيد",
      );
      setTimeout(() => resolve(false), 8500);
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const result = await markRestAsAbsent(Number(selectedGroup), selectedDate);
      if (result.success) {
        const count = Array.isArray(result.data) ? result.data.length : 0;
        showMessage(`تم تسجيل ${count} طالب كغائبين`, "success");
        await loadAttendanceRecords();
        await loadDashboard();
      } else {
        showMessage(result.error || "حدث خطأ في تسجيل الغياب", "error");
      }
    } catch (error) {
      console.error("Error marking rest absent:", error);
      showMessage("حدث خطأ في تسجيل الغياب", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBarcodeSubmit(e) {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    if (!sessionActive) {
      showMessage("الجلسة غير نشطة، يرجى بدء جلسة أولاً", "error");
      return;
    }

    setSubmitting(true);
    try {
      const result = await scanStudentBarcode({
        barcode: code,
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade),
        session_id: sessionId,
      });

      if (result.success) {
        const student = result.data.student;
        const attendance = result.data.attendance;

        setAttendanceRecords((prev) => ({ ...prev, [student.id]: attendance }));
        setStudents((prev) =>
          prev.find((s) => s.id === student.id) ? prev : [...prev, student],
        );
        showMessage(
          `${result.data.is_makeup === 1 ? "حضور تعويضي" : "تم تسجيل حضور"} ${student.full_name}`,
          "success",
        );
      } else {
        showMessage(result.error || "لم يتم العثور على الطالب", "error");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      showMessage("حدث خطأ في مسح الباركود", "error");
    } finally {
      setBarcode("");
      setSubmitting(false);
      requestAnimationFrame(() => barcodeInputRef.current?.focus());
    }
  }

  async function markStatus(student, status) {
    if (!selectedGroup) return;
    setSubmitting(true);
    try {
      const payload = {
        student_id: student.id,
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade || student.grade_id || 0),
        attendance_date: selectedDate,
        status,
        attendance_time: nowTimeValue(),
        method: "manual",
        is_makeup: status === "present" && isMakeupEnabled ? 1 : 0,
        makeup_group_id:
          status === "present" && isMakeupEnabled ? Number(selectedGroup) : null,
        notes: "",
      };

      const result = await createNewAttendance(payload);
      if (result.success) {
        setAttendanceRecords((prev) => ({
          ...prev,
          [student.id]: { ...(result.data || payload), student_id: student.id },
        }));
        showMessage(
          `تم تسجيل ${status === "present" ? "حضور" : "غياب"} ${student.full_name}`,
          "success",
        );
        fetchAttendanceSummary(selectedGroup, selectedDate).then(
          (r) => r.success && setServerSummary(r.data || null),
        );
      } else {
        showMessage(result.error || "حدث خطأ في تسجيل الحضور", "error");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      showMessage("حدث خطأ في تسجيل الحضور", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const markPresent = useCallback(
    (student) => markStatus(student, "present"),
    [selectedGroup, selectedGrade, selectedDate, isMakeupEnabled],
  );
  const markAbsent = useCallback(
    (student) => markStatus(student, "absent"),
    [selectedGroup, selectedGrade, selectedDate, isMakeupEnabled],
  );

  const openDetails = useCallback(async (record) => {
    if (!record?.id) return;
    setDetailsLoading(true);
    setDetailsRecord({ id: record.id });
    try {
      const res = await fetchAttendanceById(record.id);
      if (res.success) {
        setDetailsRecord(res.data);
        setEditForm({
          status: res.data?.status || "present",
          attendance_time: shortTime(res.data?.attendance_time),
          notes: res.data?.notes || "",
          is_makeup: res.data?.is_makeup === 1 ? 1 : 0,
        });
      } else {
        showMessage(res.error || "تعذر تحميل السجل", "error");
        setDetailsRecord(null);
      }
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  async function saveRecordEdit() {
    if (!detailsRecord?.id || !editForm) return;
    setSubmitting(true);
    try {
      const res = await updateAttendanceInfo(detailsRecord.id, {
        status: editForm.status,
        attendance_time: editForm.attendance_time,
        notes: editForm.notes,
        is_makeup: Number(editForm.is_makeup) || 0,
      });
      if (res.success) {
        showMessage("تم تحديث السجل بنجاح", "success");
        setDetailsRecord(null);
        setEditForm(null);
        await loadAttendanceRecords();
      } else {
        showMessage(res.error || "تعذر تحديث السجل", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const deleteRecord = useCallback(
    async (record, student) => {
      if (!record?.id) return;
      const confirmed = await new Promise((resolve) => {
        confirmToast(
          `حذف سجل حضور ${student?.full_name || ""}؟`,
          () => resolve(true),
          "حذف",
        );
        setTimeout(() => resolve(false), 8500);
      });
      if (!confirmed) return;

      setSubmitting(true);
      try {
        const res = await removeAttendance(record.id);
        if (res.success) {
          showMessage("تم حذف السجل", "success");
          setAttendanceRecords((prev) => {
            const next = { ...prev };
            delete next[record.student_id ?? student?.id];
            return next;
          });
          fetchAttendanceSummary(selectedGroup, selectedDate).then(
            (r) => r.success && setServerSummary(r.data || null),
          );
        } else {
          showMessage(res.error || "تعذر حذف السجل", "error");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [selectedGroup, selectedDate],
  );

  const filteredStudents = useMemo(() => {
    const list = [...students].sort(
      (a, b) => Number(a.barcode || 0) - Number(b.barcode || 0),
    );
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        String(s.barcode || "").toLowerCase().includes(q),
    );
  }, [students, search]);

  const localSummary = useMemo(() => {
    const values = Object.values(attendanceRecords);
    const present = values.filter((r) => r.status === "present").length;
    const absent = values.filter((r) => r.status === "absent").length;
    const total = students.length;
    return { total, present, absent, notMarked: Math.max(total - values.length, 0) };
  }, [attendanceRecords, students]);

  const summary = serverSummary
    ? {
        total: num(serverSummary.total_students) || localSummary.total,
        present: num(serverSummary.present_count),
        absent: num(serverSummary.absent_count),
        notMarked: num(serverSummary.not_marked_count),
      }
    : localSummary;

  const attendanceRate =
    summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;

  const groupsForSelectedGrade = selectedGrade
    ? groups.filter((g) => String(g.grade_id) === String(selectedGrade))
    : groups;

  const monthGrouped = useMemo(() => {
    const map = new Map();
    monthRecords.forEach((r) => {
      const day = toLocalDate(r.attendance_date);
      if (!map.has(day)) map.set(day, { day, present: 0, absent: 0, rows: [] });
      const entry = map.get(day);
      if (r.status === "present") entry.present += 1;
      else entry.absent += 1;
      entry.rows.push(r);
    });
    return [...map.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
  }, [monthRecords]);

  const todayLabel = new Date(selectedDate).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  const statCards = [
    { label: "إجمالي الطلاب", value: summary.total, icon: Users, cls: "bg-blue-100 text-blue-600" },
    { label: "حاضر", value: summary.present, icon: UserCheck, cls: "bg-green-100 text-green-600" },
    { label: "غائب", value: summary.absent, icon: UserX, cls: "bg-red-100 text-red-600" },
    { label: "غير مسجل", value: summary.notMarked, icon: AlertCircle, cls: "bg-gray-100 text-gray-600" },
    { label: "نسبة الحضور", value: `${attendanceRate}%`, icon: BarChart3, cls: "bg-amber-100 text-amber-600" },
  ];

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
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <CalendarCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                تسجيل الحضور والغياب
              </h1>
              <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                <span>{todayLabel}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span
                  className={`inline-flex items-center gap-1 ${sessionActive ? "text-green-600" : "text-gray-400"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${sessionActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                  ></span>
                  {sessionActive
                    ? "جلسة نشطة"
                    : sessionLocked
                      ? "جلسة مغلقة"
                      : "جلسة غير نشطة"}
                </span>
                {isMakeupEnabled && sessionActive && (
                  <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                    <RefreshCw size={12} />
                    تعويضي
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* إحصائيات اليوم العامة من الداشبورد */}
          {dashboard && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-white rounded-2xl shadow-lg border border-gray-100 text-sm"
            >
              <span className="text-xs text-gray-400">إحصائيات اليوم (كل المجموعات)</span>
              <span className="text-gray-600">
                الطلاب: <b className="text-gray-800">{num(dashboard.total_students)}</b>
              </span>
              <span className="text-green-600">
                حاضر: <b>{num(dashboard.present_today)}</b>
              </span>
              <span className="text-red-600">
                غائب: <b>{num(dashboard.absent_today)}</b>
              </span>
              <span className="text-gray-500">
                غير مسجل: <b>{num(dashboard.not_marked_today)}</b>
              </span>
            </motion.div>
          )}
        </div>

        {/* Stats للمجموعة المختارة */}
        {selectedGroup && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3"
          >
            {statCards.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className={`p-2 rounded-lg ${stat.cls.split(" ")[0]}`}>
                  <stat.icon size={16} className={stat.cls.split(" ")[1]} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1 space-y-4"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-xl">
                <Play size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">إعداد الجلسة</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  المرحلة الدراسية
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedGroup("");
                  }}
                  disabled={sessionActive}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all"
                >
                  <option value="">اختر المرحلة</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  المجموعة
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  disabled={sessionActive}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all"
                >
                  <option value="">اختر المجموعة</option>
                  {groupsForSelectedGrade.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  وقت قفل الجلسة (اختياري)
                </label>
                <input
                  type="datetime-local"
                  value={lockAt}
                  onChange={(e) => setLockAt(e.target.value)}
                  disabled={sessionActive}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  لو سيبته فاضي هيتقفل بعد ساعتين تلقائياً
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={startSession}
                  disabled={!selectedGroup || sessionActive || submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  <Play size={18} />
                  بدء الجلسة
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={endSession}
                  disabled={!sessionActive || submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-white font-medium hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/30 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none transition-all"
                >
                  <Square size={18} />
                  إنهاء الجلسة
                </motion.button>
              </div>

              {sessionActive && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={toggleMakeup}
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-white font-medium transition-all duration-300 ${
                    isMakeupEnabled
                      ? "bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/30"
                      : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-400/30"
                  } disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none`}
                >
                  <RefreshCw size={18} />
                  {isMakeupEnabled
                    ? "إلغاء الحضور التعويضي"
                    : "تفعيل الحضور التعويضي"}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={markRestAbsent}
                disabled={!selectedGroup || submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-3 text-white font-medium hover:bg-gray-900 transition-all disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <UserX size={18} />
                تسجيل الباقي غياب
              </motion.button>

              {sessionInfo && (
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600 space-y-1">
                  <p>
                    رقم الجلسة: <b className="font-mono">{sessionInfo.id}</b>
                  </p>
                  <p>
                    بدأت:{" "}
                    {new Date(sessionInfo.started_at).toLocaleString("ar-EG")}
                  </p>
                  {sessionInfo.lock_at && (
                    <p>
                      تقفل: {new Date(sessionInfo.lock_at).toLocaleString("ar-EG")}
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-semibold text-primary">تنبيهات الجلسة</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• ابدأ الجلسة لتسجيل الحضور بالباركود</li>
                      <li>• التسجيل اليدوي (حضور/غياب) شغال لأي تاريخ</li>
                      <li>• عند إنهاء الجلسة، يُسجل الباقي كغائبين</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* الطلاب ذوي الغياب المتتالي */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold text-gray-800">غياب متتالي (٣ أيام+)</h3>
            </div>
            {overview.consecutiveAbsences.length === 0 ? (
              <p className="text-sm text-gray-400">لا يوجد طلاب حالياً 👌</p>
            ) : (
              <ul className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                {overview.consecutiveAbsences.map((s, i) => (
                  <li
                    key={s.student_id || s.id || i}
                    className="flex items-center justify-between text-sm bg-red-50 rounded-xl px-3 py-2"
                  >
                    <span className="text-gray-800">{s.full_name || s.name}</span>
                    <span className="text-xs text-red-600 font-bold">
                      {s.consecutive_absences ?? s.absences ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-4"
        >
          {/* Barcode Scanner */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <ScanLine size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">تسجيل سريع بالباركود</h3>
                  <p className="text-xs text-gray-400">
                    امسح باركود الطالب لتسجيل الحضور
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  sessionActive
                    ? "bg-green-100 text-green-700"
                    : sessionLocked
                      ? "bg-gray-100 text-gray-500"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {sessionActive ? "جلسة مفتوحة" : sessionLocked ? "تم الإغلاق" : "غير نشطة"}
              </div>
            </div>

            <form onSubmit={handleBarcodeSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <ScanLine
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  ref={barcodeInputRef}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  disabled={!sessionActive || submitting}
                  placeholder="امسح الباركود أو اكتبه يدوياً"
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pr-12 pl-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all"
                  dir="ltr"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!sessionActive || submitting}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {submitting ? "جاري..." : "تسجيل"}
              </motion.button>
            </form>
          </motion.div>

          {/* Tabs + filters */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {[
                { id: "day", label: "حضور اليوم", icon: CalendarCheck },
                { id: "month", label: "سجل الشهر", icon: CalendarDays },
                { id: "stats", label: "الإحصائيات", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "day" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={!selectedGroup}
                    placeholder="ابحث بالاسم أو الباركود..."
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pr-12 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 transition-all"
                  />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            )}

            {activeTab === "month" && (
              <div className="flex flex-wrap gap-3">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={loadMonth}
                  disabled={!selectedGroup || monthLoading}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-all"
                >
                  <RefreshCw size={16} className={monthLoading ? "animate-spin" : ""} />
                  تحديث
                </button>
              </div>
            )}
          </motion.div>

          {/* المحتوى */}
          {activeTab === "day" && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    قائمة الطلاب
                    {selectedGroup && (
                      <span className="text-sm font-normal text-gray-500">
                        -{" "}
                        {groups.find((g) => String(g.id) === String(selectedGroup))?.name}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      الكل: {summary.total}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      حاضر: {summary.present}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      غائب: {summary.absent}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[460px] overflow-y-auto custom-scrollbar">
                {!selectedGroup ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users size={32} className="mx-auto text-gray-300 mb-2" />
                    <p>اختر المجموعة أولاً لعرض الطلاب</p>
                  </div>
                ) : loading ? (
                  <div className="p-6 space-y-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users size={32} className="mx-auto text-gray-300 mb-2" />
                    <p>
                      {search ? "لا يوجد طلاب مطابقين للبحث" : "لا يوجد طلاب في هذه المجموعة"}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-right min-w-[720px]">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-600">الاسم</th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-600">الباركود ↓</th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-600">الحالة</th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-600">الوقت</th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-600">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <AnimatePresence>
                        {filteredStudents.map((student, index) => (
                          <AttendanceRow
                            key={student.id || index}
                            student={student}
                            index={index}
                            record={attendanceRecords[student.id]}
                            canEdit={canEdit || true}
                            isLoading={submitting}
                            onMarkPresent={markPresent}
                            onMarkAbsent={markAbsent}
                            onDetails={openDetails}
                            onDelete={deleteRecord}
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "month" && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-2">
                <ClipboardList size={18} className="text-primary" />
                <h3 className="font-bold text-gray-800">
                  سجل الحضور - {selectedMonth}
                </h3>
              </div>
              <div className="max-h-[520px] overflow-y-auto custom-scrollbar p-4 space-y-3">
                {!selectedGroup ? (
                  <p className="text-center text-gray-400 py-10">اختر المجموعة أولاً</p>
                ) : monthLoading ? (
                  [0, 1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                  ))
                ) : monthGrouped.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">لا توجد سجلات في هذا الشهر</p>
                ) : (
                  monthGrouped.map((day) => (
                    <div
                      key={day.day}
                      className="rounded-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 px-4 py-2.5">
                        <span className="font-medium text-gray-800">
                          {new Date(day.day).toLocaleDateString("ar-EG", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                        <span className="flex gap-3 text-xs">
                          <span className="text-green-600">حاضر: {day.present}</span>
                          <span className="text-red-600">غائب: {day.absent}</span>
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-50">
                        {day.rows.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center justify-between px-4 py-2 text-sm"
                          >
                            <span className="text-gray-700">{r.full_name}</span>
                            <span className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">
                                {formatTimeLabel(r.attendance_time)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  r.status === "present"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {r.status === "present" ? "حاضر" : "غائب"}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  <h3 className="font-bold text-gray-800">إحصائيات عامة (كل المراحل)</h3>
                </div>
                <StatsTable rows={overview.overall} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" />
                  <h3 className="font-bold text-gray-800">
                    إحصائيات المرحلة{" "}
                    {selectedGrade
                      ? `- ${grades.find((g) => String(g.id) === String(selectedGrade))?.name || ""}`
                      : ""}
                  </h3>
                </div>
                {selectedGrade ? (
                  <StatsTable rows={gradeStats} />
                ) : (
                  <p className="text-center text-gray-400 py-8">اختر المرحلة أولاً</p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* مودال تفاصيل / تعديل السجل */}
      <AnimatePresence>
        {detailsRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => {
              setDetailsRecord(null);
              setEditForm(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Pencil size={18} className="text-primary" />
                  تفاصيل سجل الحضور
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsRecord(null);
                    setEditForm(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>

              {detailsLoading || !editForm ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-xl p-3">
                    <p>
                      الطالب: <b className="text-gray-800">{detailsRecord.full_name}</b>
                    </p>
                    <p>المجموعة: {detailsRecord.group_name || "-"}</p>
                    <p>
                      التاريخ: {toLocalDate(detailsRecord.attendance_date)} • الطريقة:{" "}
                      {detailsRecord.method === "barcode" ? "باركود" : "يدوي"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">الحالة</label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, status: e.target.value }))
                        }
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="present">حاضر</option>
                        <option value="absent">غائب</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">الوقت</label>
                      <input
                        type="time"
                        value={editForm.attendance_time}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, attendance_time: e.target.value }))
                        }
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editForm.is_makeup === 1}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, is_makeup: e.target.checked ? 1 : 0 }))
                      }
                      className="w-4 h-4 accent-amber-500"
                    />
                    حضور تعويضي
                  </label>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ملاحظات</label>
                    <textarea
                      rows={2}
                      value={editForm.notes}
                      onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={saveRecordEdit}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 disabled:bg-gray-300 transition-all"
                  >
                    {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

/* جدول الإحصائيات الشهرية */
const StatsTable = ({ rows }) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="text-center text-gray-400 py-8">لا توجد بيانات</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right min-w-[560px]">
        <thead className="bg-gray-50">
          <tr>
            {["الشهر", "أيام", "سجلات", "حاضر", "غائب", "النسبة"].map((h) => (
              <th key={h} className="px-4 py-3 text-sm font-semibold text-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={r.month || i} className="hover:bg-blue-50/40 text-sm">
              <td className="px-4 py-3 font-medium text-gray-800">{r.month}</td>
              <td className="px-4 py-3 text-gray-600">{num(r.total_days)}</td>
              <td className="px-4 py-3 text-gray-600">{num(r.total_records)}</td>
              <td className="px-4 py-3 text-green-600 font-medium">{num(r.present_count)}</td>
              <td className="px-4 py-3 text-red-600 font-medium">{num(r.absent_count)}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <span className="w-20 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <span
                      className="block h-full bg-primary"
                      style={{ width: `${Math.min(num(r.attendance_percentage), 100)}%` }}
                    />
                  </span>
                  <b className="text-gray-700">{num(r.attendance_percentage)}%</b>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
