import { useState, useEffect } from "react";
import { uploadVideoDirectToYoutubeAction } from "../api/assistant/actions";
import { teacherUploadVideoDirectToYoutubeAction } from "../api/teacher/actions";
import { notifySuccess, notifyError } from "../lib/notify";

/**
 * Singleton State for Active Background Upload
 */
const initialUploadState = {
  active: false,
  videoFile: null,
  title: "",
  gradeId: "",
  gradeName: "",
  playlistId: null,
  thumbnailFile: null,
  thumbnailPreview: null,
  materialFile: null,
  role: "assistant",
  progress: 0,
  uploadedBytes: 0,
  totalBytes: 0,
  stage: "idle", // 'idle' | 'init' | 'uploading' | 'confirming' | 'done' | 'error' | 'paused'
  error: null,
  isPaused: false,
  createdVideo: null,
  controller: null,
};

let uploadState = { ...initialUploadState };
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => {
    try {
      listener(uploadState);
    } catch {
      // ignore listener errors
    }
  });
}

function updateState(partial) {
  uploadState = { ...uploadState, ...partial };
  emitChange();
}

/**
 * Upload Manager Controller
 */
export const uploadManager = {
  getState() {
    return uploadState;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async startUpload({
    videoFile,
    title,
    gradeId,
    gradeName = "",
    playlistId = null,
    thumbnailFile = null,
    materialFile = null,
    role = "assistant",
    onSuccess = null,
    onError = null,
  }) {
    if (!videoFile || !title) return;

    // Create thumbnail preview URL if present
    let thumbnailPreview = null;
    if (thumbnailFile) {
      try {
        thumbnailPreview = URL.createObjectURL(thumbnailFile);
      } catch {
        thumbnailPreview = null;
      }
    }

    const controller = {
      isPaused: false,
      isCancelled: false,
    };

    updateState({
      active: true,
      videoFile,
      title: title.trim(),
      gradeId,
      gradeName,
      playlistId: playlistId ? Number(playlistId) : null,
      thumbnailFile,
      thumbnailPreview,
      materialFile,
      role,
      progress: 0,
      uploadedBytes: 0,
      totalBytes: videoFile.size || 0,
      stage: "init",
      error: null,
      isPaused: false,
      createdVideo: null,
      controller,
    });

    try {
      const uploader =
        role === "teacher"
          ? teacherUploadVideoDirectToYoutubeAction
          : uploadVideoDirectToYoutubeAction;

      const result = await uploader({
        videoFile,
        title: title.trim(),
        gradeId: Number(gradeId),
        playlistId: playlistId ? Number(playlistId) : null,
        thumbnailFile,
        materialFile,
        controller,
        onProgress: (percent, uploadedBytes, totalBytes) => {
          if (controller.isCancelled) return;
          updateState({
            stage: percent >= 100 ? "confirming" : "uploading",
            progress: percent,
            uploadedBytes: uploadedBytes || 0,
            totalBytes: totalBytes || videoFile.size || 0,
          });
        },
      });

      if (controller.isCancelled) {
        return;
      }

      if (result.success) {
        const video = result.data?.video || result.data;
        updateState({
          stage: "done",
          progress: 100,
          createdVideo: video,
        });

        notifySuccess("تم رفع وحفظ الفيديو بنجاح!");
        onSuccess?.(video);

        // Global auto-refresh notification for all active video views
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("refresh-videos", { detail: video }),
          );
        }

        // Auto dismiss after 4.5 seconds
        setTimeout(() => {
          if (uploadState.stage === "done") {
            uploadManager.dismiss();
          }
        }, 4500);
      } else {
        const errMsg = result.error || "فشل رفع الفيديو";
        updateState({
          stage: "error",
          error: errMsg,
        });
        notifyError(errMsg);
        onError?.(errMsg);
      }
    } catch (err) {
      if (controller.isCancelled) return;
      const errMsg = err.message || "حدث خطأ غير متوقع أثناء الرفع";
      updateState({
        stage: "error",
        error: errMsg,
      });
      notifyError(errMsg);
      onError?.(errMsg);
    }
  },

  pause() {
    if (uploadState.controller && uploadState.stage === "uploading") {
      uploadState.controller.isPaused = true;
      updateState({
        isPaused: true,
        stage: "paused",
      });
    }
  },

  resume() {
    if (uploadState.controller && uploadState.stage === "paused") {
      uploadState.controller.isPaused = false;
      updateState({
        isPaused: false,
        stage: "uploading",
      });
    }
  },

  cancel() {
    if (uploadState.controller) {
      uploadState.controller.isCancelled = true;
    }
    if (uploadState.thumbnailPreview) {
      try {
        URL.revokeObjectURL(uploadState.thumbnailPreview);
      } catch {
        // ignore
      }
    }
    updateState({ ...initialUploadState });
  },

  dismiss() {
    if (uploadState.thumbnailPreview) {
      try {
        URL.revokeObjectURL(uploadState.thumbnailPreview);
      } catch {
        // ignore
      }
    }
    updateState({ ...initialUploadState });
  },
};

/**
 * Custom React Hook to listen to upload manager updates
 */
export function useUploadManager() {
  const [state, setState] = useState(() => uploadManager.getState());

  useEffect(() => {
    return uploadManager.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  return {
    ...state,
    startUpload: uploadManager.startUpload,
    pause: uploadManager.pause,
    resume: uploadManager.resume,
    cancel: uploadManager.cancel,
    dismiss: uploadManager.dismiss,
  };
}
