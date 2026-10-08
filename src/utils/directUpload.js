import { isDemoMode } from "./demo";

/**
 * Uploads a video file directly to Google Cloud / YouTube Resumable upload session URL.
 * Uses native fetch with ONLY the required Content-Type header.
 * Absolutely NO platform headers (such as x-client-key or Authorization) are sent,
 * preventing CORS preflight rejection from Google.
 *
 * @param {string} uploadUrl - The resumable upload session URL returned from init-upload
 * @param {File|Blob} file - The video file to upload
 * @param {Function} onProgress - Callback receiving the current percentage (0-100)
 * @returns {Promise<{ id: string, [key: string]: any }>}
 */
export const uploadFileToGoogleWithProgress = async (
  uploadUrl,
  file,
  onProgress,
) => {
  // Demo Mode Simulation
  if (isDemoMode() || uploadUrl.includes("demo.google.upload")) {
    let current = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        current += 20;
        if (onProgress) onProgress(Math.min(current, 100));
        if (current >= 100) {
          clearInterval(interval);
          resolve({
            id: "gbst-g9OMdw",
            kind: "youtube#video",
            snippet: { title: file?.name || "Demo Video" },
          });
        }
      }, 300);
    });
  }

  // Smooth progress tracker during fetch
  let progress = 10;
  if (onProgress) onProgress(progress);

  const progressInterval = setInterval(() => {
    if (progress < 92) {
      const step = progress < 50 ? 6 : 3;
      progress = Math.min(progress + step, 92);
      if (onProgress) onProgress(progress);
    }
  }, 400);

  try {
    // Clean direct upload to Google (strictly without platform headers)
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file?.type || "video/mp4",
      },
      body: file,
    });

    clearInterval(progressInterval);

    if (!res.ok) {
      let errMsg = `فشل الرفع إلى خوادم Google (رمز: ${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson?.error?.message) {
          errMsg = `خطأ من Google: ${errJson.error.message}`;
        }
      } catch {
        // fallback
      }
      throw new Error(errMsg);
    }

    if (onProgress) onProgress(100);

    const googleData = await res.json();
    return googleData;
  } catch (error) {
    clearInterval(progressInterval);
    console.error("Direct Google upload error:", error);
    throw error;
  }
};
