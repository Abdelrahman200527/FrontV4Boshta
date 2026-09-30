import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Camera, 
  Lock, 
  UserCircle,
  Hash,
  Phone,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { verifyStudentActivation, completeStudentActivation } from "../api/auth/services";

// Assets
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import Background from "../assets/background.png";
import { isValidEgyptianPhone, normalizePhone } from "../utils/validators";

const StudentActivation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Step 1 Data
  const [barcode, setBarcode] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  
  const scannerRef = React.useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Step 2 Data
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activationToken, setActivationToken] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);

  // Error mapping helper to provide friendly arabic messages without emojis
  const handleVerifyError = (err) => {
    const data = err?.data || err?.response?.data;
    if (
      data?.code === "ACCOUNT_ALREADY_ACTIVATED" || 
      data?.is_already_activated || 
      err?.status === 409
    ) {
      return data?.message || "تم تفعيل هذا الحساب من قبل. يرجى تسجيل الدخول مباشرة برقم هاتفك وكلمة المرور الخاصة بك.";
    }
    if (data?.message) {
      return data.message;
    }
    if (err?.message && !err.message.startsWith("HTTP")) {
      return err.message;
    }
    return "بيانات الاعتماد غير متطابقة. يرجى التأكد من مسح الباركود بشكل صحيح وكتابة رقم هاتف ولي الأمر المسجل في السنتر.";
  };

  const startScanner = async () => {
    try {
      setCameraError(false);
      setIsScanning(true);
      
      // Delay slightly to let React display the #reader container so it has dimensions
      setTimeout(async () => {
        try {
          if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
          }
          await scannerRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              setBarcode(decodedText);
              stopScanner();
            },
            (errorMessage) => {
              // Ignore
            }
          );
        } catch (err) {
          console.error("Camera Error Inner: ", err);
          setIsScanning(false);
          setCameraError(true);
        }
      }, 100);
    } catch (err) {
      console.error("Camera Error Outer: ", err);
      setIsScanning(false);
      setCameraError(true);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error(err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    
    const cleanBarcode = barcode ? barcode.trim() : "";
    if (!cleanBarcode) {
      setError("يرجى مسح باركود الكارت بالكاميرا أولاً.");
      return;
    }

    const cleanPhone = normalizePhone(parentPhone);
    if (!isValidEgyptianPhone(cleanPhone)) {
      setError("يرجى إدخال رقم هاتف ولي أمر صحيح (11 رقم يبدأ بـ 01).");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyStudentActivation(cleanBarcode, cleanPhone);
      if (res.success && res.activation_token) {
        setActivationToken(res.activation_token);
        setStudentInfo(res.student);
        setStep(2);
      } else {
        setError(res.message || "فشل التحقق من البيانات.");
      }
    } catch (err) {
      setError(handleVerifyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف أو أكثر.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة.");
      return;
    }

    setLoading(true);
    try {
      const res = await completeStudentActivation(activationToken, password, confirmPassword);
      if (res.success && res.token) {
        navigate("/student");
      } else {
        setError(res.message || "حدث خطأ أثناء تفعيل الحساب.");
      }
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || "حدث خطأ أثناء حفظ كلمة المرور.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-white transition-all shadow-sm"
        >
          <ArrowRight size={18} />
          العودة للرئيسية
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-[#1a5d1a] p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <img src={MrBoshta} alt="Boshta Logo" className="w-16 h-16 mx-auto mb-3 relative z-10 drop-shadow-md bg-white rounded-full p-1" />
          <h1 className="text-xl sm:text-2xl font-bold text-white relative z-10">
            تفعيل حساب الطالب
          </h1>
          <p className="text-emerald-100 mt-1 text-sm relative z-10">
            الخطوة {step} من 2
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{error}</p>
                  {error.includes("تم تفعيل هذا الحساب") && (
                    <button
                      onClick={() => navigate("/login")}
                      className="mt-2 bg-red-100 text-red-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors w-full"
                    >
                      الانتقال لصفحة تسجيل الدخول
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerify}
                className="space-y-5"
              >
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  قم بمسح الباركود الخاص بك باستخدام الكاميرا، ثم أدخل رقم هاتف ولي الأمر المسجل للتحقق من هويتك وتفعيل الحساب.
                </p>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <Hash size={16} className="text-[#1a5d1a]" />
                    مسح الباركود
                  </label>
                  
                  {!barcode ? (
                    <div className="rounded-2xl overflow-hidden border-2 border-dashed border-[#1a5d1a]/30 bg-slate-50 flex flex-col items-center justify-center relative min-h-[250px]">
                      
                      {/* Scanner Container - Always mounted but hidden when not scanning */}
                      <div className={`w-full h-full absolute inset-0 bg-black ${isScanning ? "block" : "hidden"}`}>
                        <div id="reader" className="w-full h-full"></div>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                          <button
                            type="button"
                            onClick={stopScanner}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 text-sm"
                          >
                            <X size={16} />
                            إلغاء المسح
                          </button>
                        </div>
                      </div>

                      {!isScanning && (
                        <div className="text-center p-6 flex flex-col items-center gap-4 z-10">
                          <div className="w-16 h-16 bg-emerald-100 text-[#1a5d1a] rounded-full flex items-center justify-center mb-2">
                            <Camera size={32} />
                          </div>
                          {cameraError && (
                            <p className="text-xs text-red-500 font-medium mb-1">
                              تعذر الوصول للكاميرا. يرجى التأكد من إعطاء الصلاحية.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={startScanner}
                            className="bg-[#1a5d1a] hover:bg-[#124112] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                          >
                            <Camera size={18} />
                            افتح الكاميرا لمسح الكارت
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-[#1a5d1a] rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-800">تم التقاط الباركود بنجاح</p>
                          <p className="text-xs text-emerald-600 font-mono mt-0.5" dir="ltr">
                            الباركود: <span className="font-bold text-lg text-[#1a5d1a] ml-1">{barcode}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setBarcode("");
                          startScanner();
                        }}
                        className="text-xs sm:text-sm text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-lg transition-colors shrink-0"
                      >
                        إعادة المسح بالكاميرا
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <Phone size={16} className="text-[#1a5d1a]" />
                    رقم هاتف ولي الأمر
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="رقم الهاتف المسجل بالسنتر"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a5d1a] focus:bg-white transition-all text-left"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a5d1a] hover:bg-[#124112] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "جاري التحقق..."
                  ) : (
                    <>
                      التحقق والمتابعة
                      <ArrowRight size={18} className="rotate-180" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleComplete}
                className="space-y-5"
              >
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-1">
                    <UserCircle size={18} />
                    أهلاً بك، {studentInfo?.full_name}
                  </h3>
                  <p className="text-sm text-emerald-600">
                    {studentInfo?.grade_name} • {studentInfo?.group_name}
                  </p>
                  <p className="text-xs text-emerald-500 mt-2">
                    يرجى تعيين كلمة المرور الخاصة بك لتفعيل الحساب نهائياً.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <Lock size={16} className="text-[#1a5d1a]" />
                    كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a5d1a] focus:bg-white transition-all text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#1a5d1a]" />
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a5d1a] focus:bg-white transition-all text-left"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a5d1a] hover:bg-[#124112] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? "جاري التفعيل..." : "تفعيل الحساب والدخول"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentActivation;
