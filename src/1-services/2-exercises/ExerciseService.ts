import { NotionService } from "../shared/NotionService";
import { Schema, TitleProperty } from "../shared/Schema";

export interface Exercise {
  exercise_name: string;
}

export const exerciseSchema = new Schema<Exercise>({
  exercise_name: new TitleProperty("Nombre"),
});

export class ExerciseService extends NotionService<Exercise> {
  protected schema = exerciseSchema;

  async getExercise(exercise_name: string) {
    const results = await this.repository.query({
      exercise_name: [exercise_name],
    });
    return results.length ? results[0] : null;
  }
}
