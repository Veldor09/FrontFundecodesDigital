import { Area } from './voluntario';

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  area: Area;
  fechaInicio: string;
  fechaFin?: string;
  estado: "activo" | "inactivo" | "finalizado";
  responsable: string;
  voluntariosAsignados: string[]; // IDs de voluntarios
}

export interface AsignacionProyecto {
  id: string;
  proyectoId: string;
  voluntarioId: string;
  fechaAsignacion: string;
  estado: "activo" | "inactivo";
}