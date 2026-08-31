import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";
import { fetchExamReview } from "../api/student/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const ExamReview = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReview();
  }, [attemptId]);

  const loadReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExamReview(attemptId);
      if (result.success) {
        setReview(result.data);
      } else {
        setError(result.error || "فشل تحميل المراجعة");
      }
    } catch (err) {
      setError(err.message || "فشل تحميل المراجعة");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#009966]" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-gray-700 font-bold">{error}</p>
        <button
          onClick={() => navigate("/student/exams")}
          className="px-4 py-2 bg-[#009966] text-white rounded-lg"
        >
          العودة للامتحانات
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-gray-50 p-3 sm:p-5"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="max-w-3xl mx-auto flex flex-col gap-4"
      >
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                مراجعة الامتحان
              </h1>
              <span className="text-sm text-gray-500">{review.exam_title}</span>
            </div>
            <div className="text-center">
              <span
                className={`text-3xl font-bold block ${
                  review.percentage >= 50 ? "text-green-600" : "text-red-600"
                }`}
              >
                {review.score}/{review.full_mark}
              </span>
              <span className="text-xs text-gray-500">
                {review.percentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <span className="text-xl font-bold text-green-600 block">
                {review.correct_answers}
              </span>
              <span className="text-xs text-gray-500">صحيحة</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-red-600 block">
                {review.wrong_answers}
              </span>
              <span className="text-xs text-gray-500">خاطئة</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-gray-400 block">
                {review.unanswered_questions}
              </span>
              <span className="text-xs text-gray-500">بدون إجابة</span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-3">
          {review.questions.map((question, index) => (
            <div
              key={question.question_id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500">
                    سؤال {index + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    {question.question_type === "mcq"
                      ? "اختيار من متعدد"
                      : question.question_type === "true_false"
                        ? "صح / خطأ"
                        : "مقالي"}
                  </span>
                </div>
                {question.is_correct === 1 && (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
                {question.is_correct === 0 && (
                  <XCircle className="text-red-500" size={20} />
                )}
                {question.is_correct === null && (
                  <span className="text-xs text-gray-400">بدون إجابة</span>
                )}
              </div>

              <p className="text-sm font-bold text-gray-900 mb-3">
                {question.question_text}
              </p>

              {question.question_type !== "essay" && question.options && (
                <div className="flex flex-col gap-2">
                  {question.options.map((option) => (
                    <div
                      key={option.option_id}
                      className={`p-3 rounded-lg text-sm flex items-center justify-between border ${
                        option.is_correct
                          ? "bg-green-50 border-green-200"
                          : option.is_selected && !option.is_correct
                            ? "bg-red-50 border-red-200"
                            : "border-gray-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {option.is_correct && (
                          <CheckCircle2 className="text-green-500" size={16} />
                        )}
                        {option.is_selected && !option.is_correct && (
                          <XCircle className="text-red-500" size={16} />
                        )}
                        <span className="text-gray-700">
                          {option.option_text}
                        </span>
                      </span>
                      {option.is_selected && (
                        <span className="text-xs font-bold text-gray-500">
                          إجابتك
                        </span>
                      )}
                      {option.is_correct && (
                        <span className="text-xs font-bold text-green-600">
                          الإجابة الصحيحة
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {question.question_type === "essay" && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">
                    إجابتك:{" "}
                    {question.student_answer ? "تم التسليم" : "لم يتم التسليم"}
                  </span>
                  {question.student_answer && (
                    <a
                      href={`https://backend.benb3n.cloud/${question.student_answer}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-1"
                    >
                      <Download size={12} />
                      تحميل الإجابة
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/student/exams")}
          className="w-full py-3 rounded-xl bg-[#009966] text-white font-bold text-sm hover:bg-[#007a52] transition"
        >
          العودة للامتحانات
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ExamReview;