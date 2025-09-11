'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

function hasPermissions(required: string[], token: string | null): boolean {
  const payload = getJwtPayload<{ perms?: string[] }>(token);
  const userPerms = new Set(payload?.perms ?? []);
  return required.every(p => userPerms.has(p));
}

type Props = {
  require: string[];
  fallbackHref?: string;
  children: ReactNode;
};

export default function RequirePermission({ require, fallbackHref = '/admin', children }: Props) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token || !hasPermissions(require, token)) {
      router.replace(fallbackHref);
      return;
    }
    setOk(true);
    setChecking(false);
  }, [router, require, fallbackHref]);

  if (checking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-600">
        Verificando permisos…
      </div>
    );
  }

  if (!ok) return null;
  return <>{children}</>;
}
