import * as assistantServices from "./services";
import * as mockStore from "./mockAssistantData";
import config from "../../config";
import { previewFile, downloadFile } from "../../utils/fileHandler";

const { apiUrl } = config;
const BASE_URL = apiUrl.replace(/\/api\/?$/, "");

const isDemo = () => typeof window !== "undefined" && localStorage.getItem("is_demo") === "true";

const wrapAction = async (fn, context = "العملية") => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error?.message || `فشل ${context}` };
  }
};

const wrapPaginatedAction = async (fn, context = "العملية") => {
  try {
    const response = await fn();
    return {
      success: true,
      data: response?.data ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || `فشل ${context}`,
      data: [],
      pagination: null,
    };
  }
};

// ============================================
// PROFILE & DASHBOARD
// ============================================

export const fetchAssistantProfile = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAssistantProfile() : assistantServices.getAssistantProfile()),
    "تحميل الملف الشخصي",
  );

export const fetchAssistantDashboard = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAssistantDashboard() : assistantServices.getAssistantDashboard()),
    "تحميل لوحة التحكم",
  );

export const fetchActivityLog = (entityType = "", date = "", page = 1) =>
  wrapPaginatedAction(
    () => (isDemo() ? mockStore.mockGetActivityLog(entityType, date, page) : assistantServices.getActivityLog(entityType, date, page)),
    "تحميل سجل النشاط",
  );

export const fetchDashboardStats = () =>
  wrapAction(async () => {
    if (isDemo()) {
      const [grades, groups, studentsRes, payments] = await Promise.all([
        mockStore.mockGetAllGradesStats(),
        mockStore.mockGetGroups(),
        mockStore.mockGetStudents(1, "", "", "", 20),
        mockStore.mockGetPaymentOverall(),
      ]);
      return {
        grades,
        groups,
        students: studentsRes?.data || [],
        attendance: await mockStore.mockGetAttendanceOverall(),
        payments,
        subscriptions: await mockStore.mockGetSubscriptionOverall(),
      };
    }
    const [grades, groups, studentsRes, attendance, payments, subscriptions] =
      await Promise.all([
        assistantServices.getAllGradesStats(),
        assistantServices.getAllGroupsStats(),
        assistantServices.getStudents(1, "", "", ""),
        assistantServices.getAttendanceOverall(),
        assistantServices.getPaymentOverall(),
        assistantServices.getSubscriptionOverall(),
      ]);
    return {
      grades,
      groups,
      students: studentsRes?.data || [],
      attendance,
      payments,
      subscriptions,
    };
  }, "تحميل إحصائيات اللوحة");

export const updateAssistantProfileImageAction = (formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateAssistantProfileImage(formData) : assistantServices.updateAssistantProfileImage(formData)),
    "تحديث الصورة الشخصية",
  );

export const deleteAssistantProfileImageAction = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteAssistantProfileImage() : assistantServices.deleteAssistantProfileImage()),
    "حذف الصورة الشخصية",
  );

export const changeAssistantPassword = (
  oldPassword,
  newPassword,
  confirmPassword,
) =>
  wrapAction(
    () =>
      isDemo()
        ? mockStore.mockUpdateAssistantPassword(oldPassword, newPassword, confirmPassword)
        : assistantServices.updateAssistantPassword(
            oldPassword,
            newPassword,
            confirmPassword,
          ),
    "تغيير كلمة المرور",
  );

// ============================================
// GRADES
// ============================================

export const fetchAllGrades = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGrades() : assistantServices.getGrades()),
    "تحميل الصفوف",
  );

export const fetchGradesWithGroupsCount = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGradesWithGroupsCount() : assistantServices.getGradesWithGroupsCount()),
    "تحميل الصفوف",
  );

export const fetchGradesWithStudentsCount = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGradesWithStudentsCount() : assistantServices.getGradesWithStudentsCount()),
    "تحميل الصفوف",
  );

export const fetchAllGradesStats = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAllGradesStats() : assistantServices.getAllGradesStats()),
    "تحميل إحصائيات الصفوف",
  );

export const fetchGradeDetails = (gradeId) =>
  wrapAction(async () => {
    if (isDemo()) {
      const [grade, stats] = await Promise.all([
        mockStore.mockGetGradeById(gradeId),
        mockStore.mockGetGradeStats(gradeId),
      ]);
      return { grade, stats };
    }
    const [grade, stats] = await Promise.all([
      assistantServices.getGradeById(gradeId),
      assistantServices.getGradeStats(gradeId),
    ]);
    return { grade, stats };
  }, "تحميل تفاصيل الصف");

export const findGradeByNameAction = (gradeName) =>
  wrapAction(
    () => assistantServices.findGradeByName(gradeName),
    "البحث عن الصف",
  );

export const createNewGrade = (gradeData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateGrade(gradeData) : assistantServices.createGrade(gradeData)),
    "إنشاء الصف",
  );

export const updateGradeInfo = (gradeId, gradeData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateGrade(gradeId, gradeData) : assistantServices.updateGrade(gradeId, gradeData)),
    "تحديث الصف",
  );

export const removeGrade = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteGrade(gradeId) : assistantServices.softDeleteGrade(gradeId)),
    "حذف الصف",
  );

export const permanentlyRemoveGrade = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteGrade(gradeId) : assistantServices.hardDeleteGrade(gradeId)),
    "حذف الصف نهائياً",
  );

// ============================================
// GROUPS
// ============================================

export const fetchAllGroups = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGroups() : assistantServices.getGroups()),
    "تحميل المجموعات",
  );

