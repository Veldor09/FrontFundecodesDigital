// src/app/admin/BillingRequest/services/billing.api.ts
import type {
  CreatePaymentDto,
  LedgerEvent,
  Payment,
  ProgramOption,
} from "../types/billing.types";

// ✅ Servicio del módulo Solicitudes (el correcto)
import { getSolicitud } from "../services/solicitudes.api";

const BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:4000") as string;

// Si tu API usa cookies/sesión, deja credentials: "include"
const DEFAULTS: RequestInit = {
  credentials: "include",
};

/* ====================== Helpers base ====================== */
async function assertOk(res: Response) {
  if (res.ok) return;
  let msg: string;
  try {
    const j = await res.json();
    msg = j?.message || j?.error || res.statusText;
  } catch {
    try {
      msg = await res.text();
    } catch {
      msg = res.statusText;
    }
  }
  const e: any = new Error(msg);
  e.status = res.status; // adjunta el status
  throw e;
}

export function formatApiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/* ========================= PROGRAMS =========================
 * Para ProgramLedger o selects que aún usen /programs del back
 * ========================================================== */
export async function listPrograms(): Promise<ProgramOption[]> {
  const res = await fetch(`${BASE}/programs`, { ...DEFAULTS, cache: "no-store" });
  await assertOk(res);
  const rows = await res.json();
  // backend: [{ id:number, title:string }]
  return (rows ?? []).map((r: any) => ({ id: String(r.id), name: r.title }));
}

/* ========================== PAYMENTS =========================
 * POST /billing/payments
 * =========================================================== */
export async function createPayment(dto: CreatePaymentDto): Promise<Payment> {
  const res = await fetch(`${BASE}/billing/payments`, {
    ...DEFAULTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  await assertOk(res);
  return res.json();
}

/** GET /billing/payments?requestId=ID — lista los pagos por solicitud */
export async function listPaymentsForRequest(requestId: number): Promise<Payment[]> {
  const url = `${BASE}/billing/payments?requestId=${encodeURIComponent(String(requestId))}`;
  const res = await fetch(url, { ...DEFAULTS, cache: "no-store" });
  await assertOk(res);
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

/** (Opcional) GET /billing/payments?projectId=ID — lista los pagos por proyecto */
export async function listPaymentsForProject(projectId: number): Promise<Payment[]> {
  const url = `${BASE}/billing/payments?projectId=${encodeURIComponent(String(projectId))}`;
  const res = await fetch(url, { ...DEFAULTS, cache: "no-store" });
  await assertOk(res);
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

/* =========================== LEDGER ==========================
 * GET /billing/programs/:projectId/ledger
 * =========================================================== */
export async function getLedger(projectId: number): Promise<LedgerEvent[]> {
  const res = await fetch(`${BASE}/billing/programs/${projectId}/ledger`, {
    ...DEFAULTS,
    cache: "no-store",
  });
  await assertOk(res);
  return res.json();
}

/* =================== BILLING REQUEST (back Billing) ===================
 * GET /requests/:id   <- OJO: este :id es del MÓDULO Billing, no el de Solicitudes
 * Lo usamos para consultar el status (PAID, etc.) si existe.
 * ==================================================================== */
export async function getRequest(id: number) {
  const res = await fetch(`${BASE}/requests/${id}`, {
    ...DEFAULTS,
    cache: "no-store",
  });
  await assertOk(res);
  return res.json();
}

/* ========== Crear BillingRequest si NO existe para una Solicitud ==========
 * Caso de uso: antes de crear un pago, necesitamos que el módulo Billing
 * conozca la solicitud (mismo id). Si no existe en Billing, la creamos.
 * POST /requests (Billing) con datos tomados de la Solicitud real.
 * ======================================================================= */

type EnsureArgs = {
  solicitudId: number;
  projectId: number; // requerido por el endpoint de pagos y por el create de billing
  fallbackAmount?: number; // por si la solicitud no trae monto
};

type CreateBillingRequestBody = {
  amount: number;
  concept: string;
  projectId: number;
  createdBy?: string;
  draftInvoiceUrl?: string;
  history?: unknown[];
};

async function createBillingRequest(body: CreateBillingRequestBody) {
  const res = await fetch(`${BASE}/requests`, {
    ...DEFAULTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await assertOk(res);
  return res.json();
}

/**
 * Asegura que exista un BillingRequest con id == solicitudId.
 * - Si GET /requests/:id existe, lo devuelve.
 * - Si 404, consulta la Solicitud real (módulo Request) y crea el BillingRequest
 *   con concept/amount/projectId derivados.
 */
export async function ensureBillingRequestFromSolicitud(args: EnsureArgs) {
  const { solicitudId, projectId, fallbackAmount = 0 } = args;

  // 1) Intento directo: ¿ya existe en Billing?
  try {
    const existing = await getRequest(solicitudId);
    if (existing && typeof existing.id === "number") return existing;
  } catch (e: any) {
    if (e?.status && e.status !== 404) {
      // si no es 404, continuamos igualmente con el create pero dejamos pasar
    }
  }

  // 2) Trae la solicitud del módulo Request (la verdadera)
  const raw = await getSolicitud(solicitudId);
  const data = (raw as any)?.data ?? raw; // soporta {data:...} o directo

  // Derivar concept / amount
  const concept: string =
    String(data?.titulo ?? data?.descripcion ?? `Solicitud ${solicitudId}`).slice(0, 255);

  const amountNum: number = Number(
    data?.monto ?? data?.amount ?? data?.total ?? fallbackAmount ?? 0
  );

  const body: CreateBillingRequestBody = {
    amount: Number.isFinite(amountNum) ? amountNum : 0,
    concept,
    projectId: Number(projectId),
  };

  // 3) Crea en Billing
  const created = await createBillingRequest(body);
  return created;
}

/* =================== Estado Billing para una Solicitud ===================
 * Devuelve el status del BillingRequest (p.ej. "PAID") si existe; null si no.
 * La tabla Payment/Historial usa esto para pintar "PAGADA".
 * ======================================================================= */
export async function getBillingStatusForSolicitud(id: number): Promise<string | null> {
  try {
    const br = await getRequest(Number(id)); // Billing /requests/:id
    if (!br) return null;
    const status = (br?.status ?? br?.estado ?? "").toString().toUpperCase();
    return status || null;
  } catch (e: any) {
    if (e?.status === 404) return null;
    return null;
  }
}
