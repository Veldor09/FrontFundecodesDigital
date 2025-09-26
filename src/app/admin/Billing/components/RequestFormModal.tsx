"use client";

import React, { useState } from "react";
import MoneyInput from "./MoneyInput";
import FileUpload from "./FileUpload";
import { useCreateSolicitud } from "../hooks/useCreateSolicitud";
import type { solicitud, Currency } from "../types/solicitudes";
import { useToast } from "../hooks/useToast";

type Project = { id: string; name: string };

// 🔒 Lista QUEMADA de proyectos
const PROJECTS: Project[] = [
  { id: "PRJ-001", name: "Plataforma Hogar de Libros" },
  { id: "PRJ-002", name: "Módulo Voluntariado FUNDECODES" },
  { id: "PRJ-003", name: "CARGONOVA – Mantenimiento" },
];

function ProjectSelect({
  projects,
  value,
  onChange,
  disabled,
}: {
  projects: Project[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="w-full rounded-md border p-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Seleccione un proyecto</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function RequestFormModal({ open, onClose, onSaved }: Props) {
  const { success, error } = useToast();

  // Hook para crear
  const { create, loading } = useCreateSolicitud({
    onSuccess: () => {
      success("Solicitud creada (estado: pendiente)");
      onSaved?.();
      resetForm();
      onClose();
    },
    onError: (e) => {
      error(e instanceof Error ? e.message : "No se pudo crear la solicitud");
    },
  });

  // Form state (incluye currency requerido por tu type)
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("CRC");
  const [concept, setConcept] = useState("");
  const [projectId, setProjectId] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (!open) return null;

  const resetForm = () => {
    setAmount(0);
    setCurrency("CRC");
    setConcept("");
    setProjectId("");
    setReason("");
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!amount || amount <= 0) throw new Error("El monto debe ser mayor a 0");
      if (!concept.trim()) throw new Error("El concepto es requerido");
      if (!projectId) throw new Error("Seleccione un proyecto");
      if (!reason.trim()) throw new Error("El motivo es requerido");
      if (file && file.size > 10 * 1024 * 1024) {
        throw new Error("El archivo supera 10MB");
      }

      // MockAPI: guardamos solo una URL de vista previa
      const attachmentUrl = file ? URL.createObjectURL(file) : undefined;

      const payload: solicitud = {
        amount,
        currency,          // ✅ requerido por tu type
        concept,
        projectId,
        reason,
        attachmentUrl,     // ✅ nombre exacto según tu type
        requesterId: "me",
        requesterName: "Usuario Actual",
        status: "pendiente",
        // projectName es opcional: agrégalo si lo querés:
        // projectName: PROJECTS.find(p => p.id === projectId)?.name,
      };

      await create(payload);
    } catch (err: any) {
      error(err?.message ?? "Error al crear la solicitud");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  {/* modal más pequeño + bordes más redondeados */}
  <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg">
    <h2 className="mb-4 text-lg font-semibold">Nueva solicitud de compra</h2>

    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 2 columnas: Monto/Moneda/Concepto/Proyecto */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Monto</label>
          <MoneyInput value={amount} onChange={setAmount} />
        </div>

        <div>
          <label className="block text-sm font-medium">Moneda</label>
          <select
            className="w-full rounded-md border p-2"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            disabled={loading}
          >
            <option value="CRC">CRC</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Concepto</label>
          <input
            className="w-full rounded-md border p-2"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Ej. Insumos para vivero"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Proyecto</label>
          <ProjectSelect
            projects={PROJECTS}
            value={projectId}
            onChange={setProjectId}
            disabled={loading}
          />
        </div>
      </div>

      {/* Motivo: NO se mueve, ancho completo */}
      <div>
        <label className="block text-sm font-medium">Motivo</label>
        <textarea
          className="w-full rounded-md border p-2"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explica brevemente la necesidad"
        />
      </div>

      {/* Adjunto (puede quedar debajo en una sola columna) */}
      <div>
        <label className="block text-sm font-medium">Adjunto preliminar (PDF/imagen)</label>
        <FileUpload onChange={setFile} />
        <p className="mt-1 text-xs text-slate-500">
          Máx. 10MB. En este entorno temporal se guardará solo una URL de vista previa (no se sube el binario).
        </p>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="rounded-md border px-4 py-2"
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
          disabled={loading || !concept.trim() || !projectId || !reason.trim() || amount <= 0}
        >
          {loading ? "Enviando..." : "Guardar"}
        </button>
      </div>
    </form>
  </div>
</div>

  );
}