export const fetchGroupDetails = (groupId) =>
  wrapAction(async () => {
    if (isDemo()) {
      const [group, stats] = await Promise.all([
        mockStore.mockGetGroupById(groupId),
        mockStore.mockGetGroupStats(groupId),
      ]);
      return { group, stats };
    }
    const [group, stats] = await Promise.all([
      assistantServices.getGroupById(groupId),
      assistantServices.getGroupStats(groupId),
    ]);
    return { group, stats };
  }, "تحميل تفاصيل المجموعة");

export const fetchGroupFullStats = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGroupStats(groupId) : assistantServices.getGroupFullStats(groupId)),
    "تحميل إحصائيات المجموعة",
  );

export const fetchGroupsByGrade = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGroupsByGrade(gradeId) : assistantServices.getGroupsByGrade(gradeId)),
    "تحميل مجموعات الصف",
  );

export const findGroupByNameAction = (groupName) =>
  wrapAction(
    () => assistantServices.findGroupByName(groupName),
    "البحث عن المجموعة",
  );

export const createNewGroup = (groupData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateGroup(groupData) : assistantServices.createGroup(groupData)),
    "إنشاء المجموعة",
  );

export const updateGroupInfo = (groupId, groupData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateGroup(groupId, groupData) : assistantServices.updateGroup(groupId, groupData)),
    "تحديث المجموعة",
  );

export const removeGroup = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteGroup(groupId) : assistantServices.softDeleteGroup(groupId)),
    "حذف المجموعة",
  );

export const permanentlyRemoveGroup = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteGroup(groupId) : assistantServices.hardDeleteGroup(groupId)),
    "حذف المجموعة نهائياً",
  );

// ============================================
// STUDENTS
// ============================================

export const fetchAllStudents = (
  page = 1,
  search = "",
  gradeId = "",
  groupId = "",
  limit = 20,
) =>
  wrapPaginatedAction(
    () =>
      isDemo()
        ? mockStore.mockGetStudents(page, search, gradeId, groupId, limit)
        : assistantServices.getStudents(page, search, gradeId, groupId, limit),
    "تحميل الطلاب",
  );

export const fetchDeletedStudents = (page = 1) =>
  wrapPaginatedAction(
    () => (isDemo() ? mockStore.mockGetDeletedStudents(page) : assistantServices.getDeletedStudents(page)),
    "تحميل الطلاب المحذوفين",
  );

export const searchStudentByBarcode = (barcode) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockSearchStudentByBarcode(barcode) : assistantServices.searchStudentByBarcode(barcode)),
    "البحث بالباركود",
  );

export const searchStudentByPhone = (phone) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockSearchStudentByPhone(phone) : assistantServices.searchStudentByPhone(phone)),
    "البحث بالهاتف",
  );

export const searchStudentsByParentPhoneAction = (parentPhone) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockSearchStudentsByParentPhone(parentPhone) : assistantServices.searchStudentsByParentPhone(parentPhone)),
    "البحث برقم ولي الأمر",
  );

export const fetchStudentDetails = (studentId) =>
  wrapAction(async () => {
    if (isDemo()) {
      const [profile, stats] = await Promise.all([
        mockStore.mockGetStudentProfile(studentId),
        mockStore.mockGetStudentStats(studentId),
      ]);
      return { profile, stats };
    }
    const [profile, stats] = await Promise.all([
      assistantServices.getStudentProfile(studentId),
      assistantServices.getStudentStats(studentId),
    ]);
    return { profile, stats };
  }, "تحميل تفاصيل الطالب");

export const fetchStudentFullDetails = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentProfile(studentId) : assistantServices.getStudentFullDetails(studentId)),
    "تحميل بيانات الطالب",
  );

export const fetchStudentProfile = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentProfile(studentId) : assistantServices.getStudentProfile(studentId)),
    "تحميل ملف الطالب",
  );

export const fetchStudentStats = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentStats(studentId) : assistantServices.getStudentStats(studentId)),
    "تحميل إحصائيات الطالب",
  );

export const fetchStudentAttendanceHistory = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentAttendanceHistory(studentId) : assistantServices.getStudentAttendanceHistory(studentId)),
    "تحميل سجل الحضور",
  );

export const fetchStudentMonthlyAttendance = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentAttendanceHistory(studentId) : assistantServices.getStudentMonthlyAttendance(studentId)),
    "تحميل حضور الشهر",
  );

export const fetchStudentTotalAttendance = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentStats(studentId) : assistantServices.getStudentTotalAttendance(studentId)),
    "تحميل إجمالي الحضور",
  );

export const fetchStudentConsecutiveAbsences = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentConsecutiveAbsences(studentId) : assistantServices.getStudentConsecutiveAbsences(studentId)),
    "تحميل الغيابات المتتالية",
  );

export const fetchStudentPayments = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentPayments(studentId) : assistantServices.getStudentPayments(studentId)),
    "تحميل مدفوعات الطالب",
  );

export const fetchStudentPaymentsBalance = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentStats(studentId) : assistantServices.getStudentPaymentsBalance(studentId)),
    "تحميل رصيد الطالب",
  );

export const fetchStudentCurrentSubscription = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentCurrentSubscription(studentId) : assistantServices.getStudentCurrentSubscription(studentId)),
    "تحميل الاشتراك الحالي",
  );

export const fetchStudentPaperExams = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentPaperExams(studentId) : assistantServices.getStudentPaperExams(studentId)),
    "تحميل الامتحانات الورقية",
  );

export const fetchStudentPaperExamById = (studentId, examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetExamById(examId) : assistantServices.getStudentPaperExamById(studentId, examId)),
    "تحميل تفاصيل الامتحان",
  );

