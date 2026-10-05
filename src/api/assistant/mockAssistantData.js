/* eslint-disable no-unused-vars */
// ============================================================
// COMPREHENSIVE ASSISTANT DEMO DATA STORE & MUTATIONS (V2)
// ============================================================

import * as XLSX from "xlsx";

const STORAGE_KEY = "demo_assistant_store_v6";

export const getTodayDateStr = (date) => {
  if (date) {
    if (typeof date === "string" && date.length >= 10) return date.slice(0, 10);
    const d = new Date(date);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("en-CA");
  }
  return new Date().toLocaleDateString("en-CA");
};

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

const DEFAULT_GRADES = [
  { id: 3, name: "الصف الثالث الثانوي", monthly_price: 250, groups_count: 3, students_count: 35, created_at: "2026-08-01T08:00:00Z" },
  { id: 2, name: "الصف الثاني الثانوي", monthly_price: 220, groups_count: 2, students_count: 10, created_at: "2026-08-01T08:00:00Z" },
  { id: 1, name: "الصف الأول الثانوي", monthly_price: 200, groups_count: 1, students_count: 5, created_at: "2026-08-01T08:00:00Z" },
];

const DEFAULT_GROUPS = [
  { id: 1, grade_id: 3, name: "مجموعة السبت والأربعاء (السنتر)", grade_name: "الصف الثالث الثانوي", days: "السبت,الأربعاء", start_time: "16:30:00", end_time: "18:30:00", room: "القاعة الكبرى", students_count: 20, created_at: "2026-08-05T08:00:00Z" },
  { id: 2, grade_id: 3, name: "مجموعة الأحد والثلاثاء (السنتر)", grade_name: "الصف الثالث الثانوي", days: "الأحد,الثلاثاء", start_time: "17:00:00", end_time: "19:00:00", room: "القاعة 2", students_count: 10, created_at: "2026-08-05T08:00:00Z" },
  { id: 3, grade_id: 3, name: "مجموعة الأونلاين المكثفة", grade_name: "الصف الثالث الثانوي", days: "الجمعة", start_time: "19:00:00", end_time: "21:00:00", room: "بث مباشر", students_count: 5, created_at: "2026-08-05T08:00:00Z" },
  { id: 4, grade_id: 2, name: "مجموعة الخميس (السنتر)", grade_name: "الصف الثاني الثانوي", days: "الخميس", start_time: "15:00:00", end_time: "17:00:00", room: "القاعة 1", students_count: 10, created_at: "2026-08-05T08:00:00Z" },
  { id: 5, grade_id: 1, name: "مجموعة الأونلاين المسائية", grade_name: "الصف الأول الثانوي", days: "السبت", start_time: "20:00:00", end_time: "22:00:00", room: "بث مباشر", students_count: 5, created_at: "2026-08-05T08:00:00Z" },
];

