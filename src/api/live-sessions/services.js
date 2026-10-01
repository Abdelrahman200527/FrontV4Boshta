import { httpGet, httpPost, httpPut, httpDelete, httpPostFormData, httpPutFormData } from "../http";
import config from "../../config";

const { apiUrl } = config;

// ============================================
// TEACHER LIVE SESSIONS SERVICES
// ============================================

export const teacherGetGoogleAuthUrl = async () => {
  const response = await httpGet("/teacher/google/auth-url");
  return response.data;
};

export const teacherGetGoogleStatus = async () => {
  const response = await httpGet("/teacher/google/status");
  return response.data;
};

export const teacherDisconnectGoogle = async () => {
  const response = await httpPost("/teacher/google/disconnect", {});
  return response;
};

export const teacherGetLiveSessions = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.status) query.append("status", params.status);
  if (params.grade_id) query.append("grade_id", params.grade_id);
  if (params.group_id) query.append("group_id", params.group_id);
  if (params.target_type) query.append("target_type", params.target_type);
  if (params.search) query.append("search", params.search);
  const response = await httpGet(`/teacher/live-sessions?${query.toString()}`);
  return response.data;
};

export const teacherGetLiveSessionById = async (id) => {
  const response = await httpGet(`/teacher/live-sessions/${id}`);
  return response.data;
};

export const teacherCreateLiveSession = async (formData) => {
  const response = await httpPostFormData("/teacher/live-sessions", formData);
  return response.data;
};

export const teacherUpdateLiveSession = async (id, formData) => {
  const response = await httpPutFormData(`/teacher/live-sessions/${id}`, formData);
  return response.data;
};

export const teacherDeleteLiveSession = async (id) => {
  const response = await httpDelete(`/teacher/live-sessions/${id}`);
  return response;
};

export const teacherSyncRecording = async (id) => {
  const response = await httpPost(`/teacher/live-sessions/${id}/sync-recording`, {});
  return response;
};

export const teacherUpdateRecordingUrl = async (id, recording_url) => {
  const response = await httpPut(`/teacher/live-sessions/${id}/recording`, { recording_url });
  return response.data;
};

export const teacherGetDownloadMaterialUrl = (id) => {
  return `${apiUrl}/teacher/live-sessions/${id}/download-material`;
};

// ============================================
// ASSISTANT LIVE SESSIONS SERVICES
// ============================================

export const assistantGetLiveSessions = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.status) query.append("status", params.status);
  if (params.grade_id) query.append("grade_id", params.grade_id);
  if (params.group_id) query.append("group_id", params.group_id);
  if (params.target_type) query.append("target_type", params.target_type);
  if (params.search) query.append("search", params.search);
  const response = await httpGet(`/assistant/live-sessions?${query.toString()}`);
  return response.data;
};

export const assistantGetLiveSessionById = async (id) => {
  const response = await httpGet(`/assistant/live-sessions/${id}`);
  return response.data;
};

export const assistantCreateLiveSession = async (formData) => {
  const response = await httpPostFormData("/assistant/live-sessions", formData);
  return response.data;
};

export const assistantUpdateLiveSession = async (id, formData) => {
  const response = await httpPutFormData(`/assistant/live-sessions/${id}`, formData);
  return response.data;
};

export const assistantDeleteLiveSession = async (id) => {
  const response = await httpDelete(`/assistant/live-sessions/${id}`);
  return response;
};

export const assistantSyncRecording = async (id) => {
  const response = await httpPost(`/assistant/live-sessions/${id}/sync-recording`, {});
  return response;
};

export const assistantUpdateRecordingUrl = async (id, recording_url) => {
  const response = await httpPut(`/assistant/live-sessions/${id}/recording`, { recording_url });
  return response.data;
};

export const assistantGetDownloadMaterialUrl = (id) => {
  return `${apiUrl}/assistant/live-sessions/${id}/download-material`;
};

// ============================================
// STUDENT LIVE SESSIONS SERVICES
// ============================================

export const studentGetLiveSessions = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);
  if (params.status) query.append("status", params.status);
  const response = await httpGet(`/student/live-sessions?${query.toString()}`);
  return response.data;
};

export const studentGetLiveSessionById = async (id) => {
  const response = await httpGet(`/student/live-sessions/${id}`);
  return response.data;
};

export const studentJoinSession = async (id) => {
  const response = await httpGet(`/student/live-sessions/${id}/join`);
  return response.data;
};

export const studentGetDownloadMaterialUrl = (id) => {
  return `${apiUrl}/student/live-sessions/${id}/download-material`;
};