export const fetchStudentExamResults = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentPaperExams(studentId) : assistantServices.getStudentExamResults(studentId)),
    "تحميل النتائج",
  );

export const fetchStudentOnlineExams = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentOnlineExams(studentId) : assistantServices.getStudentOnlineExams(studentId)),
    "تحميل امتحانات الأونلاين",
  );

export const fetchStudentOnlineExamById = (studentId, attemptId) =>
  wrapAction(
    () => assistantServices.getStudentOnlineExamById(studentId, attemptId),
    "تحميل تفاصيل المحاولة",
  );

export const fetchStudentAssignments = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentAssignments(studentId) : assistantServices.getStudentAssignments(studentId)),
    "تحميل الواجبات",
  );

export const fetchStudentAssignmentById = (studentId, assignmentId) =>
  wrapAction(
    () => assistantServices.getStudentAssignmentById(studentId, assignmentId),
    "تحميل تفاصيل الواجب",
  );

export const fetchStudentSubmissions = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentSubmissions(studentId) : assistantServices.getStudentSubmissions(studentId)),
    "تحميل التسليمات",
  );

export const fetchStudentSubmissionById = (studentId, submissionId) =>
  wrapAction(
    () => assistantServices.getStudentSubmissionById(studentId, submissionId),
    "تحميل تفاصيل التسليم",
  );

export const fetchStudentPlaylists = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentPlaylists(studentId) : assistantServices.getStudentPlaylists(studentId)),
    "تحميل قوائم التشغيل",
  );

export const fetchStudentsByGroup = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentsByGroup(groupId) : assistantServices.getStudentsByGroup(groupId)),
    "تحميل طلاب المجموعة",
  );

export const createNewStudent = (studentData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateStudent(studentData) : assistantServices.createStudent(studentData)),
    "إنشاء الطالب",
  );

export const updateStudentInfo = (studentId, studentData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateStudent(studentId, studentData) : assistantServices.updateStudent(studentId, studentData)),
    "تحديث الطالب",
  );

export const removeStudent = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockSoftDeleteStudent(studentId) : assistantServices.softDeleteStudent(studentId)),
    "حذف الطالب",
  );

export const permanentlyRemoveStudent = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockHardDeleteStudent(studentId) : assistantServices.hardDeleteStudent(studentId)),
    "حذف الطالب نهائياً",
  );

export const restoreStudentAction = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockRestoreStudent(studentId) : assistantServices.restoreStudent(studentId)),
    "استرجاع الطالب",
  );

// Alias للتوافق
export const restoreStudent = restoreStudentAction;

// ============================================
// ATTENDANCE - SESSIONS
// ============================================

export const startNewAttendanceSession = (sessionData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockStartAttendanceSession(sessionData) : assistantServices.startAttendanceSession(sessionData)),
    "بدء الجلسة",
  );

export const startAttendanceSession = startNewAttendanceSession;

export const fetchActiveSession = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetActiveSession(groupId) : assistantServices.getActiveSession(groupId)),
    "تحميل الجلسة النشطة",
  );

export const toggleSessionMakeupMode = (sessionId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockToggleMakeupMode(sessionId) : assistantServices.toggleMakeupMode(sessionId)),
    "تبديل الحضور التعويضي",
  );

export const toggleMakeupMode = toggleSessionMakeupMode;

export const scanStudentBarcode = (scanData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockScanBarcode(scanData) : assistantServices.scanBarcode(scanData)),
    "تسجيل الحضور",
  );

export const lockAttendanceSession = (sessionId, groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockLockSession(sessionId, groupId) : assistantServices.lockSession(sessionId, groupId)),
    "إغلاق الجلسة",
  );

export const createNewAttendance = (attendanceData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateAttendance(attendanceData) : assistantServices.createAttendance(attendanceData)),
    "تسجيل الحضور",
  );

export const fetchAttendanceById = (attendanceId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAttendanceById(attendanceId) : assistantServices.getAttendanceById(attendanceId)),
    "تحميل سجل الحضور",
  );

export const updateAttendanceInfo = (attendanceId, attendanceData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateAttendance(attendanceId, attendanceData) : assistantServices.updateAttendance(attendanceId, attendanceData)),
    "تحديث الحضور",
  );

export const removeAttendance = (attendanceId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteAttendance(attendanceId) : assistantServices.deleteAttendance(attendanceId)),
    "حذف الحضور",
  );

// ============================================
// ATTENDANCE - STATS
// ============================================

export const fetchAttendanceDashboard = (groupId = null) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAttendanceDashboard(groupId) : assistantServices.getAttendanceDashboard(groupId)),
    "تحميل لوحة الحضور",
  );

export const fetchAttendanceOverview = () =>
  wrapAction(async () => {
    if (isDemo()) {
      const [overall, consecutiveAbsences] = await Promise.all([
        mockStore.mockGetAttendanceOverall(),
        mockStore.mockGetConsecutiveAbsences(),
      ]);
      return { overall, consecutiveAbsences };
    }
    const [overall, consecutiveAbsences] = await Promise.all([
      assistantServices.getAttendanceOverall(),
      assistantServices.getConsecutiveAbsences(),
    ]);
    return { overall, consecutiveAbsences };
  }, "تحميل نظرة عامة على الحضور");

export const fetchGradeAttendance = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGradeAttendance(gradeId) : assistantServices.getGradeAttendance(gradeId)),
    "تحميل حضور الصف",
  );