// Generate 50 students: distributed 36 paid, 14 unpaid (so every group has visible unpaid students to pay for!)
const DEFAULT_STUDENTS = STUDENT_NAMES.map((name, i) => {
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

  // 14 Unpaid students strategically placed (e.g. indices: 1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 47, 49)
  const isUnpaid = [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 47, 49].includes(i);
  const isPaid = !isUnpaid;

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
    attendance_percentage: attendanceRate,
    present_days: Math.round(16 * (attendanceRate / 100)),
    attended_days: Math.round(16 * (attendanceRate / 100)),
    total_attendance_days: 16,
    total_days: 16,
    exams_avg: examsAvg,
    payment_status: isPaid ? "paid" : "unpaid",
    paid_status: isPaid ? "paid" : "unpaid",
    subscription_status: isPaid ? "paid" : "unpaid",
    subscription_month: "2026-10",
    is_paid: isPaid,
    required_amount: 250,
    paid_amount: isPaid ? 250 : 0,
    remaining_amount: isPaid ? 0 : 250,
    total_paid: isPaid ? 750 : 500,
    total_required: 750,
    remaining_balance: isPaid ? 0 : 250,
    notes: i % 3 === 0 ? "طالب متميز وملتزم بالحضور" : "",
    created_at: new Date(nowMs - oneDayMs * (60 + (i % 20))).toISOString(),
    profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.split(" ")[0])}&background=1a5d1a&color=fff&size=150`,
  };
});

const DEFAULT_EXAMS = [
  {
    id: 1,
    title: "امتحان شامل - البلاغة والنصوص المتحررة",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: 1,
    group_name: "مجموعة السبت والأربعاء (السنتر)",
    total_degree: 100,
    exam_date: "2026-09-20",
    notes: "امتحان تجريبي شامل على الوحدة الأولى والثانية",
    students_count: 20,
    attended_count: 19,
    average_score: 87.5,
    deleted: 0,
    created_at: "2026-09-18T10:00:00Z",
  },
  {
    id: 2,
    title: "امتحان منتصف الفصل - النحو والقراءة",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: 2,
    group_name: "مجموعة الأحد والثلاثاء (السنتر)",
    total_degree: 80,
    exam_date: "2026-09-25",
    notes: "يشمل إعراب القطعة والبلاغة المقررة",
    students_count: 10,
    attended_count: 10,
    average_score: 72.0,
    deleted: 0,
    created_at: "2026-09-22T10:00:00Z",
  },
  {
    id: 3,
    title: "اختبار تجريبي شامل (نظام البوكليت)",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: "",
    group_name: "جميع مجموعات الصف الثالث",
    total_degree: 60,
    exam_date: "2026-10-01",
    notes: "محاكاة لامتحان نهاية الفصل الدراسي",
    students_count: 35,
    attended_count: 33,
    average_score: 52.4,
    deleted: 0,
    created_at: "2026-09-28T10:00:00Z",
  },
  {
    id: 4,
    title: "اختبار البلاغة التراكمي",
    grade_id: 2,
    grade_name: "الصف الثاني الثانوي",
    group_id: 4,
    group_name: "مجموعة الخميس (السنتر)",
    total_degree: 50,
    exam_date: "2026-09-28",
    notes: "المحسنات البديعية وعلم البيان",
    students_count: 10,
    attended_count: 10,
    average_score: 44.5,
    deleted: 0,
    created_at: "2026-09-26T10:00:00Z",
  },
  {
    id: 5,
    title: "امتحان النحو التأسيسي",
    grade_id: 1,
    grade_name: "الصف الأول الثانوي",
    group_id: 5,
    group_name: "مجموعة الأونلاين المسائية",
    total_degree: 50,
    exam_date: "2026-09-22",
    notes: "كان وأخواتها وكاد وأخواتها مع إعراب الأمثلة",
    students_count: 5,
    attended_count: 5,
    average_score: 46.0,
    deleted: 0,
    created_at: "2026-09-20T10:00:00Z",
  },
];

// Pre-seeded results for exams
const buildInitialExamResults = () => {
  const results = {};
  DEFAULT_EXAMS.forEach((exam) => {
    const list = [];
    DEFAULT_STUDENTS.forEach((st) => {
      const matchGrade = !exam.grade_id || String(st.grade_id) === String(exam.grade_id);
      const matchGroup = !exam.group_id || String(st.group_id) === String(exam.group_id);
      if (matchGrade && matchGroup) {
        const seedScore = Math.max(
          Math.round(exam.total_degree * 0.6),
          Math.round(exam.total_degree * 0.95) - (st.id % 20)
        );
        list.push({
          id: `res-${exam.id}-${st.id}`,
          exam_id: exam.id,
          student_id: st.id,
          full_name: st.full_name,
          student_name: st.full_name,
          barcode: st.barcode,
          degree: seedScore,
          score: seedScore,
          max_score: exam.total_degree,
          total_degree: exam.total_degree,
          status: seedScore >= exam.total_degree * 0.5 ? "pass" : "fail",
          notes: seedScore >= exam.total_degree * 0.85 ? "ممتاز" : "جيد جداً",
          created_at: exam.exam_date,
        });
      }
    });
    results[exam.id] = list;
  });
  return results;
};

// Pre-seeded payments (36 paid in October)
const buildInitialPayments = () => {
  const list = [];
  let paymentId = 1;

  // September: everyone paid
  DEFAULT_STUDENTS.forEach((st) => {
    list.push({
      id: paymentId++,
      student_id: st.id,
      student_name: st.full_name,
      full_name: st.full_name,
      barcode: st.barcode,
      grade_id: st.grade_id,
      grade_name: st.grade_name,
      group_id: st.group_id,
      group_name: st.group_name,
      amount: 250,
      payment_mode: "normal",
      payment_date: "2026-09-05T16:00:00Z",
      notes: "سداد شهر سبتمبر",
      month: "2026-09",
      created_at: "2026-09-05T16:00:00Z",
    });
  });

  // October: only the paid students
  DEFAULT_STUDENTS.filter((s) => s.payment_status === "paid").forEach((st, idx) => {
    list.push({
      id: paymentId++,
      student_id: st.id,
      student_name: st.full_name,
      full_name: st.full_name,
      barcode: st.barcode,
      grade_id: st.grade_id,
      grade_name: st.grade_name,
      group_id: st.group_id,
      group_name: st.group_name,
      amount: 250,
      payment_mode: idx % 8 === 0 ? "custom" : "normal",
      payment_date: new Date(nowMs - oneDayMs * (idx % 10 + 1)).toISOString(),
      notes: idx % 8 === 0 ? "خصم تفوق أكاديمي" : "سداد شهر أكتوبر",
      month: "2026-10",
      created_at: new Date(nowMs - oneDayMs * (idx % 10 + 1)).toISOString(),
    });
  });

  return list;
};

const buildInitialActivityLog = () => [
  {
    id: 1,
    action: "create_payment",
    details: "تسجيل دفعة شهر أكتوبر للطالب أحمد محمود سالم (250 ج.م)",
    user_name: "أ / أحمد طارق",
    role: "assistant",
    entity_type: "payment",
    created_at: new Date(nowMs - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    action: "start_session",
    details: "بدء جلسة حضور لمجموعة السبت والأربعاء (السنتر)",
    user_name: "أ / أحمد طارق",
    role: "assistant",
    entity_type: "attendance_session",
    created_at: new Date(nowMs - 1000 * 60 * 50).toISOString(),
  },
  {
    id: 3,
    action: "update_student",
    details: "تعديل بيانات الطالبة مريم مصطفى الشناوي",
    user_name: "أ / أحمد طارق",
    role: "assistant",
    entity_type: "student",
    created_at: new Date(nowMs - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 4,
    action: "create_student",
    details: "تسجيل طالب جديد: جاسر أيمن كساب (باركود 0060)",
    user_name: "أ / أحمد طارق",
    role: "assistant",
    entity_type: "student",
    created_at: new Date(nowMs - oneDayMs).toISOString(),
  },
  {
    id: 5,
    action: "create_payment",
    details: "تسجيل دفعة شهر أكتوبر للطالبة فاطمة طارق حسن (250 ج.م)",
    user_name: "أ / أحمد طارق",
    role: "assistant",
    entity_type: "payment",
    created_at: new Date(nowMs - oneDayMs * 1.5).toISOString(),
  },
];

const DEFAULT_PROFILE = {
  id: 1,
  full_name: "أ / أحمد طارق",
  name: "أ / أحمد طارق",
  phone: "01099887766",
  email: "ahmed.tarek@benben.cloud",
  role: "assistant",
  permissions: "center_management",
  center_name: "سنتر النخبة التعليمي - القاهرة",
  created_at: "2026-08-01T10:00:00.000Z",
  profile_image: "https://ui-avatars.com/api/?name=أحمد+طارق&background=1a5d1a&color=fff&size=200",
};

// ============================================================
// ONLINE SUITE INITIAL DATA (VIDEOS, PLAYLISTS, ONLINE EXAMS, ASSIGNMENTS)
// ============================================================

const DEFAULT_VIDEOS = [
  {
    id: 1,
    title: "المحاضرة 1: همزة الوصل والقطع وأنواع الواو في آخر الكلمة",
    description: "شرح تفصيلي لقواعد الوحدة الأولى مع حل 50 سؤال تطبيقي من كتاب الامتحان وبنك المعرفة.",
    url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    playlist_id: 1,
    playlist_name: "كورس النحو الشامل - الثانوية العامة",
    is_free: 1,
    views: 1840,
    duration: "45:20",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    created_at: "2026-09-01T10:00:00Z",
    deleted: 0,
  },
  {
    id: 2,
    title: "المحاضرة 2: الأفعال الناقصة والتامة (كان وأخواتها وكاد وأخواتها)",
    description: "تطبيق عملي على التمييز بين كان التامة والناقصة مع إعراب جمل شائكة.",
    url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    playlist_id: 1,
    playlist_name: "كورس النحو الشامل - الثانوية العامة",
    is_free: 0,
    views: 1420,
    duration: "52:10",
    thumbnail: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80",
    created_at: "2026-09-08T10:00:00Z",
    deleted: 0,
  },
  {
    id: 3,
    title: "المحاضرة 3: إعمال اسم الفاعل وصيغ المبالغة واسم المفعول",
    description: "شروط إعمال المشتقات وشرح شواهد النحو وإعراب معمول اسم الفاعل واسم المفعول.",
    url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    playlist_id: 1,
    playlist_name: "كورس النحو الشامل - الثانوية العامة",
    is_free: 0,
    views: 1190,
    duration: "58:40",
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80",
    created_at: "2026-09-15T10:00:00Z",
    deleted: 0,
  },
  {
    id: 4,
    title: "بلاغة 1: المحسنات البديعية اللفظية والمعنوية (الطباق والمقابلة والجناس)",
    description: "كيفية استخراج المحسنات البديعية وتحديد أثرها الفني في سياق نصوص الامتحان.",
    url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    playlist_id: 2,
    playlist_name: "سلسلة البلاغة من الصفر للاحتراف",
    is_free: 1,
    views: 2200,
    duration: "40:15",
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80",
    created_at: "2026-09-05T10:00:00Z",
    deleted: 0,
  },
  {
    id: 5,
    title: "بلاغة 2: علم البيان (التشبيه والاستعارة التصريحية والمكنية)",
    description: "شرح مبسط للتفرقة بين التشبيه البليغ والاستعارة المكنية مع أمثلة شعرية متحررة.",
    url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    playlist_id: 2,
    playlist_name: "سلسلة البلاغة من الصفر للاحتراف",
    is_free: 0,
    views: 1650,
    duration: "49:30",
    thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&q=80",
    created_at: "2026-09-12T10:00:00Z",
    deleted: 0,
  },
  {
    id: 6,
    title: "نصوص متحررة: نص غربة وحنين لأحمد شوقي (تحليل كامل)",
    description: "دراسة نقدية وبلاغية لنص غربة وحنين والتدريب على نمط أسئلة امتحانات الثانوية العامة الحديثة.",
    url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    playlist_id: 3,
    playlist_name: "مراجعات النصوص والقراءة المتحررة",
    is_free: 0,
    views: 1310,
    duration: "63:00",
    thumbnail: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80",
    created_at: "2026-09-20T10:00:00Z",
    deleted: 0,
  },
  {
    id: 7,
    title: "شرح درس إعراب الفعل المضارع وبناء الأفعال (الصف الثاني الثانوي)",
    description: "نصب وجزم ورفع الفعل المضارع وأدوات الجزم التي تجزم فعلين.",
    url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
    grade_id: 2,
    grade_name: "الصف الثاني الثانوي",
    playlist_id: 4,
    playlist_name: "منهج الصف الثاني الثانوي - الترم الأول",
    is_free: 1,
    views: 950,
    duration: "38:45",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
    created_at: "2026-09-10T10:00:00Z",
    deleted: 0,
  },
  {
    id: 8,
    title: "تأسيس النحو: الجملة الاسمية والخبر وأنواعه (الصف الأول الثانوي)",
    description: "شرح تأسيسي مفصل لطلاب الصف الأول الثانوي مع تدريبات متدرجة الصعوبة.",
    url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
    grade_id: 1,
    grade_name: "الصف الأول الثانوي",
    playlist_id: 5,
    playlist_name: "تأسيس الصف الأول الثانوي",
    is_free: 1,
    views: 1120,
    duration: "35:10",
    thumbnail: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=500&q=80",
    created_at: "2026-09-14T10:00:00Z",
    deleted: 0,
  },
];

const DEFAULT_PLAYLISTS = [
  {
    id: 1,
    playlist_id: 1,
    title: "كورس النحو الشامل - الثانوية العامة",
    description: "شرح كامل لجميع وحدات النحو السبعة مع حل بنك أسئلة الوزارة ونماذج الامتحانات.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    price: 250,
    videos_count: 3,
    video_ids: [1, 2, 3],
    cover_image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    created_at: "2026-08-25T10:00:00Z",
    deleted: 0,
  },
  {
    id: 2,
    playlist_id: 2,
    title: "سلسلة البلاغة من الصفر للاحتراف",
    description: "تبسيط علوم البلاغة (البيان، البديع، المعاني) والتجربة الشعرية.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    price: 180,
    videos_count: 2,
    video_ids: [4, 5],
    cover_image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80",
    created_at: "2026-08-28T10:00:00Z",
    deleted: 0,
  },
  {
    id: 3,
    playlist_id: 3,
    title: "مراجعات النصوص والقراءة المتحررة",
    description: "حل تدريبات نصوص وقراءة متحررة بنظام البوكليت الحديث مع استخراج الفكر الرئيسية.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    price: 150,
    videos_count: 1,
    video_ids: [6],
    cover_image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80",
    created_at: "2026-09-02T10:00:00Z",
    deleted: 0,
  },
  {
    id: 4,
    playlist_id: 4,
    title: "منهج الصف الثاني الثانوي - الترم الأول",
    description: "شرح مقرر النحو والبلاغة والأدب لطلاب الصف الثاني الثانوي.",
    grade_id: 2,
    grade_name: "الصف الثاني الثانوي",
    price: 200,
    videos_count: 1,
    video_ids: [7],
    cover_image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
    created_at: "2026-09-05T10:00:00Z",
    deleted: 0,
  },
  {
    id: 5,
    playlist_id: 5,
    title: "تأسيس الصف الأول الثانوي",
    description: "كورس تأسيسي قوي وشرح منهج الترم الأول في اللغة العربية.",
    grade_id: 1,
    grade_name: "الصف الأول الثانوي",
    price: 180,
    videos_count: 1,
    video_ids: [8],
    cover_image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=500&q=80",
    created_at: "2026-09-05T10:00:00Z",
    deleted: 0,
  },
];

const DEFAULT_ONLINE_EXAMS = [
  {
    id: 1,
    title: "امتحان إلكتروني: الوحدة الأولى نحو (همزة القطع والوصل)",
    description: "امتحان إلكتروني محدد بوقت يشمل أسئلة اختيار من متعدد وسؤال مقالي مع تصحيح فوري.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: 1,
    group_name: "مجموعة السبت والأربعاء (السنتر)",
    duration_minutes: 45,
    full_mark: 30,
    start_at: "2026-10-01T08:00",
    end_at: "2026-10-30T23:59",
    randomize_questions: 1,
    questions_count: 5,
    students_attempted: 18,
    status: "active",
    created_at: "2026-09-28T10:00:00Z",
    deleted: 0,
  },
  {
    id: 2,
    title: "اختبار البلاغة الشامل: التشبيه والاستعارة والمحسنات",
    description: "اختبار إلكتروني لقياس نواتج التعلم في فرع البلاغة للثانوية العامة.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: 2,
    group_name: "مجموعة الأحد والثلاثاء (السنتر)",
    duration_minutes: 30,
    full_mark: 20,
    start_at: "2026-10-02T10:00",
    end_at: "2026-10-25T23:59",
    randomize_questions: 0,
    questions_count: 4,
    students_attempted: 9,
    status: "active",
    created_at: "2026-09-30T10:00:00Z",
    deleted: 0,
  },
  {
    id: 3,
    title: "امتحان تشخيصي قصير: الأفعال الناقصة والتامة",
    description: "كويز سريع للتدريب على كان التامة وكان الناقصة وأفعال المقاربة والرجاء والشروع.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: "",
    group_name: "جميع مجموعات الصف الثالث",
    duration_minutes: 20,
    full_mark: 15,
    start_at: "2026-09-20T12:00",
    end_at: "2026-09-27T23:59",
    randomize_questions: 1,
    questions_count: 3,
    students_attempted: 32,
    status: "ended",
    created_at: "2026-09-19T10:00:00Z",
    deleted: 0,
  },
  {
    id: 4,
    title: "امتحان إلكتروني: إعراب الفعل المضارع (تانية ثانوي)",
    description: "امتحان أونلاين على حالات جزم ونصب الفعل المضارع واقتران جواب الشرط بالفاء.",
    grade_id: 2,
    grade_name: "الصف الثاني الثانوي",
    group_id: 4,
    group_name: "مجموعة الخميس (السنتر)",
    duration_minutes: 40,
    full_mark: 25,
    start_at: "2026-10-01T09:00",
    end_at: "2026-10-28T22:00",
    randomize_questions: 0,
    questions_count: 4,
    students_attempted: 9,
    status: "active",
    created_at: "2026-09-29T10:00:00Z",
    deleted: 0,
  },
  {
    id: 5,
    title: "كويز القراءة المتحررة والنصوص (أولى ثانوي)",
    description: "قطعة قراءة متحررة وأسئلة استنتاجية لطلاب الصف الأول الثانوي.",
    grade_id: 1,
    grade_name: "الصف الأول الثانوي",
    group_id: 5,
    group_name: "مجموعة الأونلاين المسائية",
    duration_minutes: 30,
    full_mark: 20,
    start_at: "2026-10-03T18:00",
    end_at: "2026-10-26T23:59",
    randomize_questions: 0,
    questions_count: 3,
    students_attempted: 5,
    status: "active",
    created_at: "2026-10-01T10:00:00Z",
    deleted: 0,
  },
  {
    id: 6,
    title: "امتحان منتصف الشهر التجريبي (شامل)",
    description: "نموذج محاكاة لامتحانات نصف الفصل الدراسي الأول بأسئلة قياس المستويات العليا للتفكير.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: 1,
    group_name: "مجموعة السبت والأربعاء (السنتر)",
    duration_minutes: 60,
    full_mark: 50,
    start_at: "2026-09-15T08:00",
    end_at: "2026-09-22T23:59",
    randomize_questions: 1,
    questions_count: 5,
    students_attempted: 20,
    status: "ended",
    created_at: "2026-09-14T10:00:00Z",
    deleted: 0,
  },
];

const buildInitialQuestions = () => [
  { id: 1, exam_id: 1, question_text: "أي من الكلمات التالية همزتها همزة قطع مع بيان السبب؟", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 1, deleted: 0 },
  { id: 2, exam_id: 1, question_text: "حضر الطالبان (اثنان) - كلمة (اثنان) همزتها وصل لأنها:", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 2, deleted: 0 },
  { id: 3, exam_id: 1, question_text: "نوع الواو في جملة: (المعلمون يشرحون بإخلاص، والطلاب يسمعون):", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 3, deleted: 0 },
  { id: 4, exam_id: 1, question_text: "الرسم الإملائي الصحيح لكلمة (علماء) عند نصبها في جملة (إن ...):", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 4, deleted: 0 },
  { id: 5, exam_id: 1, question_text: "اشرح سبب كتابة الهمزة في كلمة (انطلاق) على هذا النحو ومثّل بجملة من إنشائك.", question_type: "essay", type: "essay", score: 10, mark: 10, order: 5, deleted: 0 },

  { id: 6, exam_id: 2, question_text: "ما نوع التشبيه في قول الشاعر: (العلم نور يهدي الحائرين)؟", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 1, deleted: 0 },
  { id: 7, exam_id: 2, question_text: "(واعتصموا بحبل الله جميعاً) - نوع الصورة البيانية في (حبل الله):", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 2, deleted: 0 },
  { id: 8, exam_id: 2, question_text: "المحسن البديعي بين (يحل لهم الطيبات ويحرم عليهم الخبائث):", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 3, deleted: 0 },
  { id: 9, exam_id: 2, question_text: "وضح سر جمال الاستعارة المكنية في قول الشاعر: (عضنا الدهر بنابه).", question_type: "essay", type: "essay", score: 5, mark: 5, order: 4, deleted: 0 },

  { id: 10, exam_id: 3, question_text: "في قوله تعالى: (وكان حقاً علينا نصر المؤمنين)، خبر كان في الآية الكريمة هو:", question_type: "multiple_choice", type: "mcq", score: 4, mark: 4, order: 1, deleted: 0 },
  { id: 11, exam_id: 3, question_text: "(أصبح الصبح فانتشر الضياء) - الفعل (أصبح) في الجملة السابقة يعد:", question_type: "multiple_choice", type: "mcq", score: 4, mark: 4, order: 2, deleted: 0 },
  { id: 12, exam_id: 3, question_text: "حكم اقتران خبر أفعال المقاربة (كاد، كرب) بأن المصدرية هو:", question_type: "multiple_choice", type: "mcq", score: 4, mark: 4, order: 3, deleted: 0 },
  { id: 21, exam_id: 3, question_text: "بيّن نوع (كان) في جملة: (اجتهد الطالب فكان النجاح) مع إعراب كلمة (النجاح).", question_type: "essay", type: "essay", score: 3, mark: 3, order: 4, deleted: 0 },

  { id: 13, exam_id: 4, question_text: "علامة جزم الفعل المضارع في جملة: (لا تدعُ إلا إلى الخير والفضيلة):", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 1, deleted: 0 },
  { id: 14, exam_id: 4, question_text: "(إن تجتهدوا فستحققون أهدافكم) - سبب اقتران جواب الشرط بالفاء هو أنه:", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 2, deleted: 0 },
  { id: 15, exam_id: 4, question_text: "الفعل المضارع بعد فاء السببية المسبوقة بنفي أو طلب يكون معرباً بـ:", question_type: "multiple_choice", type: "mcq", score: 5, mark: 5, order: 3, deleted: 0 },

  { id: 16, exam_id: 5, question_text: "المغزى الضمني والرسالة التوعوية المستخلصة من مقال حماية البيئة والتغير المناخي:", question_type: "multiple_choice", type: "mcq", score: 10, mark: 10, order: 1, deleted: 0 },
  { id: 17, exam_id: 5, question_text: "علاقة جملة (لأن العلم ركيزة الحضارة) بالجملة التي سبقتها في النص:", question_type: "multiple_choice", type: "mcq", score: 10, mark: 10, order: 2, deleted: 0 },

  { id: 18, exam_id: 6, question_text: "المصدر الصريح القياسي المصوغ من الفعل الخماسي (استبق) هو:", question_type: "multiple_choice", type: "mcq", score: 10, mark: 10, order: 1, deleted: 0 },
  { id: 19, exam_id: 6, question_text: "إعراب كلمة (كلاهما) في جملة: (حضر الطالبان كلاهما طابور الصباح):", question_type: "multiple_choice", type: "mcq", score: 10, mark: 10, order: 2, deleted: 0 },
  { id: 20, exam_id: 6, question_text: "نوع المحسن البديعي وأثره في قول الشاعر: (وسلا مصر هل سلا القلب عنها):", question_type: "multiple_choice", type: "mcq", score: 10, mark: 10, order: 3, deleted: 0 },
];

const buildInitialOptions = () => [
  { id: 1, question_id: 1, option_text: "إحسان (لأنها مصدر رباعي)", is_correct: 1, order: 1 },
  { id: 2, question_id: 1, option_text: "انطلاق (لأنها مصدر خماسي)", is_correct: 0, order: 2 },
  { id: 3, question_id: 1, option_text: "استخراج (لأنها مصدر سداسي)", is_correct: 0, order: 3 },
  { id: 4, question_id: 1, option_text: "امرؤ (لأنها من الأسماء التسعة)", is_correct: 0, order: 4 },

  { id: 5, question_id: 2, option_text: "من الأسماء التسعة الشاذة عن القطع", is_correct: 1, order: 1 },
  { id: 6, question_id: 2, option_text: "لأنها حرف", is_correct: 0, order: 2 },
  { id: 7, question_id: 2, option_text: "لأنها مصدر ثلاثي", is_correct: 0, order: 3 },

  { id: 8, question_id: 3, option_text: "واو الجمع في الأولى وواو الجماعة في الثانية", is_correct: 1, order: 1 },
  { id: 9, question_id: 3, option_text: "واو العطف في كلتيهما", is_correct: 0, order: 2 },
  { id: 10, question_id: 3, option_text: "واو أصلية", is_correct: 0, order: 3 },

  { id: 11, question_id: 4, option_text: "علماءَنا (على السطر)", is_correct: 1, order: 1 },
  { id: 12, question_id: 4, option_text: "علماؤنا (على الواو)", is_correct: 0, order: 2 },
  { id: 13, question_id: 4, option_text: "علمائنا (على نبرة)", is_correct: 0, order: 3 },

  { id: 14, question_id: 6, option_text: "تشبيه بليغ", is_correct: 1, order: 1 },
  { id: 15, question_id: 6, option_text: "تشبيه مجمل", is_correct: 0, order: 2 },
  { id: 16, question_id: 6, option_text: "تشبيه تمثيلي", is_correct: 0, order: 3 },

  { id: 17, question_id: 7, option_text: "استعارة تصريحية", is_correct: 1, order: 1 },
  { id: 18, question_id: 7, option_text: "استعارة مكنية", is_correct: 0, order: 2 },
  { id: 19, question_id: 7, option_text: "تشبيه مفصل", is_correct: 0, order: 3 },

  { id: 20, question_id: 8, option_text: "مقابلة توضح المعنى وتؤكده", is_correct: 1, order: 1 },
  { id: 21, question_id: 8, option_text: "جناس تام", is_correct: 0, order: 2 },
  { id: 22, question_id: 8, option_text: "سجع", is_correct: 0, order: 3 },

  { id: 23, question_id: 10, option_text: "حقاً (خبر كان مقدم منصوب)", is_correct: 1, order: 1 },
  { id: 24, question_id: 10, option_text: "نصر (اسم كان مؤخر)", is_correct: 0, order: 2 },
  { id: 25, question_id: 10, option_text: "المؤمنين (مضاف إليه)", is_correct: 0, order: 3 },
  { id: 26, question_id: 10, option_text: "ضمير مستتر تقديره هو", is_correct: 0, order: 4 },

  { id: 27, question_id: 11, option_text: "فعل تام والصبح فاعل مرفوع", is_correct: 1, order: 1 },
  { id: 28, question_id: 11, option_text: "فعل ناقص والصبح اسمه مرفوع", is_correct: 0, order: 2 },
  { id: 29, question_id: 11, option_text: "فعل متعدٍ لمفعولين", is_correct: 0, order: 3 },

  { id: 30, question_id: 12, option_text: "يقل اقترانه بأن", is_correct: 1, order: 1 },
  { id: 31, question_id: 12, option_text: "يكثر اقترانه بأن", is_correct: 0, order: 2 },
  { id: 32, question_id: 12, option_text: "يجب اقترانه بأن", is_correct: 0, order: 3 },
  { id: 33, question_id: 12, option_text: "يمتنع اقترانه بأن", is_correct: 0, order: 4 },

  { id: 34, question_id: 13, option_text: "حذف حرف العلة", is_correct: 1, order: 1 },
  { id: 35, question_id: 13, option_text: "السكون الظاهر", is_correct: 0, order: 2 },
  { id: 36, question_id: 13, option_text: "حذف النون", is_correct: 0, order: 3 },

  { id: 37, question_id: 14, option_text: "جملة فعلية فعلها مسبوق بالتسويف (السين)", is_correct: 1, order: 1 },
  { id: 38, question_id: 14, option_text: "جملة اسمية مثبتة", is_correct: 0, order: 2 },
  { id: 39, question_id: 14, option_text: "جملة طلبية أمرية", is_correct: 0, order: 3 },

  { id: 40, question_id: 15, option_text: "النصب بأن المضمرة وجوباً", is_correct: 1, order: 1 },
  { id: 41, question_id: 15, option_text: "الجزم في جواب الطلب", is_correct: 0, order: 2 },
  { id: 42, question_id: 15, option_text: "الرفع بالضمة الظاهرة", is_correct: 0, order: 3 },

  { id: 43, question_id: 16, option_text: "ضرورة تكاتف الجهود الدولية لحماية الموارد الطبيعية", is_correct: 1, order: 1 },
  { id: 44, question_id: 16, option_text: "إلغاء النشاط الصناعي والاعتماد على الطبيعة", is_correct: 0, order: 2 },
  { id: 45, question_id: 16, option_text: "الهجرة للمناطق القطبية", is_correct: 0, order: 3 },

  { id: 46, question_id: 17, option_text: "تعليل لما قبله", is_correct: 1, order: 1 },
  { id: 47, question_id: 17, option_text: "نتيجة مترتبة على ما قبله", is_correct: 0, order: 2 },
  { id: 48, question_id: 17, option_text: "تأكيد واستدراك", is_correct: 0, order: 3 },

  { id: 49, question_id: 18, option_text: "استباق (على وزن افتعال)", is_correct: 1, order: 1 },
  { id: 50, question_id: 18, option_text: "سابقة", is_correct: 0, order: 2 },
  { id: 51, question_id: 18, option_text: "تسابُق", is_correct: 0, order: 3 },

  { id: 52, question_id: 19, option_text: "توكيد معنوي مرفوع بالألف لأنه ملحق بالمثنى", is_correct: 1, order: 1 },
  { id: 53, question_id: 19, option_text: "فاعل مرفوع وعلامة رفعه الضمة", is_correct: 0, order: 2 },
  { id: 54, question_id: 19, option_text: "بدل مطابق مرفوع", is_correct: 0, order: 3 },

  { id: 55, question_id: 20, option_text: "جناس تام بين (سلا الأولى) و(سلا الثانية) يحدث جرساً موسيقياً", is_correct: 1, order: 1 },
  { id: 56, question_id: 20, option_text: "طباق سلب يوضح المعنى", is_correct: 0, order: 2 },
  { id: 57, question_id: 20, option_text: "حسن تقسيم يطرب الآذان", is_correct: 0, order: 3 },
];

const buildInitialStudentOnlineExams = () => {
  const attempts = [];
  let attId = 1;

  // 1. Exam 1 (الوحدة الأولى نحو - full_mark: 30) - 18 students
  DEFAULT_STUDENTS.slice(0, 18).forEach((st, idx) => {
    const isSubmitted = idx < 16;
    const score = isSubmitted ? Math.max(20, 30 - (idx % 6) * 2) : null;
    attempts.push({
      id: attId++,
      exam_id: 1,
      student_id: st.id,
      student_name: st.full_name,
      full_name: st.full_name,
      barcode: st.barcode,
      score,
      full_mark: 30,
      status: isSubmitted ? "submitted" : "in_progress",
      started_at: "2026-10-02T14:00:00Z",
      submitted_at: isSubmitted ? "2026-10-02T14:38:00Z" : null,
      created_at: "2026-10-02T14:00:00Z",
    });
  });

  // 2. Exam 2 (اختبار البلاغة - full_mark: 20) - 9 students
  DEFAULT_STUDENTS.slice(20, 29).forEach((st, idx) => {
    const score = Math.max(14, 20 - (idx % 5));
    attempts.push({
      id: attId++,
      exam_id: 2,
      student_id: st.id,
      student_name: st.full_name,
      full_name: st.full_name,
      barcode: st.barcode,
      score,
      full_mark: 20,
      status: "submitted",
      started_at: "2026-10-03T11:00:00Z",
      submitted_at: "2026-10-03T11:26:00Z",
      created_at: "2026-10-03T11:00:00Z",
    });
  });

  // 3. Exam 3 (امتحان تشخيصي قصير: الأفعال الناقصة والتامة - full_mark: 15) - 24 students!
  DEFAULT_STUDENTS.slice(0, 24).forEach((st, idx) => {
    const score = Math.max(10, 15 - (idx % 5));
    attempts.push({
      id: attId++,
      exam_id: 3,
      student_id: st.id,
      student_name: st.full_name,
      full_name: st.full_name,
      barcode: st.barcode,
      score,
      full_mark: 15,
      status: "submitted",
      started_at: "2026-09-22T10:00:00Z",
      submitted_at: "2026-09-22T10:17:00Z",
      created_at: "2026-09-22T10:00:00Z",
    });
  });

  // 4. Exam 4 (إعراب الفعل المضارع - full_mark: 25) - 9 students
  DEFAULT_STUDENTS.slice(25, 34).forEach((st, idx) => {
    const score = Math.max(18, 25 - (idx % 4) * 2);
    attempts.push({
      id: attId++,
      exam_id: 4,
      student_id: st.id,
      student_name: st.full_name,
      full_name: st.full_name,
      barcode: st.barcode,
      score,
      full_mark: 25,
      status: "submitted",
      started_at: "2026-10-02T09:00:00Z",
      submitted_at: "2026-10-02T09:35:00Z",
      created_at: "2026-10-02T09:00:00Z",
    });
  });

  // 5. Exam 5 (كويز القراءة المتحررة - full_mark: 20) - 5 students
  DEFAULT_STUDENTS.slice(35, 40).forEach((st, idx) => {
    const score = Math.max(15, 20 - (idx % 3) * 2);
    attempts.push({
      id: attId++,
      exam_id: 5,
      student_id: st.id,
      student_name: st.full_name,
      full_name: st.full_name,
      barcode: st.barcode,
      score,
      full_mark: 20,
      status: "submitted",
      started_at: "2026-10-03T18:00:00Z",
      submitted_at: "2026-10-03T18:24:00Z",
      created_at: "2026-10-03T18:00:00Z",
    });
  });

  // 6. Exam 6 (امتحان منتصف الشهر التجريبي الشامل - full_mark: 50) - 20 students
  DEFAULT_STUDENTS.slice(0, 20).forEach((st, idx) => {
    const score = Math.max(38, 50 - (idx % 6) * 2);
    attempts.push({
      id: attId++,
      exam_id: 6,
      student_id: st.id,
      student_name: st.full_name,
      full_name: st.full_name,
      barcode: st.barcode,
      score,
      full_mark: 50,
      status: "submitted",
      started_at: "2026-09-16T08:00:00Z",
      submitted_at: "2026-09-16T08:52:00Z",
      created_at: "2026-09-16T08:00:00Z",
    });
  });

  return attempts;
};

const buildInitialEssayAnswers = () => [
  {
    id: 1,
    exam_id: 1,
    question_id: 5,
    student_id: 1,
    student_name: "أحمد محمود سالم",
    barcode: "0011",
    question_text: "اشرح سبب كتابة الهمزة في كلمة (انطلاق) على هذا النحو ومثّل بجملة من إنشائك.",
    answer_text: "همزة وصل لأنها مصدر لفعل خماسي (انطلق)، ومثال ذلك: (انطلاق الصاروخ مبهر).",
    score: null,
    is_correct: null,
    created_at: "2026-10-02T14:30:00Z",
  },
  {
    id: 2,
    exam_id: 1,
    question_id: 5,
    student_id: 2,
    student_name: "عمر خالد إبراهيم",
    barcode: "0012",
    question_text: "اشرح سبب كتابة الهمزة في كلمة (انطلاق) على هذا النحو ومثّل بجملة من إنشائك.",
    answer_text: "لأنها مصدر للفعل الخماسي انطلق وهي تبدأ بألف وصل دون همزة.",
    score: null,
    is_correct: null,
    created_at: "2026-10-02T15:00:00Z",
  },
  {
    id: 3,
    exam_id: 3,
    question_id: 21,
    student_id: 1,
    student_name: "أحمد محمود سالم",
    barcode: "0011",
    question_text: "بيّن نوع (كان) في جملة: (اجتهد الطالب فكان النجاح) مع إعراب كلمة (النجاح).",
    answer_text: "(كان) هنا تامة بمعنى تحقق أو حدث، وكلمة (النجاح) تعرب فاعلاً مرفوعاً وعلامة رفعه الضمة الظاهرة.",
    score: null,
    is_correct: null,
    created_at: "2026-09-22T10:15:00Z",
  },
  {
    id: 4,
    exam_id: 3,
    question_id: 21,
    student_id: 3,
    student_name: "محمد عبد الرحمن السيد",
    barcode: "0013",
    question_text: "بيّن نوع (كان) في جملة: (اجتهد الطالب فكان النجاح) مع إعراب كلمة (النجاح).",
    answer_text: "كان تامة، والنجاح فاعل مرفوع بالضمة.",
    score: null,
    is_correct: null,
    created_at: "2026-09-22T10:16:00Z",
  },
];

const DEFAULT_ASSIGNMENTS = [
  {
    id: 1,
    title: "واجب الأسبوع 1: تطبيقات همزة الوصل والقطع والمصادر",
    description: "حل تدريبات النحو من صفحة 12 إلى 15 في الملزمة واستخراج 10 كلمات بها همزة وصل مع التعليل.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: 1,
    group_name: "مجموعة السبت والأربعاء (السنتر)",
    full_mark: 20,
    deadline: "2026-10-10",
    is_closed: 0,
    file_path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "واجب_الأسبوع_الأول.pdf",
    submissions_count: 17,
    created_at: "2026-09-28T10:00:00Z",
    deleted: 0,
  },
  {
    id: 2,
    title: "واجب البلاغة: استخراج المحسنات البديعية والصور البيانية",
    description: "قراءة الأبيات الشعرية المرفقة وتحديد نوع التشبيه والاستعارة مع بيان سر الجمال.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: 2,
    group_name: "مجموعة الأحد والثلاثاء (السنتر)",
    full_mark: 15,
    deadline: "2026-10-12",
    is_closed: 0,
    file_path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "تدريبات_البلاغة_الأسبوعية.pdf",
    submissions_count: 8,
    created_at: "2026-10-01T10:00:00Z",
    deleted: 0,
  },
  {
    id: 3,
    title: "واجب قراءة متحررة: التغيرات المناخية والأمن الغذائي",
    description: "قراءة المقال وحل أسئلة الفهم القرائي والاستنتاج الضمني المقررة.",
    grade_id: 3,
    grade_name: "الصف الثالث الثانوي",
    group_id: "",
    group_name: "جميع مجموعات الصف الثالث",
    full_mark: 10,
    deadline: "2026-09-25",
    is_closed: 1,
    file_path: null,
    file_name: null,
    submissions_count: 31,
    created_at: "2026-09-18T10:00:00Z",
    deleted: 0,
  },
  {
    id: 4,
    title: "واجب إعراب الأفعال المضارعة وجزمها في جواب الطلب",
    description: "إعراب 8 جمل تحتوي على مضارع مجزوم في جواب الطلب ومقترن بالفاء.",
    grade_id: 2,
    grade_name: "الصف الثاني الثانوي",
    group_id: 4,
    group_name: "مجموعة الخميس (السنتر)",
    full_mark: 20,
    deadline: "2026-10-15",
    is_closed: 0,
    file_path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_name: "واجب_النحو_الصف_الثاني.pdf",
    submissions_count: 8,
    created_at: "2026-10-02T10:00:00Z",
    deleted: 0,
  },
  {
    id: 5,
    title: "واجب الجملة الاسمية والخبر التأسيسي",
    description: "استخراج المبتدأ والخبر وتحديد نوع الخبر في الجمل المرفقة.",
    grade_id: 1,
    grade_name: "الصف الأول الثانوي",
    group_id: 5,
    group_name: "مجموعة الأونلاين المسائية",
    full_mark: 15,
    deadline: "2026-10-18",
    is_closed: 0,
    file_path: null,
    file_name: null,
    submissions_count: 5,
    created_at: "2026-10-03T10:00:00Z",
    deleted: 0,
  },
];

const buildInitialSubmissions = () => {
  const subs = [];
  let subId = 1;

  // Assignment 1: 17 submissions out of 20
  DEFAULT_STUDENTS.slice(0, 17).forEach((st, idx) => {
    const isGraded = idx < 12;
    const score = isGraded ? Math.max(16, 20 - (idx % 4)) : null;
    subs.push({
      id: subId++,
      assignment_id: 1,
      student_id: st.id,
      student_name: st.full_name,
      barcode: st.barcode,
      phone: st.phone,
      parent_phone: st.parent_phone,
      score,
      full_mark: 20,
      feedback: isGraded ? (score >= 19 ? "ممتاز جداً حل نموذجي وخط واضح" : "حل جيد راجع السؤال الثالث") : null,
      status: isGraded ? "graded" : "submitted",
      file_path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_name: `حل_واجب_${st.full_name.split(" ")[0]}.pdf`,
      created_at: "2026-10-02T16:00:00Z",
      submission_date: "2026-10-02T16:00:00Z",
    });
  });

  // Assignment 2: 8 submissions out of 10
  DEFAULT_STUDENTS.slice(20, 28).forEach((st, idx) => {
    const isGraded = idx < 5;
    const score = isGraded ? Math.max(12, 15 - (idx % 3)) : null;
    subs.push({
      id: subId++,
      assignment_id: 2,
      student_id: st.id,
      student_name: st.full_name,
      barcode: st.barcode,
      phone: st.phone,
      parent_phone: st.parent_phone,
      score,
      full_mark: 15,
      feedback: isGraded ? "إجابة دقيقة في استخراج الاستعارة" : null,
      status: isGraded ? "graded" : "submitted",
      file_path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      file_name: `حل_البلاغة_${st.full_name.split(" ")[0]}.pdf`,
      created_at: "2026-10-04T12:00:00Z",
      submission_date: "2026-10-04T12:00:00Z",
    });
  });

  return subs;
};

const buildInitialDailyAttendance = () => {
  const todayStr = getTodayDateStr();
  return {
    [todayStr]: {
      // Group 2 (مجموعة الأحد والثلاثاء - السنتر): Morning session already completed
      // Students 21-24 were absent, students 25-30 were present
      "2": {
        "21": {
          id: "att-21-seed",
          student_id: 21,
          group_id: 2,
          grade_id: 3,
          session_id: 991,
          attendance_date: todayStr,
          status: "absent",
          attendance_time: null,
          method: "manual",
          is_makeup: 0,
          notes: "غائب عند إغلاق الجلسة",
        },
        "22": {
          id: "att-22-seed",
          student_id: 22,
          group_id: 2,
          grade_id: 3,
          session_id: 991,
          attendance_date: todayStr,
          status: "absent",
          attendance_time: null,
          method: "manual",
          is_makeup: 0,
          notes: "غائب عند إغلاق الجلسة",
        },
        "23": {
          id: "att-23-seed",
          student_id: 23,
          group_id: 2,
          grade_id: 3,
          session_id: 991,
          attendance_date: todayStr,
          status: "absent",
          attendance_time: null,
          method: "manual",
          is_makeup: 0,
          notes: "غائب عند إغلاق الجلسة",
        },
        "24": {
          id: "att-24-seed",
          student_id: 24,
          group_id: 2,
          grade_id: 3,
          session_id: 991,
          attendance_date: todayStr,
          status: "absent",
          attendance_time: null,
          method: "manual",
          is_makeup: 0,
          notes: "غائب عند إغلاق الجلسة",
        },
        "25": {
          id: "att-25-seed",
          student_id: 25,
          group_id: 2,
          grade_id: 3,
          session_id: 991,
          attendance_date: todayStr,
          status: "present",
          attendance_time: "10:15:00",
          method: "barcode",
          is_makeup: 0,
          notes: "حاضر في الموعد",
        },
        "26": {
          id: "att-26-seed",
          student_id: 26,
          group_id: 2,
          grade_id: 3,
          session_id: 991,
          attendance_date: todayStr,
          status: "present",
          attendance_time: "10:16:00",
          method: "barcode",
          is_makeup: 0,
          notes: "حاضر في الموعد",
        },
      },
    },
  };
};

// ============================================================
// STORE INITIALIZER & PERSISTENCE
// ============================================================

let memoryStore = null;

const loadStore = () => {
  if (memoryStore) return memoryStore;

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        memoryStore = JSON.parse(saved);
        let changed = false;
        if (!memoryStore.dailyAttendance || Object.keys(memoryStore.dailyAttendance).length === 0) {
          memoryStore.dailyAttendance = buildInitialDailyAttendance();
          changed = true;
        }
        if (!memoryStore.activeSessions) {
          memoryStore.activeSessions = {};
          changed = true;
        }
        if (!memoryStore.videos || memoryStore.videos.length === 0) {
          memoryStore.videos = DEFAULT_VIDEOS;
          changed = true;
        }
        if (!memoryStore.playlists || memoryStore.playlists.length === 0) {
          memoryStore.playlists = DEFAULT_PLAYLISTS;
          changed = true;
        }
        if (!memoryStore.questions || memoryStore.questions.length < 20 || !memoryStore.questions.some(q => String(q.exam_id) === "3")) {
          memoryStore.questions = buildInitialQuestions();
          changed = true;
        }
        if (!memoryStore.options || memoryStore.options.length < 50) {
          memoryStore.options = buildInitialOptions();
          changed = true;
        }
        if (!memoryStore.studentOnlineExams || memoryStore.studentOnlineExams.length < 80 || !memoryStore.studentOnlineExams.some(a => String(a.exam_id) === "3")) {
          memoryStore.studentOnlineExams = buildInitialStudentOnlineExams();
          changed = true;
        }
        if (!memoryStore.essayAnswers || memoryStore.essayAnswers.length < 4 || !memoryStore.essayAnswers.some(a => String(a.exam_id) === "3")) {
          memoryStore.essayAnswers = buildInitialEssayAnswers();
          changed = true;
        }
        if (!memoryStore.assignments || memoryStore.assignments.length === 0) {
          memoryStore.assignments = DEFAULT_ASSIGNMENTS;
          changed = true;
        }
        if (!memoryStore.submissions || memoryStore.submissions.length === 0) {
          memoryStore.submissions = buildInitialSubmissions();
          changed = true;
        }
        if (changed) {
          saveStore();
        }
        return memoryStore;
      }
    } catch {
      // fallback
    }
  }

  // Initial fresh state: activeSessions is EMPTY! No session is open until user starts it!
  memoryStore = {
    students: DEFAULT_STUDENTS,
    grades: DEFAULT_GRADES,
    groups: DEFAULT_GROUPS,
    exams: DEFAULT_EXAMS,
    examResults: buildInitialExamResults(),
    payments: buildInitialPayments(),
    activityLog: buildInitialActivityLog(),
    activeSessions: {}, // <--- EMPTY: user must click "بدء الجلسة"
    dailyAttendance: buildInitialDailyAttendance(), // <--- Dynamic attendance records mapped by [date][groupId][studentId]
    profile: DEFAULT_PROFILE,
    videos: DEFAULT_VIDEOS,
    playlists: DEFAULT_PLAYLISTS,
    onlineExams: DEFAULT_ONLINE_EXAMS,
    questions: buildInitialQuestions(),
    options: buildInitialOptions(),
    studentOnlineExams: buildInitialStudentOnlineExams(),
    essayAnswers: buildInitialEssayAnswers(),
    assignments: DEFAULT_ASSIGNMENTS,
    submissions: buildInitialSubmissions(),
  };

  saveStore();
  return memoryStore;
};

const saveStore = () => {
  if (typeof window !== "undefined" && memoryStore) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    } catch (e) {
      console.warn("Could not save assistant demo store to localStorage", e);
    }
  }
};

const logActivity = (action, details, entity_type = "") => {
  const store = loadStore();
  const entry = {
    id: Date.now(),
    action,
    details,
    user_name: store.profile?.full_name || "أ / أحمد طارق",
    role: "assistant",
    entity_type,
    created_at: new Date().toISOString(),
  };
  store.activityLog = [entry, ...(store.activityLog || [])].slice(0, 50);
  saveStore();
};

export const resetDemoAssistantStore = () => {
  memoryStore = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("demo_assistant_store_v1");
  }
  return loadStore();
};

// ============================================================
// PROFILE & DASHBOARD API IMPLEMENTATION
// ============================================================

export const mockGetAssistantProfile = async () => {
  const store = loadStore();
  return store.profile;
};

export const mockUpdateAssistantProfileImage = async (_formData) => {
  const store = loadStore();
  store.profile.profile_image = "https://ui-avatars.com/api/?name=أحمد+طارق&background=009966&color=fff&size=200";
  saveStore();
  logActivity("update_profile", "تم تحديث الصورة الشخصية", "profile");
  return store.profile;
};

export const mockDeleteAssistantProfileImage = async () => {
  const store = loadStore();
  store.profile.profile_image = null;
  saveStore();
  logActivity("update_profile", "تم حذف الصورة الشخصية", "profile");
  return store.profile;
};

export const mockUpdateAssistantPassword = async () => {
  logActivity("update_password", "تم تغيير كلمة المرور بنجاح", "security");
  return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
};

export const mockGetAssistantDashboard = async () => {
  const store = loadStore();
  const students = store.students.filter((s) => !s.deleted);
  const paidStudents = students.filter((s) => s.payment_status === "paid");
  const unpaidStudents = students.filter((s) => s.payment_status === "unpaid");
  const totalPaidMonth = store.payments
    .filter((p) => p.month === "2026-10" || p.payment_date?.startsWith("2026-10"))
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return {
    total_students: students.length,
    present_today: 46,
    absent_today: 4,
    total_grades: store.grades.filter((g) => !g.deleted).length,
    total_groups: store.groups.filter((g) => !g.deleted).length,
    active_online_exams: 6,
    active_assignments: 8,
    pending_grading: 3,
    total_videos: 18,
    total_playlists: 5,
    total_paid_month: totalPaidMonth || 9000,
    unpaid_students: unpaidStudents.length,
    weekly_attendance: [
      { name: "السبت", weekday: "السبت", present: 48, absent: 2, total: 50 },
      { name: "الأحد", weekday: "الأحد", present: 45, absent: 5, total: 50 },
      { name: "الإثنين", weekday: "الإثنين", present: 47, absent: 3, total: 50 },
      { name: "الثلاثاء", weekday: "الثلاثاء", present: 46, absent: 4, total: 50 },
      { name: "الأربعاء", weekday: "الأربعاء", present: 49, absent: 1, total: 50 },
      { name: "الخميس", weekday: "الخميس", present: 44, absent: 6, total: 50 },
      { name: "الجمعة", weekday: "الجمعة", present: 0, absent: 0, total: 0 },
    ],
  };
};

export const mockGetActivityLog = async (entityType = "", date = "", page = 1) => {
  const store = loadStore();
  let list = store.activityLog || [];

  if (entityType) {
    list = list.filter((item) => item.entity_type === entityType);
  }
  if (date) {
    list = list.filter((item) => item.created_at?.slice(0, 10) === date);
  }

  const perPage = 10;
  const start = (page - 1) * perPage;
  const paged = list.slice(start, start + perPage);

  return {
    data: paged,
    pagination: {
      current_page: Number(page),
      last_page: Math.max(1, Math.ceil(list.length / perPage)),
      total: list.length,
      per_page: perPage,
    },
  };
};

// ============================================================
// GRADES API IMPLEMENTATION
// ============================================================

export const mockGetGrades = async () => {
  const store = loadStore();
  return store.grades.filter((g) => !g.deleted);
};

export const mockGetGradesWithGroupsCount = async () => {
  const store = loadStore();
  return store.grades.filter((g) => !g.deleted);
};

export const mockGetGradesWithStudentsCount = async () => {
  const store = loadStore();
  return store.grades.filter((g) => !g.deleted);
};

export const mockGetAllGradesStats = async () => {
  const store = loadStore();
  return store.grades.filter((g) => !g.deleted).map((g) => ({
    id: g.id,
    name: g.name,
    groups_count: g.groups_count,
    students_count: g.students_count,
    active_students: g.students_count,
  }));
};

export const mockGetGradeById = async (id) => {
  const store = loadStore();
  const found = store.grades.find((g) => String(g.id) === String(id));
  if (!found) throw new Error("الصف غير موجود");
  return found;
};

export const mockGetGradeStats = async (id) => {
  const store = loadStore();
  const grade = store.grades.find((g) => String(g.id) === String(id));
  const students = store.students.filter((s) => String(s.grade_id) === String(id) && !s.deleted);
  return {
    total_students: students.length,
    active_students: students.filter((s) => s.is_active).length,
    total_groups: store.groups.filter((grp) => String(grp.grade_id) === String(id) && !grp.deleted).length,
    monthly_price: grade?.monthly_price || 250,
  };
};

export const mockCreateGrade = async (gradeData) => {
  const store = loadStore();
  const newGrade = {
    id: Date.now(),
    name: gradeData.name,
    monthly_price: Number(gradeData.monthly_price) || 200,
    groups_count: 0,
    students_count: 0,
    created_at: new Date().toISOString(),
    deleted: 0,
  };
  store.grades = [newGrade, ...store.grades];
  saveStore();
  logActivity("create_grade", `تم إنشاء صف دراسي جديد: ${newGrade.name}`, "grade");
  return newGrade;
};

export const mockUpdateGrade = async (gradeId, gradeData) => {
  const store = loadStore();
  const idx = store.grades.findIndex((g) => String(g.id) === String(gradeId));
  if (idx === -1) throw new Error("الصف غير موجود");

  store.grades[idx] = {
    ...store.grades[idx],
    ...gradeData,
    monthly_price: gradeData.monthly_price !== undefined ? Number(gradeData.monthly_price) : store.grades[idx].monthly_price,
  };
  saveStore();
  logActivity("update_grade", `تم تحديث بيانات الصف: ${store.grades[idx].name}`, "grade");
  return store.grades[idx];
};

export const mockDeleteGrade = async (gradeId) => {
  const store = loadStore();
  const target = store.grades.find((g) => String(g.id) === String(gradeId));
  store.grades = store.grades.filter((g) => String(g.id) !== String(gradeId));
  saveStore();
  if (target) {
    logActivity("delete_grade", `تم حذف الصف: ${target.name}`, "grade");
  }
  return { success: true };
};

// ============================================================
// GROUPS API IMPLEMENTATION
// ============================================================

export const mockGetGroups = async () => {
  const store = loadStore();
  return store.groups.filter((g) => !g.deleted);
};

export const mockGetGroupsByGrade = async (gradeId) => {
  const store = loadStore();
  return store.groups.filter((g) => !g.deleted && String(g.grade_id) === String(gradeId));
};

export const mockGetGroupById = async (id) => {
  const store = loadStore();
  const found = store.groups.find((g) => String(g.id) === String(id));
  if (!found) throw new Error("المجموعة غير موجودة");
  return found;
};

export const mockGetGroupStats = async (id) => {
  const store = loadStore();
  const students = store.students.filter((s) => String(s.group_id) === String(id) && !s.deleted);
  return {
    total_students: students.length,
    active_students: students.filter((s) => s.is_active).length,
    attendance_rate: 92,
  };
};

export const mockCreateGroup = async (groupData) => {
  const store = loadStore();
  const grade = store.grades.find((g) => String(g.id) === String(groupData.grade_id));
  const newGroup = {
    id: Date.now(),
    grade_id: Number(groupData.grade_id),
    grade_name: grade ? grade.name : "",
    name: groupData.name,
    room: groupData.room || "القاعة الرئيسية",
    days: groupData.days || "",
    start_time: groupData.start_time || "16:00:00",
    end_time: groupData.end_time || "18:00:00",
    students_count: 0,
    created_at: new Date().toISOString(),
    deleted: 0,
  };
  store.groups = [newGroup, ...store.groups];

  if (grade) {
    grade.groups_count = (grade.groups_count || 0) + 1;
  }

  saveStore();
  logActivity("create_group", `تم إنشاء مجموعة جديدة: ${newGroup.name}`, "group");
  return newGroup;
};

export const mockUpdateGroup = async (groupId, groupData) => {
  const store = loadStore();
  const idx = store.groups.findIndex((g) => String(g.id) === String(groupId));
  if (idx === -1) throw new Error("المجموعة غير موجودة");

  const grade = store.grades.find((g) => String(g.id) === String(groupData.grade_id || store.groups[idx].grade_id));
  store.groups[idx] = {
    ...store.groups[idx],
    ...groupData,
    grade_name: grade ? grade.name : store.groups[idx].grade_name,
  };
  saveStore();
  logActivity("update_group", `تم تحديث المجموعة: ${store.groups[idx].name}`, "group");
  return store.groups[idx];
};

export const mockDeleteGroup = async (groupId) => {
  const store = loadStore();
  const target = store.groups.find((g) => String(g.id) === String(groupId));
  store.groups = store.groups.filter((g) => String(g.id) !== String(groupId));
  saveStore();
  if (target) {
    logActivity("delete_group", `تم حذف المجموعة: ${target.name}`, "group");
  }
  return { success: true };
};

// ============================================================
// STUDENTS API IMPLEMENTATION
// ============================================================

export const mockGetStudents = async (page = 1, search = "", gradeId = "", groupId = "", limit = 20) => {
  const store = loadStore();
  let list = store.students.filter((s) => !s.deleted);

  if (search) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.barcode?.includes(q) ||
        s.phone?.includes(q) ||
        s.parent_phone?.includes(q)
    );
  }
  if (gradeId) {
    list = list.filter((s) => String(s.grade_id) === String(gradeId));
  }
  if (groupId) {
    list = list.filter((s) => String(s.group_id) === String(groupId));
  }

  const perPage = Number(limit) || 20;
  const start = (Number(page) - 1) * perPage;
  const paged = list.slice(start, start + perPage);

  return {
    data: paged,
    pagination: {
      current_page: Number(page),
      last_page: Math.max(1, Math.ceil(list.length / perPage)),
      total: list.length,
      per_page: perPage,
    },
  };
};

export const mockGetDeletedStudents = async (page = 1) => {
  const store = loadStore();
  const list = store.students.filter((s) => s.deleted === 1);
  const perPage = 20;
  const start = (Number(page) - 1) * perPage;
  const paged = list.slice(start, start + perPage);

  return {
    data: paged,
    pagination: {
      current_page: Number(page),
      last_page: Math.max(1, Math.ceil(list.length / perPage)),
      total: list.length,
      per_page: perPage,
    },
  };
};

export const mockSearchStudentByBarcode = async (barcode) => {
  const store = loadStore();
  const found = store.students.find((s) => String(s.barcode).trim() === String(barcode).trim());
  if (!found) throw new Error("لم يتم العثور على طالب بهذا الباركود");
  return found;
};

export const mockSearchStudentByPhone = async (phone) => {
  const store = loadStore();
  const found = store.students.find((s) => s.phone === String(phone).trim());
  if (!found) throw new Error("لم يتم العثور على طالب بهذا الهاتف");
  return found;
};

export const mockSearchStudentsByParentPhone = async (parentPhone) => {
  const store = loadStore();
  return store.students.filter((s) => s.parent_phone === String(parentPhone).trim());
};

export const mockGetStudentProfile = async (studentId) => {
  const store = loadStore();
  const found = store.students.find((s) => String(s.id) === String(studentId));
  if (!found) throw new Error("الطالب غير موجود");
  return found;
};

export const mockGetStudentStats = async (studentId) => {
  const store = loadStore();
  const student = store.students.find((s) => String(s.id) === String(studentId));
  if (!student) throw new Error("الطالب غير موجود");

  return {
    attendance_percentage: student.attendance_rate || 90,
    present_days: student.present_days || 15,
    attended_days: student.present_days || 15,
    total_attendance_days: 16,
    total_days: 16,
    total_paid: student.total_paid || 750,
    total_required: 750,
    remaining_balance: student.remaining_balance || 0,
    exams_avg: student.exams_avg || 88,
  };
};

export const mockGetStudentAttendanceHistory = async (studentId) => {
  const dates = [
    "2026-10-04", "2026-10-01", "2026-09-27", "2026-09-24",
    "2026-09-20", "2026-09-17", "2026-09-13", "2026-09-10"
  ];
  return dates.map((d, idx) => ({
    id: `att-${studentId}-${idx}`,
    attendance_date: d,
    session_date: d,
    date: d,
    attended_at: idx === 1 ? null : "16:35:00",
    status: idx === 1 ? 0 : 1,
    is_present: idx === 1 ? 0 : 1,
    group_name: "مجموعة السبت والأربعاء (السنتر)",
    is_makeup: idx === 3 ? 1 : 0,
    notes: idx === 1 ? "غياب بعذر مسبق" : (idx === 3 ? "حضور تعويضي" : "حاضر في الموعد"),
  }));
};

export const mockGetStudentConsecutiveAbsences = async () => [];

export const mockGetStudentPaperExams = async (studentId) => {
  const store = loadStore();
  const st = store.students.find((s) => String(s.id) === String(studentId));
  return store.exams.map((ex) => {
    const seed = Math.max(
      Math.round(ex.total_degree * 0.65),
      Math.round(ex.total_degree * 0.95) - ((st?.id || 1) % 15)
    );
    return {
      id: ex.id,
      exam_id: ex.id,
      title: ex.title,
      exam_name: ex.title,
      degree: seed,
      score: seed,
      student_degree: seed,
      total_degree: ex.total_degree,
      max_score: ex.total_degree,
      exam_date: ex.exam_date,
      date: ex.exam_date,
    };
  });
};

export const mockGetStudentOnlineExams = async () => [
  {
    id: "on-1",
    title: "اختبار إلكتروني تجريبي - النحو الشامل",
    degree: 19,
    max_score: 20,
    total_degree: 20,
    exam_date: "2026-10-02",
  },
  {
    id: "on-2",
    title: "امتحان أسبوعي إلكتروني - تدريبات البلاغة",
    degree: 18,
    max_score: 20,
    total_degree: 20,
    exam_date: "2026-09-26",
  },
];

export const mockGetStudentAssignments = async () => [
  {
    id: "hw-1",
    title: "واجب إعراب وشرح قصيدة المساء",
    deadline: "2026-10-06T23:59:00Z",
    full_mark: 20,
    submission_id: "sub-1",
    submission_score: 20,
    assignment_status: "submitted",
  },
  {
    id: "hw-2",
    title: "تطبيقات النحو على الوحدة الثانية",
    deadline: "2026-09-29T23:59:00Z",
    full_mark: 20,
    submission_id: "sub-2",
    submission_score: 18,
    assignment_status: "submitted",
  },
];

export const mockGetStudentSubmissions = async () => [
  {
    id: "sub-1",
    assignment_title: "واجب إعراب وشرح قصيدة المساء",
    score: 20,
    full_mark: 20,
    submitted_at: "2026-10-05T14:30:00Z",
    feedback: "إجابة نموذجية وممتازة",
    submission_timing: "on_time",
  },
  {
    id: "sub-2",
    assignment_title: "تطبيقات النحو على الوحدة الثانية",
    score: 18,
    full_mark: 20,
    submitted_at: "2026-09-28T19:20:00Z",
    feedback: "ممتاز، راجع إعراب المفعول معه",
    submission_timing: "on_time",
  },
];

export const mockGetStudentPlaylists = async () => [
  {
    id: "pl-1",
    title: "شرح منهج البلاغة والنقد - الترم الأول",
    videos_count: 6,
    thumbnail_url: null,
  },
  {
    id: "pl-2",
    title: "كورس النحو الشامل والمراجعات الدورية",
    videos_count: 8,
    thumbnail_url: null,
  },
];

export const mockGetStudentPayments = async (studentId) => {
  const store = loadStore();
  return store.payments.filter((p) => String(p.student_id) === String(studentId));
};

export const mockGetStudentCurrentSubscription = async (studentId) => {
  const store = loadStore();
  const student = store.students.find((s) => String(s.id) === String(studentId));
  const isPaid = student?.payment_status === "paid";
  return {
    id: `sub-${studentId}-10`,
    student_id: Number(studentId),
    month: "2026-10",
    status: isPaid ? "paid" : "unpaid",
    required_amount: student?.required_amount || 250,
    paid_amount: isPaid ? 250 : 0,
    remaining_amount: isPaid ? 0 : 250,
    price: 250,
  };
};

export const mockGetStudentsByGroup = async (groupId) => {
  const store = loadStore();
  return store.students.filter((s) => !s.deleted && String(s.group_id) === String(groupId));
};

export const mockCreateStudent = async (studentData) => {
  const store = loadStore();
  const grade = store.grades.find((g) => String(g.id) === String(studentData.grade_id));
  const group = store.groups.find((g) => String(g.id) === String(studentData.group_id));

  const newId = Date.now();
  const barcode = studentData.barcode ? String(studentData.barcode).trim() : String(1000 + (store.students.length + 1));

  const newStudent = {
    id: newId,
    full_name: studentData.full_name,
    student_name: studentData.full_name,
    barcode,
    grade_id: Number(studentData.grade_id),
    grade_name: grade ? grade.name : "الصف الثالث الثانوي",
    group_id: Number(studentData.group_id),
    group_name: group ? group.name : "مجموعة السبت والأربعاء",
    phone: studentData.phone || "01000000000",
    parent_phone: studentData.parent_phone || "01100000000",
    is_active: 1,
    status: "active",
    deleted: 0,
    deactivation_reason: null,
    attendance_rate: 100,
    attendance_percentage: 100,
    present_days: 0,
    attended_days: 0,
    total_attendance_days: 0,
    total_days: 0,
    exams_avg: 100,
    payment_status: "paid",
    paid_status: "paid",
    subscription_status: "paid",
    subscription_month: "2026-10",
    is_paid: true,
    required_amount: grade?.monthly_price || 250,
    paid_amount: grade?.monthly_price || 250,
    remaining_amount: 0,
    total_paid: grade?.monthly_price || 250,
    total_required: grade?.monthly_price || 250,
    remaining_balance: 0,
    notes: studentData.notes || "",
    created_at: new Date().toISOString(),
    profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.full_name.split(" ")[0])}&background=1a5d1a&color=fff&size=150`,
  };

  store.students = [newStudent, ...store.students];

  if (grade) grade.students_count = (grade.students_count || 0) + 1;
  if (group) group.students_count = (group.students_count || 0) + 1;

  saveStore();
  logActivity("create_student", `تم تسجيل طالب جديد: ${newStudent.full_name} (باركود ${newStudent.barcode})`, "student");
  return newStudent;
};

