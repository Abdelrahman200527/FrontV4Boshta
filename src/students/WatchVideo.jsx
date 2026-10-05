import {
  ArrowRight,
  Youtube,
  RefreshCw,
  AlertCircle,
  Eye,
  Download,
  Calendar,
  BookOpen,
  PlayCircle,
  Clock,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPlaylists, fetchPlaylistVideos } from "../api/student/actions";
import getImageUrl from "../utils/imageUrl";
import { downloadFile, previewFile } from "../utils/fileHandler";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

import { getSafeEmbedUrl } from "../utils/videoSecurity";
import CustomVideoPlayer from "../components/CustomVideoPlayer";

const WatchVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isObscured, setIsObscured] = useState(false);

  // Anti-Screen Recording & Screenshots (DOM deterrents for the whole page)
  useEffect(() => {
    const handleObscure = () => {
      setIsObscured(true);
    };
    
    const handleClear = () => {
      setIsObscured(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleObscure();
      } else {
        handleClear();
      }
    };

    const handleKeyDown = (e) => {
      // Block common screenshot shortcut keys
      if (
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && ["s", "S", "3", "4", "5"].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && ["s", "S"].includes(e.key))
      ) {
        handleObscure();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("غير مسموح بأخذ لقطات شاشة.");
        }
        setTimeout(handleClear, 3000);
      }
    };

    window.addEventListener("blur", handleObscure);
    window.addEventListener("focus", handleClear);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleObscure);
      window.removeEventListener("focus", handleClear);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const loadVideo = useCallback(async () => {
    if (!videoId || videoId === "undefined") {
      setError("الفيديو غير موجود");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const playlistsResult = await fetchPlaylists();

      if (playlistsResult.success) {
        const playlists = Array.isArray(playlistsResult.data) ? playlistsResult.data : [];
        let foundVideo = null;
        let foundPlaylist = null;

        const results = await Promise.all(
          playlists.map(async (playlist) => {
            const playlistId = playlist.playlist_id || playlist.id;
            if (Array.isArray(playlist.videos) && playlist.videos.length > 0) {
              return {
                playlist,
                playlistId,
                videos: playlist.videos,
              };
            }
            const res = await fetchPlaylistVideos(playlistId);
            return {
              playlist,
              playlistId,
              videos: res.success && Array.isArray(res.data) ? res.data : [],
            };
          }),
        );

        for (const item of results) {
          const video = item.videos.find(
            (v) => String(v.video_id || v.id) === String(videoId),
          );

          if (video) {
            foundVideo = video;
            foundPlaylist = item.playlist;
            const related = item.videos.filter(
              (v) => String(v.video_id || v.id) !== String(videoId),
            );
            setRelatedVideos(related);
            break;
          }
        }

        if (foundVideo) {
          const resolvedVideoUrl = foundVideo.video_url || foundVideo.url;
          setCurrentVideo({
            ...foundVideo,
            id: foundVideo.video_id || foundVideo.id,
            playlist_title: foundPlaylist?.title || "",
            video_url: resolvedVideoUrl,
            embed_url: getSafeEmbedUrl(resolvedVideoUrl),
            thumbnail: foundVideo.thumbnail_url || foundVideo.thumbnail || foundVideo.thumbnail_path || foundVideo.cover_image || foundVideo.image,
          });
        } else {
          setError("الفيديو غير موجود");
        }
      } else {
        setError("فشل تحميل البيانات");
      }
    } catch (err) {
      console.error("Error loading video:", err);
      setError("فشل تحميل الفيديو");
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVideo();
    setRefreshing(false);
  };

  const handlePreview = async () => {
    if (currentVideo?.file_url) {
      const url = getImageUrl(currentVideo.file_url);
      await previewFile(url);
    }
  };

  const handleDownload = async () => {
    if (currentVideo?.file_url) {
      const url = getImageUrl(currentVideo.file_url);
      await downloadFile(url);
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الفيديو...</p>
        </div>
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-4 p-8 text-center min-h-screen bg-gray-50"
        dir="rtl"
      >
        <Youtube size={56} className="text-gray-300" />
        <p className="text-gray-500 text-sm">{error || "الفيديو غير موجود"}</p>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-5 py-2 bg-blue-500 text-white rounded-full text-sm font-bold hover:bg-blue-600 transition flex items-center gap-2"
          >
            <RefreshCw size={14} />
            إعادة المحاولة
          </button>
          <button
            onClick={() => navigate("/student/courses")}
            className="px-5 py-2 bg-[#009966] text-white rounded-full text-sm font-bold hover:bg-[#007a52] transition"
          >
            رجوع للمحاضرات
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {isObscured && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white p-6 text-center">
          <AlertCircle size={64} className="text-red-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">تسجيل الشاشة غير مسموح</h2>
          <p className="text-gray-400">يرجى إغلاق أي تطبيق تسجيل شاشة والعودة للمنصة لاستكمال المشاهدة.</p>
        </div>
      )}
      <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5 relative"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <button
          onClick={() => navigate("/student/courses")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#009966] transition"
        >
          <ArrowRight size={20} />
          <span className="text-sm font-bold">رجوع للمحاضرات</span>
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          تحديث
        </button>
      </motion.header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Video Section */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 flex flex-col gap-4"
        >
          {/* Video Player */}
          <CustomVideoPlayer
            videoUrl={currentVideo.video_url || currentVideo.url || currentVideo.embed_url}
            title={currentVideo.title}
            thumbnail={currentVideo.thumbnail_url || currentVideo.thumbnail || currentVideo.thumbnail_path || currentVideo.cover_image || currentVideo.image}
          />

          {/* Video Info */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              {currentVideo.title}
            </h1>

            {currentVideo.playlist_title && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <BookOpen size={14} />
                قائمة التشغيل: {currentVideo.playlist_title}
              </div>
            )}

            {/* Actions */}
            {currentVideo.file_url && (
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                >
                  <Eye size={16} />
                  معاينة الملف
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-bold hover:bg-green-100 transition"
                >
                  <Download size={16} />
                  تحميل الملف
                </button>
              </div>
            )}

            {currentVideo.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentVideo.description}
              </p>
            )}
          </div>
        </motion.div>

        {/* Related Videos */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <PlayCircle size={20} className="text-[#009966]" />
            فيديوهات ذات صلة
          </h2>

          {relatedVideos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
              <Youtube size={40} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm">لا توجد فيديوهات مرتبطة</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-150 overflow-y-auto custom-scrollbar">
              {relatedVideos.map((video) => {
                const relatedId = video.video_id || video.id;
                return (
                  <motion.div
                    key={relatedId}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm cursor-pointer hover:border-[#009966] transition"
                    onClick={() =>
                      navigate(`/student/courses/watch/${relatedId}`)
                    }
                  >
                    <div className="flex gap-3">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {video.thumbnail_url || video.thumbnail ? (
                          <img
                            src={getImageUrl(
                              video.thumbnail_url || video.thumbnail,
                            )}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayCircle size={24} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
    </>
  );
};

export default WatchVideo;
