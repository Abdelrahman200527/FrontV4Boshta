import {
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  httpPostFormData,
  httpPutFormData,
} from "../http";
import { downloadFile } from "../../utils/fileHandler";

// Dashboard
const getDashboard = async () => {
  const response = await httpGet("/student/dashboard");
  return response.data;
};

// Profile
const getProfile = async () => {
  const response = await httpGet("/student/profile");
  return response.data;
};

const getQuickStats = async () => {
  const response = await httpGet("/student/stats");
  return response.data;
};

const updateProfileImage = async (formData) => {
  const response = await httpPutFormData("/student/profile-image", formData);
  return response.data;
};

const deleteProfileImage = async () => {
  const response = await httpDelete("/student/profile-image");
  return response.data;
};

const updatePassword = async (oldPassword, newPassword, confirmPassword) => {
  const response = await httpPut("/student/password", {
    oldPassword,
    password: newPassword,
    confirmPassword,
  });
  return response;
};

// Attendance
const getAttendanceHistory = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/attendance?${params.toString()}`);
  return response;
};

const getMonthlyAttendance = async () => {
  const response = await httpGet("/student/attendance/monthly");
  return response.data;
};

const getConsecutiveAbsences = async () => {
  const response = await httpGet("/student/attendance/consecutive-absences");
  return response.data;
};

// Paper Exams
const getPaperExams = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/exams/paper?${params.toString()}`);
  return response;
};

const getPaperExamById = async (examId) => {
  const response = await httpGet(`/student/exams/paper/${examId}`);
  return response.data;
};

const getExamResults = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/exams/results?${params.toString()}`);
  return response;
};

// Online Exams
const getAvailableExams = async (page = 1) => {
  const response = await httpGet(
    `/student/exams/online/available?page=${page}`,
  );
  return response.data;
};

const getExamHistory = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(
    `/student/exams/online/history?${params.toString()}`,
  );
  return response;
};

const getOnlineExamById = async (attemptId) => {
  const response = await httpGet(`/student/exams/online/${attemptId}`);
  return response.data;
};

// Check active attempt
const checkExamAttempt = async (examId) => {
  const response = await httpGet(
    `/student/exams/online/${examId}/check-attempt`,
  );
  return response.data;
};

// Resume exam
const resumeExam = async (examId) => {
  const response = await httpGet(`/student/exams/online/${examId}/resume`);
  return response.data;
};

// Start exam
const startExam = async (examId) => {
  const response = await httpPost(`/student/exams/online/${examId}/start`);
  return response.data;
};

// Submit exam - no score
const submitExam = async (attemptId) => {
  const response = await httpPut(`/student/exams/online/${attemptId}/submit`);
  return response.data;
};

// Get exam questions with options
const getExamQuestions = async (examId) => {
  const response = await httpGet(`/student/exams/online/${examId}/questions`);
  return response.data;
};

// Get single question with options
const getQuestionById = async (questionId) => {
  const response = await httpGet(
    `/student/exams/online/question/${questionId}`,
  );
  return response.data;
};

// Download question file
const downloadQuestionFile = async (questionId) => {
  const url = `${import.meta.env.VITE_API_URL}/student/exams/online/question/${questionId}/download`;
  return await downloadFile(url);
};

// Get options for question - without is_correct
const getOptionsByQuestion = async (questionId) => {
  const response = await httpGet(`/student/options/question/${questionId}`);
  return response.data;
};

// Answer MCQ/True-False question - no is_correct
const answerQuestion = async (examId, questionId, selectedOptionId) => {
  const response = await httpPost(`/student/exams/online/${examId}/answer`, {
    question_id: questionId,
    selected_option_id: selectedOptionId,
  });
  return response.data;
};

// Submit essay answer
const submitEssayAnswer = async (examId, questionId, file) => {
  const formData = new FormData();
  formData.append("question_id", questionId);
  formData.append("file", file);
  const response = await httpPostFormData(
    `/student/exams/online/${examId}/essay`,
    formData,
  );
  return response.data;
};

// Assignments
const getAssignments = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/assignments?${params.toString()}`);
  return response;
};

const getAssignmentById = async (assignmentId) => {
  const response = await httpGet(`/student/assignments/${assignmentId}`);
  return response.data;
};

const downloadAssignment = async (assignmentId) => {
  const url = `${import.meta.env.VITE_API_URL}/student/assignments/${assignmentId}/download`;
  return await downloadFile(url);
};

const submitAssignment = async (assignmentId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await httpPostFormData(
    `/student/assignments/${assignmentId}/submit`,
    formData,
  );
  return response.data;
};

const updateAssignmentSubmission = async (assignmentId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await httpPutFormData(
    `/student/assignments/${assignmentId}/update`,
    formData,
  );
  return response.data;
};

const getSubmissions = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/submissions?${params.toString()}`);
  return response;
};

// Download own submission file
const downloadSubmissionFile = async (assignmentId) => {
  const url = `${import.meta.env.VITE_API_URL}/student/homeWorkSubmission/${assignmentId}/download`;
  return await downloadFile(url);
};

// Videos & Playlists
const getPlaylists = async () => {
  const response = await httpGet("/student/playlists");
  return response.data;
};

const getPlaylistVideos = async (playlistId) => {
  const response = await httpGet(`/student/playlists/${playlistId}/videos`);
  return response.data;
};

// Payments
const getPaymentHistory = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/payments?${params.toString()}`);
  return response;
};

const getRemainingBalance = async () => {
  const response = await httpGet("/student/payments/balance");
  return response.data;
};

const getCurrentSubscription = async () => {
  const response = await httpGet("/student/payments/current-subscription");
  return response.data;
};

export {
  getDashboard,
  getProfile,
  getQuickStats,
  updateProfileImage,
  deleteProfileImage,
  updatePassword,
  getAttendanceHistory,
  getMonthlyAttendance,
  getConsecutiveAbsences,
  getPaperExams,
  getPaperExamById,
  getExamResults,
  getAvailableExams,
  getExamHistory,
  getOnlineExamById,
  checkExamAttempt,
  resumeExam,
  startExam,
  submitExam,
  getExamQuestions,
  getQuestionById,
  downloadQuestionFile,
  getOptionsByQuestion,
  answerQuestion,
  submitEssayAnswer,
  getAssignments,
  getAssignmentById,
  downloadAssignment,
  submitAssignment,
  updateAssignmentSubmission,
  getSubmissions,
  downloadSubmissionFile,
  getPlaylists,
  getPlaylistVideos,
  getPaymentHistory,
  getRemainingBalance,
  getCurrentSubscription,
};
