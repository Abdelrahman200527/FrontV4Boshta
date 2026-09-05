/* eslint-disable no-unused-vars */
import { CalendarCheck2, DownloadCloud, TriangleAlert, UsersRound, UserX, TrendingUp, Activity, Clock, Award, Zap, CheckCircle, Wallet, GraduationCap, Users, BookOpen, Video, ListVideo, CreditCard, DollarSign } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
    fetchAssistantDashboard,
    fetchActivityLog,
    fetchAttendanceDashboard
} from "../../../api/assistant/actions";
import { useApiQuery, useInvalidate } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";

const ARABIC_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const COLORS = ['#1a5d1a', '#b8860b', '#10b981', '#f59e0b', '#2c5282', '#991b1b'];

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ar-EG", { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "صباح الخير";
    if (h < 18) return "مساء الخير";
    return "مساء الخير";
}

function getActionIcon(action) {
    const actionMap = {
        'create_student': UsersRound,
        'update_student': UsersRound,
        'delete_student': UserX,
        'create_payment': Wallet,
        'update_payment': Wallet,
        'delete_payment': Wallet,
        'create_subscription': CreditCard,
        'update_subscription_status': CreditCard,
        'delete_subscription': CreditCard,
        'start_session': CalendarCheck2,
        'lock_session': CalendarCheck2,
        'create_grade': GraduationCap,
        'update_grade': GraduationCap,
        'delete_grade': GraduationCap,
        'create_group': Users,
        'update_group': Users,
        'delete_group': Users,
        'create_online_exam': BookOpen,
        'update_online_exam': BookOpen,
        'delete_online_exam': BookOpen,
        'create_video': Video,
        'update_video': Video,
        'delete_video': Video,
        'create_playlist': ListVideo,
        'update_playlist': ListVideo,
        'delete_playlist': ListVideo,
        'login': Activity,
        'logout': Activity,
    };
    return actionMap[action] || Activity;
}

function getActionColor(action) {
    if (action?.includes('create')) return { bg: 'bg-green-100', fg: 'text-green-600' };
    if (action?.includes('update')) return { bg: 'bg-blue-100', fg: 'text-blue-600' };
    if (action?.includes('delete') || action?.includes('lock')) return { bg: 'bg-red-100', fg: 'text-red-600' };
    if (action?.includes('start')) return { bg: 'bg-primary/10', fg: 'text-primary' };
    return { bg: 'bg-gray-100', fg: 'text-gray-600' };
}

function translateAction(action) {
    const actionMap = {
        'create_student': 'إنشاء طالب',
        'update_student': 'تعديل طالب',
        'delete_student': 'حذف طالب',
        'create_payment': 'تسجيل دفعة',
        'update_payment': 'تعديل دفعة',
        'delete_payment': 'حذف دفعة',
        'create_subscription': 'إنشاء اشتراك',
        'update_subscription_status': 'تعديل حالة اشتراك',
        'delete_subscription': 'حذف اشتراك',
        'start_session': 'بدء جلسة حضور',
        'lock_session': 'قفل جلسة حضور',
        'create_grade': 'إنشاء صف',
        'update_grade': 'تعديل صف',
        'delete_grade': 'حذف صف',
        'create_group': 'إنشاء مجموعة',
        'update_group': 'تعديل مجموعة',
        'delete_group': 'حذف مجموعة',
        'create_online_exam': 'إنشاء امتحان أونلاين',
        'update_online_exam': 'تعديل امتحان أونلاين',
        'delete_online_exam': 'حذف امتحان أونلاين',
        'create_video': 'إضافة فيديو',
        'update_video': 'تعديل فيديو',
        'delete_video': 'حذف فيديو',
        'create_playlist': 'إنشاء قائمة تشغيل',
        'update_playlist': 'تعديل قائمة تشغيل',
        'delete_playlist': 'حذف قائمة تشغيل',
        'login': 'تسجيل دخول',
        'logout': 'تسجيل خروج',
    };
    return actionMap[action] || action || 'نشاط غير معروف';
}

