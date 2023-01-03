import { Client } from "@notionhq/client";
import { default as assert } from "assert";

import { TeacherService } from "./1-teachers/TeacherService";
import { ExerciseFeedbackService } from "./2-exercises/ExerciseFeedbackService";
import { ExerciseService } from "./2-exercises/ExerciseService";
import { ExamFeedbackService } from "./3-exams/ExamFeedbackService";
import { ExamService } from "./3-exams/ExamService";
import { NotificationService } from "./4-notifications/NotificationService";

export class ServiceContext {
  private client: Client;

  constructor(
    public config: {
      secret_key: string;
      slack_token: string;
      default_channel: string;
      notion_key: string;
      teachers_db: string;
      examfeedback_db: string;
      exam_db: string;
      exercise_db: string;
      exercisefeedback_db: string;
    },
  ) {
    this.client = new Client({ auth: config.notion_key });
  }

  get exercises() {
    return new ExerciseService(this.client, this.config.exercise_db);
  }

  get teachers() {
    return new TeacherService(this.client, this.config.teachers_db);
  }

  get exerciseFeedbacks() {
    return new ExerciseFeedbackService(
      this.client,
      this.config.exercisefeedback_db,
    );
  }

  get exams() {
    return new ExamService(this.client, this.config.exam_db);
  }

  get examFeedbacks() {
    return new ExamFeedbackService(this.client, this.config.examfeedback_db);
  }

  get notifications() {
    return new NotificationService(
      this.config.slack_token,
      this.config.default_channel,
    );
  }

  static loadFromEnvVars() {
    return new ServiceContext({
      secret_key: getEnvVar("SECRET_KEY"),
      slack_token: getEnvVar("SLACK_TOKEN"),
      default_channel: getEnvVar("DEFAULT_CHANNEL"),
      notion_key: getEnvVar("NOTION_KEY"),
      teachers_db: getEnvVar("TEACHER_DB"),
      exam_db: getEnvVar("EXAM_DB"),
      examfeedback_db: getEnvVar("EXAMFEEDBACK_DB"),
      exercise_db: getEnvVar("EXERCISE_DB"),
      exercisefeedback_db: getEnvVar("EXERCISEFEEDBACK_DB"),
    });
  }
}

function getEnvVar(env_var: string) {
  const value = process.env[env_var];
  assert(!!value, `${env_var} should be defined`);
  return value;
}
