"use client";

import useSWR from "swr";
import { Voluntario, VoluntarioCreateDTO, VoluntarioUpdateDTO, Estado } from "../types/voluntario";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${text}`);
  }
  return res.json();
}

const fetcher = (url: string) => fetch(url).then(handle);

export function useVoluntarios() {
  // Puedes agregar aquí query params reales de paginación si lo deseas
  const { data, isLoading, error, mutate } = useSWR<{ data: Voluntario[]; total: number }>(
    `${API}/voluntarios`,
    fetcher
  );

  async function createVoluntario(dto: VoluntarioCreateDTO) {
    const res = await fetch(`${API}/voluntarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    return handle(res);
  }

  async function updateVoluntario(id: number, dto: VoluntarioUpdateDTO) {
    const res = await fetch(`${API}/voluntarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    return handle(res);
  }

  async function toggleVoluntario(id: number, estado: Estado) {
    const res = await fetch(`${API}/voluntarios/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    return handle(res);
  }

  async function deleteVoluntario(id: number) {
    const res = await fetch(`${API}/voluntarios/${id}`, { method: "DELETE" });
    return handle(res);
  }

  // API que usa el resto del front:
  async function save(dto: (VoluntarioCreateDTO & { id?: number })) {
    if (dto.id) {
      const { id, ...rest } = dto;
      await updateVoluntario(id, rest);
    } else {
      await createVoluntario(dto);
    }
    await mutate(); // refresca lista
  }

  async function toggle(id: number, nuevoEstado: Estado) {
    await toggleVoluntario(id, nuevoEstado);
    await mutate();
  }

  async function remove(id: number) {
    await deleteVoluntario(id);
    await mutate();
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
