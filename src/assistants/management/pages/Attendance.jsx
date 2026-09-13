/* eslint-disable no-unused-vars */
/* src/assistants/management/pages/Attendance.jsx */

import {
  CalendarCheck,
  Search,
  ScanLine,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  BarChart3,
  Play,
  Square,
  RefreshCw,
  CalendarDays,
  ClipboardList,
  Trash2,
  Pencil,
  Info,
  TrendingUp,
  AlertTriangle,
  X,
  Clock,
  Volume2,
  Loader2,
  Wallet,
} from "lucide-react";
import { memo, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useApiList, useInvalidate } from "../../../hooks/useApiQuery";
import { qk } from "../../../api/queryKeys";
import {
  notifyError,
  notifySuccess,
  notifyInfo,
  confirmToast,
} from "../../../lib/notify";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../../../components/Pagination";
import {
  fetchAllGroups,
  fetchAllGrades,
  fetchAllStudents,
  fetchActiveSession,
  startAttendanceSession,
  scanStudentBarcode,
  lockAttendanceSession,
  toggleMakeupMode,
  createNewAttendance,
  markRestAsAbsent,
  fetchAttendanceById,
  updateAttendanceInfo,
  removeAttendance,
  fetchAttendanceDashboard,
  fetchAttendanceOverview,
  fetchGradeAttendance,
  fetchGroupAttendanceByDate,
  fetchGroupAttendanceByMonth,
  fetchAttendanceSummary,
  createNewPayment,
  createNewSubscription,
} from "../../../api/assistant/actions";

/* ============================ Constants ============================ */

const PAGE_SIZE = 20;
const SCANNER_TIMEOUT = 100;
const MIN_BARCODE_LENGTH = 3;
const DOUBLE_SUBMIT_GUARD = 500;
const FOCUS_RESTORE_DELAY = 200;

/* ============================ Helpers ============================ */

function toLocalDate(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA");
}

function toLocalMonth(value = new Date()) {
  return toLocalDate(value).slice(0, 7);
}

function shortTime(t) {
  if (!t) return "-";
  return String(t).slice(0, 5);
}

function formatTimeLabel(t) {
  const s = shortTime(t);
  if (s === "-") return "-";
  const d = new Date(`1970-01-01T${s}:00`);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nowTimeValue() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

function formatDuration(seconds) {
  if (seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0",
    )}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const num = (v) => Number(v ?? 0) || 0;

/* ============================ Sound Feedback ============================ */

function playBeep(type = "success") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.frequency.value = 1200;
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "error") {
      osc.frequency.value = 400;
      gain.gain.value = 0.2;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }

    setTimeout(() => ctx.close(), 500);
  } catch (err) {
    // silently ignore
  }
}

/* ============================ Payment Modal ============================ */

const PaymentModal = ({ isOpen, onClose, student, onSubmit, isSubmitting }) => {
  if (!isOpen || !student) return null;

  return (
    <PaymentModalContent
      key={`${student.id}-${isOpen ? "open" : "closed"}`}
      onClose={onClose}
      student={student}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

const PaymentModalContent = ({ onClose, student, onSubmit, isSubmitting }) => {
  const [paymentMode, setPaymentMode] = useState("normal");
  const [customAmount, setCustomAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const requiredAmount = Number(student?.required_amount || 0);

  const finalAmount =
    paymentMode === "custom" ? Number(customAmount) || 0 : requiredAmount;

  const canSubmit =
    paymentMode === "normal" ? requiredAmount > 0 : Number(customAmount) > 0;

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) return;
    onSubmit({
      payment_mode: paymentMode,
      amount: finalAmount,
      payment_date: paymentDate,
      notes: notes.trim() || null,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-primary to-primary/80 px-5 py-4 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Wallet size={20} />
              تسجيل دفعة
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white disabled:opacity-40 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body - scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {/* Student Info */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 border border-gray-100">
              <p className="text-sm text-gray-700">
                الطالب: <b className="text-gray-900">{student.full_name}</b>
              </p>
              <p className="text-xs text-gray-500">
                {student.grade_name}
                {student.group_name && ` • ${student.group_name}`}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {student.barcode}
              </p>
            </div>

            {/* Required Amount */}
            <div className="rounded-xl bg-linear-to-r from-blue-50 to-blue-50/60 border border-blue-100 p-3.5 flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">
                المبلغ المطلوب
              </span>
              <span className="text-xl font-bold text-primary">
                {requiredAmount.toLocaleString("ar-EG")}{" "}
                <span className="text-sm font-medium">جنيه</span>
              </span>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الدفع
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode("normal")}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    paymentMode === "normal"
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  عادي
                  <span className="block text-[10px] opacity-80 mt-0.5">
                    كامل المبلغ
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("custom")}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    paymentMode === "custom"
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  مخصص
                  <span className="block text-[10px] opacity-80 mt-0.5">
                    مبلغ مختلف
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Amount */}
            <AnimatePresence>
              {paymentMode === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    المبلغ المخصص (جنيه)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="أدخل المبلغ"
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-lg font-mono"
                    dir="ltr"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                تاريخ الدفع
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ملاحظات (اختياري)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية..."
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Final Amount */}
            <div
              className={`rounded-xl p-3.5 flex items-center justify-between border ${
                paymentMode === "custom"
                  ? "bg-linear-to-r from-amber-50 to-amber-50/60 border-amber-200"
                  : "bg-linear-to-r from-green-50 to-green-50/60 border-green-200"
              }`}
            >
              <span className="text-sm font-medium text-gray-700">
                المبلغ النهائي
              </span>
              <span
                className={`text-2xl font-bold ${
                  paymentMode === "custom" ? "text-amber-700" : "text-green-700"
                }`}
              >
                {finalAmount.toLocaleString("ar-EG")}{" "}
                <span className="text-sm">جنيه</span>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-3 p-4 border-t border-gray-100 bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 transition-all"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Wallet size={16} />
                  تسجيل الدفع
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ============================ Student Card (Mobile) ============================ */

const StudentCard = memo(function StudentCard({
  student,
  index,
  record,
  canEdit,
  isLoading,
  onMarkPresent,
  onMarkAbsent,
  onDetails,
  onDelete,
  onPay,
}) {
  const isPresent = record?.status === "present";
  const isAbsent = record?.status === "absent";
  const statusLabel = record ? (isPresent ? "حاضر" : "غائب") : "غير مسجل";

  const isPaid = student?.payment_status === "paid";

  const methodBadge =
    record?.method === "barcode" ? (
      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
        باركود
      </span>
    ) : record?.method === "manual" ? (
      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
        يدوي
      </span>
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 space-y-3"
    >
      {/* Header: Name + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-800 truncate">
              {student.full_name}
            </p>
            {record?.is_makeup === 1 && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                تعويضي
              </span>
            )}
            {methodBadge}
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            {student.barcode}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
            isPresent
              ? "bg-green-100 text-green-700"
              : isAbsent
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {isPresent && <CheckCircle size={12} />}
          {isAbsent && <XCircle size={12} />}
          {!record && <AlertCircle size={12} />}
          {statusLabel}
        </span>
      </div>

      {/* Payment + Time */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isPaid ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {isPaid ? "مدفوع" : "غير مدفوع"}
          </span>
          {!isPaid && (
            <button
              type="button"
              onClick={() => onPay(student)}
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs text-white font-medium hover:bg-emerald-600 transition-all shadow-sm"
            >
              <Wallet size={12} />
              دفع
            </button>
          )}
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={12} />
          {formatTimeLabel(record?.attendance_time)}
        </span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onMarkPresent(student)}
          disabled={!canEdit || isPresent || isLoading}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs text-white font-medium hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none transition-all"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <UserCheck size={14} />
          )}
          حضور
        </button>
        <button
          type="button"
          onClick={() => onMarkAbsent(student)}
          disabled={!canEdit || isAbsent || isLoading}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500 px-3 py-2.5 text-xs text-white font-medium hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300 transition-all"
        >
          <UserX size={14} />
          غياب
        </button>
        <button
          type="button"
          onClick={() => onDetails(record)}
          disabled={!record}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all px-3 py-2 text-xs"
        >
          <Info size={14} />
          تفاصيل
        </button>
        <button
          type="button"
          onClick={() => onDelete(record, student)}
          disabled={!record || isLoading}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all px-3 py-2 text-xs"
        >
          <Trash2 size={14} />
          حذف
        </button>
      </div>
    </motion.div>
  );
});

/* ============================ Attendance Row (Desktop) ============================ */

const AttendanceRow = memo(function AttendanceRow({
  student,
  index,
  record,
  canEdit,
  isLoading,
  onMarkPresent,
  onMarkAbsent,
  onDetails,
  onDelete,
  onPay,
}) {
  const isPresent = record?.status === "present";
  const isAbsent = record?.status === "absent";
  const statusLabel = record ? (isPresent ? "حاضر" : "غائب") : "غير مسجل";

  const isPaid = student?.payment_status === "paid";

  const methodBadge =
    record?.method === "barcode" ? (
      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
        باركود
      </span>
    ) : record?.method === "manual" ? (
      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
        يدوي
      </span>
    ) : null;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="hover:bg-blue-50/40 transition-all duration-200"
    >
      <td className="px-3 sm:px-5 py-3 font-medium text-gray-800 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span>{student.full_name}</span>
          {record?.is_makeup === 1 && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
              تعويضي
            </span>
          )}
          {methodBadge}
        </div>
      </td>
      <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm font-mono text-gray-500">
        {student.barcode}
      </td>
      <td className="px-3 sm:px-5 py-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isPresent
              ? "bg-green-100 text-green-700"
              : isAbsent
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {isPresent && <CheckCircle size={12} />}
          {isAbsent && <XCircle size={12} />}
          {!record && <AlertCircle size={12} />}
          {statusLabel}
        </span>
      </td>
      <td className="px-3 sm:px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isPaid ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {isPaid ? "مدفوع" : "غير مدفوع"}
          </span>
          {!isPaid && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => onPay(student)}
              title="تسجيل دفعة"
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1.5 text-xs text-white font-medium hover:bg-emerald-600 transition-all shadow-sm"
            >
              <Wallet size={12} />
              دفع
            </motion.button>
          )}
        </div>
      </td>
      <td className="px-3 sm:px-5 py-3 text-xs sm:text-sm text-gray-500">
        {formatTimeLabel(record?.attendance_time)}
      </td>
      <td className="px-3 sm:px-5 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onMarkPresent(student)}
            disabled={!canEdit || isPresent || isLoading}
            title="تسجيل حضور"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-2.5 sm:px-3 py-2 text-xs text-white font-medium hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none transition-all"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UserCheck size={14} />
            )}
            حضور
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onMarkAbsent(student)}
            disabled={!canEdit || isAbsent || isLoading}
            title="تسجيل غياب"
            className="flex items-center gap-1.5 rounded-xl bg-red-500 px-2.5 sm:px-3 py-2 text-xs text-white font-medium hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300 transition-all"
          >
            <UserX size={14} />
            غياب
          </motion.button>
          <button
            type="button"
            onClick={() => onDetails(record)}
            disabled={!record}
            title="تفاصيل السجل"
            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Info size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(record, student)}
            disabled={!record || isLoading}
            title="حذف السجل"
            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
});

