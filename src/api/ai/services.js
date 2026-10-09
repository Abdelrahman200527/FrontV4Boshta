import { httpGet, httpPost, httpPostFormData, httpDelete } from "../http";

/**
 * Determine the URL prefix based on user role
 * @param {string} role - 'student' | 'assistant' | 'teacher' | 'super_admin'
 * @returns {string} - '/student' | '/assistant' | '/teacher' | '/super-admin'
 */
export const getRolePrefix = (role) => {
  if (role === "student") return "/student";
  if (role === "assistant") return "/assistant";
  if (role === "teacher") return "/teacher";
  if (role === "super_admin" || role === "super-admin") return "/super-admin";
  return "/student";
};

/**
 * Fetch AI Chat History
 * @param {string} role
 * @returns {Promise<Array>}
 */
export const getAiHistory = async (role) => {
  const prefix = getRolePrefix(role);
  const response = await httpGet(`${prefix}/ai/history`);
  return response?.data || [];
};

/**
 * Fetch AI Usage Quota
 * @param {string} role
 * @returns {Promise<Object>}
 */
export const getAiQuota = async (role) => {
  const prefix = getRolePrefix(role);
  const response = await httpGet(`${prefix}/ai/quota`);
  return response?.data || null;
};

/**
 * Send AI Message (Text and/or File)
 * @param {string} role
 * @param {Object} payload - { message: string, file: File | null }
 * @returns {Promise<Object>}
 */
export const sendAiMessage = async (role, { message, file }) => {
  const prefix = getRolePrefix(role);

  if (file) {
    const formData = new FormData();
    if (message && message.trim()) {
      formData.append("message", message.trim());
    }
    formData.append("file", file);
    return await httpPostFormData(`${prefix}/ai/chat`, formData);
  }

  return await httpPost(`${prefix}/ai/chat`, {
    message: (message || "").trim(),
  });
};

/**
 * Clear AI Chat History (Start New Conversation)
 * @param {string} role
 * @returns {Promise<Object>}
 */
export const clearAiHistory = async (role) => {
  const prefix = getRolePrefix(role);
  return await httpDelete(`${prefix}/ai/history`);
};
