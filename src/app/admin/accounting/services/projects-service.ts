// src/app/admin/contabilidad/services/ProjectsService.ts
"use client";

import axios from "axios";
import { resolveApiOrigin } from "@/lib/api-origin";

export const API_URL = resolveApiOrigin();

export type ProjectOption = { id: number; title: string };

/* ========================= 🔐 Headers ========================= */
function authHeader() {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ========================= 📦 Servicio ========================= */
export class ProjectsService {
  static async list(): Promise<ProjectOption[]> {
    const { data } = await axios.get<ProjectOption[]>(`${API_URL}/api/projects`, {
      headers: { ...authHeader() },
      withCredentials: true,
    });
    return data;
  }
}
