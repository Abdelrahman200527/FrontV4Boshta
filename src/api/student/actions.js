import * as studentServices from "./services";

// Dashboard
const fetchStudentDashboard = async () => {
  try {
    const data = await studentServices.getDashboard();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Profile
const fetchStudentProfile = async () => {
  try {
    const data = await studentServices.getProfile();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentStats = async () => {
  try {
    const data = await studentServices.getQuickStats();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateStudentProfileImage = async (formData) => {
  try {
    const data = await studentServices.updateProfileImage(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteStudentProfileImage = async () => {
  try {
    const data = await studentServices.deleteProfileImage();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const changeStudentPassword = async (
  oldPassword,
  newPassword,
  confirmPassword,
) => {
  try {
    const response = await studentServices.updatePassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Attendance
const fetchAttendanceHistory = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getAttendanceHistory(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchMonthlyAttendance = async () => {
  try {
    const data = await studentServices.getMonthlyAttendance();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchConsecutiveAbsences = async () => {
  try {
    const data = await studentServices.getConsecutiveAbsences();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Paper Exams
const fetchPaperExams = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getPaperExams(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaperExamById = async (examId) => {
  try {
    const data = await studentServices.getPaperExamById(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamResults = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getExamResults(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Online Exams
const fetchAvailableExams = async (page = 1) => {
  try {
    const data = await studentServices.getAvailableExams(page);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamHistory = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getExamHistory(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOnlineExamById = async (attemptId) => {
  try {
    const data = await studentServices.getOnlineExamById(attemptId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check active attempt
const checkExamAttempt = async (examId) => {
  try {
    const data = await studentServices.checkExamAttempt(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Resume exam
const resumeStudentExam = async (examId) => {
  try {
    const data = await studentServices.resumeExam(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Start exam
const startStudentExam = async (examId) => {
  try {
    const data = await studentServices.startExam(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Submit exam - no score
const submitStudentExam = async (attemptId) => {
  try {
    const result = await studentServices.submitExam(attemptId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get exam questions with options
const fetchExamQuestions = async (examId) => {
  try {
    const data = await studentServices.getExamQuestions(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get single question with options
const fetchQuestionById = async (questionId) => {
  try {
    const data = await studentServices.getQuestionById(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Download question file
const downloadQuestionFile = async (questionId) => {
  try {
    const data = await studentServices.downloadQuestionFile(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get options for question
const fetchOptionsByQuestion = async (questionId) => {
  try {
    const data = await studentServices.getOptionsByQuestion(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Answer MCQ/True-False question
const submitStudentAnswer = async (examId, questionId, selectedOptionId) => {
  try {
    const data = await studentServices.answerQuestion(
      examId,
      questionId,
      selectedOptionId,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Submit essay answer
const submitStudentEssayAnswer = async (examId, questionId, file) => {
  try {
    const data = await studentServices.submitEssayAnswer(
      examId,
      questionId,
      file,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Assignments
const fetchAssignments = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getAssignments(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentById = async (assignmentId) => {
  try {
    const data = await studentServices.getAssignmentById(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadAssignmentFile = async (assignmentId) => {
  try {
    const data = await studentServices.downloadAssignment(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const submitStudentAssignment = async (assignmentId, file) => {
  try {
    const data = await studentServices.submitAssignment(assignmentId, file);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateStudentAssignment = async (assignmentId, file) => {
  try {
    const data = await studentServices.updateAssignmentSubmission(
      assignmentId,
      file,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchSubmissions = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getSubmissions(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Download own submission file
const downloadSubmissionFile = async (assignmentId) => {
  try {
    const data = await studentServices.downloadSubmissionFile(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Videos & Playlists
const fetchPlaylists = async () => {
  try {
    const data = await studentServices.getPlaylists();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistVideos = async (playlistId) => {
  try {
    const data = await studentServices.getPlaylistVideos(playlistId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Payments
const fetchPaymentHistory = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getPaymentHistory(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchRemainingBalance = async () => {
  try {
    const data = await studentServices.getRemainingBalance();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchCurrentSubscription = async () => {
  try {
    const data = await studentServices.getCurrentSubscription();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  fetchStudentDashboard,
  fetchStudentProfile,
  fetchStudentStats,
  updateStudentProfileImage,
  deleteStudentProfileImage,
  changeStudentPassword,
  fetchAttendanceHistory,
  fetchMonthlyAttendance,
  fetchConsecutiveAbsences,
  fetchPaperExams,
  fetchPaperExamById,
  fetchExamResults,
  fetchAvailableExams,
  fetchExamHistory,
  fetchOnlineExamById,
  checkExamAttempt,
  resumeStudentExam,
  startStudentExam,
  submitStudentExam,
  fetchExamQuestions,
  fetchQuestionById,
  downloadQuestionFile,
  fetchOptionsByQuestion,
  submitStudentAnswer,
  submitStudentEssayAnswer,
  fetchAssignments,
  fetchAssignmentById,
  downloadAssignmentFile,
  submitStudentAssignment,
  updateStudentAssignment,
  fetchSubmissions,
  downloadSubmissionFile,
  fetchPlaylists,
  fetchPlaylistVideos,
  fetchPaymentHistory,
  fetchRemainingBalance,
  fetchCurrentSubscription,
};
