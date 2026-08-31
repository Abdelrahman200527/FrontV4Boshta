import config from "../config";
import { getCookie } from "../utils/cookies";

const { apiUrl, apiUserName, apiPassword } = config;

const credential = btoa(`${apiUserName}:${apiPassword}`);

function getHeaders(isFormData = false) {
  const token = getCookie("auth_token");
  const superAdminKey = getCookie("super_admin_key");

  const headers = {
    Authorization: `Basic ${credential}`,
    ...(token ? { "x-client-key": token } : {}),
    ...(superAdminKey ? { "x-super-admin-key": superAdminKey } : {}),
  };

  // ✅ إزالة Content-Type للـ FormData - المتصفح بيضيفه تلقائياً
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function httpRequest(path, options = {}) {
  const url = `${apiUrl}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(options.isFormData),
        ...options.headers,
      },
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export function httpGet(path, headers = {}) {
  return httpRequest(path, { method: "GET", headers });
}

export function httpPost(path, body, headers = {}) {
  return httpRequest(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

export function httpPut(path, body, headers = {}) {
  return httpRequest(path, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
}

export function httpDelete(path, headers = {}) {
  return httpRequest(path, { method: "DELETE", headers });
}

export function httpPostFormData(path, formData, headers = {}) {
  return httpRequest(path, {
    method: "POST",
    isFormData: true,
    headers,
    body: formData,
  });
}

export function httpPutFormData(path, formData, headers = {}) {
  return httpRequest(path, {
    method: "PUT",
    isFormData: true,
    headers,
    body: formData,
  });
}

export default httpRequest;
