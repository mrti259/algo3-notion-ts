import type { Identificable } from "../services/shared/NotionRepository";
import { ServiceContext } from "../services";
import { ExamFeedback } from "../services/exams/schemas";

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
      exam_id: [exam.id],
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
      .then(() => true)
      .catch(() => false);
  }
}
