'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
// usamos el logout del servicio de auth para limpiar el token
import { logout } from '../../services/auth.service';

// Helpers locales para token
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
function getJwtPayload<T = any>(token: string | null): T | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const token = useMemo(() => getToken(), []);
  const payload = useMemo(() => getJwtPayload<{ email?: string }>(token), [token]);
  const userEmail = payload?.email ?? 'Usuario';

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace('/login');
    } else {
      setChecking(false);
    }
  }, [router]);

  function onLogout() {
    logout();            // limpia localStorage y header Authorization
    router.replace('/login');
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Verificando sesión…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Barra superior */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4">
        <div className="font-semibold text-gray-800">Panel de Administración</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:inline">{userEmail}</span>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm hover:bg-gray-800"
            title="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
