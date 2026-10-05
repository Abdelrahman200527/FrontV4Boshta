import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, FileText, Video, BookOpen, 
  Calendar, User, LogOut, GraduationCap 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardTab from "./tabs/DashboardTab";
import ExamsTab from "./tabs/ExamsTab";
import HomeworkTab from "./tabs/HomeworkTab";
import LiveTab from "./tabs/LiveTab";
import CoursesTab from "./tabs/CoursesTab";
import ProfileTab from "./tabs/ProfileTab";

export default function StudentDemo() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const tabs = [
    { id: "dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { id: "exams", label: "الامتحانات", icon: FileText },
    { id: "homework", label: "الواجبات", icon: BookOpen },
    { id: "live", label: "حصص البث المباشر", icon: Video },
    { id: "courses", label: "الكورسات", icon: GraduationCap },
    { id: "profile", label: "الملف الشخصي", icon: User },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab setActiveTab={setActiveTab} />;
      case "exams": return <ExamsTab />;
      case "homework": return <HomeworkTab />;
      case "live": return <LiveTab />;
      case "courses": return <CoursesTab />;
      case "profile": return <ProfileTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm hidden md:flex sticky top-0 h-screen">
        <div className="p-6 text-center border-b border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-[#009966] rounded-full flex items-center justify-center mx-auto mb-3">
            <GraduationCap size={40} />
          </div>
          <h2 className="font-black text-xl text-gray-900">أحمد محمود سالم</h2>
          <p className="text-sm text-gray-500 font-bold">الصف الثالث الثانوي</p>
          <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">ديمو طالب</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? "bg-[#009966] text-white shadow-md" 
                    : "text-gray-600 hover:bg-green-50 hover:text-[#009966]"
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => navigate("/demo")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition"
          >
            <LogOut size={18} />
            خروج من الديمو
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-screen pb-20 md:pb-0">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center justify-between">
          <h1 className="font-black text-lg text-[#009966]">BenBen (طالب)</h1>
          <button onClick={() => navigate("/demo")} className="text-red-500 p-2">
            <LogOut size={20} />
          </button>
        </header>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around p-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {tabs.slice(0, 5).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? "text-[#009966]" : "text-gray-400"}`}
              >
                <Icon size={24} className={isActive ? "fill-green-100" : ""} />
                <span className="text-[10px] font-bold mt-1">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content area */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
