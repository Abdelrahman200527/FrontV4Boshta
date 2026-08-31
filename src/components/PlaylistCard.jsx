import { FolderOpen, Play, Trash2, Pencil } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const PlaylistCard = ({
  playlist,
  onClick,
  onDelete,
  onEdit,
  canDelete = false,
  canEdit = false,
}) => {
  // ✅ الصورة المرفوعة فقط
  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith("http")) return thumbnailPath;
    return `https://backend.benb3n.cloud/${thumbnailPath.replace(/^\//, "")}`;
  };

  const thumbnailUrl = getThumbnailUrl(playlist.thumbnail_url);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition cursor-pointer"
    >
      <motion.div
        variants={itemVariants}
        className="relative aspect-video bg-gray-100"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.classList.add(
                "bg-gradient-to-br",
                "from-orange-50",
                "to-orange-100",
              );
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-50 to-orange-100">
            <FolderOpen size={40} className="text-orange-500" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
          <Play
            size={32}
            className="text-white opacity-0 group-hover:opacity-100 transition"
          />
        </div>

        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded">
          {playlist.videos_count || 0} فيديو
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="p-2.5">
        <h3 className="font-bold text-xs sm:text-sm truncate">
          {playlist.title}
        </h3>
        {playlist.grade_name && (
          <span className="text-[10px] sm:text-xs text-gray-500 block mt-0.5">
            {playlist.grade_name}
          </span>
        )}

        {(canDelete || canEdit) && (
          <div className="flex gap-1 mt-1.5">
            {canEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(playlist);
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
                  onDelete(playlist.playlist_id || playlist.id);
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

export default PlaylistCard;