import { CiLocationOn } from "react-icons/ci";
import { SiPerforce } from "react-icons/si";
import { CiStar } from "react-icons/ci";
import { TbMath } from "react-icons/tb";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, UserRoundPen, UsersRound } from "lucide-react";

// Assets
import theMister from "../assets/the-mister.png";
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import Background from "../assets/background.png";

// Auth Context
import { authenticate } from "../api/auth/actions";

const Badge = ({ title, subtitle, style, rotate = "0" }) => (
  <div className="absolute z-20" style={style}>
    <div
      className={`flex items-center justify-center bg-gray-50 rounded-xl shadow-md px-3 py-2.5`}
      style={{ minWidth: "170px", rotate: `${rotate}deg` }}
    >
      <div className="text-center">
        <p className="text-[14px] font-bold text-gray-800 leading-tight">
          {title}
        </p>
        <p className="text-[11px] text-gray-500 leading-tight">{subtitle}</p>
      </div>
    </div>
  </div>
);

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(searchParams.get("role") || "الطالب");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const roleMap = {
      الطالب: "student",
      المعلم: "teacher",
      المساعد: "assistant",
    };

    try {
      const result = await authenticate(roleMap[role], phone, password);

      if (result.success) {
        const selectedRole = roleMap[role];
        if (selectedRole === "student") {
          navigate("/student");
        } else if (selectedRole === "teacher") {
          navigate("/teacher");
        } else if (selectedRole === "assistant") {
          navigate("/assistant");
        }
      } else {
        setError(result.error || "حدث خطأ في تسجيل الدخول");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        className="h-screen overflow-hidden flex flex-col"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Header Desktop */}
        <header className="hidden lg:block shrink-0">
          <div className="mr-10 mt-6 flex flex-row items-center">
            <h2 className="font-mekalbaz text-[30px] text-[#1a5d1a]">
              أ / محمد بشته
            </h2>
            <img className="w-20 h-20" src={MrBoshta} alt="Mr Boshta" />
          </div>
        </header>

        {/* Header Mobile */}
        <div className="flex lg:hidden items-center justify-center gap-2 bg-[#1a5d1a] text-white py-2 px-4 shadow-lg">
          <span className="text-xl sm:text-2xl font-mekalbaz">
            أ / محمد بشته
          </span>
          <img className="w-20 h-20" src={MrBoshta} alt="Mr Boshta" />
        </div>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-7xl flex flex-row-reverse items-center justify-center gap-8 lg:gap-12 xl:gap-16">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-white/95 backdrop-blur-sm border-2 border-[#1a5d1a]/30 rounded-2xl px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14 w-full max-w-sm lg:max-w-md shrink-0 flex flex-col items-center gap-5 lg:gap-8 shadow-xl"
            >
              <div className="text-center">
                <h1 className="text-2xl sm:text-[30px] font-bold font-lalezar">
                  مرحبا بعودتك
                </h1>
                <span className="text-xs sm:text-[10px] text-gray-500 jomhuria-regular">
                  سجل الدخول للوصول الي لوحة التحكم
                </span>
              </div>

              {/* Role Selector */}
              <div className="flex items-center justify-center gap-4 sm:gap-10">
                {[
                  { label: "الطالب", Icon: User, color: "text-green-700" },
                  {
                    label: "المعلم",
                    Icon: UserRoundPen,
                    color: "text-blue-600",
                  },
                  {
                    label: "المساعد",
                    Icon: UsersRound,
                    color: "text-indigo-800",
                  },
                ].map(({ label, Icon, color }) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => {
                      setRole(label);
                      navigate(`/login?role=${label}`);
                    }}
                    className={`flex flex-col items-center gap-1 w-16 sm:w-20 p-2 rounded-lg transition ${
                      role === label
                        ? "bg-blue-50 ring-2 ring-[#4871C6]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={color} />
                    <span className="text-sm sm:text-base jomhuria-regular">
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm w-full">
                  {error}
                </div>
              )}

              {/* Phone */}
              <div className="flex flex-col items-start gap-2 w-full">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium jomhuria-regular"
                >
                  رقم الهاتف
                </label>
                <input
                  id="phone"
                  placeholder="ادخل رقم هاتفك"
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col items-start gap-2 w-full">
                <label
                  htmlFor="password"
                  className="text-sm font-medium jomhuria-regular"
                >
                  كلمة السر
                </label>
                <div className="w-full relative">
                  <input
                    id="password"
                    placeholder="ادخل كلمة السر"
                    className="w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
                    type={showPasswords ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1a5d1a] hover:bg-green-800 text-white py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              </button>

              <div>
                <span className="text-sm text-gray-500">
                  لانشاء حساب جديد يرجي التواصل مع مدير النظام
                </span>
              </div>
            </motion.form>

            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="hidden xl:flex flex-col items-center flex-1 max-w-2xl"
              dir="rtl"
            >
              <div
                className="relative w-full"
                style={{ maxWidth: "600px", height: "400px" }}
              >
                <div
                  className="absolute bg-[#1a5d1a] rounded-3xl"
                  style={{
                    width: "80%",
                    height: "290px",
                    bottom: "6%",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                />

                <motion.img
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  src={theMister}
                  alt="المعلم"
                  className="absolute object-contain object-bottom z-10"
                  style={{
                    width: "63%",
                    height: "95%",
                    bottom: "6%",
                    right: "20%",
                    transform: "translateX(-50%)",
                  }}
                />

                <Badge
                  title="اللغة العربية"
                  subtitle="لغة الضاد"
                  rotate="-2"
                  style={{ top: "70px", left: "0px" }}
                />
                <Badge
                  title="لغة القرآن"
                  subtitle="عربيةٌ أصيلة"
                  rotate="2"
                  style={{ top: "60px", right: "0px" }}
                />
                <Badge
                  title="لغتي هويتي"
                  subtitle="وفخري"
                  rotate="1"
                  style={{ bottom: "30px", left: "0px" }}
                />
                <Badge
                  title="الأدب أولًا"
                  subtitle="ثم العلم"
                  rotate="-1"
                  style={{ bottom: "30px", right: "0px" }}
                />
              </div>

              <span className="text-[#1a5d1a] font-mekalbaz text-[30px] text-center px-4 mt-4">
                وَالخَيْلُ تُعْلَمُ وَالفَوَارِسِ انْنِي شَيْخَ الحُرُوبِ
                وَكَهَّلَهَا وَفَتَاهَا
              </span>
            </motion.div>
          </div>
        </main>
      </section>
    </>
  );
};

export default Login;
