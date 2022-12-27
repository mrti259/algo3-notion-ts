import type { VercelRequest, VercelResponse } from "@vercel/node";
import { context } from "../../context";
import { UpdateExamFeedbackCorrector } from "../../helpers/UpdateExamFeedbackCorrector";

export default async function (req: VercelRequest, res: VercelResponse) {
  const { body } = req;
  const { exam_name, teachers_and_students, secret_key } = body;

  if (
    secret_key !== context.config.secret_key ||
    !exam_name ||
    !teachers_and_students
  ) {
    return res.status(400).end();
  }

  const { ok } = await UpdateExamFeedbackCorrector.run(
    context,
    exam_name,
    teachers_and_students
  );

  return res.send({ ok }).end();
}
