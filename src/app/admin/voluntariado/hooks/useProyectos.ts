"use client";

import useSWR from "swr";
import { Proyecto } from "../types/proyecto";
import {
  listProyectos,
  assignVolunteerToProject,
  unassignVolunteerFromProject,
} from "../services/proyectoService";

export function useProyectos() {
  const { data, isLoading, mutate, error } = useSWR<Proyecto[]>("proyectos", listProyectos);

  async function assign(voluntarioId: number, proyectoId: string | number) {
    await assignVolunteerToProject(proyectoId, voluntarioId);
    await mutate();
  }

  async function unassign(voluntarioId: number, proyectoId: string | number) {
    await unassignVolunteerFromProject(proyectoId, voluntarioId);
    await mutate();
  }

  return {
    data: data ?? [],
    loading: isLoading,
    error,
    assign,
    unassign,
    refetch: mutate,
  };
}
