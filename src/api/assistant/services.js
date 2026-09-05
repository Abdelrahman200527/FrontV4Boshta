// src/api/assistant/services.js
import {
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  httpPostFormData,
  httpPutFormData,
} from "../http";
import { getCookie } from "../../utils/cookies";
import config from "../../config";

const { apiUrl, apiUserName, apiPassword } = config;

const getAuthHeaders = () => {
  const token = getCookie("auth_token");
  const credential = btoa(`${apiUserName}:${apiPassword}`);

  return {
    Authorization: `Basic ${credential}`,
    "x-client-key": token || "",
  };
};

const downloadBlobFile = async (url, fileName) => {
  const response = await fetch(`${apiUrl}${url}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "فشل تحميل الملف");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);

  return { success: true };
};

const getAssistantProfile = async () => {
  const response = await httpGet("/assistant/profile");
  return response.data;
};

const getAssistantDashboard = async () => {
  const response = await httpGet("/assistant/dashboard");
  return response.data;
};

const getActivityLog = async (entityType = "", date = "", page = 1) => {
  const params = new URLSearchParams();
  if (entityType) params.append("entity_type", entityType);
  if (date) params.append("date", date);
  params.append("page", page);
  const response = await httpGet(
    `/assistant/activity-log?${params.toString()}`,
  );
  return response;
};

const getAssistantProfileImage = async () => {
  const response = await httpGet("/assistant/profile-image");
  return response.data;
};

const updateAssistantProfileImage = async (formData) => {
  const response = await httpPutFormData("/assistant/profile-image", formData);
  return response.data;
};

const deleteAssistantProfileImage = async () => {
  const response = await httpDelete("/assistant/profile-image");
  return response.data;
};

const updateAssistantPassword = async (
  oldPassword,
  newPassword,
  confirmPassword,
) => {
  const response = await httpPut("/assistant/password", {
    oldPassword,
    password: newPassword,
    confirmPassword,
  });
  return response;
};

const getGrades = async () => {
  const response = await httpGet("/assistant/grades");
  return response.data;
};

const getGradesWithGroupsCount = async () => {
  const response = await httpGet("/assistant/grades/groups-count");
  return response.data;
};

const getGradesWithStudentsCount = async () => {
  const response = await httpGet("/assistant/grades/students-count");
  return response.data;
};

const getAllGradesStats = async () => {
  const response = await httpGet("/assistant/grades/stats");
  return response.data;
};

const findGradeByName = async (gradeName) => {
  const response = await httpPost("/assistant/grades/find", {
    name: gradeName,
  });
  return response.data;
};

const getGradeById = async (gradeId) => {
  const response = await httpGet(`/assistant/grades/${gradeId}`);
  return response.data;
};

const getGradeStats = async (gradeId) => {
  const response = await httpGet(`/assistant/grades/${gradeId}/stats`);
  return response.data;
};

const createGrade = async (gradeData) => {
  const response = await httpPost("/assistant/grades", gradeData);
  return response.data;
};

const updateGrade = async (gradeId, gradeData) => {
  const response = await httpPut(`/assistant/grades/${gradeId}`, gradeData);
  return response.data;
};

const softDeleteGrade = async (gradeId) => {
  const response = await httpDelete(`/assistant/grades/${gradeId}`);
  return response.data;
};

const hardDeleteGrade = async (gradeId) => {
  const response = await httpDelete(`/assistant/grades/${gradeId}/permanent`);
  return response.data;
};

const getGroups = async () => {
  const response = await httpGet("/assistant/groups");
  return response.data;
};

const getGroupsWithGradeName = async () => {
  const response = await httpGet("/assistant/groups/with-grade-name");
  return response.data;
};

const getGroupsWithStudentsCount = async () => {
  const response = await httpGet("/assistant/groups/students-count");
  return response.data;
};

const getAllGroupsStats = async () => {
  const response = await httpGet("/assistant/groups/stats");
  return response.data;
};

const getGroupFullStats = async (groupId) => {
  const response = await httpGet(`/assistant/groups/${groupId}/full-stats`);
  return response.data;
};

const findGroupByName = async (groupName) => {
  const response = await httpPost("/assistant/groups/find", {
    name: groupName,
  });
  return response.data;
};

const getGroupsByGrade = async (gradeId) => {
  const response = await httpGet(`/assistant/groups/grade/${gradeId}`);
  return response.data;
};

const getGroupById = async (groupId) => {
  const response = await httpGet(`/assistant/groups/${groupId}`);
  return response.data;
};

const getGroupStats = async (groupId) => {
  const response = await httpGet(`/assistant/groups/${groupId}/stats`);
  return response.data;
};

const createGroup = async (groupData) => {
  const response = await httpPost("/assistant/groups", groupData);
  return response.data;
};

const updateGroup = async (groupId, groupData) => {
  const response = await httpPut(`/assistant/groups/${groupId}`, groupData);
  return response.data;
};

const softDeleteGroup = async (groupId) => {
  const response = await httpDelete(`/assistant/groups/${groupId}`);
  return response.data;
};

const hardDeleteGroup = async (groupId) => {
  const response = await httpDelete(`/assistant/groups/${groupId}/permanent`);
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
  const response = await httpGet(`/assistant/students?${params.toString()}`);
  return response;
};

const getDeletedStudents = async (page = 1) => {
  const response = await httpGet(`/assistant/students/deleted?page=${page}`);
  return response;
};

const searchStudentByBarcode = async (barcode) => {
  const response = await httpGet(
    `/assistant/students/search/barcode?barcode=${barcode}`,
  );
  return response.data;
};

const searchStudentByPhone = async (phone) => {
  const response = await httpGet(
    `/assistant/students/search/phone?phone=${phone}`,
  );
  return response.data;
};

const searchStudentsByParentPhone = async (parentPhone) => {
  const response = await httpGet(
    `/assistant/students/search/parent-phone?parent_phone=${parentPhone}`,
  );
  return response.data;
};

const getStudentsByGrade = async (gradeId) => {
  const response = await httpGet(`/assistant/students/grade/${gradeId}`);
  return response.data;
};

const getStudentsByGroup = async (groupId) => {
  const response = await httpGet(`/assistant/students/group/${groupId}`);
  return response.data;
};

const getStudentById = async (studentId) => {
  const response = await httpGet(`/assistant/students/${studentId}`);
  return response.data;
};

const getStudentProfile = async (studentId) => {
  const response = await httpGet(`/assistant/students/${studentId}/profile`);
  return response.data;
};

const getStudentStats = async (studentId) => {
  const response = await httpGet(`/assistant/students/${studentId}/stats`);
  return response.data;
};

const getStudentAttendanceHistory = async (studentId) => {
  const response = await httpGet(`/assistant/students/${studentId}/attendance`);
  return response.data;
};

const getStudentMonthlyAttendance = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/attendance/monthly`,
  );
  return response.data;
};