export const fetchGroupAttendanceByDate = (groupId, date) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGroupAttendanceByDate(groupId, date) : assistantServices.getGroupAttendanceByDate(groupId, date)),
    "تحميل حضور اليوم",
  );

export const fetchGroupAttendanceByMonth = (groupId, month) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGroupAttendanceByMonth(groupId, month) : assistantServices.getGroupAttendanceByMonth(groupId, month)),
    "تحميل حضور الشهر",
  );

export const fetchAttendanceSummary = (groupId, date) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAttendanceSummary(groupId, date) : assistantServices.getAttendanceSummary(groupId, date)),
    "تحميل ملخص الحضور",
  );

export const fetchAbsentByDate = (date) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAbsentByDate(date) : assistantServices.getAbsentByDate(date)),
    "تحميل الغائبين اليوم",
  );

// ============================================
// PAYMENTS
// ============================================

export const fetchAllPayments = (
  page = 1,
  search = "",
  gradeId = "",
  groupId = "",
) =>
  wrapPaginatedAction(
    () =>
      isDemo()
        ? mockStore.mockGetPayments(page, search, gradeId, groupId)
        : assistantServices.getPayments(page, search, gradeId, groupId),
    "تحميل المدفوعات",
  );

export const fetchPaymentById = (paymentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetPaymentById(paymentId) : assistantServices.getPaymentById(paymentId)),
    "تحميل الدفعة",
  );

export const createNewPayment = (paymentData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreatePayment(paymentData) : assistantServices.createPayment(paymentData)),
    "تسجيل الدفعة",
  );

export const updatePaymentInfo = (paymentId, paymentData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdatePayment(paymentId, paymentData) : assistantServices.updatePayment(paymentId, paymentData)),
    "تحديث الدفعة",
  );

export const removePayment = (paymentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeletePayment(paymentId) : assistantServices.deletePayment(paymentId)),
    "حذف الدفعة",
  );

export const fetchPaymentCollections = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetPaymentCollections() : assistantServices.getPaymentCollections()),
    "تحميل التحصيلات",
  );

export const fetchUnpaidStudents = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetUnpaidStudents() : assistantServices.getUnpaidStudents()),
    "تحميل الطلاب غير المدفوعين",
  );

export const fetchPaymentOverall = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetPaymentOverall() : assistantServices.getPaymentOverall()),
    "تحميل إحصائيات المدفوعات",
  );

export const fetchStudentsPaymentStatus = (gradeId, groupId, month, search, page = 1, limit = 20) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentsPaymentStatus(gradeId, groupId, month, search, page, limit) : assistantServices.getStudentsPaymentStatus(gradeId, groupId, month, search, page, limit)),
    "تحميل حالة الطلاب",
  );

export const fetchPaymentOverview = () =>
  wrapAction(async () => {
    if (isDemo()) {
      const [collections, unpaid, overall] = await Promise.all([
        mockStore.mockGetPaymentCollections(),
        mockStore.mockGetUnpaidStudents(),
        mockStore.mockGetPaymentOverall(),
      ]);
      return { collections, unpaid, overall };
    }
    const [collections, unpaid, overall] = await Promise.all([
      assistantServices.getPaymentCollections(),
      assistantServices.getUnpaidStudents(),
      assistantServices.getPaymentOverall(),
    ]);
    return { collections, unpaid, overall };
  }, "تحميل نظرة عامة على المدفوعات");

export const fetchGradePaymentStats = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradePaymentStats(gradeId),
    "تحميل إحصائيات الصف",
  );

export const fetchGroupPaymentStats = (groupId) =>
  wrapAction(
    () => assistantServices.getGroupPaymentStats(groupId),
    "تحميل إحصائيات المجموعة",
  );

export const fetchPaymentsByGradeAndMonth = (gradeId, month) =>
  wrapAction(
    () => assistantServices.getPaymentsByGradeAndMonth(gradeId, month),
    "تحميل مدفوعات الصف",
  );

export const fetchPaymentsByGroupAndMonth = (groupId, month) =>
  wrapAction(
    () => assistantServices.getPaymentsByGroupAndMonth(groupId, month),
    "تحميل مدفوعات المجموعة",
  );

// ============================================
// SUBSCRIPTIONS
// ============================================

export const createNewSubscription = (subscriptionData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateSubscription(subscriptionData) : assistantServices.createSubscription(subscriptionData)),
    "إنشاء الاشتراك",
  );

export const fetchSubscriptionOverview = () =>
  wrapAction(async () => {
    if (isDemo()) {
      const [withoutSubscription, overall] = await Promise.all([
        mockStore.mockGetUnpaidStudents(),
        mockStore.mockGetSubscriptionOverall(),
      ]);
      return { withoutSubscription, overall };
    }
    const [withoutSubscription, overall] = await Promise.all([
      assistantServices.getStudentsWithoutSubscription(),
      assistantServices.getSubscriptionOverall(),
    ]);
    return { withoutSubscription, overall };
  }, "تحميل نظرة عامة على الاشتراكات");

export const fetchStudentSubscriptions = (studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentPayments(studentId) : assistantServices.getStudentSubscriptions(studentId)),
    "تحميل اشتراكات الطالب",
  );

export const fetchSubscriptionsByMonth = (month) =>
  wrapAction(
    () => assistantServices.getSubscriptionsByMonth(month),
    "تحميل اشتراكات الشهر",
  );

export const fetchGradeSubscriptionStats = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradeSubscriptionStats(gradeId),
    "تحميل إحصائيات اشتراكات الصف",
  );

export const fetchGroupSubscriptionStats = (groupId) =>
  wrapAction(
    () => assistantServices.getGroupSubscriptionStats(groupId),
    "تحميل إحصائيات اشتراكات المجموعة",
  );

