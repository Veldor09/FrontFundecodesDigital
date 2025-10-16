// src/app/admin/Invoicing/components/ProgramSelect.tsx
"use client";
import React from "react";
import { ProgramOption } from "../types/billing.types";

type Props = {
  programs: ProgramOption[];
  value?: string;
  onChange: (programId: string) => void;
  /**
   * Si true (por defecto), cuando no hay programas cargados
   * se muestra un modo manual para ingresar el ID.
   */
  allowManual?: boolean;
  className?: string;
};

export default function ProgramSelect({
  programs,
  value,
  onChange,
  allowManual = true,
  className,
}: Props) {
  const hasOptions = Array.isArray(programs) && programs.length > 0;

  if (!hasOptions && allowManual) {
    // Modo manual: no se recibieron programas del backend
    return (
      <div className={`grid grid-cols-1 gap-2 ${className ?? ""}`}>
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="ID de programa (projectId)"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border p-2"
          />
          <p className="text-xs text-gray-500">
            No se pudo cargar la lista de programas. Ingresa el <b>ID</b> manualmente (por ejemplo, “1”).
          </p>
        </div>
      </div>
    );
  }

  // Modo normal: hay opciones
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md border p-2 ${className ?? ""}`}
    >
      <option value="">Seleccione un programa</option>
      {programs.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
