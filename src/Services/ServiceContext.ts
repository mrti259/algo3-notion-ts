import { Client } from "@notionhq/client";
import { ExerciseService } from "./ExerciseService";
import { FeedbackService } from "./FeedbackService";
import { TeacherService } from "./TeacherService";

export class ServiceContext {
  private client: Client;

  constructor(
    private config: {
      notion_auth: string;
      exercise_db: string;
      teachers_db: string;
      feedback_db: string;
    }
  ) {
    this.client = new Client({ auth: config.notion_auth });
  }

  get exercises() {
    return new ExerciseService(this.client, this.config.exercise_db);
  }

  get teachers() {
    return new TeacherService(this.client, this.config.teachers_db);
  }

  get feedbacks() {
    return new FeedbackService(this.client, this.config.feedback_db);
  }
}
