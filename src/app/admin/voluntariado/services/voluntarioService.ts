// services/voluntarioService.ts
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type VoluntarioCreateDTO = {
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  email: string;
  telefono?: string | null;
  fechaNacimiento?: string | null; // ISO
  // OJO: NO enviar fechaIngreso ni estado en CREATE (el back los rechaza)
};

export type VoluntarioUpdateDTO = Partial<VoluntarioCreateDTO> & {
  id: number;
  // En UPDATE sí podrías permitir estado/fechaIngreso si tu back lo soporta
  estado?: "ACTIVO" | "INACTIVO";
  fechaIngreso?: string | null; // ISO
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
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

export async function updateVoluntario(dto: VoluntarioUpdateDTO) {
  const { id, ...body } = dto;
  const res = await fetch(`${API}/voluntarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle<any>(res);
}

// services/voluntarioService.ts (solo la parte de toggle; deja el resto igual)
export async function toggleVoluntario(
  id: number,
  nextEstado: "ACTIVO" | "INACTIVO"
) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${API}/voluntarios/${id}/toggle-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nextEstado }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH /voluntarios/${id}/toggle-status ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteVoluntario(id: number) {
  const res = await fetch(`${API}/voluntarios/${id}`, { method: "DELETE" });
  return handle<any>(res);
}
