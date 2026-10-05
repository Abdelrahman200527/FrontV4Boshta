/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  GraduationCap,
  Users,
  PlayCircle,
  Info,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Lock,
  Zap,
  Flame,
  ArrowLeft,
} from "lucide-react";
import { setCookie } from "../utils/cookies";

export default function DemoSelector() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("demos");

  const handleDemoLogin = (role) => {
    localStorage.setItem("is_demo", "true");
    localStorage.setItem("demo_role", role);

    const getDemoUserData = (demoRole) => {
      if (demoRole === "teacher") {
        return {
          id: 1,
          role: "teacher",
          full_name: "أ / محمد بشتة",
          phone: "01012345678",
          email: "boshta@benben.cloud",
          permissions: "center_management",
          subject: "اللغة العربية للثانوية العامة",
          profile_image:
            "https://ui-avatars.com/api/?name=محمد+بشتة&background=1a5d1a&color=fff&size=200",
        };
      }
      if (demoRole === "assistant") {
        return {
          id: 1,
          role: "assistant",
          full_name: "أ / أحمد طارق",
          phone: "01099887766",
          email: "ahmed.tarek@benben.cloud",
          permissions: "center_management",
          center_name: "سنتر النخبة التعليمي - القاهرة",
          profile_image:
            "https://ui-avatars.com/api/?name=أحمد+طارق&background=1a5d1a&color=fff&size=200",
        };
      }
      return {
        id: 999,
        role: demoRole,
        full_name: "مستخدم تجريبي",
        permissions: [
          "manage_students",
          "manage_exams",
          "manage_content",
          "view_reports",
        ],
        grade_name: demoRole === "student" ? "الصف الأول الثانوي" : undefined,
        group_name: demoRole === "student" ? "مجموعة تجريبية" : undefined,
      };
    };

    setCookie("auth_token", "demo_token_123", 1);
    setCookie("user_data", JSON.stringify(getDemoUserData(role)), 1);

    if (role === "student") navigate("/student");
    else if (role === "teacher") navigate("/teacher");
    else if (role === "assistant") navigate("/assistant");
    else if (role === "parent") {
      localStorage.setItem("phone", "01098765432");
      sessionStorage.removeItem("parent_selected_student");
      navigate("/parent");
    }
  };

  const roles = [
    {
      id: "student",
      title: "ديمو الطالب",
      desc: "شاهد كيف تظهر المنصة للطلاب (الكورسات، الامتحانات، الحصص اللايف، الواجبات).",
      icon: <GraduationCap size={40} />,
      color: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-500/50",
    },
    {
      id: "assistant",
      title: "ديمو المساعد (إدارة السنتر)",
      desc: "لوحة إدارة السنتر: إدارة الطلاب، تسجيل الحضور بالباركود، الامتحانات ورصد الدرجات، والمدفوعات.",
      icon: <Users size={40} />,
      color: "from-amber-500 to-amber-700",
      shadow: "shadow-amber-500/50",
    },
    {
      id: "teacher",
      title: "ديمو المدرس",
      desc: "التحكم الكامل في المحتوى العلمي، التقارير الشاملة، إضافة الامتحانات والحصص.",
      icon: <UserCheck size={40} />,
      color: "from-[#009966] to-[#1a5d1a]",
      shadow: "shadow-green-500/50",
    },
    {
      id: "parent",
      title: "ديمو ولي الأمر",
      desc: "متابعة غياب وحضور الأبناء، درجات الامتحانات، ومستوى التفاعل خطوة بخطوة.",
      icon: <HeartHandshake size={40} />,
      color: "from-purple-500 to-purple-700",
      shadow: "shadow-purple-500/50",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col items-center p-3.5 sm:p-6 overflow-x-hidden"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 mt-6 sm:mt-10 px-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-[#009966] rounded-full mb-3 sm:mb-4 shadow-sm border border-green-200">
          <PlayCircle size={36} className="sm:w-10 sm:h-10" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2 sm:mb-4 tracking-tight break-words">
          منصة <span className="text-[#009966]">BenBen</span> التعليمية
        </h1>
        <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          المنصة الأقوى والأكثر تكاملاً لإدارة السناتر والدروس الأونلاين. اكتشف
          التجربة الآن.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex w-full max-w-md items-center justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-12 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab("demos")}
          className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-base transition-all text-center cursor-pointer ${
            activeTab === "demos"
              ? "bg-[#009966] text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          التجربة الحية (Demo)
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-base transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-center cursor-pointer ${
            activeTab === "details"
              ? "bg-[#009966] text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Info size={16} className="shrink-0" />
          <span>عن المنصة ومميزاتها</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "demos" ? (
          <motion.div
            key="demos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-7xl"
          >
            {roles.map((role, idx) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleDemoLogin(role.id)}
                className={`bg-gradient-to-br ${role.color} rounded-3xl p-5 sm:p-6 text-white cursor-pointer transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 shadow-xl ${role.shadow} relative overflow-hidden group`}
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="flex flex-col h-full relative z-10">
                  <div className="bg-white/20 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 backdrop-blur-sm border border-white/10">
                    {role.icon}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{role.title}</h2>
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-grow font-medium">
                    {role.desc}
                  </p>

                  <div className="mt-auto flex items-center text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl w-fit transition-colors border border-white/10">
                    دخول وتجربة النظام
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-6xl flex flex-col gap-6 sm:gap-10 text-right px-1"
          >
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a5d1a] via-[#144714] to-[#0f380f] p-5 sm:p-8 md:p-12 text-white shadow-2xl border border-emerald-700/40">
              <div className="absolute top-0 left-0 -mt-8 -ml-8 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 -mb-8 -mr-8 w-64 h-64 bg-[#D4B45C]/15 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col gap-3 sm:gap-4 max-w-4xl">
                <div className="inline-flex items-center gap-2 bg-[#D4B45C]/20 border border-[#D4B45C]/40 text-[#f6d788] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold w-fit">
                  <Flame size={15} className="text-[#f6d788] shrink-0" />
                  <span className="truncate">السيستم اللي هيعملك هيبة ويكبّر اسمك ودخلك</span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight break-words">
                  مش مجرد منصة تعليمية.. <br />
                  <span className="text-[#D4B45C]">
                    دي إمبراطوريتك وبراندك الخاص
                  </span>{" "}
                  اللي هيريّح بالك ويضاعف أرباحك!
                </h2>

                <p className="text-white/85 text-sm sm:text-lg leading-relaxed font-medium mt-1 sm:mt-2">
                  لو زهقت من لخبطة الدفاتر، وتعب رصد الدرجات، ومكالمات أولياء
                  الأمور اللي مابتخلصش.. بنقدملك الحل اللي اتفصّل مخصوص على مقاس
                  المدرس الشاطر. إدارة سنترك في جيبك، وانطلاقة حقيقية للأونلاين
                  بدون أي وجع قلب!
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3 sm:pt-4">
                  <button
                    onClick={() => setActiveTab("demos")}
                    className="bg-[#D4B45C] hover:bg-[#e0c36b] text-gray-950 font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center gap-2 cursor-pointer text-xs sm:text-base"
                  >
                    <span>جرّب المنصة لايف دلوقتي</span>
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-[11px] sm:text-sm text-white/70 font-medium">
                    بدون أي خطوات تسجيل معقدة — ادخل وجرّب بنفسك!
                  </span>
                </div>
              </div>
            </div>

            {/* Impact Numbers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                <span className="text-3xl sm:text-4xl font-black text-[#009966] mb-1">
                  +200%
                </span>
                <span className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                  مضاعفة للدخل والشهرة
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  محتواك مش محبوس في السنتر.. هيوصل لآلاف الطلاب أونلاين في
                  محافظات مصر كلها
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                <span className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">
                  80%
                </span>
                <span className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                  توفير وقت ومجهود الإدارة
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  تسجيل حضور بالباركود ورفع درجات وشيتات إكسيل في أجزاء من
                  الثانية
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                <span className="text-3xl sm:text-4xl font-black text-purple-600 mb-1">
                  100%
                </span>
                <span className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                  راحة بال من اتصالات الأهالي
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  أي غياب أو تقصير بيظهر لولي الأمر لحظياً في صفحته بدون ما
                  تحتاج ترن عليه
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
                <span className="text-3xl sm:text-4xl font-black text-amber-600 mb-1">
                  0%
                </span>
                <span className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                  تحميل للفيديوهات على الأجهزة
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  فيديوهاتك مشفرة ومحمية بأقصى المعايير.. الطالب يشوف لكن ميقدرش
                  ينزلها أبداً
                </span>
              </div>
            </div>

            {/* The 4 Core Selling Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Card 1: Branding & Student Card */}
              <div className="bg-white rounded-3xl p-7 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#009966] flex items-center justify-center font-bold">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#009966] uppercase tracking-wider block">
                        هيبتك وبراندك الشخصي
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                        كارت الطالب بصورتك وعلى ذوقك.. اسمك هيلف المدارس!
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                    مش بنعملك مجرد حساب وخلاص؛ المنصة كلها بتتصمم وتتجهز على
                    ذوقك وهوية براندك وألوانك. والأهم من ده،{" "}
                    <span className="font-bold text-gray-900">
                      كارت الطالب (ID Card)
                    </span>{" "}
                    بيكون مطبوع عليه صورتك واسمك الكبير والباركود الخاص بيه.
                  </p>

                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mb-4">
                    <p className="text-xs sm:text-sm text-emerald-900 font-semibold leading-relaxed">
                      <strong>دعاية مجانية بتلف المحافظة:</strong> الطالب وهو
                      ماشي بالكارت في المدرسة والدروس فخور بيه، وده أحسن تسويق
                      مباشر ليك بيجيبلك طلاب جدد كل ترم بدون ما تدفع جنيه
                      إعلانات!
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600 shrink-0"
                      />
                      <span>
                        تسجيل الطلاب في المنصة فائق السهولة وسريع بكود وباركود
                        فوري.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600 shrink-0"
                      />
                      <span>
                        تصميم شيك وعصري يليق بمكانتك ويخلّي أولياء الأمور يشوفوك
                        في مستوى تاني خالص.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 2: Video Protection */}
              <div className="bg-white rounded-3xl p-7 border border-amber-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Lock size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                        أمان المحتوى العلمي
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                        فيديوهاتك في حرز حريز.. مجهودك مش هيتسرق!
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                    عارفين ومقدّرين إن شرحك وتعبك هو شقى عمرك ورأس مالك الحقيقي.
                    عشان كده بنسعى بأقصى تقنيات متاحة لحماية فيديوهاتك ومحتواك
                    من السرقة والتسريب.
                  </p>

                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 mb-4">
                    <p className="text-xs sm:text-sm text-amber-900 font-semibold leading-relaxed">
                      <strong>حماية كاملة من التنزيل:</strong> الطالب يقدر يفتح
                      الحصة ويتفرج عليها بجودة ممتازة، لكن{" "}
                      <strong>
                        مستحيل يقدر يحمل الفيديو أو ينزله على جهازه أو فلاشته
                        بأي طريقة أو برامج تنزيل
                      </strong>
                      . مجهودك هيفضل ملكك لوحدك في أمان تام.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-amber-600 shrink-0"
                      />
                      <span>
                        تقييد المشاهدة بحساب الطالب فقط للحفاظ على خصوصية المادة
                        العلمية.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-amber-600 shrink-0"
                      />
                      <span>
                        سيرفرات فائقة السرعة تضمن تجربة تشغيل سلسة بدون تقطيع.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 3: Center Management */}
              <div className="bg-white rounded-3xl p-7 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Zap size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                        إدارة السنتر والمساعدين
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                        إدارة السنتر في ثواني.. المساعد هيتنفس واللخبطة هتنتهي!
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                    مفيش طالب هيدخل ويقولك نسيت الكشف، ومفيش فلوس هتضيع. المساعد
                    في السنتر معاه سيستم صاروخي بيخليه ينجز شغل ساعات في دقائق
                    معدودة وبدون أي غلطة حسابية.
                  </p>

                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 mb-4">
                    <p className="text-xs sm:text-sm text-blue-900 font-semibold leading-relaxed">
                    <strong>حضور ودرجات في غمضة عين:</strong> تسجيل حضور
                      فوري بمسح الباركود من كاميرا الموبايل أو جهاز الباركود.
                      ورفع شيتات إكسيل للدرجات والامتحانات بلمسة زر واحدة بدون
                      تفريغ يدوي متعب.
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-blue-600 shrink-0"
                      />
                      <span>
                        حسابات مالية دقيقة لكل حصة وشهرية واشتراكات الطلاب بدون
                        عجز.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-blue-600 shrink-0"
                      />
                      <span>
                        صلاحيات مخصصة لكل مساعد عشان تكون متابع ومتحكم في كل
                        شاردة وواردة.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 4: Parent Portal */}
              <div className="bg-white rounded-3xl p-7 border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <HeartHandshake size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">
                        راحة بالك من الاتصالات
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                        ولي الأمر متابع لايف.. مش محتاج ترفع سماعة التليفون!
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                    أكبر صداع بيواجه أي مدرس ومساعدينه هو مكالمات الأهالي: 'ابني
                    جه الحصة؟ امتحانه درجته كام؟'. مع منصتنا، أنت مش محتاج تتصل
                    بحد أو تقعد تبعت رسايل يدوية!
                  </p>

                  <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 mb-4">
                    <p className="text-xs sm:text-sm text-purple-900 font-semibold leading-relaxed">
                      <strong>صفحة خاصة لولي الأمر برقم موبايله:</strong> أي
                      تقصير من الطالب (غياب، تأخير، درجات نازلة، واجب مش مسلمه)
                      بيترصد في السيستم فوراً. ولي الأمر بيكتب رقم تليفونه ويدخل
                      يشوف كشف حساب ابنه كامل لحظة بلحظة، وده بيخلق هيبة وثقة
                      عمياء في شغلك!
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-purple-600 shrink-0"
                      />
                      <span>
                        شفافية تامة تفرّح ولي الأمر وتريّح بالك ومساعدينك من
                        مئات المكالمات.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2
                        size={16}
                        className="text-purple-600 shrink-0"
                      />
                      <span>
                        دخول برقم الموبايل فقط بدون تعقيدات أو نسيان كلمات مرور.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Online Expansion Banner */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-950 text-white rounded-3xl p-8 md:p-10 border border-gray-700 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex flex-col gap-3 max-w-2xl">
                <span className="bg-[#D4B45C] text-gray-950 text-xs font-black px-3 py-1 rounded-lg w-fit">
                  فرصة نمو غير محدودة
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  ليه تفضل محبوس في جدران السنتر، لما ممكن طلاب مصر كلها يبقوا
                  طلابك؟
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  المنصة مش بس لسنترك؛ دي بتديك بيئة أونلاين متكاملة ترفع عليها
                  حصصك وكورساتك، وبثوثك المباشرة (Google Meet)، وتعمل امتحانات
                  إلكترونية بتصحيح فوري. طالب أسوان يشترك معاك زي طالب إسكندرية،
                  وده معناه أرباح إضافية وشهرة واسعة في الجمهورية كلها بدون
                  التقيد بمكان السنتر وسعته!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={() => handleDemoLogin("teacher")}
                  className="bg-[#009966] hover:bg-[#00b377] text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <UserCheck size={18} />
                  <span>دخول ديمو المدرس</span>
                </button>
                <button
                  onClick={() => handleDemoLogin("assistant")}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <Users size={18} />
                  <span>دخول ديمو المساعد</span>
                </button>
              </div>
            </div>

            {/* How It Works in 3 Steps */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 text-center">
                رحلة الانطلاق أسهل مما تتخيل.. في 3 خطوات بس!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#1a5d1a] text-white flex items-center justify-center font-black text-xl mb-4">
                    1
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">
                    تجهيز المنصة والكروت
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    بنظبطلك المنصة بالكامل على هويتك وألوانك، ونطبع كروت الطلاب
                    الشيك اللي عليها صورتك والباركود.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#009966] text-white flex items-center justify-center font-black text-xl mb-4">
                    2
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">
                    تسجيل الطلاب في دقيقة
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    الطلاب بيسجلوا بسهولة فائقة، وكل طالب بيستلم كوده ويبدأ يشوف
                    واجباته ومحاضراته أونلاين وفي السنتر.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#D4B45C] text-gray-950 flex items-center justify-center font-black text-xl mb-4">
                    3
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">
                    إدارة على أعلى مستوى
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    حضور بالباركود، درجات بتترفع في ثواني، وأولياء الأمور
                    متابعين أول بأول وأنت مركز في تفوق طلابك!
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Final CTA */}
            <div className="text-center py-4 flex flex-col items-center gap-4">
              <h4 className="text-xl sm:text-2xl font-black text-gray-900">
                مستعد تاخد خطوة حقيقية تنقل شغلك لليفل تاني خالص؟
              </h4>
              <button
                onClick={() => setActiveTab("demos")}
                className="bg-[#009966] hover:bg-[#008055] text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl hover:scale-105 flex items-center gap-3 cursor-pointer text-base sm:text-lg"
              >
                <span>ابدأ تجربة الديمو الآن مجاناً</span>
                <ArrowLeft size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16 text-center text-gray-400 text-sm pb-8">
        جميع البيانات في النسخة التجريبية وهمية وتم وضعها لغرض الإيضاح فقط
        والتجربة الفعلية.
        <br />© 2026 BenBen Educational Platform.
      </div>
    </div>
  );
}
