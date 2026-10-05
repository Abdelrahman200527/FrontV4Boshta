import React, { useState, useEffect } from "react";
import getUser from "../utils/getUser";
import { isDemoMode } from "../utils/demo";

/**
 * Dynamic Forensic Watermark Component
 * Displays the student's first two names and barcode clearly over the video player.
 * Sits quietly in position without floating across the screen.
 * Periodically fades out, teleports to a new random location, and fades back in.
 * Fully responsive across all devices and screen sizes.
 */
export default function VideoWatermark({
  studentBarcode: propBarcode,
  studentId: propId,
  barcode: altBarcode,
  studentName: propName,
  name: altName,
  opacity = 0.45, // Soft translucent red ("أحمر خفيف")
  intervalSeconds = 8,
  className = "",
}) {
  const [position, setPosition] = useState({ x: 18, y: 22 });
  const [isVisible, setIsVisible] = useState(true);

  // Resolve Student Info from Props, Auth Cookie, or Demo Storage
  const user = getUser();
  const isDemo = isDemoMode();

  const rawBarcode =
    propBarcode ||
    propId ||
    altBarcode ||
    user?.barcode ||
    user?.student_barcode ||
    user?.id ||
    user?.student_id ||
    (isDemo ? "STU-88214" : "1042");

  const rawName =
    propName ||
    altName ||
    user?.full_name ||
    user?.name ||
    user?.student_name ||
    (isDemo ? "أحمد محمد محمود" : "طالب المنصة");

  // Extract only the first two names per user request
  const firstTwoNames = rawName
    ? rawName.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(" ")
    : "طالب";

  // Spread across all areas of the video (top, bottom, center, corners)
  const getRandomCoords = () => {
    // X between 4% and 68% so text fits comfortably across all devices
    const x = Math.floor(Math.random() * 64) + 4;
    // Y between 5% and 86% spanning all vertical heights
    const y = Math.floor(Math.random() * 81) + 5;
    return { x, y };
  };

  useEffect(() => {
    const cycle = () => {
      // 1. Gentle fade out in place
      setIsVisible(false);

      // 2. Teleport to a new random position across any part of the video
      setTimeout(() => {
        setPosition(getRandomCoords());
        // 3. Gentle fade back in
        setIsVisible(true);
      }, 400);
    };

    const interval = setInterval(cycle, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [intervalSeconds]);

  if (!rawBarcode && !firstTwoNames) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-25 ${className}`}
      dir="rtl"
    >
      <div
        className="absolute transition-opacity duration-400 ease-in-out pointer-events-none select-none max-w-max whitespace-nowrap"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          opacity: isVisible ? opacity : 0,
        }}
      >
        {/* Plain light-red text without any card or background */}
        <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs sm:text-sm md:text-base tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
          {/* First Two Names */}
          <span>
            {firstTwoNames}
          </span>

          {/* Dot Separator */}
          <span className="font-extrabold">
            •
          </span>

          {/* Student Barcode */}
          <span
            className="font-mono tracking-wider"
            dir="ltr"
          >
            {rawBarcode}
          </span>
        </div>
      </div>
    </div>
  );
}
