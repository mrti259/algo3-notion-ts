import { Asignador } from "./Asignador";
import { Asignacion, Config } from "./types";

export async function asignarEjercicio(
  body:
    | {
        config: Config;
        asignaciones: Array<Asignacion>;
      }
    | undefined,
) {
  const { config, asignaciones } = body || {};
  if (!asignaciones || !asignaciones.length) {
    return false;
  }
  if (!config) {
    return false;
  }
  await Asignador.asignarEjercicio(config, asignaciones);
  return true;
}

export async function asignarExamen(
  body:
    | {
        config: Config;
        asignaciones: Array<Asignacion>;
      }
    | undefined,
) {
  const { config, asignaciones } = body || {};
  if (!asignaciones || !asignaciones.length) {
    return false;
  }
  if (!config) {
    return false;
  }
  await Asignador.asignarExamen(config, asignaciones);
  return true;
}
