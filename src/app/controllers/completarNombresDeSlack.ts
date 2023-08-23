import { Asignador } from "../Asignador";
import { Config } from "../types";

export async function completarNombresDeSlack(
  body: Partial<{
    config: Config;
    docentes: Array<string>;
  }>,
) {
  const { config, docentes } = body || {};
  if (!docentes || !docentes.length) {
    return false;
  }
  if (!config) {
    return false;
  }
  return await Asignador.completarNombresDeSlack(config, docentes);
}
