// src/app/admin/BillingRequest/components/PaymentForm.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  PaymentFormModel,
  Currency,
  toNumberSafe,
} from "../types/billing.types";
import { useCreatePayment, formatApiError } from "../hooks/useBilling";
import { ensureBillingRequestFromSolicitud } from "../services/billing.api";
import { listProjects } from "@/services/projects.service";
import type { Project } from "@/lib/projects.types";

/* ===== Límites UI ===== */
const AMOUNT_MAX_CHARS = 14; // "9999999999.99" ~ 13-14
const REF_MIN = 3;
const REF_MAX = 40;
const METHOD_MAX = 30;

/* ===== Opciones de método ===== */
const METHOD_OPTIONS = ["Transferencia", "SINPE", "Tarjeta", "Efectivo", "Otro"] as const;

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
  projectId: undefined,
  amount: "",
  currency: "CRC",
  date: "",
  reference: "",
  method: "",
};

/** Limpia el input de monto: solo dígitos, 1 separador y máx 2 decimales */
function sanitizeMoneyInput(raw: string): string {
  let s = raw.replace(/[^\d.,]/g, ""); // solo dígitos/coma/punto
  s = s.replace(/,/g, "."); // normaliza coma a punto
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    // quita puntos extra y no numéricos después del primero
    s =
      s.slice(0, firstDot + 1) +
      s
        .slice(firstDot + 1)
        .replace(/\./g, "")
        .replace(/[^0-9]/g, "");
  }
  // límite 2 decimales
  if (s.includes(".")) {
    const [int, dec] = s.split(".");
    return `${int}${dec !== undefined ? "." + dec.slice(0, 2) : ""}`;
  }
  return s;
}