const getStudentTotalAttendance = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/attendance/total`,
  );
  return response.data;
};

const getStudentConsecutiveAbsences = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/attendance/consecutive-absences`,
  );
  return response.data;
};

const getStudentPayments = async (studentId) => {
  const response = await httpGet(`/assistant/students/${studentId}/payments`);
  return response.data;
};

const getStudentPaymentsBalance = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/payments/balance`,
  );
  return response.data;
};

const getStudentCurrentSubscription = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/payments/current-subscription`,
  );
  return response.data;
};

const getStudentPaperExams = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/exams/paper`,
  );
  return response.data;
};

const getStudentPaperExamById = async (studentId, examId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/exams/paper/${examId}`,
  );
  return response.data;
};

const getStudentExamResults = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/exams/results`,
  );
  return response.data;
};

const getStudentOnlineExams = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/exams/online/history`,
  );
  return response.data;
};

const getStudentOnlineExamById = async (studentId, attemptId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/exams/online/${attemptId}`,
  );
  return response.data;
};

const getStudentAssignments = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/assignments`,
  );
  return response.data;
};

const getStudentAssignmentById = async (studentId, assignmentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/assignments/${assignmentId}`,
  );
  return response.data;
};

const getStudentSubmissions = async (studentId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/submissions`,
  );
  return response.data;
};

const getStudentSubmissionById = async (studentId, submissionId) => {
  const response = await httpGet(
    `/assistant/students/${studentId}/submissions/${submissionId}`,
  );
  return response.data;
};

const getStudentPlaylists = async (studentId) => {
  const response = await httpGet(`/assistant/students/${studentId}/playlists`);
  return response.data;
};

const getStudentFullDetails = async (studentId) => {
  const [profile, stats, attendance, payments, paperExams, onlineExams] =
    await Promise.all([
      getStudentProfile(studentId),
      getStudentStats(studentId),
      getStudentAttendanceHistory(studentId),
      getStudentPayments(studentId),
      getStudentPaperExams(studentId),
      getStudentOnlineExams(studentId),
    ]);
  return { profile, stats, attendance, payments, paperExams, onlineExams };
};

const createStudent = async (studentData) => {
  const response = await httpPost("/assistant/students", studentData);
  return response.data;
};

const updateStudent = async (studentId, studentData) => {
  const response = await httpPut(
    `/assistant/students/${studentId}`,
    studentData,
  );
  return response.data;
};

const softDeleteStudent = async (studentId) => {
  const response = await httpDelete(`/assistant/students/${studentId}`);
  return response.data;
};

const hardDeleteStudent = async (studentId) => {
  const response = await httpDelete(
    `/assistant/students/${studentId}/permanent`,
  );
  return response.data;
};

const restoreStudent = async (studentId) => {
  const response = await httpPost(`/assistant/students/${studentId}/restore`);
  return response.data;
};

const startAttendanceSession = async (sessionData) => {
  const response = await httpPost(
    "/assistant/attendance/sessions/start",
    sessionData,
  );
  return response.data;
};

