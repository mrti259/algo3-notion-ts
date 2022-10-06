import { NotionService } from "./NotionService";
import type {
  AttributesOnFilter,
  Filter,
  Model,
  Page,
  Properties,
} from "./NotionService";

interface Teacher {
  teacher_name: string;
  user_id: string;
}

export class TeacherService extends NotionService<Teacher> {
  protected mapFilter({
    teacher_name,
  }: AttributesOnFilter<Teacher>): Filter | null {
    const teacher_name_filter: Filter | null = teacher_name?.length
      ? {
          or: teacher_name.map((name) => ({
            property: "Nombre",
            title: name ? { equals: name } : { is_empty: true },
          })),
        }
      : null;

    const filters: Filter[] = [teacher_name_filter!].filter((f) => f !== null);

    if (!filters.length) return null;

    return { and: filters } as Filter;
  }

  protected mapProperties(model: Model<Teacher>): Properties {
    return {};
  }

  protected mapPage(page: Page): Model<Teacher> {
    const id = page.id.replace(/-/g, "");
    const properties = (page as any).properties;
    const teacher_name = properties["Nombre"].title.reduce(
      (str: string, text: any) => str + text.plain_text,
      ""
    );
    const user_id = properties["Usuario"].people[0]?.id?.replace(/-/g, "");
    return { id, teacher_name, user_id };
  }

  async getTeacher(teacher_name: string) {
    const results = await this.getTeachers([teacher_name]);
    return results.length ? results[0] : null;
  }

  async getTeachers(teachers_name: string[]) {
    return await this.query({ teacher_name: teachers_name });
  }
}
