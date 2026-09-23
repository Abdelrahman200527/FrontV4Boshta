import * as assistantServices from "./services";
import config from "../../config";
import { previewFile, downloadFile } from "../../utils/fileHandler";

const { apiUrl } = config;
const BASE_URL = apiUrl.replace(/\/api\/?$/, "");

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
    () => assistantServices.getAssistantProfile(),
    "تحميل الملف الشخصي",
  );

export const fetchAssistantDashboard = () =>
  wrapAction(
    () => assistantServices.getAssistantDashboard(),
    "تحميل لوحة التحكم",
  );

export const fetchActivityLog = (entityType = "", date = "", page = 1) =>
  wrapPaginatedAction(
    () => assistantServices.getActivityLog(entityType, date, page),
    "تحميل سجل النشاط",
  );

export const fetchDashboardStats = () =>
  wrapAction(async () => {
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
    () => assistantServices.updateAssistantProfileImage(formData),
    "تحديث الصورة الشخصية",
  );

export const deleteAssistantProfileImageAction = () =>
  wrapAction(
    () => assistantServices.deleteAssistantProfileImage(),
    "حذف الصورة الشخصية",
  );

export const changeAssistantPassword = (
  oldPassword,
  newPassword,
  confirmPassword,
) =>
  wrapAction(
    () =>
      assistantServices.updateAssistantPassword(
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
  wrapAction(() => assistantServices.getGrades(), "تحميل الصفوف");

export const fetchGradesWithGroupsCount = () =>
  wrapAction(
    () => assistantServices.getGradesWithGroupsCount(),
    "تحميل الصفوف",
  );

export const fetchGradesWithStudentsCount = () =>
  wrapAction(
    () => assistantServices.getGradesWithStudentsCount(),
    "تحميل الصفوف",
  );

export const fetchAllGradesStats = () =>
  wrapAction(
    () => assistantServices.getAllGradesStats(),
    "تحميل إحصائيات الصفوف",
  );

export const fetchGradeDetails = (gradeId) =>
  wrapAction(async () => {
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
  wrapAction(() => assistantServices.createGrade(gradeData), "إنشاء الصف");

export const updateGradeInfo = (gradeId, gradeData) =>
  wrapAction(
    () => assistantServices.updateGrade(gradeId, gradeData),
    "تحديث الصف",
  );

export const removeGrade = (gradeId) =>
  wrapAction(() => assistantServices.softDeleteGrade(gradeId), "حذف الصف");

export const permanentlyRemoveGrade = (gradeId) =>
  wrapAction(
    () => assistantServices.hardDeleteGrade(gradeId),
    "حذف الصف نهائياً",
  );

// ============================================
// GROUPS
// ============================================

export const fetchAllGroups = () =>
  wrapAction(() => assistantServices.getGroups(), "تحميل المجموعات");

export const fetchGroupDetails = (groupId) =>
  wrapAction(async () => {
    const [group, stats] = await Promise.all([
      assistantServices.getGroupById(groupId),
      assistantServices.getGroupStats(groupId),
    ]);
    return { group, stats };
  }, "تحميل تفاصيل المجموعة");

export const fetchGroupFullStats = (groupId) =>
  wrapAction(
    () => assistantServices.getGroupFullStats(groupId),
    "تحميل إحصائيات المجموعة",
  );

export const fetchGroupsByGrade = (gradeId) =>
  wrapAction(
    () => assistantServices.getGroupsByGrade(gradeId),
    "تحميل مجموعات الصف",
  );

export const findGroupByNameAction = (groupName) =>
  wrapAction(
    () => assistantServices.findGroupByName(groupName),
    "البحث عن المجموعة",
  );

export const createNewGroup = (groupData) =>
  wrapAction(() => assistantServices.createGroup(groupData), "إنشاء المجموعة");

export const updateGroupInfo = (groupId, groupData) =>
  wrapAction(
    () => assistantServices.updateGroup(groupId, groupData),
    "تحديث المجموعة",
  );

export const removeGroup = (groupId) =>
  wrapAction(() => assistantServices.softDeleteGroup(groupId), "حذف المجموعة");

export const permanentlyRemoveGroup = (groupId) =>
  wrapAction(
    () => assistantServices.hardDeleteGroup(groupId),
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
) =>
  wrapPaginatedAction(
    () => assistantServices.getStudents(page, search, gradeId, groupId),
    "تحميل الطلاب",
  );

export const fetchDeletedStudents = (page = 1) =>
  wrapPaginatedAction(
    () => assistantServices.getDeletedStudents(page),
    "تحميل الطلاب المحذوفين",
  );

export const searchStudentByBarcode = (barcode) =>
  wrapAction(
    () => assistantServices.searchStudentByBarcode(barcode),
    "البحث بالباركود",
  );

export const searchStudentByPhone = (phone) =>
  wrapAction(
    () => assistantServices.searchStudentByPhone(phone),
    "البحث بالهاتف",
  );

export const searchStudentsByParentPhoneAction = (parentPhone) =>
  wrapAction(
    () => assistantServices.searchStudentsByParentPhone(parentPhone),
    "البحث برقم ولي الأمر",
  );

export const fetchStudentDetails = (studentId) =>
  wrapAction(async () => {
    const [profile, stats] = await Promise.all([
      assistantServices.getStudentProfile(studentId),
      assistantServices.getStudentStats(studentId),
    ]);
    return { profile, stats };
  }, "تحميل تفاصيل الطالب");

export const fetchStudentFullDetails = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentFullDetails(studentId),
    "تحميل بيانات الطالب",
  );

export const fetchStudentProfile = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentProfile(studentId),
    "تحميل ملف الطالب",
  );

export const fetchStudentStats = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentStats(studentId),
    "تحميل إحصائيات الطالب",
  );

export const fetchStudentAttendanceHistory = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentAttendanceHistory(studentId),
    "تحميل سجل الحضور",
  );

export const fetchStudentMonthlyAttendance = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentMonthlyAttendance(studentId),
    "تحميل حضور الشهر",
  );

