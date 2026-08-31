import {
  Youtube,
  ArrowRight,
  Download,
  Eye,
  FileText,
  Clock,
  BookOpen,
  Calendar,
  User,
  PlayCircle,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchVideoById,
  fetchVideosByGrade,
  downloadVideoFileAction,
  previewVideoFileAction,
} from "../api/teacher/actions";
import getImageUrl from "../utils/imageUrl";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const WatchVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDescription, setShowDescription] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const videoResult = await fetchVideoById(videoId);

      if (videoResult.success) {
        const video = videoResult.data;
        setCurrentVideo(video);
        setActiveVideoId(video.id);

        if (video && video.grade_id) {
          const relatedResult = await fetchVideosByGrade(video.grade_id);
          if (relatedResult.success) {
            const allVideos = relatedResult.data || [];
            const related = allVideos
              .filter((v) => v.id !== video.id)
              .slice(0, 6);
            setRelatedVideos(related);
          }
        }
      } else {
        setError(videoResult.error || "الفيديو غير موجود");
        setCurrentVideo(null);
      }
    } catch (error) {
      console.error("Error loading video:", error);
      setError("فشل تحميل الفيديو");
      setCurrentVideo(null);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [loadData]);

  const getEmbedUrl = useCallback((url) => {
    if (!url) return null;

    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("shorts/")) {
      const videoId = url.split("shorts/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  }, []);

  const handlePreview = async (video) => {
    setActionLoading(`${video.id}-preview`);
    const result = await previewVideoFileAction(video.id);
    setActionLoading(null);
    if (!result.success) {
      alert(result.error || "فشل المعاينة");
    }
  };

  const handleDownload = async (video) => {
    setActionLoading(`${video.id}-download`);
    const result = await downloadVideoFileAction(video.id);
    setActionLoading(null);
    if (!result.success) {
      alert(result.error || "فشل التحميل");
    }
  };

  const handleRetry = () => {
    loadData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isRelatedActive = (id) => activeVideoId === id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="w-14 h-14 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">
            جاري تحميل الفيديو...
          </p>
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
        className="flex flex-col items-center gap-4 p-8 text-center min-h-screen bg-linear-to-b from-gray-50 to-gray-100"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <Youtube size={32} className="text-red-400" />
          </div>
          <p className="text-gray-600 font-medium">
            {error || "الفيديو غير موجود"}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 bg-blue-500 text-white rounded-full text-sm font-bold hover:bg-blue-600 transition shadow-sm"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate("/teacher/courses")}
              className="px-5 py-2.5 bg-[#009966] text-white rounded-full text-sm font-bold hover:bg-[#007a52] transition shadow-sm"
            >
              رجوع للمحاضرات
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5 md:p-6 bg-linear-to-b from-gray-50 to-gray-100"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="flex items-center justify-between flex-wrap gap-2"
      >
        <button
          onClick={() => navigate("/teacher/courses")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#009966] transition bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md"
        >
          <ArrowRight size={18} />
          <span className="text-sm font-bold">رجوع للمحاضرات</span>
        </button>
        <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <GraduationCap size={14} className="text-[#009966]" />
          {currentVideo.grade_name || "بدون صف"}
        </span>
      </motion.header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Video Section */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 flex flex-col gap-4"
        >
          {/* Video Player */}
          <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-xl border border-gray-800">
            {currentVideo.video_url ? (
              <iframe
                key={currentVideo.id}
                src={getEmbedUrl(currentVideo.video_url)}
                title={currentVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-gray-900 to-gray-800">
                <div className="flex flex-col items-center gap-3">
                  <Youtube size={64} className="text-gray-600" />
                  <p className="text-gray-500 text-sm">لا يوجد فيديو</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            {/* Title + Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                {currentVideo.title}
              </h1>
              {currentVideo.file_url && (
                <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                  <FileText size={11} />
                  مع ملف
                </span>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <GraduationCap size={13} />
                {currentVideo.grade_name || "بدون صف"}
              </span>
              {currentVideo.created_at && (
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Calendar size={13} />
                  {formatDate(currentVideo.created_at)}
                </span>
              )}
            </div>

            {/* Actions */}
            {currentVideo.file_url && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePreview(currentVideo)}
                  disabled={actionLoading === `${currentVideo.id}-preview`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition disabled:opacity-50 shadow-sm hover:shadow"
                >
                  {actionLoading === `${currentVideo.id}-preview` ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Eye size={16} />
                  )}
                  {actionLoading === `${currentVideo.id}-preview`
                    ? "جاري..."
                    : "معاينة الملف"}
                </button>
                <button
                  onClick={() => handleDownload(currentVideo)}
                  disabled={actionLoading === `${currentVideo.id}-download`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-bold hover:bg-green-100 transition disabled:opacity-50 shadow-sm hover:shadow"
                >
                  {actionLoading === `${currentVideo.id}-download` ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {actionLoading === `${currentVideo.id}-download`
                    ? "جاري..."
                    : "تحميل الملف"}
                </button>
              </div>
            )}

            {/* Description */}
            {currentVideo.description && (
              <div className="mt-4">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#009966] transition mb-2"
                >
                  {showDescription ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronLeft size={16} className="text-gray-400" />
                  )}
                  الوصف
                </button>
                <AnimatePresence>
                  {showDescription && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {currentVideo.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Videos */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <PlayCircle size={20} className="text-[#009966]" />
              فيديوهات ذات صلة
            </h2>
            <span className="text-xs text-gray-400">
              {relatedVideos.length} فيديو
            </span>
          </div>

          {relatedVideos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 shadow-sm">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <PlayCircle size={28} className="text-gray-300" />
              </div>
              <p className="text-sm">لا توجد فيديوهات مرتبطة</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-150 overflow-y-auto custom-scrollbar pr-1">
              {relatedVideos.map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`bg-white rounded-xl p-3 border shadow-sm cursor-pointer transition-all group ${
                    isRelatedActive(video.id)
                      ? "border-[#009966] ring-2 ring-[#009966]/10"
                      : "border-gray-100 hover:border-[#009966]/50 hover:shadow-md"
                  }`}
                  onClick={() => navigate(`/teacher/courses/watch/${video.id}`)}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-28 h-18 sm:w-32 sm:h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {video.thumbnail_url ? (
                        <img
                          src={getImageUrl(video.thumbnail_url)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-gray-50 to-gray-100">
                          <PlayCircle size={28} className="text-gray-300" />
                        </div>
                      )}
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle size={28} className="text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#009966] transition line-clamp-1">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <GraduationCap size={11} />
                          {video.grade_name || "بدون صف"}
                        </p>
                      </div>

                      {/* Actions */}
                      {video.file_url && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(video);
                            }}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="معاينة"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(video);
                            }}
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition"
                            title="تحميل"
                          >
                            <Download size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default WatchVideo;
