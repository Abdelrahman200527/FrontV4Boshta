import config from "../config";
import { getCookie, clearAllAuthCookies } from "../utils/cookies";

const { apiUrl, apiUserName, apiPassword } = config;

const credential = btoa(`${apiUserName}:${apiPassword}`);

function forceLogout() {
  clearAllAuthCookies();
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error("Failed to clear storage:", e);
  }

  if (window.location.pathname !== "/login" && window.location.pathname !== "/user/login") {
    window.location.href = "/login";
  }
}

function getHeaders(isFormData = false) {
  const token = getCookie("auth_token");
  const superAdminKey = getCookie("super_admin_key");

  const headers = {
    Authorization: `Basic ${credential}`,
    ...(token ? { "x-client-key": token } : {}),
    ...(superAdminKey ? { "x-super-admin-key": superAdminKey } : {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

import { handleDemoRequest } from "../demo/mockApi";

async function httpRequest(path, options = {}) {
  // --- DEMO MODE INTERCEPTOR ---
  if (localStorage.getItem("is_demo") === "true") {
    const mockResponse = await handleDemoRequest(path, options);
    const data = await mockResponse.json().catch(() => null);
    if (!mockResponse.ok) {
      const error = new Error(data?.message || "خطأ في الاتصال (ديمو)");
      error.status = mockResponse.status;
      error.data = data;
      throw error;
    }
    return data;
  }
  // -----------------------------

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

    // Check for session expiry / invalid token
    if (response.status === 401 && !path.startsWith("/auth/")) {
      forceLogout();
      const error = new Error(data?.message || "انتهت الجلسة، يرجى تسجيل الدخول مجدداً");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    // Check for platform paused - force logout
    if (response.status === 403 && data?.force_logout) {
      forceLogout();
      const error = new Error(data?.message || "المنصة متوقفة حالياً");
      error.status = response.status;
      error.data = data;
      throw error;
    }

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

export function httpPatch(path, body, headers = {}) {
  return httpRequest(path, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
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
