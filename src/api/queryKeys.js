export const qk = {
  assistant: {
    profile: ["assistant", "profile"],
    dashboard: ["assistant", "dashboard"],
    activityLog: (entity = "", date = "", page = 1) => [
      "assistant",
      "activity-log",
      entity,
      date,
      page,
    ],
  },

  grades: {
    all: ["grades"],
    stats: ["grades", "stats"],
    groupsCount: ["grades", "groups-count"],
    studentsCount: ["grades", "students-count"],
    detail: (id) => ["grades", "detail", String(id)],
    fullDetails: (id) => ["grades", "full-details", String(id)],
  },

  groups: {
    all: ["groups"],
    stats: ["groups", "stats"],
    studentsCount: ["groups", "students-count"],
    withGradeName: ["groups", "with-grade-name"],
    byGrade: (gradeId) => ["groups", "by-grade", String(gradeId)],
    detail: (id) => ["groups", "detail", String(id)],
    fullStats: (id) => ["groups", "full-stats", String(id)],
  },

  students: {
    list: (page = 1, search = "", gradeId = "", groupId = "") => [
      "students",
      "list",
      page,
      search,
      gradeId,
      groupId,
    ],
    deleted: (page = 1) => ["students", "deleted", page],
    byGroup: (groupId) => ["students", "by-group", String(groupId)],
    byGrade: (gradeId) => ["students", "by-grade", String(gradeId)],
    detail: (id) => ["students", "detail", String(id)],
    profile: (id) => ["students", "profile", String(id)],
    stats: (id) => ["students", "stats", String(id)],
    attendance: (id) => ["students", "attendance", String(id)],
    attendanceMonthly: (id) => ["students", "attendance-monthly", String(id)],
    attendanceTotal: (id, month) => [
      "students",
      "attendance-total",
      String(id),
      month,
    ],
    consecutiveAbsences: (id) => [
      "students",
      "consecutive-absences",
      String(id),
    ],
    payments: (id) => ["students", "payments", String(id)],
    paymentsBalance: (id) => ["students", "payments-balance", String(id)],
    currentSubscription: (id) => [
      "students",
      "current-subscription",
      String(id),
    ],
    paperExams: (id) => ["students", "paper-exams", String(id)],
    examResults: (id) => ["students", "exam-results", String(id)],
    onlineExams: (id) => ["students", "online-exams", String(id)],
    assignments: (id) => ["students", "assignments", String(id)],
    submissions: (id) => ["students", "submissions", String(id)],
    playlists: (id) => ["students", "playlists", String(id)],
  },

  attendance: {
    dashboard: ["attendance", "dashboard"],
    overview: ["attendance", "overview"],
    activeSession: (groupId) => [
      "attendance",
      "active-session",
      String(groupId),
    ],
    byGroupDate: (groupId, date) => [
      "attendance",
      "group",
      String(groupId),
      date,
    ],
    byGroupMonth: (groupId, month) => [
      "attendance",
      "group-month",
      String(groupId),
      month,
    ],
    summary: (groupId, date) => [
      "attendance",
      "summary",
      String(groupId),
      date,
    ],
    gradeStats: (gradeId) => ["attendance", "grade-stats", String(gradeId)],
  },

  payments: {
    list: (page = 1, search = "", gradeId = "", groupId = "") => [
      "payments",
      "list",
      page,
      search,
      gradeId,
      groupId,
    ],
    detail: (id) => ["payments", "detail", String(id)],
    overview: ["payments", "overview"],
    collections: ["payments", "collections"],
    unpaid: ["payments", "unpaid"],
    statuses: ["payments", "statuses"],
    gradeStats: (gradeId) => ["payments", "grade-stats", String(gradeId)],
    groupStats: (groupId) => ["payments", "group-stats", String(groupId)],
  },

  subscriptions: {
    overview: ["subscriptions", "overview"],
    withoutCurrent: ["subscriptions", "without-current"],
    byMonth: (month) => ["subscriptions", "month", month],
    student: (studentId) => ["subscriptions", "student", String(studentId)],
    gradeStats: (gradeId) => ["subscriptions", "grade-stats", String(gradeId)],
    groupStats: (groupId) => ["subscriptions", "group-stats", String(groupId)],
  },

  exams: {
    all: (page = 1) => ["exams", "all", page],
    byGrade: (gradeId) => ["exams", "by-grade", String(gradeId)],
    byGroup: (groupId) => ["exams", "by-group", String(groupId)],
    detail: (id) => ["exams", "detail", String(id)],
    results: (id) => ["exams", "results", String(id)],
    stats: (id) => ["exams", "stats", String(id)],
    gradeStats: (gradeId) => ["exams", "grade-stats", String(gradeId)],
  },

  examResults: {
    byExam: (examId) => ["exam-results", "by-exam", String(examId)],
    stats: (examId) => ["exam-results", "stats", String(examId)],
    gradeStats: (gradeId) => ["exam-results", "grade-stats", String(gradeId)],
    groupStats: (groupId) => ["exam-results", "group-stats", String(groupId)],
  },

  onlineExams: {
    all: ["online-exams"],
    available: ["online-exams", "available"],
    expired: ["online-exams", "expired"],
    byGrade: (gradeId) => ["online-exams", "by-grade", String(gradeId)],
    byGroup: (groupId) => ["online-exams", "by-group", String(groupId)],
    detail: (id) => ["online-exams", "detail", String(id)],
    stats: (id) => ["online-exams", "stats", String(id)],
    gradeStats: (gradeId) => ["online-exams", "grade-stats", String(gradeId)],
    questions: (examId) => ["online-exams", "questions", String(examId)],
  },

  questions: {
    byExam: (examId) => ["questions", "by-exam", String(examId)],
    detail: (id) => ["questions", "detail", String(id)],
    answerStats: (id) => ["questions", "answer-stats", String(id)],
    optionsStats: (id) => ["questions", "options-stats", String(id)],
  },

  options: {
    byQuestion: (questionId) => ["options", "by-question", String(questionId)],
    detail: (id) => ["options", "detail", String(id)],
  },

  studentAnswers: {
    pendingEssay: ["student-answers", "pending-essay"],
    byExam: (examId) => ["student-answers", "by-exam", String(examId)],
  },

  studentExams: {
    byExam: (examId) => ["student-exams", "by-exam", String(examId)],
    examStats: (examId) => ["student-exams", "stats", String(examId)],
    gradeStats: (gradeId) => ["student-exams", "grade-stats", String(gradeId)],
    groupStats: (groupId) => ["student-exams", "group-stats", String(groupId)],
  },

  assignments: {
    all: ["assignments"],
    byGrade: (gradeId) => ["assignments", "by-grade", String(gradeId)],
    byGroup: (groupId) => ["assignments", "by-group", String(groupId)],
    detail: (id) => ["assignments", "detail", String(id)],
  },

  assignmentSubmissions: {
    byAssignment: (assignmentId) => [
      "assignment-submissions",
      "by-assignment",
      String(assignmentId),
    ],
    studentSubmission: (assignmentId, studentId) => [
      "assignment-submissions",
      "student",
      String(assignmentId),
      String(studentId),
    ],
    submittedStudents: (assignmentId) => [
      "assignment-submissions",
      "submitted",
      String(assignmentId),
    ],
    notSubmittedStudents: (assignmentId) => [
      "assignment-submissions",
      "not-submitted",
      String(assignmentId),
    ],
    stats: (assignmentId) => [
      "assignment-submissions",
      "stats",
      String(assignmentId),
    ],
    gradeStats: (gradeId) => [
      "assignment-submissions",
      "grade-stats",
      String(gradeId),
    ],
    groupStats: (groupId) => [
      "assignment-submissions",
      "group-stats",
      String(groupId),
    ],
  },

  videos: {
    all: ["videos"],
    byGrade: (gradeId) => ["videos", "by-grade", String(gradeId)],
    detail: (id) => ["videos", "detail", String(id)],
  },

  playlists: {
    all: ["playlists"],
    byGrade: (gradeId) => ["playlists", "by-grade", String(gradeId)],
    detail: (id) => ["playlists", "detail", String(id)],
    videos: (id) => ["playlists", "videos", String(id)],
  },

  whatsapp: {
    all: ["whatsapp"],
    templates: ["whatsapp", "templates"],
    status: ["whatsapp", "status"],
    stats: ["whatsapp", "stats"],
    dashboard: ["whatsapp", "dashboard"],
    messages: (status, type, page) => [
      "whatsapp",
      "messages",
      String(status ?? ""),
      String(type ?? ""),
      String(page ?? 1),
    ],
    messageById: (id) => ["whatsapp", "message", String(id)],
  },
};

export default qk;
