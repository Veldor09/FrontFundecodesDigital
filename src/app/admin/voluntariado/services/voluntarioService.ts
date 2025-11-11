"use client";

import axios from "axios";

export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

function authHeader() {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** ---------- Voluntarios (ruta correcta del BACKEND) ---------- **/

// LIST
export async function apiListVoluntarios(params: {
  q?: string;
  estado?: "ACTIVO" | "INACTIVO";
  page?: number;
  pageSize?: number;
}) {
  const { data } = await axios.get(`${API_URL}/api/voluntarios`, {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      q: params.q,
      estado: params.estado,
    },
    headers: { ...authHeader() },
  });
  return data;
}

// GET ONE
export async function apiGetVoluntario(id: number | string) {
  const { data } = await axios.get(`${API_URL}/api/voluntarios/${id}`, {
    headers: { ...authHeader() },
  });
  return data;
}

// CREATE
export async function apiCreateVoluntario(payload: any) {
  const { data } = await axios.post(`${API_URL}/api/voluntarios`, payload, {
    headers: { "Content-Type": "application/json", ...authHeader() },
  });
  return data;
}

// UPDATE
export async function apiUpdateVoluntario(id: number | string, patch: any) {
  const { data } = await axios.patch(`${API_URL}/api/voluntarios/${id}`, patch, {
    headers: { "Content-Type": "application/json", ...authHeader() },
  });
  return data;
}

// TOGGLE (activar / desactivar)
export async function apiDeactivateVoluntario(id: number | string) {
  const { data } = await axios.patch(
    `${API_URL}/api/voluntarios/${id}/deactivate`,
    {},
    { headers: { ...authHeader() } }
  );
  return data;
}

export async function apiActivateVoluntario(id: number | string) {
  const { data } = await axios.patch(
    `${API_URL}/api/voluntarios/${id}`,
    { estado: "ACTIVO" },
    { headers: { "Content-Type": "application/json", ...authHeader() } }
  );
  return data;
}

// DELETE
export async function apiDeleteVoluntario(id: number | string) {
  const { data } = await axios.delete(`${API_URL}/api/voluntarios/${id}`, {
    headers: { ...authHeader() },
  });
  return data;
}
