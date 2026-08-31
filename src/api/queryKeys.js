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
    detail: (id) => ["grades", "detail", String(id)],
  },
  groups: {
    all: ["groups"],
    stats: ["groups", "stats"],
    byGrade: (gradeId) => ["groups", "by-grade", String(gradeId)],
    detail: (id) => ["groups", "detail", String(id)],
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
    detail: (id) => ["students", "detail", String(id)],
    stats: (id) => ["students", "stats", String(id)],
    attendance: (id) => ["students", "attendance", String(id)],
    payments: (id) => ["students", "payments", String(id)],
    paperExams: (id) => ["students", "paper-exams", String(id)],
    examResults: (id) => ["students", "exam-results", String(id)],
    onlineExams: (id) => ["students", "online-exams", String(id)],
  },
  attendance: {
    dashboard: ["attendance", "dashboard"],
    overview: ["attendance", "overview"],
    activeSession: (groupId) => ["attendance", "active-session", String(groupId)],
    byGroupDate: (groupId, date) => ["attendance", "group", String(groupId), date],
    byGroupMonth: (groupId, month) => [
      "attendance",
      "group-month",
      String(groupId),
      month,
    ],
    summary: (groupId, date) => ["attendance", "summary", String(groupId), date],
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
    overview: ["payments", "overview"],
    unpaid: ["payments", "unpaid"],
    statuses: ["payments", "statuses"],
  },
  exams: {
    all: ["exams"],
    byGrade: (gradeId) => ["exams", "by-grade", String(gradeId)],
    byGroup: (groupId) => ["exams", "by-group", String(groupId)],
    detail: (id) => ["exams", "detail", String(id)],
    results: (id) => ["exams", "results", String(id)],
    stats: (id) => ["exams", "stats", String(id)],
  },
  onlineExams: {
    all: ["online-exams"],
    detail: (id) => ["online-exams", "detail", String(id)],
    questions: (id) => ["online-exams", "questions", String(id)],
  },
  assignments: {
    all: ["assignments"],
    detail: (id) => ["assignments", "detail", String(id)],
    submissions: (id) => ["assignments", "submissions", String(id)],
  },
  videos: {
    all: ["videos"],
    playlists: ["playlists"],
    playlistVideos: (id) => ["playlists", "videos", String(id)],
  },
  whatsapp: {
    templates: ["whatsapp", "templates"],
  },
};

export default qk;
