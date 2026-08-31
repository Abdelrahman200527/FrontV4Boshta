import { loginUser, loginStudent, logout as logoutService } from "./services";
import { getCookie } from "../../utils/cookies";

const authenticate = async (role, phone, password) => {
  try {
    const response =
      role === "student"
        ? await loginStudent(phone, password)
        : await loginUser(phone, password);

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في تسجيل الدخول",
    };
  }
};

const isAuthenticated = () => {
  return !!getCookie("auth_token");
};

const getUser = () => {
  const userData = getCookie("user_data");
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

const getUserPermissions = () => {
  const user = getUser();
  return user?.permissions || null;
};

const logout = () => {
  logoutService();
};

export {
  authenticate,
  isAuthenticated,
  getUser,
  getUserRole,
  getUserPermissions,
  logout,
};
