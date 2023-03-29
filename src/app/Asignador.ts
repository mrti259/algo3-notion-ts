import { Client } from "@notionhq/client";

import { Notificador } from "./Slack";
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
        (eje) => eje.nombre === asignacion.ejercicio,
      );
      const docente = this.docentes.find(
        (doc) => doc.nombre === asignacion.docente,
      );
      if (!ejercicio || !docente) continue;
      const devolucionesExistente = this.devolucionesExistentes.find(
        (dev) =>
          dev.ejercicio_id == ejercicio.id && dev.nombre === asignacion.nombre,
      );
      if (!devolucionesExistente) {
        this.devolucionesACrear.push({
          nombre: asignacion.nombre,
          docente_id: docente.id,
          ejercicio_id: ejercicio.id,
        });
        continue;
      }
      if (devolucionesExistente.docente_id === docente.id) {
        continue;
      }
      this.devolucionesAActualizar.push({
        ...devolucionesExistente,
        docente_id: docente.id,
      });
    }
  }

  private crearNotificaciones() {
    const asignacionesPorDocente = new Map<Docente, Array<Devolucion>>();
    const nuevasAsignaciones = this.devolucionesACrear.concat(
      this.devolucionesAActualizar,
    );
    for (const devolucion of nuevasAsignaciones) {
      const docente = this.docentes.find(
        (doc) => doc.id === devolucion.docente_id,
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
    const devoluciones = await this.traerDevoluciones(
      contexto,
      ejercicios,
      docentes,
    );
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
    context: {
      ejercicios: Database<Ejercicio>;
      docentes: Database<Docente>;
      devoluciones: Database<Devolucion>;
      notificaciones: Notificador;
    },
    asignaciones: Asignacion[],
  ) {
    return await context.ejercicios.query({
      nombre: asignaciones.map((a) => a.ejercicio),
    });
  }

  private static async traerDocentes(
    context: {
      ejercicios: Database<Ejercicio>;
      docentes: Database<Docente>;
      devoluciones: Database<Devolucion>;
      notificaciones: Notificador;
    },
    asignaciones: Asignacion[],
  ) {
    return await context.docentes.query({
      nombre: asignaciones.map((a) => a.docente),
    });
  }

  private static async traerDevoluciones(
    context: {
      ejercicios: Database<Ejercicio>;
      docentes: Database<Docente>;
      devoluciones: Database<Devolucion>;
      notificaciones: Notificador;
    },
    ejercicios: Identificable<Ejercicio>[],
    docentes: Identificable<Docente>[],
  ) {
    return await context.devoluciones.query({
      ejercicio_id: ejercicios.map((e) => e.id),
      docente_id: docentes.map((d) => d.id),
    });
  }
}
