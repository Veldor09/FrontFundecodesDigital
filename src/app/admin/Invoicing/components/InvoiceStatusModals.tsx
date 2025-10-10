"use client";

import { BadgeCheck, CheckCircle2, X } from "lucide-react";

type Kind = "validated" | "approved";

interface BaseProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber?: string;
  total?: number;
  currency?: string; // "CRC" | "USD" | ...
}

function formatMoney(total?: number, currency: string = "CRC") {
  if (!total) return "—";
  try {
    return new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(total);
  } catch {
    // fallback simple
    return `${currency} ${total.toLocaleString()}`;
  }
}

function MiniModal({
  open,
  onClose,
  title,
  message,
  icon,
  accent = "text-emerald-600",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className={`${accent}`}>{icon}</span>
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-500"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 text-sm text-slate-700">{message}</div>

        <div className="p-4 pt-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal cuando la factura queda VALIDADA */
export function InvoiceValidatedModal({
  open,
  onClose,
  invoiceNumber,
  total,
  currency = "CRC",
}: BaseProps) {
  const title = "Factura validada";
  const message = `La factura ${invoiceNumber ?? "—"} ha sido validada correctamente por contabilidad. Monto: ${formatMoney(total, currency)}.`;
  return (
    <MiniModal
      open={open}
      onClose={onClose}
      title={title}
      message={message}
      icon={<BadgeCheck className="h-5 w-5" />}
      accent="text-blue-600"
    />
  );
}

/** Modal cuando la factura queda APROBADA */
export function InvoiceApprovedModal({
  open,
  onClose,
  invoiceNumber,
  total,
  currency = "CRC",
}: BaseProps) {
  const title = "Factura aprobada";
  const message = `La factura ${invoiceNumber ?? "—"} ha sido aprobada por dirección. Monto: ${formatMoney(total, currency)}.`;
  return (
    <MiniModal
      open={open}
      onClose={onClose}
      title={title}
      message={message}
      icon={<CheckCircle2 className="h-5 w-5" />}
      accent="text-emerald-600"
    />
  );
}
