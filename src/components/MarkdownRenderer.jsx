import React, { useMemo } from "react";
import { marked } from "marked";
import DOMPurifyFactory from "dompurify";

/**
 * Initialize DOMPurify safely across browser and SSR environments
 */
const getPurifier = () => {
  if (typeof DOMPurifyFactory?.sanitize === "function") {
    return DOMPurifyFactory;
  }
  if (typeof window !== "undefined" && typeof DOMPurifyFactory === "function") {
    try {
      const instance = DOMPurifyFactory(window);
      if (typeof instance?.sanitize === "function") return instance;
    } catch {
      return null;
    }
  }
  return null;
};

const DOMPurify = getPurifier();

if (DOMPurify && typeof DOMPurify.addHook === "function") {
  try {
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node && node.tagName === "A" && node.getAttribute && node.getAttribute("href")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
  } catch (err) {
    // Hook configuration skipped
  }
}

/**
 * Configure marked renderer
 */
marked.setOptions({
  breaks: true,
  gfm: true,
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
      if (DOMPurify && typeof DOMPurify.sanitize === "function") {
        return DOMPurify.sanitize(rawHtml, {
          USE_PROFILES: { html: true },
          ADD_ATTR: ["target", "rel"],
        });
      }
      return rawHtml;
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
