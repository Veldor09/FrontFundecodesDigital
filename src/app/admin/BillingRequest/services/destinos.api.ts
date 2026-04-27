"use client";

import axiosInstance from "./axiosInstance";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

function authHeader() {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export type ProgramaOpcion = {
  id: number;
  nombre: string;
  lugar?: string;
};

export type ProyectoOpcion = {
  id: number;
  title: string;
  slug?: string;
  area?: string;
  category?: string;
};

/**
 * Trae la lista mínima de programas para alimentar el selector
 * del formulario de solicitudes.
 */
export async function fetchProgramasParaSelector(): Promise<ProgramaOpcion[]> {
  const { data } = await axiosInstance.get(
    `${API_URL}/api/programa-voluntariado`,
    { headers: { ...authHeader() }, withCredentials: true },
  );
  // El endpoint puede devolver { items: [...] } o un array directo.
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    lugar: p.lugar,
  }));
}

/**
 * Trae la lista mínima de proyectos para alimentar el selector
 * del formulario de solicitudes.
 */
export async function fetchProyectosParaSelector(): Promise<ProyectoOpcion[]> {
  const { data } = await axiosInstance.get(`${API_URL}/api/projects`, {
    headers: { ...authHeader() },
    withCredentials: true,
  });
  const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
  return items.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    area: p.area,
    category: p.category,
  }));
}

/** Formatea un Decimal/string/number como CRC sin decimales. */
export function formatCRC(monto: string | number | null | undefined): string {
  if (monto === null || monto === undefined || monto === "") return "—";
  const n = typeof monto === "number" ? monto : Number(monto);
  if (!Number.isFinite(n)) return String(monto);
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Devuelve un string corto con el destino de la solicitud (programa o proyecto). */
export function describeDestino(s: {
  tipoOrigen?: string | null;
  programa?: { nombre: string } | null;
  project?: { title: string } | null;
}): string {
  if (s.tipoOrigen === "PROGRAMA") return s.programa?.nombre ?? "Programa —";
  if (s.tipoOrigen === "PROYECTO") return s.project?.title ?? "Proyecto —";
  return "—";
}

/** Devuelve un string corto del solicitante (nombre o correo). */
export function describeSolicitante(s: {
  usuario?: { name: string | null; email: string } | null;
}): string {
  if (!s.usuario) return "—";
  return s.usuario.name?.trim() || s.usuario.email;
}