const Dashboard = () => {
    const [filterEntity, setFilterEntity] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [page, setPage] = useState(1);

    /* fetch مرة واحدة ويتخزن في الكاش — التحديث بيحصل بس لما الداتا تتغير */
    const dashboardQuery = useApiQuery(qk.assistant.dashboard, fetchAssistantDashboard, {
        errorMessage: "حدث خطأ في تحميل لوحة التحكم",
    });

    const activityQuery = useApiQuery(
        qk.assistant.activityLog(filterEntity, filterDate, page),
        () => fetchActivityLog(filterEntity, filterDate, page),
        { errorMessage: "حدث خطأ في تحميل سجل النشاط" },
    );

    /* بيانات الحضور الحقيقية للأسبوع (مش أرقام وهمية) */
    const attendanceQuery = useApiQuery(qk.attendance.dashboard, fetchAttendanceDashboard, {
        showErrorToast: false,
    });

    const invalidate = useInvalidate();

    const dashboardData = dashboardQuery.data ?? null;
    const activityLog = useMemo(
        () => (Array.isArray(activityQuery.data) ? activityQuery.data : []),
        [activityQuery.data],
    );
    const pagination = activityQuery.pagination;
    const isFetching = dashboardQuery.isFetching || activityQuery.isFetching;

    const refreshAll = () =>
        invalidate(qk.assistant.dashboard, ["assistant", "activity-log"], qk.attendance.dashboard);

    const stats = useMemo(() => {
        if (!dashboardData) return {
            students: 0,
            present: 0,
            absent: 0,
            attendanceRate: 0,
            newStudents: 0,
            grades: 0,
            groups: 0,
            onlineExams: 0,
            assignments: 0,
            videos: 0,
            playlists: 0,
            totalPaid: 0,
            unpaid: 0,
        };

        const totalStudents = Number(dashboardData.total_students) || 0;
        const present = Number(dashboardData.present_today) || 0;
        const absent = Number(dashboardData.absent_today) || 0;
        const totalAttendance = present + absent;

        return {
            students: totalStudents,
            present: present,
            absent: absent,
            attendanceRate: totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0,
            newStudents: 0,
            grades: Number(dashboardData.total_grades) || 0,
            groups: Number(dashboardData.total_groups) || 0,
            onlineExams: Number(dashboardData.active_online_exams) || 0,
            assignments: Number(dashboardData.active_assignments) || 0,
            pendingGrading: Number(dashboardData.pending_grading) || 0,
            videos: Number(dashboardData.total_videos) || 0,
            playlists: Number(dashboardData.total_playlists) || 0,
            totalPaid: Number(dashboardData.total_paid_month) || 0,
            unpaid: Number(dashboardData.unpaid_students) || 0,
        };
    }, [dashboardData]);

    /**
     * اتجاه الحضور الأسبوعي — من الـ API فقط.
     * بيدور على أول مصفوفة أسبوعية موجودة في رد /attendance/dashboard أو /assistant/dashboard،
     * ولو مفيش داتا بيرجع مصفوفة فاضية (الواجهة تبين "لا يوجد بيانات") بدل أرقام عشوائية.
     */
    const attendanceTrend = useMemo(() => {
        const sources = [attendanceQuery.data, dashboardData];
        const arrayKeys = [
            "weekly_attendance", "weekly", "last_7_days", "last7days", "daily_attendance",
            "attendance_trend", "trend", "days", "week", "attendance_by_day", "daily",
        ];

        let raw = null;
        for (const source of sources) {
            if (!source) continue;
            if (Array.isArray(source)) { raw = source; break; }
            for (const key of arrayKeys) {
                if (Array.isArray(source[key]) && source[key].length) { raw = source[key]; break; }
            }
            if (raw) break;
        }
        if (!raw) return [];

        const pickValue = (item) => {
            const keys = ["present", "present_count", "presents", "attended", "attendance_count",
                "count", "total_present", "total", "value", "students_present"];
            for (const key of keys) {
                const v = Number(item?.[key]);
                if (Number.isFinite(v)) return v;
            }
            return 0;
        };
        const pickLabel = (item) => {
            const raw = item?.day_name ?? item?.weekday ?? item?.day ?? item?.name ??
                item?.label ?? item?.attendance_date ?? item?.session_date ?? item?.date;
            if (!raw) return "";
            const d = new Date(raw);
            if (!Number.isNaN(d.getTime())) {
                return d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric" });
            }
            return String(raw);
        };

        return raw
            .slice(-7)
            .map((item) => ({ name: pickLabel(item), value: pickValue(item) }));
    }, [attendanceQuery.data, dashboardData]);

    const pieData = [
        { name: 'حاضر', value: stats.present },
        { name: 'غائب', value: stats.absent },
    ];

    const recentActivities = useMemo(() => {
        return activityLog.slice(0, 10).map(log => {
            const Icon = getActionIcon(log.action);
            const colors = getActionColor(log.action);
            return {
                id: log.id,
                icon: Icon,
                bg: colors.bg,
                fg: colors.fg,
                text: `${log.user_name || 'مستخدم'} — ${translateAction(log.action)}${log.description ? ` (${log.description})` : ''}`,
                time: formatDate(log.created_at),
                entity: log.entity_type,
                entityId: log.entity_id,
            };
        });
    }, [activityLog]);

    const now = new Date();
    const todayLabel = `${now.getDate()} ${ARABIC_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const timeGreeting = greeting();

    const entityTypes = [
        { value: "", label: "الكل" },
        { value: "student", label: "طلاب" },
        { value: "payment", label: "مدفوعات" },
        { value: "subscription", label: "اشتراكات" },
        { value: "attendance_session", label: "جلسات حضور" },
        { value: "grade", label: "صفوف" },
        { value: "group", label: "مجموعات" },
        { value: "online_exam", label: "امتحانات أونلاين" },
        { value: "video", label: "فيديوهات" },
        { value: "playlist", label: "قوائم تشغيل" },
    ];

    const cards = [
        {
            label: "عدد الطلاب",
            value: stats.students,
            Icon: UsersRound,
            gradient: "from-primary to-green-700",
            iconBg: "bg-green-100",
            iconColor: "text-primary",
            trend: `+${stats.newStudents}`,
            trendUp: true
        },
        {
            label: "الحاضرون اليوم",
            value: stats.present,
            Icon: CalendarCheck2,
            gradient: "from-green-500 to-emerald-600",
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            trend: `${stats.attendanceRate}%`,
            trendUp: stats.attendanceRate > 50
        },
        {
            label: "الغائبون اليوم",
            value: stats.absent,
            Icon: UserX,
            gradient: "from-red-500 to-rose-600",
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            trend: stats.absent > 0 ? "تنبيه" : "لا يوجد",
            trendUp: stats.absent > 0
        },
        {
            label: "المدفوعات هذا الشهر",
            value: `${stats.totalPaid} ج`,
            Icon: DollarSign,
            gradient: "from-amber-500 to-yellow-600",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            trend: `${stats.unpaid} غير مدفوع`,
            trendUp: stats.unpaid === 0
        },
    ];

    const extraCards = [
        {
            label: "الصفوف",
            value: stats.grades,
            Icon: GraduationCap,
            gradient: "from-blue-500 to-indigo-600",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            label: "المجموعات",
            value: stats.groups,
            Icon: Users,
            gradient: "from-purple-500 to-pink-600",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
        },
        {
            label: "امتحانات نشطة",
            value: stats.onlineExams,
            Icon: BookOpen,
            gradient: "from-cyan-500 to-teal-600",
            iconBg: "bg-cyan-100",
            iconColor: "text-cyan-600",
        },
        {
            label: "فيديوهات",
            value: stats.videos,
            Icon: Video,
            gradient: "from-red-500 to-rose-600",
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
    };

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
        >
            {/* Header with Greeting */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/30">
                                <Activity size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    لوحة التحكم
                                </h1>
                                <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                                    <span>{timeGreeting}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span>{todayLabel}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="inline-flex items-center gap-1 text-primary">
                                        <Activity size={14} /> نشط
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setPage(1); refreshAll(); }}
                            disabled={isFetching}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60"
                        >
                            <Zap size={16} className="text-primary" />
                            {isFetching ? "جارٍ التحديث..." : "تحديث"}
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Stats Cards - Main */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
            >
                {cards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
                        className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-5 group"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${card.gradient} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>

                        <div className="relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
                                    <card.Icon className={`${card.iconColor} w-5 h-5`} />
                                </div>
                                {card.trend !== undefined && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        card.trendUp !== undefined
                                            ? card.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {card.trend}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {dashboardQuery.isLoading
                                        ? <span className="inline-block h-8 w-20 rounded bg-gray-100 animate-pulse" />
                                        : card.value}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Stats Cards - Extra */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
            >
                {extraCards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        variants={itemVariants}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-4 group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${card.gradient} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
                        <div className="relative flex items-center gap-3">
                            <div className={`p-2 ${card.iconBg} rounded-xl`}>
                                <card.Icon className={`${card.iconColor} w-4 h-4`} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{card.label}</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {dashboardQuery.isLoading
                                        ? <span className="inline-block h-6 w-12 rounded bg-gray-100 animate-pulse" />
                                        : card.value}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Section */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8"
            >
                {/* Attendance Trend */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-lg p-5 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" />
                                اتجاه الحضور الأسبوعي
                            </h3>
                            <p className="text-xs text-gray-400">آخر 7 أيام</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-primary rounded-full"></span>
                            <span className="text-xs text-gray-600">عدد الحضور</span>
                        </div>
                    </div>
                    {attendanceQuery.isLoading ? (
                        <div className="h-62.5 rounded-2xl bg-gray-100 animate-pulse" />
                    ) : attendanceTrend.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-20">لا يوجد بيانات حضور كافية</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={attendanceTrend}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1a5d1a" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#1a5d1a" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                    }}
                                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#1a5d1a"
                                    strokeWidth={3}
                                    fill="url(#colorValue)"
                                    activeDot={{ r: 8, strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <CalendarCheck2 size={20} className="text-primary" />
                                حضور اليوم
                            </h3>
                            <p className="text-xs text-gray-400">توزيع الحضور والغياب</p>
                        </div>
                    </div>
                    {stats.present + stats.absent === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-20">لم يتم تسجيل حضور اليوم</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={4}
                                    >
                                        {pieData.map((entry, idx) => (
                                            <Cell key={entry.name} fill={COLORS[idx]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-6 mt-2">
                                {pieData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                        <span className="text-sm font-bold text-gray-800">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Filters for Activity Log */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex flex-wrap items-center gap-3 mb-4"
            >
                <select
                    value={filterEntity}
                    onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
                    className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                    {entityTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
                    className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
                {(filterEntity || filterDate) && (
                    <button
                        onClick={() => { setFilterEntity(""); setFilterDate(""); setPage(1); }}
                        className="text-sm text-red-500 hover:text-red-700"
                    >
                        إلغاء الفلترة
                    </button>
                )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 hover:shadow-xl transition-all duration-300"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Clock size={20} className="text-primary" />
                            آخر العمليات
                        </h3>
                        <p className="text-xs text-gray-400">أحدث الأنشطة على المنظومة</p>
                    </div>
                    <span className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        {activityLog.length} نشاط
                    </span>
                </div>

                {activityQuery.isLoading ? (
                    <div className="space-y-3">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : recentActivities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">لا يوجد نشاط بعد</p>
                ) : (
                    <div className="space-y-3 overflow-x-auto">
                        {recentActivities.map((r, i) => (
                            <motion.div
                                key={r.id || i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100 group gap-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`p-2 rounded-lg ${r.bg} group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                                        <r.icon size={16} className={r.fg} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 truncate">{r.text}</span>
                                </div>
                                <span className="text-xs text-gray-400 shrink-0">{r.time}</span>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                            صفحة {pagination.page} من {pagination.totalPages} • {pagination.total} نشاط
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                            >
                                السابق
                            </button>
                            <span className="text-sm text-gray-600">{page}</span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.section>
    );
};

export default Dashboard;