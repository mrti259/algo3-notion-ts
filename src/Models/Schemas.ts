import { Schema } from "./NotionRepository";
import type {
  AttributesOnFilter,
  Filter,
  Model,
  Page,
  Properties,
} from "./NotionRepository";

export interface Exercise {
  exercise_name: string;
}

export const ExerciseSchema = new (class extends Schema<Exercise> {
  mapFilter({ exercise_name }: AttributesOnFilter<Exercise>): Filter | null {
    const exercise_name_filter: Filter | null = exercise_name?.length
      ? {
          or: exercise_name.map((name) => ({
            property: "Nombre",
            title: name ? { equals: name } : { is_empty: true },
          })),
        }
      : null;

    const filters: Filter[] = [exercise_name_filter!].filter((f) => f !== null);

    if (!filters.length) return null;

    return { and: filters } as Filter;
  }
  mapProperties(model: Model<Exercise>): Properties {
    return {};
  }
  mapPage(page: Page): Model<Exercise> {
    return { id: page.id.replace(/-/g, "") };
  }
})();

export interface Teacher {
  teacher_name: string;
  user_id: string;
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

  mapProperties(model: Model<Teacher>): Properties {
    return {};
  }

  mapPage(page: Page): Model<Teacher> {
    const id = page.id.replace(/-/g, "");
    const properties = (page as any).properties;
    const teacher_name = properties["Nombre"].title.reduce(
      (str: string, text: any) => str + text.plain_text,
      ""
    );
    const user_id = properties["Usuario"].people[0]?.id?.replace(/-/g, "");
    return { id, teacher_name, user_id };
  }
})();

export interface Feedback {
  group_name: string;
  teacher_id: string;
  exercise_id: string;
}

export const FeedbackSchema = new (class extends Schema<Feedback> {
  mapFilter({
    group_name,
    exercise_id,
    teacher_id,
  }: AttributesOnFilter<Feedback>): Filter | null {
    const group_filter = group_name?.length
      ? {
          or: group_name.map((name) => ({
            property: "Nombre",
            title: { equals: name },
          })),
        }
      : null;
    const exercise_filter = exercise_id?.length
      ? {
          or: exercise_id.map((id) => ({
            property: "Ejercicio",
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

    const filters = [group_filter!, exercise_filter!, teacher_filter!].filter(
      (f) => f !== null
    );

    const filter = { and: filters };

    return filter as Filter;
  }

  mapProperties({
    group_name,
    teacher_id,
    exercise_id,
  }: Model<Feedback>): Properties {
    const properties: {
      Grupo?: { title: [{ text: { content: string } }] };
      Corrector?: { relation: [{ id: string }] };
      Ejercicio?: { relation: [{ id: string }] };
    } = {};

    if (group_name) {
      properties["Grupo"] = { title: [{ text: { content: group_name } }] };
    }

    if (teacher_id) {
      properties["Corrector"] = { relation: [{ id: teacher_id }] };
    }

    if (exercise_id) {
      properties["Ejercicio"] = { relation: [{ id: exercise_id }] };
    }

    return properties as Properties;
  }

  mapPage(page: Page): Model<Feedback> {
    const id = page.id.replace(/-/g, "");
    const { properties } = page as any;

    const group_name = (properties["Grupo"] as any).title.reduce(
      (str: string, text: any) => str + text.plain_text,
      ""
    );

    const teacher_id = (
      properties["Corrector"] as any
    ).relation[0]?.id?.replace(/-/g, "");

    const exercise_id = (
      properties["Ejercicio"] as any
    ).relation[0]?.id?.replace(/-/g, "");

    return { id, group_name, teacher_id, exercise_id };
  }
})();
