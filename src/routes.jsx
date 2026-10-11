import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import AuthMiddleware from "./middlewares/auth.middleware.jsx";
import GuestMiddleware from "./middlewares/guest.middleware.jsx";
import PageLoading from "./components/PageLoading.jsx";

// Helper to wrap lazy components in Suspense with accessible PageLoading fallback
const lazyRoute = (factory) => {
  const LazyComponent = lazy(factory);
  return function SuspenseWrappedRoute(props) {
    return (
      <Suspense fallback={<PageLoading />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

// Public & Demo Pages
const LandingPage = lazyRoute(() => import("./landing/LandingPage.jsx"));
const Login = lazyRoute(() => import("./pages/Login.jsx"));
const LoginSystem = lazyRoute(() => import("./pages/LoginSystem.jsx"));
const StudentActivation = lazyRoute(() => import("./pages/StudentActivation.jsx"));
const DemoSelector = lazyRoute(() => import("./pages/DemoSelector.jsx"));
const StudentDemo = lazyRoute(() => import("./demo/student/StudentDemo.jsx"));
const ParentDashboard = lazyRoute(() => import("./parents/ParentDashboard.jsx"));
const NotFound = lazyRoute(() => import("./pages/NotFound.jsx"));

// Students Pages
const StudentDashboard = lazyRoute(() => import("./students/Dashboard.jsx"));
const StudentAttendance = lazyRoute(() => import("./students/Attendance.jsx"));
const StudentCourses = lazyRoute(() => import("./students/Courses.jsx"));
const StudentDegrees = lazyRoute(() => import("./students/Degrees.jsx"));
const StudentExams = lazyRoute(() => import("./students/Exams.jsx"));
const StudentExamTaking = lazyRoute(() => import("./students/ExamTaking.jsx"));
const StudentExamReview = lazyRoute(() => import("./students/ExamReview.jsx"));
const StudentHomework = lazyRoute(() => import("./students/Homework.jsx"));
const StudentProfile = lazyRoute(() => import("./students/Profile.jsx"));
const StudentWatchVideo = lazyRoute(() => import("./students/WatchVideo.jsx"));
const StudentLiveSessions = lazyRoute(() => import("./students/LiveSessions.jsx"));
const StudentChat = lazyRoute(() => import("./students/Chat.jsx"));

// Assistants Pages - shared
const AssistantProfile = lazyRoute(() => import("./assistants/Profile.jsx"));
const AssistantChat = lazyRoute(() => import("./assistants/Chat.jsx"));

// Assistants Pages - online
const AssistantOnlineVideos = lazyRoute(() => import("./assistants/online/Videos.jsx"));
const AssistantOnlineWatchVideo = lazyRoute(() => import("./assistants/online/WatchVideo.jsx"));
const AssistantOnlineExams = lazyRoute(() => import("./assistants/online/Exams.jsx"));
const AssistantOnlineHomework = lazyRoute(() => import("./assistants/online/Homework.jsx"));
const AssistantOnlineLiveSessions = lazyRoute(() => import("./assistants/online/LiveSessions.jsx"));

// Assistants Pages - management
const AssistantManagementDashboard = lazyRoute(() => import("./assistants/management/pages/Dashboard.jsx"));
const AssistantManagementStudents = lazyRoute(() => import("./assistants/management/pages/Students.jsx"));
const AssistantManagementAttendance = lazyRoute(() => import("./assistants/management/pages/Attendance.jsx"));
const AssistantManagementGroups = lazyRoute(() => import("./assistants/management/pages/Groups.jsx"));
const AssistantManagementGrades = lazyRoute(() => import("./assistants/management/pages/Grades.jsx"));
const AssistantManagementExams = lazyRoute(() => import("./assistants/management/pages/Exams.jsx"));
const AssistantManagementPayments = lazyRoute(() => import("./assistants/management/pages/Payments.jsx"));
const AssistantManagementSettings = lazyRoute(() => import("./assistants/management/pages/Settings.jsx"));
const AssistantManagementAddDegree = lazyRoute(() => import("./assistants/management/components/AddDegree.jsx"));

// Teachers Pages
const TeacherDashboard = lazyRoute(() => import("./teachers/Dashboard.jsx"));
const TeacherAttendance = lazyRoute(() => import("./teachers/Attendance.jsx"));
const TeacherCourses = lazyRoute(() => import("./teachers/Courses.jsx"));
const TeacherDegrees = lazyRoute(() => import("./teachers/Degrees.jsx"));
const TeacherProfile = lazyRoute(() => import("./teachers/Profile.jsx"));
const TeacherReports = lazyRoute(() => import("./teachers/Reports.jsx"));
const TeacherStudents = lazyRoute(() => import("./teachers/Students.jsx"));
const TeacherStudentDetails = lazyRoute(() => import("./teachers/StudentDetails.jsx"));
const TeacherAssistants = lazyRoute(() => import("./teachers/Assistants.jsx"));
const TeacherExamResults = lazyRoute(() => import("./teachers/ExamResults.jsx"));
const TeacherWatchVideo = lazyRoute(() => import("./teachers/WatchVideo.jsx"));
const TeacherHomeworks = lazyRoute(() => import("./teachers/Homework.jsx"));
const TeacherPayments = lazyRoute(() => import("./teachers/Payments.jsx"));
const TeacherLiveSessions = lazyRoute(() => import("./teachers/LiveSessions.jsx"));
const TeacherChat = lazyRoute(() => import("./teachers/Chat.jsx"));

// Super Admin Pages
const SuperAdminDashboard = lazyRoute(() => import("./super-admin/Dashboard.jsx"));
const SuperAdminUsers = lazyRoute(() => import("./super-admin/Users.jsx"));
const SuperAdminStudents = lazyRoute(() => import("./super-admin/Students.jsx"));
const SuperAdminPasswords = lazyRoute(() => import("./super-admin/Passwords.jsx"));
const SuperAdminAttendance = lazyRoute(() => import("./super-admin/Attendance.jsx"));
const SuperAdminGroups = lazyRoute(() => import("./super-admin/Groups.jsx"));
const SuperAdminGrades = lazyRoute(() => import("./super-admin/Grades.jsx"));
const SuperAdminFinance = lazyRoute(() => import("./super-admin/Finance.jsx"));
const SuperAdminExams = lazyRoute(() => import("./super-admin/Exams.jsx"));
const SuperAdminLiveSessions = lazyRoute(() => import("./super-admin/LiveSessions.jsx"));
const SuperAdminActivityLog = lazyRoute(() => import("./super-admin/ActivityLog.jsx"));
const SuperAdminSettings = lazyRoute(() => import("./super-admin/Settings.jsx"));
const SuperAdminChat = lazyRoute(() => import("./super-admin/Chat.jsx"));
const SuperAdminWhatsApp = lazyRoute(() => import("./super-admin/WhatsApp.jsx"));

export const router = createBrowserRouter([
  { path: '/demo', Component: DemoSelector },
  { path: '/demo/student', Component: StudentDemo },
  {
    path: "/",
    Component: () => (
      <GuestMiddleware>
        <LandingPage />
      </GuestMiddleware>
    ),
  },
  {
    path: "/activate",
    Component: () => (
      <GuestMiddleware>
        <StudentActivation />
      </GuestMiddleware>
    ),
  },
  {
    path: "/student-activation",
    element: <Navigate to="/activate" replace />,
  },
  {
    path: "/login",
    Component: () => (
      <GuestMiddleware>
        <Login />
      </GuestMiddleware>
    ),
  },
  {
    path: "/user/login",
    Component: () => (
      <GuestMiddleware>
        <LoginSystem />
      </GuestMiddleware>
    ),
  },

  // Parent Route - Public
  {
    path: "/parent",
    Component: ParentDashboard,
  },
  {
    path: "/parent/:token",
    Component: ParentDashboard,
  },

  // ============================================
  // STUDENT ROUTES
  // ============================================
  {
    path: "/student",
    Component: () => (
      <AuthMiddleware allowedRoles={["student"]}>
        <MainLayout />
      </AuthMiddleware>
    ),
    children: [
      { index: true, Component: StudentDashboard },
      { path: "attendance", Component: StudentAttendance },
      { path: "courses", Component: StudentCourses },
      { path: "courses/watch/:videoId", Component: StudentWatchVideo },
      { path: "live-sessions", Component: StudentLiveSessions },
      { path: "degrees", Component: StudentDegrees },
      { path: "exams", Component: StudentExams },
      { path: "exams/:examId", Component: StudentExamTaking },
      { path: "exams/review/:attemptId", Component: StudentExamReview },
      { path: "homework", Component: StudentHomework },
      { path: "chat", Component: StudentChat },
      { path: "ai", Component: StudentChat },
      { path: "profile", Component: StudentProfile },
    ],
  },

  // ============================================
  // ASSISTANT ROUTES
  // ============================================
  {
    path: "/assistant",
    Component: () => (
      <AuthMiddleware allowedRoles={["assistant"]}>
        <MainLayout />
      </AuthMiddleware>
    ),
    children: [
      { index: true, Component: AssistantManagementDashboard },
      { path: "chat", Component: AssistantChat },
      { path: "profile", Component: AssistantProfile },

      { path: "online/videos", Component: AssistantOnlineVideos },
      {
        path: "online/videos/watch/:videoId",
        Component: AssistantOnlineWatchVideo,
      },
      { path: "online/live-sessions", Component: AssistantOnlineLiveSessions },
      { path: "online/exams", Component: AssistantOnlineExams },
      { path: "online/homework", Component: AssistantOnlineHomework },
      { path: "online/chat", Component: AssistantChat },

      { path: "management", Component: AssistantManagementDashboard },
      { path: "management/chat", Component: AssistantChat },
      { path: "management/students", Component: AssistantManagementStudents },
      {
        path: "management/attendance",
        Component: AssistantManagementAttendance,
      },
      { path: "management/groups", Component: AssistantManagementGroups },
      { path: "management/grades", Component: AssistantManagementGrades },
      { path: "management/exams", Component: AssistantManagementExams },
      {
        path: "management/exams/:id",
        Component: AssistantManagementAddDegree,
      },
      { path: "management/payments", Component: AssistantManagementPayments },
      {
        path: "management/settings",
        Component: AssistantManagementSettings,
      },
    ],
  },

  // ============================================
  // TEACHER ROUTES
  // ============================================
  {
    path: "/teacher",
    Component: () => (
      <AuthMiddleware allowedRoles={["teacher"]}>
        <MainLayout />
      </AuthMiddleware>
    ),
    children: [
      { index: true, Component: TeacherDashboard },
      { path: "attendance", Component: TeacherAttendance },
      { path: "courses", Component: TeacherCourses },
      { path: "courses/watch/:videoId", Component: TeacherWatchVideo },
      { path: "live-sessions", Component: TeacherLiveSessions },
      { path: "degrees", Component: TeacherDegrees },
      { path: "profile", Component: TeacherProfile },
      { path: "reports", Component: TeacherReports },
      { path: "students", Component: TeacherStudents },
      { path: "students/:studentId", Component: TeacherStudentDetails },
      { path: "assistants", Component: TeacherAssistants },
      { path: "exams/:type/:examId", Component: TeacherExamResults },
      { path: "homework", Component: TeacherHomeworks },
      { path: "payments", Component: TeacherPayments },
      { path: "chat", Component: TeacherChat },
      { path: "ai", Component: TeacherChat },
    ],
  },

  // ============================================
  // SUPER ADMIN ROUTES
  // ============================================
  {
    path: "/super-admin",
    Component: () => (
      <AuthMiddleware allowedRoles={["super_admin"]}>
        <MainLayout />
      </AuthMiddleware>
    ),
    children: [
      { index: true, Component: SuperAdminDashboard },
      { path: "users", Component: SuperAdminUsers },
      { path: "students", Component: SuperAdminStudents },
      { path: "passwords", Component: SuperAdminPasswords },
      { path: "attendance", Component: SuperAdminAttendance },
      { path: "groups", Component: SuperAdminGroups },
      { path: "grades", Component: SuperAdminGrades },
      { path: "payments", Component: SuperAdminFinance },
      { path: "finance", Component: SuperAdminFinance },
      { path: "exams", Component: SuperAdminExams },
      { path: "reports", Component: TeacherReports },
      { path: "live-sessions", Component: SuperAdminLiveSessions },
      { path: "whatsapp", Component: SuperAdminWhatsApp },
      { path: "activity-log", Component: SuperAdminActivityLog },
      { path: "settings", Component: SuperAdminSettings },
      { path: "chat", Component: SuperAdminChat },
      { path: "ai", Component: SuperAdminChat },
    ],
  },

  // ============================================
  // GOOGLE AUTH REDIRECT CATCHER
  // ============================================
  {
    path: "/dashboard/live-sessions",
    Component: () => {
      const role = localStorage.getItem("user_role") || "student";
      let dest = "/student/live-sessions";
      if (role === "teacher") dest = "/teacher/live-sessions";
      if (role === "super_admin") dest = "/super-admin/live-sessions";
      if (role === "assistant") dest = "/assistant/online/live-sessions";

      const search = window.location.search;
      return <Navigate to={`${dest}${search}`} replace />;
    },
  },

  // ============================================
  // 404
  // ============================================
  {
    path: "*",
    Component: NotFound,
  },
]);
