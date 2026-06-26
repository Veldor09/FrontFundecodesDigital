"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { Visitacion, VisitacionCreateInput } from "../types/visitacion";

interface Props {
  open: boolean;
  initial?: Visitacion | null;
  onClose: () => void;
  onSave: (payload: VisitacionCreateInput & { id?: number }) => Promise<unknown>;
}

interface PaisEntry {
  pais: string;
  cantidad: number;
}

const EMPTY: VisitacionCreateInput = {
  fecha: "",
  totalPersonas: 0,
  nacionales: 0,
  notas: "",
};

export default function VisitacionForm({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<VisitacionCreateInput>(EMPTY);
  const [paisEntries, setPaisEntries] = useState<PaisEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        fecha: initial.fecha?.slice(0, 10) ?? "",
        totalPersonas: initial.totalPersonas ?? 0,
        nacionales: initial.nacionales ?? 0,
        notas: initial.notas ?? "",
      });
      // Reconstruir entradas de países desde el mapa almacenado
      const mapa = initial.paisesExtranjeros;
      if (mapa && Object.keys(mapa).length > 0) {
        setPaisEntries(Object.entries(mapa).map(([pais, cantidad]) => ({ pais, cantidad })));
      } else {
        setPaisEntries([]);
      }
    } else {
      setForm(EMPTY);
      setPaisEntries([]);
    }
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const extranjeros = Math.max(0, (form.totalPersonas ?? 0) - (form.nacionales ?? 0));
  const totalDistribuido = paisEntries.reduce((s, e) => s + (e.cantidad || 0), 0);
  const restante = extranjeros - totalDistribuido;

  function setNum(field: "totalPersonas" | "nacionales", raw: string) {
    const n = Math.max(0, parseInt(raw, 10) || 0);
    setForm((prev) => ({ ...prev, [field]: n }));
  }

  function agregarPais() {
    setPaisEntries((prev) => [...prev, { pais: "", cantidad: 0 }]);
  }

  function actualizarPais(idx: number, campo: keyof PaisEntry, valor: string | number) {
    setPaisEntries((prev) =>
      prev.map((e, i) =>
        i === idx ? { ...e, [campo]: campo === "cantidad" ? Math.max(0, Number(valor) || 0) : valor } : e
      )
    );
  }

  function eliminarPais(idx: number) {
    setPaisEntries((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.fecha) { setError("La fecha es requerida."); return; }
    if (form.nacionales > form.totalPersonas) {
      setError("Los nacionales no pueden superar el total de personas.");
      return;
    }

    // Validar distribución de países si se ingresó alguna
    const entriesConDatos = paisEntries.filter((e) => e.pais.trim() !== "" || e.cantidad > 0);
    if (entriesConDatos.length > 0) {
      const paisesVacios = entriesConDatos.some((e) => e.pais.trim() === "");
      if (paisesVacios) {
        setError("Todos los países deben tener un nombre.");
        return;
      }
      if (totalDistribuido !== extranjeros) {
        setError(`La suma de extranjeros por país (${totalDistribuido}) debe ser igual al total de extranjeros (${extranjeros}).`);
        return;
      }
      const nombres = entriesConDatos.map((e) => e.pais.trim().toLowerCase());
      if (new Set(nombres).size !== nombres.length) {
        setError("No puede haber países duplicados.");
        return;
      }
    }

    // Construir mapa de países
    let paisesExtranjeros: Record<string, number> | null = null;
    if (entriesConDatos.length > 0) {
      paisesExtranjeros = Object.fromEntries(
        entriesConDatos.map((e) => [e.pais.trim(), e.cantidad])
      );
    }

    setLoading(true);
    try {
      await onSave({
        ...form,
        paisesExtranjeros,
        ...(initial ? { id: initial.id } : {}),
      });
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  const isEdit = !!initial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            {isEdit ? "Editar registro de visita" : "Nuevo registro de visita"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fecha */}
          <div>
            <Label htmlFor="v-fecha">Fecha *</Label>
            <Input
              id="v-fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
              required
            />
          </div>

          {/* Total personas */}
          <div>
            <Label htmlFor="v-total">Total de personas *</Label>
            <Input
              id="v-total"
              type="number"
              min={0}
              value={form.totalPersonas}
              onChange={(e) => setNum("totalPersonas", e.target.value)}
              required
            />
          </div>

          {/* Nacionales */}
          <div>
            <Label htmlFor="v-nacionales">Nacionales *</Label>
            <Input
              id="v-nacionales"
              type="number"
              min={0}
              max={form.totalPersonas}
              value={form.nacionales}
              onChange={(e) => setNum("nacionales", e.target.value)}
              required
            />
          </div>

          {/* Extranjeros — calculado */}
          <div>
            <Label>Extranjeros (calculado)</Label>
            <div className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 items-center">
              {extranjeros}
            </div>
            {form.nacionales > form.totalPersonas && (
              <p className="text-xs text-amber-600 mt-1">
                Los nacionales superan el total — ajusta los valores.
              </p>
            )}
          </div>

          {/* ── Países de origen de extranjeros ───────────────── */}
          {extranjeros > 0 && (
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">País de origen (extranjeros)</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribuidos: <span className={`font-semibold ${restante < 0 ? "text-red-600" : restante === 0 && paisEntries.length > 0 ? "text-green-600" : "text-sky-600"}`}>{totalDistribuido}</span> de {extranjeros}
                    {restante > 0 && paisEntries.length > 0 && (
                      <span className="text-amber-600"> — faltan {restante}</span>
                    )}
                    {restante < 0 && (
                      <span className="text-red-600"> — excede en {Math.abs(restante)}</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={agregarPais}
                  className="flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Agregar país
                </button>
              </div>

              {paisEntries.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">
                  Sin detalle por país — opcional. Presiona "Agregar país" para registrar el origen.
                </p>
              ) : (
                <div className="space-y-2">
                  {paisEntries.map((entry, idx) => {
                    const maxParaEsteIdx = entry.cantidad + restante;
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="País"
                          value={entry.pais}
                          onChange={(e) => actualizarPais(idx, "pais", e.target.value)}
                          className="flex-1 text-sm h-9"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={maxParaEsteIdx}
                          value={entry.cantidad}
                          onChange={(e) => actualizarPais(idx, "cantidad", e.target.value)}
                          className="w-20 text-sm h-9"
                        />
                        <button
                          type="button"
                          onClick={() => eliminarPais(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Eliminar país"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notas */}
          <div>
            <Label htmlFor="v-notas">Notas (opcional)</Label>
            <textarea
              id="v-notas"
              rows={3}
              value={form.notas ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Registrar visita"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
