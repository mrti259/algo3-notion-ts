import { Schema } from "../shared/Schema";
import type {
  AttributesOnFilter,
  Filter,
  Identificable,
  Page,
  Properties,
} from "../shared/NotionRepository";

export interface Exam {
  exam_name: string;
}

export const ExamSchema = new (class extends Schema<Exam> {
  mapFilter({ exam_name }: AttributesOnFilter<Exam>): Filter | null {
    const exam_name_filter: Filter | null = exam_name?.length
      ? {
          or: exam_name.map((name) => ({
            property: "Nombre",
            title: name ? { equals: name } : { is_empty: true },
          })),
        }
      : null;

    const filters: Filter[] = [exam_name_filter!].filter((f) => f !== null);

    if (!filters.length) return null;

    return { and: filters } as Filter;
  }
  mapProperties(model: Identificable<Exam>): Properties {
    return {};
  }
  mapPage(page: Page): Identificable<Exam> {
    const properties = (page as any).properties;
    const exam_name = properties["Nombre"].title.reduce(
      (str: string, text: any) => str + text.plain_text,
      ""
    );
    return { id: page.id, exam_name };
  }
})();

export interface ExamFeedback {
  student_name: string;
  teacher_id: string;
  exam_id: string;
}

export const ExamFeedbackSchema = new (class extends Schema<ExamFeedback> {
  mapFilter({
    student_name,
    exam_id,
    teacher_id,
  }: AttributesOnFilter<ExamFeedback>): Filter | null {
    const group_filter = student_name?.length
      ? {
          or: student_name.map((name) => ({
            property: "Nombre",
            title: { equals: name },
          })),
        }
      : null;
    const exam_filter = exam_id?.length
      ? {
          or: exam_id.map((id) => ({
            property: "Examen",
            relation: { contains: id },
          })),
        }
      : null;
    const teacher_filter = teacher_id?.length
      ? {
          or: teacher_id.map((id) => ({
            property: "Corrector",
            relation: { contains: id },
          })),
        }
      : null;

    const filters = [group_filter!, exam_filter!, teacher_filter!].filter(
      (f) => f !== null
    );

    const filter = { and: filters };

    return filter as Filter;
  }

  mapProperties({
    student_name: group_name,
    teacher_id,
    exam_id,
  }: Identificable<ExamFeedback>): Properties {
    const properties: {
      Nombre?: { title: [{ text: { content: string } }] };
      Corrector?: { relation: [{ id: string }] };
      Examen?: { relation: [{ id: string }] };
    } = {};

    if (group_name) {
      properties["Nombre"] = { title: [{ text: { content: group_name } }] };
    }

    if (teacher_id) {
      properties["Corrector"] = { relation: [{ id: teacher_id }] };
    }

    if (exam_id) {
      properties["Examen"] = { relation: [{ id: exam_id }] };
    }

    return properties as Properties;
  }

  mapPage(page: Page): Identificable<ExamFeedback> {
    const id = page.id;
    const { properties } = page as any;

    const student_name = (properties["Nombre"] as any).title.reduce(
      (str: string, text: any) => str + text.plain_text,
      ""
    );

    const teacher_id = (properties["Corrector"] as any).relation[0]?.id;

    const exam_id = (properties["Examen"] as any).relation[0]?.id;

    return {
      id,
      student_name,
      teacher_id,
      exam_id,
    };
  }
})();
