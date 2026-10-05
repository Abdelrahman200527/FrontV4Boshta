import * as teacherServices from "./services";
import config from "../../config";
import { downloadFile } from "../../utils/fileHandler";

import { isDemoMode } from "../../utils/demo";

const { apiUrl } = config;
const isDemo = () => isDemoMode();

const extractArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.playlists)) return res.playlists;
  if (Array.isArray(res?.videos)) return res.videos;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.playlists)) return res.data.playlists;
  if (Array.isArray(res?.data?.videos)) return res.data.videos;
  if (res && typeof res === "object") {
    const vals = Object.values(res).filter(v => v && typeof v === "object" && (v.id || v.video_id || v.playlist_id || v.title));
    if (vals.length > 0) return vals;
  }
  return [];
};

// ============================================================
// COMPREHENSIVE TEACHER DEMO DATA (50 STUDENTS - FULL SEMESTER)
// ============================================================

const nowMs = Date.now();
const oneDayMs = 86400000;

const STUDENT_NAMES = [
  "أحمد محمود سالم", "عمر خالد إبراهيم", "مريم مصطفى الشناوي", "يوسف كريم عبد الرحمن",
  "فاطمة طارق حسن", "علي حسام الدين المنشاوي", "سارة نبيل عبد العظيم", "محمد وائل بسيوني",
  "نورهان أشرف القاضي", "إبراهيم محمود الدسوقي", "سلمى هاني مراد", "حازم أيمن زهران",
  "روان مدحت الجيار", "عبد الرحمن سامح العوضي", "هاجر كمال البنداري", "كريم أشرف العسال",
  "آية حسام غنيم", "مصطفى خالد الهواري", "منة الله طارق عفيفي", "زياد أسامة الفقي",
  "شروق وليد الشربيني", "بلال عادل النجار", "ياسمين محمد الصاوي", "أحمد عماد الجوهري",
  "خديجة ياسر رضوان", "عمرو شريف الباز", "ميادة عصام السروي", "طارق محمود الغزالي",
  "ندى سعيد الطوخي", "حسام حسن البشبيشي", "دنيا مجدي الديب", "أنس إيهاب البنا",
  "رضوى هشام سويلم", "مالك حسام عبد ربه", "تقى سامي البيلي", "معاذ تامر العريان",
  "إيمان رمزي العطار", "حمزة أشرف العبد", "فرح علاء الدين قاسم", "يحيى شريف المراكبي",
  "جنى وليد شلبي", "باسل ممدوح الصياد", "ميرنا أسامة درويش", "سيف الدين علاء الغنام",
  "شهد عاطف الفحام", "مروان أحمد البغدادي", "ريم عماد العشري", "عبد الله طه شحاتة",
  "ملك حسني المغربي", "جاسر أيمن كساب"
];

const MOCK_GRADES = [
  { id: 3, name: "الصف الثالث الثانوي", groups_count: 3, students_count: 35 },
  { id: 2, name: "الصف الثاني الثانوي", groups_count: 2, students_count: 10 },
  { id: 1, name: "الصف الأول الثانوي", groups_count: 1, students_count: 5 },
];

const MOCK_GROUPS = [
  { id: 1, grade_id: 3, name: "مجموعة السبت والأربعاء (السنتر)", grade_name: "الصف الثالث الثانوي", days: "السبت والأربعاء", start_time: "16:30:00", end_time: "18:30:00", room: "القاعة الكبرى", students_count: 20 },
  { id: 2, grade_id: 3, name: "مجموعة الأحد والثلاثاء (السنتر)", grade_name: "الصف الثالث الثانوي", days: "الأحد والثلاثاء", start_time: "17:00:00", end_time: "19:00:00", room: "القاعة 2", students_count: 10 },
  { id: 3, grade_id: 3, name: "مجموعة الأونلاين المكثفة", grade_name: "الصف الثالث الثانوي", days: "الجمعة", start_time: "19:00:00", end_time: "21:00:00", room: "بث مباشر", students_count: 5 },
  { id: 4, grade_id: 2, name: "مجموعة الخميس (السنتر)", grade_name: "الصف الثاني الثانوي", days: "الخميس", start_time: "15:00:00", end_time: "17:00:00", room: "القاعة 1", students_count: 10 },
  { id: 5, grade_id: 1, name: "مجموعة الأونلاين المسائية", grade_name: "الصف الأول الثانوي", days: "السبت", start_time: "20:00:00", end_time: "22:00:00", room: "بث مباشر", students_count: 5 },
];

