import { NotionService } from "../shared/NotionService";
import { ExerciseFeedback, ExerciseFeedbackSchema } from "./schemas";
import type {
  AttributesOnFilter,
  Identificable,
} from "../shared/NotionRepository";

export class ExerciseFeedbackService extends NotionService<ExerciseFeedback> {
  protected schema = ExerciseFeedbackSchema;

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
