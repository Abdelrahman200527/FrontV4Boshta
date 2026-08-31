import { MoveLeft, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleStartFree = () => {
    navigate("/login?role=طالب");
    setMobileMenuOpen(false);
  };

  return (
    <motion.header variants={pageVariants} initial="hidden" animate="show" className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex gap-2 items-center text-[#1a5d1a] cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-xl sm:text-2xl font-mekalbaz whitespace-nowrap">
            أ / محمد بشتة
          </span>
          <img className="w-20 h-20" src={MrBoshta} />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
          <button
            onClick={handleLogin}
            className="text-[#1a5d1a] border border-border bg-[#EFF5E8] rounded-xl flex gap-2 items-center py-2 px-5 hover:bg-[#d6e7c0] transition-all duration-300 cursor-pointer"
          >
            <MoveLeft
              size={14}
            />
            <span className="text-sm font-semibold">تسجيل الدخول</span>
          </button>
          <button
            onClick={handleStartFree}
            className="text-white bg-[#1a5d1a] py-2 px-7 rounded-4xl hover:scale-[1.03] transition-all duration-300 cursor-pointer text-sm font-semibold"
          >
            ابدأ مجاناً
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          <button
            onClick={handleLogin}
            className="text-[#1a5d1a] border border-border bg-[#EFF5E8] rounded-xl flex gap-2 items-center justify-center py-3 hover:bg-[#d6e7c0] transition-all duration-300 cursor-pointer"
          >
            <MoveLeft
              size={14}
            />
            <span className="text-sm font-semibold">تسجيل الدخول</span>
          </button>
          <button
            onClick={handleStartFree}
            className="text-white bg-primary py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer text-sm font-semibold"
          >
            ابدأ مجاناً
          </button>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
