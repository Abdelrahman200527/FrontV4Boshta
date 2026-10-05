import { httpPost } from "../http";
import { setCookie, clearAllAuthCookies } from "../../utils/cookies";
import { clearDemoState } from "../../utils/demo";

const loginUser = async (phone, password) => {
  clearDemoState();
  const response = await httpPost("/auth/user/login", { phone, password });

  if (response.token) {
    clearDemoState();
    setCookie("auth_token", response.token, 7);
    setCookie("user_data", JSON.stringify(response.user), 7);
  }

  return response;
};

const loginStudent = async (phone, password) => {
  clearDemoState();
  const response = await httpPost("/auth/student/login", { phone, password });

  if (response.token) {
    clearDemoState();
    setCookie("auth_token", response.token, 7);
    setCookie("user_data", JSON.stringify(response.student), 7);
  }

  return response;
};

const logout = () => {
  clearAllAuthCookies();
  clearDemoState();
  try {
    localStorage.removeItem("phone");
    sessionStorage.clear();
  } catch (e) {
    console.error("Storage clear error:", e);
  }
};

const verifyStudentActivation = async (barcode, parent_phone) => {
  clearDemoState();
  return await httpPost("/auth/student/verify-activation", { barcode, parent_phone });
};

const completeStudentActivation = async (activation_token, password, confirm_password) => {
  clearDemoState();
  const response = await httpPost("/auth/student/complete-activation", { 
    activation_token, 
    password, 
    confirm_password 
  });

  if (response.token) {
    clearDemoState();
    setCookie("auth_token", response.token, 7);
    setCookie("user_data", JSON.stringify(response.student), 7);
  }

  return response;
};

export { loginUser, loginStudent, logout, verifyStudentActivation, completeStudentActivation };
