// src/app/admin/Invoicing/components/BillingTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import FinalInvoiceModal from "./FinalInvoiceModal";
import { fetchSolicitudes, type SolicitudListItem } from "../../Request/services/solicitudes.api";

// API del módulo de facturación (Billing)
import * as billingApi from "../services/billing.api";
import type { BillingRequest } from "../types/billing.types";

// Regla de estado visual igual al módulo Request
function getEstadoDisplay(
  it: Pick<SolicitudListItem, "estadoContadora" | "estadoDirector">
) {
  const ed = (it.estadoDirector ?? "PENDIENTE").toString().toUpperCase();
  const ec = (it.estadoContadora ?? "PENDIENTE").toString().toUpperCase();
  if (ed === "APROBADA" || ed === "RECHAZADA") return ed;
  return ec || "PENDIENTE";
}

type Props = {
  className?: string;
};

const ESTADOS_UI = ["ALL", "PENDIENTE", "VALIDADA", "DEVUELTA", "APROBADA", "RECHAZADA"] as const;
type EstadoUi = (typeof ESTADOS_UI)[number];

/**
 * Intenta traducir una fila de Solicitud (Request) al id real de BillingRequest
 * 1) Primero prueba GET /requests/:id (billing)
 * 2) Si 404, busca coincidencias en listRequests() por concept ~ titulo/descripcion
 *    y opcionalmente projectId / monto si vienen en la solicitud.
 */
async function resolveBillingRequestIdFromSolicitud(s: any): Promise<number | null> {
  const maybeId = Number(s?.id);
  if (Number.isFinite(maybeId)) {
    try {
      const direct: BillingRequest = await billingApi.getRequest(maybeId);
      if (direct && typeof direct.id === "number") return direct.id;
    } catch {
      // 404 esperado, seguimos con búsqueda
    }
  }

  const billingList: BillingRequest[] = await billingApi.listRequests();
  const titulo = String(s?.titulo ?? "").toLowerCase();
  const desc = String(s?.descripcion ?? "").toLowerCase();

  // Si tu solicitud trae estos campos, ayúdate con ellos:
  const projectId = Number((s as any)?.projectId);
  const monto = Number((s as any)?.monto);

  const candidates = billingList.filter((r: BillingRequest) => {
    const concept = String(r.concept ?? "").toLowerCase();
    const byText = concept.includes(titulo) || concept.includes(desc);
    const byProject = Number.isFinite(projectId) ? r.projectId === projectId : true;
    const byAmount = Number.isFinite(monto) ? Number(r.amount) === monto : true;
    return byText && byProject && byAmount;
  });

  if (candidates.length === 1) return candidates[0].id;
  // si quieres ser permisivo: if (candidates.length > 0) return candidates[0].id;
  return null;
}

