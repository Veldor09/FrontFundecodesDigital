// src/app/admin/Invoicing/components/ReceiptUploader.tsx
"use client";

import React, { useMemo, useState } from "react";
import FileUpload from "../../Request/components/FileUpload";
import { ReceiptFormModel, ProgramOption } from "../types/billing.types";
import { usePrograms, useUploadReceipt, formatApiError } from "../hooks/billing.hooks";
import ProgramSelect from "./ProgramSelect";

type Props = {
  className?: string;
  onUploaded?: (receiptId: string) => void;
  fixedProjectId?: number;
  suggestedPaymentId?: string;
};

const initial: ReceiptFormModel = {
  projectId: "",
  paymentId: "",
  file: null,
  date: "",
  amount: "",
};

const FILE_MAX_MB = 10;

// Normaliza lo que venga del FileUpload a File[]
function normalizeToFiles(input: unknown): File[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return (input as unknown[]).filter(Boolean).map((x) => x as File);
  }
  if (input instanceof File) return [input];
  if (input instanceof Blob) {
    const f = new File([input], "archivo", { type: input.type || "application/octet-stream" });
    return [f];
  }
  return [];
}

export default function ReceiptUploader({
  className,
  onUploaded,
  fixedProjectId,
  suggestedPaymentId,
}: Props) {
  const [model, setModel] = useState<ReceiptFormModel>({
    ...initial,
    projectId: fixedProjectId ? String(fixedProjectId) : "",
    paymentId: suggestedPaymentId ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<File[]>([]);

  const { data: rawPrograms } = usePrograms();
  const programs: ProgramOption[] = useMemo(
    () =>
      (rawPrograms ?? []).map((p: any) => ({
        id: String(p.id),
        name: p.name ?? p.title ?? String(p.id),
      })),
    [rawPrograms]
  );

  const upload = useUploadReceipt();

  const validators = {
    projectId: (v: string) => (v ? "" : "Selecciona un programa"),
    paymentId: (v: string | undefined) => (!v ? "" : v.trim().length >= 4 ? "" : "ID de pago muy corto"),
    file: (arr: File[]) => (!arr || arr.length === 0 ? "Selecciona un archivo" : ""),
    date: (v: string | undefined) => (!v ? "" : /^\d{4}-\d{2}-\d{2}$/.test(v) ? "" : "Fecha inválida (YYYY-MM-DD)"),
    amount: (v: string | undefined) =>
      !v ? "" : /^\d+(\.\d{1,2})?$/.test(v.replace(",", ".")) ? "" : "Monto inválido (máx. 2 decimales)",
  } as const;

  function setField<K extends keyof ReceiptFormModel>(key: K, value: ReceiptFormModel[K]) {
    setModel((m) => ({ ...m, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    next.projectId = validators.projectId(model.projectId);
    next.paymentId = validators.paymentId(model.paymentId);
    next.file = validators.file(picked);

    const dateErr = validators.date(model.date);
    const amountErr = validators.amount(model.amount);
    if (dateErr) next.date = dateErr;
    if (amountErr) next.amount = amountErr;

    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setErrors(next);

    if (next.projectId || next.file) return;

    try {
      const rec = await upload.mutateAsync({
        projectId: Number(model.projectId),
        paymentId: model.paymentId?.trim() || undefined,
        file: picked[0]!,
      });

      setModel({
        ...initial,
        projectId: fixedProjectId ? String(fixedProjectId) : "",
        paymentId: suggestedPaymentId ?? "",
      });
      setPicked([]);
      setErrors({});
      onUploaded?.(rec.id);
    } catch (err) {
      setErrors((e) => ({ ...e, _server: formatApiError(err) }));
    }
  }

  const busy = upload.isPending;
  const disableProjectSelect = !!fixedProjectId;

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-2xl mx-auto bg-white rounded-2xl shadow p-4 sm:p-6 md:p-8 flex flex-col gap-4 ${className ?? ""}`}
    >
      <h2 className="text-lg sm:text-xl font-semibold">Subir recibo</h2>

      {/* Programa */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Programa</label>
        <ProgramSelect
          programs={programs}
          value={model.projectId}
          onChange={(v: string) => setField("projectId", v)}
        />
        {disableProjectSelect && (
          <p className="text-xs text-gray-500 mt-1">El programa está bloqueado desde el contexto.</p>
        )}
        {errors.projectId && <p className="text-red-600 text-xs mt-1">{errors.projectId}</p>}
      </div>

      {/* ID de pago (opcional) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">ID de pago (opcional)</label>
        <input
          type="text"
          value={model.paymentId ?? ""}
          onChange={(e) => setField("paymentId", e.target.value)}
          placeholder="p.ej. clx7n0h5s00ad9a6q8s8r0e7k"
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500">Si el recibo corresponde a un pago específico, ingresa su ID.</p>
        {errors.paymentId && <p className="text-red-600 text-xs mt-1">{errors.paymentId}</p>}
      </div>

      {/* Archivo (FileUpload single) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          Archivo del recibo (PDF/JPG/PNG/WEBP, máx. {FILE_MAX_MB}MB)
        </label>
        <FileUpload
          multiple={false}
          accept="application/pdf,image/jpeg,image/png,image/webp"
          maxSizeMB={FILE_MAX_MB}
          onChange={(arr: File[] | File | Blob | null | undefined) => {
            const fs = normalizeToFiles(arr).slice(0, 1); // aseguramos File[]
            setPicked(fs);
            setErrors((e) => ({ ...e, file: "" }));
          }}
        />
        {errors.file && <p className="text-red-600 text-xs mt-1">{errors.file}</p>}
      </div>

      {/* Frontend-only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fecha del recibo (no se persiste)</label>
          <input
            type="date"
            value={model.date ?? ""}
            onChange={(e) => setField("date", e.target.value)}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Monto del recibo (no se persiste)</label>
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={model.amount ?? ""}
            onChange={(e) => setField("amount", e.target.value)}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
        </div>
      </div>

      {/* Error servidor */}
      {errors._server && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errors._server}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 font-medium disabled:opacity-60"
        >
          {busy ? "Subiendo..." : "Subir recibo"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setModel({
              ...initial,
              projectId: fixedProjectId ? String(fixedProjectId) : "",
              paymentId: suggestedPaymentId ?? "",
            });
            setPicked([]);
            setErrors({});
          }}
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 font-medium disabled:opacity-60"
        >
          Limpiar
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Los recibos se almacenan y quedan vinculados al programa. Si indicas un ID de pago, también se asocian a ese pago.
      </p>
    </form>
  );
}