export const mockUpdateStudent = async (studentId, studentData) => {
  const store = loadStore();
  const idx = store.students.findIndex((s) => String(s.id) === String(studentId));
  if (idx === -1) throw new Error("الطالب غير موجود");

  const grade = store.grades.find((g) => String(g.id) === String(studentData.grade_id || store.students[idx].grade_id));
  const group = store.groups.find((g) => String(g.id) === String(studentData.group_id || store.students[idx].group_id));

  store.students[idx] = {
    ...store.students[idx],
    ...studentData,
    grade_name: grade ? grade.name : store.students[idx].grade_name,
    group_name: group ? group.name : store.students[idx].group_name,
  };

  saveStore();
  logActivity("update_student", `تم تعديل بيانات الطالب: ${store.students[idx].full_name}`, "student");
  return store.students[idx];
};

export const mockSoftDeleteStudent = async (studentId) => {
  const store = loadStore();
  const st = store.students.find((s) => String(s.id) === String(studentId));
  if (st) {
    st.deleted = 1;
    saveStore();
    logActivity("delete_student", `تم حذف الطالب: ${st.full_name}`, "student");
  }
  return { success: true };
};

export const mockRestoreStudent = async (studentId) => {
  const store = loadStore();
  const st = store.students.find((s) => String(s.id) === String(studentId));
  if (st) {
    st.deleted = 0;
    saveStore();
    logActivity("restore_student", `تم استرجاع الطالب: ${st.full_name}`, "student");
  }
  return { success: true };
};

