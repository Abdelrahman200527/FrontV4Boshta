const generateResponse = (data) => {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const DUMMY_DATE = "2026-10-15T18:00:00.000Z";
const MEET_LINK = "https://meet.google.com/aqx-mmwy-zhv";
const YOUTUBE_URL_1 = "https://www.youtube.com/watch?v=03hsHuIXLQE";
const YOUTUBE_URL_2 = "https://www.youtube.com/watch?v=gbst-g9OMdw";

const mockGrades = [
  { id: 1, grade_name: "الصف الأول الثانوي" },
  { id: 2, grade_name: "الصف الثاني الثانوي" },
  { id: 3, grade_name: "الصف الثالث الثانوي" },
];

const mockGroups = [
  { id: 1, grade_id: 3, group_name: "مجموعة السبت والأربعاء", days: "السبت, الأربعاء", time: "04:00 PM" },
  { id: 2, grade_id: 3, group_name: "مجموعة الأحد والخميس", days: "الأحد, الخميس", time: "06:00 PM" },
];

const mockStudents = [
  { id: 1, full_name: "أحمد محمود سالم", barcode: "0011", phone: "01012345678", parent_phone: "01098765432", grade_id: 3, group_id: 1, is_active: true, join_date: "2026-09-01", profile_image: "https://ui-avatars.com/api/?name=أحمد+محمود&background=1a5d1a&color=fff&size=200" },
  { id: 2, full_name: "كريم عبد الله حسين", barcode: "0012", phone: "01112345678", parent_phone: "01198765432", grade_id: 3, group_id: 2, is_active: true, join_date: "2026-09-02", profile_image: "https://ui-avatars.com/api/?name=كريم+عبد+الله&background=009966&color=fff&size=200" },
  { id: 3, full_name: "سارة مجدي أحمد", barcode: "0013", phone: "01212345678", parent_phone: "01298765432", grade_id: 3, group_id: 1, is_active: false, join_date: "2026-09-05", profile_image: "https://ui-avatars.com/api/?name=سارة+مجدي&background=D4B45C&color=fff&size=200" }
];

const mockLiveSessions = [
  { id: 1, title: "مراجعة همزة الوصل والقطع (مباشر الآن)", start_time: new Date(Date.now() - 1000 * 60 * 10).toISOString(), end_time: new Date(Date.now() + 1000 * 60 * 50).toISOString(), duration_minutes: 60, status: "live", target_type: "grade", grade_id: 3, meet_link: MEET_LINK, material_name: "ملزمة_المراجعة.pdf" },
  { id: 2, title: "حل تدريبات النحو", start_time: "2026-10-10T18:00:00.000Z", end_time: "2026-10-10T20:00:00.000Z", duration_minutes: 120, status: "ended", target_type: "group", group_id: 1, meet_link: MEET_LINK, recording_url: YOUTUBE_URL_1, material_name: "تدريبات.pdf" }
];

const mockExams = [
  { id: 1, title: "امتحان الوحدة الأولى (شامل مقالي وموضوعي)", type: "online", duration_minutes: 60, total_degree: 50, start_date: "2026-10-01", end_date: "2026-12-01", grade_id: 3, questions_count: 5, has_essay: true },
  { id: 2, title: "اختبار قصير: همزة القطع (اختياري فقط)", type: "online", duration_minutes: 20, total_degree: 20, start_date: "2026-10-01", end_date: "2026-12-01", grade_id: 3, questions_count: 5, has_essay: false }
];

const mockPaperExams = [
  { id: 3, exam_title: "امتحان شهر أكتوبر الميداني", type: "paper", total_degree: 50, grade_id: 3, date: "2026-10-15", degree: 45, full_mark: 50 }
];

const mockAssignments = [
  { id: 1, title: "واجب همزة الوصل والقطع", description: "استخرج من القطعة 5 كلمات بها همزة وصل و 5 كلمات بها همزة قطع.", full_mark: 10, grade_id: 3, deadline: "2026-10-01", status: "submitted", degree: 9, teacher_feedback: "ممتاز يا بطل استمر، راجع فقط كلمة (استخراج)." },
  { id: 2, title: "واجب المفعول المطلق", description: "أعرب الجمل المرفقة في ملف الـ PDF.", full_mark: 15, grade_id: 3, deadline: "2026-10-15", status: "late", degree: null, teacher_feedback: null },
  { id: 3, title: "بحث القراءة الحرة", description: "اكتب ملخصاً لا يتجاوز صفحة واحدة.", full_mark: 20, grade_id: 3, deadline: "2026-09-01", status: "closed", degree: 0, teacher_feedback: "لم يتم التسليم في الموعد." }
];

const mockVideos = [
  { id: 1, title: "همزة الوصل والقطع - جزء 1", description: "شرح القاعدة الأساسية", url: YOUTUBE_URL_1, grade_id: 3, is_free: false, views: 1500, thumbnail: "https://picsum.photos/400/225?random=1" },
  { id: 2, title: "همزة الوصل والقطع - جزء 2", description: "تطبيقات وحل أسئلة", url: YOUTUBE_URL_2, grade_id: 3, is_free: false, views: 1200, thumbnail: "https://picsum.photos/400/225?random=2" }
];

const mockPlaylists = [
  { id: 1, title: "الوحدة الأولي عربي تالته ثانوي", description: "شرح شامل وتدريبات مكثفة على الوحدة الأولى.", grade_id: 3, price: 150, cover_image: "https://picsum.photos/400/300?random=3", videos: mockVideos }
];

const mockQuestions = [
  {
    question_id: 1, question_text: "أي الكلمات الآتية تبدأ بهمزة قطع؟", question_type: "mcq", mark: 2,
    options: [ { option_id: 1, option_text: "اقتصاد" }, { option_id: 2, option_text: "أحمد" }, { option_id: 3, option_text: "انطلاق" }, { option_id: 4, option_text: "استغفار" } ]
  },
  {
    question_id: 2, question_text: "كلمة (ابن) تبدأ بهمزة وصل لأنها:", question_type: "mcq", mark: 2,
    options: [ { option_id: 5, option_text: "من الأسماء التسعة المسموعة" }, { option_id: 6, option_text: "مصدر خماسي" }, { option_id: 7, option_text: "فعل ماضي" } ]
  },
  {
    question_id: 3, question_text: "اشرح متى تُحذف ألف (ابن) ومتى تثبت؟ مع التمثيل.", question_type: "essay", mark: 6, options: []
  }
];

const mockExamReview = {
  exam_title: "امتحان الوحدة الأولى (شامل مقالي وموضوعي)",
  score: 8,
  full_mark: 10,
  percentage: 80,
  correct_answers: 1,
  wrong_answers: 1,
  unanswered_questions: 1,
  questions: [
    {
      question_id: 1, question_text: "أي الكلمات الآتية تبدأ بهمزة قطع؟", question_type: "mcq", is_correct: 1, student_answer: null,
      options: [
        { option_id: 1, option_text: "اقتصاد", is_correct: false, is_selected: false },
        { option_id: 2, option_text: "أحمد", is_correct: true, is_selected: true },
        { option_id: 3, option_text: "انطلاق", is_correct: false, is_selected: false },
        { option_id: 4, option_text: "استغفار", is_correct: false, is_selected: false }
      ]
    },
    {
      question_id: 2, question_text: "كلمة (ابن) تبدأ بهمزة وصل لأنها:", question_type: "mcq", is_correct: 0, student_answer: null,
      options: [
        { option_id: 5, option_text: "من الأسماء التسعة المسموعة", is_correct: true, is_selected: false },
        { option_id: 6, option_text: "مصدر خماسي", is_correct: false, is_selected: true },
        { option_id: 7, option_text: "فعل ماضي", is_correct: false, is_selected: false }
      ]
    },
    {
      question_id: 3, question_text: "اشرح متى تُحذف ألف (ابن) ومتى تثبت؟ مع التمثيل.", question_type: "essay", is_correct: null, student_answer: "تُحذف إذا وقعت بين علمين الثاني أب للأول.",
      options: []
    }
  ]
};

export const handleDemoRequest = async (url, options) => {
  const method = options.method || "GET";
  
  await new Promise(r => setTimeout(r, 600));

  const role = localStorage.getItem("demo_role") || "student";

  // Blob simulation for PDF/Excel downloads
  if (url.includes("/download") || url.includes("/export") || url.includes("/pdf") || url.includes("/excel")) {
    return new Response(new Blob(["Demo File Content"], { type: "application/pdf" }), { status: 200 });
  }

  if (method !== "GET") {
    if (url.includes("/auth/") || url.includes("/login")) {
      return generateResponse({
        success: true,
        message: "تم تسجيل الدخول بنجاح (ديمو)",
        token: "demo_token_123",
        user: { id: 1, role, full_name: "مستخدم تجريبي" },
        student: { id: 1, role, full_name: "أحمد محمود سالم", barcode: "0011" }
      });
    }

    if (url.includes("/parent")) {
      return generateResponse({
        success: true,
        data: {
          students: [mockStudents[0], mockStudents[1]],
          summary: { total_students: 2, active_students: 2, overall_attendance_rate: "85%" },
          details: {
            id: mockStudents[0].id, full_name: mockStudents[0].full_name, barcode: mockStudents[0].barcode, grade_name: "الصف الثالث الثانوي", group_name: "مجموعة السبت والأربعاء",
            attendance: [{ id: 1, session_date: "2026-10-01", status: "present" }], exams: [{ id: 1, title: "امتحان شامل الباب الأول", degree: 45, full_mark: 50, date: "2026-10-01", status: "passed" }],
            payments: [{ id: 1, amount: 150, month: "2026-10", paid_at: "2026-10-01" }], homeworks: mockAssignments, stats: { attendance_rate: 85, exams_average: 90, payments_status: "paid" }
          }
        }
      });
    }

    if (url.includes("/youtube/init-upload")) {
      return generateResponse({
        success: true,
        message: "تم إنشاء جلسة الرفع المباشر بنجاح (ديمو)",
        data: {
          upload_url: "https://demo.google.upload/resumable-session-123",
          title: "فيديو تجريبي",
          grade_id: 3,
        },
      });
    }

    if (url.includes("/youtube/confirm-upload")) {
      const newMockVideo = {
        id: Date.now(),
        title: "فيديو جديد (تم رفعه بنجاح)",
        description: "تم رفع الفيديو مباشرة إلى يوتيوب بنجاح",
        grade_id: 3,
        video_url: "https://www.youtube.com/watch?v=gbst-g9OMdw",
        thumbnail: "https://picsum.photos/400/225?random=9",
        created_at: new Date().toISOString(),
      };
      mockVideos.unshift(newMockVideo);
      return generateResponse({
        success: true,
        message: "تم تسجيل وحفظ الفيديو في المنصة بنجاح",
        data: {
          video: newMockVideo,
          playlist_attached: true,
          youtube_video_id: "gbst-g9OMdw",
        },
      });
    }

    return generateResponse({
      success: true,
      message: "تمت العملية بنجاح (بيانات تجريبية)",
      data: { id: 999, status: "success" }
    });
  }

  // Handle GET requests
  if (url.includes("/youtube/channel")) {
    return generateResponse({
      success: true,
      data: {
        is_connected: true,
        channel_id: "UCdemo123456789",
        title: "قناة المنصة المركزية (ديمو)",
        video_count: 24,
      },
    });
  }
  if (url.includes("/profile") || url.includes("/me")) {
    return generateResponse({
      success: true,
      data: {
        id: 1, full_name: "أحمد محمود سالم", email: "student@benben.com", phone: "01012345678", parent_phone: "01098765432",
        role, barcode: role === "student" ? "0011" : null, grade_id: 3, group_id: 1,
        grade_name: "الصف الثالث الثانوي", group_name: "مجموعة السبت والأربعاء",
        permissions: ["manage_students", "manage_exams"], profile_image: mockStudents[0].profile_image
      }
    });
  }

  if (url.includes("/dashboard") || url.includes("/stats")) {
    if (role === "student") {
      return generateResponse({
        success: true,
        data: {
          attendance_rate: 95, exams_average: 90, completed_homeworks: 2, total_homeworks: 3, total_courses: 1,
          upcoming_live: mockLiveSessions[0], upcoming_exam: mockExams[0],
          recent_activities: [
            { type: "exam", title: "امتحان الوحدة الأولى", date: "2026-10-01", degree: 45, full_mark: 50 },
            { type: "homework", title: "واجب همزة الوصل والقطع", date: "2026-10-05", degree: 9, full_mark: 10 }
          ]
        }
      });
    }
    
    if (role === "teacher" || role === "super_admin") {
      return generateResponse({
        success: true,
        data: {
          total_students: 450, total_revenue: 150000, active_courses: 8, upcoming_sessions: 2,
          recent_payments: [{ id: 1, student_name: "أحمد محمود سالم", amount: 150, date: "2026-10-03" }],
          attendance_stats: { present: 300, absent: 50, excused: 10 }, exams_stats: { passed: 400, failed: 20 }
        }
      });
    }

    if (role === "assistant") {
      return generateResponse({
        success: true,
        data: {
          scanned_today: 120, pending_homeworks: 45, active_groups: 3,
          recent_scans: [{ id: 1, student_name: "سارة مجدي أحمد", time: "04:05 PM", status: "present" }]
        }
      });
    }
  }

  if (url.includes("/live-sessions")) {
    if (url.match(/\/live-sessions\/\d+$/)) return generateResponse({ success: true, data: mockLiveSessions[0] });
    return generateResponse({ success: true, data: mockLiveSessions, sessions: mockLiveSessions, pagination: { totalItems: 2, totalPages: 1 } });
  }

  if (url.includes("/exams")) {
    if (url.includes("/paper")) return generateResponse({ success: true, data: mockPaperExams, pagination: { totalItems: 1, totalPages: 1 } });
    if (url.includes("/available")) return generateResponse({ success: true, data: mockExams, pagination: { totalItems: 2, totalPages: 1 } });
    if (url.includes("/history") || url.includes("/results")) return generateResponse({ success: true, data: [
      { id: 1, exam_title: "امتحان الوحدة الأولى (شامل مقالي وموضوعي)", degree: 45, full_mark: 50, submit_date: "2026-10-01", status: "passed", student_name: "أحمد محمود سالم" }
    ], pagination: { totalItems: 1, totalPages: 1 } });
    
    if (url.includes("/review")) return generateResponse({ success: true, data: mockExamReview });
    
    if (url.match(/\/exams\/\d+\/questions$/)) return generateResponse({
      success: true,
      data: {
        attempt_id: 999,
        exam_id: 1,
        duration_minutes: 60,
        remaining_seconds: 3600,
        questions: mockQuestions
      }
    });
    
    if (url.includes("/online/") && url.match(/\d+$/)) return generateResponse({ success: true, data: mockExams[0] });

    if (url.match(/\/exams\/\d+$/)) return generateResponse({ success: true, data: mockExams[0] });
    return generateResponse({ success: true, data: mockExams, pagination: { totalItems: 2, totalPages: 1 } });
  }

  if (url.includes("/questions")) {
    return generateResponse({ success: true, data: mockQuestions });
  }
  
  if (url.includes("/assignments") || url.includes("/homework")) {
    if (url.match(/\/assignments\/\d+$/) || url.match(/\/homework\/\d+$/)) return generateResponse({ success: true, data: mockAssignments[0] });
    return generateResponse({ success: true, data: mockAssignments, assignments: mockAssignments, pagination: { totalItems: 3, totalPages: 1 } });
  }
  if (url.includes("/videos")) {
    if (url.match(/\/videos\/\d+$/)) return generateResponse({ success: true, data: mockVideos[0] });
    return generateResponse({ success: true, data: mockVideos, pagination: { totalItems: 2, totalPages: 1 } });
  }
  if (url.includes("/playlists") || url.includes("/courses")) {
    if (url.match(/\/courses\/\d+$/) || url.match(/\/playlists\/\d+$/)) return generateResponse({ success: true, data: mockPlaylists[0] });
    return generateResponse({ success: true, data: mockPlaylists, playlists: mockPlaylists, pagination: { totalItems: 1, totalPages: 1 } });
  }
  
  if (url.includes("/students")) {
    if (url.includes("/barcode/")) return generateResponse({ success: true, data: mockStudents[0] });
    if (url.match(/\/students\/\d+$/)) return generateResponse({ success: true, data: mockStudents[0] });
    return generateResponse({ success: true, data: mockStudents, students: mockStudents, pagination: { totalItems: 3, totalPages: 1 } });
  }
  if (url.includes("/groups")) return generateResponse({ success: true, data: mockGroups, groups: mockGroups });
  if (url.includes("/grades")) return generateResponse({ success: true, data: mockGrades, grades: mockGrades });
  if (url.includes("/users")) return generateResponse({ success: true, data: [{ id: 1, full_name: "مدرس تجريبي", email: "teacher@benben.com", role: "teacher", is_active: true }] });
  
  if (url.includes("/attendance")) {
    return generateResponse({ 
      success: true, 
      data: [{ id: 1, session_date: "2026-10-01", status: "present", group_name: "مجموعة السبت والأربعاء" }, { id: 2, session_date: "2026-10-05", status: "absent", group_name: "مجموعة السبت والأربعاء" }], 
      pagination: { totalItems: 2, totalPages: 1 } 
    });
  }

  if (url.includes("/parent")) {
    return generateResponse({
      success: true,
      data: {
        students: [mockStudents[0], mockStudents[1]],
        summary: { total_students: 2, active_students: 2, overall_attendance_rate: "85%" },
        details: {
          id: mockStudents[0].id, full_name: mockStudents[0].full_name, barcode: mockStudents[0].barcode, grade_name: "الصف الثالث الثانوي", group_name: "مجموعة السبت والأربعاء",
          attendance: [{ id: 1, session_date: "2026-10-01", status: "present" }], exams: [{ id: 1, title: "امتحان شامل الباب الأول", degree: 45, full_mark: 50, date: "2026-10-01", status: "passed" }],
          payments: [{ id: 1, amount: 150, month: "2026-10", paid_at: "2026-10-01" }], homeworks: mockAssignments, stats: { attendance_rate: 85, exams_average: 90, payments_status: "paid" }
        }
      }
    });
  }

  const isSingleItem = url.match(/\/\d+$/);
  return generateResponse({
    success: true,
    data: isSingleItem ? { id: 999, title: "بيانات ديمو", status: "active" } : [],
  });
};