export const fetchStudentTotalAttendance = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentTotalAttendance(studentId),
    "تحميل إجمالي الحضور",
  );

export const fetchStudentConsecutiveAbsences = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentConsecutiveAbsences(studentId),
    "تحميل الغيابات المتتالية",
  );

export const fetchStudentPayments = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentPayments(studentId),
    "تحميل مدفوعات الطالب",
  );

export const fetchStudentPaymentsBalance = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentPaymentsBalance(studentId),
    "تحميل رصيد الطالب",
  );

export const fetchStudentCurrentSubscription = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentCurrentSubscription(studentId),
    "تحميل الاشتراك الحالي",
  );

export const fetchStudentPaperExams = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentPaperExams(studentId),
    "تحميل الامتحانات الورقية",
  );

export const fetchStudentPaperExamById = (studentId, examId) =>
  wrapAction(
    () => assistantServices.getStudentPaperExamById(studentId, examId),
    "تحميل تفاصيل الامتحان",
  );

export const fetchStudentExamResults = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentExamResults(studentId),
    "تحميل النتائج",
  );

export const fetchStudentOnlineExams = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentOnlineExams(studentId),
    "تحميل امتحانات الأونلاين",
  );

export const fetchStudentOnlineExamById = (studentId, attemptId) =>
  wrapAction(
    () => assistantServices.getStudentOnlineExamById(studentId, attemptId),
    "تحميل تفاصيل المحاولة",
  );

export const fetchStudentAssignments = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentAssignments(studentId),
    "تحميل الواجبات",
  );

export const fetchStudentAssignmentById = (studentId, assignmentId) =>
  wrapAction(
    () => assistantServices.getStudentAssignmentById(studentId, assignmentId),
    "تحميل تفاصيل الواجب",
  );

