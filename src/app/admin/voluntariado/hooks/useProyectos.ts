"use client";

import useSWR from "swr";
import {
  fetchProjects,
  normalizeProject,
  assignVolunteerToProject,
  unassignVolunteerFromProject,
} from "../services/proyectoService";
import type { Proyecto } from "../types/proyecto";

/**
 * Hook de proyectos usado en el módulo de voluntariado
 * - Obtiene todos los proyectos con voluntarios asignados
 * - Permite asignar / desasignar voluntarios
 * - Maneja duplicados y refresca correctamente la vista
 */
export function useProyectos() {
  const { data, error, isLoading, mutate } = useSWR<Proyecto[]>(
    ["projects:list", { includeVols: 1 }],
    async () => {
      // Siempre trae proyectos con sus voluntarios asignados
      const raw = await fetchProjects({ includeVols: 1 });

      // Soporta tanto array directo como { data, total }
      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : [];

      // Normalizamos el formato
      return arr.map(normalizeProject) as Proyecto[];
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  /* ====================== 🔄 Asignar / Quitar ====================== */
  async function assign(voluntarioId: string | number, proyectoId: string | number) {
    try {
      await assignVolunteerToProject(voluntarioId, proyectoId);
      // 🔥 Forzamos revalidación real desde el backend
      await mutate(undefined, { revalidate: true });
      return { ok: true };
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err.message ?? "";

      // Si ya estaba asignado, no consideramos error
      if (msg.includes("ya asignado")) {
        console.warn("⚠️ Voluntario ya asignado a este proyecto");
        await mutate(undefined, { revalidate: true });
        return { ok: true, duplicated: true };
      }

      console.error("❌ Error al asignar voluntario:", err);
      throw err;
    }
  }

  async function unassign(voluntarioId: string | number, proyectoId: string | number) {
    try {
      await unassignVolunteerFromProject(voluntarioId, proyectoId);
      // 🔁 También revalidamos para refrescar vista
      await mutate(undefined, { revalidate: true });
      return { ok: true };
    } catch (err: any) {
      console.error("❌ Error al desasignar voluntario:", err);
      throw err;
    }
  }

  /* ====================== 🧩 Output ====================== */
  return {
    data: (data ?? []) as Proyecto[],
    loading: isLoading,
    error,
    assign,
    unassign,
    refetch: () => mutate(undefined, { revalidate: true }), // forzar recarga manual
  };
}
