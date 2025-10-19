// src/app/admin/BillingRequest/components/HistoryTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  fetchSolicitudes,
  type SolicitudListItem,
} from "../services/solicitudes.api";
import { getBillingStatusForSolicitud } from "../services/billing.api";
import HistoryViewModal from "./HistoryViewModal";

/** Deriva el estado visual mezclando Contadora/Dirección + Billing (PAID). */
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

function statusClasses(estado?: string) {
  const e = (estado ?? "").toUpperCase();
  if (e === "PAGADA") return "bg-emerald-100 text-emerald-800";
  if (e === "APROBADA") return "bg-emerald-50 text-emerald-700";
  if (e === "VALIDADA") return "bg-blue-50 text-blue-700";
  if (e === "RECHAZADA") return "bg-rose-100 text-rose-800";
  if (e === "DEVUELTA") return "bg-orange-100 text-orange-800";
  if (e === "PENDIENTE") return "bg-yellow-100 text-yellow-800";
  return "bg-slate-100 text-slate-800";
}

export default function HistoryTable() {
  const [items, setItems] = useState<SolicitudListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Mapa de estado Billing (p.ej. PAID) por idSolicitud
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

  // Filtro general (título/descripcion)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = items;
    if (!q) return base;
    return base.filter((it) => {
      const t = (it as any)?.titulo?.toLowerCase?.() ?? "";
      const d = (it as any)?.descripcion?.toLowerCase?.() ?? "";
      return t.includes(q) || d.includes(q);
    });
  }, [items, search]);

  // En historial queremos: APROBADAS / VALIDADAS (pendientes de pago) y PAGADAS
  // Primero preparamos candidatos (todavía sin filtrar por PAID para evitar glitch).
  const candidates = filtered;

  // IDs de candidatos
  const candidateIds = useMemo(() => candidates.map((r) => r.id), [candidates]);

  // Prefetch del billingStatus de todos los candidatos antes de renderizar
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

  const allKnown = candidateIds.every((id) => typeof bStatusMap[id] !== "undefined");

  // Ahora sí, con todos los statuses conocidos, filtramos lo que debe ver Historial:
  // - PAGADA
  // - APROBADA
  // - VALIDADA
  const visible = useMemo(() => {
    if (!allKnown) return [];
    return candidates.filter((r) => {
      const st = computeDisplayStatus(r, bStatusMap[r.id]);
      return st === "PAGADA" || st === "APROBADA" || st === "VALIDADA";
    });
  }, [candidates, bStatusMap, allKnown]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Historial</h2>
          <p className="text-xs text-slate-500">
            Solicitudes <span className="font-semibold">PAGADAS</span> y{" "}
            <span className="font-semibold">APROBADAS/VALIDADAS</span> (pendientes de pago).
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
        <p className="text-sm text-slate-500">No hay solicitudes para mostrar.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-20">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-32">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-40">Acciones</th>
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
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(estado)}`}>
                        {estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50"
                          onClick={() => {
                            setCtxId(r.id);
                            setOpen(true);
                          }}
                          title="Ver detalle"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle (solicitud + pagos si existen) */}
      {open && ctxId != null && (
        <HistoryViewModal
          open={open}
          solicitudId={ctxId}
          onClose={() => {
            setOpen(false);
            setCtxId(null);
            // Si quieres refrescar después de cerrar:
            // load();
          }}
        />
      )}
    </div>
  );
}
