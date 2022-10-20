import { Client } from "@notionhq/client";
import { ExerciseService } from "./ExerciseService";
import { FeedbackService } from "./FeedbackService";
import { TeacherService } from "./TeacherService";

export class ServiceContext {
  secret_key: string;
  private client: Client;

  constructor(
    private config: {
      notion_auth: string;
      exercise_db: string;
      teachers_db: string;
      feedback_db: string;
      secret_key: string;
    }
  ) {
    this.client = new Client({ auth: config.notion_auth });
    this.secret_key = config.secret_key;
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