export const updateSubscriptionStatusAction = (subscriptionId, status) =>
  wrapAction(
    () => assistantServices.updateSubscriptionStatus(subscriptionId, status),
    "تحديث حالة الاشتراك",
  );

// Alias للتوافق
export const updateSubscriptionStatus = updateSubscriptionStatusAction;

export const removeSubscription = (subscriptionId) =>
  wrapAction(
    () => assistantServices.deleteSubscription(subscriptionId),
    "حذف الاشتراك",
  );

// ============================================
// EXAMS (PAPER)
// ============================================

export const fetchAllExams = (page = 1) =>
  wrapPaginatedAction(
    () => (isDemo() ? mockStore.mockGetExams(page) : assistantServices.getExams(page)),
    "تحميل الامتحانات",
  );

export const fetchExamsByGrade = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetExamsByGrade(gradeId) : assistantServices.getExamsByGrade(gradeId)),
    "تحميل امتحانات الصف",
  );

export const fetchExamsByGroup = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetExamsByGroup(groupId) : assistantServices.getExamsByGroup(groupId)),
    "تحميل امتحانات المجموعة",
  );

export const fetchGradeExamStats = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradeExamStats(gradeId),
    "تحميل إحصائيات الصف",
  );

export const fetchExamById = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetExamById(examId) : assistantServices.getExamById(examId)),
    "تحميل الامتحان",
  );

export const fetchExamStats = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetExamStats(examId) : assistantServices.getExamStats(examId)),
    "تحميل إحصائيات الامتحان",
  );

export const createNewExam = (examData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateExam(examData) : assistantServices.createExam(examData)),
    "إنشاء الامتحان",
  );

export const updateExamInfo = (examId, examData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateExam(examId, examData) : assistantServices.updateExam(examId, examData)),
    "تحديث الامتحان",
  );

export const removeExam = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteExam(examId) : assistantServices.softDeleteExam(examId)),
    "حذف الامتحان",
  );

export const permanentlyRemoveExam = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteExam(examId) : assistantServices.hardDeleteExam(examId)),
    "حذف الامتحان نهائياً",
  );

// ============================================
// EXAM RESULTS
// ============================================

export const createExamResultAction = (resultData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpsertExamResult(resultData) : assistantServices.createExamResult(resultData)),
    "تسجيل النتيجة",
  );

export const upsertExamResultAction = (resultData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpsertExamResult(resultData) : assistantServices.upsertExamResult(resultData)),
    "حفظ النتيجة",
  );

export const upsertBatchExamResultsAction = (examId, records) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpsertBatchExamResults(examId, records) : assistantServices.upsertBatchExamResults(examId, records)),
    "حفظ النتائج",
  );

export const updateExamResultAction = (resultId, resultData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpsertExamResult(resultData) : assistantServices.updateExamResult(resultId, resultData)),
    "تحديث النتيجة",
  );

export const removeExamResult = (resultId) =>
  wrapAction(
    () => (isDemo() ? Promise.resolve({ success: true }) : assistantServices.deleteExamResult(resultId)),
    "حذف النتيجة",
  );

export const fetchExamResults = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetExamResults(examId) : assistantServices.getExamResults(examId)),
    "تحميل النتائج",
  );

export const fetchExamResultStats = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetExamResultStats(examId) : assistantServices.getExamResultStats(examId)),
    "تحميل إحصائيات النتائج",
  );

export const fetchGradeExamResultsStats = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradeExamResultsStats(gradeId),
    "تحميل إحصائيات الصف",
  );

export const fetchGroupExamResultsStats = (groupId) =>
  wrapAction(
    () => assistantServices.getGroupExamResultsStats(groupId),
    "تحميل إحصائيات المجموعة",
  );

// ============================================
// ============================================
// ONLINE EXAMS
// ============================================

export const fetchAllOnlineExams = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetOnlineExams() : assistantServices.getOnlineExams()),
    "تحميل الامتحانات الإلكترونية",
  );

export const fetchAvailableOnlineExams = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAvailableOnlineExams() : assistantServices.getAvailableOnlineExams()),
    "تحميل الامتحانات المتاحة",
  );

export const fetchExpiredOnlineExams = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetExpiredOnlineExams() : assistantServices.getExpiredOnlineExams()),
    "تحميل الامتحانات المنتهية",
  );

export const fetchOnlineExamsByGrade = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetOnlineExamsByGrade(gradeId) : assistantServices.getOnlineExamsByGrade(gradeId)),
    "تحميل امتحانات الصف",
  );

export const fetchOnlineExamsByGroup = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetOnlineExamsByGroup(groupId) : assistantServices.getOnlineExamsByGroup(groupId)),
    "تحميل امتحانات المجموعة",
  );

export const fetchGradeOnlineExamStats = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGradeOnlineExamStats(gradeId) : assistantServices.getGradeOnlineExamStats(gradeId)),
    "تحميل إحصائيات الصف",
  );

export const fetchOnlineExamStats = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetOnlineExamStats(examId) : assistantServices.getOnlineExamStats(examId)),
    "تحميل إحصائيات الامتحان",
  );

export const fetchOnlineExamById = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetOnlineExamById(examId) : assistantServices.getOnlineExamById(examId)),
    "تحميل الامتحان",
  );

export const createNewOnlineExam = (examData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateOnlineExam(examData) : assistantServices.createOnlineExam(examData)),
    "إنشاء الامتحان",
  );

export const updateOnlineExamInfo = (examId, examData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateOnlineExam(examId, examData) : assistantServices.updateOnlineExam(examId, examData)),
    "تحديث الامتحان",
  );