export const fetchStudentSubmissions = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentSubmissions(studentId),
    "تحميل التسليمات",
  );

export const fetchStudentSubmissionById = (studentId, submissionId) =>
  wrapAction(
    () => assistantServices.getStudentSubmissionById(studentId, submissionId),
    "تحميل تفاصيل التسليم",
  );

export const fetchStudentPlaylists = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentPlaylists(studentId),
    "تحميل قوائم التشغيل",
  );

export const fetchStudentsByGroup = (groupId) =>
  wrapAction(
    () => assistantServices.getStudentsByGroup(groupId),
    "تحميل طلاب المجموعة",
  );

export const createNewStudent = (studentData) =>
  wrapAction(
    () => assistantServices.createStudent(studentData),
    "إنشاء الطالب",
  );

export const updateStudentInfo = (studentId, studentData) =>
  wrapAction(
    () => assistantServices.updateStudent(studentId, studentData),
    "تحديث الطالب",
  );

export const removeStudent = (studentId) =>
  wrapAction(
    () => assistantServices.softDeleteStudent(studentId),
    "حذف الطالب",
  );

export const permanentlyRemoveStudent = (studentId) =>
  wrapAction(
    () => assistantServices.hardDeleteStudent(studentId),
    "حذف الطالب نهائياً",
  );

export const restoreStudentAction = (studentId) =>
  wrapAction(
    () => assistantServices.restoreStudent(studentId),
    "استرجاع الطالب",
  );

// Alias للتوافق
export const restoreStudent = restoreStudentAction;

// ============================================
// ATTENDANCE - SESSIONS
// ============================================

export const startNewAttendanceSession = (sessionData) =>
  wrapAction(
    () => assistantServices.startAttendanceSession(sessionData),
    "بدء الجلسة",
  );

export const startAttendanceSession = startNewAttendanceSession;

export const fetchActiveSession = (groupId) =>
  wrapAction(
    () => assistantServices.getActiveSession(groupId),
    "تحميل الجلسة النشطة",
  );

export const toggleSessionMakeupMode = (sessionId) =>
  wrapAction(
    () => assistantServices.toggleMakeupMode(sessionId),
    "تبديل الحضور التعويضي",
  );

export const toggleMakeupMode = toggleSessionMakeupMode;

export const scanStudentBarcode = (scanData) =>
  wrapAction(() => assistantServices.scanBarcode(scanData), "تسجيل الحضور");

export const lockAttendanceSession = (sessionId, groupId) =>
  wrapAction(
    () => assistantServices.lockSession(sessionId, groupId),
    "إغلاق الجلسة",
  );

export const createNewAttendance = (attendanceData) =>
  wrapAction(
    () => assistantServices.createAttendance(attendanceData),
    "تسجيل الحضور",
  );

export const markRestAsAbsent = (groupId, date) =>
  wrapAction(
    () => assistantServices.markRestAbsent(groupId, date),
    "تسجيل الغياب الجماعي",
  );

export const fetchAttendanceById = (attendanceId) =>
  wrapAction(
    () => assistantServices.getAttendanceById(attendanceId),
    "تحميل سجل الحضور",
  );

export const updateAttendanceInfo = (attendanceId, attendanceData) =>
  wrapAction(
    () => assistantServices.updateAttendance(attendanceId, attendanceData),
    "تحديث الحضور",
  );

export const removeAttendance = (attendanceId) =>
  wrapAction(
    () => assistantServices.deleteAttendance(attendanceId),
    "حذف الحضور",
  );

// ============================================
// ATTENDANCE - STATS
// ============================================

export const fetchAttendanceDashboard = () =>
  wrapAction(
    () => assistantServices.getAttendanceDashboard(),
    "تحميل لوحة الحضور",
  );

