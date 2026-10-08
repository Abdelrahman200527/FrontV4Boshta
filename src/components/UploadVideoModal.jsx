/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UploadCloud,
  Link as LinkIcon,
  Video,
  FileVideo,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  createNewVideo,
  addVideoToPlaylistAction,
} from "../api/assistant/actions";
import {
  createTeacherVideoAction,
} from "../api/teacher/actions";
import { uploadManager, useUploadManager } from "../utils/uploadManager";
import { notifyError, notifySuccess } from "../lib/notify";

/**
 * Upload & Add Video Modal
 * Matches the platform's original form styling, clean compact layout, and brand colors.
 * Supports:
 * 1. Background Resumable Direct Upload (can be closed to continue in background).
 * 2. Direct Video URL.
 * 3. Custom Thumbnail and Material Attachment in both modes.
 */
export default function UploadVideoModal({
  isOpen,
  onClose,
  onSuccess,
  grades = [],
  playlists = [],
  role = "assistant",
}) {
  const [uploadMode, setUploadMode] = useState("direct"); // 'direct' | 'url'

  // Form Fields
  const [title, setTitle] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Files
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [materialFile, setMaterialFile] = useState(null);

  // States
  const [savingUrlVideo, setSavingUrlVideo] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const materialInputRef = useRef(null);

  // Active Background Upload Listener
  const currentUpload = useUploadManager();

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setGradeId("");
    setPlaylistId("");
    setDescription("");
    setVideoUrl("");
    setVideoFile(null);
    setThumbnailFile(null);
    setMaterialFile(null);
    setSavingUrlVideo(false);
    setErrorMessage("");
  };

  const handleVideoFileChange = (file) => {
    if (!file) return;
    setVideoFile(file);
    setErrorMessage("");

    // Auto-fill title from filename if title is empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName);
    }
  };

  const filteredPlaylists = gradeId
    ? playlists.filter((p) => String(p.grade_id) === String(gradeId))
    : playlists;

  const selectedGradeName =
    grades.find((g) => String(g.id) === String(gradeId))?.name || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("عنوان الفيديو مطلوب");
      return;
    }
    if (!gradeId) {
      setErrorMessage("يرجى اختيار الصف الدراسي");
      return;
    }

    // MODE 1: DIRECT VIDEO UPLOAD FROM DEVICE (BACKGROUND RESUMABLE)
    if (uploadMode === "direct") {
      if (!videoFile) {
        setErrorMessage("يرجى اختيار ملف الفيديو من الجهاز");
        return;
      }

      // Start upload in background upload manager
      uploadManager.startUpload({
        videoFile,
        title: title.trim(),
        gradeId: Number(gradeId),
        gradeName: selectedGradeName,
        playlistId: playlistId ? Number(playlistId) : null,
        thumbnailFile,
        materialFile,
        role,
        onSuccess: (video) => {
          onSuccess?.(video);
        },
      });

      // Close modal immediately so the user can continue browsing seamlessly!
      onClose();
      return;
    }

    // MODE 2: VIDEO VIA URL
    if (uploadMode === "url") {
      if (!videoUrl.trim()) {
        setErrorMessage("يرجى إدخال رابط الفيديو");
        return;
      }

      setSavingUrlVideo(true);

      try {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("grade_id", String(gradeId));
        formData.append("video_url", videoUrl.trim());
        if (description.trim()) formData.append("description", description.trim());
        if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
        if (materialFile) formData.append("file", materialFile);

        const creator =
          role === "teacher" ? createTeacherVideoAction : createNewVideo;

        const result = await creator(formData);

        if (result.success) {
          const createdVideoId = result.data?.id || result.data?.video?.id;
          if (playlistId && createdVideoId) {
            await addVideoToPlaylistAction(Number(playlistId), createdVideoId).catch(() => {});
          }
          notifySuccess("تمت إضافة الفيديو بنجاح");
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("refresh-videos", { detail: result.data }),
            );
          }
          onSuccess?.(result.data?.video || result.data);
          onClose();
        } else {
          setErrorMessage(result.error || "فشل إضافة الفيديو");
          notifyError(result.error || "فشل إضافة الفيديو");
        }
      } catch (err) {
        setErrorMessage(err.message || "حدث خطأ أثناء إضافة الفيديو");
      } finally {
        setSavingUrlVideo(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-gray-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1a5d1a] flex items-center justify-center">
              <Video size={17} />
            </div>
            <h2 className="font-bold text-base text-gray-900">
              إضافة فيديو جديد
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Source Switcher */}
        <div className="px-4 pt-3.5 pb-1">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setUploadMode("direct");
                setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ${
                uploadMode === "direct"
                  ? "bg-[#1a5d1a] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <UploadCloud size={15} />
              <span>رفع من الجهاز</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUploadMode("url");
                setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ${
                uploadMode === "url"
                  ? "bg-[#1a5d1a] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LinkIcon size={14} />
              <span>رابط الفيديو</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE 1: FILE PICKER */}
          {uploadMode === "direct" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                ملف الفيديو <span className="text-red-500">*</span>
              </label>

              {!videoFile ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-[#1a5d1a] bg-emerald-50/20 hover:bg-emerald-50/50 transition p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:scale-105 transition flex items-center justify-center text-[#1a5d1a]">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      اختر ملف الفيديو من جهازك
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      يدعم MP4, MKV, MOV, WebM (رفع فوري في الخلفية)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileVideo size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate" title={videoFile.name}>
                        {videoFile.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} ميجابايت
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition cursor-pointer"
                    title="تغيير الملف"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleVideoFileChange(e.target.files[0]);
                  }
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* MODE 2: VIDEO URL */}
          {uploadMode === "url" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                رابط الفيديو <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={videoUrl}
                disabled={savingUrlVideo}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1a5d1a] focus:ring-1 focus:ring-[#1a5d1a]/20 outline-none"
                dir="ltr"
                required
              />
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">
              عنوان الفيديو <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="عنوان الدرس أو المحاضرة..."
              value={title}
              disabled={savingUrlVideo}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1a5d1a] focus:ring-1 focus:ring-[#1a5d1a]/20 outline-none"
              required
            />
          </div>

          {/* Grade */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">
              الصف الدراسي <span className="text-red-500">*</span>
            </label>
            <select
              value={gradeId}
              disabled={savingUrlVideo}
              onChange={(e) => {
                setGradeId(e.target.value);
                setPlaylistId("");
              }}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1a5d1a] outline-none bg-white"
              required
            >
              <option value="">اختر الصف...</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          {/* Playlist */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">
              قائمة التشغيل (اختياري)
            </label>
            <select
              value={playlistId}
              disabled={savingUrlVideo || !gradeId}
              onChange={(e) => setPlaylistId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1a5d1a] outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">بدون قائمة</option>
              {filteredPlaylists.map((pl) => (
                <option key={pl.playlist_id || pl.id} value={pl.playlist_id || pl.id}>
                  {pl.title}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">
              وصف (اختياري)
            </label>
            <textarea
              placeholder="وصف أو ملاحظات للطلاب..."
              value={description}
              disabled={savingUrlVideo}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1a5d1a] outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Attachments Section (Exact Old Form Layout) */}
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">
                صورة مصغرة (اختياري)
              </span>
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                <Plus size={12} />
                إضافة صورة
              </button>
            </div>

            {thumbnailFile && (
              <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2.5 py-2">
                <span className="text-[12px] text-gray-700 truncate">
                  {thumbnailFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setThumbnailFile(null)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setThumbnailFile(e.target.files[0]);
                }
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-bold text-gray-600">
                <FileText size={13} />
                ملف مرفق (اختياري - PDF/Word/صورة)
              </span>
              <button
                type="button"
                onClick={() => materialInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                <Plus size={12} />
                إضافة ملف
              </button>
            </div>

            {materialFile && (
              <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2.5 py-2">
                <span className="text-[12px] text-gray-700 truncate">
                  {materialFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setMaterialFile(null)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <input
              ref={materialInputRef}
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setMaterialFile(e.target.files[0]);
                }
                e.target.value = "";
              }}
            />
          </div>

          {/* Submit Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={savingUrlVideo}
              className="flex-1 bg-[#1a5d1a] hover:bg-[#144714] text-white py-2.5 rounded-lg text-sm font-bold shadow-xs transition disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {savingUrlVideo ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : uploadMode === "direct" ? (
                <>
                  <UploadCloud size={16} />
                  <span>بدء الرفع وحفظ الفيديو</span>
                </>
              ) : (
                <span>إضافة الفيديو</span>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
