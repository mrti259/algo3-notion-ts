import { Notificador } from "./Notificador";
import { Database } from "./notion/Database";

export type Asignacion = {
  nombre: string;
  docente: string;
  ejercicio: string;
};

export type Ejercicio = {
  nombre: string;
};

export type Docente = {
  nombre: string;
};
export type Devolucion = {
  nombre: string;
  docente_id: string;
  ejercicio_id: string;
};
export type Notificacion = {
  destinatario: string;
  mensaje: string;
};
export type Config = {
  notion: {
    token: string;
    db_docente: string;
    db_ejercicio: string;
    db_devolucion: string;
  };
  slack: {
    token: string;
    default_channel: string;
  };
};
export type Contexto = {
  ejercicios: Database<Ejercicio>;
  docentes: Database<Docente>;
  devoluciones: Database<Devolucion>;
  notificaciones: Notificador;
};
