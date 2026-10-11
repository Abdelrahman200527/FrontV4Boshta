import { describe, it, expect } from 'vitest';

/**
 * Extracts and decodes filenames from Content-Disposition header.
 * Mirrors the production implementation in src/utils/fileHandler.js.
 */
function extractFilenameFromHeader(contentDisposition, fallback = "file") {
  if (!contentDisposition) return fallback;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  const regularMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  let extractedName = null;

  if (utf8Match && utf8Match[1]) {
    try {
      extractedName = decodeURIComponent(utf8Match[1].trim());
    } catch {
      extractedName = utf8Match[1].trim();
    }
  } else if (regularMatch && regularMatch[1]) {
    try {
      extractedName = decodeURIComponent(regularMatch[1].trim());
    } catch {
      extractedName = regularMatch[1].trim();
    }
  }

  if (extractedName) {
    return extractedName.replace(/[/\\]/g, "").replace(/^(\.\.)+/, "").replace(/["']/g, "").trim() || fallback;
  }
  return fallback;
}

describe('File Handler Content-Disposition Arabic Filename Decoding', () => {
  it('correctly decodes UTF-8 percent-encoded filename* from backend', () => {
    // Backend standard: `attachment; filename="%D9%83%D8%B4%D9%81_%D8%A7%D9%84%D8%B7%D9%84%D8%A7%D8%A8.xlsx"; filename*=UTF-8''%D9%83%D8%B4%D9%81_%D8%A7%D9%84%D8%B7%D9%84%D8%A7%D8%A8.xlsx`
    const header = "attachment; filename=\"%D9%83%D8%B4%D9%81_%D8%A7%D9%84%D8%B7%D9%84%D8%A7%D8%A8.xlsx\"; filename*=UTF-8''%D9%83%D8%B4%D9%81_%D8%A7%D9%84%D8%B7%D9%84%D8%A7%D8%A8.xlsx";
    const filename = extractFilenameFromHeader(header);
    expect(filename).toBe("كشف_الطلاب.xlsx");
  });

  it('correctly decodes passwords report filename in Arabic', () => {
    const header = "attachment; filename=\"%D9%83%D8%B4%D9%81_%D9%83%D9%84%D9%85%D8%A7%D8%AA_%D9%85%D8%B1%D9%88%D8%B1_%D8%AC%D9%85%D9%8A%D8%B9_%D8%A7%D9%84%D8%B7%D9%84%D8%A7%D8%A8.xlsx\"; filename*=UTF-8''%D9%83%D8%B4%D9%81_%D9%83%D9%84%D9%85%D8%A7%D8%AA_%D9%85%D8%B1%D9%88%D8%B1_%D8%AC%D9%85%D9%8A%D8%B9_%D8%A7%D9%84%D8%B7%D9%84%D8%A7%D8%A8.xlsx";
    const filename = extractFilenameFromHeader(header);
    expect(filename).toBe("كشف_كلمات_مرور_جميع_الطلاب.xlsx");
  });

  it('handles standard plain ASCII filenames', () => {
    const header = 'attachment; filename="students_template.xlsx"';
    const filename = extractFilenameFromHeader(header);
    expect(filename).toBe("students_template.xlsx");
  });

  it('sanitizes directory traversal characters from malicious server headers', () => {
    const header = 'attachment; filename="../../../etc/passwd.xlsx"';
    const filename = extractFilenameFromHeader(header);
    expect(filename).not.toContain("../");
    expect(filename).not.toContain("/");
  });

  it('falls back to default filename when header is missing', () => {
    expect(extractFilenameFromHeader(null, "default.xlsx")).toBe("default.xlsx");
  });
});
