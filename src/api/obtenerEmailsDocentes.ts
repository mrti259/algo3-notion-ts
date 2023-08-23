import { VercelRequest, VercelResponse } from "@vercel/node";

import { obtenerEmailsDocentes } from "../app/controllers/obtenerEmailsDocentes";

export default async function (req: VercelRequest, res: VercelResponse) {
  return await obtenerEmailsDocentes();
}
