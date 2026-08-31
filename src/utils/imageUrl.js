import config from "../config";

const { apiUrl } = config;

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  // ✅ إزالة /api من الـ base URL
  const baseUrl = apiUrl.replace("/api", "");
  const cleanPath = path.replace(/^\//, "");
  
  return `${baseUrl}/${cleanPath}`;
};

export default getImageUrl;