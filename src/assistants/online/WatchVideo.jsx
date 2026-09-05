/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { FileVideo, AlertCircle, RefreshCw } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAllVideos, fetchVideoById } from "../../api/assistant/actions";
import VideoPlayer from "../../components/VideoPlayer";
import { motion } from "framer-motion";
import { pageVariants } from "../../motion";

const WatchVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    // ✅ Validation
    const parsedId = parseInt(videoId);
    if (!parsedId || isNaN(parsedId)) {
      setError("معرف الفيديو غير صحيح");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [videoRes, videosRes] = await Promise.all([
      fetchVideoById(parsedId),
      fetchAllVideos(),
    ]);

    if (videoRes.success && videoRes.data) {
      setCurrentVideo(videoRes.data);

      if (videosRes.success && Array.isArray(videosRes.data)) {
        const related = videosRes.data.filter(
          (v) =>
            v.id !== videoRes.data.id && v.grade_id === videoRes.data.grade_id,
        );
        setRelatedVideos(related);
      } else {
        setRelatedVideos([]);
      }
    } else {
      setError(videoRes.error || "الفيديو غير موجود");
    }

    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-16 text-gray-500">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">جاري تحميل الفيديو...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-4 p-8 text-center"
      >
        <AlertCircle size={56} className="text-red-300" />
        <p className="text-gray-500 text-sm">{error}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
          <button
            onClick={() => navigate("/assistant/online/videos")}
            className="px-5 py-2 border border-gray-300 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-50 transition"
          >
            رجوع
          </button>
        </div>
      </motion.div>
    );
  }

  if (!currentVideo) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-3 p-8 text-center"
      >
        <FileVideo size={56} className="text-gray-300" />
        <p className="text-gray-500 text-sm">الفيديو غير موجود</p>
        <button
          onClick={() => navigate("/assistant/online/videos")}
          className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition"
        >
          رجوع
        </button>
      </motion.div>
    );
  }

  return (
    <VideoPlayer
      video={currentVideo}
      onBack={() => navigate("/assistant/online/videos")}
      relatedVideos={relatedVideos}
      onRelatedClick={(video) =>
        navigate(`/assistant/online/videos/watch/${video.id}`)
      }
    />
  );
};

export default WatchVideo;
