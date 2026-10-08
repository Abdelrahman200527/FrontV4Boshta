/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UploadCloud,
  Youtube,
  Link as LinkIcon,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Info,
} from "lucide-react";
import {
  fetchYoutubeChannelInfo,
  uploadVideoDirectToYoutubeAction,
  createNewVideo,
  addVideoToPlaylistAction,
} from "../api/assistant/actions";
import {
  fetchTeacherYoutubeChannelInfo,
  teacherUploadVideoDirectToYoutubeAction,
} from "../api/teacher/actions";
import { notifyError, notifySuccess } from "../lib/notify";

/**
 * Universal Video Addition & Zero-Bandwidth Direct YouTube Upload Modal
 * Supports both:
 * 1. Direct YouTube Upload: Client -> Google Cloud directly with Real-Time Progress Bar (0-100%).
 * 2. Manual Video URL: Paste existing YouTube or Drive link.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Function} onSuccess
 * @param {Array} grades - List of available grades [{id, name}]
 * @param {Array} playlists - List of available playlists [{playlist_id, title, grade_id}]
 * @param {string} role - 'assistant' or 'teacher'
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
  const [channelInfo, setChannelInfo] = useState(null);
  const [checkingChannel, setCheckingChannel] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [description, setDescription] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  // Files
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [materialFile, setMaterialFile] = useState(null);

  // Upload Progress & State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState(""); // 'init' | 'uploading' | 'confirming' | 'done'
  const [errorMessage, setErrorMessage] = useState("");

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const materialInputRef = useRef(null);

  // Load Channel status on open
  useEffect(() => {
    if (isOpen) {
      checkChannelStatus();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const checkChannelStatus = async () => {
    setCheckingChannel(true);
    try {
      const res =
        role === "teacher"
          ? await fetchTeacherYoutubeChannelInfo()
          : await fetchYoutubeChannelInfo();

      if (res.success && res.data) {
        setChannelInfo(res.data);
      }
    } catch {
      // ignore
    } finally {
      setCheckingChannel(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setGradeId("");
    setPlaylistId("");
    setDescription("");
    setManualUrl("");
    setVideoFile(null);
    setThumbnailFile(null);
    setMaterialFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadStage("");
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
    ? playlists.filter(
        (p) => String(p.grade_id) === String(gradeId),
      )
    : playlists;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("يرجى إدخال عنوان الفيديو");
      return;
    }
    if (!gradeId) {
      setErrorMessage("يرجى اختيار الصف الدراسي");
      return;
    }

    // DIRECT YOUTUBE UPLOAD WORKFLOW
    if (uploadMode === "direct") {
      if (!videoFile) {
        setErrorMessage("يرجى اختيار ملف الفيديو من جهازك للرفع");
        return;
      }

      setUploading(true);
      setUploadProgress(0);
      setUploadStage("init");

      try {
        const uploader =
          role === "teacher"
            ? teacherUploadVideoDirectToYoutubeAction
            : uploadVideoDirectToYoutubeAction;

        const result = await uploader({
          videoFile,
          title: title.trim(),
          description: description.trim(),
          gradeId: Number(gradeId),
          playlistId: playlistId ? Number(playlistId) : null,
          onProgress: (percent) => {
            setUploadStage("uploading");
            setUploadProgress(percent);
            if (percent >= 100) {
              setUploadStage("confirming");
            }
          },
        });

        if (result.success) {
          setUploadStage("done");
          notifySuccess("تم رفع الفيديو وتوثيقه على YouTube بنجاح!");
          setTimeout(() => {
            onSuccess?.(result.data?.video);
            onClose();
          }, 700);
        } else {
          setErrorMessage(result.error || "فشل رفع الفيديو إلى YouTube");
          notifyError(result.error || "فشل رفع الفيديو إلى YouTube");
        }
      } catch (err) {
        setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء الرفع");
        notifyError(err.message || "حدث خطأ غير متوقع");
      } finally {
        setUploading(false);
      }
      return;
    }

    // MANUAL URL WORKFLOW (Legacy / Paste Link)
    if (uploadMode === "url") {
      if (!manualUrl.trim()) {
        setErrorMessage("يرجى إدخال رابط الفيديو (يوتيوب)");
        return;
      }

      setUploading(true);
      setUploadStage("confirming");

      try {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("grade_id", gradeId);
        formData.append("video_url", manualUrl.trim());
        if (description.trim()) formData.append("description", description.trim());
        if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
        if (materialFile) formData.append("file", materialFile);

        const result = await createNewVideo(formData);

        if (result.success) {
          if (playlistId) {
            await addVideoToPlaylistAction(Number(playlistId), result.data.id).catch(() => {});
          }
          notifySuccess("تمت إضافة الفيديو بنجاح");
          onSuccess?.(result.data);
          onClose();
        } else {
          setErrorMessage(result.error || "فشل إضافة الفيديو");
          notifyError(result.error || "فشل إضافة الفيديو");
        }
      } catch (err) {
        setErrorMessage(err.message || "حدث خطأ أثناء إضافة الفيديو");
      } finally {
        setUploading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={uploading ? undefined : onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-[#1a5d1a] text-white px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Youtube size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">
                إضافة فيديو جديد للدروس
              </h2>
              <p className="text-xs text-emerald-200">
                رفع سحابي مباشر على YouTube بدون استهلاك باندويث
              </p>
            </div>
          </div>
          {!uploading && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Channel Status Banner */}
        <div className="bg-emerald-50/70 border-b border-emerald-100/60 px-5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {checkingChannel
                ? "جاري التحقق من قناة YouTube..."
                : channelInfo?.title
                ? `القناة المتصلة: ${channelInfo.title}`
                : "قناة YouTube المركزية جاهزة للرفع المباشر"}
            </span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
            غير مدرج (Unlisted)
          </span>
        </div>

        {/* Upload Mode Switcher */}
        <div className="p-5 pb-0">
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl gap-1">
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                setUploadMode("direct");
                setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                uploadMode === "direct"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <UploadCloud size={16} className={uploadMode === "direct" ? "text-emerald-600" : ""} />
              رفع مباشر من الجهاز
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                setUploadMode("url");
                setErrorMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                uploadMode === "url"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <LinkIcon size={15} className={uploadMode === "url" ? "text-emerald-600" : ""} />
              إدخال رابط فيديو يدوي
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE 1: DIRECT VIDEO FILE PICKER */}
          {uploadMode === "direct" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                ملف الفيديو المراد رفعه <span className="text-red-500">*</span>
              </label>

              {!videoFile ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 transition p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 group-hover:scale-105 transition flex items-center justify-center text-emerald-700">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      انقر لاختيار ملف الفيديو من جهازك
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      يدعم MP4, MKV, MOV, WebM (يتم الرفع إلى سحابة Google مباشرة)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileVideo size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate" title={videoFile.name}>
                        {videoFile.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        الحجم: {(videoFile.size / (1024 * 1024)).toFixed(1)} ميجابايت
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 transition"
                      title="تغيير الملف"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleVideoFileChange(e.target.files[0]);
                  }
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* MODE 2: MANUAL URL */}
          {uploadMode === "url" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                رابط الفيديو على يوتيوب <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={manualUrl}
                  disabled={uploading}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="w-full p-2.5 pl-9 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  dir="ltr"
                  required
                />
                <Youtube size={16} className="absolute left-3 top-3 text-red-500 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">
              عنوان الفيديو / الدرس <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: شرح همزة الوصل والقطع - الجزء الأول"
              value={title}
              disabled={uploading}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              required
            />
          </div>

          {/* Grade & Playlist Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                الصف الدراسي <span className="text-red-500">*</span>
              </label>
              <select
                value={gradeId}
                disabled={uploading}
                onChange={(e) => {
                  setGradeId(e.target.value);
                  setPlaylistId("");
                }}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-emerald-600 outline-none bg-white"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                قائمة التشغيل (اختياري)
              </label>
              <select
                value={playlistId}
                disabled={uploading || !gradeId}
                onChange={(e) => setPlaylistId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-emerald-600 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">بدون قائمة (فيديو حر)</option>
                {filteredPlaylists.map((pl) => (
                  <option key={pl.playlist_id || pl.id} value={pl.playlist_id || pl.id}>
                    {pl.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">
              وصف الفيديو (اختياري)
            </label>
            <textarea
              placeholder="اكتب نبذة أو ملاحظات عن الفيديو للطلاب..."
              value={description}
              disabled={uploading}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-emerald-600 outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Optional Attachments in URL Mode */}
          {uploadMode === "url" && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="p-2 border border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-50 text-gray-600 truncate"
              >
                <ImageIcon size={14} />
                <span>{thumbnailFile ? thumbnailFile.name : "صورة غلاف"}</span>
              </button>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />

              <button
                type="button"
                onClick={() => materialInputRef.current?.click()}
                className="p-2 border border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-50 text-gray-600 truncate"
              >
                <FileText size={14} />
                <span>{materialFile ? materialFile.name : "ملزمة PDF"}</span>
              </button>
              <input
                ref={materialInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {/* REAL-TIME PROGRESS BAR */}
          {uploading && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <div className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin text-emerald-600" />
                  <span>
                    {uploadStage === "init" && "جاري تهيئة جلسة الرفع على YouTube..."}
                    {uploadStage === "uploading" && `جاري رفع الفيديو إلى YouTube: ${uploadProgress}%`}
                    {uploadStage === "confirming" && "اكتمل الرفع، جاري حفظ الفيديو وتوثيقه..."}
                    {uploadStage === "done" && "تم الرفع والحفظ بنجاح!"}
                  </span>
                </div>
                <span className="font-mono text-emerald-700">{uploadProgress}%</span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full bg-emerald-200/60 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end"
                  style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-0.5 animate-pulse" />
                </div>
              </div>

              <p className="text-[10px] text-emerald-700/80 leading-relaxed">
                يتم الإرسال مباشرة من متصفحك إلى سحابة Google، بدون الضغط على سرعة سيرفر المنصة.
              </p>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-emerald-700 to-[#1a5d1a] hover:from-emerald-800 hover:to-[#144714] text-white py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري المعالجة والرفع...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>{uploadMode === "direct" ? "بدء رفع الفيديو الآن" : "حفظ الفيديو"}</span>
                </>
              )}
            </button>

            {!uploading && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
