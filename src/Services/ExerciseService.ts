import { NotionService } from "./NotionService";
import type { Exercise } from "../Models/Schemas";

export class ExerciseService extends NotionService<Exercise> {
  async getExercise(exercise_name: string) {
    const results = await this.repository.query({
      exercise_name: [exercise_name],
    });
    return results.length ? results[0] : null;
  }
}
