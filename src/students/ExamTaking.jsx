import { notifyError, notifySuccess } from "../lib/notify";
import {
  Clock,
  AlertCircle,
  Loader2,
  Send,
  ChevronRight,
  ChevronLeft,
  FileText,
  Monitor,
  CheckCircle2,
  Upload,
  Download,
  Eye,
} from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { previewFile, downloadFile } from "../utils/fileHandler";
import { useParams, useNavigate } from "react-router-dom";
import {
  startStudentExam,
  submitStudentExam,
  submitStudentAnswer,
  submitStudentEssayAnswer,
} from "../api/student/actions";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const ExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const autoSubmittedRef = useRef(false);
  const submittingRef = useRef(false);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId]);

  const loadExam = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await startStudentExam(examId);

      if (result.success) {
        const data = result.data;
        setExamData(data);
        setQuestions(data.questions || []);
        setAttemptInfo({
          attempt_id: data.attempt_id,
          exam_id: data.exam_id,
        });

        if (data.remaining_seconds !== undefined) {
          setTimeLeft(data.remaining_seconds);
        } else {
          const durationMinutes = data.duration_minutes || 60;
          setTimeLeft(durationMinutes * 60);
        }
      } else {
        setError(result.error || "فشل بدء الامتحان");
      }
    } catch (err) {
      console.error("Exam load error:", err);
      setError(err.message || "فشل تحميل الامتحان");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0 || loading || autoSubmittedRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, loading]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAutoSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const result = await submitStudentExam(attemptInfo?.attempt_id);

      if (result.success) {
        notifySuccess("انتهى الوقت! تم تسليم الامتحان تلقائياً");
        navigate("/student/exams", { replace: true });
      } else {
        notifyError(result.error || "فشل التسليم التلقائي");
        navigate("/student/exams", { replace: true });
      }
    } catch (error) {
      console.error("Auto submit error:", error);
      notifyError("فشل التسليم التلقائي");
      navigate("/student/exams", { replace: true });
    }
  };

  const handleSubmitExam = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      const result = await submitStudentExam(attemptInfo?.attempt_id);

      if (result.success) {
        notifySuccess("تم تسليم الامتحان بنجاح!");
        navigate("/student/exams", { replace: true });
      } else {
        submittingRef.current = false;
        notifyError(result.error || "فشل التسليم");
      }
    } catch (error) {
      console.error("Submit error:", error);
      submittingRef.current = false;
      notifyError(error.message || "فشل التسليم");
    } finally {
      setSubmitting(false);
    }
  };

  const selectAnswer = async (questionId, selectedOptionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected_option_id: selectedOptionId,
      },
    }));

    try {
      setSavingAnswer(true);
      const result = await submitStudentAnswer(
        attemptInfo?.exam_id,
        questionId,
        selectedOptionId,
      );

      if (result.success) {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: {
            selected_option_id: selectedOptionId,
            is_correct: result.data?.is_correct,
          },
        }));
      } else {
        notifyError(result.error || "فشل حفظ الإجابة");
      }
    } catch (error) {
      console.error("Save answer error:", error);
      notifyError("فشل حفظ الإجابة");
    } finally {
      setSavingAnswer(false);
    }
  };

  // Upload essay answer with loader
  const handleEssayUpload = async (questionId, file) => {
    if (uploadingFile) return;
    setUploadingFile(true);

    try {
      const result = await submitStudentEssayAnswer(
        attemptInfo?.exam_id,
        questionId,
        file,
      );

      if (result.success) {
        // Replace old answer with new one
        setAnswers((prev) => ({
          ...prev,
          [questionId]: {
            file_path: result.data?.file_path,
            uploaded: true,
          },
        }));
        notifySuccess("تم رفع الإجابة بنجاح");
      } else {
        notifyError(result.error || "فشل رفع الإجابة");
      }
    } catch (error) {
      console.error("Upload essay error:", error);
      notifyError("فشل رفع الإجابة");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key]?.selected_option_id || answers[key]?.file_path,
  ).length;

  const progressPercentage =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const currentQuestion = questions[currentIndex];

  // Handle file preview
  const handlePreviewFile = async (filePath) => {
    if (!filePath) return;
    const fullUrl = getFileUrl(filePath);
    await previewFile(fullUrl);
  };

  // Handle file download
  const handleDownloadFile = async (filePath) => {
    if (!filePath) return;
    const fullUrl = getFileUrl(filePath);
    await downloadFile(fullUrl);
  };

  // Build full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    const apiUrl = "https://backend.benb3n.cloud";
    return filePath.startsWith("http") ? filePath : `${apiUrl}/${filePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#009966]" size={28} />
          <span className="text-gray-500 text-sm">جاري تحميل الامتحان...</span>
        </div>
      </div>
    );
  }

  if (error && !examData) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        dir="rtl"
      >
        <div className="text-center p-6 max-w-md">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
          <p className="text-gray-700 font-bold text-sm sm:text-base mb-4">
            {error}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate("/student/exams")}
              className="px-4 py-2 bg-[#009966] text-white rounded-lg text-sm font-bold hover:bg-[#007a52] transition"
            >
              العودة للامتحانات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-screen bg-gray-50"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-blue-50 rounded-lg p-2 shrink-0">
                <Monitor className="text-blue-600" size={18} />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  {examData?.title || "الامتحان"}
                </h1>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {examData?.full_mark || 0} درجة | {questions.length} سؤال
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2 ${
                  timeLeft <= 60
                    ? "bg-red-50 text-red-600 animate-pulse"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                <Clock size={16} />
                {formatTime(timeLeft)}
              </div>

              <div className="text-xs sm:text-sm text-gray-600 font-bold">
                {answeredCount}/{questions.length}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
              className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={itemVariants}
        className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 flex-1 pb-20 md:pb-4"
      >
        <div className="flex gap-3 sm:gap-4">
          {/* Question Navigator - Desktop */}
          <div className="hidden md:block w-40 lg:w-48 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-3 sticky top-24">
              <h3 className="font-bold text-xs mb-2 text-gray-700">الأسئلة</h3>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, index) => {
                  const isAnswered =
                    answers[q.id]?.selected_option_id ||
                    answers[q.id]?.file_path;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`p-1.5 rounded text-xs font-bold transition-colors ${
                        isAnswered
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      } ${currentIndex === index ? "ring-2 ring-blue-500" : ""}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-col gap-1 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  مجاب: {answeredCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  غير مجاب: {questions.length - answeredCount}
                </span>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    سؤال {currentIndex + 1} من {questions.length}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                    <FileText size={11} />
                    {currentQuestion?.type === "mcq"
                      ? "اختيار من متعدد"
                      : currentQuestion?.type === "true_false"
                        ? "صح / خطأ"
                        : "مقالي"}
                  </span>
                </div>

                {/* Question File Actions */}
                {currentQuestion?.file_path && (
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        handlePreviewFile(
                          currentQuestion.file_url || currentQuestion.file_path,
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                    >
                      <Eye size={14} />
                      معاينة الملف
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadFile(
                          currentQuestion.file_url || currentQuestion.file_path,
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition"
                    >
                      <Download size={14} />
                      تحميل الملف
                    </button>
                  </div>
                )}

                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 leading-relaxed">
                  {currentQuestion?.question_text}
                </h2>

                {/* MCQ/True-False Options */}
                {currentQuestion?.type !== "essay" && (
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {currentQuestion?.options?.map((opt, optIndex) => {
                      const isSelected =
                        answers[currentQuestion.id]?.selected_option_id ===
                        opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() =>
                            selectAnswer(currentQuestion.id, opt.id)
                          }
                          className={`p-3 sm:p-4 rounded-xl text-right border-2 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 sm:gap-3">
                            <span
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
                                isSelected
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="text-xs sm:text-sm font-medium">
                              {opt.option_text}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Essay Upload with Loader */}
                {currentQuestion?.type === "essay" && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center">
                    {uploadingFile ? (
                      <div className="flex flex-col items-center gap-3 py-4">
                        <Loader2
                          size={36}
                          className="animate-spin text-[#009966]"
                        />
                        <p className="text-xs sm:text-sm text-gray-600 font-bold">
                          جاري رفع الملف...
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload
                          size={32}
                          className="mx-auto text-gray-400 mb-3"
                        />
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          ارفع ملف إجابتك (PDF أو صورة)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          id={`essay-upload-${currentQuestion.id}`}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleEssayUpload(currentQuestion.id, file);
                            }
                          }}
                        />
                        <label
                          htmlFor={`essay-upload-${currentQuestion.id}`}
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition"
                        >
                          {answers[currentQuestion.id]?.uploaded
                            ? "استبدال الملف"
                            : "اختيار ملف"}
                        </label>
                        {answers[currentQuestion.id]?.uploaded && (
                          <p className="text-green-600 text-xs mt-3 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} />
                            تم رفع الإجابة بنجاح
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className="flex-1 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <ChevronRight size={14} />
                    السابق
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={goToNext}
                      className="flex-1 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      التالي
                      <ChevronLeft size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={savingAnswer || uploadingFile}
                      className="flex-1 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50"
                    >
                      <Send size={14} />
                      تسليم الامتحان
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Mobile Question Navigator */}
      <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-20 p-2 pb-safe">
        <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
          {questions.map((q, index) => {
            const isAnswered =
              answers[q.id]?.selected_option_id || answers[q.id]?.file_path;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(index)}
                className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  isAnswered
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                } ${currentIndex === index ? "ring-2 ring-blue-500" : ""}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-4 sm:p-6"
            >
              <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">
                تأكيد التسليم
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                أنت على وشك تسليم الامتحان. تأكد من إجاباتك.
                {answeredCount < questions.length && (
                  <span className="block mt-2 text-orange-500 font-bold items-center gap-1">
                    <AlertCircle size={14} />
                    تنبيه: لديك {questions.length - answeredCount} سؤال غير مجاب
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
                >
                  رجوع
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-green-700 transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      جاري التسليم...
                    </>
                  ) : (
                    "تأكيد التسليم"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default ExamTaking;
