'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  fetchSolicitud,
  fetchSolicitudHistorial,
  type SolicitudDetail,
  type HistEvent,
} from '../services/solicitudes';

type Props = {
  open: boolean;
  solicitudId: number;
  onClose: () => void;
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function getNiceFileName(a: any, index: number) {
  const first =
    a?.originalName ??
    a?.originalname ??
    a?.filename ??
    a?.name ??
    null;
  if (first) return String(first);
  if (typeof a?.url === 'string' && a.url) {
    try {
      const noQuery = a.url.split('?')[0].split('#')[0];
      const last = noQuery.split('/').pop();
      if (last) return decodeURIComponent(last);
    } catch {}
  }
  if (typeof a?.path === 'string' && a.path) {
    const last = a.path.split(/[/\\]+/).pop();
    if (last) return String(last);
  }
  return `archivo-${a?.id ?? index + 1}`;
}

/** Acepta null también para evitar TS2345 */
function normalize(s?: string | null) {
  return (s ?? '').toString().trim().toUpperCase();
}

function pickFirst(...vals: any[]): string | null {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function extractReasonFromDetail(data: any): string | null {
  return (
    pickFirst(
      data?.comentario,
      data?.motivo,
      data?.observaciones,
      data?.nota,
      data?.razon,
      data?.razonDevolucion,
      data?.razonRechazo
    ) ?? null
  );
}

/** Primer parámetro acepta null | undefined para evitar TS2345 */
function extractReasonFromHistory(
  estado: string | null | undefined,
  history: HistEvent[]
): string | null {
  if (!Array.isArray(history) || history.length === 0) return null;
  const target = normalize(estado);

  // registro más reciente con ese estado y comentario
  const matchByState = history.find(
    (h) => normalize(h.estado ?? null) === target && (h.comentario ?? '').trim()
  );
  if (matchByState?.comentario) return matchByState.comentario.trim();

  // o cualquier comentario más reciente
  const anyComment = history.find((h) => (h.comentario ?? '').trim());
  return anyComment?.comentario?.trim() ?? null;
}

/** Acepta null también */
function reasonLabel(estado?: string | null) {
  const e = normalize(estado);
  if (e === 'DEVUELTA') return 'Motivo de devolución';
  if (e === 'RECHAZADA') return 'Motivo de rechazo';
  return 'Observaciones';
}

export default function RequestViewModal({ open, solicitudId, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<SolicitudDetail | null>(null);

  const [history, setHistory] = useState<HistEvent[] | null>(null);
  const [historyErr, setHistoryErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      setLoading(true);
      setErrorMsg(null);
      setHistory(null);
      setHistoryErr(null);
      try {
        const d = await fetchSolicitud(solicitudId);
        setData(d);

        const estado = d?.estado ?? null; // <- puede ser null
        const hasInlineReason = !!extractReasonFromDetail(d);
        if (!hasInlineReason && (normalize(estado) === 'DEVUELTA' || normalize(estado) === 'RECHAZADA')) {
          try {
            const h = await fetchSolicitudHistorial(solicitudId);
            const ordered =
              Array.isArray(h)
                ? [...h].sort((a, b) => {
                    const ta = new Date(a.createdAt ?? 0).getTime();
                    const tb = new Date(b.createdAt ?? 0).getTime();
                    return tb - ta;
                  })
                : [];
            setHistory(ordered);
          } catch (he: any) {
            setHistoryErr(he?.message ?? 'No se pudo cargar el historial');
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'No se pudo cargar el detalle';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, solicitudId]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  if (!open) return null;

  const estado = data?.estado ?? null; // <- puede ser null
  // 1) intentar desde el detalle
  let reason = data ? extractReasonFromDetail(data as any) : null;
  // 2) fallback: desde historial
  if (!reason && history) {
    reason = extractReasonFromHistory(estado, history);
  }
  const showReason = !!reason && ['DEVUELTA', 'RECHAZADA'].includes(normalize(estado));

  return (
    <div
      ref={dialogRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg">
        <div className="mb-2 flex items-start justify-between">
          <h2 className="text-lg font-semibold">Detalle de solicitud</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-600">Cargando…</div>
        ) : errorMsg ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</div>
        ) : !data ? (
          <div className="py-8 text-center text-sm text-slate-600">Sin datos</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase text-slate-500">Título</div>
              <div className="text-slate-800">{data.titulo}</div>
            </div>

            <div>
              <div className="text-xs uppercase text-slate-500">Descripción</div>
              <div className="whitespace-pre-wrap text-slate-800">{data.descripcion}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase text-slate-500">Estado</div>
                <div className="text-slate-800">{estado ?? 'PENDIENTE'}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-500">Creada</div>
                <div className="text-slate-800">{formatDate(data.createdAt)}</div>
              </div>

              <div>
                <div className="text-xs uppercase text-slate-500">Solicitante</div>
                <div className="text-slate-800">{data.usuario?.nombre ?? '—'}</div>
              </div>
            </div>

            {showReason && (
              <div>
                <div className="text-xs uppercase text-slate-500">{reasonLabel(estado)}</div>
                <div className="whitespace-pre-wrap text-slate-800">{reason}</div>
                {historyErr && (
                  <div className="mt-2 rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                    Nota: {historyErr}
                  </div>
                )}
              </div>
            )}

            {Array.isArray((data as any).archivos) && (data as any).archivos.length > 0 && (
              <div>
                <div className="text-xs uppercase text-slate-500">Adjuntos</div>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {(data as any).archivos.map((a: any, i: number) => {
                    const name = getNiceFileName(a, i);
                    const href = a?.url ?? '#';
                    const downloadable = typeof a?.url === 'string' && !!a.url;
                    return (
                      <li key={`${name}-${i}`}>
                        {downloadable ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {name}
                          </a>
                        ) : (
                          <span>{name}</span>
                        )}
                        {typeof a?.size === 'number' && (
                          <span className="ml-2 text-xs text-slate-500">
                            ({Math.round(a.size / 1024)} KB)
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
