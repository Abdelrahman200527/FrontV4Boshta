import React from "react";
import { Navigate } from "react-router-dom";
import getUser from "../utils/getUser";
import { getCookie } from "../utils/cookies";

const RoleRedirect = () => {
  const user = getUser();
  const token = getCookie("auth_token");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const userRole = user.role || user.user?.role;

  if (userRole === "student") {
    return <Navigate to="/student" replace />;
  }
  if (userRole === "teacher") {
    return <Navigate to="/teacher" replace />;
  }
  if (userRole === "assistant") {
    return <Navigate to="/assistant" replace />;
  }
  if (userRole === "parent") {
    return <Navigate to="/parent" replace />;
  }

  return <Navigate to="/" replace />;
};

export default RoleRedirect;