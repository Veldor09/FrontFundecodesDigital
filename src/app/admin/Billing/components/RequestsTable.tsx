"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// ⬇️ Tu tipo original; ajusta si el tuyo difiere
import type { PurchaseRequest } from "../types/billing.types";

import RequestsRow from "./RequestsRow";
import RequestFormModal from "./RequestFormModal";

// 🔒 Datos QUEMADOS (3 estados: pendiente, aprobado, denegado)
const MOCK_REQUESTS: PurchaseRequest[] = [
  {
    id: "REQ-001",
    concept: "Insumos para vivero",
    // usa el campo que tu <RequestsRow /> muestre: projectName o programName
    projectId: "PRJ-001",
    projectName: "Plataforma Hogar de Libros",
    amount: 150000,
    currency: "CRC",
    status: "validated",
  } as unknown as PurchaseRequest,
  {
    id: "REQ-002",
    concept: "Capacitación de voluntarios",
    projectId: "PRJ-002",
    projectName: "Módulo Voluntariado FUNDECODES",
    amount: 250,
    currency: "USD",
    status: "approved",
  } as unknown as PurchaseRequest,
  {
    id: "REQ-003",
    concept: "Herramientas de jardinería",
    projectId: "PRJ-003",
    projectName: "CARGONOVA – Mantenimiento",
    amount: 82000,
    currency: "CRC",
    status: "rejected",
  } as unknown as PurchaseRequest,
];

export default function RequestsTable() {
  const [items, setItems] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Cargar datos QUEMADOS
  useEffect(() => {
    setLoading(true);
    try {
      setItems(MOCK_REQUESTS);
      setErrorMsg(null);
    } catch {
      setErrorMsg("No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  // Filtro por concepto (puedes ampliar a proyecto/estado)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => r.concept.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Solicitudes</h2>
          <p className="text-sm text-slate-500">
            Crea y consulta el estado de tus solicitudes
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" /> Nueva Solicitud
        </Button>
      </div>

      {/* Buscador */}
      <div className="max-w-md">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Buscar solicitud
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Ej. Insumos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Estados de carga / error */}
      {loading && <p className="text-sm text-slate-500">Cargando solicitudes…</p>}
      {!loading && errorMsg && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      {/* Tabla */}
      {!loading && !errorMsg && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Concepto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Proyecto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((r) => <RequestsRow key={r.id} req={r} />)
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-slate-500">
                    No se encontraron solicitudes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: crear solicitud (si lo usas, refresca la tabla) */}
      <RequestFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => setRefreshKey((v) => v + 1)}
      />
    </div>
  );
}
