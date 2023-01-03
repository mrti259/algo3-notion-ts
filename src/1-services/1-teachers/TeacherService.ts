import { NotionService } from "../shared/NotionService";
import { Schema, TitleProperty } from "../shared/Schema";

export interface Teacher {
  teacher_name: string;
}

export const teacherSchema = new Schema<Teacher>({
  teacher_name: new TitleProperty("Nombre"),
});

export class TeacherService extends NotionService<Teacher> {
  protected schema = teacherSchema;

  async getTeachers(teacher_name: string[]) {
    return await this.repository.query({ teacher_name });
  }
}
