import React, { useEffect, useState, useCallback, useMemo } from "react";
import Accent from "../assets/Accent.svg";
import { notifySuccess } from "../lib/notify";
import {
  CalendarCheck2,
  BarChart3,
  Wallet,
  FileCheck2,
  BookOpen,
  Sun,
  Moon,
  Sunset,
  Play,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Clock,
  GraduationCap,
  Loader2,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  MapPin,
  Sparkles,
  ClipboardList,
  Award,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  fetchStudentDashboard,
  fetchStudentProfile,
  fetchStudentStats,
  fetchAvailableExams,
  fetchPlaylists,
  fetchPaymentHistory,
  fetchAttendanceHistory,
  fetchExamHistory,
  fetchPaperExams,
  fetchConsecutiveAbsences,
  fetchAssignments,
} from "../api/student/actions";
import { formatTime12, formatDateTime12 } from "../utils/timeFormat";
import getUser from "../utils/getUser";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const toNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [allExams, setAllExams] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [paperExams, setPaperExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [consecutiveAbsences, setConsecutiveAbsences] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingTab, setUpcomingTab] = useState("exams");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        dashRes,
        profileRes,
        statsRes,
        examsRes,
        playlistsRes,
        paymentsRes,
        attendanceRes,
        examHistoryRes,
        paperExamsRes,
        assignmentsRes,
        consecutiveRes,
      ] = await Promise.all([
        fetchStudentDashboard(),
        fetchStudentProfile(),
        fetchStudentStats(),
        fetchAvailableExams(),
        fetchPlaylists(),
        fetchPaymentHistory(),
        fetchAttendanceHistory(),
        fetchExamHistory(),
        fetchPaperExams(),
        fetchAssignments(),
        fetchConsecutiveAbsences(),
      ]);

      if (dashRes.success) setDashboardData(dashRes.data || null);
      if (profileRes.success) setProfile(profileRes.data || null);
      if (statsRes.success) setStats(statsRes.data || null);
      if (examsRes.success) setAllExams(examsRes.data || []);
      if (playlistsRes.success) setPlaylists(playlistsRes.data || []);
      if (assignmentsRes.success) setAssignments(assignmentsRes.data || []);

      if (paymentsRes.success) {
        const sortedPayments = [...(paymentsRes.data || [])].sort(
          (a, b) =>
            new Date(b.payment_date || b.created_at) -
            new Date(a.payment_date || a.created_at),
        );
        setPaymentHistory(sortedPayments);
      }

      if (attendanceRes.success) {
        const sortedAttendance = [...(attendanceRes.data || [])].sort(
          (a, b) => new Date(b.attendance_date) - new Date(a.attendance_date),
        );
        setAttendanceHistory(sortedAttendance);
      }

      if (examHistoryRes.success) {
        const sortedExamHistory = [...(examHistoryRes.data || [])].sort(
          (a, b) =>
            new Date(b.submitted_at || b.created_at) -
            new Date(a.submitted_at || a.created_at),
        );
        setExamHistory(sortedExamHistory);
      }

      if (paperExamsRes.success) {
        const sortedPaperExams = [...(paperExamsRes.data || [])].sort(
          (a, b) =>
            new Date(b.exam_date || b.created_at) -
            new Date(a.exam_date || a.created_at),
        );
        setPaperExams(sortedPaperExams);
      }

      if (consecutiveRes.success) {
        setConsecutiveAbsences(consecutiveRes.data || null);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    notifySuccess("تم تحديث البيانات بنجاح");
  };

  // Exam currently active and ready to take right now
  const availableExams = useMemo(() => {
    const now = Date.now();
    return allExams.filter((exam) => {
      const startTime = new Date(exam.start_at).getTime();
      const endTime = new Date(exam.end_at).getTime();
      return now >= startTime && now <= endTime && !exam.attempted;
    });
  }, [allExams]);

  const liveExam = availableExams[0] || null;

  // Student info & Group info from dashboardData with profile fallback
  const studentInfo = {
    ...profile,
    ...dashboardData?.student_info,
  };
  const groupInfo = dashboardData?.group_info || null;

  // Key calculated numbers
  const attendanceSummary = dashboardData?.attendance_summary;
  const attendanceRate =
    attendanceSummary?.attendance_percentage != null
      ? toNumber(attendanceSummary.attendance_percentage)
      : toNumber(stats?.attendance_percentage);

  const presentDays =
    attendanceSummary?.present_days != null
      ? toNumber(attendanceSummary.present_days)
      : toNumber(stats?.present_days);

  const absentDays =
    attendanceSummary?.absent_days != null
      ? toNumber(attendanceSummary.absent_days)
      : toNumber(stats?.absent_days);

  const totalDays =
    attendanceSummary?.total_days != null
      ? toNumber(attendanceSummary.total_days)
      : presentDays + absentDays;

  // Unified completed exams (both online and paper)
  const allCompletedExams = useMemo(() => {
    const online = (examHistory || [])
      .filter((e) => e.score !== null && e.score !== undefined)
      .map((e) => {
        const score = toNumber(e.score);
        const fullMark = toNumber(e.full_mark);
        const percentage =
          e.percentage != null
            ? Math.round(toNumber(e.percentage))
            : fullMark > 0
              ? Math.round((score / fullMark) * 100)
              : 0;
        return {
          id: `online-${e.attempt_id || e.id}`,
          title: e.exam_title || "امتحان إلكتروني",
          type: "online",
          score,
          full_mark: fullMark,
          percentage,
          date: e.submitted_at || e.created_at,
        };
      });

    const paper = (paperExams || [])
      .filter((e) => e.student_degree !== null && e.student_degree !== undefined)
      .map((e) => {
        const score = toNumber(e.student_degree);
        const fullMark = toNumber(e.total_degree);
        const percentage =
          e.percentage != null
            ? Math.round(toNumber(e.percentage))
            : fullMark > 0
              ? Math.round((score / fullMark) * 100)
              : 0;
        return {
          id: `paper-${e.exam_id || e.id}`,
          title: e.exam_title || e.title || "امتحان ورقي",
          type: "paper",
          score,
          full_mark: fullMark,
          percentage,
          date: e.exam_date || e.created_at,
        };
      });

    return [...online, ...paper].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
    );
  }, [examHistory, paperExams]);

  const examsSummary = dashboardData?.exams_summary;
  const paperExamsTaken =
    examsSummary?.paper_exams_taken != null
      ? toNumber(examsSummary.paper_exams_taken)
      : (paperExams || []).filter((e) => e.student_degree !== null).length;

  const onlineExamsTaken =
    examsSummary?.online_exams_taken != null
      ? toNumber(examsSummary.online_exams_taken)
      : (examHistory || []).filter((e) => e.score !== null).length;

  const totalExamsTaken =
    allCompletedExams.length > 0
      ? allCompletedExams.length
      : paperExamsTaken + onlineExamsTaken;

  const avgScore = useMemo(() => {
    // 1. If we have actual completed exams, calculate exact average percentage
    if (allCompletedExams.length > 0) {
      const sum = allCompletedExams.reduce((acc, e) => acc + e.percentage, 0);
      return Math.round(sum / allCompletedExams.length);
    }

    // 2. Fallback to examsSummary or stats if exam lists haven't populated yet
    const paperAvg =
      examsSummary?.paper_exams_avg != null
        ? toNumber(examsSummary.paper_exams_avg)
        : toNumber(stats?.avg_paper_degree);

    const onlineAvg =
      examsSummary?.online_exams_avg != null
        ? toNumber(examsSummary.online_exams_avg)
        : toNumber(stats?.avg_online_score);

    const paperCount = toNumber(examsSummary?.paper_exams_taken) || 0;
    const onlineCount = toNumber(examsSummary?.online_exams_taken) || 0;

    if (paperCount > 0 && onlineCount > 0) {
      return Math.round((paperAvg + onlineAvg) / 2);
    }
    if (onlineCount > 0 || onlineAvg > 0) {
      return Math.round(onlineAvg);
    }
    if (paperCount > 0 || paperAvg > 0) {
      return Math.round(paperAvg);
    }
    return 0;
  }, [allCompletedExams, examsSummary, stats]);

  const pendingAssignmentsCount =
    dashboardData?.pending_assignments_count != null
      ? dashboardData.pending_assignments_count
      : (assignments || []).filter(
          (a) =>
            !a.is_closed &&
            a.assignment_status !== "submitted" &&
            a.assignment_status !== "graded" &&
            new Date(a.deadline).getTime() > Date.now(),
        ).length;

  const submittedAssignmentsCount =
    dashboardData?.exams_summary?.assignments_submitted != null
      ? dashboardData.exams_summary.assignments_submitted
      : (assignments || []).filter(
          (a) =>
            a.assignment_status === "submitted" ||
            a.assignment_status === "graded",
        ).length;

  const totalVideos = useMemo(
    () => playlists.reduce((sum, p) => sum + toNumber(p.videos_count), 0),
    [playlists],
  );

  const lastPayment = paymentHistory[0] || null;
  const lastAbsence =
    attendanceHistory.find((a) => a.status === "absent") || null;
  const lastExam = allCompletedExams[0] || null;

  // Upcoming items with reliable fallback
  const upcomingExams = useMemo(() => {
    if (dashboardData?.upcoming_exams && dashboardData.upcoming_exams.length > 0) {
      return dashboardData.upcoming_exams;
    }
    const now = Date.now();
    const upcomingOnline = (allExams || [])
      .filter((e) => new Date(e.start_at).getTime() > now && !e.attempted)
      .map((e) => ({
        id: e.exam_id || e.id,
        title: e.title || e.exam_title,
        start_at: e.start_at,
        full_mark: e.full_mark,
        exam_type: "online",
      }));
    const upcomingPaper = (paperExams || [])
      .filter(
        (e) =>
          e.student_degree == null &&
          new Date(e.exam_date).getTime() >= new Date().setHours(0, 0, 0, 0),
      )
      .map((e) => ({
        id: e.exam_id || e.id,
        title: e.title || e.exam_title,
        exam_date: e.exam_date,
        full_mark: e.total_degree,
        exam_type: "paper",
      }));
    return [...upcomingOnline, ...upcomingPaper].sort((a, b) => {
      const dateA = new Date(a.start_at || a.exam_date);
      const dateB = new Date(b.start_at || b.exam_date);
      return dateA - dateB;
    });
  }, [dashboardData, allExams, paperExams]);

  const upcomingAssignments = useMemo(() => {
    if (
      dashboardData?.upcoming_assignments &&
      dashboardData.upcoming_assignments.length > 0
    ) {
      return dashboardData.upcoming_assignments;
    }
    const now = Date.now();
    return (assignments || [])
      .filter((a) => !a.is_closed && new Date(a.deadline).getTime() > now)
      .map((a) => ({
        id: a.assignment_id || a.id,
        title: a.title,
        full_mark: a.full_mark,
        deadline: a.deadline,
        status: a.assignment_status === "submitted" ? "submitted" : "pending",
      }))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  }, [dashboardData, assignments]);

  // Urgent assignment with deadline coming up
  const nearestPendingAssignment = useMemo(() => {
    return upcomingAssignments.find((a) => a.status === "pending") || null;
  }, [upcomingAssignments]);

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "صباح الخير", icon: Sun };
    if (hour >= 12 && hour < 17) return { text: "مساء الخير", icon: Sunset };
    return { text: "مساء النور", icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Attendance pie chart data
  const attendancePieData = useMemo(
    () => [
      { name: "حضور", value: presentDays },
      { name: "غياب", value: absentDays },
    ],
    [presentDays, absentDays],
  );

  const COLORS = ["#009966", "#ef4444"];

  // Exam scores trend data (chronological from oldest to newest)
  const examScoresData = useMemo(() => {
    return [...allCompletedExams]
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
      .slice(-6)
      .map((e) => ({
        name: e.title,
        score: e.percentage,
        date: e.date,
      }));
  }, [allCompletedExams]);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-bold">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <AlertCircle size={48} className="text-red-400" />
          <p className="text-gray-700 font-bold">{error}</p>
          <button
            onClick={loadData}
            className="px-5 py-2.5 bg-[#009966] text-white rounded-xl text-sm font-bold hover:bg-[#007a52] transition shadow-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-6 w-full min-h-screen p-2.5 sm:p-5"
      dir="rtl"
    >
      {/* ========================================================
          1. HERO HEADER WITH STUDENT INFO & SCHEDULE
          ======================================================== */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden text-white rounded-3xl bg-linear-to-l from-[#003322] via-[#004d33] to-[#009966] p-4 sm:p-6 shadow-md"
      >
        <img
          className="absolute left-0 top-0 h-full w-36 sm:w-56 opacity-15 pointer-events-none select-none"
          src={Accent}
          alt=""
        />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-100 font-medium">
                <GreetingIcon size={16} className="text-yellow-300" />
                <span>{greeting.text}، مرحباً بك</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold truncate">
                {studentInfo.full_name || user?.full_name || "طالبنا العزيز"}
              </h1>
              <div className="flex items-center gap-2 flex-wrap text-xs text-white/90">
                <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg">
                  <GraduationCap size={13} />
                  {studentInfo.grade_name || "المرحلة الدراسية"}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-lg">
                  {studentInfo.group_name || "المجموعة"}
                </span>
                {studentInfo.barcode && (
                  <span
                    className="inline-flex items-center gap-1 bg-white/20 font-mono text-[11px] px-2 py-0.5 rounded-md"
                    dir="ltr"
                  >
                    #{studentInfo.barcode}
                  </span>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
              <span className="text-[11px] sm:text-xs text-white/80 font-medium">
                {new Date().toLocaleDateString("ar-EG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition disabled:opacity-60 shadow-sm"
              >
                {refreshing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} />
                    تحديث
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Group Schedule Pill - Shows directly when and where student class is */}
          {groupInfo?.days && (
            <div className="bg-black/25 backdrop-blur-xs rounded-2xl p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2.5 border border-white/10 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-yellow-300 shrink-0" />
                <span className="font-bold text-white">مواعيد الحصة:</span>
                <span className="text-green-100">{groupInfo.days}</span>
              </div>

              {groupInfo.start_time && (
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-yellow-300 shrink-0" />
                  <span className="font-bold text-white">التوقيت:</span>
                  <span className="text-green-100" dir="ltr">
                    {formatTime12(groupInfo.start_time)} - {formatTime12(groupInfo.end_time)}
                  </span>
                </div>
              )}

              {groupInfo.room && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-yellow-300 shrink-0" />
                  <span className="font-bold text-white">المكان:</span>
                  <span className="text-green-100">{groupInfo.room}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ========================================================
          2. PRIORITY ACTION BANNERS (LIVE EXAM & PENDING HOMEWORK)
          ======================================================== */}
      {/* Live Exam Banner - High Priority */}
      {liveExam && (
        <motion.div
          variants={itemVariants}
          className="bg-linear-to-r from-red-500 via-orange-500 to-amber-500 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Play size={24} className="text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-red-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  متاح للحل الآن
                </span>
                <span className="text-xs text-white/90">
                  ينتهي: {formatDateTime12(liveExam.end_at)}
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg mt-0.5">
                {liveExam.title || liveExam.exam_title}
              </h3>
              <p className="text-xs text-white/80">
                المدة: {liveExam.duration_minutes} دقيقة | الدرجة الكلية: {liveExam.full_mark} درجة
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/student/exams")}
            className="bg-white text-red-600 hover:bg-red-50 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition shadow-md flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
          >
            <Play size={14} className="fill-red-600" />
            ابدأ الامتحان الآن
          </button>
        </motion.div>
      )}

      {/* Consecutive Absences Warning Banner */}
      {consecutiveAbsences?.consecutive_absences >= 2 && (
        <motion.div
          variants={itemVariants}
          className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-amber-900">
              تنبيه غياب متتالي ({consecutiveAbsences.consecutive_absences} حصص)
            </h4>
            <p className="text-[11px] sm:text-xs text-amber-700">
              يرجى الالتزام بالحضور المنتظم والتواصل مع المساعد لتفادي إيقاف المتابعة أو تفويت الشرح.
            </p>
          </div>
        </motion.div>
      )}

      {/* Pending Assignment Reminder Banner */}
      {pendingAssignmentsCount > 0 && nearestPendingAssignment && (
        <motion.div
          variants={itemVariants}
          className="bg-emerald-50 border border-emerald-200 text-[#003322] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-[#009966]">
              <ClipboardList size={20} />
            </div>
            <div>
              <span className="bg-emerald-200 text-[#003322] text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-0.5">
                واجب منزلي مطلوب ({pendingAssignmentsCount})
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                {nearestPendingAssignment.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                <Clock size={11} />
                آخر موعد للتسليم: {formatDateTime12(nearestPendingAssignment.deadline)}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/student/homework")}
            className="bg-[#009966] text-white hover:bg-[#007a52] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shrink-0 min-h-[40px]"
          >
            تسليم الواجب
            <ChevronLeft size={14} />
          </button>
        </motion.div>
      )}

      {/* ========================================================
          3. KEY METRICS GRID (NUMBERS THAT MATTER TO STUDENTS)
          ======================================================== */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4"
      >
        {/* Attendance Rate */}
        <div
          onClick={() => navigate("/student/attendance")}
          className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3.5 sm:p-4 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-gray-700">نسبة الحضور</span>
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CalendarCheck2 size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {attendanceRate}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-green-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, attendanceRate)}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-500 mt-1.5 block">
              حضور {presentDays} من {totalDays} حصة
            </span>
          </div>
        </div>

        {/* Academic Degree / Average */}
        <div
          onClick={() => navigate("/student/degrees")}
          className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3.5 sm:p-4 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-gray-700">متوسط الدرجات</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <BarChart3 size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {avgScore}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, avgScore)}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-500 mt-1.5 block">
              {totalExamsTaken === 0
                ? "لم يتم أداء أي امتحان"
                : totalExamsTaken === 1
                  ? "تم أداء امتحان واحد"
                  : totalExamsTaken === 2
                    ? "تم أداء امتحانين"
                    : totalExamsTaken >= 3 && totalExamsTaken <= 10
                      ? `تم أداء ${totalExamsTaken} امتحانات`
                      : `تم أداء ${totalExamsTaken} امتحان`}
            </span>
          </div>
        </div>

        {/* Homework Stats */}
        <div
          onClick={() => navigate("/student/homework")}
          className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3.5 sm:p-4 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-gray-700">الواجبات</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <BookOpen size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {pendingAssignmentsCount}
              </span>
              <span className="text-xs font-bold text-gray-500">مطلوبة</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pendingAssignmentsCount === 0 ? "bg-green-600" : "bg-amber-500"
                }`}
                style={{
                  width: `${
                    submittedAssignmentsCount + pendingAssignmentsCount > 0
                      ? Math.round(
                          (submittedAssignmentsCount /
                            (submittedAssignmentsCount + pendingAssignmentsCount)) *
                            100,
                        )
                      : 100
                  }%`,
                }}
              />
            </div>
            <span className="text-[11px] text-gray-500 mt-1.5 block">
              {submittedAssignmentsCount} واجب تم تسليمه
            </span>
          </div>
        </div>

        {/* Video Lectures */}
        <div
          onClick={() => navigate("/student/courses")}
          className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3.5 sm:p-4 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-gray-700">المحاضرات</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Play size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {totalVideos}
              </span>
              <span className="text-xs font-bold text-gray-500">فيديو</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full w-full" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1.5 block">
              في {playlists.length} قوائم تشغيل
            </span>
          </div>
        </div>
      </motion.div>

      {/* ========================================================
          4. INTERACTIVE QUICK ACTIONS (4 LARGE TOUCH CARDS)
          ======================================================== */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
      >
        <button
          onClick={() => navigate("/student/exams")}
          className="bg-white hover:bg-blue-50/60 p-3 sm:p-3.5 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all flex items-center gap-3 text-right group min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileCheck2 size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate">
              الامتحانات
            </span>
            <span className="text-[10px] sm:text-xs text-blue-600 font-semibold">
              {availableExams.length > 0 ? `${availableExams.length} متاح الآن` : "عرض الكل"}
            </span>
          </div>
        </button>

        <button
          onClick={() => navigate("/student/homework")}
          className="bg-white hover:bg-amber-50/60 p-3 sm:p-3.5 rounded-2xl border border-gray-200 hover:border-amber-300 transition-all flex items-center gap-3 text-right group min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate">
              الواجبات
            </span>
            <span className="text-[10px] sm:text-xs text-amber-600 font-semibold">
              {pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} بحاجة لتسليم` : "مسلمة بالكامل"}
            </span>
          </div>
        </button>

        <button
          onClick={() => navigate("/student/courses")}
          className="bg-white hover:bg-emerald-50/60 p-3 sm:p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex items-center gap-3 text-right group min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009966] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Play size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate">
              المحاضرات
            </span>
            <span className="text-[10px] sm:text-xs text-[#009966] font-semibold">
              {totalVideos} درس تعليمي
            </span>
          </div>
        </button>

        <button
          onClick={() => navigate("/student/degrees")}
          className="bg-white hover:bg-purple-50/60 p-3 sm:p-3.5 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all flex items-center gap-3 text-right group min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Award size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate">
              كشف الدرجات
            </span>
            <span className="text-[10px] sm:text-xs text-purple-600 font-semibold">
              التقارير والنتائج
            </span>
          </div>
        </button>
      </motion.div>

      {/* ========================================================
          5. UPCOMING SCHEDULE & DEADLINES (EXAMS & ASSIGNMENTS)
          ======================================================== */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs"
      >
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#009966]" />
            <h2 className="font-bold text-sm sm:text-base text-gray-900">
              ما هو قادم (الامتحانات والواجبات)
            </h2>
          </div>

          <div className="flex items-center bg-gray-100 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setUpcomingTab("exams")}
              className={`px-3 py-1.5 rounded-lg transition ${
                upcomingTab === "exams"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              الامتحانات ({upcomingExams.length})
            </button>
            <button
              onClick={() => setUpcomingTab("assignments")}
              className={`px-3 py-1.5 rounded-lg transition ${
                upcomingTab === "assignments"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              الواجبات ({upcomingAssignments.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Upcoming Exams */}
        {upcomingTab === "exams" && (
          <div className="flex flex-col gap-2.5">
            {upcomingExams.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileCheck2 size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs sm:text-sm">لا توجد امتحانات قادمة مجدولة حالياً</p>
              </div>
            ) : (
              upcomingExams.map((exam, idx) => (
                <div
                  key={exam.id || idx}
                  className="bg-gray-50 hover:bg-gray-100/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition border border-gray-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        exam.exam_type === "online"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {exam.exam_type === "online" ? <Clock size={16} /> : <FileCheck2 size={16} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                          {exam.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            exam.exam_type === "online"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {exam.exam_type === "online" ? "إلكتروني" : "ورقي"}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} />
                        {exam.start_at
                          ? formatDateTime12(exam.start_at)
                          : exam.exam_date
                            ? new Date(exam.exam_date).toLocaleDateString("ar-EG")
                            : "قريباً"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs font-bold text-gray-600">
                      {exam.full_mark || exam.total_degree} درجة
                    </span>
                    <button
                      onClick={() => navigate("/student/exams")}
                      className="text-xs font-bold text-[#009966] bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition"
                    >
                      التفاصيل
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Upcoming Assignments */}
        {upcomingTab === "assignments" && (
          <div className="flex flex-col gap-2.5">
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs sm:text-sm">لا توجد واجبات منزلية قادمة</p>
              </div>
            ) : (
              upcomingAssignments.map((assignment, idx) => (
                <div
                  key={assignment.id || idx}
                  className="bg-gray-50 hover:bg-gray-100/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition border border-gray-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                          {assignment.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            assignment.status === "submitted"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {assignment.status === "submitted" ? "تم التسليم" : "مطلوب"}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        آخر موعد: {formatDateTime12(assignment.deadline)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs font-bold text-gray-600">
                      {assignment.full_mark} درجة
                    </span>
                    <button
                      onClick={() => navigate("/student/homework")}
                      className="text-xs font-bold text-[#009966] bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition"
                    >
                      {assignment.status === "submitted" ? "تعديل التسليم" : "تسليم"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {/* ========================================================
          6. RECENT ACTIVITY & PAYMENTS
          ======================================================== */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
      >
        {/* Latest Activity Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              آخر الأنشطة والنتائج
            </h3>
            <button
              onClick={() => navigate("/student/degrees")}
              className="text-[11px] text-blue-600 font-bold hover:underline"
            >
              عرض السجل
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {lastExam ? (
              <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-gray-900 block truncate">
                    {lastExam.title || lastExam.exam_title}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {new Date(lastExam.date || lastExam.submitted_at).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {lastExam.score != null ? (
                  <div className="text-left shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-[#009966] block" dir="ltr">
                      {lastExam.score} / {lastExam.full_mark}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {lastExam.percentage}%
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                    قيد التصحيح
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-xs text-center py-4">لا توجد امتحانات مكتملة بعد</p>
            )}

            {lastAbsence && (
              <div className="flex items-center justify-between gap-3 bg-red-50/70 rounded-xl p-3 border border-red-100">
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-red-900 block">آخر غياب مسجل</span>
                    <span className="text-[10px] text-red-700">
                      {new Date(lastAbsence.attendance_date).toLocaleDateString("ar-EG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                  غياب
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Latest Payment Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
              <Wallet size={16} className="text-purple-600" />
              الاشتراك والمدفوعات
            </h3>
            <span className="text-[11px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">
              مسدد
            </span>
          </div>

          {lastPayment ? (
            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex flex-col justify-between h-[calc(100%-2.25rem)]">
              <div>
                <span className="text-[11px] text-gray-500 block mb-1">
                  آخر اشتراك شهري مسدد
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-gray-900">
                    {lastPayment.amount}
                  </span>
                  <span className="text-xs font-bold text-gray-600">جنيه</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-200/60 text-[11px] text-gray-600">
                <span>عن شهر: <strong>{lastPayment.subscription_month || "الحالي"}</strong></span>
                <span>
                  بتاريخ:{" "}
                  {new Date(lastPayment.payment_date).toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-xs text-center py-6">لا توجد بيانات مدفوعات مسجلة</p>
          )}
        </div>
      </motion.div>

      {/* ========================================================
          7. VISUAL PERFORMANCE CHARTS (RESPONSIVE)
          ======================================================== */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-safe"
      >
        {/* Exam Scores Trend Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#009966]" />
              تطور درجات الامتحانات الأخيرة
            </h3>
            <span className="text-[10px] text-gray-400">آخر 6 امتحانات</span>
          </div>

          {examScoresData.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-12">
              لا توجد درجات كافية لعرض الرسم البياني
            </p>
          ) : (
            <div className="h-44 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examScoresData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(val) => [`${val}%`, "النسبة"]}
                  />
                  <Bar
                    dataKey="score"
                    fill="#009966"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Attendance Breakdown Donut Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
              <CalendarCheck2 size={16} className="text-green-600" />
              توزيع الحضور والغياب
            </h3>
            <span className="text-[10px] text-gray-400">الإجمالي: {totalDays} حصة</span>
          </div>

          <div className="h-44 sm:h-52 w-full flex items-center justify-center">
            {totalDays === 0 ? (
              <p className="text-gray-400 text-xs text-center">لا توجد حصص مسجلة بعد</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex justify-center gap-6 text-xs font-bold pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-green-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#009966]" />
              حضور: {presentDays} ({totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0}%)
            </div>
            <div className="flex items-center gap-1.5 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              غياب: {absentDays} ({totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0}%)
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Dashboard;