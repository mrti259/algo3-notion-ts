import type {
  AttributesOnFilter,
  Identificable,
} from "../shared/NotionRepository";
import { NotionService } from "../shared/NotionService";
import { RelationProperty, Schema, TitleProperty } from "../shared/Schema";

export interface ExamFeedback {
  student_name: string;
  teacher_id: string;
  exam_id: string;
}

export const examFeedbackSchema = new Schema<ExamFeedback>({
  student_name: new TitleProperty("Nombre"),
  exam_id: new RelationProperty("Examen"),
  teacher_id: new RelationProperty("Corrector"),
});

export class ExamFeedbackService extends NotionService<ExamFeedback> {
  protected schema = examFeedbackSchema;

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