export default function PaymentForm(props: Props) {
  const [model, setModel] = useState<PaymentFormModel>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [triedSubmit, setTriedSubmit] = useState(false);

  const [projects, setProjects] = useState<Array<Pick<Project, "id" | "title">>>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);

  // hoy en formato YYYY-MM-DD para usar en el input date y validaciones
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  /* ===== Cargar proyectos (select) ===== */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingProjects(true);
        const { data } = await listProjects({ page: 1, pageSize: 1000 });
        if (!mounted) return;
        const rows = Array.isArray(data) ? data : [];
        setProjects(
          rows.map((p: any) => ({
            id: Number(p.id),
            title: String(p.title ?? `Proyecto #${p.id}`),
          }))
        );
      } catch {
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setLoadingProjects(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ===== Inicialización ===== */
  useEffect(() => {
    setModel((m) => ({
      ...m,
      requestId: props.requestId,
      projectId: (props as any).projectId ?? m.projectId,
      currency: props.defaultCurrency ?? "CRC",
      date: m.date || today,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.requestId, (props as any).projectId, props.defaultCurrency, today]);

  function setField<K extends keyof PaymentFormModel>(key: K, value: PaymentFormModel[K]) {
    setModel((m) => ({ ...m, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  const createPayment = useCreatePayment();

  /* ===== Validaciones ===== */
  const validators = useMemo(
    () => ({
      requestId: (v: number) => (v > 0 ? "" : "Solicitud inválida"),
      projectId: (v?: number) =>
        typeof v === "number" && v > 0 ? "" : "Selecciona un proyecto",
      amount: (v: string) => {
        if (!v) return "Ingresa el monto";
        const trimmed = v.replace(",", ".");
        if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return "Usa máximo 2 decimales";
        const n = toNumberSafe(trimmed);
        if (!Number.isFinite(n) || n <= 0) return "Monto inválido";
        return "";
      },
      currency: (v: string) => (v === "CRC" || v === "USD" ? "" : "Moneda inválida"),
      date: (v: string) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Fecha inválida (YYYY-MM-DD)";
        if (v > today) return "La fecha no puede ser futura";
        return "";
      },
      reference: (v: string) => {
        const t = v.trim();
        if (t.length < REF_MIN) return `Referencia muy corta (mín. ${REF_MIN} caracteres)`;
        if (t.length > REF_MAX) return `Máximo ${REF_MAX} caracteres`;
        return "";
      },
      // método opcional; si lo llenan, validar largo
      method: (v: string) => {
        const t = (v ?? "").trim();
        if (!t) return ""; // opcional
        if (t.length > METHOD_MAX) return `Máximo ${METHOD_MAX} caracteres`;
        if (t.length < 2) return "Método inválido";
        return "";
      },
    }),
    [today]
  );

  const projectInvalid = !!validators.projectId(model.projectId);
  const amountInvalid = !!validators.amount(model.amount);
  const dateInvalid = !!validators.date(model.date);
  const refInvalid = !!validators.reference(model.reference);

  /* ===== Submit ===== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTriedSubmit(true);

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
      await ensureBillingRequestFromSolicitud({
        solicitudId: model.requestId,
        projectId: Number(model.projectId),
        fallbackAmount: toNumberSafe(model.amount),
      });

      const payment = await createPayment.mutateAsync({
        requestId: model.requestId,
        projectId: Number(model.projectId),
        amount: toNumberSafe(model.amount),
        currency: model.currency,
        date: model.date,
        reference: model.method?.trim()
          ? `${model.reference.trim()} — Método: ${model.method.trim()}`
          : model.reference.trim(),
      });

      toast.success("Pago registrado");

      // Reset
      setModel({
        ...initial,
        requestId: props.requestId,
        projectId: (props as any).projectId ?? undefined,
        currency: props.defaultCurrency ?? "CRC",
        date: today,
      });
      setErrors({});
      setTriedSubmit(false);

      props.onPaid?.(payment.id);
    } catch (err) {
      setErrors((e) => ({ ...e, _server: formatApiError(err) }));
    }
  }

  const busy = createPayment.isPending || loadingProjects;

  const selectedProjectName = useMemo(() => {
    const pid = Number(model.projectId ?? 0);
    const p = projects.find((x) => x.id === pid);
    return p?.title ?? (pid ? `Proyecto #${pid}` : "");
  }, [projects, model.projectId]);

  const disableSubmit =
    busy ||
    !!validators.requestId(model.requestId) ||
    !!validators.projectId(model.projectId) ||
    !!validators.amount(model.amount) ||
    !!validators.currency(model.currency) ||
    !!validators.date(model.date) ||
    !!validators.reference(model.reference) ||
    !!validators.method(model.method ?? "");

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-2xl mx-auto bg-white rounded-2xl shadow flex flex-col max-h-[80vh] ${
        (props as any).className ?? ""
      }`}
    >
      {/* Header compacto (no título duplicado) */}
      <div className="px-5 py-3 border-b bg-white sticky top-0 z-10">
        <p className="text-xs text-slate-500">
          Solicitud <span className="font-semibold">#{props.requestId}</span>
          {selectedProjectName ? (
            <>
              {" "}
              • Proyecto: <span className="font-medium">{selectedProjectName}</span>
            </>
          ) : null}
        </p>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 pt-4 space-y-4">
        {/* Proyecto */}
        <div>
          <label className="text-sm font-medium">
            Proyecto <span className="text-red-600">*</span>
          </label>
          <select
            value={model.projectId ?? 0}
            onChange={(e) => setField("projectId", Number(e.target.value) || undefined)}
            className={`mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 ${
              triedSubmit && projectInvalid ? "ring-red-500" : "ring-blue-500"
            } focus:ring-2`}
            disabled={busy || typeof (props as any).projectId === "number"}
            required
          >
            <option value={0} disabled>
              {loadingProjects ? "Cargando proyectos…" : "Selecciona un proyecto"}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {triedSubmit && projectInvalid && (
            <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {validators.projectId(model.projectId)}
            </div>
          )}
        </div>

        {/* Monto y Moneda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">
              Monto <span className="text-red-600">*</span>
            </label>
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={model.amount}
              onChange={(e) => {
                const cleaned = sanitizeMoneyInput(
                  e.target.value.slice(0, AMOUNT_MAX_CHARS)
                );
                setField("amount", cleaned);
              }}
              onBlur={() => {
                const n = Number(model.amount.replace(",", "."));
                if (Number.isFinite(n) && n > 0) {
                  setField("amount", n.toFixed(2));
                }
              }}
              maxLength={AMOUNT_MAX_CHARS}
              className={`mt-1 w-full rounded-md border p-2 outline-none focus:ring-2 ${
                triedSubmit && amountInvalid ? "ring-red-500" : "ring-blue-500"
              }`}
              required
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={triedSubmit && amountInvalid ? "text-red-600" : "text-slate-500"}>
                Máximo 2 decimales.
              </span>
              <span className="text-slate-500">
                {model.amount.length}/{AMOUNT_MAX_CHARS}
              </span>
            </div>
            {triedSubmit && amountInvalid && (
              <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                {validators.amount(model.amount)}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Moneda <span className="text-red-600">*</span>
            </label>
            <select
              value={model.currency}
              onChange={(e) => setField("currency", e.target.value as Currency)}
              className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CRC">CRC</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Fecha (no futura) */}
        <div>
          <label className="text-sm font-medium">
            Fecha <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            value={model.date}
            max={today}
            onChange={(e) => setField("date", e.target.value)}
            className={`mt-1 w-full rounded-md border p-2 outline-none focus:ring-2 ${
              triedSubmit && dateInvalid ? "ring-red-500" : "ring-blue-500"
            }`}
            required
          />
          {triedSubmit && dateInvalid && (
            <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {validators.date(model.date)}
            </div>
          )}
        </div>

        {/* Referencia y Método */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">
              Referencia <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={model.reference}
              onChange={(e) => setField("reference", e.target.value.slice(0, REF_MAX))}
              maxLength={REF_MAX}
              placeholder="Transacción #ABC123"
              className={`mt-1 w-full rounded-md border p-2 outline-none focus:ring-2 ${
                triedSubmit && refInvalid ? "ring-red-500" : "ring-blue-500"
              }`}
              required
            />
            <div className="mt-1 flex items-center justify-end text-xs text-slate-500">
              {model.reference.length}/{REF_MAX}
            </div>
            {triedSubmit && refInvalid && (
              <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                {validators.reference(model.reference)}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Método de pago (opcional)</label>
            <select
              value={model.method ?? ""}
              onChange={(e) => setField("method", e.target.value.slice(0, METHOD_MAX))}
              className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un método</option>
              {METHOD_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-center justify-end text-xs text-slate-500">
              {(model.method ?? "").length}/{METHOD_MAX}
            </div>
            {errors.method && (
              <div className="mt-1 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                {errors.method}
              </div>
            )}
          </div>
        </div>

        {/* Error del servidor */}
        {errors._server && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {errors._server}
          </div>
        )}
      </div>

      {/* Footer fijo */}
      <div className="border-t bg-white px-5 py-3 sticky bottom-0">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setModel({
                ...initial,
                requestId: props.requestId,
                projectId: (props as any).projectId ?? undefined,
                currency: props.defaultCurrency ?? "CRC",
                date: today,
              });
              setErrors({});
              setTriedSubmit(false);
            }}
            className="rounded-md border px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            Limpiar
          </button>

          <button
            type="submit"
            disabled={disableSubmit}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
          >
            {busy ? "Registrando…" : "Registrar pago"}
          </button>
        </div>
      </div>
    </form>
  );
}