export default function BillingTable({ className }: Props) {
  const [items, setItems] = useState<SolicitudListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EstadoUi>("ALL");

  // Estado del modal — ahora SIEMPRE con id real de BillingRequest
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<{
    requestId: number; // <- id de BillingRequest resuelto
    titulo?: string;
    descripcion?: string;
    programName?: string;
    estado?: string;
    amount?: number;
    projectId?: number;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchSolicitudes();
      const clean = Array.isArray(data)
        ? data.filter(
            (x): x is SolicitudListItem => !!x && typeof (x as any).id !== "undefined"
          )
        : [];
      setItems(clean);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudieron cargar las solicitudes";
      setErrorMsg(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = items.filter(
      (x): x is SolicitudListItem => !!x && typeof (x as any).id !== "undefined"
    );

    const byStatus =
      statusFilter === "ALL" ? base : base.filter((it) => getEstadoDisplay(it) === statusFilter);

    if (!q) return byStatus;
    return byStatus.filter((it) => {
      const t = (it as any)?.titulo?.toLowerCase?.() ?? "";
      const d = (it as any)?.descripcion?.toLowerCase?.() ?? "";
      const e = getEstadoDisplay(it).toLowerCase();
      return t.includes(q) || d.includes(q) || e.includes(q);
    });
  }, [items, search, statusFilter]);

  return (
    <div className={`w-full bg-white rounded-2xl shadow ${className ?? ""}`}>
      {/* Header / Filtros */}
      <div className="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">Facturación final — Solicitudes</h2>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Estado</label>
            <select
              className="border rounded-md px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value.toUpperCase() as EstadoUi)}
            >
              {ESTADOS_UI.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("APROBADA")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium border ${
                statusFilter === "APROBADA"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400"
              }`}
              title="Ver solo solicitudes aprobadas por Dirección"
            >
              Aprobadas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("VALIDADA")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium border ${
                statusFilter === "VALIDADA"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-700 border-blue-200 hover:border-blue-400"
              }`}
              title="Ver solo solicitudes validadas por Contabilidad"
            >
              Validadas
            </button>
          </div>

          <input
            className="border rounded-md px-3 py-2 w-full md:w-64"
            placeholder="Buscar (título, descripción o estado)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => load()}
            className="rounded-md bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm font-medium"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {errorMsg && <div className="p-4 text-center text-red-600 border-b">{errorMsg}</div>}

      {!errorMsg && !loading && filtered.length === 0 && (
        <div className="p-4 text-center text-gray-600 border-b">
          No hay solicitudes para los filtros actuales.
          {statusFilter !== "ALL" && (
            <div className="mt-2">
              <button
                className="rounded-md bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 text-xs font-medium"
                onClick={() => setStatusFilter("ALL")}
              >
                Mostrar todas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Título</th>
              <th className="text-left px-4 py-3">Descripción</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Cargando solicitudes…
                </td>
              </tr>
            ) : (
              filtered.map((it) => {
                const estado = getEstadoDisplay(it);
                const id = (it as any).id as number;
                const titulo = (it as any)?.titulo ?? "-";
                const descripcion = (it as any)?.descripcion ?? "-";

                const puedeSubirFactura = estado === "APROBADA" || estado === "VALIDADA";

                return (
                  <tr key={id} className="border-t">
                    <td className="px-4 py-3">{id}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-[280px] truncate" title={String(titulo)}>
                        {String(titulo)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[420px] truncate" title={String(descripcion)}>
                        {String(descripcion)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                          ${
                            estado === "PENDIENTE"
                              ? "bg-yellow-100 text-yellow-800"
                              : estado === "VALIDADA"
                              ? "bg-blue-100 text-blue-800"
                              : estado === "APROBADA"
                              ? "bg-emerald-100 text-emerald-800"
                              : estado === "RECHAZADA"
                              ? "bg-red-100 text-red-800"
                              : estado === "DEVUELTA"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {puedeSubirFactura && (
                          <button
                            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium"
                            onClick={async () => {
                              // Resolver id REAL de Billing antes de abrir el modal
                              const billingId = await resolveBillingRequestIdFromSolicitud(it);
                              if (!billingId) {
                                alert(
                                  "No se encontró la Solicitud de Facturación asociada a esta solicitud.\n" +
                                    "Asegúrate de que la aprobación/validación haya creado el registro en Facturación."
                                );
                                return;
                              }
                              setCtx({
                                requestId: billingId,
                                titulo: String(titulo ?? ""),
                                descripcion: String(descripcion ?? ""),
                                estado,
                                // si tienes estos datos en la fila, pásalos:
                                // amount: Number((it as any)?.monto) || undefined,
                                // projectId: Number((it as any)?.projectId) || undefined,
                              });
                              setOpen(true);
                            }}
                            title="Subir factura final"
                          >
                            Subir factura
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Factura Final — con id de BillingRequest resuelto */}
      {open && ctx && (
        <FinalInvoiceModal
          open
          onClose={() => {
            setOpen(false);
            setCtx(null);
          }}
          requestId={ctx.requestId}
          requestMeta={{
            titulo: ctx.titulo,
            descripcion: ctx.descripcion,
            estado: ctx.estado,
            amount: ctx.amount,
            projectId: ctx.projectId,
          }}
          defaultCurrency="CRC"
        />
      )}
    </div>
  );
}
