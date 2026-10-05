import React from "react";
import { 
  CalendarCheck2, FileText, BookOpen, GraduationCap, Video, 
  TrendingUp, Activity, PieChart as PieChartIcon
} from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";

export default function DashboardTab({ setActiveTab }) {
  
  const stats = [
    { title: "نسبة الحضور", value: "95%", icon: CalendarCheck2, color: "text-green-600", bg: "bg-green-100" },
    { title: "متوسط الدرجات", value: "90%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "الواجبات المحلولة", value: "2/3", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "الكورسات المشترك بها", value: "1", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const pieData = [
    { name: "حضور", value: 95 },
    { name: "غياب", value: 5 }
  ];

  const barData = [
    { name: "أكتوبر", degree: 45 },
    { name: "نوفمبر", degree: 0 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#009966] to-[#1a5d1a] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 text-center sm:text-right">
          <h2 className="text-2xl sm:text-3xl font-black">أهلاً بك يا بطل، أحمد! 🚀</h2>
          <p className="text-white/90 font-medium text-sm sm:text-base">
            استمر في تفوقك، امتحانك القادم قريب، تأكد من مراجعة دروسك!
          </p>
        </div>
        <div className="relative z-10 bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20 text-center w-full sm:w-auto">
          <span className="block text-xs font-bold text-white/80 mb-1">الباركود الخاص بك</span>
          <span className="block text-3xl font-black tracking-wider">0011</span>
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChartIcon className="text-[#009966]" />
            نسبة الحضور والغياب
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600"><span className="w-3 h-3 rounded-full bg-green-600"></span> حضور (95%)</div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600"><span className="w-3 h-3 rounded-full bg-red-600"></span> غياب (5%)</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="text-blue-600" />
            أداء الامتحانات الأخيرة
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="degree" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-start justify-between group cursor-pointer hover:border-blue-300 transition" onClick={() => setActiveTab("live")}>
          <div>
            <span className="text-blue-600 bg-blue-50 text-xs font-bold px-2 py-1 rounded mb-3 inline-block">بث مباشر قادم</span>
            <h4 className="font-bold text-gray-900 mb-1">مراجعة همزة الوصل والقطع (مباشر الآن)</h4>
            <p className="text-sm text-gray-500">انقر هنا للانضمام للحصة</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
            <Video size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex items-start justify-between group cursor-pointer hover:border-amber-300 transition" onClick={() => setActiveTab("exams")}>
          <div>
            <span className="text-amber-600 bg-amber-50 text-xs font-bold px-2 py-1 rounded mb-3 inline-block">امتحان متاح</span>
            <h4 className="font-bold text-gray-900 mb-1">امتحان الوحدة الأولى (شامل مقالي وموضوعي)</h4>
            <p className="text-sm text-gray-500">لديك امتحان جديد ينتظر حله!</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
            <FileText size={24} />
          </div>
        </div>

      </div>

    </div>
  );
}
