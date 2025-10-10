"use client";

import React, { useMemo, useState } from "react";
import {
  AllocationFormModel,
  CreateAllocationDto,
  toNumberSafe,
  ProgramOption,
} from "../types/billing.types";
import { useCreateAllocation, usePrograms, formatApiError } from "../hooks/billing.hooks";
import ProgramSelect from "./ProgramSelect";
import MoneyInput from "./MoneyInput";

type Props = {
  className?: string;
  onCreated?: (allocationId: string) => void;
};

const initial: AllocationFormModel = {
  projectId: "",
  concept: "",
  amount: "",
  source: "",
  date: "",
};

export default function AllocationForm({ className, onCreated }: Props) {
  const [model, setModel] = useState<AllocationFormModel>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: rawPrograms } = usePrograms();

  // Normaliza a ProgramOption[] por si el hook devolviera otra forma
  const programs: ProgramOption[] = useMemo(
    () =>
      (rawPrograms ?? []).map((p: any) => ({
        id: String(p.id),
        name: p.name ?? p.title ?? String(p.id),
      })),
    [rawPrograms]
  );

  const createAlloc = useCreateAllocation();

  const validators = useMemo(
    () => ({
      projectId: (v: string) => (v ? "" : "Selecciona un programa"),
      concept: (v: string) =>
        v.trim().length >= 3 ? "" : "El concepto debe tener al menos 3 caracteres",
      source: (v: string) =>
        v && v.trim().length < 2 ? "Fuente inválida" : "",
      amount: (v: string) => {
        if (!v) return "Ingresa el monto";
        const n = toNumberSafe(v);
        if (!Number.isFinite(n) || n <= 0) return "Monto inválido";
        if (!/^\d+(\.\d{1,2})?$/.test(v.replace(",", "."))) return "Usa máximo 2 decimales";
        return "";
      },
      date: (v: string | undefined) => {
        if (!v) return "";
        return /^\d{4}-\d{2}-\d{2}$/.test(v) ? "" : "Fecha inválida (YYYY-MM-DD)";
      },
    }),
    []
  );

  function setField<K extends keyof AllocationFormModel>(key: K, value: AllocationFormModel[K]) {
    setModel((m) => ({ ...m, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    next.projectId = validators.projectId(model.projectId);
    next.concept = validators.concept(model.concept);
    next.source = validators.source(model.source ?? "");
    next.amount = validators.amount(model.amount);
    next.date = validators.date?.(model.date) || "";

    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const conceptWithSource =
      model.source?.trim()
        ? `${model.concept.trim()} — Fuente: ${model.source.trim()}`
        : model.concept.trim();

    const body: CreateAllocationDto = {
      projectId: Number(model.projectId),
      concept: conceptWithSource,
      amount: toNumberSafe(model.amount),
      date: model.date || undefined,
    };

    try {
      const created = await createAlloc.mutateAsync(body);
      onCreated?.(created.id);
      setModel(initial);
      setErrors({});
    } catch (err) {
      setErrors((e) => ({ ...e, _server: formatApiError(err) }));
    }
  }

  const busy = createAlloc.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-2xl mx-auto bg-white rounded-2xl shadow p-4 sm:p-6 md:p-8 flex flex-col gap-4 ${className ?? ""}`}
    >
      <h2 className="text-lg sm:text-xl font-semibold">Asignar monto a programa</h2>

      {/* Programa */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Programa</label>
        <ProgramSelect
          programs={programs}
          value={model.projectId}
          onChange={(v: string) => setField("projectId", v)}
        />
        {errors.projectId && <p className="text-red-600 text-xs mt-1">{errors.projectId}</p>}
      </div>

      {/* Concepto y Fuente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Concepto</label>
          <input
            type="text"
            value={model.concept}
            onChange={(e) => setField("concept", e.target.value)}
            placeholder="Compra de materiales"
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.concept && <p className="text-red-600 text-xs mt-1">{errors.concept}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fuente de financiamiento (opcional)</label>
          <input
            type="text"
            value={model.source ?? ""}
            onChange={(e) => setField("source", e.target.value)}
            placeholder="Donación XYZ / BID / Presupuesto Interno"
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.source && <p className="text-red-600 text-xs mt-1">{errors.source}</p>}
        </div>
      </div>

      {/* Monto y Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Monto</label>
          <MoneyInput
            value={model.amount ? toNumberSafe(model.amount) : undefined}
            onChange={(n: number) => setField("amount", String(n))}
          />
          <p className="text-xs text-gray-500">Usa punto para decimales. Máximo 2 decimales.</p>
          {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fecha (opcional)</label>
          <input
            type="date"
            value={model.date ?? ""}
            onChange={(e) => setField("date", e.target.value)}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
        </div>
      </div>

      {/* Error servidor */}
      {errors._server && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errors._server}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-medium disabled:opacity-60"
        >
          {busy ? "Guardando..." : "Asignar monto"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setModel(initial);
            setErrors({});
          }}
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 font-medium disabled:opacity-60"
        >
          Limpiar
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Si los fondos disponibles del programa son insuficientes, verás un error del sistema con el monto disponible.
      </p>
    </form>
  );
}
