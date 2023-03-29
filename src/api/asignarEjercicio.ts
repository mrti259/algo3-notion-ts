import { VercelRequest, VercelResponse } from "@vercel/node";

import { asignarEjercicio } from "../app";

export default async function (req: VercelRequest, res: VercelResponse) {
  const { body } = req;
  const ok = await asignarEjercicio(body);
  return res.send({ ok });
}
