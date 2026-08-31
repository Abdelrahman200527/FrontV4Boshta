import {
  ArrowRight,
  FolderOpen,
  Youtube,
  Search,
  X,
  PlayCircle,
  Clock,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Grid3x3,
  List,
  Eye,
  Download,
} from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlaylists, fetchPlaylistVideos } from "../api/student/actions";
import getImageUrl from "../utils/imageUrl";
import { downloadFile, previewFile } from "../utils/fileHandler";
import config from "../config";
import PlaylistCard from "../components/PlaylistCard";
import VideoCard from "../components/VideoCard";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const { apiUrl } = config;

const Courses = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchPlaylists();
    if (result.success) {
      setPlaylists(result.data || []);
      // ✅ Debug - شوف شكل البيانات
      console.log("Playlists data:", result.data);
    } else {
      setError(result.error || "فشل تحميل المحاضرات");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlaylists();
    setRefreshing(false);
  };

  const openPlaylist = async (playlist) => {
    // ✅ استخدام playlist_id الصحيح
    const playlistId = playlist.playlist_id || playlist.playlist_id;

    if (!playlistId) {
      console.error("No playlist ID found:", playlist);
      return;
    }

    console.log("Opening playlist with ID:", playlistId);

    setSelectedPlaylist(playlist);
    setLoadingVideos(true);

    const result = await fetchPlaylistVideos(playlistId);

    if (result.success) {
      setPlaylistVideos(result.data || []);
      console.log("Playlist videos:", result.data);
    } else {
      setError(result.error || "فشل تحميل الفيديوهات");
    }

    setLoadingVideos(false);
  };

  const handleBack = () => {
    setSelectedPlaylist(null);
    setPlaylistVideos([]);
    setSearchQuery("");
    setError(null);
  };

  const openWatch = (video) => {
    const videoId = video.video_id || video.id;
    navigate(`/student/courses/watch/${videoId}`);
  };

  const handlePreview = async (video) => {
    const videoId = video.video_id || video.id;
    // ✅ استخدام المسار الصحيح للملف
    if (video.file_url) {
      const url = `${apiUrl.replace("/api", "")}/${video.file_url.replace(/^\//, "")}`;
      await previewFile(url);
    }
  };

  const handleDownload = async (video) => {
    const videoId = video.video_id || video.id;
    // ✅ استخدام المسار الصحيح للملف
    if (video.file_url) {
      const url = `${apiUrl.replace("/api", "")}/${video.file_url.replace(/^\//, "")}`;
      await downloadFile(url);
    }
  };

  const filteredPlaylists = useMemo(
    () =>
      playlists.filter(
        (playlist) =>
          searchQuery.trim() === "" ||
          playlist.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playlist.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [playlists, searchQuery],
  );

  const filteredVideos = useMemo(
    () =>
      playlistVideos.filter(
        (video) =>
          searchQuery.trim() === "" ||
          video.title?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [playlistVideos, searchQuery],
  );

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">جاري تحميل المحاضرات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle size={48} className="text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadPlaylists}
            className="px-4 py-2 bg-[#009966] text-white rounded-lg hover:bg-[#007a52] transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5"
      dir="rtl"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              المحاضرات
            </h1>
            <span className="text-sm sm:text-base text-gray-500">
              مكتبة الفيديوهات التعليمية
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-[#009966]"
                    : "text-gray-500"
                }`}
                title="عرض شبكي"
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-[#009966]"
                    : "text-gray-500"
                }`}
                title="عرض قائمة"
              >
                <List size={16} />
              </button>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:border-[#009966] transition"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              تحديث
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-full sm:w-80">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="بحث في المحاضرات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent focus:outline-none text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </motion.header>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 border-b border-gray-200 overflow-x-auto custom-scrollbar"
      >
        <button
          onClick={handleBack}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
            !selectedPlaylist
              ? "border-[#009966] text-[#009966]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <FolderOpen size={16} />
            قوائم التشغيل
            <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs">
              {playlists.length}
            </span>
          </span>
        </button>
        {selectedPlaylist && (
          <button className="shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-1">
            <ArrowRight size={12} />
            <span className="truncate max-w-40">{selectedPlaylist.title}</span>
            <span className="bg-blue-100 rounded-full px-2 py-0.5 text-xs">
              {playlistVideos.length}
            </span>
          </button>
        )}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Playlists Grid */}
        {!selectedPlaylist && (
          <motion.div
            key="playlists"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`grid gap-3 sm:gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {filteredPlaylists.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <FolderOpen size={48} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm">
                  {searchQuery ? "لا توجد نتائج مطابقة" : "لا توجد قوائم تشغيل"}
                </p>
              </div>
            ) : (
              filteredPlaylists.map((playlist) => (
                <motion.div
                  key={playlist.playlist_id || playlist.playlist_id}
                  whileHover={{ y: -2 }}
                >
                  <PlaylistCard
                    playlist={playlist}
                    onClick={() => openPlaylist(playlist)}
                    canDelete={false}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Playlist Videos */}
        {selectedPlaylist && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {loadingVideos ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div
                className={`grid gap-3 sm:gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {filteredVideos.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <Youtube size={48} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-sm">
                      {searchQuery
                        ? "لا توجد نتائج مطابقة"
                        : "هذه القائمة فارغة"}
                    </p>
                  </div>
                ) : (
                  filteredVideos.map((video) => {
                    const videoId = video.video_id || video.id;

                    return (
                      <motion.div
                        key={videoId}
                        whileHover={{ y: -2 }}
                        className="relative group"
                      >
                        <VideoCard
                          video={video}
                          onWatch={() => openWatch(video)}
                          canDelete={false}
                        />

                        {/* Preview & Download Overlay */}
                        {video.file_url && (
                          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(video);
                              }}
                              className="p-2 bg-white/90 rounded-lg shadow-sm hover:bg-white transition"
                              title="معاينة"
                            >
                              <Eye size={14} className="text-blue-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(video);
                              }}
                              className="p-2 bg-white/90 rounded-lg shadow-sm hover:bg-white transition"
                              title="تحميل"
                            >
                              <Download size={14} className="text-green-500" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Courses;
