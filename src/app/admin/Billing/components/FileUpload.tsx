'use client';
import React, { useRef } from 'react';

type BaseProps = {
  accept?: string;
  maxSizeMB?: number; // tamaño por archivo
  className?: string;
};

// Single-file (compat por defecto)
type SingleProps = BaseProps & {
  multiple?: false;
  onChange: (file: File | null) => void;
};

// Multi-file
type MultiProps = BaseProps & {
  multiple: true;
  onChange: (files: File[]) => void;
};

type Props = SingleProps | MultiProps;

export default function FileUpload({
  accept = 'application/pdf,image/*',
  maxSizeMB = 10,
  ...props
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMulti = props.multiple === true;

  const reset = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);

    // Validación por archivo
    const tooBig = list.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) {
      alert(`El archivo "${tooBig.name}" supera ${maxSizeMB}MB`);
      reset();
      if (isMulti) {
        (props as MultiProps).onChange([]);
      } else {
        (props as SingleProps).onChange(null);
      }
      return;
    }

    if (isMulti) {
      (props as MultiProps).onChange(list);
    } else {
      (props as SingleProps).onChange(list[0] ?? null);
    }
  };

  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={isMulti}
      onChange={handle}
      className={
        (props as any).className ??
        'block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200'
      }
    />
  );
}
