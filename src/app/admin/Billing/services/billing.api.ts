// src/app/admin/Billing/services/billing.api.ts
// Service con endpoints reales sin MockAPI
// Incluye soporte para comentarioContadora y comentarioDirector

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
  const url = new URL(path, window.location.origin); // 🔹 usa tu dominio base actual
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
    draftInvoiceUrl: x.draftInvoiceUrl ?? undefined,
    status: (x.status as RequestStatus) ?? "pending",
    createdBy: x.createdBy ?? "me",
    history: Array.isArray(x.history) ? x.history : [],
    comentarioContadora: x.comentarioContadora ?? "",
    comentarioDirector: x.comentarioDirector ?? "",
  };
}

function toUiInvoiceFromRequest(x: any): FinalInvoice {
  return {
    id: String(x.id),
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
  return {
    amount: input.amount,
    concept: input.concept,
    programId: input.programId,
    ...(input.draftInvoiceUrl !== undefined && {
      draftInvoiceUrl: input.draftInvoiceUrl,
    }),
    status: input.status,
    createdBy: input.createdBy,
    history: input.history ?? [],
    comentarioContadora: input.comentarioContadora ?? "",
    comentarioDirector: input.comentarioDirector ?? "",
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

  /* ---------- Solicitudes ---------- */
  async createPurchaseRequest(input: {
    amount: number;
    concept: string;
    programId: string;
    draftInvoiceUrl?: string;
    createdBy?: string;
    comentarioContadora?: string;
    comentarioDirector?: string;
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

  // ---------- Contadora ----------
  async accountantValidate(id: string, note?: string): Promise<PurchaseRequest> {
    const r = await http<any>(`${ENDPOINTS.requests}/${id}`);
    const history = Array.isArray(r.history) ? r.history : [];

    const patch: any = {
      status: "validated",
      comentarioContadora: note ?? "",
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

    const patch: any = {
      status: "pending",
      comentarioContadora: note,
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

  // ---------- Director ----------
  async directorApprove(id: string, note?: string): Promise<PurchaseRequest> {
    const r = await http<any>(`${ENDPOINTS.requests}/${id}`);
    const history = Array.isArray(r.history) ? r.history : [];

    const patch: any = {
      status: "approved",
      comentarioDirector: note ?? "",
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

    const patch: any = {
      status: "rejected",
      comentarioDirector: note ?? "",
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

  /* ---------- Factura final ---------- */
  async listApprovedRequests(): Promise<PurchaseRequest[]> {
    return this.listRequestsByStatus("approved");
  },

  async uploadFinalInvoice(input: FinalInvoiceInput): Promise<FinalInvoice> {
    const r = await http<any>(`${ENDPOINTS.requests}/${input.requestId}`);
    const history = Array.isArray(r.history) ? r.history : [];

    const patch = {
      finalInvoice: {
        number: input.number,
        date: input.date,
        total: input.total,
        currency: input.currency,
        isValid: true,
      },
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

  async listInvoices(): Promise<FinalInvoice[]> {
    const data = await http<any[]>(ENDPOINTS.requests);
    const withInvoice = data.filter((x) => x.finalInvoice != null);
    return withInvoice.map(toUiInvoiceFromRequest);
  },

  async deleteInvoice(requestId: string): Promise<void> {
    await http<void>(`${ENDPOINTS.requests}/${requestId}`, {
      method: "PATCH",
      body: { finalInvoice: null },
    });
  },
};
