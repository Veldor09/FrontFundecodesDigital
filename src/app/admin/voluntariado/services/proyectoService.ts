"use client";

import axios from "axios";

export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

/* ===================== 🔐 Headers ===================== */
function authHeader() {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ===================== 🧭 Helpers ===================== */
function buildQS(params?: Record<string, string | number | boolean>) {
  const base: Record<string, string> = { includeVols: "1" }; // siempre incluye voluntarios
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      base[k] = typeof v === "boolean" ? (v ? "1" : "0") : String(v);
    }
  }
  const qs = new URLSearchParams(base).toString();
  return qs ? `?${qs}` : "";
}

/* ===================== 📂 API Proyectos ===================== */

/** 
 * GET /api/projects — lista de proyectos 
 * Incluye voluntarios asignados si includeVols=1
 */
export async function fetchProjects(params?: Record<string, string | number | boolean>) {
  const qs = buildQS(params);
  const { data } = await axios.get(`${API_URL}/api/projects${qs}`, {
    headers: { ...authHeader() },
  });
  return data;
}

/** Normaliza el proyecto a la forma que usa la UI de Voluntariado */
export function normalizeProject(p: any) {
  const estadoRaw = (p?.estado ?? p?.status ?? "activo").toString().toLowerCase();

  // ✅ Ahora sí: leer IDs correctamente desde assignments[].voluntario.id
  const asignados =
    Array.isArray(p?.assignments)
      ? p.assignments
          .map((a: any) => a?.voluntario?.id ?? a?.voluntarioId ?? null)
          .filter((id: any) => typeof id === "number" || typeof id === "string")
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
    voluntariosAsignados: (number | string)[];
  };
}


/* ===================== 🤝 Asignaciones ===================== */

/**
 * POST /api/projects/:proyectoId/volunteers/:voluntarioId
 * Asigna un voluntario a un proyecto
 */
export async function assignVolunteerToProject(
  voluntarioId: string | number,
  proyectoId: string | number
) {
  const { data } = await axios.post(
    `${API_URL}/api/projects/${proyectoId}/volunteers/${voluntarioId}`,
    {},
    { headers: { ...authHeader() } }
  );
  return data ?? { ok: true };
}

/**
 * DELETE /api/projects/:proyectoId/volunteers/:voluntarioId
 * Desasigna un voluntario de un proyecto
 */
export async function unassignVolunteerFromProject(
  voluntarioId: string | number,
  proyectoId: string | number
) {
  const { data } = await axios.delete(
    `${API_URL}/api/projects/${proyectoId}/volunteers/${voluntarioId}`,
    { headers: { ...authHeader() } }
  );
  return data ?? { ok: true };
}
