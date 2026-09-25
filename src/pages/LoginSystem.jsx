import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Home,
  UserCheck,
} from "lucide-react";

// Assets
import theMister from "../assets/the-mister.png";
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import Background from "../assets/background.png";

// Auth Context
import { authenticate } from "../api/auth/actions";

const Badge = ({ title, subtitle, style, rotate = "0" }) => (
  <div className="absolute z-20 pointer-events-none select-none" style={style}>
    <div
      className="flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 px-3.5 py-2"
      style={{ minWidth: "160px", transform: `rotate(${rotate}deg)` }}
    >
      <div className="text-center">
        <p className="text-[13px] font-bold text-gray-800 leading-tight">
          {title}
        </p>
        <p className="text-[10px] text-[#009966] font-semibold leading-tight mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  </div>
);

const normalizeStaffRole = (raw) => {
  if (!raw) return "assistant";
  const str = String(raw).trim().toLowerCase();
  if (str === "teacher" || str === "معلم" || str === "المعلم") return "teacher";
  return "assistant";
};

const LoginSystem = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(() =>
    normalizeStaffRole(searchParams.get("role"))
  );
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const paramRole = searchParams.get("role");
    if (paramRole) {
      setRole(normalizeStaffRole(paramRole));
    }
  }, [searchParams]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError(null);
    setSearchParams({ role: newRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = (phone || "").trim();
    if (!cleanPhone) {
      setError("برجاء إدخال رقم الهاتف");
      return;
    }
    if (!password) {
      setError("برجاء إدخال كلمة السر");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authenticate(role, cleanPhone, password);

      if (result.success) {
        // Redirect according to authenticated user's role from response or selected role
        const userRole = result.data?.user?.role || role;
        if (userRole === "teacher") {
          navigate("/teacher", { replace: true });
        } else {
          navigate("/assistant", { replace: true });
        }
      } else {
        setError(result.error || "بيانات الدخول غير صحيحة، يرجى مراجعة الإدارة");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full flex flex-col justify-between relative bg-cover bg-center bg-no-repeat overflow-x-hidden selection:bg-[#009966]/20 selection:text-[#009966]"
      style={{
        backgroundImage: `url(${Background})`,
      }}
      dir="rtl"
    >
      {/* Background Soft Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/40 bg-white/40 backdrop-blur-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-[#009966] hover:opacity-90 transition-opacity"
        >
          <img
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm"
            src={MrBoshta}
            alt="Mr Boshta Logo"
          />
          <span className="font-mekalbaz text-xl sm:text-2xl text-[#009966]">
            أ / محمد بشتة
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#009966] bg-white/80 hover:bg-white rounded-xl border border-gray-200 transition-all shadow-xs"
            title="بوابة دخول الطلاب وأولياء الأمور"
          >
            <GraduationCap size={15} className="text-[#009966]" />
            <span className="hidden xs:inline">بوابة الطلاب</span>
            <span>وأولياء الأمور</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white/60 hover:bg-white rounded-xl border border-gray-200 transition-all"
            title="الرجوع للرئيسية"
          >
            <Home size={15} />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="w-full max-w-6xl flex flex-col xl:flex-row-reverse items-center justify-center gap-8 lg:gap-14">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-9 shadow-2xl border border-gray-100 flex flex-col gap-5 sm:gap-6"
          >
            {/* Header / Titles */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#009966] rounded-full text-xs font-bold mb-2 border border-emerald-100">
                <ShieldCheck size={14} />
                <span>لوحة تحكم الكادر التعليمي والإداري</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-lalezar">
                تسجيل دخول الكادر
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                سجل الدخول لإدارة الحصص، رصد الحضور، والامتحانات
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-gray-100 rounded-2xl gap-1.5 border border-gray-200/70">
              <button
                type="button"
                onClick={() => handleRoleChange("assistant")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  role === "assistant"
                    ? "bg-[#009966] text-white shadow-md shadow-[#009966]/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <UserCheck size={16} />
                <span>المساعدين</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("teacher")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  role === "teacher"
                    ? "bg-[#009966] text-white shadow-md shadow-[#009966]/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <ShieldCheck size={16} />
                <span>المعلم</span>
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3.5 text-xs sm:text-sm flex items-start gap-2.5"
                >
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="staff-phone"
                  className="text-xs sm:text-sm font-bold text-gray-700"
                >
                  رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    id="staff-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="username"
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pr-10 pl-4 text-sm font-semibold text-gray-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                    dir="ltr"
                    required
                  />
                  <Phone
                    size={17}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="staff-password"
                  className="text-xs sm:text-sm font-bold text-gray-700"
                >
                  كلمة السر
                </label>
                <div className="relative">
                  <input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pr-10 pl-10 text-sm font-semibold text-gray-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                    dir="ltr"
                    required
                  />
                  <Lock
                    size={17}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors"
                    title={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[#009966] hover:bg-[#007a52] text-white py-3 sm:py-3.5 text-sm sm:text-base font-bold shadow-lg shadow-[#009966]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جاري التحقق والدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Switch to Student/Parent Portal */}
            <div className="border-t border-gray-100 pt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#009966] hover:underline"
              >
                <span>هل أنت طالب أو ولي أمر؟ انتقل لبوابة الطلاب</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Left Hero Graphic (Large Screens) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden xl:flex flex-col items-center flex-1 max-w-xl"
            dir="rtl"
          >
            <div
              className="relative w-full"
              style={{ maxWidth: "560px", height: "420px" }}
            >
              {/* Graphic Backdrop Box */}
              <div
                className="absolute bg-linear-to-b from-[#009966] to-[#004d33] rounded-3xl shadow-2xl"
                style={{
                  width: "82%",
                  height: "290px",
                  bottom: "6%",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />

              {/* Character Image */}
              <motion.img
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                src={theMister}
                alt="الأستاذ محمد بشتة"
                className="absolute object-contain object-bottom z-10 drop-shadow-2xl"
                style={{
                  width: "65%",
                  height: "96%",
                  bottom: "6%",
                  right: "20%",
                  transform: "translateX(-50%)",
                }}
              />

              {/* Floating Badges */}
              <Badge
                title="لوحة الإدارة"
                subtitle="إدارة المجموعات والطلاب"
                rotate="-2"
                style={{ top: "60px", left: "0px" }}
              />
              <Badge
                title="رصد الدرجات"
                subtitle="وتصدير التقارير الفورية"
                rotate="2"
                style={{ top: "50px", right: "0px" }}
              />
              <Badge
                title="تسجيل الحضور"
                subtitle="بمسح الباركود السريع"
                rotate="1"
                style={{ bottom: "25px", left: "0px" }}
              />
              <Badge
                title="متابعة مالية"
                subtitle="دقيقة للاشتراكات"
                rotate="-1"
                style={{ bottom: "25px", right: "0px" }}
              />
            </div>

            {/* Classical Arabic Quote */}
            <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl px-6 py-3.5 shadow-md mt-4 text-center max-w-lg">
              <span className="text-[#009966] font-mekalbaz text-xl sm:text-2xl leading-relaxed block">
                « وَالخَيْلُ تَعْلَمُ وَالفَوَارِسُ أَنَّنِي .. شَيْخُ الحُرُوبِ وَكَهْلُهَا وَفَتَاهَا »
              </span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="relative z-10 w-full text-center py-3 text-xs text-gray-500 border-t border-white/30 bg-white/30 backdrop-blur-xs">
        جميع الحقوق محفوظة © {new Date().getFullYear()} — منصة الأستاذ محمد بشتة للغة العربية
      </footer>
    </div>
  );
};

export default LoginSystem;
