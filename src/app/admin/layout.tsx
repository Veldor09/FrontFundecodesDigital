//src/app/admin/layout.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../../services/auth.service";
import AdminHeaderMinimal from "./components/AdminHeaderMinimal"; // <- header azul/teal

// Helpers locales para token
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
function getJwtPayload<T = any>(token: string | null): T | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Token/payload solo para posibles usos (p.ej. mostrar email en el header si lo necesitas)
  const token = useMemo(() => getToken(), []);
  const payload = useMemo(() => getJwtPayload<{ email?: string }>(token), [token]);
  const userEmail = payload?.email ?? "Usuario";

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [router]);

  // Exponemos logout por si quieres llamarlo desde cualquier parte
  function onLogout() {
    logout(); // limpia storage / headers
    router.replace("/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Verificando sesión…</p>
      </div>
    );
  }

  return (
    <>
      {/* Header global con gradiente para todo /admin */}
      <AdminHeaderMinimal />
      {/* Contenido de cada página admin */}
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </>
  );
}
