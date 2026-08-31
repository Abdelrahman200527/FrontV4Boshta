import { httpGet, httpPut, httpDelete, httpPutFormData } from "../http";
import config from "../../config";

const { apiUrl } = config;

const getTeacherProfile = async () => {
  const response = await httpGet("/teacher/profile");
  return response.data;
};

const getTeacherDashboard = async () => {
  const response = await httpGet("/teacher/dashboard");
  return response.data;
};

const getActivityLog = async (entityType = "", date = "", page = 1) => {
  const params = new URLSearchParams();
  if (entityType) params.append("entity_type", entityType);
  if (date) params.append("date", date);
  params.append("page", page);
  const response = await httpGet(`/teacher/activity-log?${params.toString()}`);
  return response;
};

const getTeacherProfileImage = async () => {
  const response = await httpGet("/teacher/profile-image");
  return response.data;
};

const updateTeacherProfileImage = async (formData) => {
  const response = await httpPutFormData("/teacher/profile-image", formData);
  return response.data;
};

const deleteTeacherProfileImage = async () => {
  const response = await httpDelete("/teacher/profile-image");
  return response.data;
};

const updateTeacherPassword = async (
  oldPassword,
  newPassword,
  confirmPassword,
) => {
  const response = await httpPut("/teacher/password", {
    oldPassword,
    password: newPassword,
    confirmPassword,
  });
  return response;
};

const getAssistants = async () => {
  const response = await httpGet("/teacher/assistants");
  return response.data;
};

const getAssistantById = async (assistantId) => {
  const response = await httpGet(`/teacher/assistants/${assistantId}`);
  return response.data;
};

const getGrades = async () => {
  const response = await httpGet("/teacher/grades");
  return response.data;
};

const getGradesWithGroupsCount = async () => {
  const response = await httpGet("/teacher/grades/groups-count");
  return response.data;
};

const getGradesWithStudentsCount = async () => {
  const response = await httpGet("/teacher/grades/students-count");
  return response.data;
};

const getAllGradesStats = async () => {
  const response = await httpGet("/teacher/grades/stats");
  return response.data;
};

const getGradeById = async (gradeId) => {
  const response = await httpGet(`/teacher/grades/${gradeId}`);
  return response.data;
};

const getGradeStats = async (gradeId) => {
  const response = await httpGet(`/teacher/grades/${gradeId}/stats`);
  return response.data;
};

const getGroups = async () => {
  const response = await httpGet("/teacher/groups");
  return response.data;
};

const getGroupsWithGradeName = async () => {
  const response = await httpGet("/teacher/groups/with-grade-name");
  return response.data;
};

const getGroupsWithStudentsCount = async () => {
  const response = await httpGet("/teacher/groups/students-count");
  return response.data;
};

const getAllGroupsStats = async () => {
  const response = await httpGet("/teacher/groups/stats");
  return response.data;
};

const getGroupFullStats = async (groupId) => {
  const response = await httpGet(`/teacher/groups/${groupId}/full-stats`);
  return response.data;
};

const getGroupsByGrade = async (gradeId) => {
  const response = await httpGet(`/teacher/groups/grade/${gradeId}`);
  return response.data;
};

const getGroupById = async (groupId) => {
  const response = await httpGet(`/teacher/groups/${groupId}`);
  return response.data;
};

const getGroupStats = async (groupId) => {
  const response = await httpGet(`/teacher/groups/${groupId}/stats`);
  return response.data;
};

const getStudents = async (
  page = 1,
  search = "",
  gradeId = "",
  groupId = "",
) => {
  const params = new URLSearchParams();
  params.append("page", page);
  if (search) params.append("search", search);
  if (gradeId) params.append("grade_id", gradeId);
  if (groupId) params.append("group_id", groupId);
  const response = await httpGet(`/teacher/students?${params.toString()}`);
  return response;
};

const searchStudentByBarcode = async (barcode) => {
  const response = await httpGet(
    `/teacher/students/search/barcode?barcode=${barcode}`,
  );
  return response.data;
};

const searchStudentByPhone = async (phone) => {
  const response = await httpGet(
    `/teacher/students/search/phone?phone=${phone}`,
  );
  return response.data;
};

