import { ExerciseCorrectorUploader } from "../../src/2-helpers/1-ExerciseCorrectorUploader";
import { assert, context, test } from "../shared";

const exercise_name = "Números";

async function setUp() {
  const exerciseService = context.exercises();
  const feedbackService = context.exerciseFeedbacks();

  const exercise = await exerciseService.getExercise(exercise_name);

  const feedbacksToBeRestored = await feedbackService.getFeedbacks({
    exercise_id: [exercise!.id],
  });

  return async function () {
    const restoredFeedbacksIds = (
      await feedbackService.updateFeedbacks(feedbacksToBeRestored)
    ).map((f) => f.id);

    const feedbacksToBeDeleted = (
      await feedbackService.getFeedbacks({
        exercise_id: [exercise!.id],
      })
    ).filter((f) => !restoredFeedbacksIds.includes(f.id));

    await feedbackService.deleteFeedbacks(feedbacksToBeDeleted);
  };
}

async function testCreateAndUpdateExerciseFeedbacks() {
  const { ok } = await ExerciseCorrectorUploader.upload(
    context,
    exercise_name,
    [
      { group_name: "Grupo 1", teacher_name: "Viktor Hargreeves" },
      { group_name: "Grupo 2", teacher_name: "Klaus Hargreeves" },
      { group_name: "Grupo 3", teacher_name: "Diego Hargreeves" },
    ],
  );
  assert(ok);
}

test("UpdateFeedbackCorrector creates and updates feedbacks", async function () {
  const tearDown = await setUp();
  await testCreateAndUpdateExerciseFeedbacks();
  await tearDown();
});
