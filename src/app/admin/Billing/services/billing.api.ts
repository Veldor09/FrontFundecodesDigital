// src/app/admin/Billing/services/billing.api.ts
// Service para MockAPI con SOLO 2 resources: /programs y /requests
// La factura final (Task 294) se guarda embebida en requests.finalInvoice

import type {
  Program,
  PurchaseRequest,
  RequestStatus,
  FinalInvoice,
  FinalInvoiceInput,
} from "../types/billing.types";

/* ===============================
   Config
   =============================== */
const BASE = "https://68d5f077e29051d1c0b00425.mockapi.io";

const ENDPOINTS = {
  programs: "/programs",
  requests: "/requests",
} as const;

/* ===============================
   HTTP helper
   =============================== */
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function http<T>(
  path: string,
  opts?: {
    method?: HttpMethod;
    body?: any;
    query?: Record<string, string | number | boolean | undefined>;
  }
): Promise<T> {
  const url = new URL(BASE + path);
  if (opts?.query) {
    Object.entries(opts.query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    method: opts?.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/* ===============================
   Adaptadores API <-> UI
   =============================== */
function toUiProgram(x: any): Program {
  return { id: x.id, name: x.name };
}

function toUiRequest(x: any): PurchaseRequest {
  return {
    id: String(x.id),
    amount: Number(x.amount ?? 0),
    concept: x.concept ?? "",
    programId: x.programId ?? "",
    reason: x.reason ?? "",
    draftInvoiceUrl: x.draftInvoiceUrl ?? undefined,
    status: (x.status as RequestStatus) ?? "pending",
    createdBy: x.createdBy ?? "me",
    history: Array.isArray(x.history) ? x.history : [],
  };
}

function toUiInvoiceFromRequest(x: any): FinalInvoice {
  return {
    id: String(x.id), // usamos el id de la solicitud como id lógico de la factura
    requestId: String(x.id),
    number: x.finalInvoice.number,
    date: x.finalInvoice.date,
    total: Number(x.finalInvoice.total),
    currency: x.finalInvoice.currency,
    url: x.finalInvoice.url ?? undefined,
    isValid: Boolean(x.finalInvoice.isValid),
  };
}

function fromUiRequest(input: Partial<PurchaseRequest>) {
  // No enviamos null para draftInvoiceUrl (solo incluimos si viene)
  return {
    amount: input.amount,
    concept: input.concept,
    programId: input.programId,
    reason: input.reason,
    ...(input.draftInvoiceUrl !== undefined && {
      draftInvoiceUrl: input.draftInvoiceUrl,
    }),
    status: input.status,
    createdBy: input.createdBy,
    history: input.history ?? [],
  };
}

/* ===============================
   API Público
   =============================== */
export const BillingApi = {
  /* ---------- Programas ---------- */
  async listPrograms(): Promise<Program[]> {
    const data = await http<any[]>(ENDPOINTS.programs);
    return data.map(toUiProgram);
  },

  /* ---------- Solicitudes (Backlog #1) ---------- */
  async createPurchaseRequest(input: {
    amount: number;
    concept: string;
    programId: string;
    reason: string;
    draftInvoiceUrl?: string; // opcional (adjunto preliminar)
    createdBy?: string;       // para "Mis solicitudes"
  }): Promise<PurchaseRequest> {
    const payload = fromUiRequest({
      ...input,
      status: "pending",
      createdBy: input.createdBy ?? "me",
      history: [
        {
          at: new Date().toISOString(),
          by: input.createdBy ?? "me",
          action: "pending",
        },
      ],
    });
    const created = await http<any>(ENDPOINTS.requests, {
      method: "POST",
      body: payload,
    });
    return toUiRequest(created);
  },

  // Robusto: si el filtro por query falla, hace fallback a traer todo y filtrar en cliente
  async listMyRequests(params?: { createdBy?: string }): Promise<PurchaseRequest[]> {
    const by = params?.createdBy;
    try {
      const data = await http<any[]>(ENDPOINTS.requests, {
        query: by ? { createdBy: by } : undefined,
      });
      return data.map(toUiRequest);
    } catch {
      const all = await http<any[]>(ENDPOINTS.requests);
      const filtered = by ? all.filter((r: any) => r.createdBy === by) : all;
      return filtered.map(toUiRequest);
    }
  },

  // Robusto: intenta ?status=... y si falla, trae todo y filtra
  async listRequestsByStatus(status: RequestStatus): Promise<PurchaseRequest[]> {
    try {
      const data = await http<any[]>(ENDPOINTS.requests, { query: { status } });
      return data.map(toUiRequest);
    } catch {
      const all = await http<any[]>(ENDPOINTS.requests);
      const filtered = all.filter((r: any) => r.status === status);
      return filtered.map(toUiRequest);
    }
  },

  // Contadora
  async accountantValidate(id: string, note?: string): Promise<PurchaseRequest> {
    const r = await http<any>(`${ENDPOINTS.requests}/${id}`);
    const history = Array.isArray(r.history) ? r.history : [];
    const patch = {
      status: "validated",
      history: [
        ...history,
        { at: new Date().toISOString(), by: "accountant", action: "validated", note },
      ],
    };
    const updated = await http<any>(`${ENDPOINTS.requests}/${id}`, {
      method: "PATCH",
      body: patch,
    });
    return toUiRequest(updated);
  },

  async accountantReturn(id: string, note: string): Promise<PurchaseRequest> {
    const r = await http<any>(`${ENDPOINTS.requests}/${id}`);
    const history = Array.isArray(r.history) ? r.history : [];
    const patch = {
      status: "pending",
      history: [
        ...history,
        { at: new Date().toISOString(), by: "accountant", action: "returned", note },
      ],
    };
    const updated = await http<any>(`${ENDPOINTS.requests}/${id}`, {
      method: "PATCH",
      body: patch,
    });
    return toUiRequest(updated);
  },

  // Director
  async directorApprove(id: string, note?: string): Promise<PurchaseRequest> {
    const r = await http<any>(`${ENDPOINTS.requests}/${id}`);
    const history = Array.isArray(r.history) ? r.history : [];
    const patch = {
      status: "approved",
      history: [
        ...history,
        { at: new Date().toISOString(), by: "director", action: "approved", note },
      ],
    };
    const updated = await http<any>(`${ENDPOINTS.requests}/${id}`, {
      method: "PATCH",
      body: patch,
    });
    return toUiRequest(updated);
  },

  async directorReject(id: string, note?: string): Promise<PurchaseRequest> {
    const r = await http<any>(`${ENDPOINTS.requests}/${id}`);
    const history = Array.isArray(r.history) ? r.history : [];
    const patch = {
      status: "rejected",
      history: [
        ...history,
        { at: new Date().toISOString(), by: "director", action: "rejected", note },
      ],
    };
    const updated = await http<any>(`${ENDPOINTS.requests}/${id}`, {
      method: "PATCH",
      body: patch,
    });
    return toUiRequest(updated);
  },

  /* ---------- Factura final (Task 294) embebida en /requests ---------- */

  // Suministra solicitudes aprobadas (para elegir al cargar factura)
  async listApprovedRequests(): Promise<PurchaseRequest[]> {
    return this.listRequestsByStatus("approved");
  },

  // Agrega/actualiza finalInvoice en la solicitud
  async uploadFinalInvoice(input: FinalInvoiceInput): Promise<FinalInvoice> {
    const r = await http<any>(`${ENDPOINTS.requests}/${input.requestId}`);
    const history = Array.isArray(r.history) ? r.history : [];

    const patch = {
      finalInvoice: {
        number: input.number,
        date: input.date,
        total: input.total,
        currency: input.currency,
        isValid: true, // temporal; ajusta cuando tengas validación real
        // url: "https://...", // cuando tengas storage real
      },
      // opcional: deja traza en el historial (puedes cambiar "approved" por "invoiced" si prefieres)
      history: [
        ...history,
        { at: new Date().toISOString(), by: "system", action: "approved" },
      ],
    };

    const updated = await http<any>(`${ENDPOINTS.requests}/${input.requestId}`, {
      method: "PATCH",
      body: patch,
    });

    if (!updated.finalInvoice) {
      throw new Error("No se pudo guardar la factura en la solicitud.");
    }
    return toUiInvoiceFromRequest(updated);
  },

  // Deriva "facturas" desde /requests que tengan finalInvoice
  async listInvoices(): Promise<FinalInvoice[]> {
    const data = await http<any[]>(ENDPOINTS.requests);
    const withInvoice = data.filter((x) => x.finalInvoice != null);
    return withInvoice.map(toUiInvoiceFromRequest);
  },

  // Eliminar "factura": limpia finalInvoice en la solicitud
  async deleteInvoice(requestId: string): Promise<void> {
    await http<void>(`${ENDPOINTS.requests}/${requestId}`, {
      method: "PATCH",
      body: { finalInvoice: null },
    });
  },
};
