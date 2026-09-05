/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import {
  notifyError,
  notifySuccess,
  notifyInfo,
  confirmToast,
} from "../../lib/notify";
import {
  Plus,
  X,
  Youtube,
  ListVideo,
  ArrowRight,
  FolderOpen,
  Search,
  FileText,
  Loader2,
} from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllVideos,
  createNewVideo,
  removeVideo,
  fetchAllPlaylists,
  createNewPlaylist,
  removePlaylist,
  addVideoToPlaylistAction,
  fetchAllGrades,
  fetchPlaylistVideos,
  updateVideoInfo,
  updatePlaylistInfo,
  removeVideoFromPlaylistAction,
} from "../../api/assistant/actions";
import VideoCard from "../../components/VideoCard";
import PlaylistCard from "../../components/PlaylistCard";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../../motion";

const Videos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const setMessage = (msg) => {
    if (!msg?.text) return;
    if (msg.type === "success") notifySuccess(msg.text);
    else notifyError(msg.text);
  };

  const [activeTab, setActiveTab] = useState("videos");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistVideos, setSelectedPlaylistVideos] = useState([]);
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  const [videoForm, setVideoForm] = useState({
    title: "",
    gradeId: "",
    videoUrl: "",
    playlistId: "",
    videoFile: null,
    thumbnailFile: null,
    description: "",
  });
  const [playlistForm, setPlaylistForm] = useState({
    title: "",
    gradeId: "",
    thumbnailFile: null,
  });

  const videoFileRef = useRef(null);
  const thumbnailFileRef = useRef(null);
  const playlistThumbnailRef = useRef(null);

  const VIDEO_FILE_ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
  const THUMBNAIL_ACCEPT = "image/*";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [videosRes, playlistsRes, gradesRes] = await Promise.all([
      fetchAllVideos(),
      fetchAllPlaylists(),
      fetchAllGrades(),
    ]);
    if (videosRes.success) setVideos(videosRes.data);
    if (playlistsRes.success) setPlaylists(playlistsRes.data);
    if (gradesRes.success) setGrades(gradesRes.data);
    setLoading(false);
  };

  const resetVideoForm = () => {
    setVideoForm({
      title: "",
      gradeId: "",
      videoUrl: "",
      playlistId: "",
      videoFile: null,
      thumbnailFile: null,
      description: "",
    });
    setEditingVideo(null);
  };

  const resetPlaylistForm = () => {
    setPlaylistForm({ title: "", gradeId: "", thumbnailFile: null });
    setEditingPlaylist(null);
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesGrade =
        !gradeFilter || video.grade_id === parseInt(gradeFilter);
      const matchesSearch = !search || video.title.includes(search);
      return matchesGrade && matchesSearch;
    });
  }, [videos, gradeFilter, search]);

  const filteredPlaylists = useMemo(() => {
    return playlists.filter((playlist) => {
      const matchesGrade =
        !gradeFilter || playlist.grade_id === parseInt(gradeFilter);
      const matchesSearch = !search || playlist.title.includes(search);
      return matchesGrade && matchesSearch;
    });
  }, [playlists, gradeFilter, search]);

  const playlistsForSelectedGrade = gradeFilter
    ? playlists.filter((pl) => pl.grade_id === parseInt(gradeFilter))
    : playlists;

  const handleAddVideo = async (e) => {
    e.preventDefault();

    if (!videoForm.title?.trim()) {
      setMessage({ type: "error", text: "عنوان الفيديو مطلوب" });
      return;
    }
    if (!videoForm.gradeId) {
      setMessage({ type: "error", text: "الصف مطلوب" });
      return;
    }
    if (!videoForm.videoUrl?.trim()) {
      setMessage({ type: "error", text: "رابط الفيديو مطلوب" });
      return;
    }

    setSavingVideo(true);

    const formData = new FormData();
    formData.append("title", videoForm.title);
    formData.append("grade_id", videoForm.gradeId);
    formData.append("video_url", videoForm.videoUrl);
    if (videoForm.description)
      formData.append("description", videoForm.description);
    if (videoForm.thumbnailFile)
      formData.append("thumbnail", videoForm.thumbnailFile);
    if (videoForm.videoFile) formData.append("file", videoForm.videoFile);

    let result;
    if (editingVideo) {
      result = await updateVideoInfo(editingVideo.id, formData);
    } else {
      result = await createNewVideo(formData);
    }

    if (result.success) {
      if (videoForm.playlistId && !editingVideo) {
        await addVideoToPlaylistAction(
          parseInt(videoForm.playlistId),
          result.data.id,
        );
      }
      setMessage({
        type: "success",
        text: editingVideo
          ? "تم تعديل الفيديو بنجاح"
          : "تم إضافة الفيديو بنجاح",
      });
      setShowVideoModal(false);
      resetVideoForm();
      loadData();
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setSavingVideo(false);
  };

  const handleAddPlaylist = async (e) => {
    e.preventDefault();

    if (!playlistForm.title?.trim()) {
      setMessage({ type: "error", text: "عنوان القائمة مطلوب" });
      return;
    }
    if (!playlistForm.gradeId) {
      setMessage({ type: "error", text: "الصف مطلوب" });
      return;
    }

    setSavingPlaylist(true);

    const formData = new FormData();
    formData.append("title", playlistForm.title);
    formData.append("grade_id", playlistForm.gradeId);
    if (playlistForm.thumbnailFile)
      formData.append("thumbnail", playlistForm.thumbnailFile);

    let result;
    if (editingPlaylist) {
      result = await updatePlaylistInfo(editingPlaylist.playlist_id, formData);
    } else {
      result = await createNewPlaylist(formData);
    }

    if (result.success) {
      setMessage({
        type: "success",
        text: editingPlaylist
          ? "تم تعديل القائمة بنجاح"
          : "تم إنشاء القائمة بنجاح",
      });
      setShowPlaylistModal(false);
      resetPlaylistForm();
      loadData();
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setSavingPlaylist(false);
  };

  const openPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    setActiveTab("playlistVideos");
    const result = await fetchPlaylistVideos(playlist.playlist_id);
    if (result.success) setSelectedPlaylistVideos(result.data);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title || "",
      gradeId: video.grade_id || "",
      videoUrl: video.video_url || "",
      playlistId: "",
      videoFile: null,
      thumbnailFile: null,
      description: video.description || "",
    });
    setShowVideoModal(true);
  };

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistForm({
      title: playlist.title || "",
      gradeId: playlist.grade_id || "",
      thumbnailFile: null,
    });
    setShowPlaylistModal(true);
  };

  const handleDeleteVideo = async (videoId) => {
    confirmToast("حذف هذا الفيديو؟", async () => {
      const result = await removeVideo(videoId);
      if (result.success) {
        setMessage({ type: "success", text: "تم حذف الفيديو بنجاح" });
        loadData();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const handleDeletePlaylist = async (playlistId) => {
    confirmToast("حذف هذه القائمة؟", async () => {
      const result = await removePlaylist(playlistId);
      if (result.success) {
        setMessage({ type: "success", text: "تم حذف القائمة بنجاح" });
        loadData();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const handleRemoveVideoFromPlaylist = async (playlistVideoId) => {
    confirmToast("إزالة الفيديو من القائمة؟", async () => {
      const result = await removeVideoFromPlaylistAction(playlistVideoId);
      if (result.success) {
        setMessage({ type: "success", text: "تم إزالة الفيديو من القائمة" });
        openPlaylist(selectedPlaylist);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  const openWatch = (video) => {
    navigate(`/assistant/online/videos/watch/${video.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen"
      dir="rtl"
    >
      <motion.header
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            المحاضرات
          </h1>
          <span className="text-gray-500 text-sm">
            مكتبة المحاضرات التعليمية
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              resetVideoForm();
              setShowVideoModal(true);
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-700 transition"
          >
            <Youtube size={14} />
            <span className="hidden sm:inline">فيديو جديد</span>
          </button>
          <button
            onClick={() => {
              resetPlaylistForm();
              setShowPlaylistModal(true);
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-primary/90 transition"
          >
            <ListVideo size={14} />
            <span className="hidden sm:inline">قائمة جديدة</span>
          </button>
        </div>
      </motion.header>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
        >
          <option value="">كل الصفوف</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("videos");
            setSelectedPlaylist(null);
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === "videos" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}
        >
          الفيديوهات ({filteredVideos.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("playlists");
            setSelectedPlaylist(null);
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${activeTab === "playlists" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}
        >
          قوايم التشغيل ({filteredPlaylists.length})
        </button>
        {selectedPlaylist && (
          <button className="shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-1">
            <ArrowRight size={12} />
            {selectedPlaylist.title}
          </button>
        )}
      </div>

      {activeTab === "videos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Youtube size={48} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm">لا توجد فيديوهات</p>
            </div>
          ) : (
            filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onWatch={() => openWatch(video)}
                onEdit={() => handleEditVideo(video)}
                onDelete={handleDeleteVideo}
                canDelete={true}
                canEdit={true}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "playlists" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredPlaylists.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <ListVideo size={48} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm">لا توجد قوايم تشغيل</p>
            </div>
          ) : (
            filteredPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.playlist_id}
                playlist={playlist}
                onClick={() => openPlaylist(playlist)}
                onEdit={() => handleEditPlaylist(playlist)}
                onDelete={handleDeletePlaylist}
                canDelete={true}
                canEdit={true}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "playlistVideos" && selectedPlaylist && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {selectedPlaylistVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <FolderOpen size={48} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm">هذه القائمة فارغة</p>
            </div>
          ) : (
            selectedPlaylistVideos.map((item) => (
              <VideoCard
                key={item.id}
                video={item.video || item}
                onWatch={() => openWatch(item.video || item)}
                onDelete={() =>
                  handleRemoveVideoFromPlaylist(
                    item.playlist_video_id || item.id,
                  )
                }
                canDelete={true}
                canEdit={false}
              />
            ))
          )}
        </div>
      )}

      {showVideoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-base">
                {editingVideo ? "تعديل فيديو" : "إضافة فيديو"}
              </h2>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVideo} className="p-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="عنوان الفيديو *"
                value={videoForm.title}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, title: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none"
                required
              />
              <select
                value={videoForm.gradeId}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, gradeId: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none"
                required
              >
                <option value="">اختر الصف *</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
              <input
                type="url"
                placeholder="رابط الفيديو (يوتيوب أو Drive) *"
                value={videoForm.videoUrl}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, videoUrl: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none"
                required
              />
              <textarea
                placeholder="وصف (اختياري)"
                value={videoForm.description}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, description: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none resize-none"
                rows={2}
              />
              {!editingVideo && (
                <select
                  value={videoForm.playlistId}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, playlistId: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none"
                >
                  <option value="">بدون قائمة</option>
                  {(videoForm.gradeId
                    ? playlists.filter(
                        (pl) => pl.grade_id === parseInt(videoForm.gradeId),
                      )
                    : playlists
                  ).map((pl) => (
                    <option key={pl.playlist_id} value={pl.playlist_id}>
                      {pl.title}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">
                    صورة مصغرة (اختياري)
                  </span>
                  <button
                    type="button"
                    onClick={() => thumbnailFileRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Plus size={12} />
                    إضافة صورة
                  </button>
                </div>
                {videoForm.thumbnailFile && (
                  <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2.5 py-2">
                    <span className="text-[12px] text-gray-700 truncate">
                      {videoForm.thumbnailFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setVideoForm({ ...videoForm, thumbnailFile: null })
                      }
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <input
                  ref={thumbnailFileRef}
                  type="file"
                  accept={THUMBNAIL_ACCEPT}
                  onChange={(e) => {
                    setVideoForm({
                      ...videoForm,
                      thumbnailFile: e.target.files[0],
                    });
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                />
              </div>
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-600">
                    <FileText size={14} />
                    ملف مرفق (اختياري - PDF/Word/صورة)
                  </span>
                  <button
                    type="button"
                    onClick={() => videoFileRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Plus size={12} />
                    إضافة ملف
                  </button>
                </div>
                {videoForm.videoFile && (
                  <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2.5 py-2">
                    <span className="text-[12px] text-gray-700 truncate">
                      {videoForm.videoFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setVideoForm({ ...videoForm, videoFile: null })
                      }
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <input
                  ref={videoFileRef}
                  type="file"
                  accept={VIDEO_FILE_ACCEPT}
                  onChange={(e) => {
                    setVideoForm({
                      ...videoForm,
                      videoFile: e.target.files[0],
                    });
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingVideo}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                >
                  {savingVideo
                    ? "جاري الحفظ..."
                    : editingVideo
                      ? "تعديل"
                      : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 border border-gray-200 rounded-lg text-sm text-gray-500"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPlaylistModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
          onClick={() => setShowPlaylistModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-base">
                {editingPlaylist ? "تعديل قائمة" : "قائمة جديدة"}
              </h2>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleAddPlaylist}
              className="p-4 flex flex-col gap-3"
            >
              <input
                type="text"
                placeholder="عنوان القائمة *"
                value={playlistForm.title}
                onChange={(e) =>
                  setPlaylistForm({ ...playlistForm, title: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none"
                required
              />
              <select
                value={playlistForm.gradeId}
                onChange={(e) =>
                  setPlaylistForm({ ...playlistForm, gradeId: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none"
                required
              >
                <option value="">اختر الصف *</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">
                    صورة مصغرة (اختياري)
                  </span>
                  <button
                    type="button"
                    onClick={() => playlistThumbnailRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50"
                  >
                    <Plus size={12} />
                    إضافة صورة
                  </button>
                </div>
                {playlistForm.thumbnailFile && (
                  <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2.5 py-2">
                    <span className="text-[12px] text-gray-700 truncate">
                      {playlistForm.thumbnailFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPlaylistForm({
                          ...playlistForm,
                          thumbnailFile: null,
                        })
                      }
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <input
                  ref={playlistThumbnailRef}
                  type="file"
                  accept={THUMBNAIL_ACCEPT}
                  onChange={(e) => {
                    setPlaylistForm({
                      ...playlistForm,
                      thumbnailFile: e.target.files[0],
                    });
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingPlaylist}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                >
                  {savingPlaylist
                    ? "جاري الحفظ..."
                    : editingPlaylist
                      ? "تعديل"
                      : "إنشاء"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlaylistModal(false)}
                  className="px-4 border border-gray-200 rounded-lg text-sm text-gray-500"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Videos;
