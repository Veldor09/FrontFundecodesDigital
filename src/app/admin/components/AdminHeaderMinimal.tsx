// src/app/admin/components/AdminHeaderMinimal.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Open_Sans } from "next/font/google";
import { User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 👉 Importa tu función logout (ajusta la ruta si es diferente)
import { logout } from "@/lib/auth-client";   // ← ruta real

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function AdminHeaderMinimal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // En producción reemplaza por datos reales (contexto/auth)
  const user = { name: "AdminFUNDECODES", email: "admin@fundecodes.org", photoUrl: "" };

  // Cerrar menú con click fuera o Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };''
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const goPublic = () => router.push("/");

  // 👉 Nueva función onLogout: limpia token y redirige
  const onLogout = () => {
    setOpen(false);
    logout();          // Limpia el token / cookies / storage
    router.replace("/landing");
  };

  return (
    <header className={`sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-blue-600 shadow-lg ${openSans.className}`}>
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + texto */}
          <button
            onClick={goPublic}
            aria-label="Volver a la página informativa"
            className="flex items-center gap-3 hover:opacity-90"
          >
            <div className="bg-white rounded-full p-2 shadow-md">
              <Image
                src="/Img/FUNDECODES_Logo.png"
                alt="Fundecodes"
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <div className="text-white text-left">
              <h1 className="text-xl font-bold tracking-wide">Fundecodes</h1>
              <p className="text-sm text-blue-100 font-medium">Panel administrativo</p>
            </div>
          </button>

          {/* Botón: Ir a la página principal (siempre visible) */}
          <Link href="/informational-page">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/50 hover:bg-white/10"
            >
              Ir a la página principal
            </Button>
          </Link>

          {/* Perfil (icono + menú desplegable) */}
          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition"
              title="Cuenta"
            >
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt="Avatar"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </span>
              )}
            </button>

            {open && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Menú de usuario"
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
              >
                <div className="px-5 py-4">
                  <p className="font-semibold text-slate-900 leading-tight">{user.name}</p>
                  {user.email && (
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                <Link
                  href="/landing"
                  className="block w-full text-left px-5 py-3 text-slate-700 hover:bg-slate-50 transition"
                >
                  Ir a la página principal
                </Link>
                <div className="h-px bg-slate-100" />

                {/* 👉 Botón que llama a onLogout */}
                <button
                  role="menuitem"
                  onClick={onLogout}
                  className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}