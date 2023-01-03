import { ServiceContext } from "../1-services";
import { Teacher } from "../1-services/1-teachers/TeacherService";
import { ExamFeedback } from "../1-services/3-exams/ExamFeedbackService";
import { Exam } from "../1-services/3-exams/ExamService";
import { UserNotification } from "../1-services/4-notifications/UserNotification";
import type { Identificable } from "../1-services/shared/NotionRepository";

export class UpdateExamFeedbackCorrector {
  static async run(
    context: ServiceContext,
    exam_name: string,
    teachers_and_students: {
      teacher_name: string;
      student_name: string;
    }[],
  ) {
    let ok = false;

    const teachers_name = teachers_and_students.map(
      ({ teacher_name }) => teacher_name,
    );

    const [exam, teachers] = await Promise.all([
      context.exams.getExam(exam_name),
      context.teachers.getTeachers(teachers_name),
    ]);

    if (exam === null || teachers.length === 0) {
      return { ok };
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
      },
    );

    ok = await Promise.all([
      context.examFeedbacks.createFeedbacks(feedbacksToBeCreated),
      context.examFeedbacks.updateFeedbacks(feedbacksToBeUpdated),
    ])
      .then(() =>
        context.notifications.sendMultipleMessages(
          createNotifications(exam, teachers, [
            ...feedbacksToBeCreated,
            ...(feedbacksToBeUpdated as ExamFeedback[]),
          ]),
        ),
      )
      .then((res) => res.ok)
      .catch(() => false);

    return { ok };
  }
}

function createNotifications(
  exam: Identificable<Exam>,
  teachers: Identificable<Teacher>[],
  feedbacks: ExamFeedback[],
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
