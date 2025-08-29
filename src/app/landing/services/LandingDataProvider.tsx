"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { InformationalPage } from "@/app/admin/informational-page/types/informational";

type Ctx = { data: InformationalPage | null; loading: boolean };
const LandingDataCtx = createContext<Ctx>({ data: null, loading: true });

export function LandingDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InformationalPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    fetch(`${API_BASE}/informational-page`, { headers: { "Content-Type": "application/json" }, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => setData(json))
      .catch((err) => {
        // NO mostramos el error en pantalla para no romper la UI
        console.warn("[landing] no se pudo cargar informational-page:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <LandingDataCtx.Provider value={{ data, loading }}>
      {children}
    </LandingDataCtx.Provider>
  );
}

export function useLandingData() {
  return useContext(LandingDataCtx);
}
