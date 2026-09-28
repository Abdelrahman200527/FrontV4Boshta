import config from "../config";

const { apiUrl } = config;

const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (/^javascript:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:") || trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  
  // ✅ إزالة /api من الـ base URL
  const baseUrl = (apiUrl || "").replace(/\/api\/?$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");
  
  return `${baseUrl}/${cleanPath}`;
};

export default getImageUrl;