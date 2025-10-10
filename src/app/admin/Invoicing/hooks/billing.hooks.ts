// src/app/admin/Invoicing/hooks/billing.hooks.ts
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

import type {
  BillingInvoice,
  BillingRequest,
  CreateAllocationDto,
  CreatePaymentDto,
  FinalInvoiceFormDto,
  LedgerEvent,
  Payment,
  ProgramAllocation,
  ProgramOption,
  Receipt,
  RequestListFilters,
} from "../types/billing.types";

import * as api from "../services/billing.api";

/* =========================================================
 * Opciones simples para queries
 * ======================================================= */
type SimpleQueryOpts = {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
};

/* =========================================================
 * PROGRAMS
 * ======================================================= */
export function usePrograms(
  opts?: SimpleQueryOpts
): UseQueryResult<ProgramOption[], unknown> {
  return useQuery<ProgramOption[], unknown>({
    queryKey: ["programs"],
    queryFn: api.listPrograms,
    enabled: opts?.enabled ?? true,
    refetchOnWindowFocus: opts?.refetchOnWindowFocus ?? false,
  } as any);
}

/* =========================================================
 * REQUESTS (MISMA FUENTE QUE EL MÓDULO REQUEST)
 * ======================================================= */
export function useRequests(
  filters?: RequestListFilters,
  opts?: SimpleQueryOpts
): UseQueryResult<BillingRequest[], unknown> {
  return useQuery<BillingRequest[], unknown>({
    queryKey: ["requests", filters?.status ?? null, filters?.createdBy ?? null],
    queryFn: () => api.listRequests(filters),
    enabled: opts?.enabled ?? true,
    refetchOnWindowFocus: opts?.refetchOnWindowFocus ?? false,
  } as any);
}

export function useRequest(
  id?: number | null,
  opts?: SimpleQueryOpts
): UseQueryResult<BillingRequest, unknown> {
  return useQuery<BillingRequest, unknown>({
    queryKey: ["request", id ?? null],
    queryFn: () => api.getRequest(Number(id)),
    enabled: (opts?.enabled ?? true) && !!id,
    refetchOnWindowFocus: opts?.refetchOnWindowFocus ?? false,
  } as any);
}

/* =========================================================
 * CREATE REQUEST (por si el módulo de Request reutiliza este hook)
 * ======================================================= */
export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      amount: number;
      concept: string;
      projectId: number;
      createdBy?: string;
      draftInvoiceUrl?: string;
      history?: unknown[];
    }): Promise<BillingRequest> => {
      return api.createRequest(dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

/* =========================================================
 * FINAL INVOICE
 * ======================================================= */
export function useUploadFinalInvoice(requestId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: FinalInvoiceFormDto): Promise<BillingInvoice> => {
      return api.uploadFinalInvoice(requestId, form);
    },
    onSuccess: (_invoice: BillingInvoice) => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["request", requestId] });
    },
  });
}

/* =========================================================
 * ALLOCATIONS
 * ======================================================= */
export function useCreateAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAllocationDto): Promise<ProgramAllocation> =>
      api.createAllocation(dto),
    onSuccess: (_result: ProgramAllocation) => {
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

/* =========================================================
 * PAYMENTS
 * ======================================================= */
export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreatePaymentDto): Promise<Payment> =>
      api.createPayment(dto),
    onSuccess: (_result: Payment) => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
    },
  });
}

/* =========================================================
 * RECEIPTS
 * ======================================================= */
export function useUploadReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (arg: {
      projectId: number;
      file: File;
      paymentId?: string;
    }): Promise<Receipt> => {
      const { projectId, file, paymentId } = arg;
      return api.uploadReceipt(projectId, file, paymentId);
    },
    onSuccess: (_result: Receipt) => {
      qc.invalidateQueries({ queryKey: ["ledger"] });
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

/* =========================================================
 * LEDGER
 * ======================================================= */
export function useProgramLedger(
  projectId?: number | null,
  opts?: SimpleQueryOpts
): UseQueryResult<LedgerEvent[], unknown> {
  return useQuery<LedgerEvent[], unknown>({
    queryKey: ["ledger", projectId ?? null],
    queryFn: () => api.getLedger(Number(projectId)),
    enabled: (opts?.enabled ?? true) && !!projectId,
    refetchOnWindowFocus: opts?.refetchOnWindowFocus ?? false,
  } as any);
}

/* =========================================================
 * Util — Formateo de errores
 * ======================================================= */
export const formatApiError = api.formatApiError;
