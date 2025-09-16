import { useEffect, useState } from "react";
import { Proyecto } from "../types/proyecto";
import {
  getProyectos,
  saveProyecto,
  toggleEstadoProyecto,
  deleteProyecto,
  asignarVoluntario,
  desasignarVoluntario,
  getAsignacionesByProyecto,
} from "../services/proyectoService";

export function useProyectos() {
  const [data, setData] = useState<Proyecto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getProyectos(page, search);
      setData(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error("Error fetching proyectos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [page, search]);

  return {
    data,
    total,
    loading,
    page,
    setPage,
    search,
    setSearch,
    refetch: fetch,
    save: async (p: Omit<Proyecto, "id" | "voluntariosAsignados"> & { id?: string }) => {
      await saveProyecto(p);
      await fetch();
    },
    toggle: async (id: string) => {
      await toggleEstadoProyecto(id);
      await fetch();
    },
    remove: async (id: string) => {
      await deleteProyecto(id);
      await fetch();
    },
    asignarVoluntario: async (proyectoId: string, voluntarioId: string) => {
      await asignarVoluntario(proyectoId, voluntarioId);
      await fetch();
    },
    desasignarVoluntario: async (proyectoId: string, voluntarioId: string) => {
      await desasignarVoluntario(proyectoId, voluntarioId);
      await fetch();
    },
    getAsignaciones: getAsignacionesByProyecto,
  };
}