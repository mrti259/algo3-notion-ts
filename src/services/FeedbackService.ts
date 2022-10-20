import { NotionService } from "./NotionService";
import { Feedback, FeedbackSchema } from "../models/Schemas";
import type {
  AttributesOnFilter,
  Identificable,
  Model,
} from "../models/NotionRepository";

export class FeedbackService extends NotionService<Feedback> {
  protected schema = FeedbackSchema;

  async getFeedbacks(attributes: AttributesOnFilter<Feedback>) {
    return await this.repository.query(attributes);
  }

  async createFeedbacks(feedbacks: Model<Feedback>[]) {
    return await this.repository.create(feedbacks);
  }

  async updateFeedbacks(feedbacks: Identificable<Feedback>[]) {
    return await this.repository.update(feedbacks);
  }

  async deleteFeedbacks(feedbacks: Identificable<Feedback>[]) {
    return await this.repository.delete(feedbacks);
  }
}
