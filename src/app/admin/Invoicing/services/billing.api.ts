// src/app/admin/Invoicing/services/billing.api.ts
const BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:4000") as string;

function q(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

/* ===================== PROGRAMS ===================== */
export async function listPrograms() {
  const res = await fetch(`${BASE}/programs`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  // backend devuelve [{id:number, title:string}], lo mapeamos a {id:string,name:string}
  const rows = await res.json();
  return rows.map((r: any) => ({ id: String(r.id), name: r.title }));
}

/* ===================== REQUESTS ===================== */
export async function listRequests(filter?: {
  status?: string;
  createdBy?: string;
}) {
  const res = await fetch(`${BASE}/requests${q(filter ?? {})}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getRequest(id: number) {
  const res = await fetch(`${BASE}/requests/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createRequest(dto: {
  amount: number;
  concept: string;
  projectId: number;
  createdBy?: string;
  draftInvoiceUrl?: string;
  history?: unknown[];
}) {
  const res = await fetch(`${BASE}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchRequest(id: number, body: any) {
  const res = await fetch(`${BASE}/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ================== FINAL INVOICE =================== */
export async function uploadFinalInvoice(
  requestId: number,
  form: { number: string; date: string; total: number; currency: "CRC" | "USD"; file?: File | null }
) {
  const fd = new FormData();
  fd.set("number", form.number);
  fd.set("date", form.date);
  fd.set("total", String(form.total));
  fd.set("currency", form.currency);
  if (form.file) fd.set("file", form.file);

  const res = await fetch(`${BASE}/requests/${requestId}/final-invoice`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* =================== ALLOCATIONS ==================== */
export async function createAllocation(dto: {
  projectId: number;
  concept: string;
  amount: number;
  date?: string;
}) {
  const res = await fetch(`${BASE}/billing/allocations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ====================== PAYMENTS ===================== */
export async function createPayment(dto: {
  requestId: number;
  projectId: number;
  date: string;
  amount: number;
  currency: "CRC" | "USD";
  reference: string;
}) {
  const res = await fetch(`${BASE}/billing/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ===================== RECEIPTS ====================== */
export async function uploadReceipt(
  projectId: number,
  file: File,
  paymentId?: string
) {
  const fd = new FormData();
  fd.set("projectId", String(projectId));
  if (paymentId) fd.set("paymentId", paymentId);
  fd.set("file", file);

  const res = await fetch(`${BASE}/billing/receipts`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ======================= LEDGER ====================== */
export async function getLedger(projectId: number) {
  const res = await fetch(`${BASE}/billing/programs/${projectId}/ledger`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ====================== HELPERS ====================== */
export function formatApiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
