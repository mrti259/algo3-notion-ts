import { UpdateFeedbackCorrector } from "../../src/UseCases/UpdateFeedbackCorrector";
import { context, test, assert } from "../Shared";

async function runBeforeTest() {
  const exercise = await context.exercises.getExercise("Números");

  const feedbacksToBeRestored = await context.feedbacks.getFeedbacks({
    exercise_id: [exercise!.id],
  });

  return async function () {
    const restoredFeedbacksIds = (
      await context.feedbacks.updateFeedbacks(feedbacksToBeRestored)
    ).map((f) => f.id);

    const feedbacksToBeDeleted = (
      await context.feedbacks.getFeedbacks({
        exercise_id: [exercise!.id],
      })
    ).filter((f) => !restoredFeedbacksIds.includes(f.id));

    await context.feedbacks.deleteFeedbacks(feedbacksToBeDeleted);
  };
}

async function testUseCase() {
  const ok = await new UpdateFeedbackCorrector(context).run("Números", [
    { group_name: "Grupo 1", teacher_name: "Viktor Hargreeves" },
    { group_name: "Grupo 2", teacher_name: "Klaus Hargreeves" },
    { group_name: "Grupo 3", teacher_name: "Diego Hargreeves" },
  ]);
  assert(ok);
}

test("UpdateFeedbackCorrector creates and updates feedbacks", async function () {
  const tearDown = await runBeforeTest();
  await testUseCase();
  await tearDown();
});
