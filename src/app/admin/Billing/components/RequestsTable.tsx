'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchSolicitudes, type SolicitudListItem } from '../services/solicitudes';
import RequestsRow from './RequestsRow';
import RequestFormModal from './RequestFormModal';
import RequestViewModal from './RequestViewModal';

export default function RequestsTable() {
  const [items, setItems] = useState<SolicitudListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [search, setSearch] = useState('');

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
    if (!q) return base;
    return base.filter((it) => {
      const t = it.titulo?.toLowerCase() ?? '';
      const d = it.descripcion?.toLowerCase() ?? '';
      const e = it.estado?.toLowerCase() ?? '';
      return t.includes(q) || d.includes(q) || e.includes(q);
    });
  }, [items, search]);

  const handleView = (id: number) => {
    setSelectedId(id);
    setOpenView(true);
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <input
          className="w-full max-w-xs rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          placeholder="Buscar por título, descripción, estado…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nueva solicitud
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left">
            <tr className="text-slate-700">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Solicitante</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Creada</th>
              <th className="px-4 py-3 text-right">Acciones</th>
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
              filtered
                .filter((it): it is SolicitudListItem => !!it && typeof (it as any).id !== 'undefined')
                .map((item) => (
                  <RequestsRow key={item.id} item={item} onView={handleView} />
                ))
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
