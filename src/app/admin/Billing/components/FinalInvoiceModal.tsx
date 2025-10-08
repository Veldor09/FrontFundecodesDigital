"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Currency } from "../types/billing.types";
import FileUpload from "./FileUpload";
import MoneyInput from "./MoneyInput";

/* ===========================
   Tipos
   =========================== */
type Project = {
  id: string;
  name: string;
};

type ApprovedRequest = {
  id: string;
  projectId: string;
  concept: string;
  amount: number;
  currency: Currency;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  projects: Project[];                 // ✅ antes: Project
  approvedRequests: ApprovedRequest[]; // ✅ ok
};

/* ===========================
   Componente principal
   =========================== */
export default function FinalInvoiceModal({
  open,
  onClose,
  onSaved,
  projects,
  approvedRequests,
}: Props) {
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario
  const [projectId, setProjectId] = useState<string>("");
  const [requestId, setRequestId] = useState("");
  const [number, setNumber] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [total, setTotal] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("CRC");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filtrar solicitudes por proyecto seleccionado
  const filteredRequests = useMemo(() => {
    return approvedRequests.filter((r) => !projectId || r.projectId === projectId);
  }, [approvedRequests, projectId]);

  // Solicitud seleccionada
  const selectedReq = useMemo(
    () => approvedRequests.find((r) => r.id === requestId),
    [approvedRequests, requestId]
  );

  // Validación: el total no puede ser menor al aprobado
  const diffOK = useMemo(() => {
    if (!selectedReq) return true;
    return total >= Number(selectedReq.amount ?? 0);
  }, [selectedReq, total]);

  const resetForm = () => {
    setProjectId("");
    setRequestId("");
    setNumber("");
    setDate(new Date().toISOString().slice(0, 10));
    setTotal(0);
    setCurrency("CRC");
    setFile(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg(null);
      if (!requestId) throw new Error("Seleccione una solicitud aprobada");
      if (!number.trim()) throw new Error("Número de factura requerido");
      if (total <= 0) throw new Error("El total debe ser mayor a 0");
      if (!diffOK) throw new Error("El total no puede ser menor al monto aprobado");
      if (file && file.size > 10 * 1024 * 1024) throw new Error("El archivo supera 10MB");

      setSubmitting(true);

      // 🔹 Aquí se conecta al backend cuando exista endpoint.
      // const fd = new FormData(); ...

      onSaved?.();
      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "No se pudo cargar la factura");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Carga y validación de factura final</h2>

        {errorMsg && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* PROYECTO */}
          <div>
            <label className="block text-sm font-medium">Proyecto</label>
            <select
              className="w-full rounded-md border p-2"
              value={projectId}
              onChange={(e) => {
                const id = e.target.value;
                setProjectId(id);
                setRequestId((prev) => {
                  const req = approvedRequests.find((r) => r.id === prev);
                  return req && req.projectId === id ? prev : "";
                });
              }}
              disabled={loadingData}
            >
              <option value="">Seleccione proyecto</option>
              {projects.map((p: Project) => (  // ✅ tipado explícito
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* SOLICITUD */}
          <div>
            <label className="block text-sm font-medium">Solicitud aprobada</label>
            <select
              className="w-full rounded-md border p-2"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              disabled={loadingData}
            >
              <option value="">Seleccione solicitud</option>
              {filteredRequests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.concept} —{" "}
                  {r.currency === "USD"
                    ? `$${Number(r.amount).toLocaleString()}`
                    : `₡${Number(r.amount).toLocaleString()}`}
                </option>
              ))}
            </select>
            {selectedReq && (
              <p className="mt-1 text-xs text-gray-600">
                Monto aprobado:{" "}
                {selectedReq.currency === "USD"
                  ? `$${Number(selectedReq.amount).toLocaleString()}`
                  : `₡${Number(selectedReq.amount).toLocaleString()}`}
              </p>
            )}
          </div>

          {/* Número + Fecha */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Número de factura</label>
              <input
                className="w-full rounded-md border p-2"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="FAC-00123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fecha</label>
              <input
                type="date"
                className="w-full rounded-md border p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Moneda + Total */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Moneda</label>
              <select
                className="w-full rounded-md border p-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                <option value="CRC">CRC</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Total factura</label>
              <MoneyInput value={total} onChange={setTotal} />
              {selectedReq && !diffOK && (
                <p className="mt-1 text-xs text-red-600">
                  El total no puede ser menor al monto aprobado (
                  {selectedReq.currency === "USD"
                    ? `$${Number(selectedReq.amount).toLocaleString()}`
                    : `₡${Number(selectedReq.amount).toLocaleString()}`}
                  ).
                </p>
              )}
            </div>
          </div>

          {/* Archivo */}
          <div>
            <label className="block text-sm font-medium">Archivo (PDF/imagen)</label>
            <FileUpload multiple={false} maxSizeMB={10} onChange={setFile} />
            <p className="mt-1 text-xs text-slate-500">
              (Demo) Aquí no se suben binarios; cuando conectes storage, guarda la URL.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border px-4 py-2"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting || loadingData || !requestId || !number.trim() || total <= 0 || !diffOK}
            >
              {submitting ? "Guardando…" : "Guardar factura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
