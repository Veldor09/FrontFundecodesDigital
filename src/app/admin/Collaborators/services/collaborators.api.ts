"use client";

import axios from "axios";

export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

function authHeader() {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** ---------- Colaboradores (ruta correcta del BACKEND) ---------- **/

// LIST
export async function apiListCollaborators(params: {
  q?: string;
  rol?: "ADMIN" | "COLABORADOR";
  estado?: "ACTIVO" | "INACTIVO";
  page?: number;
  pageSize?: number;
}) {
  const { data } = await axios.get(`${API_URL}/collaborators`, {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      q: params.q,
      rol: params.rol,
      estado: params.estado, // omite "ALL" desde el caller
    },
    headers: { ...authHeader() },
  });
  return data;
}

// GET ONE
export async function apiGetCollaborator(id: number | string) {
  const { data } = await axios.get(`${API_URL}/collaborators/${id}`, {
    headers: { ...authHeader() },
  });
  return data;
}

// CREATE  -> ESTE endpoint dispara el upsert de USER en el backend
export async function apiCreateCollaborator(payload: any) {
  const { data } = await axios.post(`${API_URL}/collaborators`, payload, {
    headers: { "Content-Type": "application/json", ...authHeader() },
  });
  return data;
}

// UPDATE
export async function apiUpdateCollaborator(id: number | string, patch: any) {
  const { data } = await axios.patch(`${API_URL}/collaborators/${id}`, patch, {
    headers: { "Content-Type": "application/json", ...authHeader() },
  });
  return data;
}

// TOGGLE (desactivar / activar)
export async function apiDeactivateCollaborator(id: number | string) {
  const { data } = await axios.patch(
    `${API_URL}/collaborators/${id}/deactivate`,
    {},
    { headers: { ...authHeader() } }
  );
  return data;
}
export async function apiActivateCollaborator(id: number | string) {
  const { data } = await axios.patch(
    `${API_URL}/collaborators/${id}`,
    { estado: "ACTIVO" },
    { headers: { "Content-Type": "application/json", ...authHeader() } }
  );
  return data;
}

// DELETE
export async function apiDeleteCollaborator(id: number | string) {
  const { data } = await axios.delete(`${API_URL}/collaborators/${id}`, {
    headers: { ...authHeader() },
  });
  return data;
}

/** ---------- (Legacy admin/* si aún los usas en alguna vista) ---------- **/
export async function toggleEstado(id: number, estado: "ACTIVO" | "INACTIVO") {
  // Si aún necesitas el legacy, mantenlo; si no, puedes eliminarlo.
  const { data } = await axios.patch(
    `${API_URL}/admin/collaborators/${id}/estado`,
    { estado },
    { headers: { ...authHeader() } }
  );
  return data;
}

export async function removeCollaborator(id: number) {
  const { data } = await axios.delete(`${API_URL}/admin/collaborators/${id}`, {
    headers: { ...authHeader() },
  });
  return data;
}
