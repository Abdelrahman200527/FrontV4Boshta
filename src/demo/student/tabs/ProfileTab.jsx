import React from "react";
import { User, Mail, Phone, MapPin, Edit3, ShieldCheck } from "lucide-react";

export default function ProfileTab() {
  const profile = {
    full_name: "أحمد محمود سالم",
    barcode: "0011",
    grade_name: "الصف الثالث الثانوي",
    group_name: "مجموعة السبت والأربعاء",
    phone: "01012345678",
    parent_phone: "01098765432",
    join_date: "2026-09-01",
    profile_image: "https://ui-avatars.com/api/?name=أحمد+محمود&background=1a5d1a&color=fff&size=200"
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#009966] to-[#1a5d1a]"></div>
        
        <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden mt-8 md:mt-16 shrink-0 bg-white">
          <img src={profile.profile_image} alt={profile.full_name} className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 mt-4 md:mt-24 text-center md:text-right flex-1">
          <h2 className="text-3xl font-black text-gray-900 mb-2">{profile.full_name}</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="bg-blue-50 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full">{profile.grade_name}</span>
            <span className="bg-amber-50 text-amber-700 text-sm font-bold px-4 py-1.5 rounded-full">{profile.group_name}</span>
          </div>
        </div>
        
        <div className="relative z-10 bg-gray-50 border border-gray-200 p-4 rounded-2xl text-center min-w-[150px] mt-4 md:mt-24">
          <span className="block text-xs text-gray-500 font-bold mb-1">الباركود (كود التسجيل)</span>
          <span className="block text-2xl font-black tracking-widest text-gray-900">{profile.barcode}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          <User className="text-[#009966]" />
          المعلومات الشخصية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">رقم الهاتف (الطالب)</label>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Phone size={18} className="text-gray-400" />
              <span className="font-bold text-gray-900">{profile.phone}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">رقم هاتف ولي الأمر</label>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <ShieldCheck size={18} className="text-blue-500" />
              <span className="font-bold text-gray-900">{profile.parent_phone}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">تاريخ الانضمام للمنصة</label>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <CalendarCheck2 size={18} className="text-gray-400" />
              <span className="font-bold text-gray-900">{profile.join_date}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2">
            <Edit3 size={18} />
            طلب تعديل البيانات (تجريبي)
          </button>
        </div>
      </div>
    </div>
  );
}

// Shim
function CalendarCheck2({size, className}) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg> }