export const removeOnlineExam = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteOnlineExam(examId) : assistantServices.softDeleteOnlineExam(examId)),
    "حذف الامتحان",
  );

export const permanentlyRemoveOnlineExam = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteOnlineExam(examId) : assistantServices.hardDeleteOnlineExam(examId)),
    "حذف الامتحان نهائياً",
  );

// ============================================
// QUESTIONS
// ============================================

export const fetchQuestionsByExam = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetQuestionsByExam(examId) : assistantServices.getQuestionsByExam(examId)),
    "تحميل الأسئلة",
  );

export const fetchQuestionById = (questionId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetQuestionById(questionId) : assistantServices.getQuestionById(questionId)),
    "تحميل السؤال",
  );

export const createNewQuestion = (questionData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateQuestion(questionData) : assistantServices.createQuestion(questionData)),
    "إنشاء السؤال",
  );

export const createNewQuestionWithFile = (questionData, file) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateQuestionWithFile(questionData, file) : assistantServices.createQuestionWithFile(questionData, file)),
    "إنشاء السؤال",
  );

export const updateQuestionInfo = (questionId, questionData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateQuestion(questionId, questionData) : assistantServices.updateQuestion(questionId, questionData)),
    "تحديث السؤال",
  );

export const updateQuestionInfoWithFile = (questionId, questionData, file) =>
  wrapAction(
    () =>
      isDemo()
        ? mockStore.mockUpdateQuestionWithFile(questionId, questionData, file)
        : assistantServices.updateQuestionWithFile(questionId, questionData, file),
    "تحديث السؤال",
  );

export const removeQuestion = (questionId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteQuestion(questionId) : assistantServices.deleteQuestion(questionId)),
    "حذف السؤال",
  );

export const downloadQuestionFileAction = (questionId) =>
  wrapAction(
    () =>
      isDemo()
        ? Promise.resolve({ success: true, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" })
        : assistantServices.downloadQuestionFile(questionId),
    "تحميل الملف",
  );

export const previewQuestionFileAction = (questionId) =>
  previewFile(`${apiUrl}/assistant/questions/${questionId}/download`);

export const downloadQuestionFileDirect = (
  questionId,
  fileName = "question-file",
) =>
  downloadFile(
    `${apiUrl}/assistant/questions/${questionId}/download`,
    fileName,
  );

// ============================================
// OPTIONS
// ============================================

export const fetchOptionsByQuestion = (questionId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetOptionsByQuestion(questionId) : assistantServices.getOptionsByQuestion(questionId)),
    "تحميل الاختيارات",
  );

export const fetchOptionById = (optionId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetOptionById(optionId) : assistantServices.getOptionById(optionId)),
    "تحميل الاختيار",
  );

export const createNewOption = (optionData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateOption(optionData) : assistantServices.createOption(optionData)),
    "إنشاء الاختيار",
  );

export const updateOptionInfo = (optionId, optionData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateOption(optionId, optionData) : assistantServices.updateOption(optionId, optionData)),
    "تحديث الاختيار",
  );

export const removeOption = (optionId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteOption(optionId) : assistantServices.deleteOption(optionId)),
    "حذف الاختيار",
  );

// ============================================
// STUDENT ANSWERS / ESSAY GRADING
// ============================================

export const fetchPendingEssayAnswers = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetPendingEssayAnswers() : assistantServices.getPendingEssayAnswers()),
    "تحميل الإجابات المعلقة",
  );

export const fetchEssayAnswersByExam = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetEssayAnswersByExam(examId) : assistantServices.getEssayAnswersByExam(examId)),
    "تحميل الإجابات",
  );

export const gradeEssayAnswerAction = (answerId, isCorrect) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGradeEssayAnswer(answerId, isCorrect) : assistantServices.gradeEssayAnswer(answerId, isCorrect)),
    "تصحيح الإجابة",
  );

export const previewAnswerFileAction = (answerId) =>
  previewFile(`${apiUrl}/assistant/student-answers/${answerId}/preview`);

export const downloadAnswerFileDirect = (answerId, fileName = "answer-file") =>
  downloadFile(
    `${apiUrl}/assistant/student-answers/${answerId}/download`,
    fileName,
  );

// ============================================
// STUDENT EXAMS
// ============================================

export const fetchStudentExams = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentExams(examId) : assistantServices.getStudentExams(examId)),
    "تحميل محاولات الطلاب",
  );

export const fetchStudentExamStats = (examId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentExamStats(examId) : assistantServices.getStudentExamStats(examId)),
    "تحميل إحصائيات المحاولات",
  );

export const fetchGradeStudentExamStats = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGradeOnlineExamStats(gradeId) : assistantServices.getGradeStudentExamStats(gradeId)),
    "تحميل إحصائيات الصف",
  );

export const fetchGroupStudentExamStats = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGroupStudentExamStats(groupId) : assistantServices.getGroupStudentExamStats(groupId)),
    "تحميل إحصائيات المجموعة",
  );

// ============================================
// STUDENT ANSWERS STATS
// ============================================

export const fetchQuestionAnswerStats = (questionId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetQuestionAnswerStats(questionId) : assistantServices.getQuestionAnswerStats(questionId)),
    "تحميل إحصائيات السؤال",
  );

export const fetchQuestionMostSelectedOptions = (questionId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetQuestionMostSelectedOptions(questionId) : assistantServices.getQuestionMostSelectedOptions(questionId)),
    "تحميل الاختيارات الأكثر اختياراً",
  );

// ============================================
// ASSIGNMENTS
// ============================================

