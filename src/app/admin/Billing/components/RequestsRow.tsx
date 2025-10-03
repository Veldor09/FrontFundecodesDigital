'use client';

import React from 'react';
import type { SolicitudListItem } from '../services/solicitudes';

function statusClasses(estado?: string) {
  const e = (estado ?? '').toUpperCase();
  if (e === 'APROBADA') return 'bg-green-100 text-green-700';
  if (e === 'RECHAZADA') return 'bg-red-100 text-red-700';
  if (e === 'VALIDADA') return 'bg-blue-100 text-blue-700';
  if (e === 'DEVUELTA') return 'bg-purple-100 text-purple-700';
  if (e === 'PENDIENTE' || e === 'EN_REVISION' || e === 'REVISION')
    return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

type Props = {
  item?: SolicitudListItem | null;     // <- ahora opcional/nullable
  onView?: (id: number) => void;
};

export default function RequestsRow({ item, onView }: Props) {
  // Si por cualquier motivo llega undefined/null, render seguro
  const id = (item?.id ?? null) as number | null;
  const estado = item?.estado ?? 'PENDIENTE';
  const titulo = item?.titulo ?? '—';
  const descripcion = item?.descripcion ?? '—';
  const createdAt = item?.createdAt;

  return (
    <tr className="border-t">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800">{titulo}</div>
        <div className="text-xs text-slate-500 line-clamp-1">{descripcion}</div>
      </td>

      {/* Solicitante (reservado por ahora) */}
      <td className="px-4 py-3">—</td>

      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusClasses(estado)}`}>
          {estado}
        </span>
      </td>

      <td className="px-4 py-3">{formatDate(createdAt)}</td>

      <td className="px-4 py-3 text-right">
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
          onClick={() => (id != null ? onView?.(id) : undefined)}
          disabled={!onView || id == null}
          aria-disabled={!onView || id == null}
        >
          Ver
        </button>
      </td>
    </tr>
  );
}
