import { useEffect, useState } from "react";
import { Collaborator } from "../types/collaborators.types";
import {
  listCollaborators,
  createCollaborator,
  updateCollaborator,
  toggleCollaboratorStatus,
  deleteCollaborator,
} from "../services/collaborators.service";

export function useCollaborators() {
  const [data, setData] = useState<Collaborator[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<"ACTIVO" | "INACTIVO" | "">("ACTIVO");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await listCollaborators({
        page,
        pageSize,
        q: search,
        estado: estado || undefined,
      });
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [page, pageSize, search, estado]);

  return {
    data,
    total,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    estado,
    setEstado,
    refetch: fetch,
    save: async (collaborator: Omit<Collaborator, "id"> & { id?: number | string }) => {
      if (collaborator.id) {
        await updateCollaborator(collaborator.id, collaborator);
      } else {
        await createCollaborator(collaborator as any);
      }
      await fetch();
    },
    toggle: async (id: number | string) => {
      await toggleCollaboratorStatus(id);
      await fetch();
    },
    remove: async (id: number | string) => {
      await deleteCollaborator(id);
      await fetch();
    },
  };
}