import React from "react";
import { BookOpen, CheckCircle2, Clock, XCircle, Award, Upload } from "lucide-react";

export default function HomeworkTab() {
  const assignments = [
    { 
      id: 1, 
      title: "واجب همزة الوصل والقطع (الدرس الأول)", 
      description: "استخرج من القطعة 5 كلمات بها همزة وصل و 5 كلمات بها همزة قطع.", 
      status: "submitted",
      degree: 9,
      full_mark: 10,
      feedback: "ممتاز يا بطل استمر، راجع فقط كلمة (استخراج).",
      deadline: "2026-10-01"
    },
    { 
      id: 2, 
      title: "واجب المفعول المطلق", 
      description: "أعرب الجمل المرفقة في ملف الـ PDF.", 
      status: "late",
      degree: null,
      full_mark: 15,
      feedback: null,
      deadline: "2026-10-15" // past date technically
    },
    { 
      id: 3, 
      title: "بحث القراءة الحرة", 
      description: "اكتب ملخصاً لا يتجاوز صفحة واحدة عن أحد كتب العقاد.", 
      status: "closed",
      degree: 0,
      full_mark: 20,
      feedback: "لم يتم التسليم في الموعد وتم إغلاق الواجب.",
      deadline: "2026-09-01"
    }
  ];

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">الواجبات والتكليفات</h2>
          <p className="text-sm text-gray-500">تابع واجباتك واحرص على تسليمها في الموعد</p>
        </div>
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <BookOpen size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map(hw => (
          <div key={hw.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
            {/* Status indicator line */}
            <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${
              hw.status === 'submitted' ? 'bg-green-500' : 
              hw.status === 'late' ? 'bg-amber-500' : 'bg-red-500'
            }`}></div>

            <div className="flex justify-between items-start mb-4 pr-4">
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{hw.title}</h3>
              {hw.status === 'submitted' && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1"><CheckCircle2 size={12}/> مُسلّمة</span>}
              {hw.status === 'late' && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1"><Clock size={12}/> متأخرة</span>}
              {hw.status === 'closed' && <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1"><XCircle size={12}/> مغلقة</span>}
            </div>
            
            <p className="text-sm text-gray-600 mb-4 flex-1 pr-4 leading-relaxed">{hw.description}</p>
            
            <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center mb-4 pr-4 border border-gray-100">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Clock size={14}/>
                آخر موعد: <span className="text-gray-900">{hw.deadline}</span>
              </span>
              <span className="text-xs font-bold text-gray-500">
                الدرجة الكلية: <span className="text-gray-900">{hw.full_mark}</span>
              </span>
            </div>

            {/* Content based on status */}
            <div className="pr-4 mt-auto">
              {hw.status === 'submitted' && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-green-800 flex items-center gap-1"><Award size={16}/> درجتك:</span>
                    <span className="text-lg font-black text-green-600" dir="ltr">{hw.degree} / {hw.full_mark}</span>
                  </div>
                  {hw.feedback && (
                    <div className="text-xs font-bold text-green-700 bg-white p-2 rounded-lg border border-green-200 mt-2">
                      أ/ محمد بشتة: {hw.feedback}
                    </div>
                  )}
                </div>
              )}

              {hw.status === 'late' && (
                <button className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition flex items-center justify-center gap-2">
                  <Upload size={18} />
                  تسليم الواجب (متأخر)
                </button>
              )}

              {hw.status === 'closed' && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                  <span className="text-red-700 font-bold text-sm block mb-1">الدرجة: صفر (لم يتم التسليم)</span>
                  <span className="text-xs text-red-600">{hw.feedback}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
