import { NotionService } from "../shared/NotionService";
import { Exercise, ExerciseSchema } from "./schemas";

export class ExerciseService extends NotionService<Exercise> {
  protected schema = ExerciseSchema;

  async getExercise(exercise_name: string) {
    const results = await this.repository.query({
      exercise_name: [exercise_name],
    });
    return results.length ? results[0] : null;
  }
}
