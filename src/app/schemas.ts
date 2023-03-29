import { RelationProperty, Schema, TitleProperty } from "./notion/Schema";
import { Devolucion, Docente, Ejercicio } from "./types";

export const ejercicioSchema = new Schema<Ejercicio>({
  nombre: new TitleProperty("Nombre"),
});
export const docenteSchema = new Schema<Docente>({
  nombre: new TitleProperty("Nombre"),
});
export const devolucionEjercicioSchema = new Schema<Devolucion>({
  nombre: new TitleProperty("Nombre"),
  docente_id: new RelationProperty("Corrector"),
  ejercicio_id: new RelationProperty("Ejercicio"),
});
export const devolucionExamenSchema = new Schema<Devolucion>({
  nombre: new TitleProperty("Nombre"),
  docente_id: new RelationProperty("Corrector"),
  ejercicio_id: new RelationProperty("Examen"),
});
