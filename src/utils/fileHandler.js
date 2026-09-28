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


const downloadFile = async (url, fileName = "file") => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "فشل تحميل الملف");
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        fileName = match[1].replace(/[/\\]/g, "").replace(/^(\.\.)+/, "").replace(/["']/g, "").trim() || "file";
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
    const response = await fetch(url, {
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