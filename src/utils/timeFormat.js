const ARABIC_PERIODS = {
  AM: "ص",
  PM: "م",
};

export function formatTime12(timeStr, options = {}) {
  if (!timeStr) return "-";

  const { showPeriod = true, showSeconds = false } = options;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (typeof timeStr === "string") {
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    } else {
      const date = new Date(timeStr);
      if (Number.isNaN(date.getTime())) return timeStr;
      hours = date.getHours();
      minutes = date.getMinutes();
      seconds = date.getSeconds();
    }
  } else if (timeStr instanceof Date) {
    if (Number.isNaN(timeStr.getTime())) return "-";
    hours = timeStr.getHours();
    minutes = timeStr.getMinutes();
    seconds = timeStr.getSeconds();
  } else {
    return "-";
  }

  const period = hours >= 12 ? ARABIC_PERIODS.PM : ARABIC_PERIODS.AM;

  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  const hh = String(displayHours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  let result = showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;

  if (showPeriod) {
    result += ` ${period}`;
  }

  return result;
}

export function formatDateTime12(dateStr, options = {}) {
  if (!dateStr) return "-";

  const { showSeconds = false, showPeriod = true } = options;

  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const time = formatTime12(date, { showSeconds, showPeriod });

  return `${day}/${month}/${year} - ${time}`;
}

export function to12Hour(hours24) {
  if (typeof hours24 !== "number" || hours24 < 0 || hours24 > 23) return null;

  const period = hours24 >= 12 ? "PM" : "AM";
  let h12 = hours24 % 12;
  if (h12 === 0) h12 = 12;

  return { hours: h12, period };
}

export function from12Hour(hours12, period) {
  if (typeof hours12 !== "number" || hours12 < 1 || hours12 > 12) return null;
  if (period !== "AM" && period !== "PM") return null;

  let h24 = hours12 % 12;
  if (period === "PM") h24 += 12;

  return h24;
}

export default formatTime12;