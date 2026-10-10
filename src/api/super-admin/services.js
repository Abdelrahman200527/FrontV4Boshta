import { httpGet, httpPost, httpPut, httpDelete, httpPatch, httpPostFormData } from "../http";
import config from "../../config";
import { downloadFile, previewFile } from "../../utils/fileHandler";

const { apiUrl } = config;

// ============================================
// 1. DASHBOARD & OVERVIEW
// ============================================

export const getSuperAdminDashboard = async () => {
  const response = await httpGet("/super-admin/dashboard");
  return response?.data || response;
};

export const getSuperAdminPlatformStatus = async () => {
  const response = await httpGet("/super-admin/platform-status");
  return response?.data || response;
};

export const getSuperAdminActivityLog = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.entity_type) query.append("entity_type", params.entity_type);
  if (params.date) query.append("date", params.date);
  if (params.page) query.append("page", params.page);
  const response = await httpGet(`/super-admin/activity-log?${query.toString()}`);
  return response;
};

// ============================================
// 2. PLATFORM SETTINGS
// ============================================

export const getPlatformSettings = async () => {
  const response = await httpGet("/super-admin/settings");
  return response?.data || response;
};

export const updatePlatformSettings = async (data) => {
  const response = await httpPut("/super-admin/settings", data);
  return response;
};

export const togglePlatformStatus = async () => {
  const response = await httpPut("/super-admin/settings/toggle-platform");
  return response;
};

export const updateAcademicYearStatus = async (status) => {
  const response = await httpPut("/super-admin/settings/academic-year", { status });
  return response;
};

// ============================================
// 3. USERS & STAFF MANAGEMENT
// ============================================

export const getAllUsers = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.role) query.append("role", params.role);
  if (params.search) query.append("search", params.search);
  const response = await httpGet(`/super-admin/users?${query.toString()}`);
  return response;
};

export const getAllAssistants = async () => {
  const response = await httpGet("/super-admin/users/assistants");
  return response?.data || response;
};

export const getAllTeachers = async () => {
  const response = await httpGet("/super-admin/users/teachers");
  return response?.data || response;
};

export const getDeletedUsers = async () => {
  const response = await httpGet("/super-admin/users/deleted");
  return response?.data || response;
};

export const findUserByPhone = async (phone) => {
  const response = await httpPost("/super-admin/users/find", { phone });
  return response?.data || response;
};

export const getUserById = async (userId) => {
  const response = await httpGet(`/super-admin/users/${userId}`);
  return response?.data || response;
};

export const createUser = async (data) => {
  const response = await httpPost("/super-admin/users", data);
  return response;
};

export const updateUser = async (userId, data) => {
  const response = await httpPut(`/super-admin/users/${userId}`, data);
  return response;
};

export const updateUserPassword = async (userId, password) => {
  const response = await httpPut(`/super-admin/users/${userId}/password`, { password });
  return response;
};

export const resetUserPassword = async (userId) => {
  const response = await httpPut(`/super-admin/users/${userId}/reset-password`);
  return response;
};

export const toggleUserActive = async (userId) => {
  const response = await httpPut(`/super-admin/users/${userId}/toggle-active`);
  return response;
};

export const deleteUser = async (userId, permanent = false) => {
  const endpoint = permanent ? `/super-admin/users/${userId}/permanent` : `/super-admin/users/${userId}`;
  const response = await httpDelete(endpoint);
  return response;
};

export const restoreUser = async (userId) => {
  const response = await httpPost(`/super-admin/users/${userId}/restore`);
  return response;
};

// ============================================
// 4. STUDENTS 360° MANAGEMENT
// ============================================

export const getAllStudents = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  });
  const response = await httpGet(`/super-admin/students?${query.toString()}`);
  return response;
};

export const getDeletedStudents = async () => {
  const response = await httpGet("/super-admin/students/deleted");
  return response?.data || response;
};

