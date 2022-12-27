import type { Identificable } from "../services/shared/NotionRepository";
import type { Exercise, ExerciseFeedback } from "../services/exercises/schemas";
import { ServiceContext } from "../services";
import { Teacher } from "../services/teachers/schemas";
import { UserNotification } from "../services/notifications/UserNotification";

export class UpdateExerciseFeedbackCorrector {
  static async run(
    context: ServiceContext,
    exercise_name: string,
    teachers_and_groups: {
      teacher_name: string;
      group_name: string;
    }[]
  ) {
    let ok = false;

    const teachers_name = teachers_and_groups.map(
      ({ teacher_name }) => teacher_name
    );

    const [exercise, teachers] = await Promise.all([
      context.exercises.getExercise(exercise_name),
      context.teachers.getTeachers(teachers_name),
    ]);

    if (exercise === null || teachers.length === 0) {
      return { ok };
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

    ok = await Promise.all([
      context.exerciseFeedbacks.createFeedbacks(feedbacksToBeCreated),
      context.exerciseFeedbacks.updateFeedbacks(feedbacksToBeUpdated),
    ])
      .then(() =>
        context.notifications.sendMultipleMessages(
          createNotifications(exercise, teachers, [
            ...feedbacksToBeCreated,
            ...(feedbacksToBeUpdated as ExerciseFeedback[]),
          ])
        )
      )
      .then((res) => res.ok)
      .catch(() => false);

    return { ok };
  }
}

function createNotifications(
  exercise: Identificable<Exercise>,
  teachers: Identificable<Teacher>[],
  feedbacks: ExerciseFeedback[]
) {
  const feedbacksGroupedByTeachers: Map<
    Identificable<Teacher>,
    ExerciseFeedback[]
  > = new Map();

  feedbacks.forEach((f) => {
    const teacher = teachers.find((t) => t.id == f.teacher_id);
    if (!teacher) return;
    const teachers_feedbacks: ExerciseFeedback[] =
      feedbacksGroupedByTeachers.get(teacher) || [];
    teachers_feedbacks.push(f);
    feedbacksGroupedByTeachers.set(teacher, teachers_feedbacks);
  });

  const notifications: UserNotification[] = [];

  for (let [
    teacher,
    teacher_feedbacks,
  ] of feedbacksGroupedByTeachers.entries()) {
    const teacher_name = teacher.teacher_name!;
    const exercise_name = exercise.exercise_name!;
    notifications.push({
      user_name: teacher_name!,
      message: `@${teacher_name}: se te han asignado ${
        teacher_feedbacks.length
      } correcciones de ${exercise_name}: ${teacher_feedbacks
        .map((f) => f.group_name)
        .join(", ")}`,
    });
  }

  return notifications;
}
