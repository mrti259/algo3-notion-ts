import { context, test, assert } from "../../shared";

const service = context.exams;

test("Get exam by name", async function () {
  const exam_name = "Parcial I";
  const exam = await service.getExam(exam_name);
  assert(exam?.exam_name === exam_name, `exam should be named ${exam_name}`);
});

test("Get null when there's no exam with the given name", async function () {
  const exam = await service.getExam("");
  assert(exam === null, "exam should be null");
});
