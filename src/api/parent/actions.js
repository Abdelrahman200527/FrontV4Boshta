import { getParentData, getParentDataByToken } from "./services";
import { isDemoMode } from "../../utils/demo";

const isDemo = () => isDemoMode();

const nowMs = Date.now();
const oneDayMs = 86400000;

// Shared semester records
const attendanceHistory = [
  { id: 14, attendance_date: new Date(nowMs - oneDayMs * 1).toISOString(), day_name: "السبت", attendance_time: "16:30:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 13, attendance_date: new Date(nowMs - oneDayMs * 4).toISOString(), day_name: "الأربعاء", attendance_time: "16:28:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 12, attendance_date: new Date(nowMs - oneDayMs * 8).toISOString(), day_name: "السبت", attendance_time: "16:32:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 11, attendance_date: new Date(nowMs - oneDayMs * 11).toISOString(), day_name: "الأربعاء", attendance_time: null, method: "manual", status: "absent", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 10, attendance_date: new Date(nowMs - oneDayMs * 13).toISOString(), day_name: "الجمعة", attendance_time: "14:00:00", method: "manual", status: "present", is_makeup: true, group_name: "مجموعة التعويض المكثف" },
  { id: 9, attendance_date: new Date(nowMs - oneDayMs * 15).toISOString(), day_name: "السبت", attendance_time: "16:25:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 8, attendance_date: new Date(nowMs - oneDayMs * 18).toISOString(), day_name: "الأربعاء", attendance_time: "16:30:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 7, attendance_date: new Date(nowMs - oneDayMs * 22).toISOString(), day_name: "السبت", attendance_time: "16:31:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 6, attendance_date: new Date(nowMs - oneDayMs * 25).toISOString(), day_name: "الأربعاء", attendance_time: "16:29:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 5, attendance_date: new Date(nowMs - oneDayMs * 29).toISOString(), day_name: "السبت", attendance_time: "16:33:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 4, attendance_date: new Date(nowMs - oneDayMs * 32).toISOString(), day_name: "الأربعاء", attendance_time: "16:27:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 3, attendance_date: new Date(nowMs - oneDayMs * 36).toISOString(), day_name: "السبت", attendance_time: "16:30:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 2, attendance_date: new Date(nowMs - oneDayMs * 39).toISOString(), day_name: "الأربعاء", attendance_time: "16:35:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" },
  { id: 1, attendance_date: new Date(nowMs - oneDayMs * 43).toISOString(), day_name: "السبت", attendance_time: "16:20:00", method: "barcode", status: "present", is_makeup: false, group_name: "مجموعة السبت والأربعاء (السنتر)" }
];

const paymentHistory = [
  { id: 3, amount: 250, subscription_month: "2026-11", payment_date: new Date(nowMs - oneDayMs * 2).toISOString(), receipt_number: "REC-2026-11-042", notes: "سداد نقدي بمركز السنتر" },
  { id: 2, amount: 250, subscription_month: "2026-10", payment_date: new Date(nowMs - oneDayMs * 32).toISOString(), receipt_number: "REC-2026-10-118", notes: "سداد عبر فودافون كاش" },
  { id: 1, amount: 250, subscription_month: "2026-09", payment_date: new Date(nowMs - oneDayMs * 62).toISOString(), receipt_number: "REC-2026-09-009", notes: "سداد نقدي عند التسجيل" }
];

const allExams = [
  { id: 1, exam_type: "paper", title: "امتحان شهر أكتوبر الشامل بمركز السنتر", exam_date: new Date(nowMs - oneDayMs * 5).toISOString(), score: 48, full_mark: 50, percentage: 96, status: "passed", notes: "أداء متميز في التعبير والنحو" },
  { id: 2, exam_type: "online", title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)", exam_date: new Date(nowMs - oneDayMs * 7).toISOString(), score: 47, full_mark: 50, percentage: 94, status: "passed", notes: "حل ممتاز للأسئلة المقالية" },
  { id: 3, exam_type: "paper", title: "امتحان تجريبي ميداني: قواعد الإملاء والتعبير", exam_date: new Date(nowMs - oneDayMs * 12).toISOString(), score: 29, full_mark: 30, percentage: 97, status: "passed", notes: "إتقان كامل لقواعد همزات الوصل والقطع" },
  { id: 4, exam_type: "online", title: "اختبار سريع: إعراب اسم الفاعل والمفعول", exam_date: new Date(nowMs - oneDayMs * 16).toISOString(), score: 19, full_mark: 20, percentage: 95, status: "passed", notes: "إجابة نموذجية في وقت قياسي" },
  { id: 5, exam_type: "paper", title: "امتحان نصف شهر أكتوبر التحريري", exam_date: new Date(nowMs - oneDayMs * 20).toISOString(), score: 46, full_mark: 50, percentage: 92, status: "passed", notes: "جيد جداً، يُرجى مراجعة إعراب النائب عن الفاعل" },
  { id: 6, exam_type: "online", title: "اختبار البلاغة التراكمي: الصور البيانية والمحسنات", exam_date: new Date(nowMs - oneDayMs * 25).toISOString(), score: 28, full_mark: 30, percentage: 93, status: "passed", notes: "استخراج دقيق للمحسنات البديعية" },
  { id: 7, exam_type: "online", title: "اختبار القراءة المتحررة والأدب الكلاسيكي", exam_date: new Date(nowMs - oneDayMs * 30).toISOString(), score: 23, full_mark: 25, percentage: 92, status: "passed", notes: "فهم عميق لمقاصد النص" },
  { id: 8, exam_type: "paper", title: "امتحان شهر سبتمبر التقييمي الميداني", exam_date: new Date(nowMs - oneDayMs * 38).toISOString(), score: 45, full_mark: 50, percentage: 90, status: "passed", notes: "بداية قوية وموفقة" }
];

const assignments = [
  { id: 1, title: "واجب همزة الوصل والقطع وتدريبات بنك المعرفة", deadline: new Date(nowMs - oneDayMs * 2).toISOString(), score: 10, full_mark: 10, status: "graded" },
  { id: 2, title: "واجب إعراب المفعول المطلق والنائب عنه والشواهد", deadline: new Date(nowMs - oneDayMs * 6).toISOString(), score: 14, full_mark: 15, status: "graded" },
  { id: 3, title: "واجب القراءة المتحررة: قيم وتأملات في الفكر العربي", deadline: new Date(nowMs - oneDayMs * 1).toISOString(), score: null, full_mark: 20, status: "submitted" },
  { id: 4, title: "واجب المبتدأ والخبر ونواسخ الجملة الاسمية (كان وأخواتها)", deadline: new Date(nowMs + oneDayMs * 4).toISOString(), score: null, full_mark: 20, status: "pending" },
  { id: 5, title: "تطبيقات البلاغة: الاستعارة المكنية والتصريحية والتشبيه", deadline: new Date(nowMs + oneDayMs * 9).toISOString(), score: null, full_mark: 15, status: "pending" },
  { id: 6, title: "تدريب التعبير الوظيفي: كتابة البسط والتلخيص والتقرير", deadline: new Date(nowMs - oneDayMs * 25).toISOString(), score: 0, full_mark: 15, status: "overdue" }
];

const groupInfo = {
  name: "مجموعة السبت والأربعاء (السنتر)",
  days: "السبت والأربعاء",
  start_time: "16:30:00",
  end_time: "18:30:00",
  room: "القاعة الكبرى (مقر السنتر الرئيسي)",
  students_count: 45
};

const getDemoParentPayload = (selectedStudentId = 1) => {
  const isDeactivated = Number(selectedStudentId) === 2;

  const currentStudent = {
    id: isDeactivated ? 2 : 1,
    full_name: isDeactivated ? "محمد محمود سالم (حساب غير مفعل)" : "أحمد محمود سالم (حساب مفعل)",
    barcode: "0011",
    grade_name: "الصف الثالث الثانوي",
    group_name: "مجموعة السبت والأربعاء (السنتر)",
    phone: "01012345678",
    parent_phone: "01098765432",
    profile_image: isDeactivated
      ? "https://ui-avatars.com/api/?name=أحمد+محمود&background=dc2626&color=fff&size=200"
      : "https://ui-avatars.com/api/?name=أحمد+محمود&background=1a5d1a&color=fff&size=200",
    is_active: !isDeactivated,
    deleted: 0,
    deactivation_reason: isDeactivated
      ? "تم إيقاف تفعيل حساب الطالب مؤقتاً لعدم سداد اشتراك شهر نوفمبر، يرجى مراجعة إدارة السنتر لتسوية المصروفات وإعادة فتح الحساب فوراً."
      : null
  };

  return {
    student: currentStudent,
    students: [
      {
        id: 1,
        full_name: "أحمد محمود سالم (حساب مفعل)",
        grade_name: "الصف الثالث الثانوي",
        is_active: true,
        deleted: 0,
        parent_token: "demo_active_token"
      },
      {
        id: 2,
        full_name: "محمد محمود سالم (حساب غير مفعل)",
        grade_name: "الصف الثالث الثانوي",
        is_active: false,
        deleted: 0,
        deactivation_reason: "تم إيقاف تفعيل حساب الطالب مؤقتاً لعدم سداد اشتراك شهر نوفمبر، يرجى مراجعة إدارة السنتر لتسوية المصروفات وإعادة فتح الحساب فوراً.",
        parent_token: "demo_inactive_token"
      }
    ],
    attendance: {
      attendance_percentage: 95,
      present_days: 19,
      absent_days: 1,
      total_days: 20
    },
    attendanceHistory,
    payments: {
      is_fully_paid: !isDeactivated,
      current_month: "2026-10",
      total_paid: isDeactivated ? 500 : 750,
      balance: isDeactivated ? 250 : 0
    },
    paymentHistory: isDeactivated ? paymentHistory.slice(1) : paymentHistory,
    allExams,
    assignments,
    groupInfo,
    overallStats: {
      total_paper_exams: 4,
      total_online_exams: 4,
      avg_score: 94
    }
  };
};

const fetchParentDashboard = async (parent_phone, student_id = null) => {
  if (isDemo()) {
    const targetId = student_id || (sessionStorage.getItem("parent_selected_student") === "2" ? 2 : 1);
    return {
      success: true,
      data: getDemoParentPayload(targetId)
    };
  }
  try {
    const data = await getParentData(parent_phone, student_id);
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "حدث خطأ في تحميل البيانات",
    };
  }
};

const fetchParentDashboardByToken = async (token) => {
  if (isDemo()) {
    const targetId = token === "demo_inactive_token" ? 2 : 1;
    return {
      success: true,
      data: getDemoParentPayload(targetId)
    };
  }
  try {
    const data = await getParentDataByToken(token);
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "حدث خطأ في تحميل البيانات",
    };
  }
};

export { fetchParentDashboard, fetchParentDashboardByToken };
