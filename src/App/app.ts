import { default as express } from "express";
import { context } from "./context";
import { UpdateFeedbackCorrector } from "../UseCases";

export const app = express();

app.use(express.json());

app.use(function (req, res, next) {
  try {
    return next();
  } catch {
    return res.sendStatus(500);
  }
});

app.post("/feedback", async function (req, res) {
  const { body } = req;
  const { exercise_name, teachers_and_groups } = body;

  if (!exercise_name || !teachers_and_groups) {
    return res.sendStatus(400);
  }

  const ok = await new UpdateFeedbackCorrector(context).run(
    exercise_name,
    teachers_and_groups
  );

  return res.send(ok);
});

app.get("/", function (req, res) {
  return res.sendStatus(200);
});

app.use(function (req, res) {
  return res.sendStatus(404);
});
