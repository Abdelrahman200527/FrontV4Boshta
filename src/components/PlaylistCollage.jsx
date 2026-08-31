import { PlayCircle, FolderOpen } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { pageVariants } from "../motion";

const PlaylistCollage = ({ videos = [] }) => {
  // ✅ الصورة المرفوعة فقط
  const getThumbnailUrl = (video) => {
    if (video.thumbnail_url) {
      if (video.thumbnail_url.startsWith("http")) return video.thumbnail_url;
      return `https://backend.benb3n.cloud/${video.thumbnail_url.replace(/^\//, "")}`;
    }
    return null;
  };

  const thumbnails = videos
    .slice(0, 4)
    .map((video) => getThumbnailUrl(video))
    .filter(Boolean);

  if (thumbnails.length === 0) {
    return (
      <div className="w-full aspect-video bg-linear-to-br from-orange-500/10 to-orange-500/30 flex items-center justify-center">
        <FolderOpen size={48} className="text-orange-500" />
      </div>
    );
  }

  if (thumbnails.length === 1) {
    return (
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        <img
          src={thumbnails[0]}
          alt="playlist"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <PlayCircle size={40} className="text-white" />
        </div>
      </div>
    );
  }

  if (thumbnails.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 w-full aspect-video bg-gray-100">
        {thumbnails.map((thumb, index) => (
          <div key={index} className="relative overflow-hidden">
            <img
              src={thumb}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (thumbnails.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5 w-full aspect-video bg-gray-100">
        <div className="relative overflow-hidden row-span-2">
          <img
            src={thumbnails[0]}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="relative overflow-hidden">
          <img
            src={thumbnails[1]}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="relative overflow-hidden">
          <img
            src={thumbnails[2]}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full aspect-video bg-gray-100"
    >
      {thumbnails.map((thumb, index) => (
        <div key={index} className="relative overflow-hidden">
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
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