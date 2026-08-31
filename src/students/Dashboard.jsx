import React, { useEffect, useState, useCallback, useMemo } from "react";
import Accent from "../assets/Accent.svg";
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
  Users,
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
  fetchStudentProfile,
  fetchStudentStats,
  fetchAvailableExams,
  fetchPlaylists,
  fetchPaymentHistory,
  fetchAttendanceHistory,
  fetchExamHistory,
  fetchPaperExams,
} from "../api/student/actions";
import getUser from "../utils/getUser";
import getImageUrl from "../utils/imageUrl";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [paperExams, setPaperExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        profileRes,
        statsRes,
        examsRes,
        playlistsRes,
        paymentsRes,
        attendanceRes,
        examHistoryRes,
        paperExamsRes,
      ] = await Promise.all([
        fetchStudentProfile(),
        fetchStudentStats(),
        fetchAvailableExams(),
        fetchPlaylists(),
        fetchPaymentHistory(),
        fetchAttendanceHistory(),
        fetchExamHistory(),
        fetchPaperExams(),
      ]);

      if (profileRes.success) setProfile(profileRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (examsRes.success) setAvailableExams(examsRes.data || []);
      if (playlistsRes.success) setPlaylists(playlistsRes.data || []);
      if (paymentsRes.success) setPaymentHistory(paymentsRes.data || []);
      if (attendanceRes.success) setAttendanceHistory(attendanceRes.data || []);
      if (examHistoryRes.success) setExamHistory(examHistoryRes.data || []);
      if (paperExamsRes.success) setPaperExams(paperExamsRes.data || []);
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
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "صباح الخير", icon: Sun };
    else if (hour >= 12 && hour < 17)
      return { text: "مساء الخير", icon: Sunset };
    else return { text: "مساء النور", icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const toNumber = useCallback((value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }, []);

  const attendanceRate = toNumber(stats?.attendance_percentage);
  const presentDays = toNumber(stats?.present_days);
  const absentDays = toNumber(stats?.absent_days);
  const avgScore = toNumber(stats?.avg_paper_degree);
  const totalVideos = useMemo(
    () => playlists.reduce((sum, p) => sum + toNumber(p.videos_count), 0),
    [playlists, toNumber],
  );

  const lastPayment = paymentHistory[0] || null;
  const lastAbsence =
    attendanceHistory.find((a) => a.status === "absent") || null;
  const lastExam = examHistory[0] || null;
  const nextExam = availableExams[0] || null;

  const attendancePieData = useMemo(
    () => [
      { name: "حضور", value: presentDays },
      { name: "غياب", value: absentDays },
    ],
    [presentDays, absentDays],
  );

  const COLORS = ["#16a34a", "#dc2626"];

  const examScoresData = useMemo(
    () =>
      [
        ...examHistory.map((e) => ({
          name: e.exam_title || "امتحان",
          score:
            e.full_mark > 0
              ? Math.round((toNumber(e.score) / toNumber(e.full_mark)) * 100)
              : 0,
        })),
        ...paperExams.map((e) => ({
          name: e.title || e.exam_title || "امتحان",
          score:
            e.total_degree > 0
              ? Math.round(
                  (toNumber(e.student_degree) / toNumber(e.total_degree)) * 100,
                )
              : 0,
        })),
      ]
        .slice(0, 5)
        .reverse(),
    [examHistory, paperExams, toNumber],
  );

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle size={48} className="text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#009966] text-white rounded-lg hover:bg-[#007a52] transition"
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
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5"
      dir="rtl"
    >
      {/* Hero */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden text-white rounded-2xl bg-linear-to-l from-[#003322] to-[#009966] p-4 sm:p-6"
      >
        <img
          className="absolute left-0 top-0 h-full w-32 sm:w-48 opacity-20"
          src={Accent}
          alt=""
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm sm:text-base opacity-80">
              <GreetingIcon size={16} />
              <span>{greeting.text}</span>
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold">
              {profile?.full_name || user?.full_name || "طالبنا العزيز"}
            </span>
            <span className="text-[10px] sm:text-xs opacity-80 flex items-center gap-1.5">
              <GraduationCap size={12} />
              {profile?.grade_name || "-"} - {profile?.group_name || "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] sm:text-xs opacity-80">
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition self-start sm:self-auto"
            >
              <RefreshCw
                size={12}
                className={refreshing ? "animate-spin" : ""}
              />
              تحديث
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
      >
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4 text-center">
          <CalendarCheck2
            className="text-green-600 mx-auto mb-1.5 sm:mb-2"
            size={18}
          />
          <span className="font-bold text-xl sm:text-2xl block">
            {attendanceRate}%
          </span>
          <span className="text-[10px] sm:text-sm text-gray-500">الحضور</span>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4 text-center">
          <BarChart3
            className="text-blue-600 mx-auto mb-1.5 sm:mb-2"
            size={18}
          />
          <span className="font-bold text-xl sm:text-2xl block">
            {avgScore}
          </span>
          <span className="text-[10px] sm:text-sm text-gray-500">المتوسط</span>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4 text-center">
          <BookOpen
            className="text-orange-600 mx-auto mb-1.5 sm:mb-2"
            size={18}
          />
          <span className="font-bold text-xl sm:text-2xl block">
            {totalVideos}
          </span>
          <span className="text-[10px] sm:text-sm text-gray-500">فيديو</span>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4 text-center">
          <FileCheck2
            className="text-purple-600 mx-auto mb-1.5 sm:mb-2"
            size={18}
          />
          <span className="font-bold text-xl sm:text-2xl block">
            {availableExams.length}
          </span>
          <span className="text-[10px] sm:text-sm text-gray-500">امتحانات</span>
        </div>
      </motion.div>

      {/* Last Payment */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Wallet className="text-purple-600" size={16} />
          </div>
          <span className="text-sm sm:text-base font-bold text-gray-700">
            آخر دفعة
          </span>
        </div>
        <AnimatePresence>
          {lastPayment ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center flex-wrap gap-2"
            >
              <div>
                <span className="font-bold text-lg sm:text-xl text-gray-900 block">
                  {lastPayment.amount} جنيه
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                  {new Date(lastPayment.payment_date).toLocaleDateString(
                    "ar-EG",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                  {" - "}عن شهر {lastPayment.subscription_month || "-"}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                مدفوع
              </span>
            </motion.div>
          ) : (
            <p className="text-gray-400 text-xs sm:text-sm">لا توجد دفعات</p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recent Events */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
      >
        <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">
          آخر الأحداث
        </h3>
        <div className="flex flex-col gap-2.5">
          {lastExam && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <TrendingUp className="text-blue-600" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold block truncate">
                  {lastExam.exam_title}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {new Date(lastExam.submitted_at).toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  lastExam.result_status === "passed"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {lastExam.score}/{lastExam.full_mark}
              </span>
            </div>
          )}

          {lastAbsence && (
            <div className="flex items-center gap-3 bg-red-50 rounded-lg p-2.5">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="text-red-600" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold block">غياب</span>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {new Date(lastAbsence.attendance_date).toLocaleDateString(
                    "ar-EG",
                    {
                      day: "numeric",
                      month: "long",
                    },
                  )}
                </span>
              </div>
            </div>
          )}

          {nextExam && (
            <div className="flex items-center gap-3 bg-green-50 rounded-lg p-2.5">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-green-600" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold block truncate">
                  {nextExam.title}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={10} />
                  {nextExam.duration_minutes} دقيقة | {nextExam.full_mark} درجة
                </span>
              </div>
              <button
                onClick={() => navigate("/student/exams")}
                className="text-xs sm:text-sm text-blue-600 font-bold flex items-center gap-1 shrink-0"
              >
                <Play size={12} /> ابدأ
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <h3 className="font-bold text-sm sm:text-base mb-2">توزيع الحضور</h3>
          <div className="h-40 sm:h-45">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendancePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {attendancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 flex-wrap text-xs sm:text-sm mt-1.5">
            {attendancePieData.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: COLORS[idx] }}
                />
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <h3 className="font-bold text-sm sm:text-base mb-2">آخر الدرجات</h3>
          {examScoresData.length === 0 ? (
            <p className="text-gray-400 text-xs sm:text-sm text-center py-8">
              لا توجد نتائج
            </p>
          ) : (
            <div className="h-40 sm:h-45">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examScoresData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-2 sm:gap-3"
      >
        <button
          onClick={() => navigate("/student/exams")}
          className="bg-blue-50 rounded-xl p-3 flex items-center gap-3 text-right border border-blue-100 hover:border-blue-300 transition"
        >
          <FileCheck2 size={18} className="text-blue-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-sm font-bold text-blue-700 block">
              الامتحانات
            </span>
            <span className="text-xs text-gray-500">
              {availableExams.length} متاح
            </span>
          </div>
        </button>
        <button
          onClick={() => navigate("/student/courses")}
          className="bg-green-50 rounded-xl p-3 flex items-center gap-3 text-right border border-green-100 hover:border-green-300 transition"
        >
          <Play size={18} className="text-green-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-sm font-bold text-green-700 block">
              المحاضرات
            </span>
            <span className="text-xs text-gray-500">{totalVideos} فيديو</span>
          </div>
        </button>
      </motion.div>
    </motion.section>
  );
};

export default Dashboard;