export const fetchAttendanceOverview = () =>
  wrapAction(async () => {
    const [overall, consecutiveAbsences] = await Promise.all([
      assistantServices.getAttendanceOverall(),
      assistantServices.getConsecutiveAbsences(),
    ]);
    return { overall, consecutiveAbsences };
  }, "تحميل نظرة عامة على الحضور");

export const fetchGradeAttendance = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradeAttendance(gradeId),
    "تحميل حضور الصف",
  );

export const fetchGroupAttendanceByDate = (groupId, date) =>
  wrapAction(
    () => assistantServices.getGroupAttendanceByDate(groupId, date),
    "تحميل حضور اليوم",
  );

export const fetchGroupAttendanceByMonth = (groupId, month) =>
  wrapAction(
    () => assistantServices.getGroupAttendanceByMonth(groupId, month),
    "تحميل حضور الشهر",
  );

export const fetchAttendanceSummary = (groupId, date) =>
  wrapAction(
    () => assistantServices.getAttendanceSummary(groupId, date),
    "تحميل ملخص الحضور",
  );

export const fetchAbsentByDate = (date) =>
  wrapAction(
    () => assistantServices.getAbsentByDate(date),
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
    () => assistantServices.getPayments(page, search, gradeId, groupId),
    "تحميل المدفوعات",
  );

export const fetchPaymentById = (paymentId) =>
  wrapAction(() => assistantServices.getPaymentById(paymentId), "تحميل الدفعة");

export const createNewPayment = (paymentData) =>
  wrapAction(
    () => assistantServices.createPayment(paymentData),
    "تسجيل الدفعة",
  );

export const updatePaymentInfo = (paymentId, paymentData) =>
  wrapAction(
    () => assistantServices.updatePayment(paymentId, paymentData),
    "تحديث الدفعة",
  );

export const removePayment = (paymentId) =>
  wrapAction(() => assistantServices.deletePayment(paymentId), "حذف الدفعة");

export const fetchPaymentCollections = () =>
  wrapAction(
    () => assistantServices.getPaymentCollections(),
    "تحميل التحصيلات",
  );

export const fetchUnpaidStudents = () =>
  wrapAction(
    () => assistantServices.getUnpaidStudents(),
    "تحميل الطلاب غير المدفوعين",
  );

export const fetchPaymentOverall = () =>
  wrapAction(
    () => assistantServices.getPaymentOverall(),
    "تحميل إحصائيات المدفوعات",
  );

export const fetchStudentsPaymentStatus = () =>
  wrapAction(
    () => assistantServices.getStudentsPaymentStatus(),
    "تحميل حالة الطلاب",
  );

export const fetchPaymentOverview = () =>
  wrapAction(async () => {
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
    () => assistantServices.createSubscription(subscriptionData),
    "إنشاء الاشتراك",
  );

export const fetchSubscriptionOverview = () =>
  wrapAction(async () => {
    const [withoutSubscription, overall] = await Promise.all([
      assistantServices.getStudentsWithoutSubscription(),
      assistantServices.getSubscriptionOverall(),
    ]);
    return { withoutSubscription, overall };
  }, "تحميل نظرة عامة على الاشتراكات");

export const fetchStudentSubscriptions = (studentId) =>
  wrapAction(
    () => assistantServices.getStudentSubscriptions(studentId),
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
    () => assistantServices.getExams(page),
    "تحميل الامتحانات",
  );

export const fetchExamsByGrade = (gradeId) =>
  wrapAction(
    () => assistantServices.getExamsByGrade(gradeId),
    "تحميل امتحانات الصف",
  );

export const fetchExamsByGroup = (groupId) =>
  wrapAction(
    () => assistantServices.getExamsByGroup(groupId),
    "تحميل امتحانات المجموعة",
  );

export const fetchGradeExamStats = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradeExamStats(gradeId),
    "تحميل إحصائيات الصف",
  );

export const fetchExamById = (examId) =>
  wrapAction(() => assistantServices.getExamById(examId), "تحميل الامتحان");

