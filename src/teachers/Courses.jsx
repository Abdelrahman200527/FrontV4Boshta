import {
  PlayCircle,
  FolderOpen,
  Search,
  X,
  ArrowRight,
  Download,
  Eye,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCourses,
  fetchPlaylistDetails,
  downloadVideoFileAction,
  previewVideoFileAction,
} from "../api/teacher/actions";
import PlaylistCard from "../components/PlaylistCard";
import VideoCard from "../components/VideoCard";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Courses = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilter, setShowFilter] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCourses();
    if (result.success) {
      setVideos(result.data.videos || []);
      setPlaylists(result.data.playlists || []);
      
      // ✅ استخراج الصفوف الفريدة من الفيديوهات والقوائم
      const allGrades = new Map();
      
      [...(result.data.videos || []), ...(result.data.playlists || [])].forEach(
        (item) => {
          if (item.grade_id && item.grade_name) {
            allGrades.set(item.grade_id, {
              id: item.grade_id,
              name: item.grade_name,
            });
          }
        },
      );
      
      setGrades(Array.from(allGrades.values()));
    } else {
      setError(result.error || "فشل تحميل المحاضرات");
    }
    setLoading(false);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterBySearch = (items) => {
    if (searchQuery.trim() === "") return items;
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.grade_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const filterByGrade = (items) => {
    if (selectedGrade === "all") return items;
    return items.filter(
      (item) => String(item.grade_id) === String(selectedGrade),
    );
  };

  const filteredVideos = filterByGrade(filterBySearch(videos));
  const filteredPlaylists = filterByGrade(filterBySearch(playlists));

  const getPlaylistId = (playlist) => playlist?.playlist_id || playlist?.id;
  const getVideoId = (video) => video?.video_id || video?.id;

  const handlePlaylistClick = async (playlist) => {
    const playlistId = getPlaylistId(playlist);

    if (!playlistId) {
      console.error("No playlist ID found:", playlist);
      return;
    }

    setSelectedPlaylist(playlist);
    setActiveTab("playlistVideos");
    setLoadingPlaylist(true);

    const result = await fetchPlaylistDetails(playlistId);

    if (result.success) {
      setPlaylistVideos(
        filterByGrade(result.data.videos || []),
      );
    }

    setLoadingPlaylist(false);
  };

  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null);
    setActiveTab("playlists");
    setPlaylistVideos([]);
  };

  const openWatch = (video) => {
    const actualVideoId = getVideoId(video);
    if (actualVideoId) {
      navigate(`/teacher/courses/watch/${actualVideoId}`);
    }
  };

  const handlePreview = async (video) => {
    const actualVideoId = getVideoId(video);
    if (!actualVideoId) return;
    await previewVideoFileAction(actualVideoId);
  };

  const handleDownload = async (video) => {
    const actualVideoId = getVideoId(video);
    if (!actualVideoId) return;
    await downloadVideoFileAction(actualVideoId);
  };

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
          <FolderOpen size={48} className="text-gray-300" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadData}
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
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen p-3 sm:p-5 bg-gray-50"
      dir="rtl"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              المحاضرات
            </h1>
            <span className="text-sm text-gray-500">
              {filteredVideos.length} فيديو • {filteredPlaylists.length} قائمة تشغيل
            </span>
          </div>

          <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-[#009966] text-white" : "text-gray-500"}`}
              >
                <Grid3x3 size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-[#009966] text-white" : "text-gray-500"}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex-1">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث في المحاضرات والقوائم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-sm w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 shrink-0 hover:text-red-500 transition"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 sm:w-56">
            <GraduationCap size={16} className="text-gray-400 shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-transparent focus:outline-none text-sm w-full cursor-pointer"
            >
              <option value="all">كل الصفوف</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto"
      >
        <button
          onClick={() => {
            setActiveTab("videos");
            setSelectedPlaylist(null);
            setPlaylistVideos([]);
          }}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "videos" ? "bg-[#009966] text-white" : "text-gray-500"}`}
        >
          <PlayCircle size={16} />
          الفيديوهات
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "videos" ? "bg-white/20" : "bg-gray-100"}`}
          >
            {filteredVideos.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("playlists");
            setSelectedPlaylist(null);
            setPlaylistVideos([]);
          }}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === "playlists" ? "bg-[#009966] text-white" : "text-gray-500"}`}
        >
          <FolderOpen size={16} />
          قوائم التشغيل
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "playlists" ? "bg-white/20" : "bg-gray-100"}`}
          >
            {filteredPlaylists.length}
          </span>
        </button>
        {selectedPlaylist && (
          <button
            onClick={handleBackToPlaylists}
            className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold bg-blue-50 text-blue-600 flex items-center gap-1"
          >
            <ArrowRight size={12} />
            <span className="truncate max-w-40">{selectedPlaylist.title}</span>
          </button>
        )}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Videos */}
        {activeTab === "videos" && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {filteredVideos.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <PlayCircle size={48} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm">لا توجد فيديوهات</p>
              </div>
            ) : (
              filteredVideos.map((video) => (
                <motion.div
                  key={getVideoId(video)}
                  whileHover={{ y: -3 }}
                  className="relative group"
                >
                  <VideoCard
                    video={video}
                    onWatch={() => openWatch(video)}
                    canDelete={false}
                  />
                  {video.file_url && (
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePreview(video)}
                        className="p-2 bg-white/95 rounded-lg shadow-sm"
                      >
                        <Eye size={14} className="text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDownload(video)}
                        className="p-2 bg-white/95 rounded-lg shadow-sm"
                      >
                        <Download size={14} className="text-green-500" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Playlists */}
        {activeTab === "playlists" && (
          <motion.div
            key="playlists"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
          >
            {filteredPlaylists.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                <FolderOpen size={48} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm">لا توجد قوائم تشغيل</p>
              </div>
            ) : (
              filteredPlaylists.map((playlist) => (
                <motion.div
                  key={getPlaylistId(playlist)}
                  whileHover={{ y: -3 }}
                >
                  <PlaylistCard
                    playlist={playlist}
                    onClick={() => handlePlaylistClick(playlist)}
                    canDelete={false}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Playlist Videos */}
        {activeTab === "playlistVideos" && selectedPlaylist && (
          <motion.div
            key="playlistVideos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {loadingPlaylist ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div
                className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
              >
                {playlistVideos.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-gray-400">
                    <p className="text-sm">هذه القائمة فارغة</p>
                  </div>
                ) : (
                  playlistVideos.map((video) => (
                    <motion.div
                      key={getVideoId(video)}
                      whileHover={{ y: -3 }}
                      className="relative group"
                    >
                      <VideoCard
                        video={video}
                        onWatch={() => openWatch(video)}
                        canDelete={false}
                      />
                      {video.file_url && (
                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePreview(video)}
                            className="p-2 bg-white/95 rounded-lg shadow-sm"
                          >
                            <Eye size={14} className="text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDownload(video)}
                            className="p-2 bg-white/95 rounded-lg shadow-sm"
                          >
                            <Download size={14} className="text-green-500" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))
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