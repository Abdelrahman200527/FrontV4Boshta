/**
 * Safe video URL extractor and embed sanitizer
 * Protects against untrusted iframe injection, javascript: URLs, and open embeds
 */

export const getSafeEmbedUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const url = rawUrl.trim();
  if (!url || /^javascript:/i.test(url) || /^data:/i.test(url) || /^vbscript:/i.test(url)) {
    return null;
  }

  // YouTube match: regular watch, youtu.be, shorts, or existing embed
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Google Drive match
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  return null;
};

export const isValidVideoUrl = (rawUrl) => {
  return !!getSafeEmbedUrl(rawUrl);
};