export const mockHardDeleteStudent = async (studentId) => {
  const store = loadStore();
  const target = store.students.find((s) => String(s.id) === String(studentId));
  store.students = store.students.filter((s) => String(s.id) !== String(studentId));
  saveStore();
  if (target) {
    logActivity("delete_student", `تم الحذف النهائي للطالب: ${target.full_name}`, "student");
  }
  return { success: true };
};

// ============================================================
// ATTENDANCE SESSIONS & SCANNING API IMPLEMENTATION
// ============================================================

export const mockGetActiveSession = async (groupId) => {
  const store = loadStore();
  const session = store.activeSessions?.[groupId];
  return session || null;
};

export const mockStartAttendanceSession = async (sessionData) => {
  const store = loadStore();
  const groupId = sessionData.group_id;
  const group = store.groups.find((g) => String(g.id) === String(groupId));

  const nowIso = new Date().toISOString();
  const newSession = {
    id: Date.now(),
    group_id: Number(groupId),
    group_name: group ? group.name : "مجموعة السنتر",
    status: "active",
    is_makeup_enabled: 0,
    session_date: getTodayDateStr(),
    date: getTodayDateStr(),
    started_at: nowIso,
    lock_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    attendance_count: 0,
    attendance_locked: 0,
    attended_student_ids: [],
  };

  if (!store.activeSessions) store.activeSessions = {};
  store.activeSessions[groupId] = newSession;
  saveStore();
  logActivity("start_session", `بدء جلسة حضور جديدة لمجموعة: ${newSession.group_name}`, "attendance_session");
  return newSession;
};

