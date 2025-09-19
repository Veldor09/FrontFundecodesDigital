// src/app/admin/voluntariado/services/voluntarioService.ts
import type { VoluntarioCreateDTO, VoluntarioUpdateDTO, Estado } from "../types/voluntario";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    // intenta parsear JSON
    try {
      const json = JSON.parse(text);
      // Prisma P2002 => conflicto de unicidad
      const code = json?.debug?.prisma?.code;
      const target = Array.isArray(json?.debug?.prisma?.meta?.target)
        ? json.debug.prisma.meta.target.join(", ")
        : json?.debug?.prisma?.meta?.target;

      if (res.status === 409 || code === "P2002") {
        const campo = target || "algún campo único";
        throw new Error(`Ya existe un registro con el mismo ${campo}.`);
      }
      // Si viene message del backend úsalo
      if (json?.message) throw new Error(json.message);
    } catch {
      // si no fue JSON, continúa abajo
    }

    throw new Error(`${res.status} ${res.statusText} — ${text}`);
  }
  return res.json() as Promise<T>;
}


export async function listVoluntarios(params?: {
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
}) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.search) q.set("search", params.search);
  if (params?.estado) q.set("estado", params.estado);

  const res = await fetch(`${API}/voluntarios?${q.toString()}`, { cache: "no-store" });
  return handle<{ data: any[]; total: number }>(res);
}

export async function createVoluntario(dto: VoluntarioCreateDTO) {
  const res = await fetch(`${API}/voluntarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return handle<any>(res);
}

export async function updateVoluntario(id: number, dto: VoluntarioUpdateDTO) {
  const res = await fetch(`${API}/voluntarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return handle<any>(res);
}

export async function toggleVoluntario(id: number, nextEstado: Estado) {
  // Si tu backend usa otra ruta (p.ej. /toggle-status), cámbiala aquí.
  const res = await fetch(`${API}/voluntarios/${id}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nextEstado }),
  });
  return handle<any>(res);
}

export async function deleteVoluntario(id: number) {
  const res = await fetch(`${API}/voluntarios/${id}`, { method: "DELETE" });
  return handle<any>(res);
}
