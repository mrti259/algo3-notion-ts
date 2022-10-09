import { config } from "dotenv";
import { ServiceContext } from "../Services/ServiceContext";

config();
const notion_auth = process.env["NOTION_AUTH"]!;
const exercise_db = process.env["EXERCISE_DB"]!;
const teachers_db = process.env["TEACHERS_DB"]!;
const feedback_db = process.env["FEEDBACK_DB"]!;

export const context = new ServiceContext({
  notion_auth,
  exercise_db,
  teachers_db,
  feedback_db,
});
