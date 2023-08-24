import { Database } from "./notion/Database";

export type Asignacion = {
  nombre: string;
  docentes: Array<string>;
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
  id_docentes: Array<string>;
  id_ejercicio: string;
};

export type Config = {
  notion: {
    token: string;
    db_docente: string;
    db_ejercicio: string;
    db_devolucion: string;
  };
};

export type Contexto = {
  ejercicios: Database<Ejercicio>;
  docentes: Database<Docente>;
  devoluciones: Database<Devolucion>;
};