const getActiveSession = async (groupId) => {
  const response = await httpGet(
    `/assistant/attendance/sessions/active/${groupId}`,
  );
  return response.data;
};

const toggleMakeupMode = async (sessionId) => {
  const response = await httpPut(
    `/assistant/attendance/sessions/${sessionId}/toggle-makeup`,
  );
  return response.data;
};

const scanBarcode = async (scanData) => {
  const response = await httpPost(
    "/assistant/attendance/scan-barcode",
    scanData,
  );
  return response.data;
};

const lockSession = async (sessionId, groupId) => {
  const response = await httpPost("/assistant/attendance/sessions/lock", {
    id: sessionId,
    groupId,
  });
  return response.data;
};

const createAttendance = async (attendanceData) => {
  const response = await httpPost("/assistant/attendance", attendanceData);
  return response.data;
};

const markRestAbsent = async (groupId, date) => {
  const response = await httpPost("/assistant/attendance/mark-rest-absent", {
    groupId,
    date,
  });
  return response.data;
};

const getAttendanceById = async (attendanceId) => {
  const response = await httpGet(`/assistant/attendance/${attendanceId}`);
  return response.data;
};

const updateAttendance = async (attendanceId, attendanceData) => {
  const response = await httpPut(
    `/assistant/attendance/${attendanceId}`,
    attendanceData,
  );
  return response.data;
};

const deleteAttendance = async (attendanceId) => {
  const response = await httpDelete(`/assistant/attendance/${attendanceId}`);
  return response.data;
};

const getAttendanceDashboard = async () => {
  const response = await httpGet("/assistant/attendance/dashboard");
  return response.data;
};

const getAttendanceOverall = async () => {
  const response = await httpGet("/assistant/attendance/overall-stats");
  return response.data;
};

const getConsecutiveAbsences = async () => {
  const response = await httpGet("/assistant/attendance/consecutive-absences");
  return response.data;
};

const getGradeAttendance = async (gradeId) => {
  const response = await httpGet(
    `/assistant/attendance/grade/${gradeId}/stats`,
  );
  return response.data;
};

const getGroupAttendanceByDate = async (groupId, date) => {
  const response = await httpGet(
    `/assistant/attendance/group/${groupId}/date/${date}`,
  );
  return response.data;
};

const getGroupAttendanceByMonth = async (groupId, month) => {
  const response = await httpGet(
    `/assistant/attendance/group/${groupId}/month/${month}`,
  );
  return response.data;
};

