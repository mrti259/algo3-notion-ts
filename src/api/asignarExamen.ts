import { VercelRequest, VercelResponse } from "@vercel/node";

import { asignarExamen } from "../app/controllers/asignarExamen";

export default async function (req: VercelRequest, res: VercelResponse) {
  const { body } = req;
  const ok = await asignarExamen(body);
  return res.send({ ok });
}
