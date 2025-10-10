'use client';
import React from 'react';
import { Program } from '../types/billing.types';

type Props = {
  programs: Program[];
  value?: string;
  onChange: (programId: string) => void;
};

export default function ProgramSelect({ programs, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border p-2"
    >
      <option value="">Seleccione un programa</option>
      {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}