export const getStudentById = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}`);
  return response?.data || response;
};

export const searchStudentByBarcode = async (barcode) => {
  const response = await httpGet(`/super-admin/students/search/barcode?barcode=${encodeURIComponent(barcode)}`);
  return response?.data || response;
};

export const searchStudentByPhone = async (phone) => {
  const response = await httpGet(`/super-admin/students/search/phone?phone=${encodeURIComponent(phone)}`);
  return response?.data || response;
};

export const searchStudentByParentPhone = async (parentPhone) => {
  const response = await httpGet(`/super-admin/students/search/parent-phone?parent_phone=${encodeURIComponent(parentPhone)}`);
  return response?.data || response;
};

export const exportStudentsExcel = async (params = null) => {
  const query = new URLSearchParams();
  if (typeof params === "object" && params !== null) {
    if (params.grade_id) query.append("grade_id", params.grade_id);
    if (params.group_id) query.append("group_id", params.group_id);
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "all") query.append("status", params.status);
  } else if (params) {
    query.append("grade_id", params);
  }
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await downloadFile(`${apiUrl}/super-admin/students/export/excel${qs}`, "students.xlsx");
};

export const exportStudentsPdf = async (params = null) => {
  const query = new URLSearchParams();
  if (typeof params === "object" && params !== null) {
    if (params.grade_id) query.append("grade_id", params.grade_id);
    if (params.group_id) query.append("group_id", params.group_id);
    if (params.search) query.append("search", params.search);
    if (params.status && params.status !== "all") query.append("status", params.status);
  } else if (params) {
    query.append("grade_id", params);
  }
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await previewFile(`${apiUrl}/super-admin/students/export/pdf${qs}`);
};

export const getStudentProfile = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/profile`);
  return response?.data || response;
};

export const getStudentStats = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/stats`);
  return response?.data || response;
};

export const getStudentAttendanceRecords = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/attendance`);
  return response?.data || response;
};

export const getStudentPaymentRecords = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/payments`);
  return response?.data || response;
};

export const getStudentPaperExamRecords = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/exams/paper`);
  return response?.data || response;
};

export const getStudentOnlineExamRecords = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/exams/online/history`);
  return response?.data || response;
};

export const getStudentSubmissions = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/submissions`);
  return response?.data || response;
};

