import {
  Play,
  Youtube,
  FileVideo,
  Trash2,
  FileText,
  Pencil,
} from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const VideoCard = ({
  video,
  onWatch,
  onDelete,
  onEdit,
  canDelete = false,
  canEdit = false,
}) => {
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match ? match[1] : null;
  };

  const isYouTube = (url) => !!getYouTubeId(url);
  const isDrive = (url) => url?.includes("drive.google.com");

  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith("http")) return thumbnailPath;
    return `https://backend.benb3n.cloud/${thumbnailPath}`;
  };

  const thumbnailUrl = video.thumbnail_url
    ? getThumbnailUrl(video.thumbnail_url)
    : null;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={onWatch}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition cursor-pointer"
    >
      <motion.div
        variants={itemVariants}
        className="relative aspect-video bg-gray-100"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            {isYouTube(video.video_url) ? (
              <Youtube size={40} className="text-red-500" />
            ) : isDrive(video.video_url) ? (
              <FileVideo size={40} className="text-blue-500" />
            ) : (
              <FileVideo size={40} className="text-gray-400" />
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
          <Play
            size={32}
            className="text-white opacity-0 group-hover:opacity-100 transition"
          />
        </div>

        {video.file_url && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white p-1.5 rounded shadow">
            <FileText size={12} />
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="p-2.5">
        <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug">
          {video.title}
        </h3>
        {video.grade_name && (
          <span className="text-[10px] sm:text-xs text-gray-500 block mt-0.5">
            {video.grade_name}
          </span>
        )}

        {(canDelete || canEdit) && (
          <div className="flex gap-1 mt-1.5">
            {canEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(video);
                }}
                className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-md text-[10px] sm:text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-1"
              >
                <Pencil size={11} />
                تعديل
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(video.id);
                }}
                className="flex-1 py-1.5 bg-red-50 text-red-600 rounded-md text-[10px] sm:text-xs font-bold hover:bg-red-100 flex items-center justify-center gap-1"
              >
                <Trash2 size={11} />
                حذف
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VideoCard;
