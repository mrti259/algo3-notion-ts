import { Schema, TitleProperty } from "../shared/Schema";
import { Service } from "../shared/Service";

export interface Exam {
  exam_name: string;
}

export const examSchema = new Schema<Exam>({
  exam_name: new TitleProperty("Nombre"),
});

export class ExamService extends Service<Exam> {
  protected schema = examSchema;

  async getExam(exam_name: string) {
    const results = await this.repository.query({
      exam_name: [exam_name],
    });
    return results.length ? results[0] : null;
  }
}