// Generate 50 realistic students
const MOCK_50_STUDENTS = STUDENT_NAMES.map((name, i) => {
  const id = i + 1;
  const barcode = String(10 + id).padStart(4, "0");
  let grade_id = 3;
  let grade_name = "الصف الثالث الثانوي";
  let group_id = 1;
  let group_name = "مجموعة السبت والأربعاء (السنتر)";

  if (i >= 35 && i < 45) {
    grade_id = 2;
    grade_name = "الصف الثاني الثانوي";
    group_id = 4;
    group_name = "مجموعة الخميس (السنتر)";
  } else if (i >= 45) {
    grade_id = 1;
    grade_name = "الصف الأول الثانوي";
    group_id = 5;
    group_name = "مجموعة الأونلاين المسائية";
  } else if (i >= 20 && i < 30) {
    group_id = 2;
    group_name = "مجموعة الأحد والثلاثاء (السنتر)";
  } else if (i >= 30 && i < 35) {
    group_id = 3;
    group_name = "مجموعة الأونلاين المكثفة";
  }

  // First 46 students paid, last 4 unpaid
  const isPaid = i < 46;
  // 47 active, 3 deactivated to demonstrate suspensions
  const isActive = i !== 5 && i !== 21 && i !== 48; 
  const deactivationReason = !isActive 
    ? (i === 5 
        ? "تم إيقاف تفعيل حساب الطالب مؤقتاً لتكرار الغياب بدون عذر مقبول لمدة 3 حصص متتالية."
        : "تم إيقاف تفعيل الحساب مؤقتاً لعدم سداد المصروفات وتجاوز الحد الأقصى للمهلة.")
    : null;

  const attendanceRate = 85 + (i % 15);
  const examsAvg = 80 + (i % 19);

  return {
    id,
    full_name: name,
    student_name: name,
    barcode,
    grade_id,
    grade_name,
    group_id,
    group_name,
    phone: `010${String(10000000 + i * 187).slice(0, 8)}`,
    parent_phone: `011${String(20000000 + i * 293).slice(0, 8)}`,
    is_active: isActive ? 1 : 0,
    status: isActive ? "active" : "inactive",
    deleted: 0,
    deactivation_reason: deactivationReason,
    attendance_rate: attendanceRate,
    exams_avg: examsAvg,
    payment_status: isPaid ? "paid" : "unpaid",
    paid_status: isPaid ? "paid" : "unpaid",
    is_paid: isPaid,
    required_amount: 250,
    paid_amount: isPaid ? 250 : 0,
    remaining_amount: isPaid ? 0 : 250,
    total_paid: isPaid ? 750 : 500,
    remaining_balance: isPaid ? 0 : 250,
    created_at: new Date(nowMs - oneDayMs * (60 + (i % 20))).toISOString(),
    profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.split(" ")[0])}&background=1a5d1a&color=fff&size=150`,
  };
});

// Assistants with strict integer is_active (1 = active, 0 = inactive)
const MOCK_ASSISTANTS = [
  {
    id: 1,
    full_name: "أ / أحمد طارق",
    phone: "01099887766",
    role: "مساعد أول ومسؤول السنتر",
    permissions: ["attendance", "grading", "payments"],
    groups: ["مجموعة السبت والأربعاء (السنتر)", "مجموعة الأحد والثلاثاء (السنتر)"],
    is_active: 1,
    email: "ahmed.tarek@benben.cloud",
    created_at: "2026-08-01T10:00:00Z"
  },
  {
    id: 2,
    full_name: "أ / سارة إبراهيم",
    phone: "01055443322",
    role: "مساعد متابعة أونلاين وبث مباشر",
    permissions: ["live_sessions", "homework", "chat"],
    groups: ["مجموعة الأونلاين المكثفة", "مجموعة الأونلاين المسائية"],
    is_active: 1,
    email: "sara.ibrahim@benben.cloud",
    created_at: "2026-08-05T10:00:00Z"
  },
  {
    id: 3,
    full_name: "أ / يوسف محمود",
    phone: "01033221100",
    role: "مساعد تصحيح الامتحانات الورقية",
    permissions: ["grading", "attendance"],
    groups: ["مجموعة الخميس (السنتر)"],
    is_active: 1,
    email: "youssef.mahmoud@benben.cloud",
    created_at: "2026-08-10T10:00:00Z"
  },
  {
    id: 4,
    full_name: "أ / ندى عبد الله",
    phone: "01077889911",
    role: "مساعد إداري وشؤون الاشتراكات",
    permissions: ["payments", "reports"],
    groups: ["كل المجموعات"],
    is_active: 1,
    email: "nada.abdallah@benben.cloud",
    created_at: "2026-08-15T10:00:00Z"
  },
];

// Activity log with realistic Arabic names and descriptions
const MOCK_ACTIVITY_LOG = [
  {
    id: 1,
    action: "create_payment",
    user_name: "أ / ندى عبد الله (مساعد مالي)",
    description: "سداد اشتراك شهر نوفمبر بقيمة 250 ج.م للطالب أحمد محمود سالم",
    entity_type: "payment",
    entity_name: "أحمد محمود سالم",
    details: "سداد اشتراك شهر نوفمبر بقيمة 250 ج.م نقداً",
    created_at: new Date(nowMs - 1000 * 60 * 15).toISOString(),
    user: { full_name: "أ / ندى عبد الله", role: "assistant" }
  },
  {
    id: 2,
    action: "start_session",
    user_name: "أ / أحمد طارق (مساعد أول)",
    description: "بدء جلسة الحضور وتسجيل 20 طالباً بالباركود لمجموعة السبت والأربعاء",
    entity_type: "attendance_session",
    entity_name: "مجموعة السبت والأربعاء (السنتر)",
    details: "بدء جلسة الحضور وتسجيل 20 طالباً بالباركود",
    created_at: new Date(nowMs - 1000 * 60 * 45).toISOString(),
    user: { full_name: "أ / أحمد طارق", role: "assistant" }
  },
  {
    id: 3,
    action: "create_online_exam",
    user_name: "أ / محمد بشتة (المدرس)",
    description: "نشر امتحان إلكتروني جديد: امتحان الوحدة الأولى الشامل للثانوية العامة",
    entity_type: "online_exam",
    entity_name: "امتحان الوحدة الأولى الشامل",
    details: "نشر امتحان إلكتروني جديد لطلاب الصف الثالث",
    created_at: new Date(nowMs - 1000 * 60 * 120).toISOString(),
    user: { full_name: "أ / محمد بشتة", role: "teacher" }
  },
  {
    id: 4,
    action: "update_student",
    user_name: "أ / أحمد طارق (مساعد أول)",
    description: "نقل الطالب عمر خالد إبراهيم إلى مجموعة السبت والأربعاء (السنتر)",
    entity_type: "student",
    entity_name: "عمر خالد إبراهيم",
    details: "تعديل المجموعة الدراسية إلى مجموعة السبت والأربعاء",
    created_at: new Date(nowMs - 1000 * 60 * 180).toISOString(),
    user: { full_name: "أ / أحمد طارق", role: "assistant" }
  },
  {
    id: 5,
    action: "create_payment",
    user_name: "أ / ندى عبد الله (مساعد مالي)",
    description: "تحصيل اشتراك شهر نوفمبر بقيمة 250 ج.م للطالبة مريم مصطفى الشناوي",
    entity_type: "payment",
    entity_name: "مريم مصطفى الشناوي",
    details: "سداد اشتراك شهر نوفمبر بقيمة 250 ج.م نقداً",
    created_at: new Date(nowMs - 1000 * 60 * 240).toISOString(),
    user: { full_name: "أ / ندى عبد الله", role: "assistant" }
  },
  {
    id: 6,
    action: "create_video",
    user_name: "أ / محمد بشتة (المدرس)",
    description: "رفع فيديو شرح جديد: همزة الوصل والقطع وأسرار الامتحان",
    entity_type: "video",
    entity_name: "همزة الوصل والقطع بالتفصيل",
    details: "رفع فيديو جديد ضمن كورس الوحدة الأولى",
    created_at: new Date(nowMs - oneDayMs * 1).toISOString(),
    user: { full_name: "أ / محمد بشتة", role: "teacher" }
  },
  {
    id: 7,
    action: "start_session",
    user_name: "أ / سارة إبراهيم (مساعد أونلاين)",
    description: "إطلاق البث المباشر لحصة المراجعة التفاعلية لمجموعة الأونلاين",
    entity_type: "live_session",
    entity_name: "مراجعة ليلة الامتحان: همزة الوصل والقطع",
    details: "بدء البث المباشر على Google Meet",
    created_at: new Date(nowMs - oneDayMs * 2).toISOString(),
    user: { full_name: "أ / سارة إبراهيم", role: "assistant" }
  },
  {
    id: 8,
    action: "update_student",
    user_name: "أ / يوسف محمود (مساعد تصحيح)",
    description: "رصد وتعديل درجات الامتحان الورقي التحريري لمجموعة الخميس",
    entity_type: "exam",
    entity_name: "امتحان نصف شهر أكتوبر التحريري",
    details: "رصد درجات 10 طلاب بنجاح",
    created_at: new Date(nowMs - oneDayMs * 3).toISOString(),
    user: { full_name: "أ / يوسف محمود", role: "assistant" }
  }
];

// Realistic Exams Dataset
const MOCK_EXAMS = [
  {
    id: 1,
    exam_type: "paper",
    title: "امتحان شهر أكتوبر الشامل بمركز السنتر",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 50,
    total_degree: 50,
    avg_score: 46.5,
    average_degree: 46.5,
    highest_degree: 50,
    lowest_degree: 39,
    students_count: 35,
    attendees_count: 35,
    exam_date: new Date(nowMs - oneDayMs * 5).toISOString(),
    status: "graded"
  },
  {
    id: 2,
    exam_type: "online",
    title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 50,
    total_degree: 50,
    duration_minutes: 45,
    start_at: new Date(nowMs - oneDayMs * 14).toISOString(),
    end_at: new Date(nowMs - oneDayMs * 7).toISOString(),
    exam_date: new Date(nowMs - oneDayMs * 14).toISOString(),
    avg_score: 45.2,
    average_degree: 45.2,
    highest_degree: 50,
    lowest_degree: 36,
    students_count: 34,
    attendees_count: 34,
    status: "graded"
  },
  {
    id: 3,
    exam_type: "paper",
    title: "امتحان تجريبي ميداني: قواعد الإملاء والتعبير",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 30,
    total_degree: 30,
    avg_score: 28.1,
    average_degree: 28.1,
    highest_degree: 30,
    lowest_degree: 22,
    students_count: 33,
    attendees_count: 33,
    exam_date: new Date(nowMs - oneDayMs * 12).toISOString(),
    status: "graded"
  },
  {
    id: 4,
    exam_type: "online",
    title: "اختبار سريع: إعراب اسم الفاعل والمفعول",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 20,
    total_degree: 20,
    duration_minutes: 25,
    start_at: new Date(nowMs - oneDayMs * 20).toISOString(),
    end_at: new Date(nowMs - oneDayMs * 13).toISOString(),
    exam_date: new Date(nowMs - oneDayMs * 20).toISOString(),
    avg_score: 18.5,
    average_degree: 18.5,
    highest_degree: 20,
    lowest_degree: 14,
    students_count: 35,
    attendees_count: 35,
    status: "graded"
  },
  {
    id: 5,
    exam_type: "paper",
    title: "امتحان نصف شهر أكتوبر التحريري",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 50,
    total_degree: 50,
    avg_score: 44.8,
    average_degree: 44.8,
    highest_degree: 50,
    lowest_degree: 37,
    students_count: 35,
    attendees_count: 35,
    exam_date: new Date(nowMs - oneDayMs * 20).toISOString(),
    status: "graded"
  },
  {
    id: 6,
    exam_type: "online",
    title: "اختبار البلاغة التراكمي: الصور البيانية والمحسنات",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 30,
    total_degree: 30,
    duration_minutes: 30,
    start_at: new Date(nowMs - oneDayMs * 1).toISOString(),
    end_at: new Date(nowMs + oneDayMs * 3).toISOString(),
    exam_date: new Date(nowMs - oneDayMs * 1).toISOString(),
    avg_score: 27.2,
    average_degree: 27.2,
    highest_degree: 30,
    lowest_degree: 21,
    students_count: 32,
    attendees_count: 32,
    status: "graded"
  },
  {
    id: 7,
    exam_type: "paper",
    title: "امتحان تقييمي: الصف الثاني الثانوي",
    grade_id: 2,
    grade_name: "الصف الثاني الثانوي",
    full_mark: 50,
    total_degree: 50,
    avg_score: 43.0,
    average_degree: 43.0,
    highest_degree: 50,
    lowest_degree: 35,
    students_count: 10,
    attendees_count: 10,
    exam_date: new Date(nowMs + oneDayMs * 6).toISOString(),
    status: "scheduled"
  },
  {
    id: 8,
    exam_type: "online",
    title: "اختبار القراءة والنصوص: الصف الأول الثانوي",
    grade_id: 1,
    grade_name: "الصف الأول الثانوي",
    full_mark: 30,
    total_degree: 30,
    duration_minutes: 30,
    start_at: new Date(nowMs + oneDayMs * 4).toISOString(),
    end_at: new Date(nowMs + oneDayMs * 11).toISOString(),
    exam_date: new Date(nowMs + oneDayMs * 4).toISOString(),
    avg_score: 26.5,
    average_degree: 26.5,
    highest_degree: 30,
    lowest_degree: 20,
    students_count: 5,
    attendees_count: 5,
    status: "scheduled"
  },
];

// Realistic Homework Dataset
const MOCK_HOMEWORKS = [
  {
    id: 1,
    title: "واجب همزة الوصل والقطع وتدريبات بنك المعرفة",
    description: "حل تدريبات النحو على الوحدة الأولى والتفرقة بين همزة الوصل والقطع مع استخراج الشواهد.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 10,
    submissions_count: 34,
    graded_count: 34,
    deadline: new Date(nowMs - oneDayMs * 2).toISOString(),
    is_closed: 0,
    status: "active"
  },
  {
    id: 2,
    title: "واجب إعراب المفعول المطلق والنائب عنه والشواهد",
    description: "إعراب جمل المفعول المطلق وتحديد نوع النائب عن المفعول المطلق وشواهد الشعر.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 15,
    submissions_count: 33,
    graded_count: 33,
    deadline: new Date(nowMs - oneDayMs * 6).toISOString(),
    is_closed: 0,
    status: "active"
  },
  {
    id: 3,
    title: "واجب القراءة المتحررة: قيم وتأملات في الفكر العربي",
    description: "قراءة النص المتحرر واستخراج الفكرة الرئيسة والمغزى الضمني وعلاقات الجمل.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 20,
    submissions_count: 32,
    graded_count: 27,
    deadline: new Date(nowMs - oneDayMs * 1).toISOString(),
    is_closed: 0,
    status: "active"
  },
  {
    id: 4,
    title: "واجب المبتدأ والخبر ونواسخ الجملة الاسمية (كان وأخواتها)",
    description: "تدريبات مكثفة على أحوال تقديم الخبر وجوباً وجوازاً وأفعال المقاربة والرجاء والشروع.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 20,
    submissions_count: 18,
    graded_count: 0,
    deadline: new Date(nowMs + oneDayMs * 4).toISOString(),
    is_closed: 0,
    status: "active"
  },
  {
    id: 5,
    title: "تطبيقات البلاغة: الاستعارة المكنية والتصريحية والتشبيه",
    description: "استخراج الصور البيانية وتحديد سر جمالها وقيمتها الفنية في الأبيات الشعرية.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 15,
    submissions_count: 12,
    graded_count: 0,
    deadline: new Date(nowMs + oneDayMs * 9).toISOString(),
    is_closed: 0,
    status: "active"
  },
  {
    id: 6,
    title: "تدريب التعبير الوظيفي: كتابة البسط والتلخيص والتقرير",
    description: "كتابة فقرة تلخيص مقال وتطبيق قواعد علامات الترقيم وتجنب الأخطاء الإملائية.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    full_mark: 15,
    submissions_count: 30,
    graded_count: 30,
    deadline: new Date(nowMs - oneDayMs * 25).toISOString(),
    is_closed: 1,
    status: "closed"
  }
];

// Realistic Videos & Playlists Dataset
const MOCK_VIDEOS = [
  {
    id: 1,
    video_id: 1,
    title: "شرح همزة الوصل والقطع بالتفصيل وأسرار الامتحان",
    duration: "38:45",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    description: "شرح تأسيسي مفصل للوحدة الأولى من منهج النحو للثانوية العامة مع تدريبات نموذجية وأسرار استخراج مواضع همزتي الوصل والقطع.",
    created_at: "2026-09-01T10:00:00Z"
  },
  {
    id: 2,
    video_id: 2,
    title: "قواعد رسم الهمزة المتوسطة والمتطرفة والفارق بين (ثم وثمت)",
    duration: "42:15",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    description: "تكملة قواعد الوحدة الأولى الإملائية والنحوية مع حل أكثر من 40 جملة وزارية من امتحانات الأعوام السابقة.",
    created_at: "2026-09-08T10:00:00Z"
  },
  {
    id: 3,
    video_id: 3,
    title: "علم البيان: التشبيه المفرد والتمثيلي والضمني مع أسرار الجمال",
    duration: "50:00",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    description: "شرح بلاغي مبسط للتفرقة الدقيقة بين أنواع التشبيه واستخراج سر الجمال (التشخيص والتجسيم والتوضيح).",
    created_at: "2026-09-15T10:00:00Z"
  },
  {
    id: 4,
    video_id: 4,
    title: "الاستعارة التصريحية والمكنية والتفريق بينها وبين الكناية",
    duration: "45:30",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    description: "فهم البلاغة وتطبيق عملي على نصوص الشعر العربي الحديث والقديم وطريقة الإجابة النموذجية في الامتحان.",
    created_at: "2026-09-22T10:00:00Z"
  },
  {
    id: 5,
    video_id: 5,
    title: "شرح درس أفعال المقاربة والرجاء والشروع (كاد وأخواتها)",
    duration: "35:20",
    grade_id: 2,
    grade_name: "الصف الثاني الثانوي",
    url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    description: "شرح منهج النحو لطلاب الصف الثاني الثانوي مع شواهد بلاغية وشعرية وتدريبات إعراب خبر كاد.",
    created_at: "2026-09-10T10:00:00Z"
  },
  {
    id: 6,
    video_id: 6,
    title: "الأفعال الصحيحة والمعتلة والميزان الصرفي للكلمات",
    duration: "40:10",
    grade_id: 1,
    grade_name: "الصف الأول الثانوي",
    url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    description: "تأسيس الصرف والنحو لطلاب الصف الأول الثانوي بأسلوب شيق ومبسط يضمن التميز وحل تدريبات الكتاب المدرسي.",
    created_at: "2026-09-12T10:00:00Z"
  }
];

const MOCK_PLAYLISTS = [
  {
    id: 1,
    playlist_id: 1,
    title: "الوحدة الأولى: قواعد النحو والإملاء للثانوية العامة",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    videos_count: 2,
    price: 150,
    description: "كورس متكامل يغطي جميع قواعد الوحدة الأولى من همزات ورسم الكلمات وإعراب الشواهد وحل بنك المعرفة.",
    created_at: "2026-09-01T10:00:00Z",
    videos: [MOCK_VIDEOS[0], MOCK_VIDEOS[1]]
  },
  {
    id: 2,
    playlist_id: 2,
    title: "علم البيان والتصوير الفني في البلاغة العربية",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    videos_count: 2,
    price: 120,
    description: "سلسلة البلاغة المتكاملة لشرح التشبيه والاستعارة والكناية والمجاز المرسل وطريقة التعامل مع الأسئلة المتحررة.",
    created_at: "2026-09-15T10:00:00Z",
    videos: [MOCK_VIDEOS[2], MOCK_VIDEOS[3]]
  },
  {
    id: 3,
    playlist_id: 3,
    title: "منهج النحو التأسيسي للصف الثاني الثانوي",
    grade_id: 2,
    grade_name: "الصف الثاني الثانوي",
    videos_count: 1,
    price: 100,
    description: "شرح دروس الترم الأول للصف الثاني الثانوي مع بنك أسئلة الوزارة وتدريبات كاد وأخواتها وتوكيد الفعل بالنون.",
    created_at: "2026-09-10T10:00:00Z",
    videos: [MOCK_VIDEOS[4]]
  }
];

// Helper to filter 50 students
const filterStudents = (page = 1, search = "", gradeId = "", groupId = "", limit = 20) => {
  let list = [...MOCK_50_STUDENTS];
  if (search) {
    const q = search.trim().toLowerCase();
    list = list.filter(s => s.full_name.toLowerCase().includes(q) || s.barcode.includes(q) || s.phone.includes(q));
  }
  if (gradeId && gradeId !== "all") {
    list = list.filter(s => String(s.grade_id) === String(gradeId));
  }
  if (groupId && groupId !== "all") {
    list = list.filter(s => String(s.group_id) === String(groupId));
  }
  const total = list.length;
  if (limit === "all" || Number(limit) >= 500) {
    return { data: list, pagination: { total, totalPages: 1, page: 1, limit: total } };
  }
  const parsedLimit = Number(limit) || 20;
  const totalPages = Math.ceil(total / parsedLimit) || 1;
  const start = (page - 1) * parsedLimit;
  const paginated = list.slice(start, start + parsedLimit);
  return { data: paginated, pagination: { total, totalPages, page, limit: parsedLimit } };
};

// ============================================================
// TEACHER ACTIONS IMPLEMENTATION
// ============================================================

const fetchTeacherProfile = async () => {
  if (isDemo()) {
    return {
      success: true,
      data: {
        id: 1,
        full_name: "أ / محمد بشتة",
        role: "teacher",
        phone: "01012345678",
        email: "boshta@benben.cloud",
        subject: "اللغة العربية للثانوية العامة",
        specialization: "النحو والصرف والبلاغة والأدب العربي",
        experience_years: 15,
        center_name: "سنتر النخبة التعليمي - القاهرة",
        location: "القاهرة - مصر",
        bio: "معلم ومحاضر مادة اللغة العربية للثانوية العامة بخبرة تفوق 15 عاماً في إعداد وتأهيل أوائل الجمهورية وتيسير قواعد النحو وفنون البلاغة لجميع المراحل الثانوية.",
        permissions: "center_management",
        profile_image: "https://ui-avatars.com/api/?name=محمد+بشتة&background=1a5d1a&color=fff&size=200",
        stats: {
          total_students: 50,
          total_groups: 5,
          total_grades: 3,
          total_exams: 8,
          total_assignments: 6,
          total_videos: 6,
          total_playlists: 3
        },
        joined_at: "2024-08-01",
        account_status: "active"
      }
    };
  }
  try {
    const data = await teacherServices.getTeacherProfile();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchTeacherDashboard = async () => {
  if (isDemo()) {
    return {
      success: true,
      data: {
        overview: {
          total_students: 50,
          total_grades: 3,
          total_groups: 5,
          total_assistants: 4,
          total_exams: 8,
          total_assignments: 6,
          total_playlists: 3,
          total_videos: 6
        },
        attendance_today: {
          present_count: 46,
          absent_count: 4,
          attendance_rate: 92
        },
        exams: {
          total_exams: 8,
          avg_score: 93,
          highest_score: 50,
          upcoming_paper_exams: 1,
          active_online_exams: 1
        },
        assignments: {
          total_assignments: 6,
          active_assignments: 3,
          submitted_count: 42,
          pending_grading: 5
        },
        payments_month: {
          total_paid: 11500,
          unpaid_students: 4,
          collection_rate: 92
        },
        recent_activities: MOCK_ACTIVITY_LOG
      }
    };
  }
  try {
    const data = await teacherServices.getTeacherDashboard();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchActivityLog = async (entityType = "", date = "", page = 1) => {
  if (isDemo()) {
    let filtered = [...MOCK_ACTIVITY_LOG];
    if (entityType) filtered = filtered.filter(a => a.entity_type === entityType);
    return { success: true, data: filtered, pagination: { total: filtered.length, totalPages: 1 } };
  }
  try {
    const data = await teacherServices.getActivityLog(entityType, date, page);
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssistants = async () => {
  if (isDemo()) return { success: true, data: MOCK_ASSISTANTS };
  try {
    const data = await teacherServices.getAssistants();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssistantById = async (assistantId) => {
  if (isDemo()) {
    const ast = MOCK_ASSISTANTS.find(a => String(a.id) === String(assistantId)) || MOCK_ASSISTANTS[0];
    return { success: true, data: ast };
  }
  try {
    const data = await teacherServices.getAssistantById(assistantId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchDashboardStats = async () => {
  if (isDemo()) {
    return {
      success: true,
      data: {
        grades: MOCK_GRADES,
        groups: MOCK_GROUPS,
        students: MOCK_50_STUDENTS,
        attendance: [
          { month: "2026-11", present_count: 48, absent_count: 2, attendance_percentage: 96 },
          { month: "2026-10", present_count: 46, absent_count: 4, attendance_percentage: 92 },
          { month: "2026-09", present_count: 49, absent_count: 1, attendance_percentage: 98 },
          { month: "2026-08", present_count: 47, absent_count: 3, attendance_percentage: 94 },
        ],
        payments: {
          total_paid: 49000,
          total_remaining: 1000,
          fully_paid_students: 46,
          unpaid_students: 4,
          collected_this_month: 11500,
          target_month: 12500,
          unpaid_count: 4,
        },
        subscriptions: { active_subscriptions: 46, total_students: 50 },
      }
    };
  }
  try {
    const [grades, groups, studentsRes, attendance, payments, subscriptions] =
      await Promise.all([
        teacherServices.getAllGradesStats(),
        teacherServices.getAllGroupsStats(),
        teacherServices.getStudents(1, "", "", ""),
        teacherServices.getAttendanceOverall(),
        teacherServices.getPaymentOverall(),
        teacherServices.getSubscriptionOverall(),
      ]);
    return {
      success: true,
      data: {
        grades,
        groups,
        students: studentsRes.data || [],
        attendance,
        payments,
        subscriptions,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllStudents = async (
  page = 1,
  search = "",
  gradeId = "",
  groupId = "",
  limit = 20,
) => {
  if (isDemo()) {
    const result = filterStudents(page, search, gradeId, groupId, limit);
    return { success: true, data: result.data, pagination: result.pagination };
  }
  try {
    const response = await teacherServices.getStudents(
      page,
      search,
      gradeId,
      groupId,
      limit,
    );
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchStudentByBarcode = async (barcode) => {
  if (isDemo()) {
    const found = MOCK_50_STUDENTS.find(s => s.barcode === barcode) || MOCK_50_STUDENTS[0];
    return { success: true, data: found };
  }
  try {
    const student = await teacherServices.searchStudentByBarcode(barcode);
    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchStudentByPhone = async (phone) => {
  if (isDemo()) {
    const found = MOCK_50_STUDENTS.find(s => s.phone === phone || s.parent_phone === phone) || MOCK_50_STUDENTS[0];
    return { success: true, data: found };
  }
  try {
    const student = await teacherServices.searchStudentByPhone(phone);
    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentDetails = async (studentId) => {
  if (isDemo()) {
    const st = MOCK_50_STUDENTS.find(s => String(s.id) === String(studentId)) || MOCK_50_STUDENTS[0];
    return {
      success: true,
      data: {
        profile: st,
        stats: {
          attendance_rate: st.attendance_rate,
          attendance_percentage: st.attendance_rate,
          present_days: 15,
          absent_days: 1,
          avg_paper_degree: st.exams_avg,
          exams_avg: st.exams_avg,
          total_paid: st.total_paid,
          remaining_balance: st.remaining_balance,
          payments_status: st.payment_status
        }
      }
    };
  }
  try {
    const [profile, stats] = await Promise.all([
      teacherServices.getStudentProfile(studentId),
      teacherServices.getStudentStats(studentId),
    ]);
    return { success: true, data: { profile, stats } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentFullDetails = async (studentId) => {
  if (isDemo()) {
    const st = MOCK_50_STUDENTS.find(s => String(s.id) === String(studentId)) || MOCK_50_STUDENTS[0];
    return {
      success: true,
      data: {
        profile: st,
        stats: {
          attendance_percentage: st.attendance_rate,
          present_days: 15,
          absent_days: 1,
          avg_paper_degree: st.exams_avg,
          total_paid: st.total_paid,
          remaining_balance: st.remaining_balance
        },
        balance: {
          total_paid: st.total_paid,
          remaining_balance: st.remaining_balance
        },
        monthlyAttendance: [
          { month: "نوفمبر 2026", present_days: 4, absent_days: 0, attendance_percentage: 100 },
          { month: "أكتوبر 2026", present_days: 8, absent_days: 1, attendance_percentage: 89 },
          { month: "سبتمبر 2026", present_days: 8, absent_days: 0, attendance_percentage: 100 },
          { month: "أغسطس 2026", present_days: 4, absent_days: 0, attendance_percentage: 100 },
        ],
        attendance: [
          { id: 1, attendance_date: new Date(nowMs - oneDayMs * 1).toISOString(), day_name: "السبت", attendance_time: "16:30:00", method: "barcode", status: "present" },
          { id: 2, attendance_date: new Date(nowMs - oneDayMs * 4).toISOString(), day_name: "الأربعاء", attendance_time: "16:28:00", method: "barcode", status: "present" },
          { id: 3, attendance_date: new Date(nowMs - oneDayMs * 8).toISOString(), day_name: "السبت", attendance_time: "16:32:00", method: "barcode", status: "present" },
          { id: 4, attendance_date: new Date(nowMs - oneDayMs * 11).toISOString(), day_name: "الأربعاء", attendance_time: "16:30:00", method: "barcode", status: "present" },
          { id: 5, attendance_date: new Date(nowMs - oneDayMs * 15).toISOString(), day_name: "السبت", attendance_time: "16:31:00", method: "barcode", status: "present" },
          { id: 6, attendance_date: new Date(nowMs - oneDayMs * 18).toISOString(), day_name: "الأربعاء", attendance_time: null, method: "manual", status: "absent" },
          { id: 7, attendance_date: new Date(nowMs - oneDayMs * 22).toISOString(), day_name: "السبت", attendance_time: "16:29:00", method: "barcode", status: "present" },
          { id: 8, attendance_date: new Date(nowMs - oneDayMs * 25).toISOString(), day_name: "الأربعاء", attendance_time: "16:30:00", method: "barcode", status: "present" },
          { id: 9, attendance_date: new Date(nowMs - oneDayMs * 29).toISOString(), day_name: "السبت", attendance_time: "16:33:00", method: "barcode", status: "present" },
          { id: 10, attendance_date: new Date(nowMs - oneDayMs * 32).toISOString(), day_name: "الأربعاء", attendance_time: "16:27:00", method: "barcode", status: "present" },
          { id: 11, attendance_date: new Date(nowMs - oneDayMs * 36).toISOString(), day_name: "السبت", attendance_time: "16:30:00", method: "barcode", status: "present" },
          { id: 12, attendance_date: new Date(nowMs - oneDayMs * 39).toISOString(), day_name: "الأربعاء", attendance_time: "16:30:00", method: "barcode", status: "present" }
        ],
        payments: [
          { id: 1, amount: 250, subscription_month: "نوفمبر 2026", payment_date: new Date(nowMs - oneDayMs * 2).toISOString(), receipt_number: "REC-2026-11-042" },
          { id: 2, amount: 250, subscription_month: "أكتوبر 2026", payment_date: new Date(nowMs - oneDayMs * 32).toISOString(), receipt_number: "REC-2026-10-118" },
          { id: 3, amount: 250, subscription_month: "سبتمبر 2026", payment_date: new Date(nowMs - oneDayMs * 62).toISOString(), receipt_number: "REC-2026-09-009" },
          { id: 4, amount: 250, subscription_month: "أغسطس 2026", payment_date: new Date(nowMs - oneDayMs * 92).toISOString(), receipt_number: "REC-2026-08-003" }
        ],
        paperExams: [
          { id: 1, exam_title: "امتحان شهر أكتوبر الشامل بمركز السنتر", title: "امتحان شهر أكتوبر الشامل بمركز السنتر", exam_date: "2026-10-15", total_degree: 50, student_degree: 48, degree: 48, exam_status: "attended", status: "حاضر" },
          { id: 2, exam_title: "امتحان نصف شهر أكتوبر التحريري", title: "امتحان نصف شهر أكتوبر التحريري", exam_date: "2026-09-25", total_degree: 50, student_degree: 46, degree: 46, exam_status: "attended", status: "حاضر" },
          { id: 3, exam_title: "امتحان تجريبي ميداني: قواعد الإملاء والتعبير", title: "امتحان تجريبي ميداني: قواعد الإملاء والتعبير", exam_date: "2026-09-10", total_degree: 30, student_degree: 28, degree: 28, exam_status: "attended", status: "حاضر" }
        ],
        examResults: [
          { id: 1, exam_title: "امتحان الوحدة الأولى الشامل", title: "امتحان الوحدة الأولى الشامل", degree: 48, total_degree: 50, percentage: 96 },
          { id: 2, exam_title: "امتحان شهر أكتوبر الشامل بمركز السنتر", title: "امتحان شهر أكتوبر الشامل بمركز السنتر", degree: 48, total_degree: 50, percentage: 96 },
          { id: 3, exam_title: "اختبار سريع: إعراب اسم الفاعل والمفعول", title: "اختبار سريع: إعراب اسم الفاعل والمفعول", degree: 19, total_degree: 20, percentage: 95 },
          { id: 4, exam_title: "امتحان نصف شهر أكتوبر التحريري", title: "امتحان نصف شهر أكتوبر التحريري", degree: 46, total_degree: 50, percentage: 92 }
        ],
        onlineExams: [
          { id: 1, exam_title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)", title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)", submitted_at: "2026-10-05", full_mark: 50, score: 48, percentage: 96, status: "passed" },
          { id: 2, exam_title: "اختبار سريع: إعراب اسم الفاعل والمفعول", title: "اختبار سريع: إعراب اسم الفاعل والمفعول", submitted_at: "2026-09-28", full_mark: 20, score: 19, percentage: 95, status: "passed" },
          { id: 3, exam_title: "اختبار البلاغة التراكمي: الصور البيانية والمحسنات", title: "اختبار البلاغة التراكمي: الصور البيانية والمحسنات", submitted_at: "2026-09-18", full_mark: 30, score: 28, percentage: 93, status: "passed" }
        ],
        assignments: [
          { id: 1, title: "واجب همزة الوصل والقطع وتدريبات بنك المعرفة", full_mark: 10, score: 10, assignment_status: "graded", status: "graded" },
          { id: 2, title: "واجب إعراب المفعول المطلق والنائب عنه والشواهد", full_mark: 15, score: 14, assignment_status: "graded", status: "graded" },
          { id: 3, title: "واجب القراءة المتحررة: قيم وتأملات في الفكر العربي", full_mark: 20, score: null, assignment_status: "submitted", status: "submitted" },
          { id: 4, title: "واجب المبتدأ والخبر ونواسخ الجملة الاسمية (كان وأخواتها)", full_mark: 20, score: null, assignment_status: "pending", status: "pending" }
        ],
        submissions: [
          { id: 1, assignment_title: "واجب همزة الوصل والقطع وتدريبات بنك المعرفة", score: 10, submission_timing: "on_time", feedback: "إجابة نموذجية وخط ممتاز واستخراج دقيق للشواهد" },
          { id: 2, assignment_title: "واجب إعراب المفعول المطلق والنائب عنه والشواهد", score: 14, submission_timing: "on_time", feedback: "إجابة ممتازة، انتبه لإعراب النائب عن المفعول المطلق في الجملة الخامسة" }
        ]
      }
    };
  }
  try {
    const data = await teacherServices.getStudentFullDetails(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentFilters = async () => {
  if (isDemo()) {
    return {
      success: true,
      data: {
        grades: MOCK_GRADES,
        groups: MOCK_GROUPS
      }
    };
  }
  try {
    const [grades, groups] = await Promise.all([
      teacherServices.getGrades(),
      teacherServices.getGroups(),
    ]);
    return { success: true, data: { grades, groups } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentAttendance = async (studentId) => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { id: 1, attendance_date: new Date(nowMs - oneDayMs * 1).toISOString(), day_name: "السبت", status: "present", time: "16:30:00" },
        { id: 2, attendance_date: new Date(nowMs - oneDayMs * 4).toISOString(), day_name: "الأربعاء", status: "present", time: "16:28:00" },
        { id: 3, attendance_date: new Date(nowMs - oneDayMs * 8).toISOString(), day_name: "السبت", status: "present", time: "16:32:00" },
        { id: 4, attendance_date: new Date(nowMs - oneDayMs * 11).toISOString(), day_name: "الأربعاء", status: "present", time: "16:30:00" },
        { id: 5, attendance_date: new Date(nowMs - oneDayMs * 15).toISOString(), day_name: "السبت", status: "present", time: "16:31:00" },
        { id: 6, attendance_date: new Date(nowMs - oneDayMs * 18).toISOString(), day_name: "الأربعاء", status: "absent", time: null },
      ]
    };
  }
  try {
    const data = await teacherServices.getStudentAttendanceHistory(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPayments = async (studentId) => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { id: 1, amount: 250, subscription_month: "نوفمبر 2026", payment_date: new Date(nowMs - oneDayMs * 2).toISOString() },
        { id: 2, amount: 250, subscription_month: "أكتوبر 2026", payment_date: new Date(nowMs - oneDayMs * 32).toISOString() },
        { id: 3, amount: 250, subscription_month: "سبتمبر 2026", payment_date: new Date(nowMs - oneDayMs * 62).toISOString() },
      ]
    };
  }
  try {
    const data = await teacherServices.getStudentPayments(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPayments = async (page = 1, search = "", gradeId = "", groupId = "") => {
  if (isDemo()) {
    let list = MOCK_50_STUDENTS.map(s => ({
      id: s.id,
      student_id: s.id,
      student_name: s.full_name,
      barcode: s.barcode,
      grade_id: s.grade_id,
      grade_name: s.grade_name,
      group_id: s.group_id,
      group_name: s.group_name,
      amount: 250,
      subscription_month: "نوفمبر 2026",
      status: s.payment_status,
      payment_mode: "monthly",
      payment_date: s.payment_status === "paid" ? new Date(nowMs - oneDayMs * (s.id % 15)).toISOString() : null,
      notes: s.payment_status === "paid" ? "مسدد بالسنتر نقداً" : "في انتظار السداد"
    }));

    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => p.student_name.toLowerCase().includes(q) || p.barcode.includes(q));
    }
    if (gradeId && gradeId !== "all") {
      list = list.filter(p => String(p.grade_id) === String(gradeId));
    }
    if (groupId && groupId !== "all") {
      list = list.filter(p => String(p.group_id) === String(groupId));
    }

    const total = list.length;
    const limit = 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return { success: true, data: paginated, pagination: { total, totalPages, page, limit } };
  }
  try {
    const response = await teacherServices.getPayments(page, search);
    return { success: true, data: response.data, pagination: response.pagination };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaymentCollections = async () => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { month: "2026-11", total_payments: 46, total_collected: 11500, students_paid: 46, paid_students: 46, unpaid_students: 4, target_amount: 12500 },
        { month: "2026-10", total_payments: 50, total_collected: 12500, students_paid: 50, paid_students: 50, unpaid_students: 0, target_amount: 12500 },
        { month: "2026-09", total_payments: 50, total_collected: 12500, students_paid: 50, paid_students: 50, unpaid_students: 0, target_amount: 12500 },
        { month: "2026-08", total_payments: 50, total_collected: 12500, students_paid: 50, paid_students: 50, unpaid_students: 0, target_amount: 12500 },
      ]
    };
  }
  try {
    const data = await teacherServices.getPaymentCollections();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchUnpaidStudents = async () => {
  if (isDemo()) {
    const unpaid = MOCK_50_STUDENTS.filter(s => s.payment_status === "unpaid");
    return { success: true, data: unpaid };
  }
  try {
    const data = await teacherServices.getUnpaidStudents();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaymentOverall = async () => {
  if (isDemo()) {
    return {
      success: true,
      data: {
        total_paid: 49000,
        total_required: 50000,
        fully_paid: 46,
        not_paid: 4,
        total_students: 50,
        total_collected: 49000,
        current_month_collected: 11500,
        unpaid_count: 4,
        collection_rate: 98
      }
    };
  }
  try {
    const data = await teacherServices.getPaymentOverall();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentsPaymentStatus = async (gradeId = "", groupId = "", month = "") => {
  if (isDemo()) {
    let list = MOCK_50_STUDENTS.map(s => ({
      id: s.id,
      full_name: s.full_name,
      student_name: s.full_name,
      barcode: s.barcode,
      grade_id: s.grade_id,
      grade_name: s.grade_name,
      group_id: s.group_id,
      group_name: s.group_name,
      required_amount: 250,
      paid_amount: s.payment_status === "paid" ? 250 : 0,
      remaining_amount: s.payment_status === "paid" ? 0 : 250,
      payment_status: s.payment_status,
      is_paid: s.payment_status === "paid",
      status: s.payment_status,
      amount: 250
    }));

    if (gradeId && gradeId !== "all") {
      list = list.filter(s => String(s.grade_id) === String(gradeId));
    }
    if (groupId && groupId !== "all") {
      list = list.filter(s => String(s.group_id) === String(groupId));
    }

    return {
      success: true,
      data: list
    };
  }
  try {
    const data = await teacherServices.getStudentsPaymentStatus(gradeId, groupId, month);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradePaymentStats = async (gradeId) => {
  if (isDemo()) {
    return { success: true, data: { paid: 32, unpaid: 3, total: 35, percentage: 91 } };
  }
  try {
    const data = await teacherServices.getGradeSubscriptionStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupPaymentStats = async (groupId) => {
  if (isDemo()) {
    return { success: true, data: { paid: 19, unpaid: 1, total: 20, percentage: 95 } };
  }
  try {
    const data = await teacherServices.getGroupSubscriptionStats(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPaperExams = async (studentId) => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { id: 1, title: "امتحان شهر أكتوبر الشامل", exam_date: "2026-10-15", total_degree: 50, student_degree: 48, status: "attended" }
      ]
    };
  }
  try {
    const data = await teacherServices.getStudentPaperExams(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentExamResults = async (studentId) => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { id: 1, exam_title: "امتحان الوحدة الأولى الشامل", score: 48, full_mark: 50, percentage: 96 }
      ]
    };
  }
  try {
    const data = await teacherServices.getStudentExamResults(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentOnlineExams = async (studentId) => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { id: 1, title: "امتحان الوحدة الأولى الشامل", score: 48, full_mark: 50, status: "passed" }
      ]
    };
  }
  try {
    const data = await teacherServices.getStudentOnlineExams(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentAssignments = async (studentId) => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { id: 1, title: "واجب همزة الوصل والقطع وتدريبات بنك المعرفة", score: 10, full_mark: 10, status: "graded" }
      ]
    };
  }
  try {
    const data = await teacherServices.getStudentAssignments(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentSubmissions = async (studentId) => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { id: 1, assignment_title: "واجب همزة الوصل والقطع وتدريبات بنك المعرفة", score: 10, feedback: "ممتاز جداً" }
      ]
    };
  }
  try {
    const data = await teacherServices.getStudentSubmissions(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchVideosByGrade = async (gradeId) => {
  if (isDemo()) {
    const filtered = MOCK_VIDEOS.filter(v => gradeId === "all" || !gradeId || String(v.grade_id) === String(gradeId));
    return { success: true, data: filtered };
  }
  try {
    const data = await teacherServices.getVideosByGrade(gradeId);
    return { success: true, data: extractArray(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistsByGrade = async (gradeId) => {
  if (isDemo()) {
    const filtered = MOCK_PLAYLISTS.filter(p => gradeId === "all" || !gradeId || String(p.grade_id) === String(gradeId));
    return { success: true, data: filtered };
  }
  try {
    const data = await teacherServices.getPlaylistsByGrade(gradeId);
    return { success: true, data: extractArray(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamsByGrade = async (gradeId) => {
  if (isDemo()) {
    const filtered = MOCK_EXAMS.filter(e => e.exam_type === "paper" && (gradeId === "all" || !gradeId || String(e.grade_id) === String(gradeId)));
    return { success: true, data: filtered };
  }
  try {
    const data = await teacherServices.getExamsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOnlineExamsByGrade = async (gradeId) => {
  if (isDemo()) {
    const filtered = MOCK_EXAMS.filter(e => e.exam_type === "online" && (gradeId === "all" || !gradeId || String(e.grade_id) === String(gradeId)));
    return { success: true, data: filtered };
  }
  try {
    const data = await teacherServices.getOnlineExamsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamStats = async (examId) => {
  if (isDemo()) {
    return { success: true, data: { attendees_count: 35, avg_score: 46.5, pass_rate: 97, highest_score: 50, lowest_score: 38 } };
  }
  try {
    const data = await teacherServices.getExamStats(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamResultsByGrade = async (gradeId) => {
  if (isDemo()) {
    const filtered = MOCK_EXAMS.filter(e => gradeId === "all" || !gradeId || String(e.grade_id) === String(gradeId));
    return { success: true, data: filtered };
  }
  try {
    const data = await teacherServices.getExamsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeExamResultsStats = async (gradeId) => {
  if (isDemo()) {
    return { success: true, data: { avg_grade: 92, total_exams: 6, pass_rate: 96 } };
  }
  try {
    const data = await teacherServices.getGradeExamResultsStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceDashboard = async (groupId) => {
  if (isDemo()) {
    const groupStudents = groupId
      ? MOCK_50_STUDENTS.filter(s => String(s.group_id) === String(groupId))
      : MOCK_50_STUDENTS;
    const total_students = groupStudents.length || 50;
    const present_today = Math.round(total_students * 0.92);
    const absent_today = total_students - present_today;

    return {
      success: true,
      data: {
        total_students,
        present_today,
        absent_today,
        not_marked_today: 0,
        today: {
          present: present_today,
          absent: absent_today,
          rate: 92,
          not_marked: 0
        },
        weekly: [
          { day: "السبت", present: Math.round(total_students * 0.96), absent: Math.round(total_students * 0.04), rate: 96 },
          { day: "الأحد", present: Math.round(total_students * 0.90), absent: Math.round(total_students * 0.10), rate: 90 },
          { day: "الثلاثاء", present: Math.round(total_students * 0.94), absent: Math.round(total_students * 0.06), rate: 94 },
          { day: "الأربعاء", present: Math.round(total_students * 0.92), absent: Math.round(total_students * 0.08), rate: 92 },
          { day: "الخميس", present: Math.round(total_students * 0.98), absent: Math.round(total_students * 0.02), rate: 98 },
        ],
        monthly: [
          { month: "2026-11", rate: 95 },
          { month: "2026-10", rate: 93 },
          { month: "2026-09", rate: 96 }
        ]
      }
    };
  }
  try {
    const data = await teacherServices.getAttendanceDashboard(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceOverview = async () => {
  if (isDemo()) {
    return {
      success: true,
      data: {
        overall: [
          { month: "2026-11", present_count: 48, absent_count: 2 },
          { month: "2026-10", present_count: 46, absent_count: 4 },
          { month: "2026-09", present_count: 49, absent_count: 1 },
          { month: "2026-08", present_count: 47, absent_count: 3 },
        ],
        consecutiveAbsences: [
          { student_id: 6, full_name: "علي حسام الدين المنشاوي", consecutive_absences: 3, barcode: "0016" },
          { student_id: 22, full_name: "بلال عادل النجار", consecutive_absences: 3, barcode: "0032" },
        ],
        total_sessions: 24,
        overall_attendance_rate: 95,
        present_today: 46,
        absent_today: 4,
        top_groups: [
          { group_name: "مجموعة السبت والأربعاء (السنتر)", rate: 96 },
          { group_name: "مجموعة الخميس (السنتر)", rate: 95 }
        ]
      }
    };
  }
  try {
    const data = await teacherServices.getAttendanceOverall();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeAttendance = async (gradeId) => {
  if (isDemo()) {
    return {
      success: true,
      data: [
        { month: "2026-11", present_count: 33, absent_count: 2, attendance_percentage: 94 },
        { month: "2026-10", present_count: 34, absent_count: 1, attendance_percentage: 97 },
        { month: "2026-09", present_count: 32, absent_count: 3, attendance_percentage: 91 },
        { month: "2026-08", present_count: 35, absent_count: 0, attendance_percentage: 100 },
      ]
    };
  }
  try {
    const data = await teacherServices.getGradeAttendance(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupAttendanceByDate = async (groupId, date) => {
  if (isDemo()) {
    // If groupId is specified, filter students for that group, otherwise take first 20
    const groupStudents = groupId
      ? MOCK_50_STUDENTS.filter(s => String(s.group_id) === String(groupId))
      : MOCK_50_STUDENTS.slice(0, 20);

    const list = (groupStudents.length > 0 ? groupStudents : MOCK_50_STUDENTS.slice(0, 20)).map((s, idx) => ({
      id: s.id,
      full_name: s.full_name,
      student_name: s.full_name,
      barcode: s.barcode,
      status: idx === 5 ? "absent" : "present",
      time: idx === 5 ? null : "16:30:00"
    }));

    return {
      success: true,
      data: list
    };
  }
  try {
    const data = await teacherServices.getGroupAttendanceByDate(groupId, date);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupAttendanceByMonth = async (groupId, month) => {
  if (isDemo()) {
    return { success: true, data: { total_sessions: 8, avg_attendance: 19, rate: 95 } };
  }
  try {
    const data = await teacherServices.getGroupAttendanceByMonth(groupId, month);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceSummary = async (groupId, date) => {
  if (isDemo()) {
    const groupStudents = groupId
      ? MOCK_50_STUDENTS.filter(s => String(s.group_id) === String(groupId))
      : MOCK_50_STUDENTS.slice(0, 20);
    const total_students = groupStudents.length || 20;
    const present_count = Math.max(1, total_students - 1);
    const absent_count = total_students - present_count;
    return {
      success: true,
      data: {
        total_students,
        present_count,
        absent_count,
        not_marked_count: 0,
        percentage: Math.round((present_count / total_students) * 100),
        date: date || new Date().toISOString().slice(0, 10)
      }
    };
  }
  try {
    const data = await teacherServices.getAttendanceSummary(groupId, date);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Returns both videos and playlists as expected by Courses.jsx
const fetchCourses = async () => {
  if (isDemo()) {
    return {
      success: true,
      data: {
        videos: MOCK_VIDEOS,
        playlists: MOCK_PLAYLISTS
      }
    };
  }
  try {
    const [videosRes, playlistsRes] = await Promise.all([
      teacherServices.getVideos().catch((err) => {
        console.warn("Failed to fetch teacher videos:", err);
        return [];
      }),
      teacherServices.getPlaylists().catch((err) => {
        console.warn("Failed to fetch teacher playlists:", err);
        return [];
      }),
    ]);

    const videos = extractArray(videosRes);
    const playlists = extractArray(playlistsRes);

    return {
      success: true,
      data: {
        videos,
        playlists
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistDetails = async (playlistId) => {
  if (isDemo()) {
    const pl = MOCK_PLAYLISTS.find(p => String(p.id) === String(playlistId) || String(p.playlist_id) === String(playlistId)) || MOCK_PLAYLISTS[0];
    return {
      success: true,
      data: pl
    };
  }
  try {
    const [playlistRes, playlistVideosRes] = await Promise.all([
      teacherServices.getPlaylistById(playlistId).catch(() => null),
      teacherServices.getPlaylistVideos(playlistId).catch(() => null),
    ]);

    let playlist = playlistRes?.data ?? playlistRes;
    if (!playlist || typeof playlist !== "object" || Array.isArray(playlist)) {
      playlist = { id: playlistId };
    }

    const fetchedVideos = extractArray(playlistVideosRes);
    const existingVideos = extractArray(playlist.videos);

    playlist.videos = fetchedVideos.length > 0 ? fetchedVideos : existingVideos;

    return {
      success: true,
      data: playlist
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchVideoById = async (videoId) => {
  if (isDemo()) {
    const vid = MOCK_VIDEOS.find(v => String(v.id) === String(videoId) || String(v.video_id) === String(videoId)) || MOCK_VIDEOS[0];
    return {
      success: true,
      data: vid
    };
  }
  try {
    const res = await teacherServices.getVideoById(videoId);
    let data = res?.data ?? res;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return { success: true, data };
    }
    if (Array.isArray(data) && data.length > 0) {
      return { success: true, data: data[0] };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Returns paperExams and onlineExams as expected by Degrees.jsx
const fetchAllExams = async (page = 1, search = "") => {
  if (isDemo()) {
    let paper = MOCK_EXAMS.filter(e => e.exam_type === "paper");
    let online = MOCK_EXAMS.filter(e => e.exam_type === "online");

    if (search) {
      const q = search.trim().toLowerCase();
      paper = paper.filter(e => e.title.toLowerCase().includes(q));
      online = online.filter(e => e.title.toLowerCase().includes(q));
    }

    return {
      success: true,
      data: {
        paperExams: paper,
        onlineExams: online
      }
    };
  }
  try {
    const data = await teacherServices.getExams(page, search);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Paper Exam results with results and stats expected by ExamResults.jsx
const fetchPaperExamResults = async (examId) => {
  if (isDemo()) {
    const exam = MOCK_EXAMS.find(e => String(e.id) === String(examId)) || MOCK_EXAMS[0];
    const results = MOCK_50_STUDENTS.slice(0, 35).map((s, idx) => {
      const score = Math.max(35, 50 - (idx % 12));
      return {
        id: idx + 1,
        student_id: s.id,
        student_name: s.full_name,
        full_name: s.full_name,
        barcode: s.barcode,
        group_name: s.group_name,
        degree: score,
        student_degree: score,
        total_degree: exam.full_mark || 50,
        max_degree: exam.full_mark || 50,
        percentage: Math.round((score / (exam.full_mark || 50)) * 100),
        status: "attended",
        exam_status: "attended",
        rank: idx + 1
      };
    });

    return {
      success: true,
      data: {
        stats: {
          title: exam.title,
          total_degree: exam.full_mark || 50,
          exam_date: exam.exam_date || "2026-10-15",
          grade_id: exam.grade_id || 3,
          avg_score: exam.avg_score || 46.5,
          attendees_count: 35,
          absent_count: 0
        },
        results
      }
    };
  }
  try {
    const data = await teacherServices.getExamResults(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Online Exam stats with attempts and stats expected by ExamResults.jsx
const fetchOnlineExamStats = async (examId) => {
  if (isDemo()) {
    const exam = MOCK_EXAMS.find(e => String(e.id) === String(examId)) || MOCK_EXAMS[1];
    const attempts = MOCK_50_STUDENTS.slice(0, 34).map((s, idx) => {
      const score = Math.max(36, 50 - (idx % 11));
      return {
        id: idx + 1,
        student_id: s.id,
        student_name: s.full_name,
        full_name: s.full_name,
        barcode: s.barcode,
        group_name: s.group_name,
        score,
        degree: score,
        full_mark: exam.full_mark || 50,
        total_degree: exam.full_mark || 50,
        percentage: Math.round((score / (exam.full_mark || 50)) * 100),
        status: "passed",
        submitted_at: new Date(nowMs - oneDayMs * (2 + (idx % 5))).toISOString()
      };
    });

    return {
      success: true,
      data: {
        stats: {
          title: exam.title,
          full_mark: exam.full_mark || 50,
          total_degree: exam.full_mark || 50,
          grade_id: exam.grade_id || 3,
          start_at: exam.start_at || new Date(nowMs - oneDayMs * 10).toISOString(),
          end_at: exam.end_at || new Date(nowMs + oneDayMs * 20).toISOString(),
          avg_score: exam.avg_score || 45.2,
          total_participants: 34
        },
        attempts
      }
    };
  }
  try {
    const data = await teacherServices.getOnlineExamStats(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllHomework = async (page = 1, search = "") => {
  if (isDemo()) {
    let list = [...MOCK_HOMEWORKS];
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(h => h.title.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q));
    }
    return {
      success: true,
      data: list
    };
  }
  try {
    const data = await teacherServices.getAssignments(page, search);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentsByGrade = async (gradeId) => {
  if (isDemo()) {
    const list = gradeId === "all" || !gradeId ? MOCK_HOMEWORKS : MOCK_HOMEWORKS.filter(h => String(h.grade_id) === String(gradeId));
    return { success: true, data: list };
  }
  try {
    const data = await teacherServices.getAssignmentsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentDetails = async (assignmentId) => {
  if (isDemo()) {
    const hw = MOCK_HOMEWORKS.find(h => String(h.id) === String(assignmentId)) || MOCK_HOMEWORKS[0];
    return {
      success: true,
      data: {
        ...hw,
        submissions: MOCK_50_STUDENTS.slice(0, 30).map((s, idx) => ({
          student_id: s.id,
          student_name: s.full_name,
          barcode: s.barcode,
          submitted_at: new Date(nowMs - oneDayMs * 2).toISOString(),
          score: Math.max(8, hw.full_mark - (idx % 3)),
          full_mark: hw.full_mark,
          status: "graded",
          feedback: "إجابة ممتازة وخط منظم واستخراج دقيق للشواهد"
        }))
      }
    };
  }
  try {
    const data = await teacherServices.getAssignmentById(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const changeTeacherPassword = async () => {
  if (isDemo()) return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
  return { success: false, error: "Not implemented in demo" };
};

const updateTeacherProfileImageAction = async () => {
  if (isDemo()) {
    return {
      success: true,
      message: "تم تحديث الصورة الشخصية بنجاح",
      data: {
        profile_image: "https://ui-avatars.com/api/?name=محمد+بشتة&background=009966&color=fff&size=200"
      }
    };
  }
  return { success: false, error: "Not implemented in demo" };
};

const deleteTeacherProfileImageAction = async () => {
  if (isDemo()) return { success: true, message: "تم حذف الصورة الشخصية بنجاح" };
  return { success: false, error: "Not implemented in demo" };
};

const downloadAssignmentAction = async (filePath, fileName) => {
  if (isDemo()) return { success: true };
  try {
    const fullUrl = `${apiUrl.replace("/api", "")}/${filePath.replace(/^\//, "")}`;
    await downloadFile(fullUrl, fileName || "واجب.pdf");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadVideoFileAction = async (filePath, fileName) => {
  if (isDemo()) return { success: true };
  try {
    const fullUrl = `${apiUrl.replace("/api", "")}/${filePath.replace(/^\//, "")}`;
    await downloadFile(fullUrl, fileName || "ملف_المحاضرة.pdf");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadQuestionFileAction = async (filePath, fileName) => {
  if (isDemo()) return { success: true };
  try {
    const fullUrl = `${apiUrl.replace("/api", "")}/${filePath.replace(/^\//, "")}`;
    await downloadFile(fullUrl, fileName || "ملف_السؤال.pdf");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const previewAssignmentAction = async () => {
  if (isDemo()) return { success: true };
  return { success: true };
};

const previewVideoFileAction = async () => {
  if (isDemo()) return { success: true };
  return { success: true };
};

const previewQuestionFileAction = async () => {
  if (isDemo()) return { success: true };
  return { success: true };
};

const previewStudentAnswerAction = async () => {
  if (isDemo()) return { success: true };
  return { success: true };
};

const downloadAssignment = downloadAssignmentAction;
const downloadVideoFile = downloadVideoFileAction;
const downloadQuestionFile = downloadQuestionFileAction;
const previewAssignment = previewAssignmentAction;
const previewVideoFile = previewVideoFileAction;
const previewQuestionFile = previewQuestionFileAction;
const previewStudentAnswer = previewStudentAnswerAction;

export {
  fetchTeacherProfile,
  fetchTeacherDashboard,
  fetchActivityLog,
  fetchAssistants,
  fetchAssistantById,
  fetchDashboardStats,
  fetchAllStudents,
  searchStudentByBarcode,
  downloadAssignmentAction,
  downloadVideoFileAction,
  downloadQuestionFileAction,
  previewAssignmentAction,
  previewVideoFileAction,
  previewQuestionFileAction,
  previewStudentAnswerAction,
  searchStudentByPhone,
  fetchStudentDetails,
  fetchStudentFullDetails,
  fetchStudentFilters,
  fetchStudentAttendance,
  fetchStudentPayments,
  fetchPayments,
  fetchPaymentCollections,
  fetchUnpaidStudents,
  fetchPaymentOverall,
  fetchStudentsPaymentStatus,
  fetchGradePaymentStats,
  fetchGroupPaymentStats,
  fetchStudentPaperExams,
  fetchStudentExamResults,
  fetchStudentOnlineExams,
  fetchStudentAssignments,
  fetchStudentSubmissions,
  fetchVideosByGrade,
  fetchPlaylistsByGrade,
  fetchExamsByGrade,
  fetchOnlineExamsByGrade,
  fetchExamStats,
  fetchExamResultsByGrade,
  fetchGradeExamResultsStats,
  fetchAttendanceDashboard,
  fetchAttendanceOverview,
  fetchGradeAttendance,
  fetchGroupAttendanceByDate,
  fetchGroupAttendanceByMonth,
  fetchAttendanceSummary,
  fetchCourses,
  fetchPlaylistDetails,
  fetchVideoById,
  fetchAllExams,
  fetchPaperExamResults,
  fetchOnlineExamStats,
  fetchAllHomework,
  fetchAssignmentsByGrade,
  fetchAssignmentDetails,
  changeTeacherPassword,
  updateTeacherProfileImageAction,
  deleteTeacherProfileImageAction,
  downloadAssignment,
  downloadVideoFile,
  downloadQuestionFile,
  previewAssignment,
  previewVideoFile,
  previewQuestionFile,
  previewStudentAnswer,
};
