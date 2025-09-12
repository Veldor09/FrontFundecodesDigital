export type Area =
  | "Vida Silvestre"
  | "Conservación Marina"
  | "Conservación de Humedales"
  | "Restauración Ecológica"
  | "Turismo Comunitario"
  | "Turismo Cultural"
  | "Pesca Artesanal"
  | "Educación Ambiental"
  | "Gestión de Datos Ambientales"
  | "Desarrollo Sostenible"
  | "Alianzas Público–Privada";

export const areas: Area[] = [
  "Vida Silvestre",
  "Conservación Marina",
  "Conservación de Humedales",
  "Restauración Ecológica",
  "Turismo Comunitario",
  "Turismo Cultural",
  "Pesca Artesanal",
  "Educación Ambiental",
  "Gestión de Datos Ambientales",
  "Desarrollo Sostenible",
  "Alianzas Público–Privada",
];

export interface Voluntario {
  id: string;
  nombre: string;
  cedula: string;
  email: string;
  telefono: string;
  area: Area;
  estado: "activo" | "inactivo";
}