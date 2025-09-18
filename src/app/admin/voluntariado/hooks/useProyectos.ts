// src/app/admin/voluntariado/hooks/useProyectos.ts
"use client";

import useSWR from "swr";
import {
  fetchProjects,
  normalizeProject,
  assignVolunteerToProject,
  unassignVolunteerFromProject,
} from "../services/proyectoService";
import type { Proyecto } from "../types/proyecto";

export function useProyectos() {
  const { data, error, isLoading, mutate } = useSWR(
    ["projects:list", { includeVols: 1 }],
    async () => {
      // Traemos SIEMPRE con includeVols=1 para la vista de asignación
      const raw = await fetchProjects({ includeVols: 1 });

      // Soportamos tanto array como { data, total }
      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : [];

      return arr.map(normalizeProject) as Proyecto[];
    }
  );

  async function assign(voluntarioId: string | number, proyectoId: string | number) {
    await assignVolunteerToProject(voluntarioId, proyectoId);
    await mutate();
  }

  async function unassign(voluntarioId: string | number, proyectoId: string | number) {
    await unassignVolunteerFromProject(voluntarioId, proyectoId);
    await mutate();
  }

  return {
    data: (data ?? []) as Proyecto[],
    loading: isLoading,
    error,
    assign,
    unassign,
    refetch: mutate,
  };
}
