// src/app/admin/Billing/components/RequestsTable.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchSolicitudes, type SolicitudListItem } from '../services/solicitudes.api';
import RequestsRow from './RequestsRow';
import RequestFormModal from './RequestFormModal';
import RequestViewModal from './RequestViewModal';

function getEstadoDisplay(it: Pick<SolicitudListItem, 'estadoContadora' | 'estadoDirector'>) {
  const ed = (it.estadoDirector ?? 'PENDIENTE').toString().toUpperCase();
  const ec = (it.estadoContadora ?? 'PENDIENTE').toString().toUpperCase();
  // Regla: lo del director manda si no está PENDIENTE
  if (ed === 'APROBADA' || ed === 'RECHAZADA') return ed;
  // Si director está pendiente, mostramos el de contadora
  return ec || 'PENDIENTE';
}

export default function RequestsTable() {
  const [items, setItems] = useState<SolicitudListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDIENTE' | 'VALIDADA' | 'DEVUELTA' | 'APROBADA' | 'RECHAZADA'
  >('ALL');

  const load = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchSolicitudes();
      // saneamos por si viniera algo raro del back
      const clean = Array.isArray(data)
        ? data.filter((x): x is SolicitudListItem => !!x && typeof (x as any).id !== 'undefined')
        : [];
      setItems(clean);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudieron cargar las solicitudes';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = items.filter((x): x is SolicitudListItem => !!x && typeof (x as any).id !== 'undefined');

    // 1) filtro por estado (si aplica)
    const byStatus =
      statusFilter === 'ALL'
        ? base
        : base.filter((it) => getEstadoDisplay(it) === statusFilter);

    // 2) filtro por texto (igual que antes)
    if (!q) return byStatus;
    return byStatus.filter((it) => {
      const t = (it as any)?.titulo?.toLowerCase?.() ?? '';
      const d = (it as any)?.descripcion?.toLowerCase?.() ?? '';
      const e = getEstadoDisplay(it).toLowerCase();
      return t.includes(q) || d.includes(q) || e.includes(q);
    });
  }, [items, search, statusFilter]);

  const handleView = (id: number) => {
    setSelectedId(id);
    setOpenView(true);
  };

  return (
    <div className="w-full">
      {/* Barra superior: buscador + filtro + botón nueva solicitud */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <input
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:max-w-xs"
            placeholder="Buscar por título, descripción, estado…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Filtro por estado */}
          <select
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:w-48"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value.toUpperCase() as typeof statusFilter)
            }
          >
            <option value="ALL">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="VALIDADA">Validada</option>
            <option value="DEVUELTA">Devuelta</option>
            <option value="APROBADA">Aprobada</option>
            <option value="RECHAZADA">Rechazada</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nueva solicitud
        </button>
      </div>

      {/* Scroll horizontal por si es necesario, pero con celdas truncadas en cada fila */}
      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full table-fixed border-collapse text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-slate-700">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3 w-36">Solicitante</th>
              <th className="px-4 py-3 w-28">Estado</th>
              <th className="px-4 py-3 w-40">Creada</th>
              <th className="px-4 py-3 w-32 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={5}>
                  Cargando…
                </td>
              </tr>
            ) : errorMsg ? (
              <tr>
                <td className="px-4 py-6 text-center text-red-600" colSpan={5}>
                  {errorMsg}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                  No hay solicitudes
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const estado = getEstadoDisplay(item);
                const createdAt = (item as any)?.createdAt ?? null; // viene del back; no romper tipado
                const extended = { ...item, estado, createdAt };
                return (
                  <RequestsRow
                    key={(item as any).id}
                    item={extended as any}
                    onView={handleView}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de creación */}
      {openCreate && (
        <RequestFormModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onSaved={() => load()}
        />
      )}

      {/* Modal de detalle */}
      {openView && selectedId != null && (
        <RequestViewModal
          open={openView}
          solicitudId={selectedId}
          onClose={() => setOpenView(false)}
        />
      )}
    </div>
  );
}
