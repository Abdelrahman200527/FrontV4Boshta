const parseBackendDate = (dateStr) => {
  if (!dateStr) return null;

  // لو التاريخ فيه Z أو + أو - (timezone محدد)
  if (dateStr.includes("Z") || dateStr.includes("+") || dateStr.includes("-")) {
    return new Date(dateStr);
  }

  // ✅ لو التاريخ بدون timezone - أضف Z (UTC)
  // لأن الـ backend بيبعت UTC
  return new Date(dateStr + "Z");
};

const isDeadlineExpired = (deadlineStr) => {
  const deadline = parseBackendDate(deadlineStr);
  if (!deadline) return false;

  const now = new Date();
  return deadline.getTime() < now.getTime();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  const date = parseBackendDate(dateStr);
  if (!date) return "-";

  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export { parseBackendDate, isDeadlineExpired, formatDate };
