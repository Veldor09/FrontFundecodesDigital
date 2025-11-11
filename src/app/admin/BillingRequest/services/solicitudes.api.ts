"use client";

import axiosInstance from "./axiosInstance";

/* =========================
 * Configuración base
 * ========================= */
const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000").replace(/\/+$/, "");

function authHeader() {
  const t =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function url(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

function handleAxiosError(err: any): never {
  if (err.response) {
    const msg =
      err.response.data?.message ||
      err.response.data?.error ||
      `HTTP ${err.response.status} ${err.response.statusText}`;
    throw new Error(msg);
  } else if (err.request) {
    throw new Error("No se recibió respuesta del servidor.");
  } else {
    throw new Error(err.message || "Error desconocido.");
  }
}

/* =========================
 * Tipos
 * ========================= */
export type EstadoContadora = "VALIDADA" | "PENDIENTE" | "DEVUELTA";
export type EstadoDirector = "APROBADA" | "RECHAZADA" | "PENDIENTE";

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
 * Endpoints con Axios
 * ========================= */

export async function createSolicitud(
  payload: CreateSolicitudPayload
): Promise<Solicitud> {
  try {
    const fd = new FormData();
    fd.set("titulo", payload.titulo);
    fd.set("descripcion", payload.descripcion);
    if (payload.usuarioId !== undefined)
      fd.set("usuarioId", String(payload.usuarioId));
    (payload.files ?? []).forEach((f) => fd.append("archivos", f));

    const { data } = await axiosInstance.post(url("/api/solicitudes"), fd, {
      headers: { ...authHeader() },
      withCredentials: true,
    });
    return data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function fetchSolicitudes(opts?: {
  estado?: EstadoContadora | "TODAS";
  bandeja?: "contadora" | "director";
}): Promise<SolicitudListItem[]> {
  try {
    const { data } = await axiosInstance.get<Solicitud[]>(url("/api/solicitudes"), {
      headers: { ...authHeader() },
      withCredentials: true,
    });

    let out: SolicitudListItem[] = Array.isArray(data) ? data : [];

    if (opts?.estado && opts.estado !== "TODAS") {
      out = out.filter(
        (r) => normalize(r.estadoContadora) === normalize(opts.estado)
      );
    }
    if (opts?.bandeja === "contadora") {
      out = out.filter(
        (r) => normalize(r.estadoContadora) === "PENDIENTE"
      );
    } else if (opts?.bandeja === "director") {
      out = out.filter(
        (r) => normalize(r.estadoContadora) === "VALIDADA"
      );
    }
    return out;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function getSolicitud(id: number): Promise<Solicitud> {
  try {
    const { data } = await axiosInstance.get<Solicitud>(
      url(`/api/solicitudes/${id}`),
      {
        headers: { ...authHeader() },
        withCredentials: true,
      }
    );
    return data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function fetchHistorial(id: number): Promise<any[]> {
  try {
    const { data } = await axiosInstance.get<any[]>(
      url(`/api/solicitudes/${id}/historial`),
      {
        headers: { ...authHeader() },
        withCredentials: true,
      }
    );
    return data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function validateSolicitud(id: number): Promise<Solicitud> {
  try {
    const body = { estadoContadora: "VALIDADA" as const };
    const { data } = await axiosInstance.patch<Solicitud>(
      url(`/api/solicitudes/${id}/validar`),
      body,
      {
        headers: { "Content-Type": "application/json", ...authHeader() },
        withCredentials: true,
      }
    );
    return data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function returnSolicitud(
  id: number,
  comentario: string
): Promise<Solicitud> {
  try {
    const body = {
      estadoContadora: "DEVUELTA" as const,
      comentarioContadora: comentario,
    };
    const { data } = await axiosInstance.patch<Solicitud>(
      url(`/api/solicitudes/${id}/validar`),
      body,
      {
        headers: { "Content-Type": "application/json", ...authHeader() },
        withCredentials: true,
      }
    );
    return data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function approveSolicitud(id: number): Promise<Solicitud> {
  try {
    const body = { estadoDirector: "APROBADA" as const };
    const { data } = await axiosInstance.patch<Solicitud>(
      url(`/api/solicitudes/${id}/decision-director`),
      body,
      {
        headers: { "Content-Type": "application/json", ...authHeader() },
        withCredentials: true,
      }
    );
    return data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function rejectSolicitud(
  id: number,
  comentario: string
): Promise<Solicitud> {
  try {
    const body = {
      estadoDirector: "RECHAZADA" as const,
      comentarioDirector: comentario,
    };
    const { data } = await axiosInstance.patch<Solicitud>(
      url(`/api/solicitudes/${id}/decision-director`),
      body,
      {
        headers: { "Content-Type": "application/json", ...authHeader() },
        withCredentials: true,
      }
    );
    return data;
  } catch (err) {
    handleAxiosError(err);
  }
}
