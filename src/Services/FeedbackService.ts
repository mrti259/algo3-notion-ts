import { NotionService } from "./NotionService";
import type { Feedback } from "../Models/Schemas";
import type { AllowUndefined, Model } from "../Models/NotionRepository";

export class FeedbackService extends NotionService<Feedback> {
  async getFeedbacks({
    groups_name,
    exercises_id,
    teachers_id,
  }: {
    groups_name?: string[];
    exercises_id?: string[];
    teachers_id?: string[];
  }) {
    return await this.repository.query({
      group_name: groups_name,
      exercise_id: exercises_id,
      teacher_id: teachers_id,
    });
  }

  async deleteFeedbacks(feedbacks: { id: string }[]) {
    return await this.repository.delete(feedbacks);
  }

  async createFeedbacks(feedbacks: AllowUndefined<Feedback>[]) {
    return await this.repository.create(feedbacks);
  }

  async updateFeedbacks(feedbacks: Model<Feedback>[]) {
    return await this.repository.update(feedbacks);
  }
}
