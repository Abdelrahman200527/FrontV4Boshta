import React from "react";
import {
  CheckCircle2,
  Sparkles,
  Lock,
  Zap,
  HeartHandshake,
} from "lucide-react";
import AboutPhoto from "../assets/AboutPhoto.jpg";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const About = () => {
  const features = [
    {
      Icon: Sparkles,
      title: "كارت طالب وبصمة براندك",
      description: "كارت مطبوع بصورتك واسمك والباركود.. دعاية متنقلة بتلف المدارس وتزود شهرتك",
    },
    {
      Icon: Lock,
      title: "فيديوهاتك في أمان تام",
      description: "حماية قصوى لمحتواك وشروحاتك؛ الطالب يشوف لكن مستحيل يقدر يحمل الفيديو أو ينزله",
    },
    {
      Icon: Zap,
      title: "إدارة السنتر في ثواني",
      description: "حضور بالباركود، رفع درجات إكسيل بلمسة، وحسابات مظبوطة بالمليم تريّح المساعدين",
    },
    {
      Icon: HeartHandshake,
      title: "متابعة ولي الأمر لايف",
      description: "أي غياب أو تقصير بيظهر لولي الأمر برقم موبايله فوراً بدون ما تحتاج ترن عليه",
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
            منصتك التعليمية المتكاملة.. هيبتك وبراندك وإدارتك في مكان واحد يريّح بالك ويضاعف دخلك!
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-8 sm:leading-10 jomhuria-regular">
            صممنا المنصة للمدرس الشاطر اللي عايز يريّح دماغه من الصداع الإداري ولخبطة الدفاتر. ندمجلك إدارة السنتر الحقيقي مع التعليم الأونلاين بأعلى معايير السرعة والأمان؛ عشان تتفرغ لطلابك وتكبر اسمك وتوصل لآلاف الطلاب في كل محافظات مصر.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {features.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3 items-start hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-300"
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
            {[
              "كارت طالب مخصص بصورة المستر",
              "حماية مشددة تمنع تحميل الفيديوهات",
              "حضور فوري بالباركود",
              "متابعة لحظية لولي الأمر برقم الموبايل",
            ].map(
              (item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 text-sm text-gray-700 font-medium"
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