export const fetchAllAssignments = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAssignments() : assistantServices.getAssignments()),
    "تحميل الواجبات",
  );

export const fetchAssignmentsByGrade = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAssignmentsByGrade(gradeId) : assistantServices.getAssignmentsByGrade(gradeId)),
    "تحميل واجبات الصف",
  );

export const fetchAssignmentsByGroup = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAssignmentsByGroup(groupId) : assistantServices.getAssignmentsByGroup(groupId)),
    "تحميل واجبات المجموعة",
  );

export const downloadAssignmentAction = (assignmentId) =>
  wrapAction(
    () =>
      isDemo()
        ? Promise.resolve({ success: true, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" })
        : assistantServices.downloadAssignment(assignmentId),
    "تحميل الواجب",
  );

export const fetchAssignmentById = (assignmentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetAssignmentById(assignmentId) : assistantServices.getAssignmentById(assignmentId)),
    "تحميل الواجب",
  );

export const createNewAssignment = (formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateAssignment(formData) : assistantServices.createAssignment(formData)),
    "إنشاء الواجب",
  );

export const updateAssignmentInfo = (assignmentId, formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateAssignment(assignmentId, formData) : assistantServices.updateAssignment(assignmentId, formData)),
    "تحديث الواجب",
  );

export const removeAssignment = (assignmentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteAssignment(assignmentId) : assistantServices.softDeleteAssignment(assignmentId)),
    "حذف الواجب",
  );

export const permanentlyRemoveAssignment = (assignmentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteAssignment(assignmentId) : assistantServices.hardDeleteAssignment(assignmentId)),
    "حذف الواجب نهائياً",
  );

// ============================================
// ASSIGNMENT SUBMISSIONS
// ============================================

export const fetchGradeSubmissionStats = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGradeSubmissionStats(gradeId) : assistantServices.getGradeSubmissionStats(gradeId)),
    "تحميل إحصائيات الصف",
  );

export const fetchGroupSubmissionStats = (groupId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetGroupSubmissionStats(groupId) : assistantServices.getGroupSubmissionStats(groupId)),
    "تحميل إحصائيات المجموعة",
  );

export const fetchSubmissions = (assignmentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetSubmissions(assignmentId) : assistantServices.getSubmissions(assignmentId)),
    "تحميل التسليمات",
  );

export const fetchStudentSubmission = (assignmentId, studentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetStudentSubmission(assignmentId, studentId) : assistantServices.getStudentSubmission(assignmentId, studentId)),
    "تحميل التسليم",
  );

export const fetchSubmittedStudents = (assignmentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetSubmittedStudents(assignmentId) : assistantServices.getSubmittedStudents(assignmentId)),
    "تحميل الطلاب المسلّمين",
  );

export const fetchNotSubmittedStudents = (assignmentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetNotSubmittedStudents(assignmentId) : assistantServices.getNotSubmittedStudents(assignmentId)),
    "تحميل الطلاب غير المسلّمين",
  );

export const fetchSubmissionStats = (assignmentId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetSubmissionStats(assignmentId) : assistantServices.getSubmissionStats(assignmentId)),
    "تحميل إحصائيات التسليمات",
  );

export const gradeStudentSubmission = (submissionId, score, feedback) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGradeStudentSubmission(submissionId, score, feedback) : assistantServices.gradeSubmission(submissionId, score, feedback)),
    "تصحيح التسليم",
  );

// ============================================
// VIDEOS
// ============================================

export const fetchAllVideos = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetVideos() : assistantServices.getVideos()),
    "تحميل الفيديوهات",
  );

export const fetchVideosByGrade = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetVideosByGrade(gradeId) : assistantServices.getVideosByGrade(gradeId)),
    "تحميل فيديوهات الصف",
  );

export const downloadVideoFileAction = (videoId) =>
  wrapAction(
    () =>
      isDemo()
        ? Promise.resolve({ success: true, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" })
        : assistantServices.downloadVideoFile(videoId),
    "تحميل الفيديو",
  );

export const fetchVideoById = (videoId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetVideoById(videoId) : assistantServices.getVideoById(videoId)),
    "تحميل الفيديو",
  );

export const previewVideoFileAction = (videoId) =>
  previewFile(`${apiUrl}/assistant/videos/${videoId}/preview`);

export const createNewVideo = (formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreateVideo(formData) : assistantServices.createVideo(formData)),
    "إنشاء الفيديو",
  );

export const updateVideoInfo = (videoId, formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdateVideo(videoId, formData) : assistantServices.updateVideo(videoId, formData)),
    "تحديث الفيديو",
  );

export const removeVideo = (videoId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeleteVideo(videoId) : assistantServices.deleteVideo(videoId)),
    "حذف الفيديو",
  );

// ============================================
// PLAYLISTS
// ============================================

export const fetchAllPlaylists = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetPlaylists() : assistantServices.getPlaylists()),
    "تحميل قوائم التشغيل",
  );

export const fetchPlaylistsByGrade = (gradeId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetPlaylistsByGrade(gradeId) : assistantServices.getPlaylistsByGrade(gradeId)),
    "تحميل قوائم الصف",
  );

export const fetchPlaylistById = (playlistId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetPlaylistById(playlistId) : assistantServices.getPlaylistById(playlistId)),
    "تحميل قائمة التشغيل",
  );

export const createNewPlaylist = (formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockCreatePlaylist(formData) : assistantServices.createPlaylist(formData)),
    "إنشاء قائمة التشغيل",
  );

