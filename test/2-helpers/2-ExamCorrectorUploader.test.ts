import { ExamCorrectorUploader } from "../../src/2-helpers/2-ExamCorrectorUploader";
import { assert, context, test } from "../shared";

const exam_name = "Parcial II";

async function setUp() {
  const examService = context.exams();
  const feedbackService = context.examFeedbacks();

  const exam = await examService.getExam(exam_name);

  const feedbacksToBeRestored = await feedbackService.getFeedbacks({
    exam_id: [exam!.id],
  });

  return async function () {
    const restoredFeedbacksIds = (
      await feedbackService.updateFeedbacks(feedbacksToBeRestored)
    ).map((f) => f.id);

    const feedbacksToBeDeleted = (
      await feedbackService.getFeedbacks({
        exam_id: [exam!.id],
      })
    ).filter((f) => !restoredFeedbacksIds.includes(f.id));

    await feedbackService.deleteFeedbacks(feedbacksToBeDeleted);
  };
}

async function testCreateAndUpdateExamFeedbacks() {
  const { ok } = await ExamCorrectorUploader.upload(context, exam_name, [
    {
      student_name: "0001 - Estudiante 1",
      teacher_name: "Viktor Hargreeves",
    },
    {
      student_name: "0002 - Estudiante 2",
      teacher_name: "Klaus Hargreeves",
    },
    {
      student_name: "0003 - Estudiante 3",
      teacher_name: "Diego Hargreeves",
    },
  ]);
  assert(ok);
}

test("UpdateExamFeedbackCorrector creates and updates feedbacks", async function () {
  const tearDown = await setUp();
  await testCreateAndUpdateExamFeedbacks();
  await tearDown();
});
