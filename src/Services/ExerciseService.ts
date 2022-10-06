import { NotionService } from "./NotionService";
import type {
  Model,
  AttributesOnFilter,
  Filter,
  Page,
  Properties,
} from "./NotionService";

interface Exercise {
  exercise_name: string;
}

export class ExerciseService extends NotionService<Exercise> {
  protected mapFilter({
    exercise_name,
  }: AttributesOnFilter<Exercise>): Filter | null {
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
  protected mapProperties(model: Model<Exercise>): Properties {
    return {};
  }
  protected mapPage(page: Page): Model<Exercise> {
    return { id: page.id.replace(/-/g, "") };
  }

  async getExercise(exercise_name: string) {
    const results = await this.query({ exercise_name: [exercise_name] });
    return results.length ? results[0] : null;
  }
}
