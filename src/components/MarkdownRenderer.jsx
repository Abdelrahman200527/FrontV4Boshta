import React, { useMemo } from "react";
import { marked } from "marked";

/**
 * Configure marked renderer
 */
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Basic sanitizer to strip unsafe HTML elements while allowing safe formatting
 */
function sanitizeHtml(html) {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * MarkdownRenderer component
 * Elegantly formats Arabic text, poetry verses, grammar explanations, bullet points, and tables.
 */
export default function MarkdownRenderer({ content, className = "" }) {
  const htmlContent = useMemo(() => {
    if (!content) return "";
    try {
      const rawHtml = marked.parse(content);
      return sanitizeHtml(rawHtml);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className={`ai-markdown-content leading-relaxed text-sm sm:text-[15px] space-y-2.5 ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
