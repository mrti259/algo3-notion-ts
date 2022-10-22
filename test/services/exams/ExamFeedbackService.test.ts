import { context, test, assert } from "../../shared";

const service = context.examFeedbacks;
const exam_id = "711993736cdf410f98398dec7785f5e6";
const teacher_id = "f69fcfc2c08f4b78a9890a0f2bb5e76a";

test("Get exams feedbacks without filters", async function () {
  const results = await service.getFeedbacks({});
  assert(results.length === 3);
});

test("Get exams feedbacks with exam_id", async function () {
  const results = await service.getFeedbacks({
    exam_id: [exam_id],
  });
  assert(results.length === 1, "There should be one result");
});

test("Get exams feedbacks with teacher_id", async function () {
  const results = await service.getFeedbacks({
    teacher_id: [teacher_id],
  });
  assert(results.length === 1, "There should be one result");
});

test("Create exam feedback", async function () {
  const feedbacks = await service.createFeedbacks([
    {
      exam_id: exam_id,
      teacher_id,
      student_name: "Test",
    },
  ]);
  assert(feedbacks.length === 1, "One feedback is created");

  const results = await service.getFeedbacks({
    teacher_id: [teacher_id],
  });
  assert(results.length === 2, "There should be two result");

  await service.deleteFeedbacks(feedbacks);
});

test("Update exam feedback", async function () {
  const createFeedbacksResponse = await service.createFeedbacks([
    {
      student_name: "Test",
    },
  ]);

  const updateFeedbacksRequest = createFeedbacksResponse.map((f) => ({
    id: f.id,
    student_name: "Test2",
    teacher_id: teacher_id,
  }));

  const updateFeedbackResponse = await service.updateFeedbacks(
    updateFeedbacksRequest
  );
  assert(createFeedbacksResponse.find((f) => f.student_name === "Test"));
  assert(updateFeedbackResponse.find((f) => f.student_name === "Test2"));
  assert(createFeedbacksResponse[0].id === updateFeedbackResponse[0].id);

  await service.deleteFeedbacks(createFeedbacksResponse);
});