const getStudentsByGrade = async (gradeId) => {
  const response = await httpGet(`/teacher/students/grade/${gradeId}`);
  return response.data;
};

const getStudentsByGroup = async (groupId) => {
  const response = await httpGet(`/teacher/students/group/${groupId}`);
  return response.data;
};

const getStudentById = async (studentId) => {
  const response = await httpGet(`/teacher/students/${studentId}`);
  return response.data;
};

const getStudentProfile = async (studentId) => {
  const response = await httpGet(`/teacher/students/${studentId}/profile`);
  return response.data;
};

const getStudentStats = async (studentId) => {
  const response = await httpGet(`/teacher/students/${studentId}/stats`);
  return response.data;
};

const getStudentAttendanceHistory = async (studentId) => {
  const response = await httpGet(`/teacher/students/${studentId}/attendance`);
  return response.data;
};

const getStudentMonthlyAttendance = async (studentId) => {
  const response = await httpGet(
    `/teacher/students/${studentId}/attendance/monthly`,
  );
  return response.data;
};

const getStudentPayments = async (studentId) => {
  const response = await httpGet(`/teacher/students/${studentId}/payments`);
  return response.data;
};

const getStudentPaymentsBalance = async (studentId) => {
  const response = await httpGet(
    `/teacher/students/${studentId}/payments/balance`,
  );
  return response.data;
};

const getStudentPaperExams = async (studentId) => {
  const response = await httpGet(`/teacher/students/${studentId}/exams/paper`);
  return response.data;
};

const getStudentExamResults = async (studentId) => {
  const response = await httpGet(
    `/teacher/students/${studentId}/exams/results`,
  );
  return response.data;
};

const getStudentOnlineExams = async (studentId) => {
  const response = await httpGet(
    `/teacher/students/${studentId}/exams/online/history`,
  );
  return response.data;
};

const getStudentAssignments = async (studentId) => {
  const response = await httpGet(`/teacher/students/${studentId}/assignments`);
  return response.data;
};

const getStudentSubmissions = async (studentId) => {
  const response = await httpGet(`/teacher/students/${studentId}/submissions`);
  return response.data;
};

const getStudentFullDetails = async (studentId) => {
  const [
    profile,
    stats,
    attendance,
    monthlyAttendance,
    payments,
    balance,
    paperExams,
    examResults,
    onlineExams,
    assignments,
    submissions,
  ] = await Promise.all([
    getStudentProfile(studentId),
    getStudentStats(studentId),
    getStudentAttendanceHistory(studentId),
    getStudentMonthlyAttendance(studentId),
    getStudentPayments(studentId),
    getStudentPaymentsBalance(studentId),
    getStudentPaperExams(studentId),
    getStudentExamResults(studentId),
    getStudentOnlineExams(studentId),
    getStudentAssignments(studentId),
    getStudentSubmissions(studentId),
  ]);

  return {
    profile,
    stats,
    attendance,
    monthlyAttendance,
    payments,
    balance,
    paperExams,
    examResults,
    onlineExams,
    assignments,
    submissions,
  };
};

const getAttendanceDashboard = async () => {
  const response = await httpGet("/teacher/attendance/dashboard");
  return response.data;
};

const getAttendanceOverall = async () => {
  const response = await httpGet("/teacher/attendance/overall-stats");
  return response.data;
};

const getConsecutiveAbsences = async () => {
  const response = await httpGet("/teacher/attendance/consecutive-absences");
  return response.data;
};

const getGradeAttendance = async (gradeId) => {
  const response = await httpGet(`/teacher/attendance/grade/${gradeId}/stats`);
  return response.data;
};

const getGroupAttendanceByDate = async (groupId, date) => {
  const response = await httpGet(
    `/teacher/attendance/group/${groupId}/date/${date}`,
  );
  return response.data;
};

const getGroupAttendanceByMonth = async (groupId, month) => {
  const response = await httpGet(
    `/teacher/attendance/group/${groupId}/month/${month}`,
  );
  return response.data;
};

const getAttendanceSummary = async (groupId, date) => {
  const response = await httpGet(
    `/teacher/attendance/summary/group/${groupId}/date/${date}`,
  );
  return response.data;
};

