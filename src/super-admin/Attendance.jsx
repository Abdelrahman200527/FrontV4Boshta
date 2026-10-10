import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck2,
  ScanLine,
  AlertTriangle,
  Play,
  Lock,
  Phone,
  MessageSquare,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Volume2,
  VolumeX,
  History,
  ShieldAlert,
} from "lucide-react";
import {
  getAllGroups,
  getAllGrades,
  startAttendanceSession,
  getActiveAttendanceSession,
  scanAttendanceBarcode,
  toggleAttendanceMakeupMode,
  lockAttendanceSession,
  getStudentsWithThreeConsecutiveAbsences,
  getGroupAttendanceByDate,
} from "../api/super-admin/services";
import { toast } from "sonner";

// Web Audio synthesizer for scanner beeps
const playAudioFeedback = (type = "success") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "success") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      // Warning buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Audio context may be restricted by browser policy
  }
};

export default function SuperAdminAttendance() {
  const [activeTab, setActiveTab] = useState("scanner"); // "scanner" | "risk" | "history"

  // Groups and Grades
  const [groups, setGroups] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Scanner State
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeSession, setActiveSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lastScannedStudent, setLastScannedStudent] = useState(null);
  const [scannedStudentsList, setScannedStudentsList] = useState([]);
  const [isMakeupMode, setIsMakeupMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const barcodeInputRef = useRef(null);

  // Risk Tab (3 consecutive absences)
  const [riskStudents, setRiskStudents] = useState([]);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [riskSearch, setRiskSearch] = useState("");

  // History Tab
  const [historyGroupId, setHistoryGroupId] = useState("");
  const [historyDate, setHistoryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Initial Fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingInitial(true);
        const [groupsRes, gradesRes] = await Promise.all([
          getAllGroups(),
          getAllGrades(),
        ]);
        const grpList = Array.isArray(groupsRes)
          ? groupsRes
          : groupsRes?.groups || groupsRes?.data || [];
        const grdList = Array.isArray(gradesRes)
          ? gradesRes
          : gradesRes?.grades || gradesRes?.data || [];

        setGroups(grpList);
        setGrades(grdList);

        if (grpList.length > 0) {
          setSelectedGroupId(String(grpList[0].id));
          setHistoryGroupId(String(grpList[0].id));
        }
      } catch (err) {
        console.error(err);
        toast.error("حدث خطأ أثناء تحميل المجموعات والصفوف");
      } finally {
        setLoadingInitial(false);
      }
    };
    init();
  }, []);

  // Check Active Session when Group changes
  const checkSession = async (groupId) => {
    if (!groupId) return;
    try {
      setSessionLoading(true);
      const res = await getActiveAttendanceSession(groupId);
      const session = res?.session || res?.data || null;
      setActiveSession(session);
      if (session) {
        setIsMakeupMode(Boolean(session.is_makeup));
      }
    } catch (err) {
      setActiveSession(null);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId && activeTab === "scanner") {
      checkSession(selectedGroupId);
    }
  }, [selectedGroupId, activeTab]);

  // Keep input focused during scanner tab
  useEffect(() => {
    if (activeTab === "scanner" && activeSession) {
      barcodeInputRef.current?.focus();
    }
  }, [activeTab, activeSession, scannedStudentsList]);

  // Handle Start Session
  const handleStartSession = async () => {
    if (!selectedGroupId) {
      toast.error("يرجى اختيار المجموعة أولاً");
      return;
    }
    const currentGroup = groups.find((g) => String(g.id) === String(selectedGroupId));
    const gradeId = currentGroup?.grade_id || (grades[0] && grades[0].id);
    if (!gradeId) {
      toast.error("يرجى التأكد من ربط المجموعة بصف دراسي");
      return;
    }
    try {
      setSessionLoading(true);
      const res = await startAttendanceSession(selectedGroupId, gradeId);
      toast.success("تم بدء جلسة الحضور بنجاح");
      const session = res?.session || res?.data || { id: res?.id || 1, group_id: selectedGroupId, grade_id: gradeId };
      setActiveSession(session);
      setScannedStudentsList([]);
      setLastScannedStudent(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "فشل بدء جلسة الحضور");
    } finally {
      setSessionLoading(false);
    }
  };

  // Handle Lock Session
  const handleLockSession = async () => {
    if (!selectedGroupId || !activeSession?.id) {
      toast.error("لا توجد جلسة نشطة لإغلاقها");
      return;
    }
    try {
      setSessionLoading(true);
      await lockAttendanceSession(activeSession.id, selectedGroupId);
      toast.success(
        "تم إغلاق الجلسة وترحيل غير الحاضرين كـ 'غائب' بنجاح"
      );
      setActiveSession(null);
      setLastScannedStudent(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || "فشل إغلاق الجلسة");
    } finally {
      setSessionLoading(false);
    }
  };

  // Handle Toggle Makeup
  const handleToggleMakeup = async () => {
    if (!activeSession?.id) return;
    try {
      await toggleAttendanceMakeupMode(activeSession.id);
      setIsMakeupMode(!isMakeupMode);
      toast.info(
        !isMakeupMode
          ? "تم تفعيل وضع الحصة التعويضية"
          : "تم إلغاء وضع الحصة التعويضية"
      );
    } catch (err) {
      toast.error("فشل تغيير وضع التعويض");
    }
  };

  // Handle Barcode Scan Submit
  const handleScanSubmit = async (e) => {
    e.preventDefault();
    const barcode = barcodeInput.trim();
    if (!barcode || !selectedGroupId) return;

    const currentGroup = groups.find((g) => String(g.id) === String(selectedGroupId));
    const gradeId = currentGroup?.grade_id || activeSession?.grade_id || (grades[0] && grades[0].id);

    try {
      const res = await scanAttendanceBarcode(barcode, selectedGroupId, gradeId);
      const studentData = res?.student || res?.data || {
        barcode,
        full_name: res?.full_name || "طالب مسجل",
        status: isMakeupMode ? "makeup" : "present",
        time: new Date().toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setLastScannedStudent({
        ...studentData,
        status: isMakeupMode ? "makeup" : "present",
        time: new Date().toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      setScannedStudentsList((prev) => [
        {
          ...studentData,
          status: isMakeupMode ? "makeup" : "present",
          time: new Date().toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev.filter((s) => s.barcode !== barcode),
      ]);

      if (soundEnabled) playAudioFeedback("success");
      toast.success(`تم تسجيل حضور: ${studentData.full_name || barcode}`);
    } catch (err) {
      console.error(err);
      if (soundEnabled) playAudioFeedback("error");
      toast.error(err?.message || "فشل تسجيل الباركود");
    } finally {
      setBarcodeInput("");
      barcodeInputRef.current?.focus();
    }
  };

  // Fetch Risk Students
  const fetchRiskStudents = async () => {
    try {
      setLoadingRisk(true);
      const res = await getStudentsWithThreeConsecutiveAbsences();
      const list = Array.isArray(res) ? res : res?.students || res?.data || [];
      setRiskStudents(list);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل قائمة الغياب المتتالي");
    } finally {
      setLoadingRisk(false);
    }
  };

  useEffect(() => {
    if (activeTab === "risk") {
      fetchRiskStudents();
    }
  }, [activeTab]);

  // Fetch History
  const fetchHistory = async () => {
    if (!historyGroupId || !historyDate) return;
    try {
      setLoadingHistory(true);
      const res = await getGroupAttendanceByDate(historyGroupId, historyDate);
      const list = Array.isArray(res) ? res : res?.records || res?.data || [];
      setHistoryRecords(list);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحميل سجل حضور الحصة");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history" && historyGroupId) {
      fetchHistory();
    }
  }, [activeTab, historyGroupId, historyDate]);

  const selectedGroup = groups.find(
    (g) => String(g.id) === String(selectedGroupId)
  );

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#1a5d1a]/10 text-[#1a5d1a] p-2 rounded-xl">
              <CalendarCheck2 size={22} />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">
              إدارة الحضور والغياب وجلسات الباركود
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-normal">
            مسح الباركود الحي بالسنتر، وضع التعويض، إنهاء وترحيل الغياب، وقائمة الخطر
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "scanner"
                ? "bg-white text-[#1a5d1a] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ScanLine size={16} />
            شاشة المسح المباشر
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "risk"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ShieldAlert size={16} />
            قائمة خطر الـ 3 غيابات
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "history"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <History size={16} />
            كشف حضور الحصص السابقة
          </button>
        </div>
      </div>

      {/* TAB 1: SCANNER */}
      {activeTab === "scanner" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                المجموعة المستهدفة *
              </label>
              <select
                disabled={Boolean(activeSession)}
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a] disabled:bg-gray-100"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.grade_name || "صف عام"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                تاريخ الحصة *
              </label>
              <input
                disabled={Boolean(activeSession)}
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a] disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                حالة جلسة الحضور
              </label>
              <div className="flex items-center gap-2 py-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    activeSession ? "bg-emerald-500 animate-ping" : "bg-gray-300"
                  }`}
                />
                <span className="text-xs font-medium text-gray-700">
                  {activeSession ? "جلسة نشطة ومفتوحة" : "لا توجد جلسة نشطة"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!activeSession ? (
                <button
                  onClick={handleStartSession}
                  disabled={sessionLoading || !selectedGroupId}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1a5d1a] hover:bg-[#154a15] text-white py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  <Play size={16} />
                  بدء جلسة الحضور
                </button>
              ) : (
                <button
                  onClick={handleLockSession}
                  disabled={sessionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  <Lock size={16} />
                  إغلاق وترحيل الغائبين
                </button>
              )}
            </div>
          </div>

          {/* Active Scanner Box */}
          {activeSession && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#1a5d1a] shadow-sm">
                    <ScanLine size={26} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">
                      جلسة مسح الباركود قيد التشغيل
                    </h3>
                    <p className="text-xs text-emerald-700 font-normal">
                      المجموعة: {selectedGroup?.name} • التاريخ: {attendanceDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Makeup mode toggle button */}
                  <button
                    onClick={handleToggleMakeup}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      isMakeupMode
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {isMakeupMode
                      ? "وضع الحصة التعويضية: مفعّل"
                      : "تفعيل وضع الحصة التعويضية"}
                  </button>

                  {/* Sound mute button */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900"
                    title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                  >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                </div>
              </div>

              {/* Barcode Form */}
              <form onSubmit={handleScanSubmit} className="max-w-xl mx-auto mb-6">
                <div className="relative">
                  <ScanLine
                    size={22}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600"
                  />
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    autoFocus
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="امسح باركود الطالب أو اكتبه هنا واضغط Enter..."
                    className="w-full pr-12 pl-24 py-4 rounded-2xl border-2 border-emerald-400 bg-white text-gray-900 text-base font-medium shadow-lg focus:outline-none focus:border-[#1a5d1a]"
                  />
                  <button
                    type="submit"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-[#1a5d1a] hover:bg-[#154a15] text-white px-5 py-2.5 rounded-xl font-medium text-xs shadow-sm transition-all"
                  >
                    تسجيل
                  </button>
                </div>
              </form>

              {/* Last Scanned Banner */}
              <AnimatePresence>
                {lastScannedStudent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-md flex items-center justify-between max-w-xl mx-auto"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-medium">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {lastScannedStudent.full_name || "طالب مسجل"}
                        </h4>
                        <span className="text-xs text-gray-500 font-normal">
                          باركود: {lastScannedStudent.barcode}
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          lastScannedStudent.status === "makeup"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {lastScannedStudent.status === "makeup"
                          ? "حصة تعويضية"
                          : "حاضر"}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-1 font-mono">
                        {lastScannedStudent.time}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Live Attendance List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  سجل الحاضرين في هذه الجلسة
                </h3>
                <p className="text-xs text-gray-500 font-normal">
                  إجمالي الطلاب الذين تم مسحهم: {scannedStudentsList.length}
                </p>
              </div>
            </div>

            {scannedStudentsList.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm font-normal">
                لم يتم تسجيل أي حضور حتى الآن في هذه الجلسة
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-3.5 font-medium">#</th>
                      <th className="p-3.5 font-medium">اسم الطالب</th>
                      <th className="p-3.5 font-medium">الباركود</th>
                      <th className="p-3.5 font-medium">حالة الحضور</th>
                      <th className="p-3.5 font-medium">وقت المسح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {scannedStudentsList.map((st, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3.5 text-gray-400">{idx + 1}</td>
                        <td className="p-3.5 font-semibold text-gray-900">
                          {st.full_name}
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">
                          {st.barcode}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full font-medium ${
                              st.status === "makeup"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {st.status === "makeup" ? "تعويض" : "حاضر"}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-500 font-normal">{st.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONSECUTIVE 3 ABSENCES RISK */}
      {activeTab === "risk" && (
        <div className="space-y-6">
          <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
            <div className="p-2 bg-red-100 text-red-700 rounded-xl">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-950 mb-0.5">
                كشف الرقابة على الطلاب المعرضين للخطر (3 غيابات متتالية)
              </h3>
              <p className="text-xs text-red-700 font-normal">
                هؤلاء الطلاب تغيبوا عن آخر 3 حصص متتالية دون عذر مسبق. يُرجى
                التواصل المباشر مع أولياء أمورهم هاتفياً أو عبر واتساب لمتابعة
                الأسباب وتجنب الفصل.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={riskSearch}
                onChange={(e) => setRiskSearch(e.target.value)}
                placeholder="البحث باسم الطالب أو رقم الهاتف أو الباركود..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
              />
            </div>
            <button
              onClick={fetchRiskStudents}
              className="p-2.5 text-gray-600 hover:text-[#1a5d1a] border border-gray-200 rounded-xl"
              title="تحديث القائمة"
            >
              <RefreshCw
                size={18}
                className={loadingRisk ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loadingRisk ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">جاري فحص سجلات الغياب...</p>
              </div>
            ) : riskStudents.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm font-normal">
                ممتاز! لا يوجد أي طلاب لديهم 3 غيابات متتالية حالياً.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-3.5 font-medium">#</th>
                      <th className="p-3.5 font-medium">اسم الطالب</th>
                      <th className="p-3.5 font-medium">الباركود</th>
                      <th className="p-3.5 font-medium">الصف والمجموعة</th>
                      <th className="p-3.5 text-center font-medium">عدد الغيابات المتتالية</th>
                      <th className="p-3.5 font-medium">هاتف الطالب</th>
                      <th className="p-3.5 font-medium">هاتف ولي الأمر</th>
                      <th className="p-3.5 text-center font-medium">إجراء فوري</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {riskStudents
                      .filter(
                        (st) =>
                          (st.full_name || "")
                            .toLowerCase()
                            .includes(riskSearch.toLowerCase()) ||
                          (st.barcode || "")
                            .toLowerCase()
                            .includes(riskSearch.toLowerCase()) ||
                          (st.parent_phone || "").includes(riskSearch)
                      )
                      .map((st, idx) => (
                        <tr key={idx} className="hover:bg-red-50/30">
                          <td className="p-3.5 text-gray-400">{idx + 1}</td>
                          <td className="p-3.5 font-semibold text-gray-900">
                            {st.full_name}
                          </td>
                          <td className="p-3.5 font-mono text-gray-600">
                            {st.barcode}
                          </td>
                          <td className="p-3.5">
                            <span className="block text-gray-800 font-medium">
                              {st.grade_name || "--"}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {st.group_name || "--"}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                              {st.consecutive_absences || 3} غيابات
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-gray-600">
                            {st.phone || "--"}
                          </td>
                          <td className="p-3.5 font-mono text-gray-900 font-semibold">
                            {st.parent_phone || "--"}
                          </td>
                          <td className="p-3.5 text-center">
                            {st.parent_phone ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <a
                                  href={`https://wa.me/2${st.parent_phone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                                  title="مراسلة ولي الأمر عبر واتساب"
                                >
                                  <MessageSquare size={16} />
                                </a>
                                <a
                                  href={`tel:${st.parent_phone}`}
                                  className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="الاتصال بولي الأمر"
                                >
                                  <Phone size={16} />
                                </a>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[11px]">
                                لا يوجد رقم
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                المجموعة
              </label>
              <select
                value={historyGroupId}
                onChange={(e) => setHistoryGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.grade_name || "صف عام"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                تاريخ الحصة
              </label>
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a5d1a]"
              />
            </div>

            <button
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="bg-[#1a5d1a] hover:bg-[#154a15] text-white py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw
                size={16}
                className={loadingHistory ? "animate-spin" : ""}
              />
              عرض تقرير الحضور
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-[#1a5d1a] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">جاري تحميل السجل...</p>
              </div>
            ) : historyRecords.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm font-normal">
                لا توجد سجلات حضور مسجلة لهذه المجموعة في هذا التاريخ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-3.5 font-medium">#</th>
                      <th className="p-3.5 font-medium">اسم الطالب</th>
                      <th className="p-3.5 font-medium">الباركود</th>
                      <th className="p-3.5 font-medium">الحالة</th>
                      <th className="p-3.5 font-medium">وقت الحضور</th>
                      <th className="p-3.5 font-medium">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {historyRecords.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3.5 text-gray-400">{idx + 1}</td>
                        <td className="p-3.5 font-semibold text-gray-900">
                          {rec.student_name || rec.full_name}
                        </td>
                        <td className="p-3.5 font-mono text-gray-600">
                          {rec.barcode}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full font-medium ${
                              rec.status === "present"
                                ? "bg-emerald-50 text-emerald-700"
                                : rec.status === "makeup"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {rec.status === "present"
                              ? "حاضر"
                              : rec.status === "makeup"
                              ? "تعويض"
                              : "غائب"}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-500 font-normal">
                          {rec.attendance_time || "--:--"}
                        </td>
                        <td className="p-3.5 text-gray-400 font-normal">
                          {rec.notes || "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
