import { UpdateExerciseFeedbackCorrector } from "../../src/use-cases/UpdateExerciseFeedbackCorrector";
import { context, test, assert } from "../shared";

async function runBeforeTest() {
  const exercise = await context.exercises.getExercise("Números");

  const feedbacksToBeRestored = await context.exerciseFeedbacks.getFeedbacks({
    exercise_id: [exercise!.id],
  });

  return async function () {
    const restoredFeedbacksIds = (
      await context.exerciseFeedbacks.updateFeedbacks(feedbacksToBeRestored)
    ).map((f) => f.id);

    const feedbacksToBeDeleted = (
      await context.exerciseFeedbacks.getFeedbacks({
        exercise_id: [exercise!.id],
      })
    ).filter((f) => !restoredFeedbacksIds.includes(f.id));

    await context.exerciseFeedbacks.deleteFeedbacks(feedbacksToBeDeleted);
  };
}

async function testCreateAndUpdateExerciseFeedbacks() {
  const ok = await UpdateExerciseFeedbackCorrector.run(context, "Números", [
    { group_name: "Grupo 1", teacher_name: "Viktor Hargreeves" },
    { group_name: "Grupo 2", teacher_name: "Klaus Hargreeves" },
    { group_name: "Grupo 3", teacher_name: "Diego Hargreeves" },
  ]);
  assert(ok);
}

test("UpdateFeedbackCorrector creates and updates feedbacks", async function () {
  const tearDown = await runBeforeTest();
  await testCreateAndUpdateExerciseFeedbacks();
  await tearDown();
});
