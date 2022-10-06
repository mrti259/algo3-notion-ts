import { default as assert } from "assert";
import { default as baretest } from "baretest";
import { config } from "dotenv";
import { NotionContext } from "../../src/Services/NotionServiceContext";

const test = baretest("MyApp");

config({ path: ".env.test" });
const notion_auth = process.env["NOTION_AUTH"]!;
const exercise_db = process.env["EXERCISE_DB"]!;
const teachers_db = process.env["TEACHERS_DB"]!;
const feedback_db = process.env["FEEDBACK_DB"]!;

test("Import .env", function () {
  assert(!!notion_auth, "notion_auth should be defined");
  assert(!!exercise_db, "exercise_db should be defined");
  assert(!!teachers_db, "teachers_db should be defined");
  assert(!!feedback_db, "feedback_db should be defined");
});

const context = new NotionContext({
  notion_auth: notion_auth,
  exercise_db,
  teachers_db,
  feedback_db,
});

export { assert, context, test };
