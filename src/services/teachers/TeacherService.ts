import { NotionService } from "../shared/NotionService";
import { Teacher, TeacherSchema } from "./schemas";

export class TeacherService extends NotionService<Teacher> {
  protected schema = TeacherSchema;

  async getTeachers(teacher_name: string[]) {
    return await this.repository.query({ teacher_name });
  }
}
