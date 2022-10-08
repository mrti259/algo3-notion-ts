import type { Identificable } from "../Models/NotionRepository";
import type { Feedback } from "../Models/Schemas";
import { UseCase } from "./UseCase";

export class UpdateFeedbackCorrector extends UseCase {
  async run(
    exercise_name: string,
    teachers_and_groups: {
      teacher_name: string;
      group_name: string;
    }[]
  ) {
    const exercise = await this.context.exercises.getExercise(exercise_name);
    if (exercise === null) return false;

    const exercise_id = exercise.id;

    const teachers_name = teachers_and_groups.map(
      ({ teacher_name }) => teacher_name
    );

    const teachers = await this.context.teachers.getTeachers(teachers_name);
    if (teachers.length === 0) return false;

    const feedbacks = await this.context.feedbacks.getFeedbacks({
      exercise_id: [exercise.id],
    });

    const feedbacksToBeCreated: Feedback[] = [];
    const feedbacksToBeUpdated: Identificable<Feedback>[] = [];

    teachers_and_groups.forEach(({ teacher_name, group_name }) => {
      const teacher = teachers.find((t) => t.teacher_name === teacher_name);
      if (!teacher) return;

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

      feedbacksToBeUpdated.push({
        id: feedback.id,
        group_name,
        teacher_id,
        exercise_id,
      });
    });

    const createFeedbacks = await this.context.feedbacks.createFeedbacks(
      feedbacksToBeCreated
    );

    const updatedFeedbacks = await this.context.feedbacks.updateFeedbacks(
      feedbacksToBeUpdated
    );

    return (
      createFeedbacks.length + updatedFeedbacks.length ===
      teachers_and_groups.length
    );
  }
}
