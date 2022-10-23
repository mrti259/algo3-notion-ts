import { context, test, assert } from "../../shared";

const service = context.exerciseFeedbacks;
const exercise_id = "11c2e584fd3541349ab7afdee24fae0e";
const teacher_id = "f69fcfc2c08f4b78a9890a0f2bb5e76a";

test("Get feedbacks without filters", async function () {
  const results = await service.getFeedbacks({});
  assert(results.length === 3);
});

test("Get exercises feedbacks with exercise_id", async function () {
  const results = await service.getFeedbacks({
    exercise_id: [exercise_id],
  });
  assert(results.length === 1, "There should be one result");
});

test("Get exercises feedbacks with teacher_id", async function () {
  const results = await service.getFeedbacks({
    teacher_id: [teacher_id],
  });
  assert(results.length === 1, "There should be one result");
});

test("Create exercise feedback", async function () {
  const feedbacks = await service.createFeedbacks([
    {
      exercise_id: exercise_id,
      teacher_id,
      group_name: "Test",
    },
  ]);
  assert(feedbacks.length === 1, "One feedback is created");

  const results = await service.getFeedbacks({
    teacher_id: [teacher_id],
  });
  assert(results.length === 2, "There should be two result");

  await service.deleteFeedbacks(feedbacks);
});

test("Update exercise feedback", async function () {
  const createFeedbacksResponse = await service.createFeedbacks([
    {
      group_name: "Test",
    },
  ]);

  const updateFeedbacksRequest = createFeedbacksResponse.map((f) => ({
    id: f.id,
    group_name: "Test2",
    teacher_id: teacher_id,
  }));

  const updateFeedbackResponse = await service.updateFeedbacks(
    updateFeedbacksRequest
  );
  assert(createFeedbacksResponse.find((f) => f.group_name === "Test"));
  assert(updateFeedbackResponse.find((f) => f.group_name === "Test2"));
  assert(createFeedbacksResponse[0].id === updateFeedbackResponse[0].id);

  await service.deleteFeedbacks(createFeedbacksResponse);
});
