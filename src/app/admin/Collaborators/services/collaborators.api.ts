// app/admin/Collaborators/services/collaborators.api.ts
"use client";

import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function authHeader() {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function toggleEstado(id: number, estado: "ACTIVO" | "INACTIVO") {
  const { data } = await axios.patch(
    `${API}/admin/collaborators/${id}/estado`,
    { estado },
    { headers: { ...authHeader() } }
  );
  return data;
}

export async function removeCollaborator(id: number) {
  const { data } = await axios.delete(
    `${API}/admin/collaborators/${id}`,
    { headers: { ...authHeader() } }
  );
  return data;
}
