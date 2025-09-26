"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Undo2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Program } from "../types/billing.types";

/** Tipo mínimo que la tabla necesita (independiente de PurchaseRequest) */
type Row = {
  id: string;
  concept: string;
  programId: string;
  amount: number;
  currency: "CRC" | "USD";
  status: "approved" | "validated" | "rejected";
};

function NoteModal({
  open,
  title,
  placeholder = "Escribe una nota (opcional)",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) setNote("");
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="p-4 space-y-3">
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={4}
            value={note}
            placeholder={placeholder}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              onClick={() => onConfirm(note)}
              disabled={loading}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- MOCKS --- */
const MOCK_PROGRAMS: Program[] = [
  { id: "PRJ-001", name: "Plataforma Hogar de Libros" } as Program,
  { id: "PRJ-002", name: "Módulo Voluntariado FUNDECODES" } as Program,
];

const MOCK_REQUESTS: Row[] = [
  {
    id: "REQ-001",
    concept: "Insumos para vivero",
    programId: "PRJ-001",
    amount: 150000,
    currency: "CRC",
    status: "validated",
  },
  {
    id: "REQ-002",
    concept: "Capacitación de voluntarios",
    programId: "PRJ-002",
    amount: 250,
    currency: "USD",
    status: "approved",
  },
  {
    id: "REQ-003",
    concept: "Herramientas de jardinería",
    programId: "PRJ-001",
    amount: 82000,
    currency: "CRC",
    status: "rejected",
  },
];

export default function AccountantValidationTable() {
  const [items, setItems] = useState<Row[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // modal devolver
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [returnBusy, setReturnBusy] = useState(false);

  // carga simulada
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setPrograms(MOCK_PROGRAMS);
      setItems(MOCK_REQUESTS);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const programName = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of programs) map.set(p.id, p.name);
    return (pid?: string) => (pid ? map.get(pid) ?? pid : "—");
  }, [programs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      [r.concept, programName(r.programId)]
        .filter(Boolean)
        .some((t) => (t as string).toLowerCase().includes(q))
    );
  }, [items, search, programName]);

  // Mantener estados en inglés
  const validateOne = (id: string) => {
    setLoadingAction(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );
      setLoadingAction(null);
    }, 400);
  };

  const openReturn = (id: string) => {
    setReturnId(id);
    setReturnOpen(true);
  };

  const doReturn = (_note: string) => {
    if (!returnId) return;
    setReturnBusy(true);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((r) => (r.id === returnId ? { ...r, status: "rejected" } : r))
      );
      setReturnOpen(false);
      setReturnId(null);
      setReturnBusy(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Validación de Solicitudes</h2>
          <p className="text-sm text-slate-500">Solicitudes pendientes de validación</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Buscar por concepto o programa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No hay solicitudes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Concepto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Programa</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">{r.id}</td>
                  <td className="px-4 py-3">{r.concept}</td>
                  <td className="px-4 py-3">{programName(r.programId)}</td>
                  <td className="px-4 py-3">
                    {r.currency === "USD"
                      ? `$${r.amount.toLocaleString()}`
                      : `₡${r.amount.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        r.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : r.status === "validated"
                          ? "bg-blue-100 text-blue-700"
                          : r.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => validateOne(r.id)}
                        disabled={loadingAction === r.id}
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        {loadingAction === r.id ? "Validando..." : "Validar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-700 border-amber-300 hover:bg-amber-50"
                        onClick={() => openReturn(r.id)}
                        disabled={loadingAction === r.id}
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Devolver
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NoteModal
        open={returnOpen}
        title="Devolver solicitud"
        placeholder="Indique el motivo para devolver la solicitud"
        confirmText="Devolver"
        onConfirm={doReturn}
        onClose={() => setReturnOpen(false)}
        loading={returnBusy}
      />
    </div>
  );
}
