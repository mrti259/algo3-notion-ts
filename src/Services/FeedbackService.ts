import { NotionService } from "./NotionService";

export class FeedbackService extends NotionService {
  async getFeedbacks({
    groups_name,
    exercises_id,
    teachers_id,
  }: {
    groups_name?: string[];
    exercises_id?: string[];
    teachers_id?: string[];
  }) {
    const group_filter = groups_name?.length
      ? {
          or: groups_name.map((name) => ({
            property: "Nombre",
            title: { equals: name },
          })),
        }
      : null;
    const exercise_filter = exercises_id?.length
      ? {
          or: exercises_id.map((name) => ({
            property: "Ejercicio",
            relation: { contains: name },
          })),
        }
      : null;
    const teacher_filter = teachers_id?.length
      ? {
          or: teachers_id.map((name) => ({
            property: "Corrector",
            relation: { contains: name },
          })),
        }
      : null;

    const filters = [group_filter!, exercise_filter!, teacher_filter!].filter(
      (f) => f !== null
    );

    const filter = { and: filters };

    const { results } = await this.client.databases.query({
      database_id: this.database_id,
      filter: filter,
    });

    return results.map(this.transform);
  }

  async deleteFeedbacks(feedbacks: { id: string }[]) {
    const responses = await Promise.all(
      feedbacks.map((feedback_id) =>
        this.client.blocks.delete({ block_id: feedback_id.id })
      )
    );

    return responses.map(({ id }) => ({ id }));
  }

  async createFeedbacks(
    feedbacks: {
      group_name?: string;
      exercise_id?: string;
      teacher_id?: string;
    }[]
  ) {
    const responses = await Promise.all(
      feedbacks.map(({ group_name, exercise_id, teacher_id }) => {
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

        return this.client.pages.create({
          parent: { database_id: this.database_id },
          properties,
        });
      })
    );

    return responses.map(this.transform);
  }

  async updateFeedbacks(
    feedbacks: {
      id: string;
      group_name?: string;
      exercise_id?: string;
      teacher_id?: string;
    }[]
  ) {
    const responses = await Promise.all(
      feedbacks.map(({ id, group_name, exercise_id, teacher_id }) => {
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

        return this.client.pages.update({ page_id: id, properties });
      })
    );

    return responses.map(this.transform);
  }

  protected transform({ id, properties }: any) {
    id = id.replace(/-/g, "");
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
}
