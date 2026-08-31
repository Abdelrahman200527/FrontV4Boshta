import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import getUser from "../utils/getUser";
import { getCookie } from "../utils/cookies";

const AuthMiddleware = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const user = getUser();
  const token = getCookie("auth_token");

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role || user.user?.role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
};

export default AuthMiddleware;