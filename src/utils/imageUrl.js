import config from "../config";

const { apiUrl } = config;

const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (/^javascript:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) return null;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/course-cover") ||
    trimmed === "course-cover.png" ||
    trimmed.endsWith("course-cover.png") ||
    trimmed.startsWith("/assets/") ||
    trimmed.startsWith("/src/") ||
    trimmed.startsWith("/@fs/")
  ) {
    return trimmed.startsWith("/") || trimmed.startsWith("http") || trimmed.startsWith("blob") || trimmed.startsWith("data")
      ? trimmed
      : `/${trimmed}`;
  }
  
  // ✅ إزالة /api من الـ base URL
  const baseUrl = (apiUrl || "").replace(/\/api\/?$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");
  
  return `${baseUrl}/${cleanPath}`;
};

export default getImageUrl;