export const mockLockSession = async (sessionId, groupId) => {
  const store = loadStore();
  let gId = groupId;
  if (!gId) {
    Object.keys(store.activeSessions || {}).forEach((k) => {
      if (String(store.activeSessions[k]?.id) === String(sessionId)) gId = k;
    });
  }

  const todayStr = getTodayDateStr();

  // Automatically mark remaining unrecorded group students as absent
  if (gId) {
    const groupStudents = store.students.filter((s) => !s.deleted && String(s.group_id) === String(gId));
    if (!store.dailyAttendance) store.dailyAttendance = {};
    if (!store.dailyAttendance[todayStr]) store.dailyAttendance[todayStr] = {};
    if (!store.dailyAttendance[todayStr][gId]) store.dailyAttendance[todayStr][gId] = {};

    groupStudents.forEach((st) => {
      const existing = store.dailyAttendance[todayStr][gId][st.id];
      if (!existing || existing.status === "not_marked") {
        store.dailyAttendance[todayStr][gId][st.id] = {
          id: `att-${st.id}-${Date.now()}`,
          student_id: st.id,
          group_id: Number(gId),
          grade_id: Number(st.grade_id),
          session_id: sessionId,
          attendance_date: todayStr,
          status: "absent",
          attendance_time: null,
          method: "manual",
          is_makeup: 0,
          notes: "غائب عند إغلاق الجلسة",
        };
      }
    });

    if (store.activeSessions?.[gId]) {
      const sName = store.activeSessions[gId].group_name;
      store.activeSessions[gId] = {
        ...store.activeSessions[gId],
        status: "locked",
        lock_at: new Date().toISOString(),
      };
      logActivity("lock_session", `إغلاق جلسة الحضور لمجموعة ${sName} وتسجيل الغياب`, "attendance_session");
    }
  }

  saveStore();
  return { success: true, message: "تم إنهاء الجلسة وتسجيل الغياب" };
};

export const mockToggleMakeupMode = async (sessionId) => {
  const store = loadStore();
  let session = null;
  Object.keys(store.activeSessions || {}).forEach((k) => {
    if (String(store.activeSessions[k]?.id) === String(sessionId)) session = store.activeSessions[k];
  });
  if (session) {
    session.is_makeup_enabled = session.is_makeup_enabled === 1 ? 0 : 1;
    saveStore();
    return { is_makeup_enabled: session.is_makeup_enabled };
  }
  return { is_makeup_enabled: 0 };
};

export const mockScanBarcode = async (scanData) => {
  const store = loadStore();
  const rawCode = String(scanData.barcode || scanData.student_barcode || "").trim();

  if (!rawCode) {
    throw new Error("يرجى إدخال كود الباركود");
  }

  // Find student by exact barcode or padded barcode
  const student = store.students.find(
    (s) => String(s.barcode).trim() === rawCode || String(s.barcode).padStart(4, "0") === rawCode.padStart(4, "0")
  );

  if (!student) {
    throw new Error("عفواً، لا يوجد طالب مسجل بهذا الباركود");
  }

  const groupId = scanData.group_id || student.group_id;
  const isMakeup = scanData.is_makeup ? 1 : (String(student.group_id) !== String(groupId) ? 1 : 0);

  const todayStr = getTodayDateStr();
  const nowTime = new Date().toTimeString().slice(0, 8);

  if (!store.dailyAttendance) store.dailyAttendance = {};
  if (!store.dailyAttendance[todayStr]) store.dailyAttendance[todayStr] = {};
  if (!store.dailyAttendance[todayStr][groupId]) store.dailyAttendance[todayStr][groupId] = {};

  const attendanceRecord = {
    id: `att-${student.id}-${Date.now()}`,
    student_id: student.id,
    group_id: Number(groupId),
    grade_id: Number(student.grade_id),
    session_id: scanData.session_id,
    attendance_date: todayStr,
    status: "present",
    attendance_time: nowTime,
    method: "barcode",
    is_makeup: isMakeup,
    notes: isMakeup ? "حضور تعويضي" : "حاضر في الموعد",
  };

  store.dailyAttendance[todayStr][groupId][student.id] = attendanceRecord;

  // Update session counters if active
  if (groupId && store.activeSessions?.[groupId]) {
    const sess = store.activeSessions[groupId];
    if (!sess.attended_student_ids.includes(student.id)) {
      sess.attended_student_ids.push(student.id);
      sess.attendance_count = sess.attended_student_ids.length;
    }
  }

  saveStore();
  logActivity("scan_attendance", `تسجيل حضور الطالب: ${student.full_name} (${isMakeup ? "تعويضي" : "باركود"})`, "attendance");

  return {
    student,
    attendance: attendanceRecord,
    status: "success",
    is_makeup: isMakeup,
    message: isMakeup ? "تم تسجيل حضور الطالب (تعويضي)" : "تم تسجيل حضور الطالب بنجاح",
  };
};

export const mockCreateAttendance = async (attendanceData) => {
  const store = loadStore();
  const date = getTodayDateStr(attendanceData.attendance_date);
  const groupId = attendanceData.group_id;
  const studentId = attendanceData.student_id;

  if (!store.dailyAttendance) store.dailyAttendance = {};
  if (!store.dailyAttendance[date]) store.dailyAttendance[date] = {};
  if (!store.dailyAttendance[date][groupId]) store.dailyAttendance[date][groupId] = {};

  const record = {
    id: `att-${studentId}-${Date.now()}`,
    student_id: Number(studentId),
    group_id: Number(groupId),
    grade_id: Number(attendanceData.grade_id || 0),
    session_id: attendanceData.session_id || null,
    attendance_date: date,
    status: attendanceData.status || "present",
    attendance_time: attendanceData.status === "present" ? (attendanceData.attendance_time || new Date().toTimeString().slice(0, 8)) : null,
    method: attendanceData.method || "manual",
    is_makeup: attendanceData.is_makeup || 0,
    notes: attendanceData.notes || "",
  };

  store.dailyAttendance[date][groupId][studentId] = record;
  saveStore();
  return record;
};

export const mockGetAttendanceById = async (id) => ({
  id,
  status: "present",
  attendance_time: "16:30:00",
});

export const mockUpdateAttendance = async (id, data) => ({
  id,
  ...data,
});

export const mockDeleteAttendance = async (id) => {
  const store = loadStore();
  if (store.dailyAttendance) {
    Object.keys(store.dailyAttendance).forEach((d) => {
      Object.keys(store.dailyAttendance[d]).forEach((grpId) => {
        Object.keys(store.dailyAttendance[d][grpId]).forEach((stId) => {
          if (String(store.dailyAttendance[d][grpId][stId]?.id) === String(id) || String(stId) === String(id)) {
            delete store.dailyAttendance[d][grpId][stId];
          }
        });
      });
    });
    saveStore();
  }
  return { success: true };
};

export const mockGetAttendanceDashboard = async () => {
  const store = loadStore();
  const todayStr = getTodayDateStr();

  let presentToday = 0;
  let absentToday = 0;

  const todayRecords = store.dailyAttendance?.[todayStr] || {};
  Object.values(todayRecords).forEach((groupRecords) => {
    Object.values(groupRecords).forEach((rec) => {
      if (rec.status === "present") presentToday++;
      if (rec.status === "absent") absentToday++;
    });
  });

  const totalStudents = store.students.filter((s) => !s.deleted).length;
  const notMarkedToday = Math.max(0, totalStudents - presentToday - absentToday);

  return {
    total_students: totalStudents,
    present_today: presentToday,
    absent_today: absentToday,
    not_marked_today: notMarkedToday,
    weekly_attendance: [
      { day: "السبت", date: "2026-09-27", present: 48, absent: 2 },
      { day: "الأحد", date: "2026-09-28", present: 45, absent: 5 },
      { day: "الإثنين", date: "2026-09-29", present: 47, absent: 3 },
      { day: "الثلاثاء", date: "2026-09-30", present: 46, absent: 4 },
      { day: "الأربعاء", date: "2026-10-01", present: 49, absent: 1 },
      { day: "الخميس", date: "2026-10-02", present: 44, absent: 6 },
      { day: "اليوم", date: todayStr, present: presentToday, absent: absentToday },
    ],
  };
};

export const mockGetAttendanceOverall = async () => ({
  total_sessions: 48,
  present_rate: 92,
  total_present: 460,
  total_absent: 40,
});

export const mockGetConsecutiveAbsences = async () => [];

export const mockGetGradeAttendance = async (gradeId) => ({
  grade_id: gradeId,
  present_count: 32,
  absent_count: 3,
  total: 35,
});

export const mockGetGroupAttendanceByDate = async (groupId, date) => {
  const store = loadStore();
  const d = getTodayDateStr(date);
  const recordsMap = store.dailyAttendance?.[d]?.[groupId] || {};
  return Object.values(recordsMap);
};

export const mockGetGroupAttendanceByMonth = async () => [];

export const mockGetAttendanceSummary = async (groupId, date) => {
  const store = loadStore();
  const d = getTodayDateStr(date);
  const groupStudents = store.students.filter((s) => !s.deleted && String(s.group_id) === String(groupId));
  const recordsMap = store.dailyAttendance?.[d]?.[groupId] || {};
  const records = Object.values(recordsMap);

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const notMarkedCount = Math.max(0, groupStudents.length - presentCount - absentCount);

  return {
    total_students: groupStudents.length,
    present_count: presentCount,
    absent_count: absentCount,
    not_marked_count: notMarkedCount,
    makeup_count: records.filter((r) => r.is_makeup === 1).length,
  };
};

export const mockGetAbsentByDate = async (date) => {
  const store = loadStore();
  const d = getTodayDateStr(date);

  const gradeMap = {};
  store.grades.forEach((gr) => {
    gradeMap[gr.id] = {
      grade_id: gr.id,
      grade_name: gr.name,
      total_absent: 0,
      groups: {},
    };
  });

  store.groups.forEach((grp) => {
    const grId = grp.grade_id;
    if (gradeMap[grId]) {
      gradeMap[grId].groups[grp.id] = {
        group_id: grp.id,
        group_name: grp.name,
        total_absent: 0,
        students: [],
      };
    }
  });

  const dateAttendance = store.dailyAttendance?.[d] || {};

  Object.keys(dateAttendance).forEach((groupId) => {
    const grpRecords = dateAttendance[groupId] || {};
    Object.values(grpRecords).forEach((rec) => {
      if (rec.status === "absent") {
        const student = store.students.find((s) => s.id === rec.student_id);
        if (student && !student.deleted) {
          const grId = student.grade_id;
          if (!gradeMap[grId]) {
            gradeMap[grId] = {
              grade_id: grId,
              grade_name: student.grade_name || "الصف الدراسي",
              total_absent: 0,
              groups: {},
            };
          }
          if (!gradeMap[grId].groups[groupId]) {
            gradeMap[grId].groups[groupId] = {
              group_id: Number(groupId),
              group_name: student.group_name || "المجموعة",
              total_absent: 0,
              students: [],
            };
          }

          gradeMap[grId].groups[groupId].students.push({
            id: student.id,
            full_name: student.full_name,
            barcode: student.barcode,
            phone: student.phone,
            parent_phone: student.parent_phone,
            attendance_id: rec.id,
            status: "absent",
          });
          gradeMap[grId].groups[groupId].total_absent += 1;
          gradeMap[grId].total_absent += 1;
        }
      }
    });
  });

  const result = Object.values(gradeMap)
    .map((gr) => ({
      ...gr,
      groups: Object.values(gr.groups).filter((g) => g.students.length > 0),
    }))
    .filter((gr) => gr.total_absent > 0);

  return result;
};

// ============================================================
// PAYMENTS API IMPLEMENTATION
// ============================================================

export const mockGetPayments = async (page = 1, search = "", gradeId = "", groupId = "", limit = 20) => {
  const store = loadStore();
  let list = store.payments;

  if (search) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.full_name?.toLowerCase().includes(q) ||
        p.student_name?.toLowerCase().includes(q) ||
        p.barcode?.includes(q)
    );
  }
  if (gradeId) {
    list = list.filter((p) => String(p.grade_id) === String(gradeId));
  }
  if (groupId) {
    list = list.filter((p) => String(p.group_id) === String(groupId));
  }

  const perPage = Number(limit) || 20;
  const start = (Number(page) - 1) * perPage;
  const paged = list.slice(start, start + perPage);

  return {
    data: paged,
    pagination: {
      current_page: Number(page),
      last_page: Math.max(1, Math.ceil(list.length / perPage)),
      total: list.length,
      per_page: perPage,
    },
  };
};

export const mockGetPaymentById = async (paymentId) => {
  const store = loadStore();
  const p = store.payments.find((x) => String(x.id) === String(paymentId));
  if (!p) throw new Error("الدفعة غير موجودة");
  return p;
};

export const mockCreatePayment = async (paymentData) => {
  const store = loadStore();
  const student = store.students.find((s) => String(s.id) === String(paymentData.student_id));
  if (!student) throw new Error("الطالب غير موجود");

  const amount = Number(paymentData.amount) || student.required_amount || 250;
  const newPayment = {
    id: Date.now(),
    student_id: student.id,
    student_name: student.full_name,
    full_name: student.full_name,
    barcode: student.barcode,
    grade_id: student.grade_id,
    grade_name: student.grade_name,
    group_id: student.group_id,
    group_name: student.group_name,
    amount,
    payment_mode: paymentData.payment_mode || "normal",
    payment_date: paymentData.payment_date || new Date().toISOString(),
    notes: paymentData.notes || "سداد اشتراك شهري",
    month: "2026-10",
    created_at: new Date().toISOString(),
  };

  store.payments = [newPayment, ...store.payments];

  // Immediately mark student as fully paid
  student.payment_status = "paid";
  student.paid_status = "paid";
  student.subscription_status = "paid";
  student.is_paid = true;
  student.paid_amount = (student.paid_amount || 0) + amount;
  student.remaining_amount = Math.max(0, (student.remaining_amount || 0) - amount);
  student.remaining_balance = Math.max(0, (student.remaining_balance || 0) - amount);
  student.total_paid = (student.total_paid || 0) + amount;

  saveStore();
  logActivity("create_payment", `تسجيل دفعة بقيمة ${amount} ج.م للطالب ${student.full_name}`, "payment");
  return newPayment;
};

export const mockUpdatePayment = async (paymentId, paymentData) => {
  const store = loadStore();
  const idx = store.payments.findIndex((p) => String(p.id) === String(paymentId));
  if (idx === -1) throw new Error("الدفعة غير موجودة");

  store.payments[idx] = {
    ...store.payments[idx],
    ...paymentData,
    amount: paymentData.amount !== undefined ? Number(paymentData.amount) : store.payments[idx].amount,
  };
  saveStore();
  logActivity("update_payment", `تعديل الدفعة للطالب ${store.payments[idx].full_name}`, "payment");
  return store.payments[idx];
};

export const mockDeletePayment = async (paymentId) => {
  const store = loadStore();
  const target = store.payments.find((p) => String(p.id) === String(paymentId));
  store.payments = store.payments.filter((p) => String(p.id) !== String(paymentId));
  saveStore();
  if (target) {
    logActivity("delete_payment", `حذف دفعة بقيمة ${target.amount} ج.م للطالب ${target.full_name}`, "payment");
  }
  return { success: true };
};

export const mockGetPaymentCollections = async () => ({
  total_month: 9000,
  expected_month: 12500,
  collection_rate: 72,
});

export const mockGetUnpaidStudents = async () => {
  const store = loadStore();
  return store.students.filter((s) => !s.deleted && s.payment_status === "unpaid");
};

