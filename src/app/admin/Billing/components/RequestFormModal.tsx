// src/app/admin/Billing/components/RequestFormModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import FileUpload from './FileUpload';
import { useCreateSolicitud } from '../hooks/useCreateSolicitud';
import type { CreateSolicitudPayload } from '../services/solicitudes';

type Props = { open: boolean; onClose: () => void; onSaved?: () => void };

// límites
const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESC_MIN = 10;
const DESC_MAX = 1000;

export default function RequestFormModal({ open, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const resetForm = () => {
    setTitulo(''); setDescripcion(''); setFiles([]);
  };

  const { create, loading, error } = useCreateSolicitud({
    onSuccess: () => { resetForm(); onSaved?.(); onClose(); },
    onError: (e) => { console.error(e); },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const titleOk = titulo.trim().length >= TITLE_MIN && titulo.trim().length <= TITLE_MAX;
    const descOk = descripcion.trim().length >= DESC_MIN && descripcion.trim().length <= DESC_MAX;
    if (!titleOk || !descOk) return;

    const tooBig = files.find((f) => f.size > 25 * 1024 * 1024);
    if (tooBig) { alert(`El archivo "${tooBig.name}" supera 25MB`); return; }

    const payload: CreateSolicitudPayload = { titulo: titulo.trim(), descripcion: descripcion.trim(), files };
    await create(payload);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const errorText =
    typeof error === 'string' ? error : error instanceof Error ? error.message : null;

  const titleLen = titulo.length;
  const descLen = descripcion.length;
  const titleInvalid = titleLen < TITLE_MIN || titleLen > TITLE_MAX;
  const descInvalid = descLen < DESC_MIN || descLen > DESC_MAX;

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Nueva solicitud</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Título</label>
            <input
              className="w-full rounded-md border p-2 outline-none ring-blue-500 focus:ring-2"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value.slice(0, TITLE_MAX + 1))}
              placeholder="Ej. Compra de insumos"
              disabled={loading}
              required
              maxLength={TITLE_MAX}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={titleInvalid ? 'text-red-600' : 'text-slate-500'}>
                Mínimo {TITLE_MIN}, máximo {TITLE_MAX}.
              </span>
              <span className={titleInvalid ? 'text-red-600' : 'text-slate-500'}>
                {titleLen}/{TITLE_MAX}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Descripción</label>
            <textarea
              className="w-full rounded-md border p-2 outline-none ring-blue-500 focus:ring-2"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, DESC_MAX + 1))}
              placeholder="Explica brevemente la necesidad"
              disabled={loading}
              required
              maxLength={DESC_MAX}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={descInvalid ? 'text-red-600' : 'text-slate-500'}>
                Mínimo {DESC_MIN}, máximo {DESC_MAX}.
              </span>
              <span className={descInvalid ? 'text-red-600' : 'text-slate-500'}>
                {descLen}/{DESC_MAX}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Adjuntos (varios)</label>
            <FileUpload
              multiple
              accept="application/pdf,image/*"
              maxSizeMB={25}
              onChange={(arr: File[]) => setFiles(arr)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Se envía como <code>multipart/form-data</code> en la clave <code>archivos</code>.
            </p>
            {files.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                {files.map((f) => (
                  <li key={`${f.name}-${f.lastModified}`}>
                    {f.name} ({Math.round(f.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            )}
          </div>

          {errorText && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorText}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-md border px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => { resetForm(); onClose(); }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
              disabled={loading || titleInvalid || descInvalid}
            >
              {loading ? 'Enviando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