/* ============================ Stats Table ============================ */

const StatsTable = ({ rows }) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <p className="text-center text-gray-400 py-10 text-sm">لا توجد بيانات</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right min-w-150">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {["الشهر", "أيام", "سجلات", "حاضر", "غائب", "النسبة"].map((h) => (
              <th
                key={h}
                className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr
              key={r.month || i}
              className="hover:bg-blue-50/40 text-xs sm:text-sm"
            >
              <td className="px-3 sm:px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                {r.month}
              </td>
              <td className="px-3 sm:px-4 py-3 text-gray-600">
                {num(r.total_days)}
              </td>
              <td className="px-3 sm:px-4 py-3 text-gray-600">
                {num(r.total_records)}
              </td>
              <td className="px-3 sm:px-4 py-3 text-green-600 font-medium">
                {num(r.present_count)}
              </td>
              <td className="px-3 sm:px-4 py-3 text-red-600 font-medium">
                {num(r.absent_count)}
              </td>
              <td className="px-3 sm:px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <span className="w-16 sm:w-20 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <span
                      className="block h-full bg-linear-to-r from-primary to-primary/80 transition-all"
                      style={{
                        width: `${Math.min(
                          num(r.attendance_percentage),
                          100,
                        )}%`,
                      }}
                    />
                  </span>
                  <b className="text-gray-700">
                    {num(r.attendance_percentage)}%
                  </b>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ============================ Main Page ============================ */

