import { Schema, TitleProperty } from "../shared/Schema";
import { Service } from "../shared/Service";

export interface Teacher {
  teacher_name: string;
}

export const teacherSchema = new Schema<Teacher>({
  teacher_name: new TitleProperty("Nombre"),
});

export class TeacherService extends Service<Teacher> {
  protected schema = teacherSchema;

  async getTeachers(teacher_name: string[]) {
    return await this.repository.query({ teacher_name });
  }
}