export const mockGetPaymentOverall = async () => {
  const store = loadStore();
  const students = store.students.filter((s) => !s.deleted);
  const paidStudents = students.filter((s) => s.payment_status === "paid");
  const unpaidStudents = students.filter((s) => s.payment_status === "unpaid");
  const totalPaid = store.payments
    .filter((p) => p.month === "2026-10" || p.payment_date?.startsWith("2026-10"))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalRequired = students.length * 250;
  const totalRemaining = unpaidStudents.length * 250;

  return {
    total_students: students.length,
    fully_paid: paidStudents.length,
    not_paid: unpaidStudents.length,
    total_paid: totalPaid,
    total_required: totalRequired,
    total_remaining: totalRemaining,
    total_collected: totalPaid,
    target_amount: totalRequired,
    collection_rate: students.length ? Math.round((paidStudents.length / students.length) * 100) : 0,
    paid_students: paidStudents.length,
    unpaid_students: unpaidStudents.length,
  };
};

export const mockGetStudentsPaymentStatus = async (gradeId, groupId, month, search, page = 1, limit = 20) => {
  const store = loadStore();
  let list = store.students.filter((s) => !s.deleted);

  if (gradeId) list = list.filter((s) => String(s.grade_id) === String(gradeId));
  if (groupId) list = list.filter((s) => String(s.group_id) === String(groupId));
  if (search) {
    const q = search.trim().toLowerCase();
    list = list.filter((s) => s.full_name?.toLowerCase().includes(q) || s.barcode?.includes(q));
  }

  const perPage = Number(limit) || 20;
  const start = (Number(page) - 1) * perPage;
  const paged = list.slice(start, start + perPage);

  return {
    data: paged.map((s) => {
      const isPaid = s.payment_status === "paid";
      return {
        id: s.id,
        full_name: s.full_name,
        barcode: s.barcode,
        grade_id: Number(s.grade_id),
        grade_name: s.grade_name,
        group_id: Number(s.group_id),
        group_name: s.group_name,
        status: isPaid ? "paid" : "unpaid",
        payment_status: isPaid ? "paid" : "unpaid",
        subscription_status: isPaid ? "paid" : "unpaid",
        subscription_month: "2026-10",
        required_amount: s.required_amount || 250,
        paid_amount: isPaid ? 250 : 0,
        remaining_amount: isPaid ? 0 : 250,
        total_paid: s.total_paid || (isPaid ? 750 : 500),
        remaining_balance: isPaid ? 0 : 250,
        phone: s.phone,
        parent_phone: s.parent_phone,
      };
    }),
    pagination: {
      current_page: Number(page),
      last_page: Math.max(1, Math.ceil(list.length / perPage)),
      total: list.length,
      per_page: perPage,
    },
  };
};

export const mockGetStudentSubscriptions = async (studentId) => {
  const store = loadStore();
  const student = store.students.find((s) => String(s.id) === String(studentId));
  const isPaid = student?.payment_status === "paid";
  return [
    {
      id: `sub-${studentId}-10`,
      student_id: Number(studentId),
      month: "2026-10",
      status: isPaid ? "paid" : "unpaid",
      required_amount: student?.required_amount || 250,
      paid_amount: isPaid ? 250 : 0,
      remaining_amount: isPaid ? 0 : 250,
      price: 250,
    },
    {
      id: `sub-${studentId}-09`,
      student_id: Number(studentId),
      month: "2026-09",
      status: "paid",
      required_amount: 250,
      paid_amount: 250,
      remaining_amount: 0,
      price: 250,
    },
  ];
};

export const mockCreateSubscription = async (subscriptionData) => {
  logActivity("create_subscription", "تم إنشاء اشتراك شهري جديد", "subscription");
  return { success: true, data: { id: Date.now() } };
};

export const mockGetSubscriptionOverall = async () => ({
  active_subscriptions: 36,
  expired_subscriptions: 14,
  total_amount: 9000,
});

// ============================================================
// EXAMS (PAPER) API IMPLEMENTATION
// ============================================================

export const mockGetExams = async (page = 1) => {
  const store = loadStore();
  const list = store.exams.filter((e) => !e.deleted);
  const perPage = 10;
  const start = (Number(page) - 1) * perPage;
  const paged = list.slice(start, start + perPage);

  return {
    data: paged,
    pagination: {
      current_page: Number(page),
      last_page: Math.max(1, Math.ceil(list.length / perPage)),
      total: list.length,
      per_page: perPage,
    },
  };
};

export const mockGetExamsByGrade = async (gradeId) => {
  const store = loadStore();
  return store.exams.filter((e) => !e.deleted && String(e.grade_id) === String(gradeId));
};

export const mockGetExamsByGroup = async (groupId) => {
  const store = loadStore();
  return store.exams.filter((e) => !e.deleted && String(e.group_id) === String(groupId));
};

export const mockGetExamById = async (examId) => {
  const store = loadStore();
  const found = store.exams.find((e) => String(e.id) === String(examId));
  if (!found) throw new Error("الامتحان غير موجود");
  return found;
};

export const mockGetExamStats = async (examId) => {
  const store = loadStore();
  const exam = store.exams.find((e) => String(e.id) === String(examId));
  const results = store.examResults[examId] || [];

  const targetStudents = store.students.filter((st) => {
    if (st.deleted) return false;
    if (exam?.grade_id && String(st.grade_id) !== String(exam.grade_id)) return false;
    if (exam?.group_id && String(st.group_id) !== String(exam.group_id)) return false;
    return true;
  });

  const validResults = results.filter((r) => r.degree !== "" && r.degree !== null && r.degree !== undefined);
  const scores = validResults.map((r) => Number(r.degree) || 0);

  const totalDeg = Number(exam?.total_degree) || 100;
  const count = validResults.length > 0 ? validResults.length : (targetStudents.length || exam?.students_count || 20);

  let avg, max, min, passedCount, failedCount;

  if (validResults.length > 0) {
    avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    max = Math.max(...scores);
    min = Math.min(...scores);
    const passing = validResults.filter((r) => r.status === "pass" || (Number(r.degree) >= totalDeg * 0.5)).length;
    passedCount = passing;
    failedCount = validResults.length - passing;
  } else {
    avg = exam?.average_score ? Number(exam.average_score) : Math.round(totalDeg * 0.78 * 10) / 10;
    max = Math.round(totalDeg * 0.98);
    min = Math.round(totalDeg * 0.45);
    passedCount = Math.round(count * 0.85);
    failedCount = Math.max(0, count - passedCount);
  }

  return {
    students_count: count,
    average_degree: avg,
    highest_degree: max,
    lowest_degree: min,
    passed_count: passedCount,
    failed_count: failedCount,

    total_students: count,
    attended: count,
    absent: 0,
    average_score: avg,
    pass_rate: count > 0 ? Math.round((passedCount / count) * 100) : 0,
    highest_score: max,
    lowest_score: min,
  };
};

export const mockCreateExam = async (examData) => {
  const store = loadStore();
  const grade = store.grades.find((g) => String(g.id) === String(examData.grade_id));
  const group = store.groups.find((g) => String(g.id) === String(examData.group_id));

  const targetStudents = store.students.filter((st) => {
    if (st.deleted) return false;
    if (examData.grade_id && String(st.grade_id) !== String(examData.grade_id)) return false;
    if (examData.group_id && String(st.group_id) !== String(examData.group_id)) return false;
    return true;
  });

  const totalDeg = Number(examData.total_degree) || 100;
  const count = targetStudents.length > 0 ? targetStudents.length : 20;

  const newExam = {
    id: Date.now(),
    title: examData.title,
    grade_id: Number(examData.grade_id),
    grade_name: grade ? grade.name : "الصف الثالث الثانوي",
    group_id: examData.group_id ? Number(examData.group_id) : "",
    group_name: group ? group.name : "جميع مجموعات الصف",
    total_degree: totalDeg,
    exam_date: examData.exam_date || getTodayDateStr(),
    notes: examData.notes || "",
    students_count: count,
    attended_count: Math.round(count * 0.9),
    average_score: Math.round(totalDeg * 0.78 * 10) / 10,
    deleted: 0,
    created_at: new Date().toISOString(),
  };

  store.exams = [newExam, ...store.exams];
  store.examResults[newExam.id] = [];

  saveStore();
  logActivity("create_exam", `تم إنشاء امتحان جديد: ${newExam.title}`, "exam");
  return newExam;
};

export const mockUpdateExam = async (examId, examData) => {
  const store = loadStore();
  const idx = store.exams.findIndex((e) => String(e.id) === String(examId));
  if (idx === -1) throw new Error("الامتحان غير موجود");

  const grade = store.grades.find((g) => String(g.id) === String(examData.grade_id || store.exams[idx].grade_id));
  const group = store.groups.find((g) => String(g.id) === String(examData.group_id || store.exams[idx].group_id));

  store.exams[idx] = {
    ...store.exams[idx],
    ...examData,
    grade_name: grade ? grade.name : store.exams[idx].grade_name,
    group_name: group ? group.name : store.exams[idx].group_name,
    total_degree: examData.total_degree !== undefined ? Number(examData.total_degree) : store.exams[idx].total_degree,
  };

  saveStore();
  logActivity("update_exam", `تعديل الامتحان: ${store.exams[idx].title}`, "exam");
  return store.exams[idx];
};

export const mockDeleteExam = async (examId) => {
  const store = loadStore();
  const target = store.exams.find((e) => String(e.id) === String(examId));
  store.exams = store.exams.filter((e) => String(e.id) !== String(examId));
  saveStore();
  if (target) {
    logActivity("delete_exam", `حذف الامتحان: ${target.title}`, "exam");
  }
  return { success: true };
};

// ============================================================
// EXAM RESULTS API IMPLEMENTATION
// ============================================================

export const mockGetExamResults = async (examId) => {
  const store = loadStore();
  return store.examResults[examId] || [];
};

export const mockUpsertExamResult = async (resultData) => {
  const store = loadStore();
  const examId = resultData.exam_id;
  if (!store.examResults[examId]) {
    store.examResults[examId] = [];
  }

  const exam = store.exams.find((e) => String(e.id) === String(examId));
  const student = store.students.find((s) => String(s.id) === String(resultData.student_id));
  const maxScore = exam?.total_degree || 100;
  const score = Number(resultData.degree || resultData.score || 0);

  const idx = store.examResults[examId].findIndex((r) => String(r.student_id) === String(resultData.student_id));
  const record = {
    id: idx !== -1 ? store.examResults[examId][idx].id : `res-${examId}-${resultData.student_id}`,
    exam_id: Number(examId),
    student_id: Number(resultData.student_id),
    full_name: student ? student.full_name : resultData.full_name || "طالب",
    student_name: student ? student.full_name : resultData.full_name || "طالب",
    barcode: student ? student.barcode : "",
    degree: score,
    score: score,
    max_score: maxScore,
    total_degree: maxScore,
    status: score >= maxScore * 0.5 ? "pass" : "fail",
    notes: resultData.notes || "",
    created_at: new Date().toISOString(),
  };

  if (idx !== -1) {
    store.examResults[examId][idx] = record;
  } else {
    store.examResults[examId].push(record);
  }

  saveStore();
  logActivity("update_exam_result", `رصد درجة الطالب ${record.full_name} في الامتحان`, "exam");
  return record;
};

export const mockUpsertBatchExamResults = async (examId, records = []) => {
  const store = loadStore();
  if (!store.examResults[examId]) {
    store.examResults[examId] = [];
  }

  records.forEach((rec) => {
    mockUpsertExamResult({
      exam_id: examId,
      student_id: rec.student_id,
      degree: rec.degree !== undefined ? rec.degree : rec.score,
      notes: rec.notes,
    });
  });

  saveStore();
  logActivity("update_exam_result", `رصد درجات ${records.length} طالب دفعة واحدة`, "exam");
  return { success: true, count: records.length };
};

export const mockGetExamResultStats = async (examId) => {
  return mockGetExamStats(examId);
};

// ============================================================
// TEMPLATES & BULK UPLOAD SIMULATION (REAL EXCEL FILES)
// ============================================================

export const mockDownloadStudentsTemplate = async () => {
  if (typeof window === "undefined") return { success: true };
  const headers = ["الاسم", "الباركود", "المرحلة", "المجموعة", "الهاتف", "ولي الأمر", "ملاحظات"];
  const samples = [
    ["محمود عادل الشافعي", "0081", 3, 1, "01012341234", "01112341234", "طالب جديد - سنتر"],
    ["يارا حسام الدين", "0082", 3, 1, "01056785678", "01156785678", "طالبة جديدة"],
    ["أحمد طارق الجندي", "0083", 2, 4, "01099889988", "01199889988", "طالب جديد"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "قالب الطلاب");
  XLSX.writeFile(wb, "قالب_استيراد_الطلاب.xlsx");
  return { success: true };
};

export const mockDownloadGradesTemplate = async () => {
  if (typeof window === "undefined") return { success: true };
  const headers = ["اسم الصف", "السعر الشهري"];
  const samples = [["الصف الثالث الثانوي", 250], ["الصف الثاني الثانوي", 220], ["الصف الأول الثانوي", 200]];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "الصفوف");
  XLSX.writeFile(wb, "قالب_استيراد_الصفوف.xlsx");
  return { success: true };
};

export const mockDownloadGroupsTemplate = async () => {
  if (typeof window === "undefined") return { success: true };
  const headers = ["المرحلة", "اسم المجموعة", "الأيام", "القاعة", "من", "إلى"];
  const samples = [
    [3, "مجموعة السبت والأربعاء", "السبت والأربعاء", "القاعة الكبرى", "16:30", "18:30"],
    [3, "مجموعة الأحد والثلاثاء", "الأحد والثلاثاء", "القاعة 2", "17:00", "19:00"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "المجموعات");
  XLSX.writeFile(wb, "قالب_استيراد_المجموعات.xlsx");
  return { success: true };
};

export const mockDownloadExamResultsTemplate = async () => {
  if (typeof window === "undefined") return { success: true };
  const headers = ["الدرجة", "الباركود", "اسم الطالب"];
  const samples = [
    [95, "0011", "أحمد محمود سالم"],
    [88, "0012", "عمر خالد إبراهيم"],
    [92, "0013", "مريم مصطفى الشناوي"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "قالب الدرجات");
  XLSX.writeFile(wb, "قالب_استيراد_الدرجات.xlsx");
  return { success: true };
};

export const mockBulkUploadStudents = async (formData) => {
  const store = loadStore();
  let count = 0;
  try {
    const file = formData instanceof FormData ? formData.get("file") : formData?.file;
    if (file && typeof file.arrayBuffer === "function") {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });

      rows.forEach((r, idx) => {
        const name = String(r["الاسم"] || r["اسم الطالب"] || r["name"] || r["full_name"] || "").trim();
        if (name) {
          const barcode = String(r["الباركود"] || r["كود الطالب"] || r["barcode"] || (2000 + store.students.length + idx)).trim();
          const newStudent = {
            id: Date.now() + idx,
            full_name: name,
            student_name: name,
            barcode,
            grade_id: Number(r["المرحلة"] || r["grade_id"] || 3),
            grade_name: "الصف الثالث الثانوي",
            group_id: Number(r["المجموعة"] || r["group_id"] || 1),
            group_name: "مجموعة السبت والأربعاء (السنتر)",
            phone: String(r["الهاتف"] || r["رقم الهاتف"] || "01000000000"),
            parent_phone: String(r["ولي الأمر"] || r["رقم ولي الأمر"] || "01100000000"),
            is_active: 1,
            status: "active",
            deleted: 0,
            attendance_rate: 100,
            attendance_percentage: 100,
            exams_avg: 100,
            payment_status: "paid",
            paid_status: "paid",
            subscription_status: "paid",
            subscription_month: "2026-10",
            is_paid: true,
            required_amount: 250,
            paid_amount: 250,
            remaining_amount: 0,
            total_paid: 250,
            remaining_balance: 0,
            notes: String(r["ملاحظات"] || "مستورد من Excel"),
            created_at: new Date().toISOString(),
            profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.split(" ")[0])}&background=1a5d1a&color=fff&size=150`,
          };
          store.students.push(newStudent);
          count++;
        }
      });
    }
  } catch (err) {
    console.warn("Could not parse excel buffer:", err);
  }

  if (count === 0) {
    // Fallback: simulate 3 students if parsing could not read rows
    const sampleNames = ["محمود عادل الشافعي", "يارا حسام الدين", "أحمد طارق الجندي"];
    sampleNames.forEach((name, idx) => {
      store.students.push({
        id: Date.now() + idx,
        full_name: name,
        student_name: name,
        barcode: String(3000 + store.students.length + idx),
        grade_id: 3,
        grade_name: "الصف الثالث الثانوي",
        group_id: 1,
        group_name: "مجموعة السبت والأربعاء (السنتر)",
        phone: "01012341234",
        parent_phone: "01112341234",
        is_active: 1,
        status: "active",
        deleted: 0,
        attendance_rate: 100,
        attendance_percentage: 100,
        exams_avg: 100,
        payment_status: "paid",
        paid_status: "paid",
        subscription_status: "paid",
        subscription_month: "2026-10",
        is_paid: true,
        required_amount: 250,
        paid_amount: 250,
        remaining_amount: 0,
        total_paid: 250,
        remaining_balance: 0,
        notes: "مستورد من Excel",
        created_at: new Date().toISOString(),
        profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.split(" ")[0])}&background=1a5d1a&color=fff&size=150`,
      });
      count++;
    });
  }

  saveStore();
  logActivity("bulk_upload", `تم استيراد ${count} طلاب بنجاح من ملف Excel`, "student");
  return { success: true, success_count: count, error_count: 0 };
};