export const updatePlaylistInfo = (playlistId, formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockUpdatePlaylist(playlistId, formData) : assistantServices.updatePlaylist(playlistId, formData)),
    "تحديث قائمة التشغيل",
  );

export const removePlaylist = (playlistId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDeletePlaylist(playlistId) : assistantServices.deletePlaylist(playlistId)),
    "حذف قائمة التشغيل",
  );

export const fetchPlaylistVideos = (playlistId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockGetPlaylistVideos(playlistId) : assistantServices.getPlaylistVideos(playlistId)),
    "تحميل فيديوهات القائمة",
  );

export const addVideoToPlaylistAction = (playlistId, videoId) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockAddVideoToPlaylist(playlistId, videoId) : assistantServices.addVideoToPlaylist(playlistId, videoId)),
    "إضافة الفيديو للقائمة",
  );

export const removeVideoFromPlaylistAction = (id) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockRemoveVideoFromPlaylist(id) : assistantServices.removeVideoFromPlaylist(id)),
    "حذف الفيديو من القائمة",
  );

// ============================================
// WHATSAPP - TEMPLATES
// ============================================

export const fetchWhatsappTemplates = () =>
  wrapAction(() => assistantServices.getWhatsappTemplates(), "تحميل القوالب");

export const toggleWhatsappTemplateAction = (templateId) =>
  wrapAction(
    () => assistantServices.toggleWhatsappTemplate(templateId),
    "تبديل حالة القالب",
  );

export const updateWhatsappTemplateAction = (templateId, templateData) =>
  wrapAction(
    () => assistantServices.updateWhatsappTemplate(templateId, templateData),
    "تحديث القالب",
  );

// ============================================
// WHATSAPP - MESSAGES / QUEUE
// ============================================

export const sendWelcomeWhatsappAction = (studentId, instant = false) =>
  wrapAction(
    () => assistantServices.sendWelcomeWhatsapp(studentId, instant),
    "إرسال رسالة الترحيب",
  );

export const sendAbsenceWhatsappAction = (studentId, date, instant = false) =>
  wrapAction(
    () => assistantServices.sendAbsenceWhatsapp(studentId, date, instant),
    "إرسال رسالة الغياب",
  );

export const sendPaymentWhatsappAction = (paymentId, instant = false) =>
  wrapAction(
    () => assistantServices.sendPaymentWhatsapp(paymentId, instant),
    "إرسال رسالة الدفع",
  );

export const sendExamWhatsappAction = (resultId, instant = false) =>
  wrapAction(
    () => assistantServices.sendExamWhatsapp(resultId, instant),
    "إرسال رسالة النتيجة",
  );

export const sendWhatsappQueueAction = (options) =>
  wrapAction(
    () => assistantServices.sendWhatsappQueue(options),
    "إرسال الطابور",
  );

export const fetchWhatsappStats = () =>
  wrapAction(
    () => assistantServices.getWhatsappStats(),
    "تحميل إحصائيات الطابور",
  );

export const resetFailedWhatsappAction = () =>
  wrapAction(
    () => assistantServices.resetFailedWhatsappMessages(),
    "إعادة تعيين الرسائل الفاشلة",
  );

export const fetchWhatsappMessages = (options = {}) =>
  wrapPaginatedAction(
    () => assistantServices.getWhatsappMessages(options),
    "تحميل الرسائل",
  );

export const fetchWhatsappMessageById = (messageId) =>
  wrapAction(
    () => assistantServices.getWhatsappMessageById(messageId),
    "تحميل الرسالة",
  );

export const deleteWhatsappMessageAction = (messageId) =>
  wrapAction(
    () => assistantServices.deleteWhatsappMessage(messageId),
    "حذف الرسالة",
  );

export const fetchWhatsappDashboard = () =>
  wrapAction(
    () => assistantServices.getWhatsappDashboard(),
    "تحميل لوحة الواتساب",
  );

export const updateWhatsappSettingsAction = (settingsData) =>
  wrapAction(
    () => assistantServices.updateWhatsappSettings(settingsData),
    "تحديث الإعدادات",
  );

// ============================================
// BULK UPLOAD
// ============================================

export const downloadStudentsTemplateAction = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDownloadStudentsTemplate() : assistantServices.downloadStudentsTemplate()),
    "تحميل القالب",
  );

export const downloadGradesTemplateAction = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDownloadGradesTemplate() : assistantServices.downloadGradesTemplate()),
    "تحميل القالب",
  );

export const downloadGroupsTemplateAction = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDownloadGroupsTemplate() : assistantServices.downloadGroupsTemplate()),
    "تحميل القالب",
  );

export const downloadExamResultsTemplateAction = () =>
  wrapAction(
    () => (isDemo() ? mockStore.mockDownloadExamResultsTemplate() : assistantServices.downloadExamResultsTemplate()),
    "تحميل القالب",
  );

export const bulkUploadStudentsAction = (formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockBulkUploadStudents(formData) : assistantServices.bulkUploadStudents(formData)),
    "رفع الطلاب",
  );

export const bulkUploadGradesAction = (formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockBulkUploadGrades(formData) : assistantServices.bulkUploadGrades(formData)),
    "رفع الصفوف",
  );

export const bulkUploadGroupsAction = (formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockBulkUploadGroups(formData) : assistantServices.bulkUploadGroups(formData)),
    "رفع المجموعات",
  );

export const bulkUploadExamResultsAction = (examId, formData) =>
  wrapAction(
    () => (isDemo() ? mockStore.mockBulkUploadExamResults(examId, formData) : assistantServices.bulkUploadExamResults(examId, formData)),
    "رفع النتائج",
  );

// ============================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================

export { BASE_URL };
