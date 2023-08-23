import { VercelRequest, VercelResponse } from "@vercel/node";

import { obtenerContenido } from "../app/controllers/obtenerContenido";

export default async function (req: VercelRequest, res: VercelResponse) {
  const { query } = req;
  const ok = await obtenerContenido(query);
  return res.send({ ok });
}
