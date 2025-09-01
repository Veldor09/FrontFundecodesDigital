"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AdminHeaderMinimal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Simula usuario; reemplaza con tus datos reales si tienes auth
  const user = { name: "AshVargas", photoUrl: "" };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const goPublic = () => router.push("/");
  const goProfile = () => { setOpen(false); router.push("/admin/perfil"); };
  const signOut = () => { setOpen(false); router.push("/"); };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-blue-600 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo (volver a pública) */}
          <button
            onClick={goPublic}
            aria-label="Volver a la página informativa"
            className="flex items-center gap-3 hover:opacity-90"
          >
            <div className="bg-white rounded-full p-2 shadow-md">
              <Image
                src="/Imagenes/LOGOCODES_Logo.png"
                alt="Fundecodes"
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <span className="sr-only">Volver a la página informativa</span>
          </button>

          {/* Avatar + menú */}
          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-2.5 py-1.5 text-white hover:bg-white/20 transition"
            >
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt="Avatar"
                  width={32} height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <Image
                  src="/Img/Inicio-Sesion.svg"  // tu fallback ya corregido
                  alt="Avatar por defecto"
                  width={32} height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
            </button>

            {open && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Menú de usuario"
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
              >
                <div className="px-5 py-3.5 text-[0.95rem]">
                  <p className="font-medium text-slate-900 leading-5">{user.name || "Usuario"}</p>
                </div>

                <div className="h-px bg-slate-100" />

                <button
                  role="menuitem"
                  onClick={goProfile}
                  className="w-full text-left px-5 py-2.5 text-[0.95rem] text-slate-700 hover:bg-slate-50"
                >
                  Mi perfil
                </button>

                <div className="h-px bg-slate-100" />

                <button
                  role="menuitem"
                  onClick={signOut}
                  className="w-full text-left px-5 py-2.5 text-[0.95rem] text-red-600 hover:bg-red-50"
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