const getPayments = async (
  page = 1,
  search = "",
  gradeId = "",
  groupId = "",
) => {
  const params = new URLSearchParams();
  params.append("page", page);
  if (search) params.append("search", search);
  if (gradeId) params.append("grade_id", gradeId);
  if (groupId) params.append("group_id", groupId);
  const response = await httpGet(`/teacher/payments?${params.toString()}`);
  return response;
};

const getPaymentCollections = async () => {
  const response = await httpGet("/teacher/payments/collections");
  return response.data;
};

const getUnpaidStudents = async () => {
  const response = await httpGet("/teacher/payments/unpaid");
  return response.data;
};

const getPaymentOverall = async () => {
  const response = await httpGet("/teacher/payments/overall");
  return response.data;
};

const getStudentsPaymentStatus = async () => {
  const response = await httpGet("/teacher/payments/students-status");
  return response.data;
};

const getGradePaymentStats = async (gradeId) => {
  const response = await httpGet(`/teacher/payments/grade/${gradeId}/stats`);
  return response.data;
};

const getGroupPaymentStats = async (groupId) => {
  const response = await httpGet(`/teacher/payments/group/${groupId}/stats`);
  return response.data;
};

const getSubscriptionOverall = async () => {
  const response = await httpGet("/teacher/subscriptions/overall");
  return response.data;
};

const getStudentsWithoutSubscription = async () => {
  const response = await httpGet("/teacher/subscriptions/without-current");
  return response.data;
};

const getSubscriptionsByMonth = async (month) => {
  const response = await httpGet(`/teacher/subscriptions/month/${month}`);
  return response.data;
};

const getGradeSubscriptionStats = async (gradeId) => {
  const response = await httpGet(
    `/teacher/subscriptions/grade/${gradeId}/stats`,
  );
  return response.data;
};

const getGroupSubscriptionStats = async (groupId) => {
  const response = await httpGet(
    `/teacher/subscriptions/group/${groupId}/stats`,
  );
  return response.data;
};

const getStudentSubscriptions = async (studentId) => {
  const response = await httpGet(`/teacher/subscriptions/student/${studentId}`);
  return response.data;
};

const getExams = async () => {
  const response = await httpGet("/teacher/exams");
  return response.data;
};

const getExamsByGrade = async (gradeId) => {
  const response = await httpGet(`/teacher/exams/grade/${gradeId}`);
  return response.data;
};

const getExamsByGroup = async (groupId) => {
  const response = await httpGet(`/teacher/exams/group/${groupId}`);
  return response.data;
};

const getExamById = async (examId) => {
  const response = await httpGet(`/teacher/exams/${examId}`);
  return response.data;
};

const getExamStats = async (examId) => {
  const response = await httpGet(`/teacher/exams/${examId}/stats`);
  return response.data;
};

const getGradeExamResultsStats = async (gradeId) => {
  const response = await httpGet(
    `/teacher/exam-results/grade/${gradeId}/stats`,
  );
  return response.data;
};

const getGroupExamResultsStats = async (groupId) => {
  const response = await httpGet(
    `/teacher/exam-results/group/${groupId}/stats`,
  );
  return response.data;
};

const getExamResults = async (examId) => {
  const response = await httpGet(`/teacher/exam-results/exam/${examId}`);
  return response.data;
};

const getExamResultStats = async (examId) => {
  const response = await httpGet(`/teacher/exam-results/exam/${examId}/stats`);
  return response.data;
};

const getOnlineExams = async () => {
  const response = await httpGet("/teacher/online-exams");
  return response.data;
};

const getAvailableOnlineExams = async () => {
  const response = await httpGet("/teacher/online-exams/available");
  return response.data;
};

const getExpiredOnlineExams = async () => {
  const response = await httpGet("/teacher/online-exams/expired");
  return response.data;
};

const getOnlineExamsByGrade = async (gradeId) => {
  const response = await httpGet(`/teacher/online-exams/grade/${gradeId}`);
  return response.data;
};

const getOnlineExamsByGroup = async (groupId) => {
  const response = await httpGet(`/teacher/online-exams/group/${groupId}`);
  return response.data;
};

