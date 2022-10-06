import { Client } from "@notionhq/client";
import { ExerciseService } from "./ExerciseService";
import { FeedbackService } from "./FeedbackService";
import { TeacherService } from "./TeacherService";

export class NotionContext {
  exercises: ExerciseService;
  teachers: TeacherService;
  feedbacks: FeedbackService;

  constructor({
    notion_auth: auth,
    exercise_db,
    teachers_db,
    feedback_db,
  }: {
    notion_auth: string;
    exercise_db: string;
    teachers_db: string;
    feedback_db: string;
  }) {
    const client = new Client({ auth });
    this.exercises = new ExerciseService(client, exercise_db);
    this.teachers = new TeacherService(client, teachers_db);
    this.feedbacks = new FeedbackService(client, feedback_db);
  }
}
