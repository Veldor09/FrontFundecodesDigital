'use client';
import React, { useRef } from 'react';

type Props = {
  accept?: string;
  maxSizeMB?: number;
  onChange: (file: File | null) => void;
};

export default function FileUpload({ accept = 'application/pdf,image/*', maxSizeMB = 10, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > maxSizeMB * 1024 * 1024) {
      alert(`Archivo supera ${maxSizeMB}MB`);
      onChange(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    onChange(f || null);
  };

  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      onChange={handle}
      className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
    />
  );
}
