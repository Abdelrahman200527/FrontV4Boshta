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
  const roleRouteMap = {
    student: "/student",
    assistant: "/assistant",
    teacher: "/teacher",
    parent: "/parent",
    super_admin: "/super-admin",
  };

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (roleRouteMap[userRole]) {
      return <Navigate to={roleRouteMap[userRole]} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthMiddleware;