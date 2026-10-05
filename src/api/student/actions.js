import * as studentServices from "./services";

const unwrapApiData = (response) => response?.data ?? response;

const isDemo = () => localStorage.getItem("is_demo") === "true";

// ============================================================
// COMPREHENSIVE HARDCODED SEMESTER DEMO DATA (ARABIC - UTF-8 CLEAN)
// ============================================================

const nowMs = Date.now();
const oneDayMs = 86400000;

// Exam Questions with both MCQ and Essay
const MOCK_QUESTIONS = [
  {
    id: 1,
    question_id: 1,
    question_text: "أي من الكلمات الآتية تبدأ بهمزة قطع مع بيان السبب النحوي؟",
    text: "أي من الكلمات الآتية تبدأ بهمزة قطع مع بيان السبب النحوي؟",
    question_type: "mcq",
    mark: 2,
    options: [
      { id: 1, option_id: 1, option_text: "اقتصاد (مصدر لفعل خماسي)" },
      { id: 2, option_id: 2, option_text: "أحمد (اسم علم مبدوء بهمزة أصلية)" },
      { id: 3, option_id: 3, option_text: "انطلاق (مصدر لفعل خماسي)" },
      { id: 4, option_id: 4, option_text: "استغفار (مصدر لفعل سداسي)" }
    ]
  },
  {
    id: 2,
    question_id: 2,
    question_text: "كلمة (ابن) في اللغة العربية تبدأ بهمز وصل دائماً لأنها:",
    text: "كلمة (ابن) في اللغة العربية تبدأ بهمز وصل دائماً لأنها:",
    question_type: "mcq",
    mark: 2,
    options: [
      { id: 5, option_id: 5, option_text: "من الأسماء التسعة الشاذة المسموعة عن العرب" },
      { id: 6, option_id: 6, option_text: "مصدر لفعل خماسي مبدوء بهمزة" },
      { id: 7, option_id: 7, option_text: "فعل أمر ثلاثي" }
    ]
  },
  {
    id: 3,
    question_id: 3,
    question_text: "اشرح بالتفصيل: متى تُحذف ألف كلمة (ابن) ومتى تثبت رسماً؟ مع ذكر مثالين للتوضيح.",
    text: "اشرح بالتفصيل: متى تُحذف ألف كلمة (ابن) ومتى تثبت رسماً؟ مع ذكر مثالين للتوضيح.",
    question_type: "essay",
    mark: 6,
    options: []
  }
];

const mockData = {
  // ── Profile ──
  profile: {
    id: 1,
    full_name: "أحمد محمود سالم",
    email: "ahmed.salem@benben.cloud",
    phone: "01012345678",
    parent_phone: "01098765432",
    barcode: "0011",
    grade_id: 3,
    group_id: 1,
    grade_name: "الصف الثالث الثانوي",
    group_name: "مجموعة السبت والأربعاء (السنتر)",
    profile_image: "https://ui-avatars.com/api/?name=أحمد+محمود&background=1a5d1a&color=fff&size=200",
    join_date: "2026-09-01"
  },

  // ── Stats Summary ──
  stats: {
    attendance_percentage: 95,
    present_days: 19,
    absent_days: 1,
    total_days: 20,
    avg_paper_degree: 94,
    avg_online_score: 93,
    highest_degree: 49,
    total_exams: 9,
    payments_status: "paid"
  },

  // ── Dashboard Overview Data ──
  dashboard: {
    student_info: {
      id: 1,
      full_name: "أحمد محمود سالم",
      barcode: "0011",
      grade_name: "الصف الثالث الثانوي",
      group_name: "مجموعة السبت والأربعاء (السنتر)",
    },
    group_info: {
      id: 1,
      name: "مجموعة السبت والأربعاء (السنتر)",
    },
    attendance_summary: {
      attendance_percentage: 95,
      present_days: 19,
      absent_days: 1,
      total_days: 20,
    },
    exams_summary: {
      paper_exams_taken: 4,
      online_exams_taken: 5,
      paper_exams_avg: 94,
      online_exams_avg: 93,
      assignments_submitted: 3,
    },
    pending_assignments_count: 2,
    attendance_rate: 95,
    exams_average: 93,
  },

  // ── Semester Attendance (14 sessions over Sep & Oct) ──
  attendance: {
    data: [
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
    ],
    pagination: { totalItems: 14, totalPages: 1 }
  },

  monthly_attendance: [
    { month: "2026-10", attendance_percentage: 95 },
    { month: "2026-09", attendance_percentage: 100 }
  ],

  consecutive_absences: {
    consecutive_absences: 0,
    count: 0,
    from_date: null,
    to_date: null,
    dates: []
  },

  // ── Available Exams (Ready to take now) ──
  available_exams: [
    {
      id: 1,
      exam_id: 1,
      title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)",
      exam_title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)",
      duration_minutes: 60,
      full_mark: 50,
      questions_count: 3,
      has_essay: 1,
      start_at: new Date(nowMs - 3600000).toISOString(),
      end_at: new Date(nowMs + oneDayMs * 30).toISOString(),
      attempted: false,
    },
    {
      id: 2,
      exam_id: 2,
      title: "اختبار قصير: قواعد الهمزات والمشتقات (اختياري فقط)",
      exam_title: "اختبار قصير: قواعد الهمزات والمشتقات (اختياري فقط)",
      duration_minutes: 20,
      full_mark: 20,
      questions_count: 2,
      has_essay: 0,
      start_at: new Date(nowMs - 3600000).toISOString(),
      end_at: new Date(nowMs + oneDayMs * 30).toISOString(),
      attempted: false,
    },
    {
      id: 3,
      exam_id: 3,
      title: "اختبار تجريبي: بنك أسئلة الوزارة للوحدة الأولى",
      exam_title: "اختبار تجريبي: بنك أسئلة الوزارة للوحدة الأولى",
      duration_minutes: 45,
      full_mark: 40,
      questions_count: 3,
      has_essay: 1,
      start_at: new Date(nowMs - 3600000).toISOString(),
      end_at: new Date(nowMs + oneDayMs * 15).toISOString(),
      attempted: false,
    }
  ],

  // ── Completed Online Exams History (5 Completed Exams) ──
  history_exams: [
    {
      id: 105,
      attempt_id: 105,
      exam_id: 1,
      exam_title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)",
      score: 47,
      full_mark: 50,
      percentage: 94,
      result_status: "passed",
      submitted_at: new Date(nowMs - oneDayMs * 2).toISOString()
    },
    {
      id: 104,
      attempt_id: 104,
      exam_id: 2,
      exam_title: "اختبار سريع: إعراب اسم الفاعل والمفعول",
      score: 19,
      full_mark: 20,
      percentage: 95,
      result_status: "passed",
      submitted_at: new Date(nowMs - oneDayMs * 7).toISOString()
    },
    {
      id: 103,
      attempt_id: 103,
      exam_id: 3,
      exam_title: "اختبار البلاغة التراكمي: الصور البيانية والمحسنات",
      score: 28,
      full_mark: 30,
      percentage: 93,
      result_status: "passed",
      submitted_at: new Date(nowMs - oneDayMs * 14).toISOString()
    },
    {
      id: 102,
      attempt_id: 102,
      exam_id: 4,
      exam_title: "اختبار القراءة المتحررة والأدب الكلاسيكي",
      score: 23,
      full_mark: 25,
      percentage: 92,
      result_status: "passed",
      submitted_at: new Date(nowMs - oneDayMs * 21).toISOString()
    },
    {
      id: 101,
      attempt_id: 101,
      exam_id: 5,
      exam_title: "الامتحان التشخيصي لبداية الفصل الدراسي",
      score: 46,
      full_mark: 50,
      percentage: 92,
      result_status: "passed",
      submitted_at: new Date(nowMs - oneDayMs * 35).toISOString()
    }
  ],

  // ── Paper Center Exams (4 Official Center Exams) ──
  paper_exams: [
    {
      id: 304,
      exam_id: 304,
      title: "امتحان شهر أكتوبر الشامل بمركز السنتر",
      exam_title: "امتحان شهر أكتوبر الشامل بمركز السنتر",
      exam_date: new Date(nowMs - oneDayMs * 5).toISOString(),
      total_degree: 50,
      student_degree: 48,
      percentage: 96,
      exam_status: "attended"
    },
    {
      id: 303,
      exam_id: 303,
      title: "امتحان تجريبي ميداني: قواعد الإملاء والتعبير",
      exam_title: "امتحان تجريبي ميداني: قواعد الإملاء والتعبير",
      exam_date: new Date(nowMs - oneDayMs * 12).toISOString(),
      total_degree: 30,
      student_degree: 29,
      percentage: 97,
      exam_status: "attended"
    },
    {
      id: 302,
      exam_id: 302,
      title: "امتحان نصف شهر أكتوبر التحريري",
      exam_title: "امتحان نصف شهر أكتوبر التحريري",
      exam_date: new Date(nowMs - oneDayMs * 20).toISOString(),
      total_degree: 50,
      student_degree: 46,
      percentage: 92,
      exam_status: "attended"
    },
    {
      id: 301,
      exam_id: 301,
      title: "امتحان شهر سبتمبر التقييمي الميداني",
      exam_title: "امتحان شهر سبتمبر التقييمي الميداني",
      exam_date: new Date(nowMs - oneDayMs * 38).toISOString(),
      total_degree: 50,
      student_degree: 45,
      percentage: 90,
      exam_status: "attended"
    }
  ],

  // ── Unified Exam Results for Degrees Screen (Degrees.jsx) ──
  exam_results: [
    {
      result_id: 1,
      exam_type: "online",
      exam_title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)",
      exam_date: "2026-10-02",
      score: 47,
      full_mark: 50,
      percentage: 94,
      result_status: "passed"
    },
    {
      result_id: 2,
      exam_type: "paper",
      exam_title: "امتحان شهر أكتوبر الشامل بمركز السنتر",
      exam_date: "2026-09-29",
      score: 48,
      full_mark: 50,
      percentage: 96,
      result_status: "passed"
    },
    {
      result_id: 3,
      exam_type: "online",
      exam_title: "اختبار سريع: إعراب اسم الفاعل والمفعول",
      exam_date: "2026-09-27",
      score: 19,
      full_mark: 20,
      percentage: 95,
      result_status: "passed"
    },
    {
      result_id: 4,
      exam_type: "paper",
      exam_title: "امتحان تجريبي ميداني: قواعد الإملاء والتعبير",
      exam_date: "2026-09-22",
      score: 29,
      full_mark: 30,
      percentage: 97,
      result_status: "passed"
    },
    {
      result_id: 5,
      exam_type: "online",
      exam_title: "اختبار البلاغة التراكمي: الصور البيانية والمحسنات",
      exam_date: "2026-09-20",
      score: 28,
      full_mark: 30,
      percentage: 93,
      result_status: "passed"
    },
    {
      result_id: 6,
      exam_type: "paper",
      exam_title: "امتحان نصف شهر أكتوبر التحريري",
      exam_date: "2026-09-14",
      score: 46,
      full_mark: 50,
      percentage: 92,
      result_status: "passed"
    },
    {
      result_id: 7,
      exam_type: "online",
      exam_title: "اختبار القراءة المتحررة والأدب الكلاسيكي",
      exam_date: "2026-09-13",
      score: 23,
      full_mark: 25,
      percentage: 92,
      result_status: "passed"
    },
    {
      result_id: 8,
      exam_type: "paper",
      exam_title: "امتحان شهر سبتمبر التقييمي الميداني",
      exam_date: "2026-09-01",
      score: 45,
      full_mark: 50,
      percentage: 90,
      result_status: "passed"
    }
  ],

  // ── Exam Taking Payload ──
  exam_questions: {
    attempt_id: 105,
    exam_id: 1,
    title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)",
    duration_minutes: 60,
    remaining_seconds: 3600,
    full_mark: 50,
    questions: MOCK_QUESTIONS
  },

  // ── Exam Review Payload ──
  exam_review: {
    exam_title: "امتحان الوحدة الأولى الشامل (نحو وبلاغة وأدب)",
    score: 47,
    full_mark: 50,
    percentage: 94,
    correct_answers: 2,
    wrong_answers: 0,
    unanswered_questions: 1,
    questions: [
      {
        id: 1,
        question_id: 1,
        question_text: "أي من الكلمات الآتية تبدأ بهمزة قطع مع بيان السبب النحوي؟",
        question_type: "mcq",
        is_correct: 1,
        student_answer: null,
        options: [
          { id: 1, option_id: 1, option_text: "اقتصاد (مصدر لفعل خماسي)", is_correct: false, is_selected: false },
          { id: 2, option_id: 2, option_text: "أحمد (اسم علم مبدوء بهمزة أصلية)", is_correct: true, is_selected: true },
          { id: 3, option_id: 3, option_text: "انطلاق (مصدر لفعل خماسي)", is_correct: false, is_selected: false },
          { id: 4, option_id: 4, option_text: "استغفار (مصدر لفعل سداسي)", is_correct: false, is_selected: false }
        ]
      },
      {
        id: 2,
        question_id: 2,
        question_text: "كلمة (ابن) في اللغة العربية تبدأ بهمز وصل دائماً لأنها:",
        question_type: "mcq",
        is_correct: 1,
        student_answer: null,
        options: [
          { id: 5, option_id: 5, option_text: "من الأسماء التسعة الشاذة المسموعة عن العرب", is_correct: true, is_selected: true },
          { id: 6, option_id: 6, option_text: "مصدر لفعل خماسي مبدوء بهمزة", is_correct: false, is_selected: false },
          { id: 7, option_id: 7, option_text: "فعل أمر ثلاثي", is_correct: false, is_selected: false }
        ]
      },
      {
        id: 3,
        question_id: 3,
        question_text: "اشرح بالتفصيل: متى تُحذف ألف كلمة (ابن) ومتى تثبت رسماً؟ مع ذكر مثالين للتوضيح.",
        question_type: "essay",
        is_correct: null,
        student_answer: "تُحذف ألف (ابن) إذا وقعت مفردة بين علمين الثاني والد للأول ولم تقع في أول السطر، نحو: عمر بن الخطاب. وتثبت إذا ثُنّيت أو لم تقع بين علمين، نحو: قال ابن كثير.",
        teacher_feedback: "إجابة نموذجية ممتازة ودقيقة جداً يا بطل! أحسنت.",
        options: []
      }
    ]
  },

  // ── Semester Homework (6 Diverse Assignments) ──
  assignments: {
    data: [
      {
        id: 1,
        assignment_id: 1,
        title: "واجب همزة الوصل والقطع وتدريبات بنك المعرفة",
        description: "استخرج من النص الشعري المرفق 5 كلمات تبدأ بهمزة وصل و5 كلمات تبدأ بهمزة قطع مع تعليل كل منها.",
        full_mark: 10,
        deadline: new Date(nowMs - oneDayMs * 2).toISOString(),
        is_closed: 0,
        assignment_status: "graded",
        student_degree: 10,
        teacher_feedback: "إجابة ممتازة وخط منظم جداً يا أحمد! استمر في هذا التألق."
      },
      {
        id: 2,
        assignment_id: 2,
        title: "واجب إعراب المفعول المطلق والنائب عنه والشواهد",
        description: "قم بإعراب الأمثلة العشرة المرفقة في ملف الـ PDF مع تحديد نوع النائب عن المفعول المطلق بدقة.",
        full_mark: 15,
        deadline: new Date(nowMs - oneDayMs * 6).toISOString(),
        is_closed: 0,
        assignment_status: "graded",
        student_degree: 14,
        teacher_feedback: "ممتاز جداً! انتبه فقط لصياغة إعراب (كل) في المثال الرابع."
      },
      {
        id: 3,
        assignment_id: 3,
        title: "واجب القراءة المتحررة: قيم وتأملات في الفكر العربي",
        description: "حل تدريبات القراءة المتحررة للدرس الثاني وصياغة الفكرة العامة والأفكار الجزئية للمقال.",
        full_mark: 20,
        deadline: new Date(nowMs - oneDayMs * 1).toISOString(),
        is_closed: 0,
        assignment_status: "submitted",
        student_degree: null,
        teacher_feedback: null
      },
      {
        id: 4,
        assignment_id: 4,
        title: "واجب المبتدأ والخبر ونواسخ الجملة الاسمية (كان وأخواتها)",
        description: "حل التطبيقات الشاملة على كان التامة وكان الناقصة وأحكام تقديم الخبر على المبتدأ وجوباً وجوازاً.",
        full_mark: 20,
        deadline: new Date(nowMs + oneDayMs * 4).toISOString(),
        is_closed: 0,
        assignment_status: "not_submitted",
        student_degree: null,
        teacher_feedback: null
      },
      {
        id: 5,
        assignment_id: 5,
        title: "تطبيقات البلاغة: الاستعارة المكنية والتصريحية والتشبيه",
        description: "استخراج الصور البيانية من الأبيات الشعرية المرفقة وتوضيح سر جمالها (تشخيص / تجسيم / توضيح).",
        full_mark: 15,
        deadline: new Date(nowMs + oneDayMs * 9).toISOString(),
        is_closed: 0,
        assignment_status: "not_submitted",
        student_degree: null,
        teacher_feedback: null
      },
      {
        id: 6,
        assignment_id: 6,
        title: "تدريب التعبير الوظيفي: كتابة البسط والتلخيص والتقرير",
        description: "كتابة تقرير مفصل عن ندوة ثقافية وفق المعايير الوزارية الجديدة لأسئلة المقال.",
        full_mark: 15,
        deadline: new Date(nowMs - oneDayMs * 25).toISOString(),
        is_closed: 1,
        assignment_status: "not_submitted",
        student_degree: 0,
        teacher_feedback: "أُغلقت فترة تسليم الواجب لمرور الموعد النهائي المحدد."
      }
    ],
    pagination: { totalItems: 6, totalPages: 1 }
  },

  // ── Semester Video Playlists (3 Rich Playlists) ──
  playlists: {
    data: [
      {
        id: 1,
        playlist_id: 1,
        title: "الوحدة الأولى: قواعد النحو والإملاء للثانوية العامة",
        description: "شرح شامل ومفصل لدروس الوحدة الأولى: الهمزات، التاء المربوطة والمفتوحة، والمشتقات مع حل تدريبات كتاب الوزارة.",
        price: 150,
        videos_count: 2,
        cover_image: "https://picsum.photos/400/300?random=1",
        videos: [
          {
            id: 1,
            video_id: 1,
            title: "همزة الوصل والقطع بالتفصيل - جزء 1",
            video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
            url: "https://www.youtube.com/embed/03hsHuIXLQE",
            thumbnail: "https://picsum.photos/400/225?random=1",
            duration: "35:00",
            description: "شرح قواعد همزة الوصل وهمزة القطع في الأسماء والأفعال والحروف مع أمثلة شائعة."
          },
          {
            id: 2,
            video_id: 2,
            title: "قواعد رسم الهمزة المتوسطة والمتطرفة - جزء 2",
            video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
            url: "https://www.youtube.com/embed/gbst-g9OMdw",
            thumbnail: "https://picsum.photos/400/225?random=2",
            duration: "42:00",
            description: "تطبيق عملي وحل تدريبات بنك المعرفة على مواضع رسم الهمزات وتفادي الأخطاء الإملائية."
          }
        ]
      },
      {
        id: 2,
        playlist_id: 2,
        title: "البلاغة العربية: علم البيان والتصوير الفني والمحسنات",
        description: "رحلة شيقة في فنون البلاغة العربية لطلاب الثانوية العامة لفهم التشبيه والاستعارة والكناية والمجاز المرسل.",
        price: 120,
        videos_count: 2,
        cover_image: "https://picsum.photos/400/300?random=2",
        videos: [
          {
            id: 3,
            video_id: 3,
            title: "الاستعارة المكنية والتصريحية والفرق بينهما",
            video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
            url: "https://www.youtube.com/embed/03hsHuIXLQE",
            thumbnail: "https://picsum.photos/400/225?random=3",
            duration: "28:15",
            description: "كيفية استخراج الاستعارة وتحديد نوعها وسر جمالها في الأسئلة الوزارية."
          },
          {
            id: 4,
            video_id: 4,
            title: "المحسنات البديعية اللفظية والمعنوية",
            video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
            url: "https://www.youtube.com/embed/gbst-g9OMdw",
            thumbnail: "https://picsum.photos/400/225?random=4",
            duration: "31:40",
            description: "شرح الطباق، المقابلة، الجناس، السجع، والتورية مع تدريبات مكثفة."
          }
        ]
      },
      {
        id: 3,
        playlist_id: 3,
        title: "فنون الأدب ونصوص المنهج: مدرسة الإحياء والبعث",
        description: "دراسة تحليلية لرواد مدرسة الإحياء والبعث وجيل التطوير مع قراءة وشرح النصوص الشعرية المقررة.",
        price: 100,
        videos_count: 2,
        cover_image: "https://picsum.photos/400/300?random=3",
        videos: [
          {
            id: 5,
            video_id: 5,
            title: "مقدمة مدرسة الإحياء والبعث وجيل التطوير",
            video_url: "https://www.youtube.com/watch?v=03hsHuIXLQE",
            url: "https://www.youtube.com/embed/03hsHuIXLQE",
            thumbnail: "https://picsum.photos/400/225?random=5",
            duration: "39:10",
            description: "عوامل التجديد عند تلاميذ البارودي وخصائص شعر أحمد شوقي وحافظ إبراهيم."
          },
          {
            id: 6,
            video_id: 6,
            title: "تحليل نص غربة وحنين للشاعر أحمد شوقي",
            video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
            url: "https://www.youtube.com/embed/gbst-g9OMdw",
            thumbnail: "https://picsum.photos/400/225?random=6",
            duration: "45:00",
            description: "المعاني والأفكار ومواطن الجمال في النص المقرر مع أسئلة امتحانات سابقة."
          }
        ]
      }
    ],
    pagination: { totalItems: 3, totalPages: 1 }
  },

  // ── Semester Payments (3 Consecutive Monthly Fees) ──
  payments: [
    {
      id: 3,
      amount: 250,
      subscription_month: "نوفمبر 2026",
      month: "2026-11",
      paid_at: new Date(nowMs - oneDayMs * 2).toISOString(),
      payment_date: new Date(nowMs - oneDayMs * 2).toISOString()
    },
    {
      id: 2,
      amount: 250,
      subscription_month: "أكتوبر 2026",
      month: "2026-10",
      paid_at: new Date(nowMs - oneDayMs * 32).toISOString(),
      payment_date: new Date(nowMs - oneDayMs * 32).toISOString()
    },
    {
      id: 1,
      amount: 250,
      subscription_month: "سبتمبر 2026",
      month: "2026-09",
      paid_at: new Date(nowMs - oneDayMs * 62).toISOString(),
      payment_date: new Date(nowMs - oneDayMs * 62).toISOString()
    }
  ]
};

