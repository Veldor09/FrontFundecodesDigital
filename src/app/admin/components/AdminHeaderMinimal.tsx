"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function AdminHeaderMinimal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const user = { name: "AshVargas", photoUrl: "" };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
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
  const goProfile = () => {
    setOpen(false);
    router.push("/admin/perfil");
  };
  const signOut = () => {
    setOpen(false);
    router.push("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-blue-600 shadow-lg ${openSans.className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
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
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition"
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
                <Image
                  src="/Img/Inicion-Sesion.svg"
                  alt="Avatar por defecto"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              )}
            </button>

            {open && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Menú de usuario"
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
              >
                <div className="px-5 py-3.5 text-base">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                </div>

                <div className="h-px bg-slate-100" />

                <button
                  role="menuitem"
                  onClick={goProfile}
                  className="w-full text-left px-5 py-3 text-base text-slate-700 hover:bg-slate-50"
                >
                  Mi perfil
                </button>

                <div className="h-px bg-slate-100" />

                <button
                  role="menuitem"
                  onClick={signOut}
                  className="w-full text-left px-5 py-3 text-base text-red-600 hover:bg-red-50"
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
