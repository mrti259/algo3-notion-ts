import { Asignador } from "./Asignador";
import { Asignacion, Config } from "./types";

const SECRET_TOKEN = process.env.SECRET_TOKEN;

export async function asignarEjercicio(
  body: Partial<{
    secret_token: string;
    config: Config;
    asignaciones: Array<Asignacion>;
  }>,
) {
  const { secret_token, config, asignaciones } = body;
  if (secret_token !== SECRET_TOKEN) {
    return false;
  }
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
  body: Partial<{
    secret_token: string;
    config: Config;
    asignaciones: Array<Asignacion>;
  }>,
) {
  const { secret_token, config, asignaciones } = body;
  if (secret_token !== SECRET_TOKEN) {
    return false;
  }
  if (!asignaciones || !asignaciones.length) {
    return false;
  }
  if (!config) {
    return false;
  }
  await Asignador.asignarExamen(config, asignaciones);
  return true;
}
