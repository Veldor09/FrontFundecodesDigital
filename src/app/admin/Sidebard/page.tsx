"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Receipt,
  Handshake,
  Wallet,
  BarChart3,
  FolderKanban,
  MessageSquare,
  FileText,
  ChevronRight,
  X,
  LayoutGrid,
} from "lucide-react";

type Role =
  | "admin"
  | "voluntario"
  | "colaboradorfactura"
  | "colaboradorvoluntariado"
  | "colaboradorproyecto"
  | "colaboradorcontabilidad";

type ModuleItem = {
  key: string;
  title: string;
  desc: string;
  href: string;
  icon: any;
  roles: Role[];
  badgeCount?: number;
};

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

function normalizeRole(v?: string | null): Role | null {
  if (!v) return null;
  const low = v.toLowerCase();
  const allowed: Role[] = [
    "admin", "voluntario", "colaboradorfactura",
    "colaboradorvoluntariado", "colaboradorproyecto", "colaboradorcontabilidad",
  ];
  return (allowed as string[]).includes(low) ? (low as Role) : null;
}

const ALL_MODULES: ModuleItem[] = [
  {
    key: "vol",
    title: "Voluntariado",
    desc: "Formularios, estados y participantes",
    href: "/admin/voluntariado",
    icon: Handshake,
    roles: ["admin", "colaboradorvoluntariado", "voluntario"],
  },
  {
    key: "proy",
    title: "Proyectos",
    desc: "Proyectos activos y finalizados",
    href: "/admin/projects",
    icon: FolderKanban,
    roles: ["admin", "colaboradorproyecto"],
  },
  {
    key: "billing",
    title: "Solicitudes y Facturación",
    desc: "Consulta y administración de solicitudes",
    href: "/admin/BillingRequest",
    icon: Receipt,
    roles: ["admin", "colaboradorfactura", "colaboradorcontabilidad"],
  },
  {
    key: "colabs",
    title: "Colaboradores",
    desc: "Miembros, roles, permisos y estados",
    href: "/admin/Collaborators",
    icon: Users,
    roles: ["admin"],
  },
  {
    key: "acct",
    title: "Contabilidad",
    desc: "Ingresos, egresos y reportes financieros",
    href: "/admin/accounting",
    icon: Wallet,
    roles: ["admin", "colaboradorcontabilidad"],
  },
  {
    key: "recap",
    title: "Recapitulación",
    desc: "KPIs, métricas y resúmenes",
    href: "/admin/recapitulacion",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    key: "comments",
    title: "Comentarios",
    desc: "Validar, aprobar o denegar comentarios",
    href: "/admin/comments",
    icon: MessageSquare,
    roles: ["admin"],
  },
  {
    key: "respuestas",
    title: "Respuestas de Formularios",
    desc: "Gestiona las respuestas de formularios públicos",
    href: "/admin/respuestas-formulario",
    icon: FileText,
    roles: ["admin"],
  },
];

export function AdminSidebar({ pendingCommentsCount = 0 }: { pendingCommentsCount?: number }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [navbarHeight, setNavbarHeight] = useState(72);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const t = getToken();
    const p = getJwtPayload<{ role?: string; rol?: string; roles?: string[] }>(t);
    const fromArray = Array.isArray(p?.roles) ? p.roles[0] : undefined;
    setRole(normalizeRole(p?.role ?? p?.rol ?? fromArray) ?? null);
  }, []);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) setNavbarHeight(header.getBoundingClientRect().height);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  };

  const visibleModules = ALL_MODULES
    .filter((m) => !role || role === "admin" || m.roles.includes(role))
    .map((m) =>
      m.key === "comments" ? { ...m, badgeCount: pendingCommentsCount } : m
    );

  return (
    <>
      {/* Botón flotante */}
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Abrir menú de módulos"
        style={{ top: navbarHeight + 12 }}
        className="fixed left-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:from-blue-400 hover:to-blue-500 transition-all duration-300 group"
      >
        <LayoutGrid className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
        {pendingCommentsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1 shadow-md">
            {pendingCommentsCount > 9 ? "9+" : pendingCommentsCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar — w-96 más ancho */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Navegación de módulos"
        style={{
          top: navbarHeight,
          height: `calc(100vh - ${navbarHeight}px)`,
        }}
        className={`fixed left-0 z-50 w-96 bg-white border-r border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header del sidebar */}
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800 leading-tight">Panel Administrativo</p>
                <p className="text-sm text-slate-400 leading-tight mt-0.5">Gestión del sistema</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Lista de módulos */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Módulos disponibles
          </p>
          <ul className="space-y-1.5">
            {visibleModules.map((m) => {
              const Icon = m.icon;
              const isActive = pathname === m.href;

              return (
                <li key={m.key}>
                  <Link
                    href={m.href}
                    className={`group relative flex items-center gap-4 rounded-xl px-4 py-4 transition-all duration-200 ${
                      isActive ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Indicador activo */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-9 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full" />
                    )}

                    {/* Ícono */}
                    <div className="relative flex-shrink-0">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20"
                          : "bg-slate-100 group-hover:bg-slate-200"
                      }`}>
                        <Icon className={`h-6 w-6 transition-colors ${
                          isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                        }`} />
                      </div>
                      {typeof m.badgeCount === "number" && m.badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1 shadow-md">
                          {m.badgeCount > 99 ? "99+" : m.badgeCount}
                        </span>
                      )}
                    </div>

                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-semibold leading-tight truncate transition-colors ${
                        isActive ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"
                      }`}>
                        {m.title}
                      </p>
                    </div>

                    <ChevronRight className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? "text-blue-500"
                        : "text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5"
                    }`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}