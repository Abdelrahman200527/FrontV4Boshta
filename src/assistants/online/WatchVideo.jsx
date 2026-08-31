import { FileVideo } from "lucide-react";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    loadData();
  }, [videoId]);

  const loadData = async () => {
    setLoading(true);
    
    const [videoRes, videosRes] = await Promise.all([
      fetchVideoById(parseInt(videoId)),
      fetchAllVideos(),
    ]);
    
    if (videoRes.success) {
      setCurrentVideo(videoRes.data);
      
      if (videosRes.success) {
        const related = videosRes.data.filter(
          (v) => v.id !== videoRes.data.id && v.grade_id === videoRes.data.grade_id,
        );
        setRelatedVideos(related);
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-16 text-gray-500">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">جاري تحميل الفيديو...</p>
      </div>
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
          className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold"
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