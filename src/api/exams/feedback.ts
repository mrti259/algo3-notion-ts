import { VercelRequest, VercelResponse } from "@vercel/node";

import { ExamCorrectorUploader } from "../../2-helpers/2-ExamCorrectorUploader";
import { context } from "../../context";

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

  const { ok } = await ExamCorrectorUploader.upload(
    context,
    exam_name,
    teachers_and_students,
  );

  return res.send({ ok }).end();
}
