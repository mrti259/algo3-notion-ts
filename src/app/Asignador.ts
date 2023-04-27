import { Client } from "@notionhq/client";

import { Notificador } from "./Notificador";
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
  Notificacion,
} from "./types";

export class Asignador {
  private devolucionesACrear: Array<Devolucion> = [];
  private devolucionesAActualizar: Array<Identificable<Devolucion>> = [];
  private notificaciones: Array<Notificacion> = [];

  constructor(
    private asignaciones: Array<Asignacion>,
    private ejercicios: Array<Identificable<Ejercicio>>,
    private docentes: Array<Identificable<Docente>>,
    private devolucionesExistentes: Array<Identificable<Devolucion>>,
    private contexto: Contexto,
  ) {}

  async asignar() {
    this.agruparDevoluciones();
    this.crearNotificaciones();
    await this.enviar();
    return true;
  }

  private agruparDevoluciones() {
    for (const asignacion of this.asignaciones) {
      const ejercicio = this.ejercicios.find(
        (ejercicio) => ejercicio.nombre === asignacion.ejercicio,
      );
      const id_docentes = this.docentes
        .filter((docente) => asignacion.docentes.includes(docente.nombre))
        .map((docente) => docente.id);

      if (!ejercicio || !id_docentes.length) continue;

      const devolucionExistente = this.devolucionesExistentes.find(
        (devolucion) =>
          devolucion.id_ejercicio == ejercicio.id &&
          devolucion.nombre === asignacion.nombre,
      );
      if (!devolucionExistente) {
        this.devolucionesACrear.push({
          nombre: asignacion.nombre,
          id_docentes: id_docentes,
          id_ejercicio: ejercicio.id,
        });
        continue;
      }
      if (
        id_docentes.some((id) => !devolucionExistente.id_docentes.includes(id))
      ) {
        this.devolucionesAActualizar.push({
          ...devolucionExistente,
          id_docentes: id_docentes,
        });
      }
    }
  }

  private crearNotificaciones() {
    const asignacionesPorDocente = new Map<Docente, Array<Devolucion>>();
    const nuevasAsignaciones = this.devolucionesACrear.concat(
      this.devolucionesAActualizar,
    );
    for (const devolucion of nuevasAsignaciones) {
      const docente = this.docentes.find((docente) =>
        devolucion.id_docentes.includes(docente.id),
      )!;
      const asignadasDocente = asignacionesPorDocente.get(docente) || [];
      asignacionesPorDocente.set(docente, [...asignadasDocente, devolucion]);
    }

    for (const [docente, asignaciones] of asignacionesPorDocente) {
      const singular = asignaciones.length === 1;
      const n = singular ? "" : "n";
      const s = singular ? "" : "s";
      const ones = singular ? "ón" : "ones";
      this.notificaciones.push({
        destinatario: docente.nombre,
        mensaje: `Se te ha${n} asignado ${
          asignaciones.length
        } correcci${ones} nueva${s}: ${asignaciones
          .map((dev) => dev.nombre)
          .join(", ")}`,
      });
    }
  }

  private async enviar() {
    await Promise.allSettled([
      this.contexto.devoluciones.create(this.devolucionesACrear),
      this.contexto.devoluciones.update(this.devolucionesAActualizar),
      this.contexto.notificaciones.enviar(this.notificaciones),
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
    return await asignador.asignar();
  }

  private static contextoParaEjercicios(config: Config) {
    const client = new Client({ auth: config.notion.token });
    return {
      ejercicios: this.ejercicios(client, config),
      docentes: this.docentes(client, config),
      devoluciones: this.devolucionesEjercicio(client, config),
      notificaciones: this.notificador(config),
    };
  }

  private static contextoParaExamen(config: Config) {
    const client = new Client({ auth: config.notion.token });
    return {
      ejercicios: this.ejercicios(client, config),
      docentes: this.docentes(client, config),
      devoluciones: this.devolucionesExamen(client, config),
      notificaciones: this.notificador(config),
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

  private static notificador(config: Config) {
    return new Notificador(config.slack.token, config.slack.default_channel);
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
    const docentes = flat(asignaciones.map((a) => a.docentes));
    return await contexto.docentes.query({
      nombre: docentes,
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
