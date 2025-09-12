import { useEffect, useState } from "react";
import { Voluntario } from "../types/voluntario";
import {
  getVoluntarios,
  saveVoluntario,
  toggleEstado,
  deleteVoluntario,
} from "../services/voluntarioService";

export function useVoluntarios() {
  const [data, setData] = useState<Voluntario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    const res = await getVoluntarios(page, search);
    setData(res.data);
    setTotal(res.total);
    setLoading(false);
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
    save: async (v: Omit<Voluntario, "id"> & { id?: string }) => {
      await saveVoluntario(v);
      await fetch();
    },
    toggle: async (id: string) => {
      await toggleEstado(id);
      await fetch();
    },
    remove: async (id: string) => {
      await deleteVoluntario(id);
      await fetch();
    },
  };
}