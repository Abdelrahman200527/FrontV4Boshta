// PlaylistThumbnail.jsx - Component جديد

import { PlayCircle, FolderOpen } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { pageVariants } from "../motion";

const PlaylistCollage = ({ videos = [] }) => {
  const getYouTubeId = (url) => {
    const match = url?.match(
      /(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|)([a-zA-Z0-9_-]{11})/,
    );
    return match ? match[1] : null;
  };

  const getThumbnail = (url) => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  const thumbnails = videos
    .slice(0, 4)
    .map((video) => getThumbnail(video.youtube_url))
    .filter(Boolean);

  // لو مفيش فيديوهات
  if (thumbnails.length === 0) {
    return (
      <div className="w-full aspect-video bg-linear-to-br from-orange-500/10 to-orange-500/30 flex items-center justify-center">
        <FolderOpen size={48} className="text-orange-500" />
      </div>
    );
  }

  // لو فيديو واحد
  if (thumbnails.length === 1) {
    return (
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        <img
          src={thumbnails[0]}
          alt="playlist"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <PlayCircle size={40} className="text-white" />
        </div>
      </div>
    );
  }

  // لو فيديوهين - جنب بعض
  if (thumbnails.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 w-full aspect-video bg-gray-100">
        {thumbnails.map((thumb, index) => (
          <div key={index} className="relative overflow-hidden">
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // لو 3 فيديوهات
  if (thumbnails.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5 w-full aspect-video bg-gray-100">
        <div className="relative overflow-hidden row-span-2">
          <img src={thumbnails[0]} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative overflow-hidden">
          <img src={thumbnails[1]} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative overflow-hidden">
          <img src={thumbnails[2]} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  // 4 فيديوهات - Grid 2x2
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show" className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full aspect-video bg-gray-100">
      {thumbnails.map((thumb, index) => (
        <div key={index} className="relative overflow-hidden">
          <img src={thumb} alt="" className="w-full h-full object-cover" />
          {index === 3 && videos.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                +{videos.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
};

export default PlaylistCollage;