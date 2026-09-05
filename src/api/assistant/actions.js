// src/api/assistant/actions.js
import * as assistantServices from "./services";
import config from "../../config";
import { previewFile, downloadFile } from "../../utils/fileHandler";
const { apiUrl } = config;

const previewVideoFileAction = async (videoId) => {
  const url = `${apiUrl}/assistant/videos/${videoId}/preview`;
  return await previewFile(url);
};

const fetchAssistantProfile = async () => {
  try {
    const data = await assistantServices.getAssistantProfile();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssistantDashboard = async () => {
  try {
    const data = await assistantServices.getAssistantDashboard();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchActivityLog = async (entityType = "", date = "", page = 1) => {
  try {
    const response = await assistantServices.getActivityLog(
      entityType,
      date,
      page,
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

const updateAssistantProfileImageAction = async (formData) => {
  try {
    const data = await assistantServices.updateAssistantProfileImage(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteAssistantProfileImageAction = async () => {
  try {
    const data = await assistantServices.deleteAssistantProfileImage();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const changeAssistantPassword = async (
  oldPassword,
  newPassword,
  confirmPassword,
) => {
  try {
    const response = await assistantServices.updateAssistantPassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchDashboardStats = async () => {
  try {
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

const fetchOnlineExamStats = async (examId) => {
  try {
    const data = await assistantServices.getOnlineExamStats(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllPayments = async (
  page = 1,
  search = "",
  gradeId = "",
  groupId = "",
) => {
  try {
    const response = await assistantServices.getPayments(
      page,
      search,
      gradeId,
      groupId,
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

const fetchPaymentCollections = async () => {
  try {
    const data = await assistantServices.getPaymentCollections();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchUnpaidStudents = async () => {
  try {
    const data = await assistantServices.getUnpaidStudents();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentsPaymentStatus = async () => {
  try {
    const data = await assistantServices.getStudentsPaymentStatus();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamStats = async (examId) => {
  try {
    const data = await assistantServices.getExamStats(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllGrades = async () => {
  try {
    const data = await assistantServices.getGrades();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeDetails = async (gradeId) => {
  try {
    const [grade, stats] = await Promise.all([
      assistantServices.getGradeById(gradeId),
      assistantServices.getGradeStats(gradeId),
    ]);
    return { success: true, data: { grade, stats } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const findGradeByNameAction = async (gradeName) => {
  try {
    const data = await assistantServices.findGradeByName(gradeName);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewGrade = async (gradeData) => {
  try {
    const data = await assistantServices.createGrade(gradeData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateGradeInfo = async (gradeId, gradeData) => {
  try {
    const data = await assistantServices.updateGrade(gradeId, gradeData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeGrade = async (gradeId) => {
  try {
    const data = await assistantServices.softDeleteGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const permanentlyRemoveGrade = async (gradeId) => {
  try {
    const data = await assistantServices.hardDeleteGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllGroups = async () => {
  try {
    const data = await assistantServices.getGroups();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupDetails = async (groupId) => {
  try {
    const [group, stats] = await Promise.all([
      assistantServices.getGroupById(groupId),
      assistantServices.getGroupStats(groupId),
    ]);
    return { success: true, data: { group, stats } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupFullStats = async (groupId) => {
  try {
    const data = await assistantServices.getGroupFullStats(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupsByGrade = async (gradeId) => {
  try {
    const data = await assistantServices.getGroupsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const findGroupByNameAction = async (groupName) => {
  try {
    const data = await assistantServices.findGroupByName(groupName);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewGroup = async (groupData) => {
  try {
    const data = await assistantServices.createGroup(groupData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateGroupInfo = async (groupId, groupData) => {
  try {
    const data = await assistantServices.updateGroup(groupId, groupData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeGroup = async (groupId) => {
  try {
    const data = await assistantServices.softDeleteGroup(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const permanentlyRemoveGroup = async (groupId) => {
  try {
    const data = await assistantServices.hardDeleteGroup(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllStudents = async (
  page = 1,
  search = "",
  gradeId = "",
  groupId = "",
) => {
  try {
    const response = await assistantServices.getStudents(
      page,
      search,
      gradeId,
      groupId,
    );
    return {
      success: true,
      data: response.data || [],
      pagination: response.pagination || null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchDeletedStudents = async (page = 1) => {
  try {
    const response = await assistantServices.getDeletedStudents(page);
    return {
      success: true,
      data: response.data || [],
      pagination: response.pagination || null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchStudentByBarcode = async (barcode) => {
  try {
    const data = await assistantServices.searchStudentByBarcode(barcode);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchStudentByPhone = async (phone) => {
  try {
    const data = await assistantServices.searchStudentByPhone(phone);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchStudentsByParentPhoneAction = async (parentPhone) => {
  try {
    const data =
      await assistantServices.searchStudentsByParentPhone(parentPhone);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentDetails = async (studentId) => {
  try {
    const [profile, stats] = await Promise.all([
      assistantServices.getStudentProfile(studentId),
      assistantServices.getStudentStats(studentId),
    ]);
    return { success: true, data: { profile, stats } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentFullDetails = async (studentId) => {
  try {
    const data = await assistantServices.getStudentFullDetails(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentAttendanceHistory = async (studentId) => {
  try {
    const data = await assistantServices.getStudentAttendanceHistory(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentMonthlyAttendance = async (studentId) => {
  try {
    const data = await assistantServices.getStudentMonthlyAttendance(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentTotalAttendance = async (studentId) => {
  try {
    const data = await assistantServices.getStudentTotalAttendance(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentConsecutiveAbsences = async (studentId) => {
  try {
    const data =
      await assistantServices.getStudentConsecutiveAbsences(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPayments = async (studentId) => {
  try {
    const data = await assistantServices.getStudentPayments(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPaymentsBalance = async (studentId) => {
  try {
    const data = await assistantServices.getStudentPaymentsBalance(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentCurrentSubscription = async (studentId) => {
  try {
    const data =
      await assistantServices.getStudentCurrentSubscription(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPaperExams = async (studentId) => {
  try {
    const data = await assistantServices.getStudentPaperExams(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPaperExamById = async (studentId, examId) => {
  try {
    const data = await assistantServices.getStudentPaperExamById(
      studentId,
      examId,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentExamResults = async (studentId) => {
  try {
    const data = await assistantServices.getStudentExamResults(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentOnlineExams = async (studentId) => {
  try {
    const data = await assistantServices.getStudentOnlineExams(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentOnlineExamById = async (studentId, attemptId) => {
  try {
    const data = await assistantServices.getStudentOnlineExamById(
      studentId,
      attemptId,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentAssignments = async (studentId) => {
  try {
    const data = await assistantServices.getStudentAssignments(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentAssignmentById = async (studentId, assignmentId) => {
  try {
    const data = await assistantServices.getStudentAssignmentById(
      studentId,
      assignmentId,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentSubmissions = async (studentId) => {
  try {
    const data = await assistantServices.getStudentSubmissions(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentSubmissionById = async (studentId, submissionId) => {
  try {
    const data = await assistantServices.getStudentSubmissionById(
      studentId,
      submissionId,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentPlaylists = async (studentId) => {
  try {
    const data = await assistantServices.getStudentPlaylists(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewStudent = async (studentData) => {
  try {
    const data = await assistantServices.createStudent(studentData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateStudentInfo = async (studentId, studentData) => {
  try {
    const data = await assistantServices.updateStudent(studentId, studentData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeStudent = async (studentId) => {
  try {
    const data = await assistantServices.softDeleteStudent(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const permanentlyRemoveStudent = async (studentId) => {
  try {
    const data = await assistantServices.hardDeleteStudent(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const restoreStudentAction = async (studentId) => {
  try {
    const data = await assistantServices.restoreStudent(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const startNewAttendanceSession = async (sessionData) => {
  try {
    const data = await assistantServices.startAttendanceSession(sessionData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchActiveSession = async (groupId) => {
  try {
    const data = await assistantServices.getActiveSession(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const toggleSessionMakeupMode = async (sessionId) => {
  try {
    const data = await assistantServices.toggleMakeupMode(sessionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const scanStudentBarcode = async (scanData) => {
  try {
    const data = await assistantServices.scanBarcode(scanData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const lockAttendanceSession = async (sessionId, groupId) => {
  try {
    const data = await assistantServices.lockSession(sessionId, groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewAttendance = async (attendanceData) => {
  try {
    const data = await assistantServices.createAttendance(attendanceData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const markRestAsAbsent = async (groupId, date) => {
  try {
    const data = await assistantServices.markRestAbsent(groupId, date);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceById = async (attendanceId) => {
  try {
    const data = await assistantServices.getAttendanceById(attendanceId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateAttendanceInfo = async (attendanceId, attendanceData) => {
  try {
    const data = await assistantServices.updateAttendance(
      attendanceId,
      attendanceData,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeAttendance = async (attendanceId) => {
  try {
    const data = await assistantServices.deleteAttendance(attendanceId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceDashboard = async () => {
  try {
    const data = await assistantServices.getAttendanceDashboard();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceOverview = async () => {
  try {
    const [overall, consecutiveAbsences] = await Promise.all([
      assistantServices.getAttendanceOverall(),
      assistantServices.getConsecutiveAbsences(),
    ]);
    return { success: true, data: { overall, consecutiveAbsences } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeAttendance = async (gradeId) => {
  try {
    const data = await assistantServices.getGradeAttendance(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupAttendanceByDate = async (groupId, date) => {
  try {
    const data = await assistantServices.getGroupAttendanceByDate(
      groupId,
      date,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupAttendanceByMonth = async (groupId, month) => {
  try {
    const data = await assistantServices.getGroupAttendanceByMonth(
      groupId,
      month,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAttendanceSummary = async (groupId, date) => {
  try {
    const data = await assistantServices.getAttendanceSummary(groupId, date);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaymentOverview = async () => {
  try {
    const [collections, unpaid, overall] = await Promise.all([
      assistantServices.getPaymentCollections(),
      assistantServices.getUnpaidStudents(),
      assistantServices.getPaymentOverall(),
    ]);
    return { success: true, data: { collections, unpaid, overall } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaymentById = async (paymentId) => {
  try {
    const data = await assistantServices.getPaymentById(paymentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewPayment = async (paymentData) => {
  try {
    const data = await assistantServices.createPayment(paymentData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updatePaymentInfo = async (paymentId, paymentData) => {
  try {
    const data = await assistantServices.updatePayment(paymentId, paymentData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removePayment = async (paymentId) => {
  try {
    const data = await assistantServices.deletePayment(paymentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradePaymentStats = async (gradeId) => {
  try {
    const data = await assistantServices.getGradePaymentStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupPaymentStats = async (groupId) => {
  try {
    const data = await assistantServices.getGroupPaymentStats(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaymentsByGradeAndMonth = async (gradeId, month) => {
  try {
    const data = await assistantServices.getPaymentsByGradeAndMonth(
      gradeId,
      month,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaymentsByGroupAndMonth = async (groupId, month) => {
  try {
    const data = await assistantServices.getPaymentsByGroupAndMonth(
      groupId,
      month,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchSubscriptionOverview = async () => {
  try {
    const [withoutSubscription, overall] = await Promise.all([
      assistantServices.getStudentsWithoutSubscription(),
      assistantServices.getSubscriptionOverall(),
    ]);
    return { success: true, data: { withoutSubscription, overall } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewSubscription = async (subscriptionData) => {
  try {
    const data = await assistantServices.createSubscription(subscriptionData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentSubscriptions = async (studentId) => {
  try {
    const data = await assistantServices.getStudentSubscriptions(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchSubscriptionsByMonth = async (month) => {
  try {
    const data = await assistantServices.getSubscriptionsByMonth(month);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeSubscriptionStats = async (gradeId) => {
  try {
    const data = await assistantServices.getGradeSubscriptionStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupSubscriptionStats = async (groupId) => {
  try {
    const data = await assistantServices.getGroupSubscriptionStats(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateSubscriptionStatusAction = async (subscriptionId, status) => {
  try {
    const data = await assistantServices.updateSubscriptionStatus(
      subscriptionId,
      status,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeSubscription = async (subscriptionId) => {
  try {
    const data = await assistantServices.deleteSubscription(subscriptionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllExams = async (page = 1) => {
  try {
    const response = await assistantServices.getExams(page);
    return {
      success: true,
      data: response.data || [],
      pagination: response.pagination || null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamsByGrade = async (gradeId) => {
  try {
    const data = await assistantServices.getExamsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamsByGroup = async (groupId) => {
  try {
    const data = await assistantServices.getExamsByGroup(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeExamStats = async (gradeId) => {
  try {
    const data = await assistantServices.getGradeExamStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamById = async (examId) => {
  try {
    const data = await assistantServices.getExamById(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewExam = async (examData) => {
  try {
    const data = await assistantServices.createExam(examData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateExamInfo = async (examId, examData) => {
  try {
    const data = await assistantServices.updateExam(examId, examData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeExam = async (examId) => {
  try {
    const data = await assistantServices.softDeleteExam(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const permanentlyRemoveExam = async (examId) => {
  try {
    const data = await assistantServices.hardDeleteExam(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createExamResultAction = async (resultData) => {
  try {
    const data = await assistantServices.createExamResult(resultData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const upsertExamResultAction = async (resultData) => {
  try {
    const data = await assistantServices.upsertExamResult(resultData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const upsertBatchExamResultsAction = async (examId, records) => {
  try {
    const data = await assistantServices.upsertBatchExamResults(
      examId,
      records,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateExamResultAction = async (resultId, resultData) => {
  try {
    const data = await assistantServices.updateExamResult(resultId, resultData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeExamResult = async (resultId) => {
  try {
    const data = await assistantServices.deleteExamResult(resultId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamResults = async (examId) => {
  try {
    const data = await assistantServices.getExamResults(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamResultStats = async (examId) => {
  try {
    const data = await assistantServices.getExamResultStats(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeExamResultsStats = async (gradeId) => {
  try {
    const data = await assistantServices.getGradeExamResultsStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupExamResultsStats = async (groupId) => {
  try {
    const data = await assistantServices.getGroupExamResultsStats(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllOnlineExams = async () => {
  try {
    const data = await assistantServices.getOnlineExams();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAvailableOnlineExams = async () => {
  try {
    const data = await assistantServices.getAvailableOnlineExams();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExpiredOnlineExams = async () => {
  try {
    const data = await assistantServices.getExpiredOnlineExams();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOnlineExamsByGrade = async (gradeId) => {
  try {
    const data = await assistantServices.getOnlineExamsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOnlineExamsByGroup = async (groupId) => {
  try {
    const data = await assistantServices.getOnlineExamsByGroup(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeOnlineExamStats = async (gradeId) => {
  try {
    const data = await assistantServices.getGradeOnlineExamStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOnlineExamById = async (examId) => {
  try {
    const data = await assistantServices.getOnlineExamById(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewOnlineExam = async (examData) => {
  try {
    const data = await assistantServices.createOnlineExam(examData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateOnlineExamInfo = async (examId, examData) => {
  try {
    const data = await assistantServices.updateOnlineExam(examId, examData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeOnlineExam = async (examId) => {
  try {
    const data = await assistantServices.softDeleteOnlineExam(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const permanentlyRemoveOnlineExam = async (examId) => {
  try {
    const data = await assistantServices.hardDeleteOnlineExam(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchQuestionsByExam = async (examId) => {
  try {
    const data = await assistantServices.getQuestionsByExam(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchQuestionById = async (questionId) => {
  try {
    const data = await assistantServices.getQuestionById(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadQuestionFileAction = async (questionId) => {
  try {
    const data = await assistantServices.downloadQuestionFile(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const previewQuestionFileAction = async (questionId) => {
  const url = `${apiUrl}/assistant/questions/${questionId}/download`;
  return await previewFile(url);
};

const previewAnswerFileAction = async (answerId) => {
  const url = `${apiUrl}/assistant/student-answers/${answerId}/preview`;
  return await previewFile(url);
};

const downloadAnswerFileDirect = async (answerId, fileName = "answer-file") => {
  const url = `${apiUrl}/assistant/student-answers/${answerId}/download`;
  return await downloadFile(url, fileName);
};

const downloadQuestionFileDirect = async (
  questionId,
  fileName = "question-file",
) => {
  const url = `${apiUrl}/assistant/questions/${questionId}/download`;
  return await downloadFile(url, fileName);
};

const createNewQuestionWithFile = async (questionData, file) => {
  try {
    const data = await assistantServices.createQuestionWithFile(
      questionData,
      file,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateQuestionInfoWithFile = async (questionId, questionData, file) => {
  try {
    const data = await assistantServices.updateQuestionWithFile(
      questionId,
      questionData,
      file,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewQuestion = async (questionData) => {
  try {
    const data = await assistantServices.createQuestion(questionData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateQuestionInfo = async (questionId, questionData) => {
  try {
    const data = await assistantServices.updateQuestion(
      questionId,
      questionData,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeQuestion = async (questionId) => {
  try {
    const data = await assistantServices.deleteQuestion(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOptionsByQuestion = async (questionId) => {
  try {
    const data = await assistantServices.getOptionsByQuestion(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOptionById = async (optionId) => {
  try {
    const data = await assistantServices.getOptionById(optionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewOption = async (optionData) => {
  try {
    const data = await assistantServices.createOption(optionData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateOptionInfo = async (optionId, optionData) => {
  try {
    const data = await assistantServices.updateOption(optionId, optionData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeOption = async (optionId) => {
  try {
    const data = await assistantServices.deleteOption(optionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPendingEssayAnswers = async () => {
  try {
    const data = await assistantServices.getPendingEssayAnswers();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchEssayAnswersByExam = async (examId) => {
  try {
    const data = await assistantServices.getEssayAnswersByExam(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const gradeEssayAnswerAction = async (answerId, isCorrect) => {
  try {
    const data = await assistantServices.gradeEssayAnswer(answerId, isCorrect);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentExams = async (examId) => {
  try {
    const data = await assistantServices.getStudentExams(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentExamStats = async (examId) => {
  try {
    const data = await assistantServices.getStudentExamStats(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeStudentExamStats = async (gradeId) => {
  try {
    const data = await assistantServices.getGradeStudentExamStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupStudentExamStats = async (groupId) => {
  try {
    const data = await assistantServices.getGroupStudentExamStats(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchQuestionAnswerStats = async (questionId) => {
  try {
    const data = await assistantServices.getQuestionAnswerStats(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchQuestionMostSelectedOptions = async (questionId) => {
  try {
    const data =
      await assistantServices.getQuestionMostSelectedOptions(questionId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllAssignments = async () => {
  try {
    const data = await assistantServices.getAssignments();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentsByGrade = async (gradeId) => {
  try {
    const data = await assistantServices.getAssignmentsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentsByGroup = async (groupId) => {
  try {
    const data = await assistantServices.getAssignmentsByGroup(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadAssignmentAction = async (assignmentId) => {
  try {
    const data = await assistantServices.downloadAssignment(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentById = async (assignmentId) => {
  try {
    const data = await assistantServices.getAssignmentById(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewAssignment = async (formData) => {
  try {
    const data = await assistantServices.createAssignment(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateAssignmentInfo = async (assignmentId, formData) => {
  try {
    const data = await assistantServices.updateAssignment(
      assignmentId,
      formData,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeAssignment = async (assignmentId) => {
  try {
    const data = await assistantServices.softDeleteAssignment(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const permanentlyRemoveAssignment = async (assignmentId) => {
  try {
    const data = await assistantServices.hardDeleteAssignment(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGradeSubmissionStats = async (gradeId) => {
  try {
    const data = await assistantServices.getGradeSubmissionStats(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchGroupSubmissionStats = async (groupId) => {
  try {
    const data = await assistantServices.getGroupSubmissionStats(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchSubmissions = async (assignmentId) => {
  try {
    const data = await assistantServices.getSubmissions(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentSubmission = async (assignmentId, studentId) => {
  try {
    const data = await assistantServices.getStudentSubmission(
      assignmentId,
      studentId,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchSubmittedStudents = async (assignmentId) => {
  try {
    const data = await assistantServices.getSubmittedStudents(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchNotSubmittedStudents = async (assignmentId) => {
  try {
    const data = await assistantServices.getNotSubmittedStudents(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchSubmissionStats = async (assignmentId) => {
  try {
    const data = await assistantServices.getSubmissionStats(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const gradeStudentSubmission = async (submissionId, score, feedback) => {
  try {
    const data = await assistantServices.gradeSubmission(
      submissionId,
      score,
      feedback,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllVideos = async () => {
  try {
    const data = await assistantServices.getVideos();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchVideosByGrade = async (gradeId) => {
  try {
    const data = await assistantServices.getVideosByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadVideoFileAction = async (videoId) => {
  try {
    const data = await assistantServices.downloadVideoFile(videoId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchVideoById = async (videoId) => {
  try {
    const data = await assistantServices.getVideoById(videoId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewVideo = async (formData) => {
  try {
    const data = await assistantServices.createVideo(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateVideoInfo = async (videoId, formData) => {
  try {
    const data = await assistantServices.updateVideo(videoId, formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeVideo = async (videoId) => {
  try {
    const data = await assistantServices.deleteVideo(videoId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAllPlaylists = async () => {
  try {
    const data = await assistantServices.getPlaylists();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistsByGrade = async (gradeId) => {
  try {
    const data = await assistantServices.getPlaylistsByGrade(gradeId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistById = async (playlistId) => {
  try {
    const data = await assistantServices.getPlaylistById(playlistId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createNewPlaylist = async (formData) => {
  try {
    const data = await assistantServices.createPlaylist(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updatePlaylistInfo = async (playlistId, formData) => {
  try {
    const data = await assistantServices.updatePlaylist(playlistId, formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removePlaylist = async (playlistId) => {
  try {
    const data = await assistantServices.deletePlaylist(playlistId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistVideos = async (playlistId) => {
  try {
    const data = await assistantServices.getPlaylistVideos(playlistId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const addVideoToPlaylistAction = async (playlistId, videoId) => {
  try {
    const data = await assistantServices.addVideoToPlaylist(
      playlistId,
      videoId,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const removeVideoFromPlaylistAction = async (id) => {
  try {
    const data = await assistantServices.removeVideoFromPlaylist(id);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchWhatsappTemplates = async () => {
  try {
    const res = await assistantServices.getWhatsappTemplates();
    return {
      success: res?.success !== false,
      data: res?.data ?? [],
      error: res?.error,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const toggleWhatsappTemplateAction = async (templateId) => {
  try {
    const res = await assistantServices.toggleWhatsappTemplate(templateId);
    return {
      success: res?.success !== false,
      data: res?.data,
      error: res?.error,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateWhatsappTemplateAction = async (templateId, templateData) => {
  try {
    const res = await assistantServices.updateWhatsappTemplate(
      templateId,
      templateData,
    );
    return {
      success: res?.success !== false,
      data: res?.data,
      message: res?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchWhatsappStatus = async () => {
  try {
    const res = await assistantServices.getWhatsappStatus();
    return {
      success: res?.success !== false,
      data: res?.data ?? {},
      error: res?.error,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendWelcomeWhatsappAction = async (studentId, instant = false) => {
  try {
    const res = await assistantServices.sendWelcomeWhatsapp(studentId, instant);
    return {
      success: res?.success !== false,
      data: res?.data,
      message: res?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendAbsenceWhatsappAction = async (studentId, date, instant = false) => {
  try {
    const res = await assistantServices.sendAbsenceWhatsapp(
      studentId,
      date,
      instant,
    );
    return {
      success: res?.success !== false,
      data: res?.data,
      message: res?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendPaymentWhatsappAction = async (paymentId, instant = false) => {
  try {
    const res = await assistantServices.sendPaymentWhatsapp(paymentId, instant);
    return {
      success: res?.success !== false,
      data: res?.data,
      message: res?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendExamWhatsappAction = async (resultId, instant = false) => {
  try {
    const res = await assistantServices.sendExamWhatsapp(resultId, instant);
    return {
      success: res?.success !== false,
      data: res?.data,
      message: res?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendWhatsappQueueAction = async (options) => {
  try {
    const res = await assistantServices.sendWhatsappQueue(options);
    return {
      success: res?.success !== false,
      data: res?.data,
      message: res?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchWhatsappStats = async () => {
  try {
    const res = await assistantServices.getWhatsappStats();
    return {
      success: res?.success !== false,
      data: res?.data ?? {},
      error: res?.error,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const resetFailedWhatsappAction = async () => {
  try {
    const res = await assistantServices.resetFailedWhatsappMessages();
    return {
      success: res?.success !== false,
      data: res?.data,
      message: res?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchWhatsappMessages = async (options = {}) => {
  try {
    const res = await assistantServices.getWhatsappMessages(options);
    return {
      success: true,
      data: Array.isArray(res?.data) ? res.data : [],
      pagination: res?.pagination ?? null,
    };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
};

const fetchWhatsappMessageById = async (messageId) => {
  try {
    const res = await assistantServices.getWhatsappMessageById(messageId);
    return {
      success: res?.success !== false,
      data: res?.data,
      error: res?.error,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteWhatsappMessageAction = async (messageId) => {
  try {
    const res = await assistantServices.deleteWhatsappMessage(messageId);
    return { success: res?.success !== false, message: res?.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchWhatsappDashboard = async () => {
  try {
    const response = await assistantServices.getWhatsappDashboard();
    return {
      success: response?.success !== false,
      data: response?.data ?? {},
      message: response?.message,
    };
  } catch (error) {
    return { success: false, error: error.message, data: {} };
  }
};

const downloadStudentsTemplateAction = async () => {
  try {
    const data = await assistantServices.downloadStudentsTemplate();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadGradesTemplateAction = async () => {
  try {
    const data = await assistantServices.downloadGradesTemplate();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadGroupsTemplateAction = async () => {
  try {
    const data = await assistantServices.downloadGroupsTemplate();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadExamResultsTemplateAction = async () => {
  try {
    const data = await assistantServices.downloadExamResultsTemplate();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const bulkUploadStudentsAction = async (formData) => {
  try {
    const data = await assistantServices.bulkUploadStudents(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const bulkUploadGradesAction = async (formData) => {
  try {
    const data = await assistantServices.bulkUploadGrades(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const bulkUploadGroupsAction = async (formData) => {
  try {
    const data = await assistantServices.bulkUploadGroups(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const bulkUploadExamResultsAction = async (examId, formData) => {
  try {
    const data = await assistantServices.bulkUploadExamResults(
      examId,
      formData,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const startAttendanceSession = async (sessionData) => {
  try {
    const data = await assistantServices.startAttendanceSession(sessionData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const toggleMakeupMode = async (id) => {
  try {
    const data = await assistantServices.toggleMakeupMode(id);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaymentOverall = async () => {
  try {
    const data = await assistantServices.getPaymentOverall();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateSubscriptionStatus = async (id, status) => {
  try {
    const data = await assistantServices.updateSubscriptionStatus(id, status);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const restoreStudent = async (studentId) => {
  try {
    const data = await assistantServices.restoreStudent(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentProfile = async (studentId) => {
  try {
    const data = await assistantServices.getStudentProfile(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentStats = async (studentId) => {
  try {
    const data = await assistantServices.getStudentStats(studentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentsByGroup = async (groupId) => {
  try {
    const data = await assistantServices.getStudentsByGroup(groupId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
const updateWhatsappSettingsAction = async (settingsData) => {
  try {
    const res = await assistantServices.updateWhatsappSettings(settingsData);
    return {
      success: res?.success !== false,
      data: res?.data,
      message: res?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export {
  updateWhatsappSettingsAction,
  fetchAssistantProfile,
  toggleMakeupMode,
  fetchAssistantDashboard,
  fetchActivityLog,
  fetchPaymentOverall,
  fetchStudentProfile,
  updateAssistantProfileImageAction,
  deleteAssistantProfileImageAction,
  changeAssistantPassword,
  fetchDashboardStats,
  startAttendanceSession,
  fetchStudentsByGroup,
  fetchOnlineExamStats,
  restoreStudent,
  fetchStudentStats,
  fetchAllPayments,
  fetchPaymentCollections,
  fetchUnpaidStudents,
  updateSubscriptionStatus,
  fetchStudentsPaymentStatus,
  fetchExamStats,
  fetchAllGrades,
  fetchGradeDetails,
  findGradeByNameAction,
  createNewGrade,
  updateGradeInfo,
  removeGrade,
  permanentlyRemoveGrade,
  fetchAllGroups,
  fetchGroupDetails,
  fetchGroupFullStats,
  fetchGroupsByGrade,
  findGroupByNameAction,
  createNewGroup,
  updateGroupInfo,
  removeGroup,
  permanentlyRemoveGroup,
  fetchAllStudents,
  fetchDeletedStudents,
  searchStudentByBarcode,
  searchStudentByPhone,
  searchStudentsByParentPhoneAction,
  fetchStudentDetails,
  fetchStudentFullDetails,
  fetchStudentAttendanceHistory,
  fetchStudentMonthlyAttendance,
  fetchStudentTotalAttendance,
  fetchStudentConsecutiveAbsences,
  fetchStudentPayments,
  fetchStudentPaymentsBalance,
  fetchStudentCurrentSubscription,
  fetchStudentPaperExams,
  fetchStudentPaperExamById,
  fetchStudentExamResults,
  fetchStudentOnlineExams,
  fetchStudentOnlineExamById,
  fetchStudentAssignments,
  fetchStudentAssignmentById,
  fetchStudentSubmissions,
  fetchStudentSubmissionById,
  fetchStudentPlaylists,
  createNewStudent,
  updateStudentInfo,
  removeStudent,
  permanentlyRemoveStudent,
  restoreStudentAction,
  startNewAttendanceSession,
  fetchActiveSession,
  toggleSessionMakeupMode,
  scanStudentBarcode,
  lockAttendanceSession,
  createNewAttendance,
  markRestAsAbsent,
  fetchAttendanceById,
  updateAttendanceInfo,
  removeAttendance,
  fetchAttendanceDashboard,
  fetchAttendanceOverview,
  fetchGradeAttendance,
  fetchGroupAttendanceByDate,
  fetchGroupAttendanceByMonth,
  fetchAttendanceSummary,
  fetchPaymentOverview,
  fetchPaymentById,
  createNewPayment,
  updatePaymentInfo,
  removePayment,
  fetchGradePaymentStats,
  fetchGroupPaymentStats,
  fetchPaymentsByGradeAndMonth,
  fetchPaymentsByGroupAndMonth,
  fetchSubscriptionOverview,
  createNewSubscription,
  fetchStudentSubscriptions,
  fetchSubscriptionsByMonth,
  fetchGradeSubscriptionStats,
  fetchGroupSubscriptionStats,
  updateSubscriptionStatusAction,
  removeSubscription,
  fetchAllExams,
  fetchExamsByGrade,
  fetchExamsByGroup,
  fetchGradeExamStats,
  fetchExamById,
  createNewExam,
  updateExamInfo,
  removeExam,
  permanentlyRemoveExam,
  createExamResultAction,
  upsertExamResultAction,
  upsertBatchExamResultsAction,
  updateExamResultAction,
  removeExamResult,
  fetchExamResults,
  fetchExamResultStats,
  fetchGradeExamResultsStats,
  fetchGroupExamResultsStats,
  fetchAllOnlineExams,
  fetchAvailableOnlineExams,
  fetchExpiredOnlineExams,
  fetchOnlineExamsByGrade,
  fetchOnlineExamsByGroup,
  fetchGradeOnlineExamStats,
  fetchOnlineExamById,
  createNewOnlineExam,
  updateOnlineExamInfo,
  removeOnlineExam,
  permanentlyRemoveOnlineExam,
  fetchQuestionsByExam,
  fetchQuestionById,
  downloadQuestionFileAction,
  createNewQuestion,
  createNewQuestionWithFile,
  updateQuestionInfo,
  updateQuestionInfoWithFile,
  previewQuestionFileAction,
  downloadQuestionFileDirect,
  previewAnswerFileAction,
  downloadAnswerFileDirect,
  removeQuestion,
  fetchOptionsByQuestion,
  fetchOptionById,
  createNewOption,
  updateOptionInfo,
  removeOption,
  fetchPendingEssayAnswers,
  fetchEssayAnswersByExam,
  gradeEssayAnswerAction,
  fetchStudentExams,
  fetchStudentExamStats,
  fetchGradeStudentExamStats,
  fetchGroupStudentExamStats,
  fetchQuestionAnswerStats,
  fetchQuestionMostSelectedOptions,
  fetchAllAssignments,
  fetchAssignmentsByGrade,
  fetchAssignmentsByGroup,
  downloadAssignmentAction,
  fetchAssignmentById,
  createNewAssignment,
  updateAssignmentInfo,
  removeAssignment,
  permanentlyRemoveAssignment,
  fetchGradeSubmissionStats,
  fetchGroupSubmissionStats,
  fetchSubmissions,
  fetchStudentSubmission,
  fetchSubmittedStudents,
  fetchNotSubmittedStudents,
  fetchSubmissionStats,
  gradeStudentSubmission,
  fetchAllVideos,
  fetchVideosByGrade,
  downloadVideoFileAction,
  fetchVideoById,
  createNewVideo,
  updateVideoInfo,
  removeVideo,
  fetchAllPlaylists,
  fetchPlaylistsByGrade,
  fetchPlaylistById,
  createNewPlaylist,
  updatePlaylistInfo,
  removePlaylist,
  fetchPlaylistVideos,
  addVideoToPlaylistAction,
  removeVideoFromPlaylistAction,
  fetchWhatsappTemplates,
  toggleWhatsappTemplateAction,
  updateWhatsappTemplateAction,
  fetchWhatsappStatus,
  sendWelcomeWhatsappAction,
  sendAbsenceWhatsappAction,
  sendPaymentWhatsappAction,
  sendExamWhatsappAction,
  sendWhatsappQueueAction,
  fetchWhatsappStats,
  resetFailedWhatsappAction,
  fetchWhatsappMessages,
  fetchWhatsappMessageById,
  deleteWhatsappMessageAction,
  fetchWhatsappDashboard,
  downloadStudentsTemplateAction,
  downloadGradesTemplateAction,
  downloadGroupsTemplateAction,
  downloadExamResultsTemplateAction,
  bulkUploadStudentsAction,
  bulkUploadGradesAction,
  bulkUploadGroupsAction,
  bulkUploadExamResultsAction,
  previewVideoFileAction,
};
