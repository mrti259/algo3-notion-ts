import { VercelRequest, VercelResponse } from "@vercel/node";

import { completarNombresDeSlack } from "../app";

export default async function (req: VercelRequest, res: VercelResponse) {
  const { body } = req;
  const ok = await completarNombresDeSlack(body);
  return res.send({ ok });
}
