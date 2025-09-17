import { Proyecto, AsignacionProyecto } from "../types/proyecto";

let proyectos: Proyecto[] = [
  {
    id: "1",
    nombre: "Conservación de Tortugas Marinas",
    descripcion: "Proyecto para la protección y monitoreo de tortugas marinas en las costas del Pacífico",
    area: "Conservación Marina",
    fechaInicio: "2024-01-15",
    fechaFin: "2024-12-15",
    estado: "activo",
    responsable: "Dr. Ana Martínez",
    voluntariosAsignados: ["1"]
  },
  {
    id: "2", 
    nombre: "Educación Ambiental Escolar",
    descripcion: "Programa educativo para concientizar a estudiantes sobre la importancia del medio ambiente",
    area: "Educación Ambiental",
    fechaInicio: "2024-02-01",
    estado: "activo",
    responsable: "Lic. Roberto Silva",
    voluntariosAsignados: ["1", "2"]
  },
  {
    id: "3",
    nombre: "Restauración de Manglar",
    descripcion: "Iniciativa para restaurar áreas degradadas de manglar en la región",
    area: "Conservación de Humedales", 
    fechaInicio: "2023-06-01",
    fechaFin: "2024-03-30",
    estado: "finalizado",
    responsable: "Ing. Carmen López",
    voluntariosAsignados: []
  }
];

let asignaciones: AsignacionProyecto[] = [
  {
    id: "1",
    proyectoId: "1",
    voluntarioId: "1",
    fechaAsignacion: "2024-01-20",
    estado: "activo"
  },
  {
    id: "2", 
    proyectoId: "2",
    voluntarioId: "1",
    fechaAsignacion: "2024-02-05",
    estado: "activo"
  },
  {
    id: "3",
    proyectoId: "2", 
    voluntarioId: "2",
    fechaAsignacion: "2024-02-10",
    estado: "inactivo"
  }
];

let nextProjectId = 4;
let nextAssignmentId = 4;

export async function getProyectos(page = 1, search = ""): Promise<{
  data: Proyecto[];
  total: number;
}> {
  const filtered = proyectos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase()) ||
      p.responsable.toLowerCase().includes(search.toLowerCase())
  );
  const start = (page - 1) * 10;
  return {
    data: filtered.slice(start, start + 10),
    total: filtered.length,
  };
}

export async function saveProyecto(
  data: Omit<Proyecto, "id" | "voluntariosAsignados"> & { id?: string }
): Promise<void> {
  if (data.id) {
    const index = proyectos.findIndex((p) => p.id === data.id);
    if (index !== -1) {
      proyectos[index] = { ...proyectos[index], ...data } as Proyecto;
    }
  } else {
    proyectos.push({ 
      ...data, 
      id: String(nextProjectId++), 
      voluntariosAsignados: [] 
    });
  }
}

export async function toggleEstadoProyecto(id: string): Promise<void> {
  const p = proyectos.find((p) => p.id === id);
  if (p && p.estado !== "finalizado") {
    p.estado = p.estado === "activo" ? "inactivo" : "activo";
  }
}

export async function deleteProyecto(id: string): Promise<void> {
  proyectos = proyectos.filter((p) => p.id !== id);
  asignaciones = asignaciones.filter((a) => a.proyectoId !== id);
}

export async function asignarVoluntario(proyectoId: string, voluntarioId: string): Promise<void> {
  // Verificar que no existe ya la asignación
  const existeAsignacion = asignaciones.find(
    (a) => a.proyectoId === proyectoId && a.voluntarioId === voluntarioId && a.estado === "activo"
  );
  
  if (existeAsignacion) {
    throw new Error("El voluntario ya está asignado a este proyecto");
  }

  // Crear nueva asignación
  asignaciones.push({
    id: String(nextAssignmentId++),
    proyectoId,
    voluntarioId, 
    fechaAsignacion: new Date().toISOString().split('T')[0],
    estado: "activo"
  });

  // Actualizar el proyecto
  const proyecto = proyectos.find((p) => p.id === proyectoId);
  if (proyecto && !proyecto.voluntariosAsignados.includes(voluntarioId)) {
    proyecto.voluntariosAsignados.push(voluntarioId);
  }
}

export async function desasignarVoluntario(proyectoId: string, voluntarioId: string): Promise<void> {
  // Desactivar asignación
  const asignacion = asignaciones.find(
    (a) => a.proyectoId === proyectoId && a.voluntarioId === voluntarioId && a.estado === "activo"
  );
  if (asignacion) {
    asignacion.estado = "inactivo";
  }

  // Actualizar el proyecto
  const proyecto = proyectos.find((p) => p.id === proyectoId);
  if (proyecto) {
    proyecto.voluntariosAsignados = proyecto.voluntariosAsignados.filter(id => id !== voluntarioId);
  }
}

export async function getAsignacionesByProyecto(proyectoId: string): Promise<AsignacionProyecto[]> {
  return asignaciones.filter((a) => a.proyectoId === proyectoId && a.estado === "activo");
}

export async function getProyectoById(id: string): Promise<Proyecto | null> {
  return proyectos.find((p) => p.id === id) || null;
}