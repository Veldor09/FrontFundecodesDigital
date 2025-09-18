import { Proyecto } from "../types/proyecto";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function listProyectos(): Promise<Proyecto[]> {
  const res = await fetch(`${API}/proyectos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error listando proyectos");
  return res.json();
}

// Asignar voluntario a proyecto
export async function assignVolunteerToProject(proyectoId: string | number, voluntarioId: number) {
  const res = await fetch(`${API}/proyectos/${proyectoId}/voluntarios/${voluntarioId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error asignando voluntario al proyecto");
  return res.json();
}

// Desasignar voluntario de proyecto
export async function unassignVolunteerFromProject(proyectoId: string | number, voluntarioId: number) {
  const res = await fetch(`${API}/proyectos/${proyectoId}/voluntarios/${voluntarioId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error desasignando voluntario del proyecto");
  return res.json();
}
