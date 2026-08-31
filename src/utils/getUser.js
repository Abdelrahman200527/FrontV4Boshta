import { getCookie, setCookie } from "./cookies";

const getUser = () => {
  const userData = getCookie("user_data");
  if (!userData) return null;
  try {
    const user = JSON.parse(userData);
    return user;
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

const updateUserCookie = (userData) => {
  const currentUser = getUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...userData };
    setCookie("user_data", JSON.stringify(updatedUser), 7);
  }
};

export { getUser, getUserRole, getUserPermissions, updateUserCookie };
export default getUser;
