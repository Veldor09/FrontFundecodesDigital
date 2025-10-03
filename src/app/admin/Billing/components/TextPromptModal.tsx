'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  maxLen: number;
  minLen?: number;      // por defecto 1 si required
  required?: boolean;   // por defecto true
  submitText?: string;  // por defecto "Guardar"
  defaultValue?: string;
  onSubmit: (text: string) => void;
  onClose: () => void;
};

export default function TextPromptModal({
  open,
  title,
  label,
  placeholder,
  maxLen,
  minLen,
  required = true,
  submitText = 'Guardar',
  defaultValue = '',
  onSubmit,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(defaultValue);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setText(defaultValue ?? '');
    return () => { document.body.style.overflow = prev; };
  }, [open, defaultValue]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const trimmed = text.trim();
  const min = typeof minLen === 'number' ? minLen : required ? 1 : 0;
  const tooShort = required && trimmed.length < min;
  const tooLong = text.length > maxLen;
  const invalid = tooShort || tooLong;

  const submit = () => {
    if (!invalid) onSubmit(trimmed);
  };

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium">{label}</label>
        <textarea
          className="w-full rounded-md border p-2 outline-none ring-blue-500 focus:ring-2"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLen + 1))} // duro freno
          placeholder={placeholder}
          maxLength={maxLen}
        />

        <div className="mt-1 flex items-center justify-between text-xs">
          <span className={tooShort ? 'text-red-600' : 'text-slate-500'}>
            {required ? `Mínimo ${min} caracteres.` : 'Opcional.'}
          </span>
          <span className={tooLong ? 'text-red-600' : 'text-slate-500'}>
            {text.length}/{maxLen}
          </span>
        </div>

        {invalid && (
          <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
            {tooShort && <>Escribe al menos {min} caracteres.</>}
            {tooShort && tooLong && <><br /></>}
            {tooLong && <>Has superado el máximo permitido.</>}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={invalid}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
