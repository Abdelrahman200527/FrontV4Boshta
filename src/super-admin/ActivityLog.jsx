import React, { useState, useEffect } from "react";
import {
  Activity,
  Filter,
  Calendar,
  RotateCcw,
  User,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { getSuperAdminActivityLog } from "../api/super-admin/services";
import { toast } from "sonner";

export default function SuperAdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityType, setEntityType] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getSuperAdminActivityLog({
        entity_type: entityType,
        date: date,
        page: page,
      });
      setLogs(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error("فشل تحميل سجل النشاطات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityType, date]);

  const handleResetFilters = () => {
    setEntityType("");
    setDate("");
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800 flex items-center gap-2">
            <Activity size={24} className="text-[#1a5d1a]" />
            سجل العمليات والرقابة العامة
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            متابعة دقيقة لكل عملية وحركة تحدث على المنصة من قِبل المدرسين والمساعدين مع التاريخ والوقت.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 transition"
        >
          <RotateCcw size={16} />
          تحديث السجل
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Filter size={16} />
          تصفية حسب:
        </div>

        {/* Entity type select */}
        <select
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#1a5d1a]"
        >
          <option value="">جميع العمليات</option>
          <option value="student">الطلاب</option>
          <option value="user">الموظفين</option>
          <option value="attendance">الحضور والغياب</option>
          <option value="payment">المدفوعات</option>
          <option value="subscription">الاشتراكات</option>
          <option value="exam">الامتحانات</option>
          <option value="settings">الإعدادات</option>
        </select>

        {/* Date picker */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
          <Calendar size={15} className="text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="bg-transparent text-xs text-gray-700 font-bold focus:outline-none"
          />
        </div>

        {(entityType || date) && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-red-600 hover:underline font-bold px-2 py-1"
          >
            إلغاء الفلاتر
          </button>
        )}
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-bold">جاري تحميل السجل...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">لا توجد عمليات مسجلة في هذا النطاق.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-xs font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">المستخدم المسؤول</th>
                  <th className="py-3.5 px-4">نوع العملية</th>
                  <th className="py-3.5 px-4">تفاصيل الإجراء</th>
                  <th className="py-3.5 px-4">الوقت والتاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1a5d1a] font-bold flex items-center justify-center text-xs shrink-0">
                          {log.user_role === "teacher" ? "معلم" : log.user_role === "assistant" ? "مساعد" : "أدمن"}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block text-xs sm:text-sm">
                            {log.user_name || "النظام"}
                          </span>
                          <span className="text-[10px] text-gray-400">{log.user_role || "system"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs sm:text-sm text-gray-700 max-w-md">
                      {log.description}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400" dir="ltr">
                      {log.created_at ? new Date(log.created_at).toLocaleString("ar-EG") : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              الصفحة {pagination.page} من {pagination.totalPages} (إجمالي: {pagination.total})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 font-bold disabled:opacity-40 transition flex items-center gap-1"
              >
                <ChevronRight size={14} />
                السابق
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 font-bold disabled:opacity-40 transition flex items-center gap-1"
              >
                التالي
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
