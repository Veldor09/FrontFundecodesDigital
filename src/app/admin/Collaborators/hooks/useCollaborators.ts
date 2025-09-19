// src/app/admin/Collaborators/hooks/useCollaborators.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

export type Estado = "ACTIVO" | "INACTIVO";
export type EstadoFilter = "ALL" | Estado;

export type Collaborator = {
  id: number | string;
  nombreCompleto: string;
  correo: string;
  telefono?: string | null;
  rol: "ADMIN" | "COLABORADOR";
  cedula: string;
  fechaNacimiento?: string | null;
  estado: Estado;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  items: Collaborator[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const fetcher = async (url: string) => {
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(txt || `HTTP ${r.status}`);
  }
  return r.json();
};

function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out as Partial<T>;
}

export function useCollaborators() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoFilter>("ALL");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    if (search.trim()) p.set("q", search.trim());
    if (estado !== "ALL") p.set("estado", estado);
    return p.toString();
  }, [page, pageSize, search, estado]);

  const { data, error, isLoading, mutate } = useSWR<ListResponse>(
    `/api/collaborators?${qs}`,
    fetcher,
    { keepPreviousData: true }
  );

  const setEstadoAndReset = useCallback((value: EstadoFilter) => {
    setEstado(value);
    setPage(1);
  }, []);
  const setSearchAndReset = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const save = useCallback(
    async (payload: Partial<Collaborator> & { id?: number | string } & { password?: string }) => {
      const { id, ...rest } = payload;               // no enviar id en body
      const body = JSON.stringify(compact(rest));

      const url = id != null ? `/api/collaborators/${id}` : `/api/collaborators`;
      const method = id != null ? "PATCH" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
        credentials: "include",
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(txt || `HTTP ${r.status}`);
      }
      await mutate();
    },
    [mutate]
  );

  const toggle = useCallback(
    async (id: number | string, currentStatus: Estado) => {
      if (currentStatus === "ACTIVO") {
        const r = await fetch(`/api/collaborators/${id}/deactivate`, {
          method: "PATCH",
          credentials: "include",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      } else {
        const r = await fetch(`/api/collaborators/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "ACTIVO" }),
          credentials: "include",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      }
      await mutate();
    },
    [mutate]
  );

  const remove = useCallback(
    async (id: number | string) => {
      const r = await fetch(`/api/collaborators/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await mutate();
    },
    [mutate]
  );

  return {
    data: data?.items ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,

    page, setPage,
    pageSize, setPageSize,
    search, setSearch: setSearchAndReset,
    estado, setEstado: setEstadoAndReset,

    save,
    toggle,
    remove,
    refresh: mutate,
  };
}
