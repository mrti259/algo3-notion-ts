import { NotionService } from "./NotionService";
import type {
  AttributesOnFilter,
  Filter,
  Model,
  Page,
  Properties,
} from "./NotionService";

interface Feedback {
  group_name: string;
  exercise_id: string;
  teacher_id: string;
}

export class FeedbackService extends NotionService<Feedback> {
  protected mapFilter({
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

  protected mapProperties({
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

  protected mapPage(page: Page): Model<Feedback> {
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

  async getFeedbacks({
    groups_name,
    exercises_id,
    teachers_id,
  }: {
    groups_name?: string[];
    exercises_id?: string[];
    teachers_id?: string[];
  }) {
    return await this.query({
      group_name: groups_name,
      exercise_id: exercises_id,
      teacher_id: teachers_id,
    });
  }

  async deleteFeedbacks(feedbacks: { id: string }[]) {
    return await this.delete(feedbacks);
  }

  async createFeedbacks(
    feedbacks: {
      group_name?: string;
      exercise_id?: string;
      teacher_id?: string;
    }[]
  ) {
    return await this.create(feedbacks);
  }

  async updateFeedbacks(
    feedbacks: {
      id: string;
      group_name?: string;
      exercise_id?: string;
      teacher_id?: string;
    }[]
  ) {
    return await this.update(feedbacks);
  }
}
