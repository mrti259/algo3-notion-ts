import { VercelRequest, VercelResponse } from "@vercel/node";

import { obtenerEmailsDocentes } from "../app/controllers/obtenerEmailsDocentes";

export default async function (req: VercelRequest, res: VercelResponse) {
  const emails = await obtenerEmailsDocentes();
  return res.send(emails);
}
