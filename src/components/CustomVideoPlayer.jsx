import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import getImageUrl from "../utils/imageUrl";
import VideoWatermark from "./VideoWatermark";

/**
 * Helper: Extract YouTube Video ID from any URL format
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

/**
 * Helper: Extract Google Drive Video Preview URL
 */
export const extractDrivePreviewUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
};

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

/**
 * Load YouTube IFrame API Script Singleton
 */
let ytApiPromise = null;
const loadYouTubeIframeApi = () => {
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      if (!document.getElementById("yt-iframe-api-script")) {
        const script = document.createElement("script");
        script.id = "yt-iframe-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === "function") prevCallback();
        resolve(window.YT);
      };
    });
  }
  return ytApiPromise;
};

export default function CustomVideoPlayer({
  videoUrl,
  title = "",
  thumbnail,
  thumbnailUrl,
  poster,
  watermarkStudentId,
  watermarkStudentName,
  className = "",
  onEnded,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const updateTimerRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const playerElementId = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isObscured, setIsObscured] = useState(false);

  const rawThumbnail = thumbnail || thumbnailUrl || poster;
  const resolvedThumbnail = !thumbnailError && rawThumbnail ? getImageUrl(rawThumbnail) : null;

  useEffect(() => {
    setHasStartedPlaying(false);
    setThumbnailError(false);
  }, [videoUrl, rawThumbnail]);

  const youtubeId = extractYouTubeId(videoUrl);
  const driveEmbedUrl = !youtubeId ? extractDrivePreviewUrl(videoUrl) : null;

  // Auto-hide controls handler
  const triggerShowControls = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setIsSpeedMenuOpen(false);
      }, 2800);
    }
  }, [isPlaying]);

  // Sync controls visibility on play/pause
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    } else {
      triggerShowControls();
    }
  }, [isPlaying, triggerShowControls]);

  // Anti-Screen Recording & Screenshots (DOM deterrents)
  useEffect(() => {
    const handleObscure = () => {
      setIsObscured(true);
      if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
        playerRef.current.pauseVideo();
      }
    };
    
    const handleClear = () => {
      setIsObscured(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleObscure();
      } else {
        handleClear();
      }
    };

    const handleKeyDown = (e) => {
      // Block common screenshot shortcut keys
      if (
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && ["s", "S", "3", "4", "5"].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && ["s", "S"].includes(e.key))
      ) {
        handleObscure();
        // Clear clipboard hack (doesn't always work without permissions, but helps deter)
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("غير مسموح بأخذ لقطات شاشة.");
        }
        setTimeout(handleClear, 3000);
      }
    };

    window.addEventListener("blur", handleObscure);
    window.addEventListener("focus", handleClear);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleObscure);
      window.removeEventListener("focus", handleClear);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Update progress timer
  const startProgressTracking = useCallback(() => {
    if (updateTimerRef.current) clearInterval(updateTimerRef.current);
    updateTimerRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        try {
          const curr = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
        } catch (e) {
          // ignore
        }
      }
    }, 250);
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    let isCancelled = false;

    if (!youtubeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    loadYouTubeIframeApi().then((YT) => {
      if (isCancelled) return;

      // Clean existing instance
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }

      playerRef.current = new YT.Player(playerElementId.current, {
        videoId: youtubeId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          cc_load_policy: 0,
          loop: 0,
          fs: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (isCancelled) return;
            setIsLoading(false);
            event.target.setVolume(volume);
            startProgressTracking();
          },
          onStateChange: (event) => {
            if (isCancelled) return;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsLoading(false);
              setHasStartedPlaying(true);
            } else if (event.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setHasStartedPlaying(false);
              if (typeof onEnded === "function") onEnded();
            } else if (event.data === YT.PlayerState.BUFFERING) {
              setIsLoading(true);
            }
          },
          onError: (event) => {
            if (isCancelled) return;
            setIsLoading(false);
            setHasError(true);
            setErrorMessage("تعذر تشغيل هذا الفيديو. يرجى المحاولة لاحقاً أو مراجعة إدارة السنتر.");
          },
        },
      });
    });

    return () => {
      isCancelled = true;
      if (updateTimerRef.current) clearInterval(updateTimerRef.current);
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [youtubeId, onEnded, startProgressTracking]);

  // Controls Handlers
  const togglePlay = () => {
    if (!playerRef.current || typeof playerRef.current.getPlayerState !== "function") return;
    try {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const seekRelative = (seconds) => {
    if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;
    try {
      const curr = playerRef.current.getCurrentTime() || 0;
      const dur = playerRef.current.getDuration() || 0;
      const target = Math.max(0, Math.min(dur, curr + seconds));
      playerRef.current.seekTo(target, true);
      setCurrentTime(target);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProgressBarClick = (e) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const target = duration * ratio;
    playerRef.current.seekTo(target, true);
    setCurrentTime(target);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 100);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (!playerRef.current) return;
    if (val === 0) {
      playerRef.current.mute();
      setIsMuted(true);
    } else {
      playerRef.current.unMute();
      playerRef.current.setVolume(val);
      setIsMuted(false);
    }
  };

  const handleSpeedSelect = (speed) => {
    setPlaybackSpeed(speed);
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === "function") {
      playerRef.current.setPlaybackRate(speed);
    }
    setIsSpeedMenuOpen(false);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seekRelative(10);
      } else if (e.key.toLowerCase() === "m") {
        toggleMute();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // If it's a Drive video fallback
  if (driveEmbedUrl) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ${className}`}>
        <iframe
          src={driveEmbedUrl}
          className="w-full h-full border-0"
          allow="autoplay"
          allowFullScreen
          title={title || "فيديو المحاضرة"}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerShowControls}
      onMouseEnter={triggerShowControls}
      onTouchStart={triggerShowControls}
      onDoubleClick={toggleFullscreen}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl select-none group font-sans print:hidden flex items-center justify-center ${
        isObscured ? "blur-3xl brightness-50" : "blur-none brightness-100"
      } transition-all duration-300 ${className}`}
      dir="ltr"
    >
      {/* 
        INNER 16:9 WRAPPER: Ensures the 300% trick doesn't break when entering fullscreen on ultra-wide or mobile screens.
      */}
      <div className="relative w-full max-w-full max-h-full aspect-video">
        <div
          className="absolute top-[-100%] left-0 w-full h-[300%] bg-black pointer-events-none"
          style={{
            position: "absolute",
            top: "-100%",
            left: 0,
            width: "100%",
            height: "300%",
            background: "black",
            pointerEvents: "none",
          }}
        >
          <div id={playerElementId.current} className="w-full h-full" />
        </div>
      </div>

      {/* Global CSS override for embedded iframe */}
      <style>{`
        #${playerElementId.current} iframe {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          pointer-events: none !important;
        }
        @media print {
          body * {
            visibility: hidden;
          }
        }
      `}</style>

      {/* =========================================================================
          CUSTOM THUMBNAIL / POSTER OVERLAY
         ========================================================================= */}
      {resolvedThumbnail && !hasStartedPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        >
          <img
            src={resolvedThumbnail}
            alt={title || "غلاف المحاضرة"}
            className="w-full h-full object-cover select-none"
            onError={() => setThumbnailError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/40 pointer-events-none" />
        </div>
      )}

      {/* =========================================================================
          LOADING SPINNER
         ========================================================================= */}
      {isLoading && (!resolvedThumbnail || hasStartedPlaying) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs text-white pointer-events-none transition-opacity duration-300">
          <Loader2 size={42} className="animate-spin text-[#009966] mb-3" />
          <p className="text-sm font-bold text-gray-200">جاري تجهيز المشغل الآمن...</p>
        </div>
      )}

      {/* =========================================================================
          ERROR OVERLAY
         ========================================================================= */}
      {hasError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-gray-950 text-white text-center">
          <div className="max-w-md flex flex-col items-center">
            <AlertCircle size={48} className="text-red-500 mb-3" />
            <h4 className="text-lg font-bold mb-1">تعذر تشغيل الفيديو</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          CUSTOM UI OVERLAY
         ========================================================================= */}
      <div
        className={`absolute inset-0 z-20 flex flex-col justify-between pointer-events-none transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.75) 0%, transparent 22%, transparent 65%, rgba(0, 0, 0, 0.92) 100%)",
        }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-3 sm:p-5 pointer-events-auto" dir="rtl">
          <div className="flex items-center gap-2 max-w-[85%]">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#009966] animate-pulse"></span>
            <span className="text-[11px] sm:text-sm font-bold text-white drop-shadow-md truncate">
              {title || "مشاهدة المحاضرة"}
            </span>
          </div>
        </div>

        {/* Big Center Play / Pause Floating Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="relative flex items-center justify-center">
            {/* Dark & emerald halo guaranteeing 100% full coverage of any native background player logo */}
            <div className="absolute w-[98px] h-[98px] sm:w-[116px] sm:h-[116px] rounded-full bg-black/60 shadow-[0_0_30px_rgba(0,153,102,0.45)] pointer-events-none" />

            <button
              type="button"
              onClick={togglePlay}
              className="relative w-[86px] h-[86px] sm:w-[102px] sm:h-[102px] rounded-full bg-[#1a5d1a] hover:bg-[#124212] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/25 cursor-pointer backdrop-blur-xs"
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? (
                <Pause size={32} className="text-white sm:w-[38px] sm:h-[38px]" />
              ) : (
                <Play size={34} className="text-white translate-x-1 sm:w-[40px] sm:h-[40px] drop-shadow-md" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="w-full p-2 sm:p-5 pointer-events-auto space-y-2">
          {/* Progress Bar (Scrubber) */}
          <div
            onClick={handleProgressBarClick}
            className="relative w-full h-1 sm:h-2 bg-white/25 hover:h-2 sm:hover:h-2.5 rounded-full cursor-pointer transition-all duration-150 overflow-hidden group/bar"
            title="انقر للتقديم أو التأخير"
          >
            <div
              className="h-full bg-gradient-to-r from-[#009966] to-[#1a5d1a] rounded-full transition-all duration-100 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-md scale-0 group-hover/bar:scale-100 transition-transform"></div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-1 sm:gap-3 text-white">
            {/* Left Controls (Play, Skip, Time) */}
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="p-1 sm:p-1.5 hover:text-[#009966] hover:scale-110 transition active:scale-95"
                title={isPlaying ? "إيقاف مؤقت (Space)" : "تشغيل (Space)"}
              >
                {isPlaying ? <Pause size={18} className="sm:w-[20px] sm:h-[20px]" /> : <Play size={18} className="sm:w-[20px] sm:h-[20px]" />}
              </button>

              {/* Rewind 10 Seconds */}
              <button
                type="button"
                onClick={() => seekRelative(-10)}
                className="p-1 sm:p-1.5 hover:text-[#009966] hover:scale-110 transition flex items-center gap-0.5 text-[10px] sm:text-xs font-bold"
                title="تأخير 10 ثوانٍ"
              >
                <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">10</span>
              </button>

              {/* Forward 10 Seconds */}
              <button
                type="button"
                onClick={() => seekRelative(10)}
                className="p-1 sm:p-1.5 hover:text-[#009966] hover:scale-110 transition flex items-center gap-0.5 text-[10px] sm:text-xs font-bold"
                title="تقديم 10 ثوانٍ"
              >
                <RotateCw size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">10</span>
              </button>

              {/* Time Display */}
              <div className="text-[10px] sm:text-xs text-gray-300 font-mono tracking-wider ml-1 hidden sm:block">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-gray-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls (Volume, Speed, Fullscreen) */}
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              {/* Volume & Mute */}
              <div className="hidden sm:flex items-center gap-1.5 group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 sm:p-1.5 hover:text-[#009966] transition"
                  title={isMuted ? "إلغاء الكتم (M)" : "كتم الصوت (M)"}
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} className="sm:w-[19px] sm:h-[19px]" /> : <Volume2 size={16} className="sm:w-[19px] sm:h-[19px]" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-12 sm:w-20 h-1 bg-white/30 accent-[#009966] rounded-lg cursor-pointer hidden md:block"
                  title="مستوى الصوت"
                />
              </div>

              {/* Speed Menu Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSpeedMenuOpen(!isSpeedMenuOpen);
                  }}
                  className="px-1.5 py-1 sm:px-2 sm:py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1"
                  title="سرعة التشغيل"
                >
                  <Settings size={12} className="sm:w-[14px] sm:h-[14px]" />
                  <span>{playbackSpeed}x</span>
                </button>

                {/* Speed Dropdown */}
                {isSpeedMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-10 right-0 w-24 sm:w-28 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl z-30 space-y-0.5"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSpeedSelect(s)}
                        className={`w-full text-left px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-between ${
                          playbackSpeed === s
                            ? "bg-[#1a5d1a] text-white"
                            : "text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <span>{s}x</span>
                        {playbackSpeed === s && <Check size={12} className="sm:w-[13px] sm:h-[13px]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1 sm:p-1.5 hover:text-[#009966] hover:scale-110 transition active:scale-95"
                title={isFullscreen ? "الخروج من الشاشة الكاملة (F)" : "شاشة كاملة (F)"}
              >
                {isFullscreen ? <Minimize size={16} className="sm:w-[19px] sm:h-[19px]" /> : <Maximize size={16} className="sm:w-[19px] sm:h-[19px]" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC FORENSIC WATERMARK (Permanent floating anti-piracy identity)
         ========================================================================= */}
      <VideoWatermark
        studentId={watermarkStudentId}
        studentName={watermarkStudentName}
      />
    </div>
  );
}
