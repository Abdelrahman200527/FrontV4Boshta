import { getParentData } from "./services";

const fetchParentDashboard = async (parent_phone) => {
  try {
    const data = await getParentData(parent_phone);
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
