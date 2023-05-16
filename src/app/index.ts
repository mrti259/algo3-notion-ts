import { Asignador } from "./Asignador";
import { Asignacion, Config } from "./types";

export async function completarNombresDeSlack(
  body:
    | {
        config: Config;
        docentes: Array<string>;
      }
    | undefined,
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
  return await Asignador.asignarEjercicio(config, asignaciones);
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
  return await Asignador.asignarExamen(config, asignaciones);
}
