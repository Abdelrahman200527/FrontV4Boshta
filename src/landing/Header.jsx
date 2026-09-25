import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Menu,
  X,
  GraduationCap,
  Users,
  Shield,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from "lucide-react";
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-xs" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex justify-between items-center">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-[#009966] group"
        >
          <img
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform"
            src={MrBoshta}
            alt="الأستاذ محمد بشتة"
          />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-mekalbaz text-[#009966] leading-none">
              أ / محمد بشتة
            </span>
            <span className="text-[10px] text-gray-500 font-semibold mt-0.5">
              خبير اللغة العربية
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-sm font-bold text-gray-600 hover:text-[#009966] transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-sm font-bold text-gray-600 hover:text-[#009966] transition-colors cursor-pointer"
          >
            عن المنصة
          </button>
          <button
            onClick={() => scrollToSection("roles")}
            className="text-sm font-bold text-gray-600 hover:text-[#009966] transition-colors cursor-pointer"
          >
            بوابات الدخول
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => navigate("/user/login")}
            className="text-gray-600 hover:text-[#009966] hover:bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold transition-all flex items-center gap-1 border border-gray-200"
            title="بوابة دخول المعلم والمساعدين"
          >
            <Shield size={14} className="text-[#009966]" />
            <span>بوابة الكادر</span>
          </button>

          <button
            onClick={() => navigate("/login?role=parent")}
            className="text-[#009966] bg-emerald-50 hover:bg-emerald-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all border border-emerald-200/60 flex items-center gap-1.5"
          >
            <Users size={14} />
            <span>بوابة ولي الأمر</span>
          </button>

          <button
            onClick={() => navigate("/login?role=student")}
            className="text-white bg-[#009966] hover:bg-[#007a52] rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#009966]/20 hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <GraduationCap size={16} />
            <span>دخول الطالب</span>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => navigate("/login?role=student")}
            className="text-white bg-[#009966] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <span>دخول</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 shadow-lg"
          >
            {/* Quick Links */}
            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-gray-100 text-center">
              <button
                onClick={() => scrollToSection("hero")}
                className="py-2 px-1 text-xs font-bold text-gray-600 hover:text-[#009966] bg-gray-50 rounded-lg"
              >
                الرئيسية
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="py-2 px-1 text-xs font-bold text-gray-600 hover:text-[#009966] bg-gray-50 rounded-lg"
              >
                عن المنصة
              </button>
              <button
                onClick={() => scrollToSection("roles")}
                className="py-2 px-1 text-xs font-bold text-gray-600 hover:text-[#009966] bg-gray-50 rounded-lg"
              >
                البوابات
              </button>
            </div>

            {/* Portals */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  navigate("/login?role=student");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-[#009966] font-bold text-sm border border-emerald-200"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} />
                  <span>دخول منصة الطالب</span>
                </div>
                <ArrowLeft size={16} />
              </button>

              <button
                onClick={() => {
                  navigate("/login?role=parent");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#009966]" />
                  <span>بوابة ولي الأمر</span>
                </div>
                <ArrowLeft size={16} />
              </button>

              <button
                onClick={() => {
                  navigate("/user/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-[#009966]" />
                  <span>بوابة المعلم والمساعدين</span>
                </div>
                <ArrowLeft size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
