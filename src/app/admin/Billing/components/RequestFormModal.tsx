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

// archivos
const FILE_MAX_MB = 25;
const TOTAL_MAX_MB = 100;
const MAX_FILES = 10;

export default function RequestFormModal({ open, onClose, onSaved }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [triedSubmit, setTriedSubmit] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setFiles([]);
    setSubmitError(null);
    setTriedSubmit(false);
  };

  const { create, loading, error } = useCreateSolicitud({
    onSuccess: () => { resetForm(); onSaved?.(); onClose(); },
    onError: (e) => { console.error(e); },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTriedSubmit(true);
    setSubmitError(null);

    const titleOk = titulo.trim().length >= TITLE_MIN && titulo.trim().length <= TITLE_MAX;
    const descOk = descripcion.trim().length >= DESC_MIN && descripcion.trim().length <= DESC_MAX;
    const hasFiles = files.length > 0;

    if (!titleOk || !descOk || !hasFiles) {
      if (!hasFiles) setSubmitError('Debes adjuntar al menos un documento o imagen.');
      return;
    }

    const payload: CreateSolicitudPayload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      files,
    };
    await create(payload);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const errorText =
    typeof error === 'string' ? error : error instanceof Error ? error.message : null;

  const titleLen = titulo.length;
  const descLen = descripcion.length;
  const titleInvalid = titleLen < TITLE_MIN || titleLen > TITLE_MAX;
  const descInvalid = descLen < DESC_MIN || descLen > DESC_MAX;
  const filesInvalid = files.length === 0;

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Contenedor del modal: alto máximo y layout en columna para pinchar el footer */}
      <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl rounded-2xl bg-white shadow-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4">
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

        {/* Contenido scrollable */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-1 space-y-4">
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
                <span className={(triedSubmit && titleInvalid) ? 'text-red-600' : 'text-slate-500'}>
                  Mínimo {TITLE_MIN}, máximo {TITLE_MAX}.
                </span>
                <span className={(triedSubmit && titleInvalid) ? 'text-red-600' : 'text-slate-500'}>
                  {titleLen}/{TITLE_MAX}
                </span>
              </div>
              {triedSubmit && titleInvalid && (
                <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  El título debe tener entre {TITLE_MIN} y {TITLE_MAX} caracteres.
                </div>
              )}
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
                <span className={(triedSubmit && descInvalid) ? 'text-red-600' : 'text-slate-500'}>
                  Mínimo {DESC_MIN}, máximo {DESC_MAX}.
                </span>
                <span className={(triedSubmit && descInvalid) ? 'text-red-600' : 'text-slate-500'}>
                  {descLen}/{DESC_MAX}
                </span>
              </div>
              {triedSubmit && descInvalid && (
                <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  La descripción debe tener entre {DESC_MIN} y {DESC_MAX} caracteres.
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Adjuntos <span className="text-red-600">*</span>
              </label>

              {/* El propio listado del uploader tiene límite y scroll (ver componente abajo) */}
              <FileUpload
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp"
                maxSizeMB={FILE_MAX_MB}
                maxTotalMB={TOTAL_MAX_MB}
                maxFiles={MAX_FILES}
                onChange={(arr: File[]) => setFiles(arr)}
              />

              <p className="mt-1 text-xs text-slate-500">
                Formatos permitidos: <b>PDF, JPG, JPEG, PNG, WEBP</b>. Máx. <b>{FILE_MAX_MB} MB</b> por archivo,
                <b> {TOTAL_MAX_MB} MB</b> en total, hasta <b>{MAX_FILES}</b> archivos.
              </p>

              {triedSubmit && filesInvalid && (
                <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  Debes adjuntar al menos un documento o imagen.
                </div>
              )}
            </div>

            {submitError && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</div>
            )}
            {errorText && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorText}</div>
            )}
          </div>

          {/* Footer fijo del modal (no scrollea) */}
          <div className="border-t bg-white px-5 py-3">
            <div className="flex justify-end gap-2">
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
                disabled={loading}
              >
                {loading ? 'Enviando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
