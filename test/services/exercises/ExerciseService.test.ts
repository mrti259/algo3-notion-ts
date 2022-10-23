import { context, test, assert } from "../../shared";

const service = context.exercises;

test("Get exercise by name", async function () {
  const exercise = await service.getExercise("Saga II");
  assert(
    exercise?.exercise_name === "Saga II",
    "Exercise should be named Saga II"
  );
});

test("Get null when there's no exercise with the given name", async function () {
  const exercise = await service.getExercise("");
  assert(exercise === null, "Exercise should be null");
});