export const fetchExamStats = (examId) =>
  wrapAction(
    () => assistantServices.getExamStats(examId),
    "تحميل إحصائيات الامتحان",
  );

export const createNewExam = (examData) =>
  wrapAction(() => assistantServices.createExam(examData), "إنشاء الامتحان");

export const updateExamInfo = (examId, examData) =>
  wrapAction(
    () => assistantServices.updateExam(examId, examData),
    "تحديث الامتحان",
  );

export const removeExam = (examId) =>
  wrapAction(() => assistantServices.softDeleteExam(examId), "حذف الامتحان");

export const permanentlyRemoveExam = (examId) =>
  wrapAction(
    () => assistantServices.hardDeleteExam(examId),
    "حذف الامتحان نهائياً",
  );

// ============================================
// EXAM RESULTS
// ============================================

export const createExamResultAction = (resultData) =>
  wrapAction(
    () => assistantServices.createExamResult(resultData),
    "تسجيل النتيجة",
  );

export const upsertExamResultAction = (resultData) =>
  wrapAction(
    () => assistantServices.upsertExamResult(resultData),
    "حفظ النتيجة",
  );

export const upsertBatchExamResultsAction = (examId, records) =>
  wrapAction(
    () => assistantServices.upsertBatchExamResults(examId, records),
    "حفظ النتائج",
  );

export const updateExamResultAction = (resultId, resultData) =>
  wrapAction(
    () => assistantServices.updateExamResult(resultId, resultData),
    "تحديث النتيجة",
  );

export const removeExamResult = (resultId) =>
  wrapAction(() => assistantServices.deleteExamResult(resultId), "حذف النتيجة");

export const fetchExamResults = (examId) =>
  wrapAction(() => assistantServices.getExamResults(examId), "تحميل النتائج");

export const fetchExamResultStats = (examId) =>
  wrapAction(
    () => assistantServices.getExamResultStats(examId),
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
// ONLINE EXAMS
// ============================================

export const fetchAllOnlineExams = () =>
  wrapAction(
    () => assistantServices.getOnlineExams(),
    "تحميل الامتحانات الإلكترونية",
  );

export const fetchAvailableOnlineExams = () =>
  wrapAction(
    () => assistantServices.getAvailableOnlineExams(),
    "تحميل الامتحانات المتاحة",
  );

export const fetchExpiredOnlineExams = () =>
  wrapAction(
    () => assistantServices.getExpiredOnlineExams(),
    "تحميل الامتحانات المنتهية",
  );

export const fetchOnlineExamsByGrade = (gradeId) =>
  wrapAction(
    () => assistantServices.getOnlineExamsByGrade(gradeId),
    "تحميل امتحانات الصف",
  );

export const fetchOnlineExamsByGroup = (groupId) =>
  wrapAction(
    () => assistantServices.getOnlineExamsByGroup(groupId),
    "تحميل امتحانات المجموعة",
  );

export const fetchGradeOnlineExamStats = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradeOnlineExamStats(gradeId),
    "تحميل إحصائيات الصف",
  );

export const fetchOnlineExamStats = (examId) =>
  wrapAction(
    () => assistantServices.getOnlineExamStats(examId),
    "تحميل إحصائيات الامتحان",
  );

export const fetchOnlineExamById = (examId) =>
  wrapAction(
    () => assistantServices.getOnlineExamById(examId),
    "تحميل الامتحان",
  );

export const createNewOnlineExam = (examData) =>
  wrapAction(
    () => assistantServices.createOnlineExam(examData),
    "إنشاء الامتحان",
  );

export const updateOnlineExamInfo = (examId, examData) =>
  wrapAction(
    () => assistantServices.updateOnlineExam(examId, examData),
    "تحديث الامتحان",
  );

export const removeOnlineExam = (examId) =>
  wrapAction(
    () => assistantServices.softDeleteOnlineExam(examId),
    "حذف الامتحان",
  );

