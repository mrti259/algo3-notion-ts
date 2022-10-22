import {
  AttributesOnFilter,
  Filter,
  Identificable,
  Properties,
  Page,
} from "../shared/NotionRepository";
import { Schema } from "../shared/Schema";

export interface Teacher {
  teacher_name: string;
}

export const TeacherSchema = new (class extends Schema<Teacher> {
  mapFilter({ teacher_name }: AttributesOnFilter<Teacher>): Filter | null {
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

  mapProperties(model: Identificable<Teacher>): Properties {
    return {};
  }

  mapPage(page: Page): Identificable<Teacher> {
    const id = page.id;
    const properties = (page as any).properties;
    const teacher_name = properties["Nombre"].title.reduce(
      (str: string, text: any) => str + text.plain_text,
      ""
    );
    return { id, teacher_name };
  }
})();
