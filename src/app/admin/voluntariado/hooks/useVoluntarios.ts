"use client";

import useSWR, { type BareFetcher } from "swr";
import type {
  Voluntario,
  Estado,
  VoluntarioCreateDTO,
  VoluntarioUpdateDTO,
} from "../types/voluntario";
import {
  listVoluntarios,
  createVoluntario as svcCreate,
  updateVoluntario as svcUpdate,
  deleteVoluntario as svcDelete,
  toggleVoluntario as svcToggle,
} from "../services/voluntarioService";

// Helper de manejo de respuesta
async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${text}`);
  }
  return res.json() as Promise<T>;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// 🔧 Tipar el fetcher como BareFetcher del shape que retorna el endpoint
const fetcher: BareFetcher<{ data: Voluntario[]; total: number }> = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) =>
    handle<{ data: Voluntario[]; total: number }>(res)
  );

export function useVoluntarios(params?: {
  page?: number;
  limit?: number;
  search?: string;
  estado?: Estado | "TODOS";
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search ?? "";
  const estado =
    params?.estado && params.estado !== "TODOS" ? params.estado : undefined;

  const key = `${API}/voluntarios?page=${page}&limit=${limit}&search=${encodeURIComponent(
    search
  )}${estado ? `&estado=${estado}` : ""}`;

  // ✅ Ahora TS reconoce el 2º argumento como fetcher, no como config
  const { data, isLoading, error, mutate } =
    useSWR<{ data: Voluntario[]; total: number }>(key, fetcher);

  async function createVoluntario(dto: VoluntarioCreateDTO) {
    await svcCreate(dto);
    await mutate();
  }

  async function updateVoluntario(id: number, dto: VoluntarioUpdateDTO) {
    await svcUpdate(id, dto);
    await mutate();
  }

  async function toggleVoluntario(id: number, nextEstado: Estado) {
    await svcToggle(id, nextEstado);
    await mutate();
  }

  async function deleteVoluntario(id: number) {
    await svcDelete(id);
    await mutate();
  }

  // API consumida por tu UI
  async function save(dto: VoluntarioCreateDTO & { id?: number }) {
    if (dto.id) {
      const { id, ...rest } = dto as any;
      await updateVoluntario(id, rest);
    } else {
      await createVoluntario(dto);
    }
  }

  async function toggle(id: number, nuevoEstado: Estado) {
    await toggleVoluntario(id, nuevoEstado);
  }

  async function remove(id: number) {
    await deleteVoluntario(id);
  }

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    save,
    toggle,
    remove,
    refetch: mutate,
  };
}
