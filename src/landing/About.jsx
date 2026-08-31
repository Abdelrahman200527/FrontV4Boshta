import React from "react";
import {
  CheckCircle2,
  GraduationCap,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import AboutPhoto from "../assets/AboutPhoto.jpg";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const About = () => {
  const features = [
    {
      Icon: GraduationCap,
      title: "تعليم تفاعلي",
      description: "محتوى تعليمي مصمم بعناية ليتناسب مع احتياجات الطلاب",
    },
    {
      Icon: Users,
      title: "متابعة مستمرة",
      description: "تواصل دائم بين الطلاب والمعلمين وأولياء الأمور",
    },
    {
      Icon: ShieldCheck,
      title: "خصوصية وأمان",
      description: "حماية كاملة لبيانات الطلاب والمعلمين",
    },
    {
      Icon: TrendingUp,
      title: "تتبع التقدم",
      description: "تقارير وتحليلات ذكية لمتابعة الأداء",
    },
  ];

  return (
    <motion.section variants={pageVariants} initial="hidden" animate="show" className="w-full bg-white py-16 sm:py-24 px-4 sm:px-6">
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 sm:gap-8 text-right order-2 lg:order-1">
          <span className="bg-[#d8e7c6] text-[#1a5d1a] text-sm sm:text-base font-bold py-2 px-6 rounded-xl w-fit font-lalezar">
            نبذة عن المنصة
          </span>

          <h2 className="text-lg sm:text-3xl lg:text-4xl font-extrabold leading-relaxed text-gray-900 font-lalezar">
            هي منصة تعليمية رقمية متكاملة، صُمِّمت خصيصاً للبيئة العربية
            لتربط الطلاب بمعلمهم في تجربة تفاعلية سلسة وآمنة.
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-8 sm:leading-10 jomhuria-regular">
            نؤمن بأن التعليم حق للجميع، لذلك بنينا بيئة ذكية تجمع المحتوى
            التعليمي، وأدوات التواصل، والتقييم، وتتبع التقدم في مكان واحد مع
            الحفاظ على أعلى معايير الخصوصية والأمان لجميع المستخدمين.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {features.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3 items-start hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300"
              >
                <div className="bg-[#d8e7c6] rounded-lg p-2 shrink-0">
                  <Icon size={20} className="text-[#1a5d1a]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-gray-900 font-lalezar">
                    {title}
                  </span>
                  <span className="text-xs text-gray-500 leading-relaxed">
                    {description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Checkmarks */}
          <div className="flex flex-wrap gap-4 mt-2">
            {["500+ كورس تفاعلي", "مساعد ذكاء اصطناعي", "شهادات معتمدة"].map(
              (item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2 size={18} className="text-green-500" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Image */}
        <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
          <img
            src={AboutPhoto}
            alt="تطبيق المنصة"
            className="w-80 sm:w-96 lg:w-112.5 max-w-full object-contain drop-shadow-xl rounded-2xl shadow-[5px_2px_0_#009966] border-2 border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100"
            loading="lazy"
          />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default About;
