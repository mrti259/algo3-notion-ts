import { Schema } from "./notion/Schema";
import { RelationWithManyProperty } from "./notion/properties/RelationWithManyProperty";
import { RelationWithOneProperty } from "./notion/properties/RelationWithOneProperty";
import { TitleProperty } from "./notion/properties/TitleProperty";
import { Devolucion, Docente, Ejercicio } from "./types";

export const ejercicioSchema = new Schema<Ejercicio>({
  nombre: new TitleProperty("Nombre"),
});

export const docenteSchema = new Schema<Docente>({
  nombre: new TitleProperty("Nombre"),
});

export const devolucionEjercicioSchema = new Schema<Devolucion>({
  nombre: new TitleProperty("Nombre"),
  id_docentes: new RelationWithManyProperty("Corrector"),
  id_ejercicio: new RelationWithOneProperty("Ejercicio"),
});

export const devolucionExamenSchema = new Schema<Devolucion>({
  nombre: new TitleProperty("Nombre"),
  id_docentes: new RelationWithManyProperty("Corrector"),
  id_ejercicio: new RelationWithOneProperty("Examen"),
});
