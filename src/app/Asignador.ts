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

  async completarNombresDeSlack() {
    const docentesAActualizar: Array<Identificable<Docente>> = [];
    const nombresDocentes = this.docentes.map((docente) => docente.nombre);
    const nombresEncontradosEnSlack = await this.contexto.notificaciones.buscar(
      nombresDocentes,
    );
    for (const docente of this.docentes) {
      if (!nombresEncontradosEnSlack.includes(docente.nombre)) continue;
      if (docente.nombreSlack === docente.nombre) continue;
      docente.nombreSlack = docente.nombre;
      docentesAActualizar.push(docente);
    }
    await this.contexto.docentes.update(docentesAActualizar);
    return true;
  }

  async asignarCorrecciones() {
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

  private crearNotificaciones() {
    const asignacionesPorDocente = new Map<Docente, Array<Devolucion>>();
    const nuevasAsignaciones = this.devolucionesACrear.concat(
      this.devolucionesAActualizar,
    );
    for (const devolucion of nuevasAsignaciones) {
      for (const idDocente of devolucion.id_docentes) {
        const docente = this.docentes.find(
          (docente) => docente.id === idDocente,
        )!;
        const asignadasDocente = asignacionesPorDocente.get(docente) || [];
        asignacionesPorDocente.set(docente, [...asignadasDocente, devolucion]);
      }
    }

    for (const [docente, asignaciones] of asignacionesPorDocente) {
      const singular = asignaciones.length === 1;
      const n = singular ? "" : "n";
      const s = singular ? "" : "s";
      const ones = singular ? "ón" : "ones";
      this.notificaciones.push({
        nombreSlack: docente.nombreSlack,
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

  static async completarNombresDeSlack(
    config: Config,
    nombresDocentes: string[],
  ) {
    const contexto = this.contextoParaEjercicios(config);
    const docentes = await contexto.docentes.query({ nombre: nombresDocentes });
    const asignador = new this([], [], docentes, [], contexto);
    return await asignador.completarNombresDeSlack();
  }

  static async obtenerIdsDevolucionesEjercicio(config: Config, nombre: string) {
    return await this.obtenerIdsDevoluciones(
      config,
      nombre,
      this.devolucionesEjercicio,
    );
  }

  static async obtenerIdsDevolucionesExamen(config: Config, nombre: string) {
    return await this.obtenerIdsDevoluciones(
      config,
      nombre,
      this.devolucionesExamen,
    );
  }

  private static async obtenerIdsDevoluciones(
    config: Config,
    nombreEjercicio: string,
    devolucionesDb: (client: Client, config: Config) => Database<Devolucion>,
  ) {
    const client = new Client({ auth: config.notion.token });
    const ejerciciosEncontrados = await this.ejercicios(client, config).query({
      nombre: [nombreEjercicio],
    });
    const ejercicioBuscado = ejerciciosEncontrados[0];
    if (!ejercicioBuscado) {
      return { ok: false, devoluciones: [] };
    }
    const devolucionesEncontradas = await devolucionesDb(client, config).query({
      id_ejercicio: [ejercicioBuscado.id],
    });
    return {
      ok: true,
      devoluciones: devolucionesEncontradas.map(({ id, nombre }) => ({
        id,
        nombre,
      })),
    };
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
