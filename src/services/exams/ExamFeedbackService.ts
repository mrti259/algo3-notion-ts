import { NotionService } from "../shared/NotionService";
import { ExamFeedback, ExamFeedbackSchema } from "./schemas";
import type {
  AttributesOnFilter,
  Identificable,
} from "../shared/NotionRepository";

export class ExamFeedbackService extends NotionService<ExamFeedback> {
  protected schema = ExamFeedbackSchema;

  async getFeedbacks(attributes: AttributesOnFilter<ExamFeedback>) {
    return await this.repository.query(attributes);
  }

  async createFeedbacks(feedbacks: Partial<ExamFeedback>[]) {
    return await this.repository.create(feedbacks);
  }

  async updateFeedbacks(feedbacks: Identificable<ExamFeedback>[]) {
    return await this.repository.update(feedbacks);
  }

  async deleteFeedbacks(feedbacks: Identificable<ExamFeedback>[]) {
    return await this.repository.delete(feedbacks);
  }
}
