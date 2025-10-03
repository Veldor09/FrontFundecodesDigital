// src/app/admin/Billing/hooks/useCreateSolicitud.ts
'use client';

import { useCallback, useState } from "react";
import { createSolicitud, type CreateSolicitudPayload } from "../services/solicitudes";

type UseCreateOptions<T = any> = {
  onSuccess?: (created: T) => void;
  onError?: (e: Error) => void;
};

export function useCreateSolicitud<T = any>(opts: UseCreateOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (payload: CreateSolicitudPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await createSolicitud(payload);
        setData(res);
        opts.onSuccess?.(res);
        return res as T;
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Unexpected error");
        setError(err);
        opts.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [opts]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { create, data, loading, error, reset };
}
