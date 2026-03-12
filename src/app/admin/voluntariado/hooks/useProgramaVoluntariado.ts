"use client";

import useSWR from "swr";
import {
  fetchProgramasVoluntariado,
  normalizePrograma,
  assignVolunteerToPrograma,
  unassignVolunteerFromPrograma,
  updateVolunteerProgramaAssignment,
  type OrigenVoluntariado,
  type AsignacionProgramaPayload,
} from "../services/programaVoluntariadoService";
import type { ProgramaVoluntariado } from "../types/programaVoluntariado";

/**
 * Hook de Programa Voluntariado usado en el módulo de voluntariado
 * - Obtiene todos los programas con voluntarios asignados
 * - Permite asignar / desasignar voluntarios
 * - Permite actualizar la asignación (pago/origen/empresa/horas/fechas) con PATCH parcial
 */
export function useProgramaVoluntariado() {
  const { data, error, isLoading, mutate } = useSWR<ProgramaVoluntariado[]>(
    ["programa-voluntariado:list"],
    async () => {
      const raw = await fetchProgramasVoluntariado();

      // Soporta tanto array directo como { data, total }
      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : [];

      return arr.map(normalizePrograma) as ProgramaVoluntariado[];
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  /* ====================== 🔄 Asignar / Quitar ====================== */

  /**
   * ✅ Asignar voluntario a programa.
   * Ahora acepta payload parcial:
   * - requerido: origen
   * - opcional: intermediario, fechaEntrada, etc.
   * El service completa defaults (pagoRealizado false, fechaEntrada hoy, horas 0...)
   */
  async function assign(
    voluntarioId: string | number,
    programaId: string | number,
    payload: { origen: OrigenVoluntariado } & Partial<AsignacionProgramaPayload>
  ) {
    try {
      await assignVolunteerToPrograma(voluntarioId, programaId, payload);
      await mutate(undefined, { revalidate: true });
      return { ok: true };
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err.message ?? "";

      // Si ya estaba asignado, no consideramos error
      if (
        msg.toLowerCase().includes("ya está asignado") ||
        msg.toLowerCase().includes("ya esta asignado") ||
        msg.toLowerCase().includes("ya asignado")
      ) {
        console.warn("⚠️ Voluntario ya asignado a este programa");
        await mutate(undefined, { revalidate: true });
        return { ok: true, duplicated: true };
      }

      console.error("❌ Error al asignar voluntario:", err);
      throw err;
    }
  }

  async function unassign(voluntarioId: string | number, programaId: string | number) {
    try {
      await unassignVolunteerFromPrograma(voluntarioId, programaId);
      await mutate(undefined, { revalidate: true });
      return { ok: true };
    } catch (err: any) {
      console.error("❌ Error al desasignar voluntario:", err);
      throw err;
    }
  }

  /* ====================== ✅ Actualizar Asignación (PATCH parcial) ====================== */

  async function updateAssignment(
    voluntarioId: string | number,
    programaId: string | number,
    patch: Partial<AsignacionProgramaPayload>
  ) {
    try {
      await updateVolunteerProgramaAssignment(voluntarioId, programaId, patch);
      await mutate(undefined, { revalidate: true });
      return { ok: true };
    } catch (err: any) {
      console.error("❌ Error al actualizar asignación:", err);
      throw err;
    }
  }

  /** Helper directo para pago (lo vas a usar muchísimo en la UI) */
  async function setPago(
    voluntarioId: string | number,
    programaId: string | number,
    pagoRealizado: boolean
  ) {
    return updateAssignment(voluntarioId, programaId, { pagoRealizado });
  }

  /* ====================== 🧩 Output ====================== */
  return {
    data: (data ?? []) as ProgramaVoluntariado[],
    loading: isLoading,
    error,
    assign,
    unassign,
    updateAssignment,
    setPago,
    refetch: () => mutate(undefined, { revalidate: true }),
  };
}