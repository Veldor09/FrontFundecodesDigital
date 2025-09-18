// hooks/useVoluntarios.ts
"use client";

import useSWR from "swr";
import {
  listVoluntarios,
  createVoluntario,
  updateVoluntario,
  toggleVoluntario,
  deleteVoluntario,
  VoluntarioCreateDTO,
} from "../services/voluntarioService";
import { Voluntario } from "../types/voluntario";
import { toggleVoluntario as toggleVolService } from "../services/voluntarioService";

export function useVoluntarios(page = 1, search = "", estado?: string) {
  const key = ["voluntarios", page, search, estado] as const;

  const { data, isLoading, mutate, error } = useSWR(key, async () => {
    const res = await listVoluntarios({ page, limit: 10, search, estado });
    // res: { data: Voluntario[], total }
    return {
      data: Array.isArray(res.data) ? (res.data as Voluntario[]) : [],
      total: typeof res.total === "number" ? res.total : (res.data?.length ?? 0),
    };
  });

  async function save(dto: Omit<Voluntario, "id"> & { id?: number }) {
    // dto YA debe tener los nombres correctos (tipoDocumento, nombreCompleto, etc.)
    if (dto.id) {
      await updateVoluntario({ id: dto.id, ...dto });
    } else {
      // adaptamos a DTO de creación
      const body: VoluntarioCreateDTO = {
        tipoDocumento: dto.tipoDocumento,
        numeroDocumento: dto.numeroDocumento,
        nombreCompleto: dto.nombreCompleto,
        email: dto.email,
        telefono: dto.telefono ?? null,
        fechaNacimiento: dto.fechaNacimiento ?? null,
        fechaIngreso: dto.fechaIngreso,
        estado: dto.estado,
      };
      await createVoluntario(body);
    }
    await mutate();
  }

  async function toggle(id: number, next: "ACTIVO" | "INACTIVO") {
    await toggleVolService(id, next);
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
    toggle,     // <- ahora toggle(id, nextEstado)
    remove,
    refetch: mutate,
  };
}