const getAttendanceSummary = async (groupId, date) => {
  const response = await httpGet(
    `/assistant/attendance/summary/group/${groupId}/date/${date}`,
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
  const response = await httpGet(`/assistant/payments?${params.toString()}`);
  return response;
};

const getPaymentById = async (paymentId) => {
  const response = await httpGet(`/assistant/payments/${paymentId}`);
  return response.data;
};

const createPayment = async (paymentData) => {
  const response = await httpPost("/assistant/payments", paymentData);
  return response.data;
};

const updatePayment = async (paymentId, paymentData) => {
  const response = await httpPut(
    `/assistant/payments/${paymentId}`,
    paymentData,
  );
  return response.data;
};

const deletePayment = async (paymentId) => {
  const response = await httpDelete(`/assistant/payments/${paymentId}`);
  return response.data;
};

const getPaymentCollections = async () => {
  const response = await httpGet("/assistant/payments/collections");
  return response.data;
};

const getUnpaidStudents = async () => {
  const response = await httpGet("/assistant/payments/unpaid");
  return response.data;
};

const getPaymentOverall = async () => {
  const response = await httpGet("/assistant/payments/overall");
  return response.data;
};

const getStudentsPaymentStatus = async () => {
  const response = await httpGet("/assistant/payments/students-status");
  return response.data;
};

const getGradePaymentStats = async (gradeId) => {
  const response = await httpGet(`/assistant/payments/grade/${gradeId}/stats`);
  return response.data;
};

const getGroupPaymentStats = async (groupId) => {
  const response = await httpGet(`/assistant/payments/group/${groupId}/stats`);
  return response.data;
};

const getPaymentsByGradeAndMonth = async (gradeId, month) => {
  const response = await httpGet(
    `/assistant/payments/grade/${gradeId}/month/${month}`,
  );
  return response.data;
};

const getPaymentsByGroupAndMonth = async (groupId, month) => {
  const response = await httpGet(
    `/assistant/payments/group/${groupId}/month/${month}`,
  );
  return response.data;
};

const createSubscription = async (subscriptionData) => {
  const response = await httpPost("/assistant/subscriptions", subscriptionData);
  return response.data;
};

const getSubscriptionOverall = async () => {
  const response = await httpGet("/assistant/subscriptions/overall");
  return response.data;
};

const getStudentsWithoutSubscription = async () => {
  const response = await httpGet("/assistant/subscriptions/without-current");
  return response.data;
};

const getStudentSubscriptions = async (studentId) => {
  const response = await httpGet(
    `/assistant/subscriptions/student/${studentId}`,
  );
  return response.data;
};

const getSubscriptionsByMonth = async (month) => {
  const response = await httpGet(`/assistant/subscriptions/month/${month}`);
  return response.data;
};

const getGradeSubscriptionStats = async (gradeId) => {
  const response = await httpGet(
    `/assistant/subscriptions/grade/${gradeId}/stats`,
  );
  return response.data;
};

const getGroupSubscriptionStats = async (groupId) => {
  const response = await httpGet(
    `/assistant/subscriptions/group/${groupId}/stats`,
  );
  return response.data;
};

const updateSubscriptionStatus = async (subscriptionId, status) => {
  const response = await httpPut(
    `/assistant/subscriptions/${subscriptionId}/status`,
    { status },
  );
  return response.data;
};

const deleteSubscription = async (subscriptionId) => {
  const response = await httpDelete(
    `/assistant/subscriptions/${subscriptionId}`,
  );
  return response.data;
};

const getExams = async (page = 1) => {
  const response = await httpGet(`/assistant/exams?page=${page}`);
  return response;
};

const getExamsByGrade = async (gradeId) => {
  const response = await httpGet(`/assistant/exams/grade/${gradeId}`);
  return response.data;
};

const getExamsByGroup = async (groupId) => {
  const response = await httpGet(`/assistant/exams/group/${groupId}`);
  return response.data;
};

const getGradeExamStats = async (gradeId) => {
  const response = await httpGet(`/assistant/exams/grade/${gradeId}/stats`);
  return response.data;
};

const getExamById = async (examId) => {
  const response = await httpGet(`/assistant/exams/${examId}`);
  return response.data;
};

const getExamStats = async (examId) => {
  const response = await httpGet(`/assistant/exams/${examId}/stats`);
  return response.data;
};

const createExam = async (examData) => {
  const response = await httpPost("/assistant/exams", examData);
  return response.data;
};

const updateExam = async (examId, examData) => {
  const response = await httpPut(`/assistant/exams/${examId}`, examData);
  return response.data;
};

const softDeleteExam = async (examId) => {
  const response = await httpDelete(`/assistant/exams/${examId}`);
  return response.data;
};

const hardDeleteExam = async (examId) => {
  const response = await httpDelete(`/assistant/exams/${examId}/permanent`);
  return response.data;
};

const createExamResult = async (resultData) => {
  const response = await httpPost("/assistant/exam-results", resultData);
  return response.data;
};

const upsertExamResult = async (resultData) => {
  const response = await httpPost("/assistant/exam-results/upsert", resultData);
  return response.data;
};

const upsertBatchExamResults = async (examId, records) => {
  const response = await httpPost(
    `/assistant/exam-results/upsert-batch/${examId}`,
    { records },
  );
  return response.data;
};

const updateExamResult = async (resultId, resultData) => {
  const response = await httpPut(
    `/assistant/exam-results/${resultId}`,
    resultData,
  );
  return response.data;
};

const deleteExamResult = async (resultId) => {
  const response = await httpDelete(`/assistant/exam-results/${resultId}`);
  return response.data;
};

const getExamResults = async (examId) => {
  const response = await httpGet(`/assistant/exam-results/exam/${examId}`);
  return response.data;
};

const getExamResultStats = async (examId) => {
  const response = await httpGet(
    `/assistant/exam-results/exam/${examId}/stats`,
  );
  return response.data;
};

const getGradeExamResultsStats = async (gradeId) => {
  const response = await httpGet(
    `/assistant/exam-results/grade/${gradeId}/stats`,
  );
  return response.data;
};

const getGroupExamResultsStats = async (groupId) => {
  const response = await httpGet(
    `/assistant/exam-results/group/${groupId}/stats`,
  );
  return response.data;
};

const getOnlineExams = async () => {
  const response = await httpGet("/assistant/online-exams");
  return response.data;
};

const getAvailableOnlineExams = async () => {
  const response = await httpGet("/assistant/online-exams/available");
  return response.data;
};

const getExpiredOnlineExams = async () => {
  const response = await httpGet("/assistant/online-exams/expired");
  return response.data;
};

const getOnlineExamsByGrade = async (gradeId) => {
  const response = await httpGet(`/assistant/online-exams/grade/${gradeId}`);
  return response.data;
};

const getOnlineExamsByGroup = async (groupId) => {
  const response = await httpGet(`/assistant/online-exams/group/${groupId}`);
  return response.data;
};

const getGradeOnlineExamStats = async (gradeId) => {
  const response = await httpGet(
    `/assistant/online-exams/stats/grade/${gradeId}`,
  );
  return response.data;
};

const getOnlineExamStats = async (examId) => {
  const response = await httpGet(`/assistant/online-exams/stats/${examId}`);
  return response.data;
};

const getOnlineExamById = async (examId) => {
  const response = await httpGet(`/assistant/online-exams/${examId}`);
  return response.data;
};

const createOnlineExam = async (examData) => {
  const response = await httpPost("/assistant/online-exams", examData);
  return response.data;
};

const updateOnlineExam = async (examId, examData) => {
  const response = await httpPut(`/assistant/online-exams/${examId}`, examData);
  return response.data;
};

const softDeleteOnlineExam = async (examId) => {
  const response = await httpDelete(`/assistant/online-exams/${examId}`);
  return response.data;
};

const hardDeleteOnlineExam = async (examId) => {
  const response = await httpDelete(
    `/assistant/online-exams/${examId}/permanent`,
  );
  return response.data;
};

const getQuestionsByExam = async (examId) => {
  const response = await httpGet(`/assistant/questions/exam/${examId}`);
  return response.data;
};

const getQuestionById = async (questionId) => {
  const response = await httpGet(`/assistant/questions/${questionId}`);
  return response.data;
};

const downloadQuestionFile = async (questionId) => {
  const response = await httpGet(`/assistant/questions/${questionId}/download`);
  return response;
};

const createQuestion = async (questionData) => {
  const response = await httpPost("/assistant/questions", questionData);
  return response.data;
};

const buildQuestionFormData = (questionData, file) => {
  const formData = new FormData();
  Object.entries(questionData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (file) formData.append("file", file);
  return formData;
};

const createQuestionWithFile = async (questionData, file) => {
  const response = await httpPostFormData(
    "/assistant/questions",
    buildQuestionFormData(questionData, file),
  );
  return response.data;
};

const updateQuestionWithFile = async (questionId, questionData, file) => {
  const response = await httpPutFormData(
    `/assistant/questions/${questionId}`,
    buildQuestionFormData(questionData, file),
  );
  return response.data;
};

const updateQuestion = async (questionId, questionData) => {
  const response = await httpPut(
    `/assistant/questions/${questionId}`,
    questionData,
  );
  return response.data;
};

const deleteQuestion = async (questionId) => {
  const response = await httpDelete(`/assistant/questions/${questionId}`);
  return response.data;
};

const getOptionsByQuestion = async (questionId) => {
  const response = await httpGet(`/assistant/options/question/${questionId}`);
  return response.data;
};

const getOptionById = async (optionId) => {
  const response = await httpGet(`/assistant/options/${optionId}`);
  return response.data;
};

const createOption = async (optionData) => {
  const response = await httpPost("/assistant/options", optionData);
  return response.data;
};

const updateOption = async (optionId, optionData) => {
  const response = await httpPut(`/assistant/options/${optionId}`, optionData);
  return response.data;
};

const deleteOption = async (optionId) => {
  const response = await httpDelete(`/assistant/options/${optionId}`);
  return response.data;
};

const getPendingEssayAnswers = async () => {
  const response = await httpGet("/assistant/student-answers/essay/pending");
  return response.data;
};

const getEssayAnswersByExam = async (examId) => {
  const response = await httpGet(
    `/assistant/student-answers/essay/exam/${examId}`,
  );
  return response.data;
};

const gradeEssayAnswer = async (answerId, isCorrect) => {
  const attempts = [
    { is_correct: Boolean(isCorrect) },
    { is_correct: isCorrect ? 1 : 0 },
    { is_correct: isCorrect ? "1" : "0" },
  ];
  let lastError;
  for (const body of attempts) {
    try {
      const response = await httpPut(
        `/assistant/student-answers/${answerId}/grade`,
        body,
      );
      return response.data;
    } catch (error) {
      lastError = error;
      if (error.status && error.status !== 400) throw error;
    }
  }
  throw lastError;
};

const getStudentExams = async (examId) => {
  const response = await httpGet(`/assistant/student-exams/exam/${examId}`);
  return response.data;
};

const getStudentExamStats = async (examId) => {
  const response = await httpGet(
    `/assistant/student-exams/exam/${examId}/stats`,
  );
  return response.data;
};

const getGradeStudentExamStats = async (gradeId) => {
  const response = await httpGet(
    `/assistant/student-exams/grade/${gradeId}/stats`,
  );
  return response.data;
};

const getGroupStudentExamStats = async (groupId) => {
  const response = await httpGet(
    `/assistant/student-exams/group/${groupId}/stats`,
  );
  return response.data;
};

const getQuestionAnswerStats = async (questionId) => {
  const response = await httpGet(
    `/assistant/student-answers/question/${questionId}/stats`,
  );
  return response.data;
};

const getQuestionMostSelectedOptions = async (questionId) => {
  const response = await httpGet(
    `/assistant/student-answers/question/${questionId}/options`,
  );
  return response.data;
};

const getAssignments = async () => {
  const response = await httpGet("/assistant/assignments");
  return response.data;
};

const getAssignmentsByGrade = async (gradeId) => {
  const response = await httpGet(`/assistant/assignments/grade/${gradeId}`);
  return response.data;
};

const getAssignmentsByGroup = async (groupId) => {
  const response = await httpGet(`/assistant/assignments/group/${groupId}`);
  return response.data;
};

const downloadAssignment = async (assignmentId) => {
  const response = await httpGet(
    `/assistant/assignments/${assignmentId}/download`,
  );
  return response;
};

const getAssignmentById = async (assignmentId) => {
  const response = await httpGet(`/assistant/assignments/${assignmentId}`);
  return response.data;
};

const createAssignment = async (formData) => {
  const response = await httpPostFormData("/assistant/assignments", formData);
  return response.data;
};

const updateAssignment = async (assignmentId, formData) => {
  const response = await httpPutFormData(
    `/assistant/assignments/${assignmentId}`,
    formData,
  );
  return response.data;
};

const softDeleteAssignment = async (assignmentId) => {
  const response = await httpDelete(`/assistant/assignments/${assignmentId}`);
  return response.data;
};

const hardDeleteAssignment = async (assignmentId) => {
  const response = await httpDelete(
    `/assistant/assignments/${assignmentId}/permanent`,
  );
  return response.data;
};

const getGradeSubmissionStats = async (gradeId) => {
  const response = await httpGet(
    `/assistant/assignment-submissions/stats/grade/${gradeId}`,
  );
  return response.data;
};

const getGroupSubmissionStats = async (groupId) => {
  const response = await httpGet(
    `/assistant/assignment-submissions/stats/group/${groupId}`,
  );
  return response.data;
};

const getSubmissions = async (assignmentId) => {
  const response = await httpGet(
    `/assistant/assignment-submissions/assignment/${assignmentId}`,
  );
  return response.data;
};

const getStudentSubmission = async (assignmentId, studentId) => {
  const response = await httpGet(
    `/assistant/assignment-submissions/assignment/${assignmentId}/student/${studentId}`,
  );
  return response.data;
};

const getSubmittedStudents = async (assignmentId) => {
  const response = await httpGet(
    `/assistant/assignment-submissions/assignment/${assignmentId}/submitted-students`,
  );
  return response.data;
};

const getNotSubmittedStudents = async (assignmentId) => {
  const response = await httpGet(
    `/assistant/assignment-submissions/assignment/${assignmentId}/not-submitted-students`,
  );
  return response.data;
};

const getSubmissionStats = async (assignmentId) => {
  const response = await httpGet(
    `/assistant/assignment-submissions/stats/assignment/${assignmentId}`,
  );
  return response.data;
};

const gradeSubmission = async (submissionId, score, feedback) => {
  const response = await httpPut(
    `/assistant/assignment-submissions/${submissionId}/grade`,
    { score, feedback },
  );
  return response.data;
};

const getVideos = async () => {
  const response = await httpGet("/assistant/videos");
  return response.data;
};

const getVideosByGrade = async (gradeId) => {
  const response = await httpGet(`/assistant/videos/grade/${gradeId}`);
  return response.data;
};

const downloadVideoFile = async (videoId) => {
  const response = await httpGet(`/assistant/videos/${videoId}/download`);
  return response;
};

const getVideoById = async (videoId) => {
  const response = await httpGet(`/assistant/videos/${videoId}`);
  return response.data;
};

const createVideo = async (formData) => {
  const response = await httpPostFormData("/assistant/videos", formData);
  return response.data;
};

const updateVideo = async (videoId, formData) => {
  const response = await httpPutFormData(
    `/assistant/videos/${videoId}`,
    formData,
  );
  return response.data;
};

const deleteVideo = async (videoId) => {
  const response = await httpDelete(`/assistant/videos/${videoId}`);
  return response.data;
};

const getPlaylists = async () => {
  const response = await httpGet("/assistant/playlists");
  return response.data;
};

const getPlaylistsByGrade = async (gradeId) => {
  const response = await httpGet(`/assistant/playlists/grade/${gradeId}`);
  return response.data;
};

const getPlaylistById = async (playlistId) => {
  const response = await httpGet(`/assistant/playlists/${playlistId}`);
  return response.data;
};

const createPlaylist = async (formData) => {
  const response = await httpPostFormData("/assistant/playlists", formData);
  return response.data;
};

const updatePlaylist = async (playlistId, formData) => {
  const response = await httpPutFormData(
    `/assistant/playlists/${playlistId}`,
    formData,
  );
  return response.data;
};

const deletePlaylist = async (playlistId) => {
  const response = await httpDelete(`/assistant/playlists/${playlistId}`);
  return response.data;
};

const getPlaylistVideos = async (playlistId) => {
  const response = await httpGet(
    `/assistant/playlist-videos/playlist/${playlistId}`,
  );
  return response.data;
};

const addVideoToPlaylist = async (playlistId, videoId) => {
  const response = await httpPost("/assistant/playlist-videos", {
    playlist_id: playlistId,
    video_id: videoId,
  });
  return response.data;
};

const removeVideoFromPlaylist = async (id) => {
  const response = await httpDelete(`/assistant/playlist-videos/${id}`);
  return response.data;
};

const getWhatsappTemplates = async () => {
  const response = await httpGet("/assistant/whatsapp-messages");
  return response;
};

const toggleWhatsappTemplate = async (templateId) => {
  const response = await httpPut(
    `/assistant/whatsapp-messages/${templateId}/toggle`,
  );
  return response;
};

const getWhatsappStatus = async () => {
  const response = await httpGet("/assistant/whatsapp/status");
  return response;
};

const sendWelcomeWhatsapp = async (studentId, instant = false) => {
  const response = await httpPost(
    `/assistant/whatsapp/send/welcome/${studentId}?instant=${instant ? "true" : "false"}`,
    {},
  );
  return response;
};

const sendAbsenceWhatsapp = async (studentId, date, instant = false) => {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  params.set("instant", instant ? "true" : "false");
  const response = await httpPost(
    `/assistant/whatsapp/send/absence/${studentId}?${params.toString()}`,
    {},
  );
  return response;
};

const sendPaymentWhatsapp = async (paymentId, instant = false) => {
  const response = await httpPost(
    `/assistant/whatsapp/send/payment/${paymentId}?instant=${instant ? "true" : "false"}`,
    {},
  );
  return response;
};

const sendExamWhatsapp = async (resultId, instant = false) => {
  const response = await httpPost(
    `/assistant/whatsapp/send/exam/${resultId}?instant=${instant ? "true" : "false"}`,
    {},
  );
  return response;
};

const sendWhatsappQueue = async ({
  delaySeconds = 5,
  limit = 100,
  statuses = ["pending"],
} = {}) => {
  const response = await httpPost("/assistant/whatsapp/queue/send", {
    delaySeconds,
    limit,
    statuses,
  });
  return response;
};

const getWhatsappStats = async () => {
  const response = await httpGet("/assistant/whatsapp/queue/stats");
  return response;
};

const resetFailedWhatsappMessages = async () => {
  const response = await httpPost("/assistant/whatsapp/queue/reset-failed", {});
  return response;
};

const getWhatsappMessages = async ({
  status,
  type,
  page = 1,
  limit = 20,
} = {}) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  params.set("page", String(page));
  params.set("limit", String(limit));
  const response = await httpGet(
    `/assistant/whatsapp/messages?${params.toString()}`,
  );
  return response;
};

const getWhatsappMessageById = async (messageId) => {
  const response = await httpGet(`/assistant/whatsapp/messages/${messageId}`);
  return response;
};

const deleteWhatsappMessage = async (messageId) => {
  const response = await httpDelete(
    `/assistant/whatsapp/messages/${messageId}`,
  );
  return response;
};

const getWhatsappDashboard = async () => {
  const response = await httpGet("/assistant/whatsapp/dashboard");
  return response;
};

const updateWhatsappTemplate = async (templateId, templateData) => {
  const response = await httpPut(
    `/assistant/whatsapp-messages/${templateId}`,
    templateData,
  );
  return response;
};

const downloadStudentsTemplate = async () => {
  return downloadBlobFile(
    "/assistant/students/template",
    "students_template.xlsx",
  );
};

const downloadGradesTemplate = async () => {
  return downloadBlobFile("/assistant/grades/template", "grades_template.xlsx");
};

const downloadGroupsTemplate = async () => {
  return downloadBlobFile("/assistant/groups/template", "groups_template.xlsx");
};

const downloadExamResultsTemplate = async () => {
  return downloadBlobFile(
    "/assistant/exam-results/template",
    "exam_results_template.xlsx",
  );
};

const bulkUploadStudents = async (formData) => {
  const response = await httpPostFormData(
    "/assistant/students/bulk-upload",
    formData,
  );
  return response;
};

const bulkUploadGrades = async (formData) => {
  const response = await httpPostFormData(
    "/assistant/grades/bulk-upload",
    formData,
  );
  return response;
};

const bulkUploadGroups = async (formData) => {
  const response = await httpPostFormData(
    "/assistant/groups/bulk-upload",
    formData,
  );
  return response;
};

const bulkUploadExamResults = async (examId, formData) => {
  const response = await httpPostFormData(
    `/assistant/exam-results/bulk-upload/${examId}`,
    formData,
  );
  return response;
};
const updateWhatsappSettings = async (settingsData) => {
  const response = await httpPut("/assistant/whatsapp/settings", settingsData);
  return response;
};
export {
  getAssistantProfile,
  updateWhatsappSettings,
  getAssistantDashboard,
  getActivityLog,
  getAssistantProfileImage,
  updateAssistantProfileImage,
  deleteAssistantProfileImage,
  updateAssistantPassword,
  getGrades,
  getGradesWithGroupsCount,
  getGradesWithStudentsCount,
  getAllGradesStats,
  findGradeByName,
  getGradeById,
  getGradeStats,
  createGrade,
  updateGrade,
  softDeleteGrade,
  hardDeleteGrade,
  getGroups,
  getGroupsWithGradeName,
  getGroupsWithStudentsCount,
  getAllGroupsStats,
  getGroupFullStats,
  findGroupByName,
  getGroupsByGrade,
  getGroupById,
  getGroupStats,
  createGroup,
  updateGroup,
  softDeleteGroup,
  hardDeleteGroup,
  getStudents,
  getDeletedStudents,
  searchStudentByBarcode,
  searchStudentByPhone,
  searchStudentsByParentPhone,
  getStudentsByGrade,
  getStudentsByGroup,
  getStudentById,
  getStudentProfile,
  getStudentStats,
  getStudentAttendanceHistory,
  getStudentMonthlyAttendance,
  getStudentTotalAttendance,
  getStudentConsecutiveAbsences,
  getStudentPayments,
  getStudentPaymentsBalance,
  getStudentCurrentSubscription,
  getStudentPaperExams,
  getStudentPaperExamById,
  getStudentExamResults,
  getStudentOnlineExams,
  getStudentOnlineExamById,
  getStudentAssignments,
  getStudentAssignmentById,
  getStudentSubmissions,
  getStudentSubmissionById,
  getStudentPlaylists,
  getStudentFullDetails,
  createStudent,
  updateStudent,
  softDeleteStudent,
  hardDeleteStudent,
  restoreStudent,
  startAttendanceSession,
  getActiveSession,
  toggleMakeupMode,
  scanBarcode,
  lockSession,
  createAttendance,
  markRestAbsent,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendanceDashboard,
  getAttendanceOverall,
  getConsecutiveAbsences,
  getGradeAttendance,
  getGroupAttendanceByDate,
  getGroupAttendanceByMonth,
  getAttendanceSummary,
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentCollections,
  getUnpaidStudents,
  getPaymentOverall,
  getStudentsPaymentStatus,
  getGradePaymentStats,
  getGroupPaymentStats,
  getPaymentsByGradeAndMonth,
  getPaymentsByGroupAndMonth,
  createSubscription,
  getSubscriptionOverall,
  getStudentsWithoutSubscription,
  getStudentSubscriptions,
  getSubscriptionsByMonth,
  getGradeSubscriptionStats,
  getGroupSubscriptionStats,
  updateSubscriptionStatus,
  deleteSubscription,
  getExams,
  getExamsByGrade,
  getExamsByGroup,
  getGradeExamStats,
  getExamById,
  getExamStats,
  createExam,
  updateExam,
  softDeleteExam,
  hardDeleteExam,
  createExamResult,
  upsertExamResult,
  upsertBatchExamResults,
  updateExamResult,
  deleteExamResult,
  getExamResults,
  getExamResultStats,
  getGradeExamResultsStats,
  getGroupExamResultsStats,
  getOnlineExams,
  getAvailableOnlineExams,
  getExpiredOnlineExams,
  getOnlineExamsByGrade,
  getOnlineExamsByGroup,
  getGradeOnlineExamStats,
  getOnlineExamStats,
  getOnlineExamById,
  createOnlineExam,
  updateOnlineExam,
  softDeleteOnlineExam,
  hardDeleteOnlineExam,
  getQuestionsByExam,
  getQuestionById,
  downloadQuestionFile,
  createQuestion,
  createQuestionWithFile,
  updateQuestion,
  updateQuestionWithFile,
  deleteQuestion,
  getOptionsByQuestion,
  getOptionById,
  createOption,
  updateOption,
  deleteOption,
  getPendingEssayAnswers,
  getEssayAnswersByExam,
  gradeEssayAnswer,
  getStudentExams,
  getStudentExamStats,
  getGradeStudentExamStats,
  getGroupStudentExamStats,
  getQuestionAnswerStats,
  getQuestionMostSelectedOptions,
  getAssignments,
  getAssignmentsByGrade,
  getAssignmentsByGroup,
  downloadAssignment,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  softDeleteAssignment,
  hardDeleteAssignment,
  getGradeSubmissionStats,
  getGroupSubmissionStats,
  getSubmissions,
  getStudentSubmission,
  getSubmittedStudents,
  getNotSubmittedStudents,
  getSubmissionStats,
  gradeSubmission,
  getVideos,
  getVideosByGrade,
  downloadVideoFile,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getPlaylists,
  getPlaylistsByGrade,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getPlaylistVideos,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getWhatsappTemplates,
  toggleWhatsappTemplate,
  getWhatsappStatus,
  sendWelcomeWhatsapp,
  sendAbsenceWhatsapp,
  sendPaymentWhatsapp,
  sendExamWhatsapp,
  sendWhatsappQueue,
  getWhatsappStats,
  resetFailedWhatsappMessages,
  getWhatsappMessages,
  getWhatsappMessageById,
  deleteWhatsappMessage,
  getWhatsappDashboard,
  updateWhatsappTemplate,
  downloadStudentsTemplate,
  downloadGradesTemplate,
  downloadGroupsTemplate,
  downloadExamResultsTemplate,
  bulkUploadStudents,
  bulkUploadGrades,
  bulkUploadGroups,
  bulkUploadExamResults,
};
