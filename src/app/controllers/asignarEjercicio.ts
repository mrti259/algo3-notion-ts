import { Asignador } from "../Asignador";
import { Asignacion, Config } from "../types";

export async function asignarEjercicio(
  body: Partial<{
    config: Config;
    asignaciones: Array<Asignacion>;
  }>,
) {
  const { config, asignaciones } = body || {};
  if (!asignaciones || !asignaciones.length) {
    return false;
  }
  if (!config) {
    return false;
  }
  return await Asignador.asignarEjercicio(config, asignaciones);
}
