import { NotionService } from "../shared/NotionService";
import { Exam, ExamSchema } from "./schemas";

export class ExamService extends NotionService<Exam> {
  protected schema = ExamSchema;

  async getExam(exam_name: string) {
    const results = await this.repository.query({
      exam_name: [exam_name],
    });
    return results.length ? results[0] : null;
  }
}
