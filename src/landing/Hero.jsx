import React from "react";
import { Play, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import students from "../assets/students.png";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <motion.section variants={pageVariants} initial="hidden" animate="show" className="w-full bg-linear-to-b from-[#D4B45C]/20 to-[#4C8C5E]/40 py-10 sm:py-16 px-4 sm:px-6">
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto flex flex-col items-center gap-8 sm:gap-12">
        {/* Top Badge */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
          <div className="text-white bg-[#1a5d1a] border border-white/20 py-2 px-6 rounded-full backdrop-blur-sm flex items-center gap-2">
            <Sparkles size={16} className="text-[#FFA900]" />
            <span className="text-sm">منصة أ / محمد بشتة</span>
          </div>

          <h1 className="font-bold text-3xl sm:text-5xl lg:text-6xl text-black leading-tight font-lalezar">
            تعّلم بذكاء, <span>أنجز أهدافك</span>
          </h1>

          <p className="text-black text-sm sm:text-lg max-w-2xl leading-relaxed jomhuria-regular">
            اتعلم مع أستاذك خطوة بخطوة، شرح مبسط، تدريبات وأسئلة تساعدك تفهم دروسك، وتابع مستواك لحد ما توصل للدرجة اللي بتتمناها.
          </p>

          <button
            onClick={() => navigate("/login?role=طالب")}
            className="mt-2 bg-[#1a5d1a] text-white px-8 py-3 rounded-xl font-bold hover:scale-[1.03] transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <Play size={18} />
            <span>ابدأ التعلم الآن</span>
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="w-full max-w-2xl bg-[#1a5d1a] border border-[#2F88FF]/30 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-16 backdrop-blur-sm">

          <div className="flex flex-col items-center gap-1 min-w-[80px] flex-1">
            <span className="text-[#FFA900] font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              +1000
            </span>
            <span className="text-white/70 text-[10px] xs:text-xs sm:text-sm text-center">
              طالب نشط
            </span>
          </div>

          <div className="w-px h-8 sm:h-10 bg-white/20"></div>

          <div className="flex flex-col items-center gap-1 min-w-[80px] flex-1">
            <span className="text-[#FFA900] font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              9.8/10
            </span>
            <span className="text-white/70 text-[10px] xs:text-xs sm:text-sm text-center">
              تقييم عام
            </span>
          </div>

          <div className="w-px h-8 sm:h-10 bg-white/20"></div>

          <div className="flex flex-col items-center gap-1 min-w-[80px] flex-1">
            <span className="text-[#FFA900] font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              24/7
            </span>
            <span className="text-white/70 text-[10px] xs:text-xs sm:text-sm text-center">
              متابعة مستمرة
            </span>
          </div>

        </div>

        {/* Hero Image */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-16 w-full max-w-5xl">
          <div className="flex flex-col gap-4 items-center lg:items-end text-center lg:text-right flex-1">
            <h2 className="font-bold text-2xl sm:text-4xl text-[#1a5d1a] leading-snug font-lalezar">
              منصة <span>أ / محمد بشتة</span>
            </h2>
            <p className="text-[#1a5d1a] font-medium text-sm sm:text-base leading-relaxed jomhuria-regular">
              شريك رحلتك التعليمية
              <br />
              مبنية بعقول الطلبة لتوفير كل الاحتياجات للتفوق
            </p>
          </div>

          <div className="flex-1 flex justify-center animate-[float_5s_ease-in-out_infinite]">
            <img
              className="w-64 sm:w-80 lg:w-96 h-auto object-contain drop-shadow-2xl"
              src={students}
              alt="منصة محمد بشتة التعليمية"
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