export const permanentlyRemoveOnlineExam = (examId) =>
  wrapAction(
    () => assistantServices.hardDeleteOnlineExam(examId),
    "حذف الامتحان نهائياً",
  );

// ============================================
// QUESTIONS
// ============================================

export const fetchQuestionsByExam = (examId) =>
  wrapAction(
    () => assistantServices.getQuestionsByExam(examId),
    "تحميل الأسئلة",
  );

export const fetchQuestionById = (questionId) =>
  wrapAction(
    () => assistantServices.getQuestionById(questionId),
    "تحميل السؤال",
  );

export const createNewQuestion = (questionData) =>
  wrapAction(
    () => assistantServices.createQuestion(questionData),
    "إنشاء السؤال",
  );

export const createNewQuestionWithFile = (questionData, file) =>
  wrapAction(
    () => assistantServices.createQuestionWithFile(questionData, file),
    "إنشاء السؤال",
  );

export const updateQuestionInfo = (questionId, questionData) =>
  wrapAction(
    () => assistantServices.updateQuestion(questionId, questionData),
    "تحديث السؤال",
  );

export const updateQuestionInfoWithFile = (questionId, questionData, file) =>
  wrapAction(
    () =>
      assistantServices.updateQuestionWithFile(questionId, questionData, file),
    "تحديث السؤال",
  );

export const removeQuestion = (questionId) =>
  wrapAction(() => assistantServices.deleteQuestion(questionId), "حذف السؤال");

export const downloadQuestionFileAction = (questionId) =>
  wrapAction(
    () => assistantServices.downloadQuestionFile(questionId),
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
    () => assistantServices.getOptionsByQuestion(questionId),
    "تحميل الاختيارات",
  );

export const fetchOptionById = (optionId) =>
  wrapAction(() => assistantServices.getOptionById(optionId), "تحميل الاختيار");

export const createNewOption = (optionData) =>
  wrapAction(
    () => assistantServices.createOption(optionData),
    "إنشاء الاختيار",
  );

export const updateOptionInfo = (optionId, optionData) =>
  wrapAction(
    () => assistantServices.updateOption(optionId, optionData),
    "تحديث الاختيار",
  );

export const removeOption = (optionId) =>
  wrapAction(() => assistantServices.deleteOption(optionId), "حذف الاختيار");

// ============================================
// STUDENT ANSWERS / ESSAY GRADING
// ============================================

export const fetchPendingEssayAnswers = () =>
  wrapAction(
    () => assistantServices.getPendingEssayAnswers(),
    "تحميل الإجابات المعلقة",
  );

export const fetchEssayAnswersByExam = (examId) =>
  wrapAction(
    () => assistantServices.getEssayAnswersByExam(examId),
    "تحميل الإجابات",
  );

export const gradeEssayAnswerAction = (answerId, isCorrect) =>
  wrapAction(
    () => assistantServices.gradeEssayAnswer(answerId, isCorrect),
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
    () => assistantServices.getStudentExams(examId),
    "تحميل محاولات الطلاب",
  );

export const fetchStudentExamStats = (examId) =>
  wrapAction(
    () => assistantServices.getStudentExamStats(examId),
    "تحميل إحصائيات المحاولات",
  );

export const fetchGradeStudentExamStats = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradeStudentExamStats(gradeId),
    "تحميل إحصائيات الصف",
  );

export const fetchGroupStudentExamStats = (groupId) =>
  wrapAction(
    () => assistantServices.getGroupStudentExamStats(groupId),
    "تحميل إحصائيات المجموعة",
  );

// ============================================
// STUDENT ANSWERS STATS
// ============================================

export const fetchQuestionAnswerStats = (questionId) =>
  wrapAction(
    () => assistantServices.getQuestionAnswerStats(questionId),
    "تحميل إحصائيات السؤال",
  );