const getGradeOnlineExamStats = async (gradeId) => {
  const response = await httpGet(
    `/teacher/online-exams/stats/grade/${gradeId}`,
  );
  return response.data;
};

const getOnlineExamStats = async (examId) => {
  const response = await httpGet(`/teacher/online-exams/stats/${examId}`);
  return response.data;
};

const getOnlineExamById = async (examId) => {
  const response = await httpGet(`/teacher/online-exams/${examId}`);
  return response.data;
};

const getQuestionsByExam = async (examId) => {
  const response = await httpGet(`/teacher/questions/exam/${examId}`);
  return response.data;
};

const getQuestionById = async (questionId) => {
  const response = await httpGet(`/teacher/questions/${questionId}`);
  return response.data;
};

const getOptionsByQuestion = async (questionId) => {
  const response = await httpGet(`/teacher/options/question/${questionId}`);
  return response.data;
};

const getOptionById = async (optionId) => {
  const response = await httpGet(`/teacher/options/${optionId}`);
  return response.data;
};

const getStudentExams = async (examId) => {
  const response = await httpGet(`/teacher/student-exams/exam/${examId}`);
  return response.data;
};

const getStudentExamStats = async (examId) => {
  const response = await httpGet(`/teacher/student-exams/exam/${examId}/stats`);
  return response.data;
};

const getGradeStudentExamStats = async (gradeId) => {
  const response = await httpGet(
    `/teacher/student-exams/grade/${gradeId}/stats`,
  );
  return response.data;
};

const getGroupStudentExamStats = async (groupId) => {
  const response = await httpGet(
    `/teacher/student-exams/group/${groupId}/stats`,
  );
  return response.data;
};

const getQuestionAnswerStats = async (questionId) => {
  const response = await httpGet(
    `/teacher/student-answers/question/${questionId}/stats`,
  );
  return response.data;
};

const getQuestionMostSelectedOptions = async (questionId) => {
  const response = await httpGet(
    `/teacher/student-answers/question/${questionId}/options`,
  );
  return response.data;
};

const getAssignments = async () => {
  const response = await httpGet("/teacher/assignments");
  return response.data;
};

const getAssignmentsByGrade = async (gradeId) => {
  const response = await httpGet(`/teacher/assignments/grade/${gradeId}`);
  return response.data;
};

const getAssignmentsByGroup = async (groupId) => {
  const response = await httpGet(`/teacher/assignments/group/${groupId}`);
  return response.data;
};

const getAssignmentById = async (assignmentId) => {
  const response = await httpGet(`/teacher/assignments/${assignmentId}`);
  return response.data;
};

const getGradeSubmissionStats = async (gradeId) => {
  const response = await httpGet(
    `/teacher/assignment-submissions/stats/grade/${gradeId}`,
  );
  return response.data;
};

const getGroupSubmissionStats = async (groupId) => {
  const response = await httpGet(
    `/teacher/assignment-submissions/stats/group/${groupId}`,
  );
  return response.data;
};

const getSubmissions = async (assignmentId) => {
  const response = await httpGet(
    `/teacher/assignment-submissions/assignment/${assignmentId}`,
  );
  return response.data;
};

const getStudentSubmission = async (assignmentId, studentId) => {
  const response = await httpGet(
    `/teacher/assignment-submissions/assignment/${assignmentId}/student/${studentId}`,
  );
  return response.data;
};

const getSubmissionStats = async (assignmentId) => {
  const response = await httpGet(
    `/teacher/assignment-submissions/stats/assignment/${assignmentId}`,
  );
  return response.data;
};

const getVideos = async () => {
  const response = await httpGet("/teacher/videos");
  return response.data;
};

const getVideosByGrade = async (gradeId) => {
  const response = await httpGet(`/teacher/videos/grade/${gradeId}`);
  return response.data;
};

const getVideoById = async (videoId) => {
  const response = await httpGet(`/teacher/videos/${videoId}`);
  return response.data;
};

const getPlaylists = async () => {
  const response = await httpGet("/teacher/playlists");
  return response.data;
};

const getPlaylistsByGrade = async (gradeId) => {
  const response = await httpGet(`/teacher/playlists/grade/${gradeId}`);
  return response.data;
};

