'use client';
import React, { useMemo, useRef, useState } from 'react';

type Props = {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;     // tamaño por archivo
  maxTotalMB?: number;    // suma total
  maxFiles?: number;      // cantidad máxima
  onChange: (files: File[]) => void;
};

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export default function FileUpload({
  accept = 'application/pdf,image/jpeg,image/png,image/webp',
  multiple = true,
  maxSizeMB = 25,
  maxTotalMB = 100,
  maxFiles = 10,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const totalSize = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files]);

  const pushValid = (incoming: File[]) => {
    const next: File[] = [...files];

    for (const f of incoming) {
      if (!ALLOWED_MIME.has(f.type)) {
        alert(`Formato no permitido: ${f.name} (${f.type || 'desconocido'})`);
        continue;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        alert(`"${f.name}" supera ${maxSizeMB} MB`);
        continue;
      }
      if (next.length + 1 > maxFiles) {
        alert(`Máximo ${maxFiles} archivos por solicitud`);
        break;
      }
      const nextTotal = next.reduce((s, x) => s + x.size, 0) + f.size;
      if (nextTotal > maxTotalMB * 1024 * 1024) {
        alert(`La suma total supera ${maxTotalMB} MB`);
        break;
      }
      next.push(f);
    }

    setFiles(next);
    onChange(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = Array.from(e.target.files ?? []);
    if (!arr.length) return;
    pushValid(arr);
  };

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    onChange(next);
  };

  const clear = () => {
    setFiles([]);
    onChange([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handle}
        className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
      />

      {files.length > 0 && (
        <div className="rounded-md border p-2">
          {/* límite razonable para listas largas dentro del modal */}
          <ul className="max-h-48 overflow-auto space-y-1 text-sm text-slate-700">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.lastModified}`}
                className="flex items-center justify-between"
              >
                <span className="truncate break-words">{f.name}</span>
                <div className="ml-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>{Math.round(f.size / 1024)} KB</span>
                  <button
                    type="button"
                    className="rounded border px-2 py-0.5 hover:bg-slate-50"
                    onClick={() => removeAt(i)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Total: {Math.round(totalSize / 1024)} KB</span>
            <button type="button" className="rounded border px-2 py-0.5 hover:bg-slate-50" onClick={clear}>
              Vaciar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
