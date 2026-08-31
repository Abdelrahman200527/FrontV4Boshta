import { httpPost } from "../http";
import { setCookie, deleteCookie } from "../../utils/cookies";

const loginUser = async (phone, password) => {
  const response = await httpPost("/auth/user/login", { phone, password });

  if (response.token) {
    setCookie("auth_token", response.token, 7);
    setCookie("user_data", JSON.stringify(response.user), 7);
  }

  return response;
};

const loginStudent = async (phone, password) => {
  const response = await httpPost("/auth/student/login", { phone, password });

  if (response.token) {
    setCookie("auth_token", response.token, 7);
    setCookie("user_data", JSON.stringify(response.student), 7);
  }

  return response;
};

const logout = () => {
  deleteCookie("auth_token");
  deleteCookie("user_data");
};

export { loginUser, loginStudent, logout };
