import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Camera, 
  Lock, 
  UserCircle, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  X,
  CreditCard
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { BarcodeDetector, prepareZXingModule } from "barcode-detector/ponyfill";
import wasmUrl from "zxing-wasm/reader/zxing_reader.wasm?url";
import { verifyStudentActivation, completeStudentActivation } from "../api/auth/services";

// Assets
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import Background from "../assets/background.png";
import { isValidEgyptianPhone, normalizePhone } from "../utils/validators";

// Initialize ZXing WebAssembly C++ engine for high-speed & high-accuracy 1D barcode scanning on iOS & Android
try {
  prepareZXingModule({
    overrides: {
      locateFile: (path, prefix) => {
        if (path.endsWith(".wasm")) {
          return wasmUrl;
        }
        return prefix + path;
      },
    },
  });
  // Polyfill global BarcodeDetector with the WASM engine so Html5Qrcode uses it on all browsers (including iOS Safari)
  globalThis.BarcodeDetector = BarcodeDetector;
} catch (e) {
  console.warn("WASM BarcodeDetector init:", e);
}

const StudentActivation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Step 1 Data
  const [barcode, setBarcode] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);

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
      setCameraError(null);
      setIsScanning(true);
      
      // Delay slightly to let React display the #reader container so it has dimensions
      setTimeout(async () => {
        try {
          const readerEl = document.getElementById("reader");
          if (!readerEl) {
            setIsScanning(false);
            setCameraError("عنصر الكاميرا غير جاهز. يرجى المحاولة مرة أخرى.");
            return;
          }

          if (scannerRef.current) {
            try {
              if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
              }
              scannerRef.current.clear();
            } catch (_) {}
            scannerRef.current = null;
          }

          // Full barcode format support across iOS, Android, and PC
          const formatsToSupport = [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE,
          ];

          // Use BarcodeDetector powered by WebAssembly ZXing C++
          scannerRef.current = new Html5Qrcode("reader", {
            formatsToSupport,
            verbose: false,
            useBarCodeDetectorIfSupported: true,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
          });

          // Camera selection:
          // On iPhone multi-camera devices (iPhone 11 to 16 Pro), avoid the Ultra-Wide 0.5x fixed focus lens
          let cameraConfig = { facingMode: "environment" };
          try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
              const backCameras = cameras.filter((c) =>
                /back|rear|environment|خلف/i.test(c.label || "")
              );
              if (backCameras.length > 0) {
                const standardBackCam =
                  backCameras.find((c) => !/ultra|0\.5|macro|tele/i.test(c.label || "")) ||
                  backCameras[0];
                cameraConfig = standardBackCam.id;
              }
            }
          } catch (_) {
            cameraConfig = { facingMode: "environment" };
          }

          // Scan options:
          // Wide rectangular box matches horizontal 1D barcodes on cards
          const scanOptions = {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const width = Math.min(Math.floor(viewfinderWidth * 0.88), 340);
              const height = Math.min(Math.floor(viewfinderHeight * 0.44), 160);
              return { width, height };
            },
            aspectRatio: 1.333333,
            videoConstraints: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
            },
          };

          await scannerRef.current.start(
            cameraConfig,
            scanOptions,
            (decodedText) => {
              if (decodedText) {
                setBarcode(decodedText.trim());
                if (navigator.vibrate) {
                  try {
                    navigator.vibrate(100);
                  } catch (_) {}
                }
                stopScanner();
              }
            },
            () => {
              // ignore frame decode failures
            }
          );
        } catch (err) {
          console.error("Camera Error Inner: ", err);
          setIsScanning(false);
          const errStr = String(err?.message || err || "");
          if (/permission|denied|notallowed/i.test(errStr)) {
            setCameraError("تم رفض إذن الكاميرا. يرجى السماح بالوصول للكاميرا من إعدادات المتصفح لمسح الكارت.");
          } else {
            setCameraError("تعذر تشغيل الكاميرا المباشرة على هذا الجهاز. يرجى التأكد من توصيل الكاميرا وإعطاء الصلاحية.");
          }
        }
      }, 200);
    } catch (err) {
      console.error("Camera Error Outer: ", err);
      setIsScanning(false);
      setCameraError("تعذر فتح الكاميرا. يرجى التأكد من صلاحية الكاميرا بالمتصفح.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error(err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (_) {}
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
                  قم بمسح الباركود المطبوع على كارتك الخاص باستخدام الكاميرا، ثم أدخل رقم هاتف ولي الأمر المسجل للتحقق من هويتك وتفعيل الحساب.
                </p>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    <CreditCard size={16} className="text-[#1a5d1a]" />
                    مسح كارت الطالب
                  </label>

                  {/* Scanner Active State */}
                  {isScanning && (
                    <div className="rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black flex flex-col items-center justify-center relative min-h-[320px] shadow-lg animate-in fade-in duration-200">
                      <div id="reader" className="w-full min-h-[300px]"></div>
                      
                      {/* Visual Viewfinder Overlay for user guidance */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                        <div className="w-[88%] max-w-[320px] h-36 border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-500/5">
                          {/* Animated laser line */}
                          <div className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse top-1/2 -translate-y-1/2"></div>
                          {/* Corner indicators */}
                          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-400"></div>
                          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-400"></div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-400"></div>
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-400"></div>
                        </div>
                        <p className="mt-3 text-xs font-bold text-white bg-black/75 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-center max-w-xs shadow">
                          وجّه الخط الأحمر على باركود الكارت • مسافة 15-20 سم
                        </p>
                      </div>

                      <div className="absolute bottom-3 left-0 right-0 flex justify-center z-20">
                        <button
                          type="button"
                          onClick={stopScanner}
                          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                        >
                          <X size={16} />
                          إلغاء المسح
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Normal / Captured State */}
                  {!isScanning && (
                    <div className="space-y-3">
                      {barcode ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl gap-3">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-10 h-10 bg-emerald-100 text-[#1a5d1a] rounded-full flex items-center justify-center shrink-0">
                              <CheckCircle2 size={24} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-emerald-800">تم التقاط الباركود بنجاح</p>
                              <p className="text-sm text-emerald-950 font-mono font-bold mt-0.5 truncate" dir="ltr">
                                {barcode}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBarcode("");
                              startScanner();
                            }}
                            className="text-xs sm:text-sm text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-lg transition-colors cursor-pointer w-full sm:w-auto text-center"
                          >
                            إعادة المسح بالكاميرا
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-2xl border-2 border-dashed border-[#1a5d1a]/30 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                          <div className="w-16 h-16 bg-emerald-100 text-[#1a5d1a] rounded-full flex items-center justify-center mb-1">
                            <Camera size={32} />
                          </div>
                          <p className="text-sm font-semibold text-gray-800">
                            امسح باركود الكارت بالكاميرا لتفعيل الحساب
                          </p>
                          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                            أبرز كارت الطالب الخاص بك وقم بتوجيه الكاميرا مباشرة نحو الباركود
                          </p>
                          {cameraError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-600 max-w-sm leading-relaxed">
                              {cameraError}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={startScanner}
                            className="bg-[#1a5d1a] hover:bg-[#124112] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-102 mt-1"
                          >
                            <Camera size={18} />
                            افتح الكاميرا لمسح الكارت
                          </button>
                        </div>
                      )}
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
                    placeholder="رقم الهاتف المسجل بالسنتر (مثال: 01012345678)"
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
