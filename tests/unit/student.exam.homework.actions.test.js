import { describe, it, expect, vi, beforeEach } from "vitest";
import * as studentServices from "../../src/api/student/services";
import {
  checkExamAttempt,
  fetchExamQuestions,
  submitStudentExam,
  submitStudentAnswer,
  submitStudentEssayAnswer,
  fetchExamReview,
  downloadAssignmentFile,
  submitStudentAssignment,
  updateStudentAssignment,
  fetchSubmissions,
  downloadSubmissionFile,
} from "../../src/api/student/actions";

vi.mock("../../src/api/student/services", () => ({
  checkExamAttempt: vi.fn(),
  getExamQuestions: vi.fn(),
  submitExam: vi.fn(),
  answerQuestion: vi.fn(),
  submitEssayAnswer: vi.fn(),
  getExamReview: vi.fn(),
  downloadAssignment: vi.fn(),
  submitAssignment: vi.fn(),
  updateAssignmentSubmission: vi.fn(),
  getSubmissions: vi.fn(),
  downloadSubmissionFile: vi.fn(),
}));

describe("Student Exam & Homework Actions Argument Propagation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checkExamAttempt forwards examId to service", async () => {
    studentServices.checkExamAttempt.mockResolvedValueOnce({ has_active_attempt: true });
    const res = await checkExamAttempt(42);
    expect(studentServices.checkExamAttempt).toHaveBeenCalledWith(42);
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ has_active_attempt: true });
  });

  it("fetchExamQuestions forwards examId to service", async () => {
    const mockQuestions = [{ id: 1, title: "سؤال 1" }];
    studentServices.getExamQuestions.mockResolvedValueOnce(mockQuestions);
    const res = await fetchExamQuestions(99);
    expect(studentServices.getExamQuestions).toHaveBeenCalledWith(99);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockQuestions);
  });

  it("submitStudentExam forwards attemptId to service", async () => {
    studentServices.submitExam.mockResolvedValueOnce({ score: 100 });
    const res = await submitStudentExam(1234);
    expect(studentServices.submitExam).toHaveBeenCalledWith(1234);
    expect(res.success).toBe(true);
  });

  it("submitStudentAnswer forwards examId, questionId, and selectedOptionId", async () => {
    studentServices.answerQuestion.mockResolvedValueOnce({ is_correct: true });
    const res = await submitStudentAnswer(5, 10, 20);
    expect(studentServices.answerQuestion).toHaveBeenCalledWith(5, 10, 20);
    expect(res.success).toBe(true);
  });

  it("submitStudentEssayAnswer forwards examId, questionId, and file", async () => {
    const fakeFile = new File(["content"], "answer.pdf", { type: "application/pdf" });
    studentServices.submitEssayAnswer.mockResolvedValueOnce({ file_path: "/uploads/ans.pdf" });
    const res = await submitStudentEssayAnswer(5, 11, fakeFile);
    expect(studentServices.submitEssayAnswer).toHaveBeenCalledWith(5, 11, fakeFile);
    expect(res.success).toBe(true);
  });

  it("fetchExamReview forwards attemptId to service", async () => {
    studentServices.getExamReview.mockResolvedValueOnce({ total_degree: 50 });
    const res = await fetchExamReview(777);
    expect(studentServices.getExamReview).toHaveBeenCalledWith(777);
    expect(res.success).toBe(true);
  });

  it("downloadAssignmentFile forwards assignmentId to service", async () => {
    studentServices.downloadAssignment.mockResolvedValueOnce(new Blob(["test"]));
    const res = await downloadAssignmentFile(88);
    expect(studentServices.downloadAssignment).toHaveBeenCalledWith(88);
    expect(res.success).toBe(true);
  });

  it("submitStudentAssignment forwards assignmentId and file to service", async () => {
    const fakeFile = new File(["hw"], "homework.pdf", { type: "application/pdf" });
    studentServices.submitAssignment.mockResolvedValueOnce({ id: 1 });
    const res = await submitStudentAssignment(88, fakeFile);
    expect(studentServices.submitAssignment).toHaveBeenCalledWith(88, fakeFile);
    expect(res.success).toBe(true);
  });

  it("updateStudentAssignment forwards assignmentId and file to service", async () => {
    const fakeFile = new File(["hw2"], "homework2.pdf", { type: "application/pdf" });
    studentServices.updateAssignmentSubmission.mockResolvedValueOnce({ id: 1 });
    const res = await updateStudentAssignment(88, fakeFile);
    expect(studentServices.updateAssignmentSubmission).toHaveBeenCalledWith(88, fakeFile);
    expect(res.success).toBe(true);
  });

  it("fetchSubmissions forwards month and page to service", async () => {
    studentServices.getSubmissions.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const res = await fetchSubmissions("2026-10", 2);
    expect(studentServices.getSubmissions).toHaveBeenCalledWith("2026-10", 2);
    expect(res.success).toBe(true);
  });

  it("downloadSubmissionFile forwards submissionId to service", async () => {
    studentServices.downloadSubmissionFile.mockResolvedValueOnce(new Blob(["sub"]));
    const res = await downloadSubmissionFile(999);
    expect(studentServices.downloadSubmissionFile).toHaveBeenCalledWith(999);
    expect(res.success).toBe(true);
  });
});
