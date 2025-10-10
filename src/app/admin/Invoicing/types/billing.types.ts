// src/app/admin/Invoicing/types/billing.types.ts

/* ===========================
 * Shared Enums & Aliases
 * =========================== */

export type Currency = 'CRC' | 'USD';

export type BillingRequestStatus =
  | 'PENDING'
  | 'VALIDATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID';

export type ISODateString = string; // e.g., "2025-10-08T12:00:00.000Z" or "2025-10-08"

/* ===========================
 * Core Domain Models (1:1 backend)
 * =========================== */

export interface ProgramOption {
  id: string;   // backend retorna String(req.project.id)
  name: string; // backend retorna title como name
}

export interface BillingRequest {
  id: number;
  amount: number; // Prisma.Decimal -> number in JSON
  concept: string;
  projectId: number;
  status: BillingRequestStatus;
  createdBy?: string | null;
  draftInvoiceUrl?: string | null;
  history?: unknown | null; // backend guarda JSON libre (puede ser any[])

  createdAt: ISODateString;
  updatedAt: ISODateString;

  // Nota: por defecto el backend NO incluye invoice en list/get,
  // a menos que el service lo "include". Lo dejamos opcional.
  invoice?: BillingInvoice | null;
}

export interface BillingInvoice {
  id: string;           // cuid()
  requestId: number;    // UNIQUE en tabla
  projectId: number;
  number: string;
  date: ISODateString;
  total: number;
  currency: Currency;
  url?: string | null;  // si se subió archivo
  mime?: string | null;
  bytes?: number | null;
  isValid: boolean;
  createdAt: ISODateString;
}

export interface ProgramAllocation {
  id: string;
  projectId: number;
  concept: string;
  amount: number;
  date: ISODateString;
}

export interface Payment {
  id: string;
  requestId: number;
  projectId: number;
  amount: number;
  currency: Currency;
  reference: string;
  date: ISODateString;
}

export interface Receipt {
  id: string;
  projectId: number;
  paymentId?: string | null;
  url: string;
  mime: string;
  bytes: number;
  filename: string;
  uploadedAt: ISODateString;
}

/* ===========================
 * Ledger
 * =========================== */

export type LedgerEvent =
  | {
      type: 'BUDGET';
      date: ISODateString;
      amount: number; // positivo (monto asignado)
      meta: { mes: number | null; anio: number | null };
    }
  | {
      type: 'ALLOCATION';
      date: ISODateString;
      amount: number; // negativo (egreso/compromiso)
      meta: { concept: string };
    }
  | {
      type: 'INVOICE';
      date: ISODateString;
      amount: number; // negativo
      meta: { number: string; currency: Currency; valid: boolean };
    }
  | {
      type: 'PAYMENT';
      date: ISODateString;
      amount: number; // negativo
      meta: { reference: string; currency: Currency };
    }
  | {
      type: 'RECEIPT';
      date: ISODateString;
      amount: 0;
      meta: { url: string; mime: string; filename: string; paymentId: string | null };
    };

/* ===========================
 * Query Params & Filters
 * =========================== */

export interface RequestListFilters {
  status?: BillingRequestStatus;
  createdBy?: string;
}

/* ===========================
 * API DTOs (Frontend -> Backend)
 * =========================== */

// 1) Crear Solicitud
export interface CreateBillingRequestDto {
  amount: number;
  concept: string;
  projectId: number;
  draftInvoiceUrl?: string;
  createdBy?: string;
  history?: unknown[]; // libre
}

// 2) PATCH Solicitud (sin archivo)
export interface PatchBillingRequestDto {
  draftInvoiceUrl?: string;
  status?: BillingRequestStatus;
  history?: unknown[];
  createdBy?: string;

  // Opción de compatibilidad: finalInvoice inline (sin archivo)
  finalInvoice?: FinalInvoiceInlineDto;
}

export interface FinalInvoiceInlineDto {
  number: string;
  date: string; // "YYYY-MM-DD"
  total: number;
  currency: Currency;
}

// 3) Subir Factura Final (con archivo opcional)
// Se enviará via multipart/form-data en el servicio
export interface FinalInvoiceFormDto {
  number: string;
  date: string; // "YYYY-MM-DD"
  total: number;
  currency: Currency;
  file?: File; // opcional
}

// 4) Crear Asignación (allocations)
export interface CreateAllocationDto {
  projectId: number;
  concept: string;
  amount: number;
  date?: string; // "YYYY-MM-DD"
}

// 5) Crear Pago
export interface CreatePaymentDto {
  requestId: number;
  projectId: number;   // Debe coincidir con el Request
  date: string;        // "YYYY-MM-DD"
  amount: number;
  currency: Currency;
  reference: string;
}

// 6) Subir Recibo (multipart/form-data)
export interface UploadReceiptDto {
  projectId: number;
  paymentId?: string;
  file: File;
}

/* ===========================
 * UI Form Models (Frontend Only)
 * =========================== */

// Formulario de Solicitud (Tarea 1)
export interface RequestFormModel {
  projectId: string; // seleccionado del ProgramOption.id
  amount: string;    // como string para inputs controlados
  concept: string;
  reason?: string;   // "motivo" (no lo usa el backend; si quieres guardarlo, va en history)
  draftFile?: File | null; // si quieres reusar tu módulo de adjuntos preliminares
}

// Subida de Factura Final (Tarea 2)
export interface FinalInvoiceFormModel {
  requestId: number;
  number: string;
  date: string; // "YYYY-MM-DD"
  total: string; // string para input, convertir a number antes de enviar
  currency: Currency;
  file?: File | null;
}

// Asignación de fondos (Tarea 3)
export interface AllocationFormModel {
  projectId: string;
  concept: string;
  amount: string;
  source?: string; // "fuente de financiamiento" (frontend-only; si deseas persistir, podrías incluirlo en 'concept' o en 'history')
  date?: string;   // "YYYY-MM-DD"
}

// Registro de pago (Tarea 4)
export interface PaymentFormModel {
  requestId: number;
  projectId: number; // bloquear para que coincida con request.projectId
  amount: string;
  currency: Currency;
  date: string;      // "YYYY-MM-DD"
  reference: string;
  method?: string;   // "método de pago" (frontend-only; si deseas persistir, puedes enviarlo como parte de 'reference' o 'history')
}

// Subida de recibo (Tarea 5)
export interface ReceiptFormModel {
  projectId: string;
  paymentId?: string;
  file: File | null;
  date?: string;   // frontend-only (el backend usa uploadedAt); si necesitas guardarla, podrías ponerla en el nombre o history
  amount?: string; // frontend-only (no se guarda en Receipt)
}

/* ===========================
 * Helpers
 * =========================== */

export function toNumberSafe(v: string | number | null | undefined): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/,/g, '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function isValidCurrency(v: string): v is Currency {
  return v === 'CRC' || v === 'USD';
}

export function sameAmount(expected: number, given: number): boolean {
  // comparación estricta como en backend (puedes extender a 2 decimales si fuera necesario)
  return Number(expected) === Number(given);
}
