import { VercelRequest, VercelResponse } from "@vercel/node";

import { ExerciseCorrectorUploader } from "../../2-helpers/1-ExerciseCorrectorUploader";
import { context } from "../../context";

export default async function (req: VercelRequest, res: VercelResponse) {
  const { body } = req;
  const { exercise_name, teachers_and_groups, secret_key } = body;

  if (
    secret_key !== context.config.secret_key ||
    !exercise_name ||
    !teachers_and_groups
  ) {
    return res.status(400).end();
  }

  const { ok } = await ExerciseCorrectorUploader.upload(
    context,
    exercise_name,
    teachers_and_groups,
  );

  return res.send({ ok }).end();
}
