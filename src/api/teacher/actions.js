import * as teacherServices from "./services";
import config from "../../config";
import { downloadFile, previewFile } from "../../utils/fileHandler";

const { apiUrl } = config;

const fetchTeacherProfile = async () => {
  try {
    const data = await teacherServices.getTeacherProfile();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchTeacherDashboard = async () => {
  try {
    const data = await teacherServices.getTeacherDashboard();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchActivityLog = async (entityType = "", date = "", page = 1) => {
  try {
    const data = await teacherServices.getActivityLog(entityType, date, page);
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssistants = async () => {
  try {
    const data = await teacherServices.getAssistants();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssistantById = async (assistantId) => {
  try {
    const data = await teacherServices.getAssistantById(assistantId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchDashboardStats = async () => {
  try {
    const [grades, groups, studentsRes, attendance, payments, subscriptions] =
      await Promise.all([
        teacherServices.getAllGradesStats(),
        teacherServices.getAllGroupsStats(),
        teacherServices.getStudents(1, "", "", ""),
        teacherServices.getAttendanceOverall(),
        teacherServices.getPaymentOverall(),
        teacherServices.getSubscriptionOverall(),
      ]);
    return {
      success: true,
      data: {
        grades,
        groups,
        students: studentsRes.data || [],
        attendance,
        payments,
        subscriptions,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllStudents = async (
  page = 1,
  search = "",
  gradeId = "",
  groupId = "",
) => {
  try {
    const response = await teacherServices.getStudents(
      page,
      search,
      gradeId,
      groupId,
    );
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchStudentByBarcode = async (barcode) => {
  try {
    const student = await teacherServices.searchStudentByBarcode(barcode);
    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchStudentByPhone = async (phone) => {
  try {
    const student = await teacherServices.searchStudentByPhone(phone);
    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentDetails = async (studentId) => {
  try {
    const [profile, stats] = await Promise.all([
      teacherServices.getStudentProfile(studentId),
      teacherServices.getStudentStats(studentId),
    ]);
    return { success: true, data: { profile, stats } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentFullDetails = async (studentId) => {
  try {
    const data = await teacherServices.getStudentFullDetails(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentFilters = async () => {
  try {
    const [grades, groups] = await Promise.all([
      teacherServices.getGrades(),
      teacherServices.getGroups(),
    ]);
    return { success: true, data: { grades, groups } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// STUDENT DETAILS ACTIONS (جديد)
// ============================================

const fetchStudentAttendance = async (studentId) => {
  try {
    const data = await teacherServices.getStudentAttendanceHistory(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPayments = async (studentId) => {
  try {
    const data = await teacherServices.getStudentPayments(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPaperExams = async (studentId) => {
  try {
    const data = await teacherServices.getStudentPaperExams(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentExamResults = async (studentId) => {
  try {
    const data = await teacherServices.getStudentExamResults(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentOnlineExams = async (studentId) => {
  try {
    const data = await teacherServices.getStudentOnlineExams(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentAssignments = async (studentId) => {
  try {
    const data = await teacherServices.getStudentAssignments(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentSubmissions = async (studentId) => {
  try {
    const data = await teacherServices.getStudentSubmissions(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// VIDEOS & PLAYLISTS FILTER ACTIONS (جديد)
// ============================================

const fetchVideosByGrade = async (gradeId) => {
  try {
    const data = await teacherServices.getVideosByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistsByGrade = async (gradeId) => {
  try {
    const data = await teacherServices.getPlaylistsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// EXAMS FILTER ACTIONS (جديد)
// ============================================

const fetchExamsByGrade = async (gradeId) => {
  try {
    const data = await teacherServices.getExamsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOnlineExamsByGrade = async (gradeId) => {
  try {
    const data = await teacherServices.getOnlineExamsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamStats = async (examId) => {
  try {
    const data = await teacherServices.getExamStats(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamResultsByGrade = async (gradeId) => {
  try {
    const data = await teacherServices.getGradeExamResultsStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeExamResultsStats = async (gradeId) => {
  try {
    const data = await teacherServices.getGradeExamResultsStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ATTENDANCE ACTIONS
// ============================================

const fetchAttendanceDashboard = async () => {
  try {
    const data = await teacherServices.getAttendanceDashboard();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceOverview = async () => {
  try {
    const [overall, consecutiveAbsences] = await Promise.all([
      teacherServices.getAttendanceOverall(),
      teacherServices.getConsecutiveAbsences(),
    ]);
    return { success: true, data: { overall, consecutiveAbsences } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeAttendance = async (gradeId) => {
  try {
    const data = await teacherServices.getGradeAttendance(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupAttendanceByDate = async (groupId, date) => {
  try {
    const data = await teacherServices.getGroupAttendanceByDate(groupId, date);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupAttendanceByMonth = async (groupId, month) => {
  try {
    const data = await teacherServices.getGroupAttendanceByMonth(
      groupId,
      month,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceSummary = async (groupId, date) => {
  try {
    const data = await teacherServices.getAttendanceSummary(groupId, date);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// COURSES ACTIONS
// ============================================

const fetchCourses = async () => {
  try {
    const [videos, playlists] = await Promise.all([
      teacherServices.getVideos(),
      teacherServices.getPlaylists(),
    ]);
    return { success: true, data: { videos, playlists } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistDetails = async (playlistId) => {
  try {
    const [playlist, videos] = await Promise.all([
      teacherServices.getPlaylistById(playlistId),
      teacherServices.getPlaylistVideos(playlistId),
    ]);
    return { success: true, data: { playlist, videos } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchVideoById = async (videoId) => {
  try {
    const data = await teacherServices.getVideoById(videoId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// EXAMS ACTIONS
// ============================================

const fetchAllExams = async () => {
  try {
    const [paperExams, onlineExams] = await Promise.all([
      teacherServices.getExams(),
      teacherServices.getOnlineExams(),
    ]);
    return { success: true, data: { paperExams, onlineExams } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaperExamResults = async (examId) => {
  try {
    const [results, stats] = await Promise.all([
      teacherServices.getExamResults(examId),
      teacherServices.getExamResultStats(examId),
    ]);
    return { success: true, data: { results, stats } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOnlineExamStats = async (examId) => {
  try {
    const [attempts, stats] = await Promise.all([
      teacherServices.getStudentExams(examId),
      teacherServices.getOnlineExamStats(examId),
    ]);
    return { success: true, data: { attempts, stats } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// HOMEWORK ACTIONS
// ============================================

const fetchAllHomework = async () => {
  try {
    const assignments = await teacherServices.getAssignments();
    return { success: true, data: assignments };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentsByGrade = async (gradeId) => {
  try {
    const data = await teacherServices.getAssignmentsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentDetails = async (assignmentId) => {
  try {
    const [assignment, submissions, stats] = await Promise.all([
      teacherServices.getAssignmentById(assignmentId),
      teacherServices.getSubmissions(assignmentId),
      teacherServices.getSubmissionStats(assignmentId),
    ]);
    return { success: true, data: { assignment, submissions, stats } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// PROFILE ACTIONS
// ============================================

const changeTeacherPassword = async (
  oldPassword,
  newPassword,
  confirmPassword,
) => {
  try {
    const response = await teacherServices.updateTeacherPassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateTeacherProfileImageAction = async (formData) => {
  try {
    const data = await teacherServices.updateTeacherProfileImage(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteTeacherProfileImageAction = async () => {
  try {
    const data = await teacherServices.deleteTeacherProfileImage();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// DOWNLOAD & PREVIEW ACTIONS
// ============================================

const downloadAssignment = (assignmentId) => {
  return `${apiUrl}/teacher/assignments/${assignmentId}/download`;
};

const downloadVideoFile = (videoId) => {
  return `${apiUrl}/teacher/videos/${videoId}/download`;
};

const downloadQuestionFile = (questionId) => {
  return `${apiUrl}/teacher/questions/${questionId}/download`;
};

const previewAssignment = (assignmentId) => {
  return `${apiUrl}/teacher/assignments/${assignmentId}/preview`;
};

const previewVideoFile = (videoId) => {
  return `${apiUrl}/teacher/videos/${videoId}/preview`;
};

const previewQuestionFile = (questionId) => {
  return `${apiUrl}/teacher/questions/${questionId}/preview`;
};

const previewStudentAnswer = (answerId) => {
  return `${apiUrl}/teacher/student-answers/${answerId}/preview`;
};
// ============================================
// DOWNLOAD & PREVIEW ACTIONS
// ============================================

const downloadAssignmentAction = async (assignmentId) => {
  const url = `${apiUrl}/teacher/assignments/${assignmentId}/download`;
  return await downloadFile(url);
};

const downloadVideoFileAction = async (videoId) => {
  const url = `${apiUrl}/teacher/videos/${videoId}/download`;
  return await downloadFile(url);
};

const downloadQuestionFileAction = async (questionId) => {
  const url = `${apiUrl}/teacher/questions/${questionId}/download`;
  return await downloadFile(url);
};

const previewAssignmentAction = async (assignmentId) => {
  const url = `${apiUrl}/teacher/assignments/${assignmentId}/preview`;
  return await previewFile(url);
};

const previewVideoFileAction = async (videoId) => {
  const url = `${apiUrl}/teacher/videos/${videoId}/preview`;
  return await previewFile(url);
};

const previewQuestionFileAction = async (questionId) => {
  const url = `${apiUrl}/teacher/questions/${questionId}/preview`;
  return await previewFile(url);
};

const previewStudentAnswerAction = async (answerId) => {
  const url = `${apiUrl}/teacher/student-answers/${answerId}/preview`;
  return await previewFile(url);
};

export {
  fetchTeacherProfile,
  fetchTeacherDashboard,
  fetchActivityLog,
  fetchAssistants,
  fetchAssistantById,
  fetchDashboardStats,
  fetchAllStudents,
  searchStudentByBarcode,
  downloadAssignmentAction,
  downloadVideoFileAction,
  downloadQuestionFileAction,
  previewAssignmentAction,
  previewVideoFileAction,
  previewQuestionFileAction,
  previewStudentAnswerAction,
  searchStudentByPhone,
  fetchStudentDetails,
  fetchStudentFullDetails,
  fetchStudentFilters,
  fetchStudentAttendance,
  fetchStudentPayments,
  fetchStudentPaperExams,
  fetchStudentExamResults,
  fetchStudentOnlineExams,
  fetchStudentAssignments,
  fetchStudentSubmissions,
  fetchVideosByGrade,
  fetchPlaylistsByGrade,
  fetchExamsByGrade,
  fetchOnlineExamsByGrade,
  fetchExamStats,
  fetchExamResultsByGrade,
  fetchGradeExamResultsStats,
  fetchAttendanceDashboard,
  fetchAttendanceOverview,
  fetchGradeAttendance,
  fetchGroupAttendanceByDate,
  fetchGroupAttendanceByMonth,
  fetchAttendanceSummary,
  fetchCourses,
  fetchPlaylistDetails,
  fetchVideoById,
  fetchAllExams,
  fetchPaperExamResults,
  fetchOnlineExamStats,
  fetchAllHomework,
  fetchAssignmentsByGrade,
  fetchAssignmentDetails,
  changeTeacherPassword,
  updateTeacherProfileImageAction,
  deleteTeacherProfileImageAction,
  downloadAssignment,
  downloadVideoFile,
  downloadQuestionFile,
  previewAssignment,
  previewVideoFile,
  previewQuestionFile,
  previewStudentAnswer,
};
