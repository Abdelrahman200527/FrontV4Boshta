import { notifyError } from "../lib/notify";
import {
  ArrowRight,
  Youtube,
  FileVideo,
  Download,
  FileText,
} from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import config from "../config";
import { previewVideoFileAction } from "../api/assistant/actions.js";

const VideoPlayer = ({ video, onBack, relatedVideos = [], onRelatedClick }) => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match ? match[1] : null;
  };

  const getDriveEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
  };

  const isYouTube = (url) => !!getYouTubeId(url);
  const isDrive = (url) => !!getDriveEmbedUrl(url);

  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith("http")) return thumbnailPath;
    return `https://backend.benb3n.cloud/${thumbnailPath}`;
  };

  const handleDownloadFile = async () => {
    if (!video.file_url) return;

    setDownloadLoading(true);
    try {
      const { apiUrl, apiUserName, apiPassword } = config;
      const credential = btoa(`${apiUserName}:${apiPassword}`);

      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

      const response = await fetch(
        `${apiUrl}/assistant/videos/${video.id}/download`,
        {
          headers: {
            Authorization: `Basic ${credential}`,
            ...(token ? { "x-client-key": token } : {}),
          },
        },
      );

      if (!response.ok) throw new Error("فشل تحميل الملف");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = video.file_url.split("/").pop() || `file-${video.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      notifyError("فشل تحميل الملف");
    } finally {
      setDownloadLoading(false);
    }
  };

  const getVideoId = (video) => {
    return video.video_id || video.id;
  };

  const handlePreview = async (video) => {
    const actualVideoId = getVideoId(video);
    setActionLoading(`${actualVideoId}-preview`);
    const result = await previewVideoFileAction(actualVideoId);
    setActionLoading(null);
    if (!result.success) {
      alert(result.error || "فشل المعاينة");
    }
  };



  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="sticky top-0 border-gray-200 z-10 px-3 py-2.5 flex items-center gap-2"
      >
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
        >
          <ArrowRight size={18} />
        </button>
        {isYouTube(video.video_url) ? (
          <Youtube size={24} className="text-red-600" />
        ) : isDrive(video.video_url) ? (
          <FileVideo size={24} className="text-blue-600" />
        ) : (
          <FileVideo size={24} className="text-gray-600" />
        )}
        <span className="font-bold text-sm sm:text-base">المحاضرات</span>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="max-w-6xl mx-auto p-3 sm:p-4"
      >
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-4 sm:gap-5">
          <div>
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              {isYouTube(video.video_url) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(video.video_url)}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : isDrive(video.video_url) ? (
                <iframe
                  src={getDriveEmbedUrl(video.video_url)}
                  className="w-full h-full"
                  allow="autoplay"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FileVideo size={64} />
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <h1 className="text-base sm:text-xl font-bold text-gray-900">
                {video.title}
              </h1>
              {video.grade_name && (
                <span className="text-xs sm:text-sm text-gray-500">
                  {video.grade_name}
                </span>
              )}

              {video.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {video.description}
                </p>
              )}

              {video.file_url && (
                <div className="flex items-center justify-between gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 mt-2">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        ملف مرفق مع الفيديو
                      </p>
                      <p className="text-xs text-gray-500">PDF / Word / صورة</p>
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-1 items-center">
                    <button
                    onClick={handleDownloadFile}
                    disabled={downloadLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    <Download size={14} />
                    {downloadLoading ? "جاري التحميل..." : "تحميل الملف"}
                  </button>

                  <button
                    onClick={() => handlePreview(video)}
                    disabled={actionLoading === `${video.id}-preview`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    عرض الملف
                  </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 text-gray-900">
              فيديوهات مقترحة
            </h3>
            {relatedVideos.length === 0 ? (
              <p className="text-sm text-gray-400">لا توجد فيديوهات مقترحة</p>
            ) : (
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {relatedVideos.map((relatedVideo) => {
                  const relatedYouTubeId = getYouTubeId(relatedVideo.video_url);
                  const relatedDriveId = getDriveEmbedUrl(
                    relatedVideo.video_url,
                  );
                  const thumbnailUrl = relatedVideo.thumbnail_url
                    ? getThumbnailUrl(relatedVideo.thumbnail_url)
                    : null;

                  return (
                    <button
                      key={relatedVideo.id}
                      onClick={() => onRelatedClick(relatedVideo)}
                      className="shrink-0 w-56 lg:w-full flex gap-2 p-2 rounded-lg text-right transition hover:bg-gray-50"
                    >
                      <div className="relative w-28 lg:w-32 shrink-0">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={relatedVideo.title}
                            className="w-full aspect-video object-cover rounded-lg"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            {relatedYouTubeId ? (
                              <Youtube size={24} className="text-red-500" />
                            ) : relatedDriveId ? (
                              <FileVideo size={24} className="text-blue-500" />
                            ) : (
                              <FileVideo size={24} className="text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold line-clamp-2 text-gray-800">
                          {relatedVideo.title}
                        </h4>
                        {relatedVideo.grade_name && (
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {relatedVideo.grade_name}
                          </span>
                        )}
                        {relatedVideo.file_url && (
                          <span className="flex items-center gap-1 text-[10px] text-blue-600 mt-1">
                            <FileText size={10} />
                            يوجد ملف
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoPlayer;
