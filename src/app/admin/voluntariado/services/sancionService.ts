// services/sancionService.ts
import type { Sancion, SancionCreateDTO, SancionUpdateDTO } from "../types/sancion";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000") + "/api";


async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${text}`);
  }
  return res.json() as Promise<T>;
}

export type ListSancionesParams = {
  page?: number;
  limit?: number;
  search?: string;
  estado?: "ACTIVA" | "EXPIRADA" | "REVOCADA";
  voluntarioId?: number;
};

export type ListSancionesResponse = {
  data: Sancion[];
  total: number;
  page?: number;
  limit?: number;
};

// GET /sanciones
export async function listSanciones(params: ListSancionesParams = {}): Promise<ListSancionesResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.estado) q.set("estado", params.estado);
  if (params.voluntarioId) q.set("voluntarioId", String(params.voluntarioId));

  const res = await fetch(`${API}/sanciones?${q.toString()}`, { cache: "no-store" });
  return handle<ListSancionesResponse>(res);
}

// POST /sanciones
export async function createSancion(dto: SancionCreateDTO): Promise<Sancion> {
  const res = await fetch(`${API}/sanciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return handle<Sancion>(res);
}

// PUT /sanciones/:id
export async function updateSancion(dto: SancionUpdateDTO & { id: number }): Promise<Sancion> {
  const { id, ...body } = dto;
  const res = await fetch(`${API}/sanciones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle<Sancion>(res);
}

// DELETE /sanciones/:id
export async function deleteSancion(id: number): Promise<{ ok: true }> {
  const res = await fetch(`${API}/sanciones/${id}`, { method: "DELETE" });
  return handle<{ ok: true }>(res);
}

// PUT /sanciones/:id/revocar
export async function revocarSancion(id: number, revocadaPor?: string): Promise<Sancion> {
  const res = await fetch(`${API}/sanciones/${id}/revocar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ revocadaPor }),
  });
  return handle<Sancion>(res);
}

// GET /sanciones/voluntario/:voluntarioId/activas
export async function getSancionesActivasPorVoluntario(voluntarioId: number): Promise<Sancion[]> {
  const res = await fetch(`${API}/sanciones/voluntario/${voluntarioId}/activas`, { cache: "no-store" });
  return handle<Sancion[]>(res);
}
