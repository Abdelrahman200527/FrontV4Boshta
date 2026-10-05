import { getCookie, deleteCookie } from "./cookies";

/**
 * Checks whether the application is running in genuine Demo mode.
 * Rules:
 * 1. Must be running in browser environment.
 * 2. localStorage 'is_demo' must be 'true'.
 * 3. Crucial Guard: If the user has a real backend 'auth_token' cookie
 *    (anything other than the dummy 'demo_token_123'), they are logged into
 *    a REAL account! In that case, any leftover 'is_demo' in localStorage is a
 *    stale ghost flag, so we automatically purge it and return false.
 * 4. On login/activation pages (/login, /user/login, /activate, etc.),
 *    the user is attempting to access the real platform, so demo mode is never active.
 */
export const isDemoMode = () => {
  if (typeof window === "undefined") return false;

  const isDemoFlag = localStorage.getItem("is_demo") === "true";
  if (!isDemoFlag) return false;

  const token = getCookie("auth_token");
  // If user has a real auth token that is NOT demo_token_123, they are in real mode!
  if (token && token !== "demo_token_123") {
    try {
      localStorage.removeItem("is_demo");
      localStorage.removeItem("demo_role");
    } catch {
      // ignore
    }
    return false;
  }

  // Never treat login or activation pages as demo mode
  const path = window.location.pathname || "";
  if (
    path === "/login" ||
    path === "/user/login" ||
    path === "/activate" ||
    path.startsWith("/activate/")
  ) {
    return false;
  }

  return true;
};

/**
 * Completely purges all demo state from localStorage, sessionStorage, and cookies.
 */
export const clearDemoState = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("is_demo");
    localStorage.removeItem("demo_role");
    sessionStorage.removeItem("parent_selected_student");
    const token = getCookie("auth_token");
    if (token === "demo_token_123") {
      deleteCookie("auth_token");
      deleteCookie("user_data");
    }
  } catch (e) {
    console.warn("Failed to clear demo state:", e);
  }
};
