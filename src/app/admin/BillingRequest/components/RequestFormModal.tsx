'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import FileUpload from './FileUpload';
import { useCreateSolicitud } from '../hooks/useCreateSolicitud';
import type { CreateSolicitudPayload } from '../services/solicitudes.api';
import {
  fetchProgramasParaSelector,
  fetchProyectosParaSelector,
  type ProgramaOpcion,
  type ProyectoOpcion,
} from '../services/destinos.api';

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

type TipoOrigen = 'PROGRAMA' | 'PROYECTO';

export default function RequestFormModal({ open, onClose, onSaved }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [montoStr, setMontoStr] = useState('');
  const [tipoOrigen, setTipoOrigen] = useState<TipoOrigen | ''>('');
  const [destinoId, setDestinoId] = useState<number | ''>('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [triedSubmit, setTriedSubmit] = useState(false);

  // Catálogos
  const [programas, setProgramas] = useState<ProgramaOpcion[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoOpcion[]>([]);
  const [loadingDestinos, setLoadingDestinos] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Carga catálogos al abrir el modal
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingDestinos(true);
    Promise.allSettled([
      fetchProgramasParaSelector(),
      fetchProyectosParaSelector(),
    ])
      .then(([progRes, proyRes]) => {
        if (cancelled) return;
        if (progRes.status === 'fulfilled') setProgramas(progRes.value);
        if (proyRes.status === 'fulfilled') setProyectos(proyRes.value);
      })
      .finally(() => !cancelled && setLoadingDestinos(false));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setMontoStr('');
    setTipoOrigen('');
    setDestinoId('');
    setFiles([]);
    setSubmitError(null);
    setTriedSubmit(false);
  };

  const { create, loading, error } = useCreateSolicitud({
    onSuccess: () => {
      resetForm();
      onSaved?.();
      onClose();
    },
    onError: (e) => {
      console.error(e);
    },
  });

  // Si cambia el tipo, limpiamos el id seleccionado para evitar inconsistencias.
  const handleTipoChange = (value: TipoOrigen) => {
    setTipoOrigen(value);
    setDestinoId('');
  };

  // Monto numérico parseado
  const monto = useMemo(() => {
    const n = Number(montoStr.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : NaN;
  }, [montoStr]);

  const titleLen = titulo.length;
  const descLen = descripcion.length;
  const titleInvalid = titleLen < TITLE_MIN || titleLen > TITLE_MAX;
  const descInvalid = descLen < DESC_MIN || descLen > DESC_MAX;
  const montoInvalid = !Number.isFinite(monto) || monto <= 0;
  const tipoInvalid = !tipoOrigen;
  const destinoInvalid = !destinoId;
  const filesInvalid = files.length === 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTriedSubmit(true);
    setSubmitError(null);

    if (
      titleInvalid ||
      descInvalid ||
      montoInvalid ||
      tipoInvalid ||
      destinoInvalid ||
      filesInvalid
    ) {
      if (filesInvalid)
        setSubmitError('Debes adjuntar al menos un documento o imagen.');
      return;
    }

    const payload: CreateSolicitudPayload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      monto,
      tipoOrigen: tipoOrigen as TipoOrigen,
      programaId: tipoOrigen === 'PROGRAMA' ? Number(destinoId) : undefined,
      projectId: tipoOrigen === 'PROYECTO' ? Number(destinoId) : undefined,
      files,
    };
    await create(payload);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const errorText =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : null;

  if (!open) return null;

  // Opciones del segundo selector según el tipo elegido
  const destinoOptions =
    tipoOrigen === 'PROGRAMA'
      ? programas.map((p) => ({
          id: p.id,
          label: p.lugar ? `${p.nombre} — ${p.lugar}` : p.nombre,
        }))
      : tipoOrigen === 'PROYECTO'
      ? proyectos.map((p) => ({ id: p.id, label: p.title }))
      : [];

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      aria-modal="true"
      role="dialog"
    >
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-1 space-y-4">
            {/* Título */}
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
                <span className={triedSubmit && titleInvalid ? 'text-red-600' : 'text-slate-500'}>
                  Mínimo {TITLE_MIN}, máximo {TITLE_MAX}.
                </span>
                <span className={triedSubmit && titleInvalid ? 'text-red-600' : 'text-slate-500'}>
                  {titleLen}/{TITLE_MAX}
                </span>
              </div>
            </div>

            {/* Descripción */}
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
                <span className={triedSubmit && descInvalid ? 'text-red-600' : 'text-slate-500'}>
                  Mínimo {DESC_MIN}, máximo {DESC_MAX}.
                </span>
                <span className={triedSubmit && descInvalid ? 'text-red-600' : 'text-slate-500'}>
                  {descLen}/{DESC_MAX}
                </span>
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Monto solicitado <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-r-0 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  ₡
                </span>
                <input
                  inputMode="decimal"
                  type="text"
                  className="w-full rounded-md border border-l-0 p-2 outline-none ring-blue-500 focus:ring-2"
                  value={montoStr}
                  onChange={(e) => setMontoStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="Ej. 250000"
                  disabled={loading}
                  required
                />
              </div>
              {triedSubmit && montoInvalid && (
                <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  Ingresa un monto mayor a 0.
                </div>
              )}
            </div>

            {/* Destino: 1) tipo (Programa/Proyecto) 2) selector dependiente */}
            <fieldset className="rounded-lg border border-slate-200 p-3">
              <legend className="px-2 text-sm font-medium">
                ¿A qué pertenece esta solicitud?{' '}
                <span className="text-red-600">*</span>
              </legend>

              <div className="mt-1 grid grid-cols-2 gap-2">
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 ${
                    tipoOrigen === 'PROGRAMA'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoOrigen"
                    value="PROGRAMA"
                    checked={tipoOrigen === 'PROGRAMA'}
                    onChange={() => handleTipoChange('PROGRAMA')}
                    className="h-4 w-4"
                    disabled={loading}
                  />
                  <div>
                    <div className="text-sm font-medium">Programa de voluntariado</div>
                    <div className="text-xs text-slate-500">
                      Iniciativas con voluntarios asignados (ej. Reforestación).
                    </div>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 ${
                    tipoOrigen === 'PROYECTO'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoOrigen"
                    value="PROYECTO"
                    checked={tipoOrigen === 'PROYECTO'}
                    onChange={() => handleTipoChange('PROYECTO')}
                    className="h-4 w-4"
                    disabled={loading}
                  />
                  <div>
                    <div className="text-sm font-medium">Proyecto</div>
                    <div className="text-xs text-slate-500">
                      Proyectos del catálogo institucional (ej. Sede La Cruz).
                    </div>
                  </div>
                </label>
              </div>

              {/* Selector dependiente */}
              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium">
                  {tipoOrigen === 'PROGRAMA'
                    ? 'Selecciona el programa'
                    : tipoOrigen === 'PROYECTO'
                    ? 'Selecciona el proyecto'
                    : 'Primero elige programa o proyecto'}
                </label>
                <select
                  className="w-full rounded-md border p-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                  value={destinoId}
                  onChange={(e) =>
                    setDestinoId(e.target.value ? Number(e.target.value) : '')
                  }
                  disabled={!tipoOrigen || loadingDestinos || loading}
                  required
                >
                  <option value="">
                    {loadingDestinos
                      ? 'Cargando…'
                      : !tipoOrigen
                      ? '—'
                      : destinoOptions.length === 0
                      ? 'Sin opciones disponibles'
                      : 'Selecciona una opción…'}
                  </option>
                  {destinoOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {triedSubmit && (tipoInvalid || destinoInvalid) && (
                  <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                    Selecciona un programa o un proyecto.
                  </div>
                )}
              </div>
            </fieldset>

            {/* Adjuntos */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Adjuntos <span className="text-red-600">*</span>
              </label>

              <FileUpload
                multiple
                accept="application/pdf,image/jpeg,image/png,image/webp"
                maxSizeMB={FILE_MAX_MB}
                maxTotalMB={TOTAL_MAX_MB}
                maxFiles={MAX_FILES}
                onChange={(arr: File[]) => setFiles(arr)}
              />

              <p className="mt-1 text-xs text-slate-500">
                Formatos permitidos: <b>PDF, JPG, JPEG, PNG, WEBP</b>. Máx. <b>{FILE_MAX_MB} MB</b> por
                archivo, <b> {TOTAL_MAX_MB} MB</b> en total, hasta <b>{MAX_FILES}</b> archivos.
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

          {/* Footer */}
          <div className="border-t bg-white px-5 py-3">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
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
