import { getParentData } from "./services";

const fetchParentDashboard = async (token) => {
  try {
    const data = await getParentData(token);
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "حدث خطأ في تحميل البيانات",
    };
  }
};

export { fetchParentDashboard };
