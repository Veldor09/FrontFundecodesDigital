// src/app/admin/BillingRequest/components/PaymentTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PaymentForm from "./PaymentForm";
import {
  fetchSolicitudes,
  type SolicitudListItem,
} from "../services/solicitudes.api";
import { getBillingStatusForSolicitud } from "../services/billing.api";
import { toast } from "sonner";

/** Deriva el estado visual combinando Contadora/Dirección y Billing (PAID). */
function computeDisplayStatus(
  it: Pick<SolicitudListItem, "estadoContadora" | "estadoDirector">,
  billingStatus?: string | null
) {
  if ((billingStatus ?? "").toUpperCase() === "PAID") return "PAGADA";
  const ed = (it.estadoDirector ?? "PENDIENTE").toString().toUpperCase();
  const ec = (it.estadoContadora ?? "PENDIENTE").toString().toUpperCase();
  if (ed === "APROBADA" || ed === "RECHAZADA") return ed;
  return ec || "PENDIENTE";
}

export default function PaymentTable() {
  const [items, setItems] = useState<SolicitudListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Mapa de estados del Billing (PAID, etc.) por id de solicitud
  const [bStatusMap, setBStatusMap] = useState<Record<number, string | null>>({});

  // Modal
  const [open, setOpen] = useState(false);
  const [ctxId, setCtxId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchSolicitudes();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Filtro por búsqueda (rápido, sin estados)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const t = (it as any)?.titulo?.toLowerCase?.() ?? "";
      const d = (it as any)?.descripcion?.toLowerCase?.() ?? "";
      return t.includes(q) || d.includes(q);
    });
  }, [items, search]);

  // Candidatos a "pendiente de pago" (antes de conocer billingStatus no filtramos)
  const candidates = filtered;

  // IDs candidatos visibles
  const candidateIds = useMemo(() => candidates.map((r) => r.id), [candidates]);

  // Prefetch de billingStatus para todos los IDs candidatos
  useEffect(() => {
    let mounted = true;
    (async () => {
      const next = { ...bStatusMap };
      const missing = candidateIds.filter((id) => typeof next[id] === "undefined");
      if (missing.length === 0) return;

      await Promise.allSettled(
        missing.map(async (id) => {
          const st = await getBillingStatusForSolicitud(id);
          next[id] = st ?? null;
        })
      );

      if (mounted) setBStatusMap(next);
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateIds]);

  // ¿Ya conocemos el billingStatus de todos los candidatos?
  const allKnown = candidateIds.every((id) => typeof bStatusMap[id] !== "undefined");

  // Ahora sí, con todos los estados conocidos, filtramos:
  // Pendientes de pago = APROBADAS/VALIDADAS y NO PAGADAS
  const visible = useMemo(() => {
    if (!allKnown) return [];
    return candidates.filter((r) => {
      const st = computeDisplayStatus(r, bStatusMap[r.id]);
      return st === "APROBADA" || st === "VALIDADA";
    });
  }, [candidates, bStatusMap, allKnown]);

  // Eliminación inmediata tras pagar (sin reload)
  function removeRowInstant(id: number) {
    // Marca como pagada en el mapa
    setBStatusMap((m) => ({ ...m, [id]: "PAID" }));
    // Saca la fila de la tabla al instante
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pendientes de pago</h2>
          <p className="text-xs text-slate-500">
            Solicitudes <span className="font-semibold">APROBADAS/VALIDADAS</span> que requieren registro de pago.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Buscar por título o descripción"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading || !allKnown ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500">No hay solicitudes pendientes de pago.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-20">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-32">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-[200px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const estado = computeDisplayStatus(r, bStatusMap[r.id]);
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">
                      <div className="truncate" title={String((r as any)?.titulo ?? "")}>
                        {(r as any)?.titulo ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                          ${
                            estado === "PAGADA"
                              ? "bg-emerald-100 text-emerald-800"
                              : estado === "APROBADA"
                              ? "bg-emerald-50 text-emerald-700"
                              : estado === "VALIDADA"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold"
                        onClick={() => {
                          setCtxId(r.id);
                          setOpen(true);
                        }}
                      >
                        Añadir pago
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {open && ctxId != null && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Registrar pago</h3>
              <button
                onClick={() => {
                  setOpen(false);
                  setCtxId(null);
                }}
                className="text-sm text-gray-600 hover:text-black"
              >
                Cerrar
              </button>
            </div>
            <div className="p-6">
              <PaymentForm
                requestId={ctxId}
                defaultCurrency="CRC"
                onPaid={() => {
                  // Quita la fila al instante y marca estado como PAID
                  removeRowInstant(ctxId);
                  setOpen(false);
                  setCtxId(null);
                  toast.success("Pago registrado y solicitud retirada de Pendientes de pago");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
