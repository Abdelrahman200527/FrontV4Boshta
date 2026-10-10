import { getCookie } from "./cookies";
import config from "../config";

const { apiUserName, apiPassword } = config;


const getAuthHeaders = () => {
  const token = getCookie("auth_token");
  const credential = btoa(`${apiUserName}:${apiPassword}`);

  const headers = {
    Authorization: `Basic ${credential}`,
  };

  if (token) {
    headers["x-client-key"] = token;
  }

  return headers;
};

const resolveUrlForRole = (url) => {
  if (typeof window !== "undefined" && url && typeof url === "string") {
    const isSuperAdmin = window.location.pathname.startsWith("/super-admin");
    if (isSuperAdmin) {
      return url
        .replace("/api/assistant/", "/api/super-admin/")
        .replace("/api/teacher/", "/api/super-admin/");
    }
  }
  return url;
};

const downloadFile = async (url, fileName = "file") => {
  try {
    const targetUrl = resolveUrlForRole(url);
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "فشل تحميل الملف");
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
      const regularMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
      let extractedName = null;
      if (utf8Match && utf8Match[1]) {
        try {
          extractedName = decodeURIComponent(utf8Match[1].trim());
        } catch {
          extractedName = utf8Match[1].trim();
        }
      } else if (regularMatch && regularMatch[1]) {
        try {
          extractedName = decodeURIComponent(regularMatch[1].trim());
        } catch {
          extractedName = regularMatch[1].trim();
        }
      }
      if (extractedName) {
        fileName = extractedName.replace(/[/\\]/g, "").replace(/^(\.\.)+/, "").replace(/["']/g, "").trim() || fileName;
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);

    return { success: true };
  } catch (error) {
    console.error("Download error:", error);
    return { success: false, error: error.message };
  }
};


const previewFile = async (url) => {
  try {
    const targetUrl = resolveUrlForRole(url);
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "فشل فتح الملف");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    window.open(blobUrl, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);

    return { success: true };
  } catch (error) {
    console.error("Preview error:", error);
    return { success: false, error: error.message };
  }
};


const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (/^javascript:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:") || trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  
  const baseUrl = config.apiUrl.replace(/\/api\/?$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");
  
  return `${baseUrl}/${cleanPath}`;
};

export { downloadFile, previewFile, getImageUrl, getAuthHeaders };