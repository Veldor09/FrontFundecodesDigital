// services/sancionService.ts

import { Sancion, SancionCreateDTO, SancionUpdateDTO } from "../types/sancion";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ListSancionesParams {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string; // "ACTIVA" | "EXPIRADA" | "REVOCADA" | ""
  voluntarioId?: number;
}

interface ListSancionesResponse {
  data: Sancion[];
  total: number;
  page: number;
  limit: number;
}

// GET /api/sanciones
export async function listSanciones(params: ListSancionesParams = {}): Promise<ListSancionesResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.estado) searchParams.append("estado", params.estado);
  if (params.voluntarioId) searchParams.append("voluntarioId", params.voluntarioId.toString());

  const url = `${API_BASE}/sanciones?${searchParams.toString()}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
}

// POST /api/sanciones
export async function createSancion(sancion: SancionCreateDTO): Promise<Sancion> {
  const res = await fetch(`${API_BASE}/sanciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sancion),
  });
  
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
}

// PUT /api/sanciones/:id
export async function updateSancion(sancion: SancionUpdateDTO): Promise<Sancion> {
  const res = await fetch(`${API_BASE}/sanciones/${sancion.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sancion),
  });
  
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
}

// DELETE /api/sanciones/:id
export async function deleteSancion(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/sanciones/${id}`, {
    method: "DELETE",
  });
  
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
}

// PUT /api/sanciones/:id/revocar
export async function revocarSancion(id: number, revocadaPor?: string): Promise<Sancion> {
  const res = await fetch(`${API_BASE}/sanciones/${id}/revocar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ revocadaPor }),
  });
  
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
}

// GET /api/sanciones/voluntario/:voluntarioId/activas
export async function getSancionesActivasVoluntario(voluntarioId: number): Promise<Sancion[]> {
  const res = await fetch(`${API_BASE}/sanciones/voluntario/${voluntarioId}/activas`);
  
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
}