export const mockBulkUploadGrades = async (formData) => {
  const store = loadStore();
  let count = 0;
  try {
    const file = formData instanceof FormData ? formData.get("file") : formData?.file;
    if (file && typeof file.arrayBuffer === "function") {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      rows.forEach((r, idx) => {
        const name = String(r["اسم الصف"] || r["الاسم"] || r["name"] || "").trim();
        if (name) {
          store.grades.push({
            id: Date.now() + idx,
            name,
            monthly_price: Number(r["السعر الشهري"] || r["price"] || 200),
            groups_count: 0,
            students_count: 0,
            created_at: new Date().toISOString(),
            deleted: 0,
          });
          count++;
        }
      });
    }
  } catch {
    // fallback
  }

  if (count === 0) count = 2;
  saveStore();
  logActivity("bulk_upload", `استيراد ${count} صفوف دراسية من Excel`, "grade");
  return { success: true, success_count: count, error_count: 0 };
};

export const mockBulkUploadGroups = async (formData) => {
  const store = loadStore();
  let count = 0;
  try {
    const file = formData instanceof FormData ? formData.get("file") : formData?.file;
    if (file && typeof file.arrayBuffer === "function") {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      rows.forEach((r, idx) => {
        const name = String(r["اسم المجموعة"] || r["name"] || "").trim();
        if (name) {
          store.groups.push({
            id: Date.now() + idx,
            grade_id: Number(r["المرحلة"] || 3),
            grade_name: "الصف الثالث الثانوي",
            name,
            room: r["القاعة"] || "القاعة 1",
            days: r["الأيام"] || "السبت والأربعاء",
            start_time: "16:00:00",
            end_time: "18:00:00",
            students_count: 0,
            created_at: new Date().toISOString(),
            deleted: 0,
          });
          count++;
        }
      });
    }
  } catch {
    // fallback
  }

  if (count === 0) count = 2;
  saveStore();
  logActivity("bulk_upload", `استيراد ${count} مجموعات من Excel`, "group");
  return { success: true, success_count: count, error_count: 0 };
};

export const mockBulkUploadExamResults = async (examId, formData) => {
  const store = loadStore();
  let count = 0;
  try {
    const file = formData instanceof FormData ? formData.get("file") : formData?.file;
    if (file && typeof file.arrayBuffer === "function") {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      rows.forEach((r) => {
        const barcode = String(r["الباركود"] || r["كود الطالب"] || "").trim();
        const rawDegree = r["الدرجة"] !== undefined ? r["الدرجة"] : r["degree"];
        if (barcode && rawDegree !== "") {
          const student = store.students.find((s) => s.barcode === barcode);
          if (student) {
            mockUpsertExamResult({
              exam_id: examId,
              student_id: student.id,
              degree: Number(rawDegree),
              notes: r["ملاحظات"] || "",
            });
            count++;
          }
        }
      });
    }
  } catch {
    // fallback
  }

  if (count === 0) count = 10;
  saveStore();
  logActivity("bulk_upload", `استيراد درجات الامتحان لـ ${count} طالب من Excel`, "exam");
  return { success: true, success_count: count, error_count: 0 };
};

// ============================================================
// ONLINE SUITE (VIDEOS, PLAYLISTS, ONLINE EXAMS, ASSIGNMENTS)
// ============================================================

// ----------------------
// Videos
// ----------------------
export const mockGetVideos = async () => {
  const store = loadStore();
  return (store.videos || []).filter((v) => !v.deleted);
};

export const mockGetVideosByGrade = async (gradeId) => {
  const store = loadStore();
  return (store.videos || []).filter(
    (v) => !v.deleted && String(v.grade_id) === String(gradeId)
  );
};

export const mockGetVideoById = async (videoId) => {
  const store = loadStore();
  const v = (store.videos || []).find((item) => String(item.id) === String(videoId));
  return v || null;
};

export const mockCreateVideo = async (formData) => {
  const store = loadStore();
  const title = formData instanceof FormData ? formData.get("title") : formData?.title;
  const grade_id = Number(formData instanceof FormData ? formData.get("grade_id") : formData?.grade_id);
  const video_url = formData instanceof FormData ? formData.get("video_url") : formData?.video_url;
  const description = (formData instanceof FormData ? formData.get("description") : formData?.description) || "";
  const playlist_id = formData instanceof FormData ? formData.get("playlist_id") : formData?.playlist_id;

  const grade = store.grades.find((g) => g.id === grade_id);
  const pl = playlist_id ? store.playlists.find((p) => String(p.id) === String(playlist_id)) : null;

  const newId = Date.now();
  const newVideo = {
    id: newId,
    title: title || "فيديو تعليمي جديد",
    description,
    url: video_url || "https://www.youtube.com/watch?v=03hsHuIXLQE",
    video_url: video_url || "https://www.youtube.com/watch?v=03hsHuIXLQE",
    grade_id,
    grade_name: grade?.name || "الصف الثالث الثانوي",
    playlist_id: pl ? pl.id : null,
    playlist_name: pl ? pl.title : null,
    is_free: 1,
    views: 0,
    duration: "45:00",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    created_at: new Date().toISOString(),
    deleted: 0,
  };

  store.videos = [newVideo, ...(store.videos || [])];
  if (pl) {
    if (!pl.video_ids) pl.video_ids = [];
    pl.video_ids.push(newId);
    pl.videos_count = pl.video_ids.length;
  }

  saveStore();
  logActivity("create_video", `إضافة فيديو جديد: ${newVideo.title}`, "video");
  return newVideo;
};

export const mockUpdateVideo = async (videoId, formData) => {
  const store = loadStore();
  const idx = store.videos.findIndex((v) => String(v.id) === String(videoId));
  if (idx !== -1) {
    const title = formData instanceof FormData ? formData.get("title") : formData?.title;
    const grade_id = formData instanceof FormData ? formData.get("grade_id") : formData?.grade_id;
    const video_url = formData instanceof FormData ? formData.get("video_url") : formData?.video_url;
    const description = formData instanceof FormData ? formData.get("description") : formData?.description;

    if (title) store.videos[idx].title = title;
    if (grade_id) {
      store.videos[idx].grade_id = Number(grade_id);
      const grade = store.grades.find((g) => g.id === Number(grade_id));
      if (grade) store.videos[idx].grade_name = grade.name;
    }
    if (video_url) {
      store.videos[idx].video_url = video_url;
      store.videos[idx].url = video_url;
    }
    if (description !== undefined) store.videos[idx].description = description;

    saveStore();
    logActivity("update_video", `تعديل فيديو: ${store.videos[idx].title}`, "video");
    return store.videos[idx];
  }
  return null;
};

export const mockDeleteVideo = async (videoId) => {
  const store = loadStore();
  const idx = store.videos.findIndex((v) => String(v.id) === String(videoId));
  if (idx !== -1) {
    const vid = store.videos[idx];
    vid.deleted = 1;
    if (vid.playlist_id) {
      const pl = store.playlists.find((p) => p.id === vid.playlist_id || p.playlist_id === vid.playlist_id);
      if (pl && Array.isArray(pl.video_ids)) {
        pl.video_ids = pl.video_ids.filter((id) => id !== vid.id);
        pl.videos_count = pl.video_ids.length;
      }
    }
    saveStore();
    logActivity("delete_video", `حذف فيديو: ${vid.title}`, "video");
  }
  return { success: true };
};

// ----------------------
// Playlists
// ----------------------
export const mockGetPlaylists = async () => {
  const store = loadStore();
  return (store.playlists || [])
    .filter((p) => !p.deleted)
    .map((p) => ({
      ...p,
      playlist_id: p.id,
      thumbnail_url: p.cover_image || p.thumbnail_url,
    }));
};

export const mockGetPlaylistsByGrade = async (gradeId) => {
  const store = loadStore();
  return (store.playlists || [])
    .filter((p) => !p.deleted && String(p.grade_id) === String(gradeId))
    .map((p) => ({
      ...p,
      playlist_id: p.id,
      thumbnail_url: p.cover_image || p.thumbnail_url,
    }));
};

export const mockGetPlaylistById = async (playlistId) => {
  const store = loadStore();
  const p = (store.playlists || []).find(
    (item) => String(item.id) === String(playlistId) || String(item.playlist_id) === String(playlistId)
  );
  if (p) {
    return {
      ...p,
      playlist_id: p.id,
      thumbnail_url: p.cover_image || p.thumbnail_url,
    };
  }
  return null;
};

export const mockCreatePlaylist = async (formData) => {
  const store = loadStore();
  const title = formData instanceof FormData ? formData.get("title") : formData?.title;
  const grade_id = Number(formData instanceof FormData ? formData.get("grade_id") : formData?.grade_id);
  const grade = store.grades.find((g) => g.id === grade_id);
  const newId = Date.now();

  const newPlaylist = {
    id: newId,
    playlist_id: newId,
    title: title || "قائمة تشغيل جديدة",
    description: "قائمة تشغيل ومراجعات لدروس المنهج",
    grade_id,
    grade_name: grade?.name || "الصف الثالث الثانوي",
    price: 150,
    videos_count: 0,
    video_ids: [],
    cover_image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    thumbnail_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    created_at: new Date().toISOString(),
    deleted: 0,
  };

  store.playlists = [newPlaylist, ...(store.playlists || [])];
  saveStore();
  logActivity("create_playlist", `إنشاء قائمة تشغيل: ${newPlaylist.title}`, "playlist");
  return newPlaylist;
};

export const mockUpdatePlaylist = async (playlistId, formData) => {
  const store = loadStore();
  const idx = store.playlists.findIndex(
    (p) => String(p.id) === String(playlistId) || String(p.playlist_id) === String(playlistId)
  );
  if (idx !== -1) {
    const title = formData instanceof FormData ? formData.get("title") : formData?.title;
    const grade_id = formData instanceof FormData ? formData.get("grade_id") : formData?.grade_id;
    if (title) store.playlists[idx].title = title;
    if (grade_id) {
      store.playlists[idx].grade_id = Number(grade_id);
      const grade = store.grades.find((g) => g.id === Number(grade_id));
      if (grade) store.playlists[idx].grade_name = grade.name;
    }
    saveStore();
    logActivity("update_playlist", `تعديل قائمة تشغيل: ${store.playlists[idx].title}`, "playlist");
    return {
      ...store.playlists[idx],
      playlist_id: store.playlists[idx].id,
      thumbnail_url: store.playlists[idx].cover_image || store.playlists[idx].thumbnail_url,
    };
  }
  return null;
};

export const mockDeletePlaylist = async (playlistId) => {
  const store = loadStore();
  const idx = store.playlists.findIndex(
    (p) => String(p.id) === String(playlistId) || String(p.playlist_id) === String(playlistId)
  );
  if (idx !== -1) {
    store.playlists[idx].deleted = 1;
    saveStore();
    logActivity("delete_playlist", `حذف قائمة تشغيل: ${store.playlists[idx].title}`, "playlist");
  }
  return { success: true };
};

export const mockGetPlaylistVideos = async (playlistId) => {
  const store = loadStore();
  const playlist = (store.playlists || []).find(
    (p) => String(p.id) === String(playlistId) || String(p.playlist_id) === String(playlistId)
  );
  const vids = (store.videos || []).filter((v) => {
    if (v.deleted) return false;
    if (String(v.playlist_id) === String(playlistId)) return true;
    if (playlist && Array.isArray(playlist.video_ids) && playlist.video_ids.includes(v.id)) return true;
    return false;
  });
  return vids;
};

export const mockAddVideoToPlaylist = async (playlistId, videoId) => {
  const store = loadStore();
  const plIdx = store.playlists.findIndex(
    (p) => String(p.id) === String(playlistId) || String(p.playlist_id) === String(playlistId)
  );
  const vidIdx = store.videos.findIndex((v) => String(v.id) === String(videoId));
  if (plIdx !== -1 && vidIdx !== -1) {
    store.videos[vidIdx].playlist_id = Number(playlistId);
    store.videos[vidIdx].playlist_name = store.playlists[plIdx].title;
    if (!store.playlists[plIdx].video_ids) store.playlists[plIdx].video_ids = [];
    if (!store.playlists[plIdx].video_ids.includes(Number(videoId))) {
      store.playlists[plIdx].video_ids.push(Number(videoId));
      store.playlists[plIdx].videos_count = store.playlists[plIdx].video_ids.length;
    }
    saveStore();
  }
  return { success: true };
};

export const mockRemoveVideoFromPlaylist = async (id) => {
  const store = loadStore();
  const vidIdx = store.videos.findIndex((v) => String(v.id) === String(id));
  if (vidIdx !== -1) {
    const plId = store.videos[vidIdx].playlist_id;
    store.videos[vidIdx].playlist_id = null;
    store.videos[vidIdx].playlist_name = null;
    if (plId) {
      const pl = store.playlists.find((p) => p.id === plId || p.playlist_id === plId);
      if (pl && Array.isArray(pl.video_ids)) {
        pl.video_ids = pl.video_ids.filter((vId) => vId !== store.videos[vidIdx].id);
        pl.videos_count = pl.video_ids.length;
      }
    }
    saveStore();
  }
  return { success: true };
};

// ----------------------
// Online Exams
// ----------------------
export const mockGetOnlineExams = async () => {
  const store = loadStore();
  return (store.onlineExams || []).filter((e) => !e.deleted);
};

export const mockGetAvailableOnlineExams = async () => {
  const store = loadStore();
  const now = new Date();
  return (store.onlineExams || []).filter((e) => {
    if (e.deleted) return false;
    if (e.status === "active") return true;
    if (e.start_at && e.end_at) {
      return new Date(e.start_at) <= now && now <= new Date(e.end_at);
    }
    return true;
  });
};

export const mockGetExpiredOnlineExams = async () => {
  const store = loadStore();
  const now = new Date();
  return (store.onlineExams || []).filter((e) => {
    if (e.deleted) return false;
    if (e.status === "ended") return true;
    if (e.end_at && new Date(e.end_at) < now) return true;
    return false;
  });
};

export const mockGetOnlineExamsByGrade = async (gradeId) => {
  const store = loadStore();
  return (store.onlineExams || []).filter(
    (e) => !e.deleted && String(e.grade_id) === String(gradeId)
  );
};

export const mockGetOnlineExamsByGroup = async (groupId) => {
  const store = loadStore();
  return (store.onlineExams || []).filter(
    (e) => !e.deleted && String(e.group_id) === String(groupId)
  );
};

export const mockGetOnlineExamById = async (id) => {
  const store = loadStore();
  return (store.onlineExams || []).find((e) => String(e.id) === String(id)) || null;
};

export const mockGetOnlineExamStats = async (id) => {
  const store = loadStore();
  const attempts = (store.studentOnlineExams || []).filter((s) => String(s.exam_id) === String(id));
  const exam = (store.onlineExams || []).find((e) => String(e.id) === String(id));
  const fullMark = exam?.full_mark || 30;

  if (attempts.length === 0) {
    return {
      students_attempted: 0,
      students_submitted: 0,
      total_students: 25,
      average_score: 0,
      highest_score: 0,
      lowest_score: 0,
      passed_count: 0,
      failed_count: 0,
      pass_rate: 0,
    };
  }

  const submittedAttempts = attempts.filter((a) => a.status === "submitted" || a.score !== null);
  const scores = submittedAttempts.map((a) => Number(a.score) || 0);
  const avg = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  const highest = scores.length > 0 ? Math.max(...scores) : 0;
  const lowest = scores.length > 0 ? Math.min(...scores) : 0;
  const passMark = fullMark / 2;
  const passed = scores.filter((s) => s >= passMark).length;
  const failed = scores.length - passed;
  const passRate = scores.length > 0 ? Math.round((passed / scores.length) * 100) : 0;

  return {
    students_attempted: attempts.length,
    students_submitted: submittedAttempts.length,
    total_students: attempts.length + 5,
    average_score: Math.round(avg * 10) / 10,
    highest_score: highest,
    lowest_score: lowest,
    passed_count: passed,
    failed_count: failed,
    pass_rate: passRate,
  };
};

export const mockGetGradeOnlineExamStats = async (gradeId) => {
  const store = loadStore();
  const exams = (store.onlineExams || []).filter(
    (e) => !e.deleted && String(e.grade_id) === String(gradeId)
  );
  const examIds = exams.map((e) => String(e.id));
  const attempts = (store.studentOnlineExams || []).filter((a) =>
    examIds.includes(String(a.exam_id))
  );

  const totalAttempts = attempts.length;
  const scores = attempts.map((a) => Number(a.score) || 0);
  const avg =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;
  const passed = attempts.filter((a) => a.score >= (a.full_mark / 2)).length;
  const passRate = totalAttempts > 0 ? Math.round((passed / totalAttempts) * 100) : 0;

  return {
    exams_count: exams.length,
    total_attempts: totalAttempts,
    average_score: avg,
    pass_rate: passRate,
  };
};

export const mockCreateOnlineExam = async (examData) => {
  const store = loadStore();
  const grade = store.grades.find((g) => String(g.id) === String(examData.grade_id));
  const group = store.groups.find((gr) => String(gr.id) === String(examData.group_id));
  const newId = Date.now();

  const newExam = {
    id: newId,
    title: examData.title || "امتحان إلكتروني جديد",
    description: examData.description || "",
    grade_id: Number(examData.grade_id) || 3,
    grade_name: grade?.name || "الصف الثالث الثانوي",
    group_id: examData.group_id ? Number(examData.group_id) : "",
    group_name: group?.name || (examData.group_id ? "مجموعة" : "جميع المجموعات"),
    duration_minutes: Number(examData.duration_minutes) || 30,
    full_mark: Number(examData.full_mark) || 20,
    start_at: examData.start_at || new Date().toISOString(),
    end_at: examData.end_at || new Date(Date.now() + 86400000 * 7).toISOString(),
    randomize_questions: Number(examData.randomize_questions) === 1 ? 1 : 0,
    questions_count: 0,
    students_attempted: 0,
    status: "active",
    created_at: new Date().toISOString(),
    deleted: 0,
  };

  store.onlineExams = [newExam, ...(store.onlineExams || [])];
  saveStore();
  logActivity("create_online_exam", `إنشاء امتحان إلكتروني: ${newExam.title}`, "online_exam");
  return newExam;
};

