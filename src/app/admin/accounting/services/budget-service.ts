// src/app/admin/contabilidad/services/BudgetService.ts
"use client";

import axios from "axios";
import { resolveApiOrigin } from "@/lib/api-origin";
import type { BudgetItem } from "../types";

/* ========================= 🌐 Config base ========================= */
export const API_URL = resolveApiOrigin();

/* ========================= 🔐 Headers ========================= */
function authHeader() {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ========================= 📅 Utilidades ========================= */
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const monthNameToNumber = (name: string) => MONTHS.indexOf(name) + 1;
const numberToMonth = (n: number) => MONTHS[n - 1] ?? "";

/* ========================= 🔍 Helpers ========================= */
async function findProjectIdByTitle(title: string): Promise<number> {
  if (!title) throw new Error("Título de proyecto requerido");

  const { data: projects } = await axios.get(
    `${API_URL}/api/projects`,
    { headers: authHeader(), withCredentials: true }
  );

  const match = (projects as Array<{ id: number; title: string }>).find(
    (p) => (p.title ?? "").toLowerCase() === title.toLowerCase()
  );
  if (!match) throw new Error("Proyecto no encontrado: " + title);
  return match.id;
}

function mapFromApi(x: any): BudgetItem {
  return {
    id: x.id,
    programa: x.proyecto, // la UI sigue usando "programa"
    mes: numberToMonth(Number(x.mes)),
    año: Number(x.anio),
    montoAsignado: Number(x.montoAsignado),
    montoEjecutado: Number(x.montoEjecutado),
    fechaCreacion: x.createdAt ? new Date(x.createdAt) : new Date(),
    fechaActualizacion: x.updatedAt ? new Date(x.updatedAt) : new Date(),
  };
}

/* ========================= 💰 Servicio principal ========================= */
export class BudgetService {
  /** Listar presupuestos */
  static async getBudgetItems(filters?: Partial<BudgetItem>): Promise<BudgetItem[]> {
    const params: Record<string, any> = {};

    if (filters?.programa) {
      try {
        const pid = await findProjectIdByTitle(filters.programa);
        params.projectId = pid;
      } catch {
        /* ignora si no existe */
      }
    }
    if (filters?.mes) params.mes = monthNameToNumber(filters.mes);
    if (filters?.año) params.anio = filters.año;

    const { data } = await axios.get(`${API_URL}/api/contabilidad/presupuestos`, {
      headers: authHeader(),
      withCredentials: true,
      params,
    });

    return (data as any[]).map(mapFromApi);
  }

  /** Crear presupuesto */
  static async createBudgetItem(
    item: Omit<BudgetItem, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<BudgetItem> {
    const projectId = await findProjectIdByTitle(item.programa);
    const body = {
      projectId,
      proyecto: item.programa,
      mes: monthNameToNumber(item.mes),
      anio: item.año,
      montoAsignado: item.montoAsignado,
      montoEjecutado: item.montoEjecutado,
    };

    const { data } = await axios.post(
      `${API_URL}/api/contabilidad/presupuestos`,
      body,
      {
        headers: { "Content-Type": "application/json", ...authHeader() },
        withCredentials: true,
      }
    );

    return mapFromApi(data);
  }

  /** Actualizar presupuesto existente */
  static async updateBudgetItem(
    id: string,
    updates: Partial<BudgetItem>
  ): Promise<BudgetItem> {
    const body: any = {};
    if (updates.programa) body.proyecto = updates.programa;
    if (updates.mes) body.mes = monthNameToNumber(updates.mes);
    if (updates.año != null) body.anio = updates.año;
    if (updates.montoAsignado != null) body.montoAsignado = updates.montoAsignado;
    if (updates.montoEjecutado != null) body.montoEjecutado = updates.montoEjecutado;

    const { data } = await axios.patch(
      `${API_URL}/api/contabilidad/presupuestos/${id}`,
      body,
      {
        headers: { "Content-Type": "application/json", ...authHeader() },
        withCredentials: true,
      }
    );

    return mapFromApi(data);
  }

  /** Eliminar presupuesto por ID */
  static async deleteBudgetItem(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/contabilidad/presupuestos/${id}`, {
      headers: authHeader(),
      withCredentials: true,
    });
  }
}
