import { NotionService } from "./NotionService";

export class ExerciseService extends NotionService {
  async getExercise(exercise_name: string) {
    const { results } = await this.client.databases.query({
      database_id: this.database_id,
      filter: {
        property: "Nombre",
        title: {
          equals: exercise_name,
        },
      },
    });

    return results.length ? this.transform(results[0]) : null;
  }
}