const getPlaylistById = async (playlistId) => {
  const response = await httpGet(`/teacher/playlists/${playlistId}`);
  return response.data;
};

const getPlaylistVideos = async (playlistId) => {
  const response = await httpGet(
    `/teacher/playlist-videos/playlist/${playlistId}`,
  );
  return response.data;
};

// ============================================
// DOWNLOAD & PREVIEW SERVICES (جديد)
// ============================================

const getDownloadUrl = (type, id) => {
  const urls = {
    assignment: `/teacher/assignments/${id}/download`,
    video: `/teacher/videos/${id}/download`,
    question: `/teacher/questions/${id}/download`,
  };
  return `${apiUrl}${urls[type]}`;
};

const getPreviewUrl = (type, id) => {
  const urls = {
    assignment: `/teacher/assignments/${id}/preview`,
    video: `/teacher/videos/${id}/preview`,
    question: `/teacher/questions/${id}/preview`,
    answer: `/teacher/student-answers/${id}/preview`,
  };
  return `${apiUrl}${urls[type]}`;
};

export {
  getTeacherProfile,
  getTeacherDashboard,
  getActivityLog,
  getTeacherProfileImage,
  updateTeacherProfileImage,
  deleteTeacherProfileImage,
  updateTeacherPassword,
  getAssistants,
  getAssistantById,
  getGrades,
  getGradesWithGroupsCount,
  getGradesWithStudentsCount,
  getAllGradesStats,
  getGradeById,
  getGradeStats,
  getGroups,
  getGroupsWithGradeName,
  getGroupsWithStudentsCount,
  getAllGroupsStats,
  getGroupFullStats,
  getGroupsByGrade,
  getGroupById,
  getGroupStats,
  getStudents,
  searchStudentByBarcode,
  searchStudentByPhone,
  getStudentsByGrade,
  getStudentsByGroup,
  getStudentById,
  getStudentProfile,
  getStudentStats,
  getStudentAttendanceHistory,
  getStudentMonthlyAttendance,
  getStudentPayments,
  getStudentPaymentsBalance,
  getStudentPaperExams,
  getStudentExamResults,
  getStudentOnlineExams,
  getStudentAssignments,
  getStudentSubmissions,
  getStudentFullDetails,
  getAttendanceDashboard,
  getAttendanceOverall,
  getConsecutiveAbsences,
  getGradeAttendance,
  getGroupAttendanceByDate,
  getGroupAttendanceByMonth,
  getAttendanceSummary,
  getPayments,
  getPaymentCollections,
  getUnpaidStudents,
  getPaymentOverall,
  getStudentsPaymentStatus,
  getGradePaymentStats,
  getGroupPaymentStats,
  getSubscriptionOverall,
  getStudentsWithoutSubscription,
  getSubscriptionsByMonth,
  getGradeSubscriptionStats,
  getGroupSubscriptionStats,
  getStudentSubscriptions,
  getExams,
  getExamsByGrade,
  getExamsByGroup,
  getExamById,
  getExamStats,
  getGradeExamResultsStats,
  getGroupExamResultsStats,
  getExamResults,
  getExamResultStats,
  getOnlineExams,
  getAvailableOnlineExams,
  getExpiredOnlineExams,
  getOnlineExamsByGrade,
  getOnlineExamsByGroup,
  getGradeOnlineExamStats,
  getOnlineExamStats,
  getOnlineExamById,
  getQuestionsByExam,
  getQuestionById,
  getOptionsByQuestion,
  getOptionById,
  getStudentExams,
  getStudentExamStats,
  getGradeStudentExamStats,
  getGroupStudentExamStats,
  getQuestionAnswerStats,
  getQuestionMostSelectedOptions,
  getAssignments,
  getAssignmentsByGrade,
  getAssignmentsByGroup,
  getAssignmentById,
  getGradeSubmissionStats,
  getGroupSubmissionStats,
  getSubmissions,
  getStudentSubmission,
  getSubmissionStats,
  getVideos,
  getVideosByGrade,
  getVideoById,
  getPlaylists,
  getPlaylistsByGrade,
  getPlaylistById,
  getPlaylistVideos,
  getDownloadUrl,
  getPreviewUrl,
};
