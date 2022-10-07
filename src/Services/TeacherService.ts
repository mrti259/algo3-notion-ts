import { NotionService } from "./NotionService";
import type { Teacher } from "../Models/Schemas";

export class TeacherService extends NotionService<Teacher> {
  async getTeacher(teacher_name: string) {
    const results = await this.getTeachers([teacher_name]);
    return results.length ? results[0] : null;
  }

  async getTeachers(teachers_name: string[]) {
    return await this.repository.query({ teacher_name: teachers_name });
  }
}
