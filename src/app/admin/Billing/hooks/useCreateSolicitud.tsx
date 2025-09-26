// hooks/useCreateSolicitud.ts
import { useCallback, useState } from "react";
import { solicitud } from "../types/solicitudes";
import { createSolicitud } from "../services/solicitudes";

type UseCreateOptions = {
  onSuccess?: (s: solicitud) => void;
  onError?: (e: unknown) => void;
};

export function useCreateSolicitud(opts: UseCreateOptions = {}) {
  const [data, setData] = useState<solicitud | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const create = useCallback(
    async (payload: solicitud) => {
      setLoading(true);
      setError(null);
      try {
        const res = await createSolicitud(payload);
        setData(res);
        opts.onSuccess?.(res);
        return res;
      } catch (e) {
        setError(e);
        opts.onError?.(e);
        throw e;
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
