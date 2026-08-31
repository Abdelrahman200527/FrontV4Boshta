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
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) fileName = match[1];
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
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

    window.open(blobUrl, "_blank");

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
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  const baseUrl = config.apiUrl.replace("/api", "");
  const cleanPath = path.replace(/^\//, "");
  
  return `${baseUrl}/${cleanPath}`;
};

export { downloadFile, previewFile, getImageUrl, getAuthHeaders };