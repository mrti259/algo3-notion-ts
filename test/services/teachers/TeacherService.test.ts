import { context, test, assert } from "../../shared";

const service = context.teachers;

test("Get all teachers", async function () {
  const results = await service.getTeachers([]);
  assert(results.length === 3, "There should be 3 teachers");
});

test("Filter teachers by name get 0 results", async function () {
  const results = await service.getTeachers(["Viktor"]);
  assert(results.length === 0, "There should be 0 teachers named Viktor");
});

test("Filter teachers by name get 1 result", async function () {
  const results = await service.getTeachers(["Viktor Hargreeves"]);
  assert(results.length === 1, "There should be one teacher");
  assert(
    results.find((t) => t.teacher_name === "Viktor Hargreeves"),
    "One teacher should be Viktor Hargreeves"
  );
});

test("Filter teachers by name get many result", async function () {
  const results = await service.getTeachers([
    "Viktor Hargreeves",
    "Klaus Hargreeves",
  ]);
  assert(results.length === 2, "There should be two teachers");
  assert(
    results.find((t) => t.teacher_name === "Viktor Hargreeves"),
    "One teacher should be Viktor Hargreeves"
  );
  assert(
    results.find((t) => t.teacher_name === "Klaus Hargreeves"),
    "One teacher should be Klaus Hargreeves"
  );
});