export const mockUpdateOnlineExam = async (examId, examData) => {
  const store = loadStore();
  const idx = store.onlineExams.findIndex((e) => String(e.id) === String(examId));
  if (idx !== -1) {
    const grade = store.grades.find((g) => String(g.id) === String(examData.grade_id));
    const group = store.groups.find((gr) => String(gr.id) === String(examData.group_id));

    store.onlineExams[idx] = {
      ...store.onlineExams[idx],
      ...examData,
      grade_name: grade?.name || store.onlineExams[idx].grade_name,
      group_name: group?.name || store.onlineExams[idx].group_name,
    };
    saveStore();
    logActivity("update_online_exam", `تعديل امتحان إلكتروني: ${store.onlineExams[idx].title}`, "online_exam");
    return store.onlineExams[idx];
  }
  return null;
};

export const mockDeleteOnlineExam = async (examId) => {
  const store = loadStore();
  const idx = store.onlineExams.findIndex((e) => String(e.id) === String(examId));
  if (idx !== -1) {
    store.onlineExams[idx].deleted = 1;
    saveStore();
    logActivity("delete_online_exam", `حذف امتحان إلكتروني: ${store.onlineExams[idx].title}`, "online_exam");
  }
  return { success: true };
};

// ----------------------
// Questions & Options
// ----------------------
export const mockGetQuestionsByExam = async (examId) => {
  const store = loadStore();
  return (store.questions || []).filter(
    (q) => !q.deleted && String(q.exam_id) === String(examId)
  );
};

export const mockGetQuestionById = async (id) => {
  const store = loadStore();
  return (store.questions || []).find((q) => String(q.id) === String(id)) || null;
};

export const mockCreateQuestion = async (questionData) => {
  const store = loadStore();
  const newId = Date.now();
  const newQ = {
    id: newId,
    exam_id: Number(questionData.exam_id),
    question_text: questionData.question_text || "",
    question_type: questionData.type || "multiple_choice",
    type: questionData.type || "mcq",
    score: Number(questionData.score || questionData.mark || 5),
    mark: Number(questionData.score || questionData.mark || 5),
    order: Number(questionData.order) || 1,
    file_path: null,
    deleted: 0,
  };
  store.questions = [...(store.questions || []), newQ];
  const exam = store.onlineExams.find((e) => e.id === Number(questionData.exam_id));
  if (exam) exam.questions_count = (exam.questions_count || 0) + 1;
  saveStore();
  return newQ;
};

export const mockCreateQuestionWithFile = async (questionData, _file) => {
  const store = loadStore();
  const newId = Date.now();
  const newQ = {
    id: newId,
    exam_id: Number(questionData.exam_id),
    question_text: questionData.question_text || "",
    question_type: questionData.type || "multiple_choice",
    type: questionData.type || "mcq",
    score: Number(questionData.score || questionData.mark || 5),
    mark: Number(questionData.score || questionData.mark || 5),
    order: Number(questionData.order) || 1,
    file_path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    deleted: 0,
  };
  store.questions = [...(store.questions || []), newQ];
  const exam = store.onlineExams.find((e) => e.id === Number(questionData.exam_id));
  if (exam) exam.questions_count = (exam.questions_count || 0) + 1;
  saveStore();
  return newQ;
};

export const mockUpdateQuestion = async (id, questionData) => {
  const store = loadStore();
  const idx = store.questions.findIndex((q) => String(q.id) === String(id));
  if (idx !== -1) {
    store.questions[idx] = {
      ...store.questions[idx],
      ...questionData,
      question_text: questionData.question_text || store.questions[idx].question_text,
    };
    saveStore();
    return store.questions[idx];
  }
  return null;
};

export const mockUpdateQuestionWithFile = async (id, questionData, _file) => {
  const store = loadStore();
  const idx = store.questions.findIndex((q) => String(q.id) === String(id));
  if (idx !== -1) {
    store.questions[idx] = {
      ...store.questions[idx],
      ...questionData,
      question_text: questionData.question_text || store.questions[idx].question_text,
      file_path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    };
    saveStore();
    return store.questions[idx];
  }
  return null;
};

export const mockDeleteQuestion = async (id) => {
  const store = loadStore();
  const q = store.questions.find((item) => String(item.id) === String(id));
  if (q) {
    q.deleted = 1;
    const exam = store.onlineExams.find((e) => e.id === q.exam_id);
    if (exam && exam.questions_count > 0) exam.questions_count -= 1;
    saveStore();
  }
  return { success: true };
};

export const mockGetOptionsByQuestion = async (questionId) => {
  const store = loadStore();
  return (store.options || []).filter(
    (o) => String(o.question_id) === String(questionId)
  );
};

export const mockGetOptionById = async (id) => {
  const store = loadStore();
  return (store.options || []).find((o) => String(o.id) === String(id)) || null;
};

export const mockCreateOption = async (optionData) => {
  const store = loadStore();
  const newOpt = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    question_id: Number(optionData.question_id),
    option_text: optionData.option_text || "",
    is_correct: Number(optionData.is_correct) === 1 ? 1 : 0,
    order: Number(optionData.order) || 1,
  };
  store.options = [...(store.options || []), newOpt];
  saveStore();
  return newOpt;
};

export const mockUpdateOption = async (id, optionData) => {
  const store = loadStore();
  const idx = store.options.findIndex((o) => String(o.id) === String(id));
  if (idx !== -1) {
    store.options[idx] = {
      ...store.options[idx],
      ...optionData,
      is_correct:
        optionData.is_correct !== undefined
          ? Number(optionData.is_correct) === 1 ? 1 : 0
          : store.options[idx].is_correct,
    };
    saveStore();
    return store.options[idx];
  }
  return null;
};

export const mockDeleteOption = async (id) => {
  const store = loadStore();
  store.options = (store.options || []).filter((o) => String(o.id) !== String(id));
  saveStore();
  return { success: true };
};

// ----------------------
// Student Online Exams & Grading
// ----------------------
export const mockGetStudentExams = async (examId) => {
  const store = loadStore();
  return (store.studentOnlineExams || []).filter(
    (s) => String(s.exam_id) === String(examId)
  );
};

export const mockGetStudentExamStats = async (examId) => {
  return await mockGetOnlineExamStats(examId);
};

export const mockGetGroupStudentExamStats = async (groupId) => {
  const store = loadStore();
  const exams = (store.onlineExams || []).filter(
    (e) => !e.deleted && String(e.group_id) === String(groupId)
  );
  const examIds = exams.map((e) => String(e.id));
  const attempts = (store.studentOnlineExams || []).filter((a) =>
    examIds.includes(String(a.exam_id))
  );
  return {
    exams_count: exams.length,
    total_attempts: attempts.length,
    average_score: 22,
    pass_rate: 85,
  };
};

export const mockGetQuestionAnswerStats = async (questionId) => {
  return {
    question_id: questionId,
    total_attempts: 18,
    correct_attempts: 14,
    correct_percentage: 78,
  };
};

export const mockGetQuestionMostSelectedOptions = async (questionId) => {
  const store = loadStore();
  const options = (store.options || []).filter(
    (o) => String(o.question_id) === String(questionId)
  );
  return options.map((opt, i) => ({
    option_id: opt.id,
    option_text: opt.option_text,
    selected_count: i === 0 ? 12 : 2,
    percentage: i === 0 ? 67 : 11,
  }));
};

export const mockGetPendingEssayAnswers = async () => {
  const store = loadStore();
  return (store.essayAnswers || []).filter((a) => a.is_correct === null);
};

export const mockGetEssayAnswersByExam = async (examId) => {
  const store = loadStore();
  return (store.essayAnswers || []).filter(
    (a) => String(a.exam_id) === String(examId)
  );
};

export const mockGradeEssayAnswer = async (answerId, isCorrect) => {
  const store = loadStore();
  const idx = store.essayAnswers.findIndex((a) => String(a.id) === String(answerId));
  if (idx !== -1) {
    store.essayAnswers[idx].is_correct = isCorrect ? 1 : 0;
    store.essayAnswers[idx].score = isCorrect ? 10 : 0;
    saveStore();
    logActivity("grade_essay", `تصحيح إجابة مقالية للطالب: ${store.essayAnswers[idx].student_name}`, "online_exam");
  }
  return { success: true };
};

// ----------------------
// Homework / Assignments
// ----------------------
export const mockGetAssignments = async () => {
  const store = loadStore();
  return (store.assignments || []).filter((a) => !a.deleted);
};

export const mockGetAssignmentsByGrade = async (gradeId) => {
  const store = loadStore();
  return (store.assignments || []).filter(
    (a) => !a.deleted && String(a.grade_id) === String(gradeId)
  );
};

export const mockGetAssignmentsByGroup = async (groupId) => {
  const store = loadStore();
  return (store.assignments || []).filter(
    (a) => !a.deleted && String(a.group_id) === String(groupId)
  );
};

export const mockGetAssignmentById = async (id) => {
  const store = loadStore();
  return (store.assignments || []).find((a) => String(a.id) === String(id)) || null;
};

export const mockCreateAssignment = async (formData) => {
  const store = loadStore();
  const title = formData instanceof FormData ? formData.get("title") : formData?.title;
  const description = formData instanceof FormData ? formData.get("description") : formData?.description;
  const grade_id = Number(formData instanceof FormData ? formData.get("grade_id") : formData?.grade_id) || 3;
  const group_id = formData instanceof FormData ? formData.get("group_id") : formData?.group_id;
  const full_mark = Number(formData instanceof FormData ? formData.get("full_mark") : formData?.full_mark) || 20;
  const deadline = formData instanceof FormData ? formData.get("deadline") : formData?.deadline;
  const is_closed = Number(formData instanceof FormData ? formData.get("is_closed") : formData?.is_closed) || 0;
  const file = formData instanceof FormData ? formData.get("file") : formData?.file;

  const grade = store.grades.find((g) => g.id === grade_id);
  const group = store.groups.find((gr) => String(gr.id) === String(group_id));

  const newAssignment = {
    id: Date.now(),
    title: title || "واجب منزلي جديد",
    description: description || "",
    grade_id,
    grade_name: grade?.name || "الصف الثالث الثانوي",
    group_id: group_id ? Number(group_id) : "",
    group_name: group?.name || "جميع مجموعات الصف",
    full_mark,
    deadline: deadline || "2026-10-30",
    is_closed,
    file_path: file ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : null,
    file_name: file?.name || (file ? "ملف_الواجب.pdf" : null),
    submissions_count: 0,
    created_at: new Date().toISOString(),
    deleted: 0,
  };

  store.assignments = [newAssignment, ...(store.assignments || [])];
  saveStore();
  logActivity("create_assignment", `إضافة واجب منزلي: ${newAssignment.title}`, "assignment");
  return newAssignment;
};

export const mockUpdateAssignment = async (id, formData) => {
  const store = loadStore();
  const idx = store.assignments.findIndex((a) => String(a.id) === String(id));
  if (idx !== -1) {
    const title = formData instanceof FormData ? formData.get("title") : formData?.title;
    const description = formData instanceof FormData ? formData.get("description") : formData?.description;
    const grade_id = formData instanceof FormData ? formData.get("grade_id") : formData?.grade_id;
    const group_id = formData instanceof FormData ? formData.get("group_id") : formData?.group_id;
    const full_mark = formData instanceof FormData ? formData.get("full_mark") : formData?.full_mark;
    const deadline = formData instanceof FormData ? formData.get("deadline") : formData?.deadline;
    const is_closed = formData instanceof FormData ? formData.get("is_closed") : formData?.is_closed;

    if (title) store.assignments[idx].title = title;
    if (description !== undefined) store.assignments[idx].description = description;
    if (grade_id) {
      store.assignments[idx].grade_id = Number(grade_id);
      const grade = store.grades.find((g) => g.id === Number(grade_id));
      if (grade) store.assignments[idx].grade_name = grade.name;
    }
    if (group_id !== undefined) {
      store.assignments[idx].group_id = group_id ? Number(group_id) : "";
      const group = store.groups.find((gr) => String(gr.id) === String(group_id));
      store.assignments[idx].group_name = group?.name || "جميع مجموعات الصف";
    }
    if (full_mark) store.assignments[idx].full_mark = Number(full_mark);
    if (deadline) store.assignments[idx].deadline = deadline;
    if (is_closed !== undefined) store.assignments[idx].is_closed = Number(is_closed);

    saveStore();
    logActivity("update_assignment", `تعديل واجب: ${store.assignments[idx].title}`, "assignment");
    return store.assignments[idx];
  }
  return null;
};

export const mockDeleteAssignment = async (id) => {
  const store = loadStore();
  const idx = store.assignments.findIndex((a) => String(a.id) === String(id));
  if (idx !== -1) {
    store.assignments[idx].deleted = 1;
    saveStore();
    logActivity("delete_assignment", `حذف واجب: ${store.assignments[idx].title}`, "assignment");
  }
  return { success: true };
};

// ----------------------
// Submissions & Grading
// ----------------------
export const mockGetSubmissions = async (assignmentId) => {
  const store = loadStore();
  return (store.submissions || []).filter(
    (s) => String(s.assignment_id) === String(assignmentId)
  );
};

export const mockGetStudentSubmission = async (assignmentId, studentId) => {
  const store = loadStore();
  return (
    (store.submissions || []).find(
      (s) => String(s.assignment_id) === String(assignmentId) && String(s.student_id) === String(studentId)
    ) || null
  );
};

export const mockGetSubmittedStudents = async (assignmentId) => {
  const store = loadStore();
  return (store.submissions || []).filter(
    (s) => String(s.assignment_id) === String(assignmentId)
  );
};

export const mockGetNotSubmittedStudents = async (assignmentId) => {
  const store = loadStore();
  const assignment = (store.assignments || []).find((a) => String(a.id) === String(assignmentId));
  const submittedStudentIds = new Set(
    (store.submissions || [])
      .filter((s) => String(s.assignment_id) === String(assignmentId))
      .map((s) => s.student_id)
  );

  let targetStudents = (store.students || []).filter((st) => !st.deleted);
  if (assignment?.grade_id) {
    targetStudents = targetStudents.filter((st) => Number(st.grade_id) === Number(assignment.grade_id));
  }
  if (assignment?.group_id) {
    targetStudents = targetStudents.filter((st) => Number(st.group_id) === Number(assignment.group_id));
  }

  return targetStudents
    .filter((st) => !submittedStudentIds.has(st.id))
    .map((st) => ({
      student_id: st.id,
      student_name: st.full_name,
      barcode: st.barcode,
      phone: st.phone,
      parent_phone: st.parent_phone,
      grade_name: st.grade_name,
      group_name: st.group_name,
    }));
};

export const mockGetSubmissionStats = async (assignmentId) => {
  const store = loadStore();
  const assignment = (store.assignments || []).find((a) => String(a.id) === String(assignmentId));
  const subs = (store.submissions || []).filter((s) => String(s.assignment_id) === String(assignmentId));
  const graded = subs.filter((s) => s.status === "graded" && s.score !== null);
  const gradedScores = graded.map((s) => Number(s.score));
  const avg =
    gradedScores.length > 0
      ? Math.round((gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length) * 10) / 10
      : 0;

  let totalTarget = 20;
  if (assignment) {
    let t = store.students.filter((st) => !st.deleted && Number(st.grade_id) === Number(assignment.grade_id));
    if (assignment.group_id) t = t.filter((st) => Number(st.group_id) === Number(assignment.group_id));
    if (t.length > 0) totalTarget = t.length;
  }

  return {
    total_students: totalTarget,
    submitted_count: subs.length,
    not_submitted_count: Math.max(0, totalTarget - subs.length),
    graded_count: graded.length,
    pending_count: subs.length - graded.length,
    average_score: avg,
    submission_rate: totalTarget > 0 ? Math.round((subs.length / totalTarget) * 100) : 0,
  };
};

export const mockGetGradeSubmissionStats = async (gradeId) => {
  const store = loadStore();
  const assignments = (store.assignments || []).filter(
    (a) => !a.deleted && String(a.grade_id) === String(gradeId)
  );
  const aIds = assignments.map((a) => String(a.id));
  const subs = (store.submissions || []).filter((s) => aIds.includes(String(s.assignment_id)));

  return {
    assignments_count: assignments.length,
    submissions_count: subs.length,
    graded_count: subs.filter((s) => s.status === "graded").length,
    average_score: 17.5,
  };
};

export const mockGetGroupSubmissionStats = async (groupId) => {
  const store = loadStore();
  const assignments = (store.assignments || []).filter(
    (a) => !a.deleted && String(a.group_id) === String(groupId)
  );
  const aIds = assignments.map((a) => String(a.id));
  const subs = (store.submissions || []).filter((s) => aIds.includes(String(s.assignment_id)));

  return {
    assignments_count: assignments.length,
    submissions_count: subs.length,
    graded_count: subs.filter((s) => s.status === "graded").length,
    average_score: 18.2,
  };
};

export const mockGradeStudentSubmission = async (submissionId, score, feedback) => {
  const store = loadStore();
  const idx = store.submissions.findIndex((s) => String(s.id) === String(submissionId));
  if (idx !== -1) {
    store.submissions[idx].score = Number(score);
    store.submissions[idx].feedback = feedback || "";
    store.submissions[idx].status = "graded";
    saveStore();
    logActivity("grade_submission", `تصحيح واجب الطالب: ${store.submissions[idx].student_name} بالدرجة: ${score}`, "assignment");
    return { success: true, data: store.submissions[idx] };
  }
  return { success: false, error: "لم يتم العثور على التسليم" };
};

