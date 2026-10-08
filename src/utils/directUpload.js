import { isDemoMode } from "./demo";

/**
 * Standard Chunk Size: 2 MB (Multiple of 256 KB = 262,144 bytes as required by Google Resumable Upload protocol).
 */
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Sleeps for a given number of milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Query current byte offset from Google Resumable Upload session.
 * Standard protocol: PUT with Content-Range: bytes * / total_size
 */
async function queryUploadOffset(uploadUrl, totalSize) {
  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Range": `bytes */${totalSize}`,
      },
    });

    if (res.status === 308) {
      const range = res.headers.get("Range");
      if (range) {
        const match = range.match(/bytes=0-(\d+)/);
        if (match) {
          return parseInt(match[1], 10) + 1;
        }
      }
      return 0;
    }

    if (res.ok) {
      const data = await res.json();
      return { complete: true, data };
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * Uploads a video file directly to Google Cloud / YouTube Resumable upload session.
 * Features:
 * 1. Resumable chunked upload (2MB chunks) with progress tracking.
 * 2. Auto-resume & retry on network interruption without re-uploading from 0.
 * 3. Pause & Resume capability via optional controller.
 * 4. Zero-Platform-Headers to guarantee CORS compliance.
 *
 * @param {string} uploadUrl - Resumable upload session URL from init-upload
 * @param {File|Blob} file - The video file
 * @param {Function} onProgress - Callback receiving (percent, uploadedBytes, totalBytes)
 * @param {Object} [controller] - Optional controller { isPaused, isCancelled, abortSignal }
 * @returns {Promise<{ id: string, [key: string]: any }>}
 */
export const uploadFileToGoogleWithProgress = async (
  uploadUrl,
  file,
  onProgress = null,
  controller = null,
) => {
  const totalSize = file.size;

  // DEMO MODE SIMULATION
  if (isDemoMode() || uploadUrl.includes("demo.google.upload")) {
    let current = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (controller?.isCancelled) {
          clearInterval(interval);
          reject(new Error("تم إلغاء الرفع"));
          return;
        }
        if (controller?.isPaused) {
          return; // wait while paused
        }

        current += 15;
        const bounded = Math.min(current, 100);
        if (onProgress) onProgress(bounded, Math.round((bounded / 100) * totalSize), totalSize);

        if (current >= 100) {
          clearInterval(interval);
          resolve({
            id: "gbst-g9OMdw",
            kind: "youtube#video",
            snippet: { title: file?.name || "Demo Video" },
          });
        }
      }, 350);
    });
  }

  // If file is very small (< 2.5MB), do a single PUT with progress simulation fallback
  if (totalSize < 2.5 * 1024 * 1024) {
    let progress = 15;
    if (onProgress) onProgress(progress, Math.round(totalSize * 0.15), totalSize);

    const timer = setInterval(() => {
      if (progress < 90) {
        progress += 10;
        if (onProgress) onProgress(progress, Math.round(totalSize * (progress / 100)), totalSize);
      }
    }, 300);

    try {
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "video/mp4",
        },
        body: file,
      });

      clearInterval(timer);

      if (!res.ok && res.status !== 308) {
        throw new Error(`فشل رفع ملف الفيديو (رمز: ${res.status})`);
      }

      if (onProgress) onProgress(100, totalSize, totalSize);
      const data = await res.json();
      return data;
    } catch (err) {
      clearInterval(timer);
      throw err;
    }
  }

  // CHUNKED RESUMABLE UPLOAD
  let startByte = 0;
  let retryCount = 0;
  const MAX_RETRIES = 6;

  while (startByte < totalSize) {
    if (controller?.isCancelled) {
      throw new Error("تم إلغاء عملية الرفع من قِبل المستخدم");
    }

    // Handle pause
    while (controller?.isPaused) {
      if (controller?.isCancelled) {
        throw new Error("تم إلغاء عملية الرفع من قِبل المستخدم");
      }
      await sleep(500);
    }

    const endByte = Math.min(startByte + CHUNK_SIZE - 1, totalSize - 1);
    const chunk = file.slice(startByte, endByte + 1);

    try {
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "video/mp4",
          "Content-Range": `bytes ${startByte}-${endByte}/${totalSize}`,
        },
        body: chunk,
      });

      // 308 Resume Incomplete = chunk saved, ready for next chunk
      if (res.status === 308) {
        retryCount = 0; // reset retry counter on success
        const range = res.headers.get("Range");
        if (range) {
          const match = range.match(/bytes=0-(\d+)/);
          if (match) {
            startByte = parseInt(match[1], 10) + 1;
          } else {
            startByte = endByte + 1;
          }
        } else {
          startByte = endByte + 1;
        }

        const percent = Math.min(Math.round((startByte / totalSize) * 100), 99);
        if (onProgress) onProgress(percent, startByte, totalSize);
        continue;
      }

      // 200 or 201 = entire file successfully uploaded!
      if (res.ok) {
        if (onProgress) onProgress(100, totalSize, totalSize);
        const data = await res.json();
        return data;
      }

      // HTTP Error -> Query offset & retry
      throw new Error(`خطأ في رفع الجزء (رمز: ${res.status})`);
    } catch (err) {
      retryCount++;
      if (retryCount > MAX_RETRIES) {
        throw new Error(err.message || "انقطع الاتصال أثناء الرفع بعد عدة محاولات");
      }

      // Query what Google actually received
      await sleep(1000 * Math.min(retryCount, 4));
      const queryResult = await queryUploadOffset(uploadUrl, totalSize);
      if (typeof queryResult === "object" && queryResult?.complete) {
        if (onProgress) onProgress(100, totalSize, totalSize);
        return queryResult.data;
      }
      if (typeof queryResult === "number" && queryResult > 0) {
        startByte = queryResult;
        const percent = Math.min(Math.round((startByte / totalSize) * 100), 99);
        if (onProgress) onProgress(percent, startByte, totalSize);
      }
    }
  }

  // After loop, check final status if not already returned
  const finalCheck = await queryUploadOffset(uploadUrl, totalSize);
  if (typeof finalCheck === "object" && finalCheck?.complete) {
    if (onProgress) onProgress(100, totalSize, totalSize);
    return finalCheck.data;
  }

  throw new Error("اكتمل الرفع لكن لم يتم استلام معرّف الفيديو");
};