// ============================================================
// EXPORTED ACTION FUNCTIONS (BYPASSING API FOR DEMO)
// ============================================================

// 1. Dashboard
export const fetchStudentDashboard = async () => {
  if (isDemo()) return { success: true, data: mockData.dashboard };
  try { return { success: true, data: await studentServices.getDashboard() }; }
  catch (error) { return { success: false, error: error.message }; }
};

// 2. Profile
export const fetchStudentProfile = async () => {
  if (isDemo()) return { success: true, data: mockData.profile };
  try { return { success: true, data: await studentServices.getProfile() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchStudentStats = async () => {
  if (isDemo()) return { success: true, data: mockData.stats };
  try { return { success: true, data: await studentServices.getQuickStats() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const updateStudentProfileImage = async () => {
  if (isDemo()) return { success: true, data: { profile_image: mockData.profile.profile_image } };
  try { return { success: true, data: await studentServices.updateProfileImage() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const deleteStudentProfileImage = async () => {
  if (isDemo()) return { success: true };
  try { return { success: true, data: await studentServices.deleteProfileImage() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const changeStudentPassword = async () => {
  if (isDemo()) return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
  return { success: false, error: "Not implemented in demo" };
};

// 3. Attendance
export const fetchAttendanceHistory = async (month = "", page = 1) => {
  if (isDemo()) {
    return {
      success: true,
      data: mockData.attendance.data,
      pagination: mockData.attendance.pagination
    };
  }
  try { return { success: true, ...unwrapApiData(await studentServices.getAttendanceHistory(month, page)) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchMonthlyAttendance = async () => {
  if (isDemo()) return { success: true, data: mockData.monthly_attendance };
  try { return { success: true, data: await studentServices.getMonthlyAttendance() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchConsecutiveAbsences = async () => {
  if (isDemo()) return { success: true, data: mockData.consecutive_absences };
  try { return { success: true, data: await studentServices.getConsecutiveAbsences() }; }
  catch (error) { return { success: false, error: error.message }; }
};

// 4. Exams
export const fetchAvailableExams = async (page = 1) => {
  if (isDemo()) {
    return {
      success: true,
      data: mockData.available_exams,
      pagination: { totalItems: mockData.available_exams.length, totalPages: 1 }
    };
  }
  try { return { success: true, ...unwrapApiData(await studentServices.getAvailableExams(page)) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchExamHistory = async (month = "", page = 1) => {
  if (isDemo()) {
    return {
      success: true,
      data: mockData.history_exams,
      pagination: { totalItems: mockData.history_exams.length, totalPages: 1 }
    };
  }
  try { return { success: true, ...unwrapApiData(await studentServices.getExamHistory(month, page)) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchPaperExams = async (month = "", page = 1) => {
  if (isDemo()) {
    return {
      success: true,
      data: mockData.paper_exams,
      pagination: { totalItems: mockData.paper_exams.length, totalPages: 1 }
    };
  }
  try { return { success: true, ...unwrapApiData(await studentServices.getPaperExams(month, page)) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchPaperExamById = async (id) => {
  if (isDemo()) {
    const exam = mockData.paper_exams.find(e => e.exam_id == id || e.id == id) || mockData.paper_exams[0];
    return { success: true, data: exam };
  }
  try { return { success: true, data: await studentServices.getPaperExamById(id) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchExamResults = async (month = "", page = 1) => {
  if (isDemo()) {
    return {
      success: true,
      data: mockData.exam_results,
      pagination: { totalItems: mockData.exam_results.length, totalPages: 1 }
    };
  }
  try { return { success: true, ...unwrapApiData(await studentServices.getExamResults(month, page)) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchOnlineExamById = async (id) => {
  if (isDemo()) {
    const exam = mockData.available_exams.find(e => e.exam_id == id || e.id == id) || mockData.available_exams[0];
    return { success: true, data: exam };
  }
  try { return { success: true, data: await studentServices.getOnlineExamById(id) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const checkExamAttempt = async () => {
  if (isDemo()) return { success: true, data: { has_active_attempt: false, submitted: false } };
  try { return { success: true, data: await studentServices.checkExamAttempt() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const startStudentExam = async (id) => {
  if (isDemo()) {
    return {
      success: true,
      data: {
        ...mockData.exam_questions,
        exam_id: id || 1
      }
    };
  }
  try { return { success: true, data: await studentServices.startExam(id) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const resumeStudentExam = async (id) => {
  if (isDemo()) return { success: true, data: mockData.exam_questions };
  try { return { success: true, data: await studentServices.resumeExam(id) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const submitStudentExam = async () => {
  if (isDemo()) return { success: true, message: "تم تسليم الامتحان بنجاح وحساب النتيجة" };
  try { return { success: true, data: await studentServices.submitExam() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchExamQuestions = async () => {
  if (isDemo()) return { success: true, data: mockData.exam_questions };
  try { return { success: true, data: await studentServices.getExamQuestions() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchQuestionById = async (qId) => {
  if (isDemo()) return { success: true, data: MOCK_QUESTIONS.find(q => q.id == qId) || MOCK_QUESTIONS[0] };
  try { return { success: true, data: await studentServices.getQuestionById(qId) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchOptionsByQuestion = async (qId) => {
  const q = MOCK_QUESTIONS.find(item => item.id == qId) || MOCK_QUESTIONS[0];
  if (isDemo()) return { success: true, data: q.options };
  try { return { success: true, data: await studentServices.getOptionsByQuestion(qId) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const submitStudentAnswer = async () => {
  if (isDemo()) return { success: true };
  try { return { success: true, data: await studentServices.answerQuestion() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const submitStudentEssayAnswer = async () => {
  if (isDemo()) return { success: true };
  try { return { success: true, data: await studentServices.submitEssayAnswer() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchExamReview = async () => {
  if (isDemo()) return { success: true, data: mockData.exam_review };
  try { return { success: true, data: await studentServices.getExamReview() }; }
  catch (error) { return { success: false, error: error.message }; }
};

// 5. Assignments (Homework)
export const fetchAssignments = async (month = "", page = 1) => {
  if (isDemo()) {
    return {
      success: true,
      data: mockData.assignments.data,
      pagination: mockData.assignments.pagination
    };
  }
  try { return { success: true, ...unwrapApiData(await studentServices.getAssignments(month, page)) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchAssignmentById = async (id) => {
  if (isDemo()) {
    const item = mockData.assignments.data.find(a => a.assignment_id == id || a.id == id) || mockData.assignments.data[0];
    return { success: true, data: item };
  }
  try { return { success: true, data: await studentServices.getAssignmentById(id) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const downloadAssignmentFile = async () => {
  if (isDemo()) return { success: true, data: new Blob(["ملف واجب تجريبي كامل"], { type: "application/pdf" }) };
  try { return { success: true, data: await studentServices.downloadAssignment() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const submitStudentAssignment = async () => {
  if (isDemo()) return { success: true, message: "تم تسليم الواجب بنجاح وإرساله للمصحح" };
  try { return { success: true, data: await studentServices.submitAssignment() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const updateStudentAssignment = async () => {
  if (isDemo()) return { success: true, message: "تم تحديث تسليم الواجب بنجاح" };
  try { return { success: true, data: await studentServices.updateAssignmentSubmission() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchSubmissions = async () => {
  if (isDemo()) return { success: true, data: mockData.assignments.data };
  try { return { success: true, data: await studentServices.getSubmissions() }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const downloadSubmissionFile = async () => {
  if (isDemo()) return { success: true, data: new Blob(["ملف تسليم الطالب التجريبي"], { type: "application/pdf" }) };
  try { return { success: true, data: await studentServices.downloadSubmissionFile() }; }
  catch (error) { return { success: false, error: error.message }; }
};

// 6. Playlists & Courses
export const fetchPlaylists = async (page = 1) => {
  if (isDemo()) {
    return {
      success: true,
      data: mockData.playlists.data,
      pagination: mockData.playlists.pagination
    };
  }
  try { return { success: true, ...unwrapApiData(await studentServices.getPlaylists(page)) }; }
  catch (error) { return { success: false, error: error.message }; }
};

export const fetchPlaylistVideos = async (id) => {
  if (isDemo()) {
    const pl = mockData.playlists.data.find(p => p.playlist_id == id || p.id == id) || mockData.playlists.data[0];
    return { success: true, data: pl.videos || [] };
  }
  try { return { success: true, data: await studentServices.getPlaylistVideos(id) }; }
  catch (error) { return { success: false, error: error.message }; }
};

// 7. Finance & Payments
export const fetchPaymentHistory = async () => {
  if (isDemo()) return { success: true, data: mockData.payments };
  return { success: true, data: [] };
};

export const fetchRemainingBalance = async () => {
  if (isDemo()) return { success: true, data: { amount: 0 } };
  return { success: true, data: null };
};

export const fetchCurrentSubscription = async () => {
  if (isDemo()) return { success: true, data: { status: "active", plan: "اشتراك شهري كامل (شامل السنتر والأونلاين)" } };
  return { success: true, data: null };
};