export const fetchQuestionMostSelectedOptions = (questionId) =>
  wrapAction(
    () => assistantServices.getQuestionMostSelectedOptions(questionId),
    "تحميل الاختيارات الأكثر اختياراً",
  );

// ============================================
// ASSIGNMENTS
// ============================================

export const fetchAllAssignments = () =>
  wrapAction(() => assistantServices.getAssignments(), "تحميل الواجبات");

export const fetchAssignmentsByGrade = (gradeId) =>
  wrapAction(
    () => assistantServices.getAssignmentsByGrade(gradeId),
    "تحميل واجبات الصف",
  );

export const fetchAssignmentsByGroup = (groupId) =>
  wrapAction(
    () => assistantServices.getAssignmentsByGroup(groupId),
    "تحميل واجبات المجموعة",
  );

export const downloadAssignmentAction = (assignmentId) =>
  wrapAction(
    () => assistantServices.downloadAssignment(assignmentId),
    "تحميل الواجب",
  );

export const fetchAssignmentById = (assignmentId) =>
  wrapAction(
    () => assistantServices.getAssignmentById(assignmentId),
    "تحميل الواجب",
  );

export const createNewAssignment = (formData) =>
  wrapAction(
    () => assistantServices.createAssignment(formData),
    "إنشاء الواجب",
  );

export const updateAssignmentInfo = (assignmentId, formData) =>
  wrapAction(
    () => assistantServices.updateAssignment(assignmentId, formData),
    "تحديث الواجب",
  );

export const removeAssignment = (assignmentId) =>
  wrapAction(
    () => assistantServices.softDeleteAssignment(assignmentId),
    "حذف الواجب",
  );

export const permanentlyRemoveAssignment = (assignmentId) =>
  wrapAction(
    () => assistantServices.hardDeleteAssignment(assignmentId),
    "حذف الواجب نهائياً",
  );

// ============================================
// ASSIGNMENT SUBMISSIONS
// ============================================

export const fetchGradeSubmissionStats = (gradeId) =>
  wrapAction(
    () => assistantServices.getGradeSubmissionStats(gradeId),
    "تحميل إحصائيات الصف",
  );

export const fetchGroupSubmissionStats = (groupId) =>
  wrapAction(
    () => assistantServices.getGroupSubmissionStats(groupId),
    "تحميل إحصائيات المجموعة",
  );

export const fetchSubmissions = (assignmentId) =>
  wrapAction(
    () => assistantServices.getSubmissions(assignmentId),
    "تحميل التسليمات",
  );

export const fetchStudentSubmission = (assignmentId, studentId) =>
  wrapAction(
    () => assistantServices.getStudentSubmission(assignmentId, studentId),
    "تحميل التسليم",
  );

export const fetchSubmittedStudents = (assignmentId) =>
  wrapAction(
    () => assistantServices.getSubmittedStudents(assignmentId),
    "تحميل الطلاب المسلّمين",
  );

export const fetchNotSubmittedStudents = (assignmentId) =>
  wrapAction(
    () => assistantServices.getNotSubmittedStudents(assignmentId),
    "تحميل الطلاب غير المسلّمين",
  );

export const fetchSubmissionStats = (assignmentId) =>
  wrapAction(
    () => assistantServices.getSubmissionStats(assignmentId),
    "تحميل إحصائيات التسليمات",
  );

export const gradeStudentSubmission = (submissionId, score, feedback) =>
  wrapAction(
    () => assistantServices.gradeSubmission(submissionId, score, feedback),
    "تصحيح التسليم",
  );

// ============================================
// VIDEOS
// ============================================

export const fetchAllVideos = () =>
  wrapAction(() => assistantServices.getVideos(), "تحميل الفيديوهات");

export const fetchVideosByGrade = (gradeId) =>
  wrapAction(
    () => assistantServices.getVideosByGrade(gradeId),
    "تحميل فيديوهات الصف",
  );

export const downloadVideoFileAction = (videoId) =>
  wrapAction(
    () => assistantServices.downloadVideoFile(videoId),
    "تحميل الفيديو",
  );

