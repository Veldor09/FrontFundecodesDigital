// src/app/admin/Invoicing/components/PaymentForm.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  PaymentFormModel,
  Currency,
  ProgramOption,
  toNumberSafe,
} from "../types/billing.types";
import {
  useCreatePayment,
  usePrograms,
  useRequest,
  formatApiError,
} from "../hooks/billing.hooks";

/**
 * Este formulario registra un pago y, al completar con éxito,
 * el backend cambia el estado del Request a PAID.
 *
 * Puedes usarlo de dos formas:
 *  - Pasando requestId y projectId (bloquea el programa)
 *  - Solo con requestId (autocarga el Request y bloquea proyecto)
 */
type Props =
  | {
      className?: string;
      requestId: number;
      projectId?: never;
      defaultCurrency?: Currency;
      onPaid?: (paymentId: string) => void;
    }
  | {
      className?: string;
      requestId: number;
      projectId: number;
      defaultCurrency?: Currency;
      onPaid?: (paymentId: string) => void;
    };

const initial: PaymentFormModel = {
  requestId: 0,
  projectId: 0,
  amount: "",
  currency: "CRC",
  date: "",
  reference: "",
  method: "", // frontend-only
};

export default function PaymentForm(props: Props) {
  const [model, setModel] = useState<PaymentFormModel>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: programs, isLoading: loadingPrograms } = usePrograms();
  // Si solo viene requestId, cargamos el Request para conocer el projectId
  const { data: reqData } = useRequest(props.requestId, { enabled: !!props.requestId });

  // Sincroniza valores iniciales
  useEffect(() => {
    const projectId = props.projectId ?? (reqData?.projectId ?? 0);
    setModel((m) => ({
      ...m,
      requestId: props.requestId,
      projectId,
      currency: props.defaultCurrency ?? "CRC",
    }));
  }, [props.requestId, props.projectId, props.defaultCurrency, reqData?.projectId]);

  const createPayment = useCreatePayment();

  const validators = useMemo(
    () => ({
      requestId: (v: number) => (v > 0 ? "" : "Request inválido"),
      projectId: (v: number) => (v > 0 ? "" : "Programa inválido"),
      amount: (v: string) => {
        if (!v) return "Ingresa el monto";
        const n = toNumberSafe(v);
        if (!Number.isFinite(n) || n <= 0) return "Monto inválido";
        if (!/^\d+(\.\d{1,2})?$/.test(v.replace(",", "."))) return "Usa máximo 2 decimales";
        return "";
      },
      currency: (v: string) => (v === "CRC" || v === "USD" ? "" : "Moneda inválida"),
      date: (v: string) =>
        /^\d{4}-\d{2}-\d{2}$/.test(v) ? "" : "Fecha inválida (YYYY-MM-DD)",
      reference: (v: string) =>
        v.trim().length >= 3 ? "" : "Referencia muy corta (mín. 3 caracteres)",
      method: (v: string) => (v && v.trim().length < 2 ? "Método inválido" : ""), // opcional
    }),
    []
  );

  function setField<K extends keyof PaymentFormModel>(key: K, value: PaymentFormModel[K]) {
    setModel((m) => ({ ...m, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    next.requestId = validators.requestId(model.requestId);
    next.projectId = validators.projectId(model.projectId);
    next.amount = validators.amount(model.amount);
    next.currency = validators.currency(model.currency);
    next.date = validators.date(model.date);
    next.reference = validators.reference(model.reference);
    next.method = validators.method(model.method ?? "");

    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      const payment = await createPayment.mutateAsync({
        requestId: model.requestId,
        projectId: model.projectId,
        amount: toNumberSafe(model.amount),
        currency: model.currency,
        date: model.date,
        // Puedes concatenar el método de pago para conservarlo:
        reference: model.method?.trim()
          ? `${model.reference.trim()} — Método: ${model.method.trim()}`
          : model.reference.trim(),
      });

      // Reset & callback
      setModel((m) => ({
        ...initial,
        requestId: props.requestId,
        projectId: props.projectId ?? (reqData?.projectId ?? 0),
        currency: props.defaultCurrency ?? "CRC",
      }));
      setErrors({});
      if (props.onPaid) props.onPaid(payment.id);
    } catch (err) {
      // Posibles errores: "El pago no corresponde al mismo proyecto del request"
      setErrors((e) => ({ ...e, _server: formatApiError(err) }));
    }
  }

  const busy = createPayment.isPending || loadingPrograms;

  // Para mostrar el nombre del programa en cabecera
  const programName =
    programs?.find((p: ProgramOption) => Number(p.id) === model.projectId)?.name ??
    (model.projectId ? `#${model.projectId}` : "-");

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-2xl mx-auto bg-white rounded-2xl shadow p-4 sm:p-6 md:p-8 flex flex-col gap-4 ${
        (props as any).className ?? ""
      }`}
    >
      <h2 className="text-lg sm:text-xl font-semibold">Registrar pago</h2>

      {/* Contexto */}
      <div className="rounded-lg bg-gray-50 border p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Solicitud #{props.requestId}</span>
          <span className="text-gray-600">Programa: {programName}</span>
        </div>
        <p className="text-gray-600 mt-1">
          Al registrar el pago, la solicitud pasará al estado <strong>PAID</strong>.
        </p>
      </div>

      {/* Monto y Moneda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Monto</label>
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={model.amount}
            onChange={(e) => setField("amount", e.target.value)}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">Máximo 2 decimales.</p>
          {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Moneda</label>
          <select
            value={model.currency}
            onChange={(e) => setField("currency", e.target.value as Currency)}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CRC">CRC</option>
            <option value="USD">USD</option>
          </select>
          {errors.currency && <p className="text-red-600 text-xs mt-1">{errors.currency}</p>}
        </div>
      </div>

      {/* Fecha */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Fecha</label>
        <input
          type="date"
          value={model.date}
          onChange={(e) => setField("date", e.target.value)}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
      </div>

      {/* Referencia y Método de pago */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Referencia</label>
          <input
            type="text"
            value={model.reference}
            onChange={(e) => setField("reference", e.target.value)}
            placeholder="Transacción #ABC123"
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.reference && <p className="text-red-600 text-xs mt-1">{errors.reference}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Método de pago (opcional)</label>
          <input
            type="text"
            value={model.method ?? ""}
            onChange={(e) => setField("method", e.target.value)}
            placeholder="Transferencia / Sinpe / Tarjeta / Efectivo"
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.method && <p className="text-red-600 text-xs mt-1">{errors.method}</p>}
        </div>
      </div>

      {/* Errores del servidor */}
      {errors._server && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errors._server}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={busy || !model.requestId || !model.projectId}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 font-medium disabled:opacity-60"
        >
          {busy ? "Registrando..." : "Registrar pago"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            setModel((m) => ({
              ...initial,
              requestId: props.requestId,
              projectId: props.projectId ?? (reqData?.projectId ?? 0),
              currency: props.defaultCurrency ?? "CRC",
            }))
          }
          className="inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 font-medium disabled:opacity-60"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
