import type {
  AttributesOnFilter,
  Identificable,
} from "../shared/NotionRepository";
import { NotionService } from "../shared/NotionService";
import { RelationProperty, Schema, TitleProperty } from "../shared/Schema";

export interface ExerciseFeedback {
  group_name: string;
  teacher_id: string;
  exercise_id: string;
}

export const exerciseFeedbackSchema = new Schema<ExerciseFeedback>({
  group_name: new TitleProperty("Nombre"),
  exercise_id: new RelationProperty("Ejercicio"),
  teacher_id: new RelationProperty("Corrector"),
});

export class ExerciseFeedbackService extends NotionService<ExerciseFeedback> {
  protected schema = exerciseFeedbackSchema;

  async getFeedbacks(attributes: AttributesOnFilter<ExerciseFeedback>) {
    return await this.repository.query(attributes);
  }

  async createFeedbacks(feedbacks: Partial<ExerciseFeedback>[]) {
    return await this.repository.create(feedbacks);
  }

  async updateFeedbacks(feedbacks: Identificable<ExerciseFeedback>[]) {
    return await this.repository.update(feedbacks);
  }

  async deleteFeedbacks(feedbacks: Identificable<ExerciseFeedback>[]) {
    return await this.repository.delete(feedbacks);
  }
}
