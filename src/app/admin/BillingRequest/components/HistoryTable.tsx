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
import ExportButton from "@/app/admin/_components/ExportButton";
import type { ExportRow } from "@/lib/export";

const HIST_COLS = [
  { key: "titulo",    header: "Título",             width: 28 },
  { key: "monto",     header: "Monto",              width: 14 },
  { key: "origen",    header: "Origen",             width: 12 },
  { key: "programa",  header: "Programa/Proyecto",  width: 22 },
  { key: "solicitante", header: "Solicitante",      width: 22 },
  { key: "estado",    header: "Estado",             width: 14 },
  { key: "fecha",     header: "Fecha",              width: 16 },
];

function solicitudToRow(it: SolicitudListItem, estado: string): ExportRow {
  return {
    titulo:      (it as any).titulo ?? "",
    monto:       it.monto != null ? String(it.monto) : "",
    origen:      it.tipoOrigen ?? "",
    programa:    it.programa?.nombre ?? it.project?.title ?? "",
    solicitante: it.usuario?.name ?? it.usuario?.email ?? "",
    estado,
    fecha:       it.createdAt?.slice(0, 10) ?? "",
  };
}

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
  const [areaFilter, setAreaFilter] = useState<string>("");

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

  const areaOptions = useMemo(() => {
    const seen = new Set<string>();
    items.forEach((it) => {
      const nombre = (it as any).areaOrg?.nombre;
      if (nombre) seen.add(nombre);
    });
    return Array.from(seen).sort();
  }, [items]);

  // Filtro general (título/descripción/área)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((it) => areaFilter ? ((it as any).areaOrg?.nombre ?? "") === areaFilter : true)
      .filter((it) => {
        if (!q) return true;
        const t = (it as any)?.titulo?.toLowerCase?.() ?? "";
        const d = (it as any)?.descripcion?.toLowerCase?.() ?? "";
        return t.includes(q) || d.includes(q);
      });
  }, [items, search, areaFilter]);

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

  // Solo las que ya han sido pagadas aparecen en el historial.
  const visible = useMemo(() => {
    if (!allKnown) return [];
    return candidates.filter((r) => {
      const st = computeDisplayStatus(r, bStatusMap[r.id]);
      return st === "PAGADA";
    });
  }, [candidates, bStatusMap, allKnown]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Header: título + Export alineados igual que en el resto de módulos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Historial</h2>
          <p className="text-xs text-slate-500">
            Solicitudes con pago registrado.
          </p>
        </div>
        <ExportButton
          title="Historial de Solicitudes"
          subtitle="Solicitudes con pago registrado"
          filename="historial_solicitudes"
          columns={HIST_COLS}
          currentRows={visible.map((it) =>
            solicitudToRow(it, computeDisplayStatus(it, bStatusMap[it.id]))
          )}
          fetchAll={async () => {
            const all = await fetchSolicitudes();
            return all.map((it) =>
              solicitudToRow(it, computeDisplayStatus(it, bStatusMap[it.id] ?? null))
            );
          }}
        />
      </div>

      {/* Barra de búsqueda + filtro por área */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10 w-full sm:w-64"
            placeholder="Buscar por título o descripción"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:w-44"
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
        >
          <option value="">Todas las áreas</option>
          {areaOptions.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
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
