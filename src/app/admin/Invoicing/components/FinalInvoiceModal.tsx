// src/app/admin/Invoicing/components/FinalInvoiceModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useUploadFinalInvoice } from "../hooks/billing.hooks";
import { Currency } from "../types/billing.types";
import MoneyInput from "./MoneyInput";
import FileUpload from "../../Request/components/FileUpload";
import { getSolicitud } from "../../Request/services/solicitudes.api";

type Props = {
  open: boolean;
  onClose: () => void;
  /** ID de BillingRequest (se usa en la URL del POST) */
  requestId: number;
  /** ID de la SolicitudCompra (solo para mostrar/cargar descripción). Opcional. */
  solicitudId?: number;
  defaultCurrency?: Currency;
};

export default function FinalInvoiceModal({
  open,
  onClose,
  requestId,           // BillingRequestId → POST
  solicitudId,         // SolicitudCompraId → UI/fetch
  defaultCurrency = "CRC",
}: Props) {
  // Formulario factura
  const [number, setNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [total, setTotal] = useState<number | "">("");
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [files, setFiles] = useState<File[]>([]);

  // Datos de la solicitud
  const [reqData, setReqData] = useState<any>(null);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  // Cargar la solicitud por ID (prefiere solicitudId si viene; si no, usa requestId)
  useEffect(() => {
    if (!open) return;

    const fetchId = Number(solicitudId ?? requestId);
    if (!Number.isFinite(fetchId) || fetchId <= 0) {
      setReqData(null);
      setReqError("requestId inválido");
      return;
    }

    setReqLoading(true);
    setReqError(null);

    getSolicitud(fetchId)
      .then((raw) => {
        const data = (raw as any)?.data ?? raw; // soporta {data:...} o directo
        setReqData(data);
      })
      .catch((err: any) =>
        setReqError(err?.message || "Error cargando la solicitud")
      )
      .finally(() => setReqLoading(false));
  }, [open, requestId, solicitudId]);

  // HOOK de subida (usa requestId para la URL, como antes)
  const { mutateAsync: upload, isPending } = useUploadFinalInvoice(requestId);

  if (!open) return null;

  const today = new Date().toISOString().slice(0, 10);

  // ID visible en el header: si nos pasan solicitudId lo mostramos; si no, mostramos requestId
  const requestIdVisible = useMemo(
    () => `#${solicitudId ?? requestId}`,
    [solicitudId, requestId]
  );

  // Descripción desde la solicitud (con fallbacks)
  const descripcionReq = useMemo(() => {
    const d =
      (reqData as any)?.descripcion ??
      (reqData as any)?.description ??
      (reqData as any)?.concept ??
      "";
    return typeof d === "string" ? d : "";
  }, [reqData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!number || !date || total === "" || files.length === 0) {
      alert("Complete número, fecha, monto y al menos un archivo");
      return;
    }
    try {
      // Enviamos solo datos de factura; añadimos solicitudId si lo necesitas en el backend
      await upload({
        number,
        date,
        total: Number(total),
        currency,
        files,
        ...(solicitudId ? { solicitudId: Number(solicitudId) } : {}),
      } as any);
      onClose();
    } catch (err: any) {
      alert(err?.message || "Error al guardar la factura");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* max-h + overflow-hidden para contener el scroll interno */}
      <div className="w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Header sticky */}
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Subir factura final</h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-black"
          >
            Cerrar
          </button>
        </div>

        {/* Body con scroll (mismo layout que compartiste) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Detalle de solicitud: ID + DESCRIPCIÓN */}
            <div className="rounded-md border bg-white p-4">
              <h4 className="text-base font-semibold text-slate-900">
                Detalle de solicitud
              </h4>

              <div className="mt-3 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
                <div>
                  <div className="text-[11px] font-semibold tracking-wide text-slate-400">
                    ID DE SOLICITUD
                  </div>
                  <div className="text-sm text-slate-800">
                    {requestIdVisible}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] font-semibold tracking-wide text-slate-400">
                      DESCRIPCIÓN
                    </div>
                    {reqLoading && (
                      <span className="text-[11px] text-slate-400">
                        (cargando…)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-800">
                    {reqError ? (
                      <span className="text-rose-600">{reqError}</span>
                    ) : (
                      descripcionReq || (
                        <span className="italic text-slate-400">—</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Número de factura */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Número de factura
              </label>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="001-001-00000001"
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input
                type="date"
                max={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Monto + Moneda */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Monto</label>
                <MoneyInput value={total || undefined} onChange={setTotal} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="CRC">CRC</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* Archivos */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Archivos (PDF / imagen)
              </label>
              <FileUpload
                multiple
                maxFiles={10}
                maxSizeMB={25}
                maxTotalMB={100}
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={setFiles}
              />
              <p className="text-xs text-slate-500 mt-1">
                Máx. 10 archivos, 25 MB por archivo, 100 MB total.
              </p>
            </div>
          </div>

          {/* Footer sticky */}
          <div className="px-6 py-4 border-t bg-white sticky bottom-0 z-10">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border text-sm"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
              >
                {isPending ? "Guardando…" : "Guardar factura"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
