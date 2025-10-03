// src/app/admin/Billing/services/solicitudes.ts
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const RESOURCE = `${API}/solicitudes`;

export type SolicitudListItem = {
  id: number;
  titulo: string;
  descripcion: string;
  estado?: "PENDIENTE" | "VALIDADA" | "DEVUELTA" | "APROBADA" | "RECHAZADA" | string;
  usuarioId?: number;
  usuario?: { id: number; nombre?: string; email?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Archivo = {
  id?: number;
  url?: string;
  originalName?: string;
  originalname?: string; // multer
  filename?: string;
  name?: string;
  mimetype?: string;
  size?: number;
  path?: string;
};

export type SolicitudDetail = SolicitudListItem & {
  archivos?: Archivo[];
  // algunos backends también incluyen comentario/motivo directo aquí
  comentario?: string | null;
  observaciones?: string | null;
  motivo?: string | null;
  nota?: string | null;
};

export type HistEvent = {
  id: number;
  solicitudId: number;
  estado?: string | null;
  comentario?: string | null;
  createdAt?: string;
  user?: { id: number; nombre?: string; email?: string } | null;
};

export type CreateSolicitudPayload = {
  titulo: string;
  descripcion: string;
  files?: File[]; // adjuntos opcionales
};

/* ------------------------------ LISTADOS ------------------------------ */

export async function fetchSolicitudes(params?: { estado?: string }) {
  const q = params?.estado ? `?estado=${encodeURIComponent(params.estado)}` : "";
  const res = await fetch(`${RESOURCE}${q}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /solicitudes ${res.status}: ${text}`);
  }
  return res.json() as Promise<SolicitudListItem[]>;
}

export async function fetchSolicitud(id: number) {
  const res = await fetch(`${RESOURCE}/${id}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /solicitudes/${id} ${res.status}: ${text}`);
  }
  return res.json() as Promise<SolicitudDetail>;
}

/** Si el back no devuelve el comentario en el detalle, lo buscamos aquí */
export async function fetchSolicitudHistorial(id: number) {
  const res = await fetch(`${RESOURCE}/${id}/historial`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /solicitudes/${id}/historial ${res.status}: ${text}`);
  }
  return res.json() as Promise<HistEvent[]>;
}

/* ------------------------------ CREAR ------------------------------ */

export async function createSolicitud(body: CreateSolicitudPayload) {
  const fd = new FormData();
  fd.append("titulo", body.titulo);
  fd.append("descripcion", body.descripcion);
  if (body.files?.length) {
    for (const f of body.files) fd.append("archivos", f); // clave EXACTA del back
  }

  const res = await fetch(RESOURCE, { method: "POST", body: fd });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /solicitudes ${res.status}: ${text}`);
  }
  return res.json();
}

/* ------------------------------ ACCIONES DE FLUJO ------------------------------ */
/**
 * Rutas reales del back (Nest):
 * - PATCH /solicitudes/:id/validar                     -> contadora valida (sin body)  => VALIDADA
 * - PATCH /solicitudes/:id/estado                      -> cambia estado (body: { estado, comentario? })
 * - PATCH /solicitudes/:id/decision-director           -> director decide (body: { estado: 'APROBADA'|'RECHAZADA', comentario? })
 */

async function patch(id: number, action: string, body?: any) {
  const res = await fetch(`${RESOURCE}/${id}/${action}`, {
    method: "PATCH",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PATCH /solicitudes/${id}/${action} ${res.status}: ${text}`);
  }
  return res.json();
}

/** Contadora: validar -> pasa a VALIDADA */
export function validateSolicitud(id: number) {
  return patch(id, "validar");
}

/** Contadora: devolver -> pasa a DEVUELTA con comentario obligatorio */
export function returnSolicitud(id: number, motivo: string) {
  const body: any = { estado: "DEVUELTA", comentario: (motivo ?? "").trim() };
  return patch(id, "estado", body);
}

/** Director: aprobar -> APROBADA (observaciones opcionales) */
export function approveSolicitud(id: number, observaciones?: string) {
  const body: any = { estado: "APROBADA" };
  if (observaciones?.trim()) body.comentario = observaciones.trim();
  return patch(id, "decision-director", body);
}

/** Director: rechazar -> RECHAZADA (motivo obligatorio) */
export function rejectSolicitud(id: number, motivo: string) {
  const body: any = { estado: "RECHAZADA", comentario: (motivo ?? "").trim() };
  return patch(id, "decision-director", body);
}