export const getStudentPlaylists = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/playlists`);
  return response?.data || response;
};

export const createStudent = async (data) => {
  const response = await httpPost("/super-admin/students", data);
  return response;
};

export const updateStudent = async (studentId, data) => {
  const response = await httpPut(`/super-admin/students/${studentId}`, data);
  return response;
};

export const toggleStudentStatus = async (studentId, data = {}) => {
  const response = await httpPatch(`/super-admin/students/${studentId}/status`, data);
  return response;
};

export const resetStudentPassword = async (studentId) => {
  const response = await httpPut(`/super-admin/students/${studentId}/reset-password`);
  return response;
};

export const deleteStudent = async (studentId, permanent = false) => {
  const endpoint = permanent ? `/super-admin/students/${studentId}/permanent` : `/super-admin/students/${studentId}`;
  const response = await httpDelete(endpoint);
  return response;
};

export const restoreStudent = async (studentId) => {
  const response = await httpPost(`/super-admin/students/${studentId}/restore`);
  return response;
};

export const downloadStudentsTemplate = async () => {
  return await downloadFile(`${apiUrl}/super-admin/students/template`, "students_template.xlsx");
};

export const bulkUploadStudents = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await httpPostFormData("/super-admin/students/bulk-upload", formData);
  return response;
};

// ============================================
// 5. PASSWORDS & ID CARDS GENERATION
// ============================================

export const getStudentsWithoutPassword = async () => {
  const response = await httpGet("/super-admin/students/without-password");
  return response?.data || response;
};

export const generatePasswordsForAll = async () => {
  const response = await httpPost("/super-admin/students/generate-passwords");
  return response;
};

export const generatePasswordsForGrade = async (gradeId) => {
  const response = await httpPost(`/super-admin/students/generate-passwords/grade/${gradeId}`);
  return response;
};

export const generatePasswordsForGroup = async (groupId) => {
  const response = await httpPost(`/super-admin/students/generate-passwords/group/${groupId}`);
  return response;
};

export const generatePasswordForStudent = async (studentId) => {
  const response = await httpPost(`/super-admin/students/generate-passwords/student/${studentId}`);
  return response;
};

export const exportPasswordsPdf = async (options = {}) => {
  const gradeId = typeof options === "object" ? options?.gradeId : options;
  const groupId = typeof options === "object" ? options?.groupId : null;
  const studentId = typeof options === "object" ? options?.studentId : null;
  const targetType = typeof options === "object" ? options?.targetType : (gradeId ? "grade" : "all");

  let url = `${apiUrl}/super-admin/students/generate-passwords/pdf`;
  if (targetType === "grade" && gradeId) {
    url = `${apiUrl}/super-admin/students/generate-passwords/grade/${gradeId}/pdf`;
  } else if (targetType === "group" && groupId) {
    url = `${apiUrl}/super-admin/students/generate-passwords/group/${groupId}/pdf`;
  } else if (targetType === "student" && studentId) {
    url = `${apiUrl}/super-admin/students/generate-passwords/student/${studentId}/pdf`;
  }
  return await previewFile(url);
};

export const exportPasswordsExcel = async (options = {}) => {
  const gradeId = typeof options === "object" ? options?.gradeId : options;
  const groupId = typeof options === "object" ? options?.groupId : null;
  const studentId = typeof options === "object" ? options?.studentId : null;
  const targetType = typeof options === "object" ? options?.targetType : (gradeId ? "grade" : "all");

  let url = `${apiUrl}/super-admin/students/generate-passwords/excel`;
  let fileName = "passwords_all_students.xlsx";
  if (targetType === "grade" && gradeId) {
    url = `${apiUrl}/super-admin/students/generate-passwords/grade/${gradeId}/excel`;
    fileName = `passwords_grade_${gradeId}.xlsx`;
  } else if (targetType === "group" && groupId) {
    url = `${apiUrl}/super-admin/students/generate-passwords/group/${groupId}/excel`;
    fileName = `passwords_group_${groupId}.xlsx`;
  } else if (targetType === "student" && studentId) {
    url = `${apiUrl}/super-admin/students/generate-passwords/student/${studentId}/excel`;
    fileName = `password_student_${studentId}.xlsx`;
  }
  return await downloadFile(url, fileName);
};

// ============================================
// 6. GRADES & GROUPS
// ============================================

export const getAllGrades = async () => {
  const response = await httpGet("/super-admin/grades");
  return response?.data || response;
};

export const getGradesStats = async () => {
  try {
    const [groupsRes, studentsRes, allRes] = await Promise.all([
      httpGet("/super-admin/grades/groups-count"),
      httpGet("/super-admin/grades/students-count"),
      httpGet("/super-admin/grades"),
    ]);
    const groupsList = Array.isArray(groupsRes?.data) ? groupsRes.data : Array.isArray(groupsRes) ? groupsRes : [];
    const studentsList = Array.isArray(studentsRes?.data) ? studentsRes.data : Array.isArray(studentsRes) ? studentsRes : [];
    const allList = Array.isArray(allRes?.data) ? allRes.data : Array.isArray(allRes) ? allRes : [];

    const gradeMap = new Map();
    allList.forEach((g) => gradeMap.set(g.id, { ...g }));
    groupsList.forEach((g) => {
      const existing = gradeMap.get(g.id) || { ...g };
      existing.groups_count = Number(g.groups_count) || 0;
      if (g.monthly_price !== undefined && g.monthly_price !== null) existing.monthly_price = g.monthly_price;
      gradeMap.set(g.id, existing);
    });
    studentsList.forEach((g) => {
      const existing = gradeMap.get(g.id) || { ...g };
      existing.students_count = Number(g.students_count) || 0;
      if (g.monthly_price !== undefined && g.monthly_price !== null) existing.monthly_price = g.monthly_price;
      gradeMap.set(g.id, existing);
    });
    return Array.from(gradeMap.values());
  } catch (err) {
    const response = await httpGet("/super-admin/grades");
    return response?.data || response;
  }
};

export const createGrade = async (data) => {
  const response = await httpPost("/super-admin/grades", data);
  return response;
};

export const updateGrade = async (id, data) => {
  const response = await httpPut(`/super-admin/grades/${id}`, data);
  return response;
};

export const deleteGrade = async (id, permanent = false) => {
  const endpoint = permanent ? `/super-admin/grades/${id}/permanent` : `/super-admin/grades/${id}`;
  const response = await httpDelete(endpoint);
  return response;
};

export const getAllGroups = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.grade_id) query.append("grade_id", params.grade_id);
  if (params.search) query.append("search", params.search);
  const qs = query.toString() ? `?${query.toString()}` : "";
  const response = await httpGet(`/super-admin/groups${qs}`);
  return response?.data || response;
};

export const getGroupsByGrade = async (gradeId) => {
  const response = await httpGet(`/super-admin/groups/grade/${gradeId}`);
  return response?.data || response;
};

export const createGroup = async (data) => {
  const response = await httpPost("/super-admin/groups", data);
  return response;
};

export const updateGroup = async (id, data) => {
  const response = await httpPut(`/super-admin/groups/${id}`, data);
  return response;
};

export const deleteGroup = async (id, permanent = false) => {
  const endpoint = permanent ? `/super-admin/groups/${id}/permanent` : `/super-admin/groups/${id}`;
  const response = await httpDelete(endpoint);
  return response;
};

export const downloadGradesTemplate = async () => {
  return await downloadFile(`${apiUrl}/super-admin/grades/template`, "grades_template.xlsx");
};

export const downloadGroupsTemplate = async () => {
  return await downloadFile(`${apiUrl}/super-admin/groups/template`, "groups_template.xlsx");
};

// ============================================
// 7. ATTENDANCE & LIVE BARCODE SCANNER
// ============================================

export const getAttendanceDashboard = async () => {
  const response = await httpGet("/super-admin/attendance/dashboard");
  return response?.data || response;
};

export const getStudentsWithThreeConsecutiveAbsences = async () => {
  const response = await httpGet("/super-admin/attendance/consecutive-absences");
  return response?.data || response;
};

export const startAttendanceSession = async (groupId, gradeId) => {
  const response = await httpPost("/super-admin/attendance/sessions/start", {
    group_id: Number(groupId),
    grade_id: Number(gradeId),
  });
  return response;
};

export const getActiveAttendanceSession = async (groupId) => {
  const response = await httpGet(`/super-admin/attendance/sessions/active/${groupId}`);
  return response?.data || response;
};

export const scanAttendanceBarcode = async (barcode, groupId, gradeId) => {
  const response = await httpPost("/super-admin/attendance/scan-barcode", {
    barcode: String(barcode).trim(),
    group_id: Number(groupId),
    grade_id: Number(gradeId),
  });
  return response;
};

export const toggleAttendanceMakeupMode = async (sessionId) => {
  const response = await httpPut(`/super-admin/attendance/sessions/${sessionId}/toggle-makeup`);
  return response;
};

export const lockAttendanceSession = async (sessionId, groupId) => {
  const response = await httpPost("/super-admin/attendance/sessions/lock", {
    id: Number(sessionId),
    groupId: Number(groupId),
  });
  return response;
};

export const getGroupAttendanceByDate = async (groupId, date) => {
  const response = await httpGet(`/super-admin/attendance/group/${groupId}/date/${date}`);
  return response?.data || response;
};

// ============================================
// 8. FINANCE & PAYMENTS & SUBSCRIPTIONS
// ============================================

export const getAllPayments = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  });
  const response = await httpGet(`/super-admin/payments?${query.toString()}`);
  return response;
};

export const recordPayment = async (data) => {
  let subId = data.subscription_id;
  if (!subId && data.student_id) {
    try {
      const month = data.month || new Date().toISOString().slice(0, 7);
      const subRes = await httpPost("/super-admin/subscriptions", {
        student_id: Number(data.student_id),
        month,
      });
      subId = subRes?.data?.id || subRes?.id;
    } catch (e) {
      console.warn("Could not auto-create subscription:", e);
    }
  }

  const payload = {
    student_id: Number(data.student_id),
    subscription_id: Number(subId),
    payment_date: data.payment_date || new Date().toISOString(),
    payment_mode: data.payment_mode || "normal",
    amount: data.amount !== undefined ? Number(data.amount) : undefined,
    notes: data.notes || undefined,
  };
  const response = await httpPost("/super-admin/payments", payload);
  return response;
};

export const getOverallPaymentStats = async () => {
  const response = await httpGet("/super-admin/payments/overall");
  return response?.data || response;
};

export const getMonthlyCollections = async () => {
  const response = await httpGet("/super-admin/payments/collections");
  return response?.data || response;
};

export const getUnpaidStudents = async () => {
  const response = await httpGet("/super-admin/payments/unpaid");
  return response?.data || response;
};

export const exportPaymentsExcel = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.month) query.append("month", params.month);
  if (params.grade_id) query.append("grade_id", params.grade_id);
  if (params.group_id) query.append("group_id", params.group_id);
  if (params.search) query.append("search", params.search);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await downloadFile(`${apiUrl}/super-admin/payments/export/excel${qs}`, "payments.xlsx");
};

export const exportPaymentsPdf = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.month) query.append("month", params.month);
  if (params.grade_id) query.append("grade_id", params.grade_id);
  if (params.group_id) query.append("group_id", params.group_id);
  if (params.search) query.append("search", params.search);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return await previewFile(`${apiUrl}/super-admin/payments/export/pdf${qs}`);
};

export const getSubscriptionsByMonth = async (month) => {
  const response = await httpGet(`/super-admin/subscriptions/month/${month}`);
  return response?.data || response;
};

export const createSubscription = async (data) => {
  const response = await httpPost("/super-admin/subscriptions", data);
  return response;
};

export const updateSubscriptionStatus = async (id, status) => {
  const response = await httpPut(`/super-admin/subscriptions/${id}/status`, { status });
  return response;
};

// ============================================
// 9. PAPER EXAMS & RESULTS
// ============================================

export const getAllPaperExams = async () => {
  const response = await httpGet("/super-admin/exams");
  return response?.data || response;
};

export const createPaperExam = async (data) => {
  const response = await httpPost("/super-admin/exams", data);
  return response;
};

export const updatePaperExam = async (id, data) => {
  const response = await httpPut(`/super-admin/exams/${id}`, data);
  return response;
};

export const deletePaperExam = async (id) => {
  const response = await httpDelete(`/super-admin/exams/${id}`);
  return response;
};

export const upsertExamResult = async (data) => {
  const response = await httpPost("/super-admin/exam-results/upsert", data);
  return response;
};

export const batchUpsertExamResults = async (examId, results) => {
  const records = Array.isArray(results) ? results : results?.records || results?.results || [];
  const response = await httpPost(`/super-admin/exam-results/upsert-batch/${examId}`, { records });
  return response;
};

export const downloadExamResultsTemplate = async () => {
  return await downloadFile(`${apiUrl}/super-admin/exam-results/template`, "exam_results_template.xlsx");
};

export const bulkUploadExamResults = async (examId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await httpPostFormData(`/super-admin/exam-results/bulk-upload/${examId}`, formData);
  return response;
};

export const exportExamResultsPdf = async (examId) => {
  return await previewFile(`${apiUrl}/super-admin/exam-results/exam/${examId}/export/pdf`);
};

export const exportExamResultsExcel = async (examId) => {
  return await downloadFile(`${apiUrl}/super-admin/exam-results/exam/${examId}/export/excel`, `exam_${examId}_results.xlsx`);
};

// ============================================
// 10. ONLINE EXAMS & QUESTIONS & ESSAY GRADING
// ============================================

export const getAllOnlineExams = async () => {
  const response = await httpGet("/super-admin/online-exams");
  return response?.data || response;
};

export const createOnlineExam = async (data) => {
  const response = await httpPost("/super-admin/online-exams", data);
  return response;
};

export const updateOnlineExam = async (examId, data) => {
  const response = await httpPut(`/super-admin/online-exams/${examId}`, data);
  return response;
};

export const deleteOnlineExam = async (examId) => {
  const response = await httpDelete(`/super-admin/online-exams/${examId}`);
  return response;
};

export const createExamQuestion = async (data) => {
  const response = await httpPost("/super-admin/questions", data);
  return response;
};

export const createQuestionOption = async (data) => {
  const response = await httpPost("/super-admin/options", data);
  return response;
};

export const getStudentOnlineExamAttempts = async (examId) => {
  const response = await httpGet(`/super-admin/student-exams/exam/${examId}`);
  return response?.data || response;
};

export const getPendingEssayAnswers = async () => {
  const response = await httpGet("/super-admin/student-answers/essay/pending");
  return response?.data || response;
};

export const gradeEssayAnswer = async (answerId, data) => {
  const response = await httpPut(`/super-admin/student-answers/${answerId}/grade`, data);
  return response;
};

// ============================================
// 11. ASSIGNMENTS & SUBMISSIONS
// ============================================

export const createAssignment = async (data) => {
  const response = await httpPost("/super-admin/assignments", data);
  return response;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await httpGet(`/super-admin/assignment-submissions/assignment/${assignmentId}`);
  return response?.data || response;
};

export const getAssignmentSubmittedStudents = async (assignmentId) => {
  const response = await httpGet(`/super-admin/assignment-submissions/assignment/${assignmentId}/submitted-students`);
  return response?.data || response;
};

export const getAssignmentNotSubmittedStudents = async (assignmentId) => {
  const response = await httpGet(`/super-admin/assignment-submissions/assignment/${assignmentId}/not-submitted-students`);
  return response?.data || response;
};

export const gradeAssignmentSubmission = async (submissionId, data) => {
  const response = await httpPut(`/super-admin/assignment-submissions/${submissionId}/grade`, data);
  return response;
};

// ============================================
// 12. VIDEOS & PLAYLISTS & YOUTUBE RESUMABLE
// ============================================

export const createPlaylist = async (data) => {
  const response = await httpPost("/super-admin/playlists", data);
  return response;
};

export const createVideo = async (data) => {
  const response = await httpPost("/super-admin/videos", data);
  return response;
};

export const linkVideoToPlaylist = async (data) => {
  const response = await httpPost("/super-admin/playlist-videos", data);
  return response;
};

export const getYouTubeChannel = async () => {
  const response = await httpGet("/super-admin/youtube/channel");
  return response?.data || response;
};

export const validateYouTubeVideo = async (data) => {
  const response = await httpPost("/super-admin/youtube/validate", data);
  return response?.data || response;
};

export const initYouTubeUpload = async (data) => {
  const response = await httpPost("/super-admin/youtube/init-upload", data);
  return response?.data || response;
};

export const confirmYouTubeUpload = async (data) => {
  const response = await httpPost("/super-admin/youtube/confirm-upload", data);
  return response;
};

// ============================================
// 13. GOOGLE MEET LIVE SESSIONS
// ============================================

export const getGoogleAuthUrl = async () => {
  const response = await httpGet("/super-admin/google/auth-url");
  return response?.data || response;
};

export const getGoogleStatus = async () => {
  const response = await httpGet("/super-admin/google/status");
  return response?.data || response;
};

export const disconnectGoogle = async () => {
  const response = await httpPost("/super-admin/google/disconnect");
  return response;
};

export const getLiveSessions = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.append(key, params[key]);
    }
  });
  const response = await httpGet(`/super-admin/live-sessions?${query.toString()}`);
  return response;
};

export const createLiveSession = async (formData) => {
  const response = await httpPostFormData("/super-admin/live-sessions", formData);
  return response;
};

export const syncLiveSessionRecording = async (id) => {
  const response = await httpPost(`/super-admin/live-sessions/${id}/sync-recording`);
  return response;
};

// ============================================
// 14. WHATSAPP AUTOMATION
// ============================================

export const getWhatsAppDashboard = async () => {
  const response = await httpGet("/super-admin/whatsapp/dashboard");
  return response?.data || response;
};

export const getWhatsAppQueueStats = async () => {
  const response = await httpGet("/super-admin/whatsapp/queue/stats");
  return response?.data || response;
};

export const sendWhatsAppQueue = async () => {
  const response = await httpPost("/super-admin/whatsapp/queue/send");
  return response;
};

export const resetFailedWhatsApp = async () => {
  const response = await httpPost("/super-admin/whatsapp/queue/reset-failed");
  return response;
};

export const getWhatsAppTemplates = async () => {
  const response = await httpGet("/super-admin/whatsapp-messages");
  return response?.data || response;
};

export const toggleWhatsAppTemplate = async (templateId) => {
  const response = await httpPut(`/super-admin/whatsapp-messages/${templateId}/toggle`);
  return response;
};