export const fetchVideoById = (videoId) =>
  wrapAction(() => assistantServices.getVideoById(videoId), "تحميل الفيديو");

export const previewVideoFileAction = (videoId) =>
  previewFile(`${apiUrl}/assistant/videos/${videoId}/preview`);

export const createNewVideo = (formData) =>
  wrapAction(() => assistantServices.createVideo(formData), "إنشاء الفيديو");

export const updateVideoInfo = (videoId, formData) =>
  wrapAction(
    () => assistantServices.updateVideo(videoId, formData),
    "تحديث الفيديو",
  );

export const removeVideo = (videoId) =>
  wrapAction(() => assistantServices.deleteVideo(videoId), "حذف الفيديو");

// ============================================
// PLAYLISTS
// ============================================

export const fetchAllPlaylists = () =>
  wrapAction(() => assistantServices.getPlaylists(), "تحميل قوائم التشغيل");

export const fetchPlaylistsByGrade = (gradeId) =>
  wrapAction(
    () => assistantServices.getPlaylistsByGrade(gradeId),
    "تحميل قوائم الصف",
  );

export const fetchPlaylistById = (playlistId) =>
  wrapAction(
    () => assistantServices.getPlaylistById(playlistId),
    "تحميل قائمة التشغيل",
  );

export const createNewPlaylist = (formData) =>
  wrapAction(
    () => assistantServices.createPlaylist(formData),
    "إنشاء قائمة التشغيل",
  );

export const updatePlaylistInfo = (playlistId, formData) =>
  wrapAction(
    () => assistantServices.updatePlaylist(playlistId, formData),
    "تحديث قائمة التشغيل",
  );

export const removePlaylist = (playlistId) =>
  wrapAction(
    () => assistantServices.deletePlaylist(playlistId),
    "حذف قائمة التشغيل",
  );

export const fetchPlaylistVideos = (playlistId) =>
  wrapAction(
    () => assistantServices.getPlaylistVideos(playlistId),
    "تحميل فيديوهات القائمة",
  );

export const addVideoToPlaylistAction = (playlistId, videoId) =>
  wrapAction(
    () => assistantServices.addVideoToPlaylist(playlistId, videoId),
    "إضافة الفيديو للقائمة",
  );

export const removeVideoFromPlaylistAction = (id) =>
  wrapAction(
    () => assistantServices.removeVideoFromPlaylist(id),
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

export const fetchWhatsappStatus = () =>
  wrapAction(
    () => assistantServices.getWhatsappStatus(),
    "تحميل حالة الواتساب",
  );

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
    () => assistantServices.downloadStudentsTemplate(),
    "تحميل القالب",
  );

export const downloadGradesTemplateAction = () =>
  wrapAction(() => assistantServices.downloadGradesTemplate(), "تحميل القالب");

export const downloadGroupsTemplateAction = () =>
  wrapAction(() => assistantServices.downloadGroupsTemplate(), "تحميل القالب");

export const downloadExamResultsTemplateAction = () =>
  wrapAction(
    () => assistantServices.downloadExamResultsTemplate(),
    "تحميل القالب",
  );

export const bulkUploadStudentsAction = (formData) =>
  wrapAction(
    () => assistantServices.bulkUploadStudents(formData),
    "رفع الطلاب",
  );

export const bulkUploadGradesAction = (formData) =>
  wrapAction(() => assistantServices.bulkUploadGrades(formData), "رفع الصفوف");

export const bulkUploadGroupsAction = (formData) =>
  wrapAction(
    () => assistantServices.bulkUploadGroups(formData),
    "رفع المجموعات",
  );

export const bulkUploadExamResultsAction = (examId, formData) =>
  wrapAction(
    () => assistantServices.bulkUploadExamResults(examId, formData),
    "رفع النتائج",
  );

// ============================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================

export { BASE_URL };
