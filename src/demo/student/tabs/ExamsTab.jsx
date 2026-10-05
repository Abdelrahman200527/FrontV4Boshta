import React, { useState, useEffect } from "react";
import { 
  FileText, Clock, CheckCircle2, XCircle, Award, RotateCcw, 
  ArrowRight, Download, PlayCircle, Eye, LogOut
} from "lucide-react";
import { motion } from "framer-motion";

export default function ExamsTab() {
  const [view, setView] = useState("list"); // list, taking, review
  const [activeTab, setActiveTab] = useState("available"); // available, history, paper
  const [selectedExam, setSelectedExam] = useState(null);

  // Mock taking state
  const [currentQuestionIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  
  const mockAvailable = [
    { id: 1, title: "امتحان الوحدة الأولى (شامل مقالي وموضوعي)", duration_minutes: 60, total_degree: 50, questions_count: 5, has_essay: true },
    { id: 2, title: "اختبار قصير: همزة القطع (اختياري فقط)", duration_minutes: 20, total_degree: 20, questions_count: 5, has_essay: false }
  ];

  const mockHistory = [
    { id: 3, title: "امتحان الشهر الأول (شامل)", degree: 45, full_mark: 50, date: "2026-10-01", status: "passed", percentage: 90 }
  ];

  const mockPaper = [
    { id: 4, title: "امتحان شهر أكتوبر الميداني", degree: 45, full_mark: 50, date: "2026-10-15" }
  ];

  const questions = [
    {
      id: 1, text: "أي الكلمات الآتية تبدأ بهمزة قطع؟", type: "mcq", mark: 2,
      options: [ { id: 1, text: "اقتصاد" }, { id: 2, text: "أحمد" }, { id: 3, text: "انطلاق" }, { id: 4, text: "استغفار" } ]
    },
    {
      id: 2, text: "كلمة (ابن) تبدأ بهمزة وصل لأنها:", type: "mcq", mark: 2,
      options: [ { id: 5, text: "من الأسماء التسعة المسموعة" }, { id: 6, text: "مصدر خماسي" }, { id: 7, text: "فعل ماضي" } ]
    },
    {
      id: 3, text: "اشرح متى تُحذف ألف (ابن) ومتى تثبت؟ مع التمثيل.", type: "essay", mark: 6
    }
  ];

  // Timer logic
  useEffect(() => {
    let timer;
    if (view === "taking" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setView("taking");
    setTimeLeft(exam.duration_minutes * 60);
    setAnswers({});
    setCurrentIndex(0);
  };

  const handleOptionSelect = (qId, oId) => {
    setAnswers(prev => ({ ...prev, [qId]: oId }));
  };
  const handleEssayChange = (qId, text) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const submitExam = () => {
    // End exam, show a fake score
    setView("list");
    setActiveTab("history");
    alert("تم تسليم الامتحان بنجاح (ديمو)!");
  };

  if (view === "taking") {
    const q = questions[currentQuestionIndex];
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[60vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setView("list")} className="p-2 hover:bg-white/10 rounded-full transition">
              <LogOut size={20} />
            </button>
            <div>
              <h2 className="font-bold">{selectedExam.title}</h2>
              <p className="text-xs text-white/70">سؤال {currentQuestionIndex + 1} من {questions.length}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold px-4 py-2 rounded-xl ${timeLeft < 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10'}`}>
            <Clock size={18} />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-6 sm:p-10 bg-gray-50/50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900 leading-relaxed">{q.text}</h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full shrink-0">{q.mark} درجات</span>
              </div>

              {q.type === "mcq" ? (
                <div className="space-y-3">
                  {q.options.map(opt => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleOptionSelect(q.id, opt.id)}
                        className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center gap-3 font-medium ${
                          isSelected ? "border-[#009966] bg-green-50/50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-[#009966]" : "border-gray-300"
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-[#009966] rounded-full"></div>}
                        </div>
                        {opt.text}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea 
                    className="w-full border-2 border-gray-100 rounded-xl p-4 min-h-[150px] focus:outline-none focus:border-[#009966] font-medium resize-y"
                    placeholder="اكتب إجابتك المقالية هنا..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleEssayChange(q.id, e.target.value)}
                  ></textarea>
                  
                  {/* File upload simulator */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer">
                    <Download className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm font-bold text-gray-600 mb-1">إرفاق ملف أو صورة للإجابة (اختياري)</p>
                    <p className="text-xs text-gray-400">PDF, JPG, PNG (ديمو)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="bg-white p-4 border-t border-gray-100 flex items-center justify-between sticky bottom-0 z-10">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 flex items-center gap-2"
          >
            <ArrowRight size={18} />
            السابق
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button onClick={submitExam} className="px-8 py-3 rounded-xl font-bold bg-[#009966] text-white hover:bg-green-700 shadow-lg shadow-green-500/30 flex items-center gap-2">
              <CheckCircle2 size={18} />
              تسليم الامتحان
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              التالي
              <ArrowRight size={18} className="rotate-180" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === "review") {
    // Review interface
    return (
      <div className="space-y-6">
        <button onClick={() => setView("list")} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 w-fit">
          <ArrowRight size={18} />
          عودة للامتحانات
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">امتحان الوحدة الأولى (شامل مقالي وموضوعي)</h2>
            <p className="text-sm text-gray-500">تم التسليم في 2026-10-01</p>
          </div>
          <div className="text-center bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
            <span className="text-3xl font-black text-green-600 block" dir="ltr">45 / 50</span>
            <span className="text-xs font-bold text-gray-500">ممتاز! (90%)</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <CheckCircle2 size={24} />
              <h3 className="font-bold text-lg text-gray-900">س 1: أي الكلمات الآتية تبدأ بهمزة قطع؟</h3>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-gray-100 text-sm">اقتصاد</div>
              <div className="p-3 rounded-lg border border-green-300 bg-green-50 font-bold flex items-center justify-between text-sm">
                <span>أحمد (إجابتك صحيحة)</span>
                <CheckCircle2 className="text-green-600" size={18} />
              </div>
              <div className="p-3 rounded-lg border border-gray-100 text-sm">انطلاق</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <XCircle size={24} />
              <h3 className="font-bold text-lg text-gray-900">س 2: كلمة (ابن) تبدأ بهمزة وصل لأنها:</h3>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-green-300 bg-green-50 font-bold flex items-center justify-between text-sm">
                <span>من الأسماء التسعة المسموعة (الإجابة الصحيحة)</span>
                <CheckCircle2 className="text-green-600" size={18} />
              </div>
              <div className="p-3 rounded-lg border border-red-300 bg-red-50 font-bold flex items-center justify-between text-sm text-red-700">
                <span>مصدر خماسي (إجابتك الخاطئة)</span>
                <XCircle className="text-red-600" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-amber-600">
              <FileText size={24} />
              <h3 className="font-bold text-lg text-gray-900">س 3: سؤال مقالي (تم التقييم)</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-2">
              <p className="text-sm font-bold text-gray-500 mb-2">إجابتك:</p>
              <p className="text-gray-900">تحذف إذا وقعت بين علمين، وتثبت إذا لم تكن بين علمين.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-start gap-3">
              <Award className="text-green-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-green-700 mb-1">تقييم المدرس: (5/6 درجات)</p>
                <p className="text-sm text-green-800">ممتاز، لكن نسيت ذكر شرط ألا تقع في أول السطر.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
        <button onClick={() => setActiveTab("available")} className={`px-6 py-2 rounded-xl font-bold transition-all text-sm ${activeTab === "available" ? "bg-[#009966] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
          المتاحة
        </button>
        <button onClick={() => setActiveTab("history")} className={`px-6 py-2 rounded-xl font-bold transition-all text-sm ${activeTab === "history" ? "bg-[#009966] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
          السابقة (سجل)
        </button>
        <button onClick={() => setActiveTab("paper")} className={`px-6 py-2 rounded-xl font-bold transition-all text-sm ${activeTab === "paper" ? "bg-[#009966] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
          الورقية
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === "available" && mockAvailable.map(exam => (
          <div key={exam.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col group hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Clock size={14} />
                {exam.duration_minutes} دقيقة
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{exam.title}</h3>
            <div className="text-sm text-gray-500 mb-6 space-y-2 flex-1">
              <p className="flex justify-between border-b border-gray-50 pb-2"><span>الدرجة الكلية:</span> <span className="font-bold text-gray-900">{exam.total_degree}</span></p>
              <p className="flex justify-between border-b border-gray-50 pb-2"><span>عدد الأسئلة:</span> <span className="font-bold text-gray-900">{exam.questions_count}</span></p>
              <p className="flex justify-between pb-2"><span>نوع الأسئلة:</span> <span className="font-bold text-gray-900">{exam.has_essay ? "موضوعي + مقالي" : "اختياري فقط"}</span></p>
            </div>
            <button onClick={() => handleStartExam(exam)} className="w-full bg-[#009966] text-white font-bold py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2">
              <PlayCircle size={18} />
              بدء الامتحان
            </button>
          </div>
        ))}

        {activeTab === "history" && mockHistory.map(exam => (
          <div key={exam.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{exam.title}</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center shrink-0">
                <span className="font-bold text-green-600">{exam.percentage}%</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">تاريخ التسليم: {exam.date}</p>
                <p className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg inline-block">{exam.degree} / {exam.full_mark}</p>
              </div>
            </div>
            <button onClick={() => setView("review")} className="w-full bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2">
              <Eye size={18} />
              مراجعة إجاباتي
            </button>
          </div>
        ))}

        {activeTab === "paper" && mockPaper.map(exam => (
          <div key={exam.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{exam.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1"><CalendarCheck2 size={14}/> {exam.date}</p>
            </div>
            <div className="text-center">
              <span className="block text-xl font-black text-green-600" dir="ltr">{exam.degree}/{exam.full_mark}</span>
              <span className="text-xs text-gray-400">امتحان سنتر</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
