import { Client } from "@notionhq/client";

import { flat } from "./helpers/flat";
import { Database, Identificable } from "./notion/Database";
import {
  devolucionEjercicioSchema,
  devolucionExamenSchema,
  docenteSchema,
  ejercicioSchema,
} from "./schemas";
import {
  Asignacion,
  Config,
  Contexto,
  Devolucion,
  Docente,
  Ejercicio,
} from "./types";

export class Asignador {
  private devolucionesACrear: Array<Devolucion> = [];
  private devolucionesAActualizar: Array<Identificable<Devolucion>> = [];

  constructor(
    private asignaciones: Array<Asignacion>,
    private ejercicios: Array<Identificable<Ejercicio>>,
    private docentes: Array<Identificable<Docente>>,
    private devolucionesExistentes: Array<Identificable<Devolucion>>,
    private contexto: Contexto,
  ) {}

  async asignarCorrecciones() {
    this.agruparDevoluciones();
    await this.enviar();
    return true;
  }

  private agruparDevoluciones() {
    for (const asignacion of this.asignaciones) {
      const ejercicio = this.ejercicios.find(
        (ejercicio) => ejercicio.nombre === asignacion.ejercicio,
      );
      const idDocentes = this.docentes
        .filter((docente) => asignacion.docentes.includes(docente.nombre))
        .map((docente) => docente.id);

      if (!ejercicio || !idDocentes.length) continue;

      const devolucionExistente = this.devolucionesExistentes.find(
        (devolucion) =>
          devolucion.id_ejercicio == ejercicio.id &&
          devolucion.nombre === asignacion.nombre,
      );
      if (!devolucionExistente) {
        this.crearDevolucion(asignacion, ejercicio, idDocentes);
        continue;
      }
      if (
        idDocentes.some((id) => !devolucionExistente.id_docentes.includes(id))
      ) {
        this.actualizarDevolucion(devolucionExistente, idDocentes);
        continue;
      }
    }
  }

  private crearDevolucion(
    asignacion: Asignacion,
    ejercicio: Identificable<Ejercicio>,
    idDocentes: string[],
  ) {
    this.devolucionesACrear.push({
      nombre: asignacion.nombre,
      id_ejercicio: ejercicio.id,
      id_docentes: idDocentes,
    });
  }

  private actualizarDevolucion(
    devolucionExistente: Identificable<Devolucion>,
    idDocentes: string[],
  ) {
    this.devolucionesAActualizar.push({
      ...devolucionExistente,
      id_docentes: idDocentes,
    });
  }

  private async enviar() {
    await Promise.allSettled([
      this.contexto.devoluciones.create(this.devolucionesACrear),
      this.contexto.devoluciones.update(this.devolucionesAActualizar),
    ]);
  }

  static async asignarEjercicio(config: Config, asignaciones: Asignacion[]) {
    const contexto = this.contextoParaEjercicios(config);
    return await this.asignarParaContexto(asignaciones, contexto);
  }

  static async asignarExamen(config: Config, asignaciones: Asignacion[]) {
    const contexto = this.contextoParaExamen(config);
    return await this.asignarParaContexto(asignaciones, contexto);
  }

  private static async asignarParaContexto(
    asignaciones: Asignacion[],
    contexto: Contexto,
  ) {
    const [ejercicios, docentes] = await Promise.all([
      this.traerEjercicios(contexto, asignaciones),
      this.traerDocentes(contexto, asignaciones),
    ]);
    const devoluciones = await this.traerDevoluciones(contexto, ejercicios);
    const asignador = new this(
      asignaciones,
      ejercicios,
      docentes,
      devoluciones,
      contexto,
    );
    return await asignador.asignarCorrecciones();
  }

  private static contextoParaEjercicios(config: Config) {
    const client = new Client({ auth: config.notion.token });
    return {
      ejercicios: this.ejercicios(client, config),
      docentes: this.docentes(client, config),
      devoluciones: this.devolucionesEjercicio(client, config),
    };
  }

  private static contextoParaExamen(config: Config) {
    const client = new Client({ auth: config.notion.token });
    return {
      ejercicios: this.ejercicios(client, config),
      docentes: this.docentes(client, config),
      devoluciones: this.devolucionesExamen(client, config),
    };
  }

  private static ejercicios(client: Client, config: Config) {
    return new Database(client, config.notion.db_ejercicio, ejercicioSchema);
  }

  private static docentes(client: Client, config: Config) {
    return new Database(client, config.notion.db_docente, docenteSchema);
  }

  private static devolucionesEjercicio(client: Client, config: Config) {
    return new Database(
      client,
      config.notion.db_devolucion,
      devolucionEjercicioSchema,
    );
  }

  private static devolucionesExamen(client: Client, config: Config) {
    return new Database(
      client,
      config.notion.db_devolucion,
      devolucionExamenSchema,
    );
  }

  private static async traerEjercicios(
    contexto: Contexto,
    asignaciones: Asignacion[],
  ) {
    return await contexto.ejercicios.query({
      nombre: asignaciones.map((a) => a.ejercicio),
    });
  }

  private static async traerDocentes(
    contexto: Contexto,
    asignaciones: Asignacion[],
  ) {
    const nombres = flat(asignaciones.map((a) => a.docentes));
    return await contexto.docentes.query({
      nombre: nombres,
    });
  }

  private static async traerDevoluciones(
    contexto: Contexto,
    ejercicios: Identificable<Ejercicio>[],
  ) {
    return await contexto.devoluciones.query({
      id_ejercicio: ejercicios.map((e) => e.id),
    });
  }
}
