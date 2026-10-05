import React from "react";
import { Video, Clock, ExternalLink, Calendar, MonitorPlay } from "lucide-react";

export default function LiveTab() {
  const sessions = [
    {
      id: 1,
      title: "مراجعة همزة الوصل والقطع (مباشر الآن)",
      status: "live",
      duration: 60,
      link: "https://meet.google.com/aqx-mmwy-zhv",
      material: "ملزمة_المراجعة.pdf"
    },
    {
      id: 2,
      title: "حل تدريبات النحو",
      status: "ended",
      duration: 120,
      link: "https://www.youtube.com/watch?v=03hsHuIXLQE",
      material: "تدريبات.pdf",
      date: "2026-10-10"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">حصص البث المباشر</h2>
          <p className="text-sm text-gray-500">احضر الحصص المباشرة وتفاعل مع المدرس</p>
        </div>
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
          <MonitorPlay size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
            {s.status === 'live' && (
              <div className="absolute top-0 right-0 left-0 h-1 bg-red-500 animate-pulse"></div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900 text-lg leading-tight w-3/4">{s.title}</h3>
              {s.status === 'live' ? (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span> مباشر
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full shrink-0">منتهية</span>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-2 mb-6 border border-gray-100">
              <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                <Clock size={16}/> المدرس: {s.duration} دقيقة
              </span>
              {s.date && (
                <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  <Calendar size={16}/> التاريخ: {s.date}
                </span>
              )}
              {s.material && (
                <span className="text-sm font-bold text-blue-600 flex items-center gap-2 cursor-pointer hover:underline mt-2">
                  <FileText size={16}/> المرفق: {s.material}
                </span>
              )}
            </div>

            <div className="mt-auto">
              {s.status === 'live' ? (
                <button 
                  onClick={() => window.open(s.link, "_blank")}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition flex items-center justify-center gap-2"
                >
                  <Video size={18} />
                  انضمام للحصة الآن (Google Meet)
                </button>
              ) : (
                <button 
                  onClick={() => window.open(s.link, "_blank")}
                  className="w-full bg-blue-50 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                  <MonitorPlay size={18} />
                  مشاهدة التسجيل المرفوع
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// simple shim
function FileText({size}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg> }
