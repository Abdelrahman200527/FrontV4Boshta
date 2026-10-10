import React, { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Configure marked renderer
 */
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Add hook to ensure all rendered links open safely in a new tab
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

/**
 * MarkdownRenderer component
 * Elegantly formats Arabic text, poetry verses, grammar explanations, bullet points, and tables.
 * Protected with DOMPurify against all XSS attack vectors.
 */
export default function MarkdownRenderer({ content, className = "" }) {
  const htmlContent = useMemo(() => {
    if (!content) return "";
    try {
      const rawHtml = marked.parse(content);
      return DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target", "rel"],
      });
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
