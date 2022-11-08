import type { Identificable } from "../services/shared/NotionRepository";
import { ServiceContext } from "../services";
import { Exam, ExamFeedback } from "../services/exams/schemas";
import { Teacher } from "../services/teachers/schemas";
import { UserNotification } from "../services/notifications/UserNotification";

export class UpdateExamFeedbackCorrector {
  static async run(
    context: ServiceContext,
    exam_name: string,
    teachers_and_students: {
      teacher_name: string;
      student_name: string;
    }[]
  ) {
    const teachers_name = teachers_and_students.map(
      ({ teacher_name }) => teacher_name
    );

    const [exam, teachers] = await Promise.all([
      context.exams.getExam(exam_name),
      context.teachers.getTeachers(teachers_name),
    ]);

    if (exam === null || teachers.length === 0) {
      return false;
    }

    const exam_id = exam.id;

    const feedbacks = await context.examFeedbacks.getFeedbacks({
      exam_id: [exam_id],
    });

    const feedbacksToBeCreated: ExamFeedback[] = [];
    const feedbacksToBeUpdated: Identificable<ExamFeedback>[] = [];

    teachers_and_students.forEach(
      ({ teacher_name, student_name: student_name }) => {
        const teacher = teachers.find((t) => t.teacher_name === teacher_name);
        if (!teacher) {
          return;
        }

        const teacher_id = teacher.id;

        const feedback = feedbacks.find((f) => f.student_name === student_name);
        if (!feedback) {
          feedbacksToBeCreated.push({
            student_name,
            teacher_id,
            exam_id,
          });
          return;
        }

        if (feedback.teacher_id == teacher_id) {
          return;
        }

        feedbacksToBeUpdated.push({
          id: feedback.id,
          student_name,
          teacher_id,
          exam_id,
        });
      }
    );

    return await Promise.all([
      context.examFeedbacks.createFeedbacks(feedbacksToBeCreated),
      context.examFeedbacks.updateFeedbacks(feedbacksToBeUpdated),
    ])
      .then(() =>
        createNotifications(exam, teachers, [
          ...feedbacksToBeCreated,
          ...(feedbacksToBeUpdated as ExamFeedback[]),
        ])
      )
      .catch(() => false);
  }
}

function createNotifications(
  exam: Identificable<Exam>,
  teachers: Identificable<Teacher>[],
  feedbacks: ExamFeedback[]
) {
  const feedbacksGroupedByTeachers: Map<
    Identificable<Teacher>,
    ExamFeedback[]
  > = new Map();

  feedbacks.forEach((f) => {
    const teacher = teachers.find((t) => t.id == f.teacher_id);
    if (!teacher) return;
    const teachers_feedbacks: ExamFeedback[] =
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
    const exam_name = exam.exam_name!;
    notifications.push({
      user_name: teacher_name!,
      message: `@${teacher_name}: se te han asignado ${
        teacher_feedbacks.length
      } correcciones de ${exam_name}: ${teacher_feedbacks
        .map((f) => f.student_name)
        .join(", ")}`,
    });
  }

  return notifications;
}
