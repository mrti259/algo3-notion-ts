import type { Identificable } from "../services/shared/NotionRepository";
import type { ExerciseFeedback } from "../services/exercises/schemas";
import { ServiceContext } from "../services";

export class UpdateExerciseFeedbackCorrector {
  static async run(
    context: ServiceContext,
    exercise_name: string,
    teachers_and_groups: {
      teacher_name: string;
      group_name: string;
    }[]
  ) {
    const teachers_name = teachers_and_groups.map(
      ({ teacher_name }) => teacher_name
    );

    const [exercise, teachers] = await Promise.all([
      context.exercises.getExercise(exercise_name),
      context.teachers.getTeachers(teachers_name),
    ]);

    if (exercise === null || teachers.length === 0) {
      return false;
    }

    const exercise_id = exercise.id;

    const feedbacks = await context.exerciseFeedbacks.getFeedbacks({
      exercise_id: [exercise_id],
    });

    const feedbacksToBeCreated: ExerciseFeedback[] = [];
    const feedbacksToBeUpdated: Identificable<ExerciseFeedback>[] = [];

    teachers_and_groups.forEach(({ teacher_name, group_name }) => {
      const teacher = teachers.find((t) => t.teacher_name === teacher_name);
      if (!teacher) {
        return;
      }

      const teacher_id = teacher.id;

      const feedback = feedbacks.find((f) => f.group_name === group_name);
      if (!feedback) {
        feedbacksToBeCreated.push({
          group_name,
          teacher_id,
          exercise_id,
        });
        return;
      }

      if (feedback.teacher_id == teacher_id) {
        return;
      }

      feedbacksToBeUpdated.push({
        id: feedback.id,
        group_name,
        teacher_id,
        exercise_id,
      });
    });

    return await Promise.all([
      context.exerciseFeedbacks.createFeedbacks(feedbacksToBeCreated),
      context.exerciseFeedbacks.updateFeedbacks(feedbacksToBeUpdated),
    ])
      .then(() => true)
      .catch(() => false);
  }
}
