import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import Login from "./pages/Login.jsx";
import LandingPage from "./landing/LandingPage.jsx";
import ParentDashboard from "./parents/ParentDashboard.jsx";

import AuthMiddleware from "./middlewares/auth.middleware.jsx";
import GuestMiddleware from "./middlewares/guest.middleware.jsx";

// Students
import StudentDashboard from "./students/Dashboard.jsx";
import StudentAttendance from "./students/Attendance.jsx";
import StudentCourses from "./students/Courses.jsx";
import StudentDegrees from "./students/Degrees.jsx";
import StudentExams from "./students/Exams.jsx";
import StudentExamTaking from "./students/ExamTaking.jsx";
import StudentExamReview from "./students/ExamReview.jsx"; // ✅ جديد
import StudentHomework from "./students/Homework.jsx";
import StudentProfile from "./students/Profile.jsx";
import StudentWatchVideo from "./students/WatchVideo.jsx";

// Assistants - shared
import AssistantProfile from "./assistants/Profile.jsx";

// Assistants - online
import AssistantOnlineVideos from "./assistants/online/Videos.jsx";
import AssistantOnlineWatchVideo from "./assistants/online/WatchVideo.jsx";
import AssistantOnlineExams from "./assistants/online/Exams.jsx";
import AssistantOnlineHomework from "./assistants/online/Homework.jsx";

// Assistants - management
import AssistantManagementDashboard from "./assistants/management/pages/Dashboard.jsx";
import AssistantManagementStudents from "./assistants/management/pages/Students.jsx";
import AssistantManagementAttendance from "./assistants/management/pages/Attendance.jsx";
import AssistantManagementGroups from "./assistants/management/pages/Groups.jsx";
import AssistantManagementGrades from "./assistants/management/pages/Grades.jsx";
import AssistantManagementExams from "./assistants/management/pages/Exams.jsx";
import AssistantManagementPayments from "./assistants/management/pages/Payments.jsx";
import AssistantManagementWhatsApp from "./assistants/management/pages/WhatsApp.jsx";
import AssistantManagementSettings from "./assistants/management/pages/Settings.jsx";
import AssistantManagementAddDegree from "./assistants/management/components/AddDegree.jsx";

// Teachers
import TeacherDashboard from "./teachers/Dashboard.jsx";
import TeacherAttendance from "./teachers/Attendance.jsx";
import TeacherCourses from "./teachers/Courses.jsx";
import TeacherDegrees from "./teachers/Degrees.jsx";
import TeacherProfile from "./teachers/Profile.jsx";
import TeacherReports from "./teachers/Reports.jsx";
import TeacherStudents from "./teachers/Students.jsx";
import TeacherAssistants from "./teachers/Assistants.jsx";
import TeacherExamResults from "./teachers/ExamResults.jsx";
import TeacherStudentDetails from "./teachers/StudentDetails.jsx";
import TeacherWatchVideo from "./teachers/WatchVideo.jsx";
import TeacherHomeworks from "./teachers/Homework.jsx";

import NotFound from "./pages/NotFound.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => (
      <GuestMiddleware>
        <LandingPage />
      </GuestMiddleware>
    ),
  },

  {
    path: "/login",
    Component: () => (
      <GuestMiddleware>
        <Login />
      </GuestMiddleware>
    ),
  },

  // Parent Route - Public
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
      { path: "degrees", Component: StudentDegrees },
      { path: "exams", Component: StudentExams },
      { path: "exams/:examId", Component: StudentExamTaking },
      { path: "exams/review/:attemptId", Component: StudentExamReview }, // ✅ جديد
      { path: "homework", Component: StudentHomework },
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
      { path: "profile", Component: AssistantProfile },

      { path: "online/videos", Component: AssistantOnlineVideos },
      {
        path: "online/videos/watch/:videoId",
        Component: AssistantOnlineWatchVideo,
      },
      { path: "online/exams", Component: AssistantOnlineExams },
      { path: "online/homework", Component: AssistantOnlineHomework },

      { path: "management", Component: AssistantManagementDashboard },
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
      { path: "management/whatsapp", Component: AssistantManagementWhatsApp },
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
      { path: "degrees", Component: TeacherDegrees },
      { path: "profile", Component: TeacherProfile },
      { path: "reports", Component: TeacherReports },
      { path: "students", Component: TeacherStudents },
      { path: "students/:studentId", Component: TeacherStudentDetails },
      { path: "assistants", Component: TeacherAssistants },
      { path: "exams/:type/:examId", Component: TeacherExamResults },
      { path: "homework", Component: TeacherHomeworks },
    ],
  },

  // ============================================
  // 404
  // ============================================
  {
    path: "*",
    Component: NotFound,
  },
]);