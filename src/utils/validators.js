/**
 * Standard validation helpers for client-side forms and security checks
 */

/**
 * Normalizes phone number by trimming whitespace and converting Arabic/Indic numerals to standard digits
 */
export const normalizePhone = (phone) => {
  if (!phone || typeof phone !== "string") return "";
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const easternArabicNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  
  let cleaned = phone.trim().replace(/\s+/g, "");
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replaceAll(arabicNumbers[i], i.toString()).replaceAll(easternArabicNumbers[i], i.toString());
  }
  return cleaned;
};

/**
 * Validates Egyptian phone numbers (11 digits starting with 010, 011, 012, or 015)
 */
export const isValidEgyptianPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  const cleanPhone = normalizePhone(phone);
  return /^01[0125][0-9]{8}$/.test(cleanPhone);
};

/**
 * Validates file upload type and size
 * @param {File} file
 * @param {Object} options
 * @param {string[]} [options.allowedExtensions] - e.g. ['.xlsx', '.xls'] or ['.pdf', '.jpg', '.png']
 * @param {number} [options.maxSizeMB] - maximum size in megabytes (default 15MB)
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateFileUpload = (file, { allowedExtensions = [], maxSizeMB = 15 } = {}) => {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: "لم يتم اختيار أي ملف" };
  }

  // Size check
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `حجم الملف يتجاوز الحد المسموح به (${maxSizeMB} ميجابايت)`,
    };
  }

  // Extension check
  if (allowedExtensions.length > 0) {
    const fileName = file.name || "";
    const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    const hasValidExt = allowedExtensions.some((allowed) => {
      const cleanAllowed = allowed.toLowerCase().replace(/^\./, "");
      return ext === cleanAllowed;
    });

    if (!hasValidExt) {
      return {
        valid: false,
        error: `نوع الملف غير مسموح. الصيغ المدعومة: ${allowedExtensions.join(", ")}`,
      };
    }
  }

  return { valid: true };
};

/**
 * Validates positive financial amounts
 */
export const isValidAmount = (amount) => {
  if (amount === null || amount === undefined || amount === "") return false;
  const num = Number(amount);
  return !isNaN(num) && isFinite(num) && num > 0;
};
