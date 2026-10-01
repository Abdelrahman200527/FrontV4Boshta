import { httpGet, httpPost, httpPut, httpDelete, httpPatch, httpPostFormData } from "../http";

// ============================================
// DASHBOARD & OVERVIEW
// ============================================

export const getSuperAdminDashboard = async () => {
  const response = await httpGet("/super-admin/dashboard");
  return response.data;
};

export const getSuperAdminPlatformStatus = async () => {
  const response = await httpGet("/super-admin/platform-status");
  return response.data;
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
// PLATFORM SETTINGS
// ============================================

export const getPlatformSettings = async () => {
  const response = await httpGet("/super-admin/settings");
  return response.data;
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
// USERS / STAFF MANAGEMENT
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
  return response.data;
};

export const getAllTeachers = async () => {
  const response = await httpGet("/super-admin/users/teachers");
  return response.data;
};

export const getDeletedUsers = async () => {
  const response = await httpGet("/super-admin/users/deleted");
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await httpGet(`/super-admin/users/${userId}`);
  return response.data;
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
// STUDENTS MANAGEMENT
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
  return response.data;
};

export const getStudentById = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}`);
  return response.data;
};

export const getStudentProfile = async (studentId) => {
  const response = await httpGet(`/super-admin/students/${studentId}/profile`);
  return response.data;
};

export const createStudent = async (data) => {
  const response = await httpPost("/super-admin/students", data);
  return response;
};

export const updateStudent = async (studentId, data) => {
  const response = await httpPut(`/super-admin/students/${studentId}`, data);
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

export const toggleStudentStatus = async (studentId, data = {}) => {
  const response = await httpPatch(`/super-admin/students/${studentId}/status`, data);
  return response;
};

export const resetStudentPassword = async (studentId) => {
  const response = await httpPut(`/super-admin/students/${studentId}/reset-password`);
  return response;
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

// ============================================
// GRADES & GROUPS
// ============================================

export const getAllGrades = async () => {
  const response = await httpGet("/super-admin/grades");
  return response.data;
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

export const getAllGroups = async () => {
  const response = await httpGet("/super-admin/groups/with-grade-name");
  return response.data || response;
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

// ============================================
// ATTENDANCE
// ============================================

export const getAttendanceDashboard = async () => {
  const response = await httpGet("/super-admin/attendance/dashboard");
  return response.data;
};

export const getStudentsWithThreeConsecutiveAbsences = async () => {
  const response = await httpGet("/super-admin/attendance/consecutive-absences");
  return response.data;
};

// ============================================
// PAYMENTS & SUBSCRIPTIONS
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

export const getOverallPaymentStats = async () => {
  const response = await httpGet("/super-admin/payments/overall");
  return response.data;
};

export const getMonthlyCollections = async () => {
  const response = await httpGet("/super-admin/payments/collections");
  return response.data;
};

export const getUnpaidStudents = async () => {
  const response = await httpGet("/super-admin/payments/unpaid");
  return response.data;
};

// ============================================
// WHATSAPP
// ============================================

export const getWhatsAppDashboard = async () => {
  const response = await httpGet("/super-admin/whatsapp/dashboard");
  return response.data;
};

export const getWhatsAppQueueStats = async () => {
  const response = await httpGet("/super-admin/whatsapp/queue/stats");
  return response.data;
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
  return response.data;
};

export const toggleWhatsAppTemplate = async (templateId) => {
  const response = await httpPut(`/super-admin/whatsapp-messages/${templateId}/toggle`);
  return response;
};
