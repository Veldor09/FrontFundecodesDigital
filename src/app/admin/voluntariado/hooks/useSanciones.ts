// hooks/useSanciones.ts
"use client";

import useSWR from "swr";
import {
  listSanciones,
  createSancion,
  updateSancion,
  deleteSancion,
  revocarSancion,
  getSancionesActivasVoluntario,
  SancionCreateDTO,
} from "../services/sancionService";
import { Sancion } from "../types/sancion";

export function useSanciones(page = 1, search = "", estado?: string, voluntarioId?: number) {
  const key = ["sanciones", page, search, estado, voluntarioId] as const;

  const { data, isLoading, mutate, error } = useSWR(key, async () => {
    const res = await listSanciones({ page, limit: 10, search, estado, voluntarioId });
    return {
      data: Array.isArray(res.data) ? (res.data as Sancion[]) : [],
      total: typeof res.total === "number" ? res.total : (res.data?.length ?? 0),
    };
  });

  async function save(dto: Omit<Sancion, "id"> & { id?: number }) {
    if (dto.id) {
      await updateSancion({ id: dto.id, ...dto });
    } else {
      const body: SancionCreateDTO = {
        voluntarioId: dto.voluntarioId,
        tipo: dto.tipo,
        motivo: dto.motivo,
        descripcion: dto.descripcion,
        fechaInicio: dto.fechaInicio,
        fechaVencimiento: dto.fechaVencimiento,
        creadaPor: dto.creadaPor,
      };
      await createSancion(body);
    }
    await mutate();
  }

  async function revocar(id: number, revocadaPor?: string) {
    await revocarSancion(id, revocadaPor);
    await mutate();
  }

  async function remove(id: number) {
    await deleteSancion(id);
    await mutate();
  }

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    save,
    revocar,
    remove,
    refetch: mutate,
  };
}

// Hook específico para obtener sanciones activas de un voluntario
export function useSancionesActivasVoluntario(voluntarioId: number) {
  const { data, isLoading, mutate, error } = useSWR(
    voluntarioId ? ["sanciones-activas", voluntarioId] : null,
    () => getSancionesActivasVoluntario(voluntarioId)
  );

  return {
    data: data ?? [],
    loading: isLoading,
    error,
    refetch: mutate,
  };
}