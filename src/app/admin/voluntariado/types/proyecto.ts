export type ProyectoEstado = "activo" | "inactivo";

export interface Proyecto {
  id: string;                // si tu back usa number, cambia a number
  nombre: string;
  descripcion?: string;
  responsable?: string;
  area?: string;             // el área vive en el proyecto, NO en voluntario
  estado: ProyectoEstado;
  voluntariosAsignados: number[]; // ids numéricos de voluntarios
  createdAt?: string;
  updatedAt?: string;
}
