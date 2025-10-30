"use client";

import axios from "axios"; // para axios.isAxiosError
import axiosInstance from "./axiosInstance";
import type {
  CreatePaymentDto,
  LedgerEvent,
  Payment,
  ProgramOption,
} from "../types/billing.types";
import { getSolicitud } from "../services/solicitudes.api";

/* ===========================================================
   🔧 CONFIG GENERAL
=========================================================== */

const BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:4000") as string;

/** Headers automáticos con token localStorage si existe */
function authHeader() {
  const t =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ====================== Helpers base ====================== */
async function assertOkAxios<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const res = await promise;
    return res.data;
  } catch (err: any) {
    let msg: string;
    if (axios.isAxiosError(err)) {
      msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Error desconocido";
    } else {
      msg = String(err);
    }
    const e: any = new Error(msg);
    e.status = err?.response?.status;
    throw e;
  }
}

export function formatApiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/* ===========================================================
   📘 PROGRAMAS (para selects o ledger)
=========================================================== */
export async function listPrograms(): Promise<ProgramOption[]> {
  const rows = await assertOkAxios<any[]>(
    axiosInstance.get(`${BASE}/api/programs`, {
      headers: { ...authHeader() },
      withCredentials: true,
    })
  );
  return (rows ?? []).map((r: any) => ({ id: String(r.id), name: r.title }));
}

/* ===========================================================
   💳 PAGOS
=========================================================== */

/** POST /api/billing/payments */
export async function createPayment(dto: CreatePaymentDto): Promise<Payment> {
  return assertOkAxios(
    axiosInstance.post(`${BASE}/api/billing/payments`, dto, {
      headers: { "Content-Type": "application/json", ...authHeader() },
      withCredentials: true,
    })
  );
}

/** GET /api/billing/payments?requestId=ID */
export async function listPaymentsForRequest(
  requestId: number
): Promise<Payment[]> {
  return assertOkAxios(
    axiosInstance.get(`${BASE}/api/billing/payments`, {
      params: { requestId },
      headers: { ...authHeader() },
      withCredentials: true,
    })
  );
}

/** GET /api/billing/payments?projectId=ID */
export async function listPaymentsForProject(
  projectId: number
): Promise<Payment[]> {
  return assertOkAxios(
    axiosInstance.get(`${BASE}/api/billing/payments`, {
      params: { projectId },
      headers: { ...authHeader() },
      withCredentials: true,
    })
  );
}

/* ===========================================================
   📊 LEDGER
=========================================================== */
export async function getLedger(projectId: number): Promise<LedgerEvent[]> {
  return assertOkAxios(
    axiosInstance.get(`${BASE}/api/billing/programs/${projectId}/ledger`, {
      headers: { ...authHeader() },
      withCredentials: true,
    })
  );
}

/* ===========================================================
   🧾 BILLING REQUEST (usa el módulo Solicitudes real)
=========================================================== */

/** GET /api/solicitudes/:id */
export async function getRequest(id: number) {
  return assertOkAxios<any>(
    axiosInstance.get(`${BASE}/api/solicitudes/${id}`, {
      headers: { ...authHeader() },
      withCredentials: true,
    })
  );
}

/* ===========================================================
   🧩 Crear BillingRequest si NO existe (usa Solicitud real)
=========================================================== */
type EnsureArgs = {
  solicitudId: number;
  projectId: number;
  fallbackAmount?: number;
};

type CreateBillingRequestBody = {
  amount: number;
  concept: string;
  projectId: number;
  createdBy?: string;
  draftInvoiceUrl?: string;
  history?: unknown[];
};

/** POST /api/solicitudes — crea nueva solicitud si no existe */
async function createBillingRequest(body: CreateBillingRequestBody) {
  return assertOkAxios<any>(
    axiosInstance.post(`${BASE}/api/solicitudes`, body, {
      headers: { "Content-Type": "application/json", ...authHeader() },
      withCredentials: true,
    })
  );
}

/**
 * Asegura que exista un BillingRequest con id == solicitudId.
 * - Si ya existe la solicitud, la retorna.
 * - Si no existe, la crea usando datos básicos.
 */
export async function ensureBillingRequestFromSolicitud(args: EnsureArgs) {
  const { solicitudId, projectId, fallbackAmount = 0 } = args;

  // 1️⃣ Intento directo
  try {
    const existing: any = await getRequest(solicitudId);
    if (existing && typeof existing.id === "number") return existing;
  } catch (e: any) {
    if (e?.status && e.status !== 404) {
      console.warn("BillingRequest check error:", e);
    }
  }

  // 2️⃣ Traer la solicitud original
  const raw = await getSolicitud(solicitudId);
  const data = (raw as any)?.data ?? raw;

  const concept: string = String(
    data?.titulo ?? data?.descripcion ?? `Solicitud ${solicitudId}`
  ).slice(0, 255);

  const amountNum: number = Number(
    data?.monto ?? data?.amount ?? data?.total ?? fallbackAmount ?? 0
  );

  const body: CreateBillingRequestBody = {
    amount: Number.isFinite(amountNum) ? amountNum : 0,
    concept,
    projectId: Number(projectId),
  };

  return createBillingRequest(body);
}

/* ===========================================================
   💬 Estado Billing de una Solicitud
=========================================================== */
export async function getBillingStatusForSolicitud(
  id: number
): Promise<string | null> {
  try {
    const br: any = await getRequest(Number(id));
    if (!br) return null;
    const status = (br?.status ?? br?.estado ?? "").toString().toUpperCase();
    return status || null;
  } catch (e: any) {
    if (e?.status === 404) return null;
    return null;
  }
}
