import type { VercelRequest, VercelResponse } from "@vercel/node";
import { context } from "../../context";
import { UpdateExerciseFeedbackCorrector } from "../../use-cases/UpdateExerciseFeedbackCorrector";

export default async function (req: VercelRequest, res: VercelResponse) {
  const { body } = req;
  const { exercise_name, teachers_and_groups, secret_key } = body;

  if (
    secret_key !== context.secret_key ||
    !exercise_name ||
    !teachers_and_groups
  ) {
    return res.status(400).end();
  }

  const ok = await UpdateExerciseFeedbackCorrector.run(
    context,
    exercise_name,
    teachers_and_groups
  );

  return res.send({ ok }).end();
}