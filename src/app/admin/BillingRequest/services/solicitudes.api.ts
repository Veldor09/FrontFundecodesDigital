"use client";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000").replace(/\/+$/, "");

function url(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/* =========================
 * Tipos
 * ========================= */
export type EstadoContadora = "VALIDADA" | "PENDIENTE" | "DEVUELTA";
export type EstadoDirector  = "APROBADA" | "RECHAZADA" | "PENDIENTE";

export interface Solicitud {
  id: number;
  titulo: string;
  descripcion: string | null;
  archivos: string[];
  usuarioId: number | null;
  estadoContadora: EstadoContadora;
  estadoDirector: EstadoDirector;
  comentarioContadora?: string | null;
  comentarioDirector?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SolicitudListItem = Pick<
  Solicitud,
  "id" | "titulo" | "descripcion" | "estadoContadora" | "estadoDirector"
>;

export type CreateSolicitudPayload = {
  titulo: string;
  descripcion: string;
  usuarioId?: number;
  files?: File[];
};

const normalize = (s?: string | null) =>
  (s ?? "").toString().trim().toUpperCase();

/* =========================
 * Endpoints (fetch nativo)
 * ========================= */

export async function createSolicitud(payload: CreateSolicitudPayload): Promise<Solicitud> {
  const fd = new FormData();
  fd.set("titulo", payload.titulo);
  fd.set("descripcion", payload.descripcion);
  if (payload.usuarioId !== undefined) fd.set("usuarioId", String(payload.usuarioId));
  (payload.files ?? []).forEach((f) => fd.append("archivos", f)); // 👈 nombre EXACTO

  return http<Solicitud>(url("/solicitudes"), {
    method: "POST",
    body: fd, // NO pongas Content-Type manualmente
  });
}

/**
 * Trae todas las solicitudes y permite filtrar en cliente.
 * - bandeja: "contadora" -> estadoContadora === "PENDIENTE"
 * - bandeja: "director"  -> estadoContadora === "VALIDADA"
 */
export async function fetchSolicitudes(opts?: {
  estado?: EstadoContadora | "TODAS";
  bandeja?: "contadora" | "director";
}): Promise<SolicitudListItem[]> {
  const data = await http<Solicitud[]>(url("/solicitudes"), { method: "GET" });
  let out: SolicitudListItem[] = Array.isArray(data) ? data : [];

  if (opts?.estado && opts.estado !== "TODAS") {
    out = out.filter((r) => normalize(r.estadoContadora) === normalize(opts.estado));
  }
  if (opts?.bandeja === "contadora") {
    out = out.filter((r) => normalize(r.estadoContadora) === "PENDIENTE");
  } else if (opts?.bandeja === "director") {
    out = out.filter((r) => normalize(r.estadoContadora) === "VALIDADA");
  }
  return out;
}

export async function getSolicitud(id: number): Promise<Solicitud> {
  return http<Solicitud>(url(`/solicitudes/${id}`), { method: "GET" });
}

export async function fetchHistorial(id: number) {
  return http<any[]>(url(`/solicitudes/${id}/historial`), { method: "GET" });
}

export async function validateSolicitud(id: number): Promise<Solicitud> {
  const body = { estadoContadora: "VALIDADA" as const };
  return http<Solicitud>(url(`/solicitudes/${id}/validar`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function returnSolicitud(id: number, comentario: string): Promise<Solicitud> {
  const body = { estadoContadora: "DEVUELTA" as const, comentarioContadora: comentario };
  return http<Solicitud>(url(`/solicitudes/${id}/validar`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function approveSolicitud(id: number): Promise<Solicitud> {
  const body = { estadoDirector: "APROBADA" as const };
  return http<Solicitud>(url(`/solicitudes/${id}/decision-director`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function rejectSolicitud(id: number, comentario: string): Promise<Solicitud> {
  const body = { estadoDirector: "RECHAZADA" as const, comentarioDirector: comentario };
  return http<Solicitud>(url(`/solicitudes/${id}/decision-director`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
