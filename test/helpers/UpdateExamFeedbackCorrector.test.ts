import { UpdateExamFeedbackCorrector } from "../../src/helpers/UpdateExamFeedbackCorrector";
import { context, test, assert } from "../shared";

const exam_name = "Parcial II";

async function setUp() {
  const exam = await context.exams.getExam(exam_name);

  const feedbacksToBeRestored = await context.examFeedbacks.getFeedbacks({
    exam_id: [exam!.id],
  });

  return async function () {
    const restoredFeedbacksIds = (
      await context.examFeedbacks.updateFeedbacks(feedbacksToBeRestored)
    ).map((f) => f.id);

    const feedbacksToBeDeleted = (
      await context.examFeedbacks.getFeedbacks({
        exam_id: [exam!.id],
      })
    ).filter((f) => !restoredFeedbacksIds.includes(f.id));

    await context.examFeedbacks.deleteFeedbacks(feedbacksToBeDeleted);
  };
}

async function testCreateAndUpdateExamFeedbacks() {
  const { ok } = await UpdateExamFeedbackCorrector.run(context, exam_name, [
    { student_name: "0001 - Estudiante 1", teacher_name: "Viktor Hargreeves" },
    { student_name: "0002 - Estudiante 2", teacher_name: "Klaus Hargreeves" },
    { student_name: "0003 - Estudiante 3", teacher_name: "Diego Hargreeves" },
  ]);
  assert(ok);
}

test("UpdateExamFeedbackCorrector creates and updates feedbacks", async function () {
  const tearDown = await setUp();
  await testCreateAndUpdateExamFeedbacks();
  await tearDown();
});