const Attendance = () => {
  const invalidate = useInvalidate();

  /* ---------- Master Data ---------- */
  const gradesQuery = useApiList(qk.grades.all, fetchAllGrades, {
    select: (data) =>
      (Array.isArray(data) ? data : []).filter(
        (g) => g?.name && g.name.trim() !== "",
      ),
    showErrorToast: false,
  });
  const groupsQuery = useApiList(qk.groups.all, fetchAllGroups, {
    select: (data) =>
      (Array.isArray(data) ? data : []).filter(
        (g) => g?.deleted === 0 || g?.deleted === undefined,
      ),
    showErrorToast: false,
  });

  const grades = useMemo(() => gradesQuery.data ?? [], [gradesQuery.data]);
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  /* ---------- Selections ---------- */
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState(toLocalDate());
  const [selectedMonth, setSelectedMonth] = useState(toLocalMonth());

  /* ---------- Pagination ---------- */
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  /* ---------- Session State ---------- */
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionLocked, setSessionLocked] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isMakeupEnabled, setIsMakeupEnabled] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  /* ---------- Students & Attendance ---------- */
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [serverSummary, setServerSummary] = useState(null);
  const [rowLoading, setRowLoading] = useState({});

  /* ---------- Month ---------- */
  const [monthRecords, setMonthRecords] = useState([]);
  const [monthLoading, setMonthLoading] = useState(false);

  /* ---------- Barcode ---------- */
  const [barcode, setBarcode] = useState("");
  const [lastScan, setLastScan] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  const barcodeInputRef = useRef(null);
  const lastSubmitTimeRef = useRef(0);
  const savingRef = useRef(false);

  /* ---------- Payment Modal ---------- */
  const [paymentStudent, setPaymentStudent] = useState(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  /* ---------- Search ---------- */
  const [search, setSearch] = useState("");

  /* ---------- Tabs ---------- */
  const [activeTab, setActiveTab] = useState("day");

  /* ---------- Stats ---------- */
  const [dashboard, setDashboard] = useState(null);
  const [overview, setOverview] = useState({
    overall: [],
    consecutiveAbsences: [],
  });
  const [gradeStats, setGradeStats] = useState([]);

  /* ---------- Details Modal ---------- */
  const [detailsRecord, setDetailsRecord] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const isToday = selectedDate === toLocalDate();
  const canEdit = sessionActive || !isToday;

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  /* ============================ Load Dashboard ============================ */

  const loadDashboard = useCallback(async () => {
    const [dash, over] = await Promise.all([
      fetchAttendanceDashboard(),
      fetchAttendanceOverview(),
    ]);

    if (dash.success) setDashboard(dash.data || null);
    if (over.success) {
      setOverview({
        overall: Array.isArray(over.data?.overall) ? over.data.overall : [],
        consecutiveAbsences: Array.isArray(over.data?.consecutiveAbsences)
          ? over.data.consecutiveAbsences
          : [],
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadDashboard();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDashboard]);

  /* ============================ Load Grade Stats ============================ */

  useEffect(() => {
    if (!selectedGrade) return;
    let cancelled = false;
    (async () => {
      const res = await fetchGradeAttendance(selectedGrade);
      if (!cancelled) {
        setGradeStats(res.success && Array.isArray(res.data) ? res.data : []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGrade]);

  /* ============================ Session Management ============================ */

  const checkActiveSession = useCallback(async (groupId) => {
    if (!groupId) return;
    try {
      const result = await fetchActiveSession(groupId);
      if (result.success && result.data) {
        const s = result.data;
        setSessionInfo(s);
        setSessionId(s.id);
        setIsMakeupEnabled(s.is_makeup_enabled === 1);
        setSessionLocked(s.status === "locked");
        setSessionActive(s.status === "active");
      } else {
        setSessionInfo(null);
        setSessionActive(false);
        setSessionId(null);
        setSessionLocked(false);
        setIsMakeupEnabled(false);
      }
    } catch (error) {
      setSessionActive(false);
    }
  }, []);

  /* ============================ Load Group Students ============================ */

  const loadGroupStudents = useCallback(
    async (groupId, date, currentPage) => {
      if (!groupId) return;

      setLoading(true);
      try {
        const [studentsResult, attendanceResult, summaryResult] =
          await Promise.all([
            fetchAllStudents(currentPage, "", selectedGrade || "", groupId),
            fetchGroupAttendanceByDate(groupId, date),
            fetchAttendanceSummary(groupId, date),
          ]);

        if (studentsResult.success && Array.isArray(studentsResult.data)) {
          const sorted = [...studentsResult.data].sort((a, b) =>
            String(a.full_name || "").localeCompare(
              String(b.full_name || ""),
              "ar",
            ),
          );
          setStudents(sorted);
        } else {
          setStudents([]);
        }

        if (studentsResult.pagination) {
          setPagination(studentsResult.pagination);
        } else {
          setPagination({
            page: currentPage,
            limit: PAGE_SIZE,
            total: studentsResult.data?.length || 0,
            totalPages: 1,
          });
        }

        if (attendanceResult.success && Array.isArray(attendanceResult.data)) {
          const records = {};
          attendanceResult.data.forEach((r) => {
            records[r.student_id] = r;
          });
          setAttendanceRecords(records);
        } else {
          setAttendanceRecords({});
        }

        setServerSummary(
          summaryResult.success ? summaryResult.data || null : null,
        );
      } catch (error) {
        notifyError("حدث خطأ في تحميل الطلاب");
      } finally {
        setLoading(false);
      }
    },
    [selectedGrade],
  );

  /* ============================ Group Change ============================ */

  useEffect(() => {
    if (!selectedGroup) {
      const timer = setTimeout(() => {
        setStudents([]);
        setAttendanceRecords({});
        setServerSummary(null);
        setSessionActive(false);
        setSessionId(null);
        setSessionInfo(null);
        setSessionLocked(false);
        setIsMakeupEnabled(false);
        setLockRemaining(0);
        setMonthRecords([]);
        setPage(1);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (page !== 1) {
      const timer = setTimeout(() => setPage(1), 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      void checkActiveSession(selectedGroup);
      void loadGroupStudents(selectedGroup, selectedDate, 1);
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, checkActiveSession]);

  /* ============================ Date Change ============================ */

  useEffect(() => {
    if (!selectedGroup) return;
    if (page !== 1) {
      const timer = setTimeout(() => setPage(1), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      void loadGroupStudents(selectedGroup, selectedDate, 1);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  /* ============================ Grade Change ============================ */

  useEffect(() => {
    if (!selectedGroup) return;
    if (page !== 1) {
      const timer = setTimeout(() => setPage(1), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      void loadGroupStudents(selectedGroup, selectedDate, 1);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  /* ============================ Page Change ============================ */

  useEffect(() => {
    if (!selectedGroup || page === 1) return;
    const timer = setTimeout(() => {
      void loadGroupStudents(selectedGroup, selectedDate, page);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /* ============================ Load Month ============================ */

  const loadMonth = useCallback(async () => {
    if (!selectedGroup) return;
    setMonthLoading(true);
    try {
      const res = await fetchGroupAttendanceByMonth(
        selectedGroup,
        selectedMonth,
      );
      setMonthRecords(res.success && Array.isArray(res.data) ? res.data : []);
    } finally {
      setMonthLoading(false);
    }
  }, [selectedGroup, selectedMonth]);

  useEffect(() => {
    if (activeTab !== "month") return;
    const timer = setTimeout(() => {
      void loadMonth();
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab, loadMonth]);

  /* ============================ Lock Countdown ============================ */

  useEffect(() => {
    if (!sessionActive || !sessionInfo?.lock_at) {
      const resetTimer = window.requestAnimationFrame(() => {
        setLockRemaining(0);
      });
      return () => window.cancelAnimationFrame(resetTimer);
    }

    const updateTimer = () => {
      const now = Date.now();
      const lockTime = new Date(sessionInfo.lock_at).getTime();
      const diff = Math.max(0, Math.floor((lockTime - now) / 1000));
      setLockRemaining(diff);
      if (diff === 0 && sessionActive) {
        checkActiveSession(selectedGroup);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive, sessionInfo?.lock_at, selectedGroup]);

  /* ============================ Auto-Refresh ============================ */

  useEffect(() => {
    if (!sessionActive || !selectedGroup) return;

    const interval = setInterval(async () => {
      const result = await fetchActiveSession(selectedGroup);
      if (result.success && result.data) {
        const s = result.data;
        if (s.attendance_locked === 1 && !sessionLocked) {
          setSessionInfo(s);
          setSessionLocked(s.status === "locked");
          setSessionActive(s.status === "active");
          setSessionLocked(s.attendance_locked === 1);
          await loadGroupStudents(selectedGroup, selectedDate, page);
          await loadDashboard();
          notifyInfo("تم قفل تسجيل الحضور تلقائياً");
        }
      }
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive, selectedGroup, sessionLocked, page]);

  /* ============================ Global Scanner Listener ============================ */

  useEffect(() => {
    if (!sessionActive) return;

    let buffer = "";
    let lastKeyTime = 0;

    const handleGlobalKeyDown = (e) => {
      if (document.activeElement === barcodeInputRef.current) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const tag = document.activeElement?.tagName;
      const isOtherInput =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      const now = Date.now();
      if (now - lastKeyTime > SCANNER_TIMEOUT) {
        buffer = "";
      }
      lastKeyTime = now;

      if (e.key === "Enter") {
        if (
          buffer.length >= MIN_BARCODE_LENGTH &&
          !isOtherInput &&
          !savingRef.current
        ) {
          e.preventDefault();
          const code = buffer.trim();
          buffer = "";

          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value",
            ).set;
            nativeInputValueSetter.call(barcodeInputRef.current, code);
            barcodeInputRef.current.dispatchEvent(
              new Event("input", { bubbles: true }),
            );
            const form = barcodeInputRef.current.closest("form");
            if (form) {
              form.requestSubmit();
            }
          }
        }
        buffer = "";
        return;
      }

      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [sessionActive]);

  /* ============================ Smart Auto-Focus ============================ */

  useEffect(() => {
    if (!sessionActive) return;

    const handleClick = (e) => {
      const target = e.target;
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        tag === "BUTTON" ||
        tag === "A" ||
        target.isContentEditable
      ) {
        return;
      }

      if (barcodeInputRef.current && !saving) {
        barcodeInputRef.current.focus();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [sessionActive, saving]);

  /* ============================ Scanner Ready Indicator ============================ */

  useEffect(() => {
    const input = barcodeInputRef.current;
    if (!input) return;

    const handleFocus = () => setScannerReady(true);
    const handleBlur = () => setScannerReady(false);

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);

    if (document.activeElement === input) {
      setScannerReady(true);
    }

    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
    };
  }, []);

  /* ============================ Continuous Focus Keeper ============================ */

  useEffect(() => {
    if (!sessionActive || saving) return;

    const focusInput = () => {
      if (
        barcodeInputRef.current &&
        document.activeElement !== barcodeInputRef.current
      ) {
        const tag = document.activeElement?.tagName;
        const isOtherInput =
          tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        if (!isOtherInput) {
          barcodeInputRef.current.focus();
        }
      }
    };

    const timer = setTimeout(focusInput, 150);
    return () => clearTimeout(timer);
  }, [sessionActive, saving, lastScan]);

  /* ============================ Payment Handlers ============================ */

  const handlePayClick = useCallback((student) => {
    setPaymentStudent(student);
  }, []);

  const handlePaymentClose = useCallback(() => {
    if (paymentSubmitting) return;
    setPaymentStudent(null);
  }, [paymentSubmitting]);

  const handlePaymentSubmit = useCallback(
    async ({ payment_mode, amount, payment_date, notes }) => {
      if (!paymentStudent || !selectedGroup) return;

      setPaymentSubmitting(true);
      try {
        let subscriptionId = paymentStudent.subscription_id;

        if (!subscriptionId) {
          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
          ).padStart(2, "0")}`;

          const subResult = await createNewSubscription({
            student_id: paymentStudent.id,
            month: currentMonth,
          });

          if (!subResult.success || !subResult.data?.id) {
            notifyError(subResult.error || "فشل إنشاء الاشتراك الشهري");
            return;
          }

          subscriptionId = subResult.data.id;
        }

        const paymentPayload = {
          subscription_id: subscriptionId,
          student_id: paymentStudent.id,
          payment_mode,
          payment_date: new Date(payment_date).toISOString(),
          notes,
        };

        if (payment_mode === "custom") {
          paymentPayload.amount = Number(amount);
        }

        const payResult = await createNewPayment(paymentPayload);

        if (payResult.success) {
          notifySuccess(
            `تم تسجيل دفعة ${Number(amount).toLocaleString(
              "ar-EG",
            )} جنيه للطالب ${paymentStudent.full_name}`,
          );
          setPaymentStudent(null);
          await loadGroupStudents(selectedGroup, selectedDate, page);
          if (sessionActive) {
            setTimeout(() => {
              barcodeInputRef.current?.focus();
            }, FOCUS_RESTORE_DELAY);
          }
        } else {
          notifyError(payResult.error || "فشل تسجيل الدفعة");
        }
      } catch (error) {
        console.error("Payment error:", error);
        notifyError("حدث خطأ في تسجيل الدفعة");
      } finally {
        setPaymentSubmitting(false);
      }
    },
    [
      paymentStudent,
      selectedGroup,
      selectedDate,
      page,
      sessionActive,
      loadGroupStudents,
    ],
  );

  /* ============================ Start Session ============================ */

  async function handleStartSession() {
    if (!selectedGroup || !selectedGrade) {
      notifyError("يرجى اختيار المرحلة والمجموعة أولاً");
      return;
    }
    if (!isToday) {
      notifyError("لا يمكن بدء جلسة في يوم غير اليوم الحالي");
      return;
    }

    setSaving(true);
    try {
      const result = await startAttendanceSession({
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade),
      });

      if (result.success) {
        setSessionInfo(result.data);
        setSessionActive(true);
        setSessionLocked(false);
        setSessionId(result.data.id);
        setIsMakeupEnabled(result.data.is_makeup_enabled === 1);
        notifySuccess("تم بدء الجلسة بنجاح");
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, FOCUS_RESTORE_DELAY);
      } else {
        notifyError(result.error || "حدث خطأ في بدء الجلسة");
      }
    } catch (error) {
      notifyError("حدث خطأ في بدء الجلسة");
    } finally {
      setSaving(false);
    }
  }

  /* ============================ End Session ============================ */

  async function handleEndSession() {
    if (!sessionId || !selectedGroup) {
      notifyError("لا توجد جلسة نشطة");
      return;
    }

    confirmToast(
      "هل أنت متأكد من إنهاء الجلسة؟ سيتم تسجيل الطلاب غير المسجلين كغائبين",
      async () => {
        setSaving(true);
        try {
          const result = await lockAttendanceSession(
            sessionId,
            Number(selectedGroup),
          );
          if (result.success) {
            setSessionActive(false);
            setSessionLocked(true);
            notifySuccess("تم إنهاء الجلسة وتسجيل الغائبين");
            await loadGroupStudents(selectedGroup, selectedDate, page);
            await loadDashboard();
          } else {
            notifyError(result.error || "حدث خطأ في إنهاء الجلسة");
          }
        } catch (error) {
          notifyError("حدث خطأ في إنهاء الجلسة");
        } finally {
          setSaving(false);
        }
      },
      "إنهاء",
    );
  }

  /* ============================ Toggle Makeup ============================ */

  async function handleToggleMakeup() {
    if (!sessionId) return;
    setSaving(true);
    try {
      const result = await toggleMakeupMode(sessionId);
      if (result.success) {
        const enabled = result.data?.is_makeup_enabled === 1;
        setIsMakeupEnabled(enabled);
        notifySuccess(`تم ${enabled ? "تفعيل" : "إلغاء"} الحضور التعويضي`);
      } else {
        notifyError(result.error || "حدث خطأ");
      }
    } catch (error) {
      notifyError("حدث خطأ في تبديل الوضع التعويضي");
    } finally {
      setSaving(false);
      if (sessionActive) {
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, FOCUS_RESTORE_DELAY);
      }
    }
  }

  /* ============================ Mark Rest Absent ============================ */

  async function handleMarkRestAbsent() {
    if (!selectedGroup) return;
    confirmToast(
      `سيتم تسجيل كل الطلاب غير المسجلين كغائبين بتاريخ ${selectedDate}`,
      async () => {
        setSaving(true);
        try {
          const result = await markRestAsAbsent(
            Number(selectedGroup),
            selectedDate,
          );
          if (result.success) {
            const count = Array.isArray(result.data) ? result.data.length : 0;
            notifySuccess(`تم تسجيل ${count} طالب كغائبين`);
            await loadGroupStudents(selectedGroup, selectedDate, page);
            await loadDashboard();
          } else {
            notifyError(result.error || "حدث خطأ");
          }
        } catch (error) {
          notifyError("حدث خطأ في تسجيل الغياب");
        } finally {
          setSaving(false);
          if (sessionActive) {
            setTimeout(() => {
              barcodeInputRef.current?.focus();
            }, FOCUS_RESTORE_DELAY);
          }
        }
      },
      "تأكيد",
    );
  }

  /* ============================ Barcode Scan ============================ */

  async function handleBarcodeSubmit(e) {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;

    if (code.length < MIN_BARCODE_LENGTH) {
      playBeep("error");
      notifyError("الباركود قصير جداً");
      setBarcode("");
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
      return;
    }

    const now = Date.now();
    if (now - lastSubmitTimeRef.current < DOUBLE_SUBMIT_GUARD) return;
    lastSubmitTimeRef.current = now;

    if (!sessionActive) {
      playBeep("error");
      notifyError("الجلسة غير نشطة، يرجى بدء جلسة أولاً");
      setBarcode("");
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
      return;
    }

    setSaving(true);
    try {
      const result = await scanStudentBarcode({
        barcode: code,
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade),
        session_id: sessionId,
      });

      if (result.success) {
        const student = result.data.student;
        const attendance = result.data.attendance;

        setAttendanceRecords((prev) => ({
          ...prev,
          [student.id]: attendance,
        }));

        setStudents((prev) =>
          prev.map((s) =>
            s.id === student.id
              ? {
                  ...s,
                  payment_status:
                    student.payment_status || s.payment_status || "unpaid",
                  required_amount:
                    student.required_amount ||
                    student.monthly_price ||
                    s.required_amount,
                }
              : s,
          ),
        );

        const summaryResult = await fetchAttendanceSummary(
          selectedGroup,
          selectedDate,
        );
        if (summaryResult.success) {
          setServerSummary(summaryResult.data || null);
        }

        playBeep("success");
        setLastScan({
          type: "success",
          name: student.full_name,
          isMakeup: result.data.is_makeup === 1,
          isPaid: student.payment_status === "paid",
        });
        notifySuccess(
          `${result.data.is_makeup === 1 ? "حضور تعويضي" : "تم تسجيل حضور"} ${student.full_name}`,
        );
      } else {
        playBeep("error");
        setLastScan({
          type: "error",
          message: result.error,
        });
        notifyError(result.error || "لم يتم العثور على الطالب");
      }
    } catch (error) {
      playBeep("error");
      notifyError("حدث خطأ في مسح الباركود");
    } finally {
      setBarcode("");
      setSaving(false);
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, FOCUS_RESTORE_DELAY);
    }
  }

  /* ============================ Mark Status ============================ */

  async function markStatus(student, status) {
    if (!selectedGroup) return;

    setRowLoading((prev) => ({ ...prev, [student.id]: true }));

    try {
      const payload = {
        student_id: student.id,
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade || student.grade_id || 0),
        attendance_date: selectedDate,
        status,
        attendance_time: nowTimeValue(),
        method: "manual",
        is_makeup: status === "present" && isMakeupEnabled ? 1 : 0,
        makeup_group_id:
          status === "present" && isMakeupEnabled
            ? Number(student.group_id || selectedGroup)
            : null,
        notes: "",
      };

      const result = await createNewAttendance(payload);

      if (result.success) {
        setAttendanceRecords((prev) => ({
          ...prev,
          [student.id]: {
            ...(result.data || payload),
            student_id: student.id,
          },
        }));

        const summaryResult = await fetchAttendanceSummary(
          selectedGroup,
          selectedDate,
        );
        if (summaryResult.success) {
          setServerSummary(summaryResult.data || null);
        }

        notifySuccess(
          `تم تسجيل ${status === "present" ? "حضور" : "غياب"} ${student.full_name}`,
        );
      } else {
        notifyError(result.error || "حدث خطأ في تسجيل الحضور");
      }
    } catch (error) {
      notifyError("حدث خطأ في تسجيل الحضور");
    } finally {
      setRowLoading((prev) => {
        const next = { ...prev };
        delete next[student.id];
        return next;
      });

      if (sessionActive) {
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, FOCUS_RESTORE_DELAY);
      }
    }
  }

  const markPresent = useCallback(
    (student) => markStatus(student, "present"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedGroup, selectedGrade, selectedDate, isMakeupEnabled],
  );

  const markAbsent = useCallback(
    (student) => markStatus(student, "absent"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedGroup, selectedGrade, selectedDate, isMakeupEnabled],
  );

  /* ============================ Details Modal ============================ */

  const openDetails = useCallback(async (record) => {
    if (!record?.id) return;
    setDetailsLoading(true);
    setDetailsRecord({ id: record.id });
    try {
      const res = await fetchAttendanceById(record.id);
      if (res.success) {
        setDetailsRecord(res.data);
        setEditForm({
          status: res.data?.status || "present",
          attendance_time: shortTime(res.data?.attendance_time),
          notes: res.data?.notes || "",
          is_makeup: res.data?.is_makeup === 1 ? 1 : 0,
        });
      } else {
        notifyError(res.error || "تعذر تحميل السجل");
        setDetailsRecord(null);
      }
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  async function saveRecordEdit() {
    if (!detailsRecord?.id || !editForm) return;
    setSaving(true);
    try {
      const res = await updateAttendanceInfo(detailsRecord.id, {
        status: editForm.status,
        attendance_time: editForm.attendance_time,
        notes: editForm.notes,
        is_makeup: Number(editForm.is_makeup) || 0,
      });
      if (res.success) {
        notifySuccess("تم تحديث السجل بنجاح");
        setDetailsRecord(null);
        setEditForm(null);
        await loadGroupStudents(selectedGroup, selectedDate, page);
        if (sessionActive) {
          setTimeout(() => {
            barcodeInputRef.current?.focus();
          }, FOCUS_RESTORE_DELAY);
        }
      } else {
        notifyError(res.error || "تعذر تحديث السجل");
      }
    } finally {
      setSaving(false);
    }
  }

  const deleteRecord = useCallback(
    async (record, student) => {
      if (!record?.id) return;
      confirmToast(
        `حذف سجل حضور ${student?.full_name || ""}؟`,
        async () => {
          setSaving(true);
          try {
            const res = await removeAttendance(record.id);
            if (res.success) {
              notifySuccess("تم حذف السجل");
              setAttendanceRecords((prev) => {
                const next = { ...prev };
                delete next[record.student_id ?? student?.id];
                return next;
              });
              const summaryResult = await fetchAttendanceSummary(
                selectedGroup,
                selectedDate,
              );
              if (summaryResult.success) {
                setServerSummary(summaryResult.data || null);
              }
            } else {
              notifyError(res.error || "تعذر حذف السجل");
            }
          } finally {
            setSaving(false);
            if (sessionActive) {
              setTimeout(() => {
                barcodeInputRef.current?.focus();
              }, FOCUS_RESTORE_DELAY);
            }
          }
        },
        "حذف",
      );
    },
    [selectedGroup, selectedDate, sessionActive],
  );

  /* ============================ Filtered Students ============================ */

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        String(s.barcode || "")
          .toLowerCase()
          .includes(q),
    );
  }, [students, search]);

  /* ============================ Summary ============================ */

  const localSummary = useMemo(() => {
    const values = Object.values(attendanceRecords);
    const present = values.filter((r) => r.status === "present").length;
    const absent = values.filter((r) => r.status === "absent").length;
    const total = pagination.total || students.length;
    return {
      total,
      present,
      absent,
      notMarked: Math.max(total - values.length, 0),
    };
  }, [attendanceRecords, students, pagination.total]);

  const summary = serverSummary
    ? {
        total: num(serverSummary.total_students) || localSummary.total,
        present: num(serverSummary.present_count),
        absent: num(serverSummary.absent_count),
        notMarked: num(serverSummary.not_marked_count),
      }
    : localSummary;

  const attendanceRate =
    summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;

  /* ============================ Derived Data ============================ */

  const groupsForSelectedGrade = useMemo(() => {
    if (!selectedGrade) return groups;
    return groups.filter((g) => String(g.grade_id) === String(selectedGrade));
  }, [groups, selectedGrade]);

  const monthGrouped = useMemo(() => {
    const map = new Map();
    monthRecords.forEach((r) => {
      const day = toLocalDate(r.attendance_date);
      if (!map.has(day)) map.set(day, { day, present: 0, absent: 0, rows: [] });
      const entry = map.get(day);
      if (r.status === "present") entry.present += 1;
      else entry.absent += 1;
      entry.rows.push(r);
    });
    return [...map.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
  }, [monthRecords]);

  const todayLabel = new Date(selectedDate).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      label: "إجمالي الطلاب",
      value: summary.total,
      icon: Users,
      cls: "from-blue-500 to-blue-600",
    },
    {
      label: "حاضر",
      value: summary.present,
      icon: UserCheck,
      cls: "from-green-500 to-green-600",
    },
    {
      label: "غائب",
      value: summary.absent,
      icon: UserX,
      cls: "from-red-500 to-red-600",
    },
    {
      label: "غير مسجل",
      value: summary.notMarked,
      icon: AlertCircle,
      cls: "from-gray-500 to-gray-600",
    },
    {
      label: "نسبة الحضور",
      value: `${attendanceRate}%`,
      icon: BarChart3,
      cls: "from-amber-500 to-amber-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 14 },
    },
  };

  /* ============================ Render ============================ */

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-8"
    >
      {/* ==================== Header ==================== */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-5 sm:mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Title */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 sm:p-3 bg-linear-to-br from-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/30 shrink-0">
              <CalendarCheck size={22} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                تسجيل الحضور والغياب
              </h1>
              <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-2 mt-1">
                <span className="truncate">{todayLabel}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full shrink-0"></span>
                <span
                  className={`inline-flex items-center gap-1 shrink-0 ${
                    sessionActive
                      ? "text-green-600 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sessionActive
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-300"
                    }`}
                  ></span>
                  {sessionActive
                    ? "جلسة نشطة"
                    : sessionLocked
                      ? "جلسة مغلقة"
                      : "جلسة غير نشطة"}
                </span>
                {isMakeupEnabled && sessionActive && (
                  <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] sm:text-xs shrink-0">
                    <RefreshCw size={10} />
                    تعويضي
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          {dashboard && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 sm:px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-xs"
            >
              <span className="text-gray-500 hidden sm:block col-span-4 text-[10px] -mb-1">
                إحصائيات اليوم
              </span>
              <div className="text-center">
                <p className="text-gray-400 text-[10px]">الطلاب</p>
                <p className="font-bold text-gray-700">
                  {num(dashboard.total_students)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-[10px]">حاضر</p>
                <p className="font-bold text-green-600">
                  {num(dashboard.present_today)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-[10px]">غائب</p>
                <p className="font-bold text-red-600">
                  {num(dashboard.absent_today)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-[10px]">غير مسجل</p>
                <p className="font-bold text-gray-500">
                  {num(dashboard.not_marked_today)}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stat Cards */}
        {selectedGroup && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3"
          >
            {statCards.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className={`p-2 sm:p-2.5 rounded-xl bg-linear-to-br ${stat.cls} text-white shadow-sm shrink-0`}
                >
                  <stat.icon size={16} className="sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    {stat.label}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.header>

      {/* ==================== Main Grid ==================== */}
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {/* ==================== Left Panel ==================== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1 space-y-4"
        >
          {/* Session Setup */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-linear-to-br from-primary to-primary/80 rounded-xl shadow-sm">
                <Play size={18} className="text-white" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">
                إعداد الجلسة
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  المرحلة الدراسية
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedGroup("");
                  }}
                  disabled={sessionActive}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all text-sm"
                >
                  <option value="">اختر المرحلة</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  المجموعة
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  disabled={sessionActive}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all text-sm"
                >
                  <option value="">اختر المجموعة</option>
                  {groupsForSelectedGrade.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <Clock size={14} className="text-primary shrink-0" />
                  الجلسة هتقفل تلقائياً بعد المدة الافتراضية
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleStartSession}
                  disabled={!selectedGroup || sessionActive || saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-primary/90 px-4 py-3 text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 shadow-md disabled:cursor-not-allowed disabled:bg-gray-300 disabled:bg-none disabled:shadow-none text-sm"
                >
                  {saving && !sessionActive ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Play size={16} />
                  )}
                  بدء الجلسة
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleEndSession}
                  disabled={!sessionActive || saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-600 to-red-700 px-4 py-3 text-white font-medium hover:from-red-700 hover:to-red-800 shadow-md shadow-red-500/20 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:bg-none disabled:shadow-none transition-all text-sm"
                >
                  <Square size={16} />
                  إنهاء الجلسة
                </motion.button>
              </div>

              {sessionActive && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleToggleMakeup}
                  disabled={saving}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-white font-medium transition-all duration-300 text-sm ${
                    isMakeupEnabled
                      ? "bg-linear-to-r from-amber-600 to-amber-700 shadow-md shadow-amber-500/20"
                      : "bg-linear-to-r from-amber-500 to-amber-600 shadow-md shadow-amber-400/20"
                  } disabled:cursor-not-allowed disabled:bg-gray-300 disabled:bg-none disabled:shadow-none`}
                >
                  <RefreshCw size={16} />
                  {isMakeupEnabled
                    ? "إلغاء الحضور التعويضي"
                    : "تفعيل الحضور التعويضي"}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleMarkRestAbsent}
                disabled={!selectedGroup || saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-3 text-white font-medium hover:bg-gray-900 transition-all disabled:cursor-not-allowed disabled:bg-gray-300 text-sm"
              >
                <UserX size={16} />
                تسجيل الباقي غياب
              </motion.button>

              {sessionInfo && (
                <div className="rounded-xl bg-linear-to-br from-gray-50 to-white border border-gray-100 p-3.5 text-xs text-gray-600 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>رقم الجلسة</span>
                    <b className="font-mono text-primary">{sessionInfo.id}</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>بدأت</span>
                    <b className="text-gray-700 text-[11px]">
                      {new Date(sessionInfo.started_at).toLocaleString("ar-EG")}
                    </b>
                  </div>
                  {sessionInfo.lock_at && (
                    <div className="flex items-center justify-between">
                      <span>تقفل</span>
                      <b className="text-gray-700 text-[11px]">
                        {new Date(sessionInfo.lock_at).toLocaleString("ar-EG")}
                      </b>
                    </div>
                  )}
                  {sessionActive && lockRemaining > 0 && (
                    <div
                      className={`flex items-center justify-between pt-2 border-t border-gray-100 font-bold ${
                        lockRemaining < 300 ? "text-red-600" : "text-primary"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        متبقي
                      </span>
                      <span className="flex items-center gap-1.5">
                        {formatDuration(lockRemaining)}
                        {lockRemaining < 300 && (
                          <AlertTriangle size={12} className="animate-pulse" />
                        )}
                      </span>
                    </div>
                  )}
                  {sessionActive && sessionInfo.attendance_locked === 1 && (
                    <div className="text-red-600 font-bold flex items-center gap-1 pt-2 border-t border-gray-100">
                      <AlertCircle size={12} />
                      تم قفل تسجيل الحضور
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-xl bg-linear-to-br from-blue-50 to-blue-50/40 p-4 border border-blue-100">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <div className="text-xs text-gray-700 space-y-1">
                    <p className="font-semibold text-primary text-sm">
                      تنبيهات
                    </p>
                    <ul className="space-y-1">
                      <li>• ابدأ الجلسة لتسجيل الحضور بالباركود</li>
                      <li>• التسجيل اليدوي شغال لأي تاريخ</li>
                      <li>• عند إنهاء الجلسة يُسجل الباقي كغائبين</li>
                      <li>• 3 غيابات متتالية = حذف تلقائي</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Consecutive Absences */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                غياب متتالي (3 أيام+)
              </h3>
            </div>
            {overview.consecutiveAbsences.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">لا يوجد طلاب حالياً</p>
            ) : (
              <ul className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                {overview.consecutiveAbsences.map((s, i) => (
                  <li
                    key={s.student_id || s.id || i}
                    className="flex items-center justify-between text-xs bg-red-50 rounded-xl px-3 py-2 border border-red-100"
                  >
                    <span className="text-gray-800 truncate">
                      {s.full_name || s.name}
                    </span>
                    <span className="text-red-600 font-bold shrink-0 mr-2">
                      {s.consecutive_absences ?? s.absences ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>

        {/* ==================== Right Panel ==================== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-4"
        >
          {/* Barcode Scan */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-primary to-primary/80 rounded-xl shadow-sm">
                  <ScanLine size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                    تسجيل سريع بالباركود
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    امسح باركود الطالب لتسجيل الحضور
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium ${
                    sessionActive
                      ? "bg-green-100 text-green-700"
                      : sessionLocked
                        ? "bg-gray-100 text-gray-500"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {sessionActive
                    ? "جلسة مفتوحة"
                    : sessionLocked
                      ? "تم الإغلاق"
                      : "غير نشطة"}
                </div>
                {sessionActive && (
                  <div
                    className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium flex items-center gap-1.5 ${
                      scannerReady
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        scannerReady
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    ></span>
                    {scannerReady ? "جاهز" : "دوس على الحقل"}
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={handleBarcodeSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <ScanLine
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                />
                <input
                  type="text"
                  ref={barcodeInputRef}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  disabled={!sessionActive || saving}
                  placeholder="امسح الباركود..."
                  autoFocus
                  autoComplete="off"
                  className={`w-full rounded-xl border-2 pr-12 pl-4 py-3.5 text-base sm:text-lg focus:outline-none transition-all font-mono ${
                    scannerReady
                      ? "border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-200"
                      : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary"
                  } disabled:bg-gray-100`}
                  dir="ltr"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!sessionActive || saving}
                className="px-6 py-3.5 bg-linear-to-r from-primary to-primary/90 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 shadow-md disabled:cursor-not-allowed disabled:bg-gray-300 disabled:bg-none disabled:shadow-none flex items-center gap-2 justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جاري...
                  </>
                ) : (
                  <>
                    <ScanLine size={18} />
                    تسجيل
                  </>
                )}
              </motion.button>
            </form>

            {/* Last Scan Feedback */}
            <AnimatePresence>
              {lastScan && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div
                    className={`rounded-xl p-3 text-sm flex items-center gap-2 ${
                      lastScan.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {lastScan.type === "success" ? (
                      <>
                        <Volume2 size={16} className="shrink-0" />
                        <span className="truncate">
                          {lastScan.isMakeup
                            ? "حضور تعويضي: "
                            : "تم تسجيل حضور: "}
                          <b>{lastScan.name}</b>
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="shrink-0" />
                        <span className="truncate">{lastScan.message}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Controls & Tabs */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {[
                { id: "day", label: "حضور اليوم", icon: CalendarCheck },
                { id: "month", label: "سجل الشهر", icon: CalendarDays },
                { id: "stats", label: "الإحصائيات", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-linear-to-r from-primary to-primary/90 text-white shadow-md shadow-primary/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <tab.icon size={14} className="sm:w-4 sm:h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "day" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={!selectedGroup}
                    placeholder="ابحث بالاسم أو الباركود..."
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pr-12 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 transition-all text-sm"
                  />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                />
              </div>
            )}

            {activeTab === "month" && (
              <div className="flex flex-wrap gap-3">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm flex-1 min-w-40"
                />
                <button
                  type="button"
                  onClick={loadMonth}
                  disabled={!selectedGroup || monthLoading}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-all text-sm"
                >
                  <RefreshCw
                    size={16}
                    className={monthLoading ? "animate-spin" : ""}
                  />
                  تحديث
                </button>
              </div>
            )}
          </motion.div>

          {/* ==================== Day Tab ==================== */}
          {activeTab === "day" && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                    <Users size={18} className="text-primary" />
                    قائمة الطلاب
                    {selectedGroup && (
                      <span className="text-xs sm:text-sm font-normal text-gray-500 truncate">
                        -{" "}
                        {
                          groups.find(
                            (g) => String(g.id) === String(selectedGroup),
                          )?.name
                        }
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      الكل: <b>{summary.total}</b>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      حاضر: <b className="text-green-600">{summary.present}</b>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      غائب: <b className="text-red-600">{summary.absent}</b>
                    </span>
                  </div>
                </div>
              </div>

              {!selectedGroup ? (
                <div className="text-center py-16 text-gray-400 px-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Users size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm">اختر المجموعة أولاً لعرض الطلاب</p>
                </div>
              ) : loading ? (
                <div className="p-4 sm:p-6 space-y-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-16 sm:h-14 rounded-xl bg-linear-to-r from-gray-100 to-gray-50 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-16 text-gray-400 px-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Users size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm">
                    {search
                      ? "لا يوجد طلاب مطابقين للبحث"
                      : "لا يوجد طلاب في هذه المجموعة"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table - hidden on mobile */}
                  <div className="hidden md:block">
                    <div className="max-h-[60vh] overflow-auto custom-scrollbar">
                      <table className="w-full text-right min-w-225">
                        <thead className="bg-linear-to-r from-gray-50 to-gray-100/60 sticky top-0 z-10 backdrop-blur">
                          <tr>
                            {[
                              "الاسم",
                              "الباركود",
                              "الحالة",
                              "حالة الدفع",
                              "الوقت",
                              "إجراء",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-5 py-3.5 text-sm font-semibold text-gray-600 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <AnimatePresence>
                            {filteredStudents.map((student, index) => (
                              <AttendanceRow
                                key={student.id || index}
                                student={student}
                                index={index}
                                record={attendanceRecords[student.id]}
                                canEdit={canEdit}
                                isLoading={!!rowLoading[student.id]}
                                onMarkPresent={markPresent}
                                onMarkAbsent={markAbsent}
                                onDetails={openDetails}
                                onDelete={deleteRecord}
                                onPay={handlePayClick}
                              />
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards - hidden on desktop */}
                  <div className="md:hidden p-3 sm:p-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {filteredStudents.map((student, index) => (
                      <StudentCard
                        key={student.id || index}
                        student={student}
                        index={index}
                        record={attendanceRecords[student.id]}
                        canEdit={canEdit}
                        isLoading={!!rowLoading[student.id]}
                        onMarkPresent={markPresent}
                        onMarkAbsent={markAbsent}
                        onDetails={openDetails}
                        onDelete={deleteRecord}
                        onPay={handlePayClick}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit || PAGE_SIZE}
                    onChange={(newPage) => {
                      setPage(newPage);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </>
              )}
            </motion.div>
          )}

          {/* ==================== Month Tab ==================== */}
          {activeTab === "month" && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-2">
                <ClipboardList size={18} className="text-primary" />
                <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                  سجل الحضور - {selectedMonth}
                </h3>
              </div>
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3">
                {!selectedGroup ? (
                  <p className="text-center text-gray-400 py-10 text-sm">
                    اختر المجموعة أولاً
                  </p>
                ) : monthLoading ? (
                  [0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-linear-to-r from-gray-100 to-gray-50 animate-pulse"
                    />
                  ))
                ) : monthGrouped.length === 0 ? (
                  <p className="text-center text-gray-400 py-10 text-sm">
                    لا توجد سجلات في هذا الشهر
                  </p>
                ) : (
                  monthGrouped.map((day) => (
                    <div
                      key={day.day}
                      className="rounded-xl border border-gray-100 overflow-hidden bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-linear-to-r from-gray-50 to-gray-50/50 px-4 py-2.5">
                        <span className="font-medium text-gray-800 text-xs sm:text-sm">
                          {new Date(day.day).toLocaleDateString("ar-EG", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                        <span className="flex gap-3 text-xs">
                          <span className="text-green-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            حاضر: {day.present}
                          </span>
                          <span className="text-red-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            غائب: {day.absent}
                          </span>
                        </span>
                      </div>
                      <ul className="divide-y divide-gray-50">
                        {day.rows.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm hover:bg-gray-50/50 transition-colors"
                          >
                            <span className="text-gray-700 truncate mr-2">
                              {r.full_name}
                            </span>
                            <span className="flex items-center gap-2 sm:gap-3 shrink-0">
                              <span className="text-[10px] sm:text-xs text-gray-400 font-mono">
                                {formatTimeLabel(r.attendance_time)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                                  r.status === "present"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {r.status === "present" ? "حاضر" : "غائب"}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ==================== Stats Tab ==================== */}
          {activeTab === "stats" && (
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                    إحصائيات عامة
                  </h3>
                </div>
                <StatsTable rows={overview.overall} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" />
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">
                    إحصائيات المرحلة{" "}
                    {selectedGrade
                      ? `- ${
                          grades.find(
                            (g) => String(g.id) === String(selectedGrade),
                          )?.name || ""
                        }`
                      : ""}
                  </h3>
                </div>
                {selectedGrade ? (
                  <StatsTable rows={gradeStats} />
                ) : (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    اختر المرحلة أولاً
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ==================== Details Modal ==================== */}
      <AnimatePresence>
        {detailsRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => {
              setDetailsRecord(null);
              setEditForm(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
            >
              <div className="bg-linear-to-r from-primary to-primary/80 px-5 py-4 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Pencil size={18} />
                  تفاصيل سجل الحضور
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsRecord(null);
                    setEditForm(null);
                  }}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                {detailsLoading || !editForm ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-10 rounded-xl bg-linear-to-r from-gray-100 to-gray-50 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 space-y-1.5 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                      <p>
                        الطالب:{" "}
                        <b className="text-gray-800">
                          {detailsRecord.full_name}
                        </b>
                      </p>
                      <p>المجموعة: {detailsRecord.group_name || "-"}</p>
                      <p>
                        التاريخ: {toLocalDate(detailsRecord.attendance_date)} •
                        الطريقة:{" "}
                        {detailsRecord.method === "barcode" ? "باركود" : "يدوي"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">
                          الحالة
                        </label>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              status: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        >
                          <option value="present">حاضر</option>
                          <option value="absent">غائب</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">
                          الوقت
                        </label>
                        <input
                          type="time"
                          value={editForm.attendance_time}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              attendance_time: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.is_makeup === 1}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            is_makeup: e.target.checked ? 1 : 0,
                          }))
                        }
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      حضور تعويضي
                    </label>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">
                        ملاحظات
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                <button
                  type="button"
                  onClick={saveRecordEdit}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-linear-to-r from-primary to-primary/90 text-white font-medium hover:shadow-lg hover:shadow-primary/30 disabled:bg-gray-300 disabled:bg-none transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التعديلات"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== Payment Modal ==================== */}
      <PaymentModal
        isOpen={!!paymentStudent}
        onClose={handlePaymentClose}
        student={paymentStudent}
        onSubmit={handlePaymentSubmit}
        isSubmitting={paymentSubmitting}
      />
    </motion.section>
  );
};

export default Attendance;
