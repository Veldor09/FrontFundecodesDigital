// src/app/admin/voluntariado/services/proyectoService.ts

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Construye querystring con includeVols=1 por defecto (para la vista de asignación) */
function buildQS(params?: Record<string, string | number | boolean>) {
  const base: Record<string, string> = { includeVols: "1" }; // <- clave
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      base[k] = typeof v === "boolean" ? (v ? "1" : "0") : String(v);
    }
  }
  const qs = new URLSearchParams(base).toString();
  return qs ? `?${qs}` : "";
}

/** GET /projects — lista de proyectos (con assignments si includeVols=1) */
export async function fetchProjects(params?: Record<string, string | number | boolean>) {
  const qs = buildQS(params);
  const res = await fetch(`${API}/projects${qs}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /projects ${res.status}: ${text}`);
  }
  return res.json(); // array de proyectos
}

/** Normaliza el proyecto a la forma que usa la UI de Voluntariado */
export function normalizeProject(p: any) {
  const estadoRaw = (p?.estado ?? p?.status ?? "activo").toString().toLowerCase();

  // assignments viene de la tabla intermedia ProjectVolunteer
  // cada item tiene { projectId, voluntarioId, assignedAt, voluntario:{...} }
  const asignados =
    Array.isArray(p?.assignments)
      ? p.assignments
          .map((a: any) => a?.voluntarioId)
          .filter((id: any) => typeof id === "number")
      // fallback por si algún endpoint viejo devolviera 'volunteers'
      : Array.isArray(p?.volunteers)
      ? p.volunteers.map((v: any) => v.id)
      : [];

  return {
    id: p?.id ?? p?.slug ?? String(p?.id ?? ""),
    nombre: p?.nombre ?? p?.title ?? p?.name ?? `Proyecto #${p?.id ?? "?"}`,
    area: p?.area ?? p?.categoria ?? p?.category ?? "N/D",
    estado: estadoRaw === "inactivo" ? "inactivo" : "activo",
    voluntariosAsignados: asignados,
  } as {
    id: number | string;
    nombre: string;
    area: string;
    estado: "activo" | "inactivo";
    voluntariosAsignados: number[];
  };
}

/* -------------------- Asignaciones -------------------- */
/* Ahora se usan las rutas de projects con la tabla intermedia:
   POST   /projects/:proyectoId/volunteers/:voluntarioId
   DELETE /projects/:proyectoId/volunteers/:voluntarioId
*/

export async function assignVolunteerToProject(
  voluntarioId: string | number,
  proyectoId: string | number
) {
  const res = await fetch(
    `${API}/projects/${proyectoId}/volunteers/${voluntarioId}`,
    { method: "POST" }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `POST /projects/${proyectoId}/volunteers/${voluntarioId} ${res.status}: ${text}`
    );
  }
  try {
    return await res.json();
  } catch {
    return true;
  }
}

export async function unassignVolunteerFromProject(
  voluntarioId: string | number,
  proyectoId: string | number
) {
  const res = await fetch(
    `${API}/projects/${proyectoId}/volunteers/${voluntarioId}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `DELETE /projects/${proyectoId}/volunteers/${voluntarioId} ${res.status}: ${text}`
    );
  }
  try {
    return await res.json();
  } catch {
    return true;
  }
}
