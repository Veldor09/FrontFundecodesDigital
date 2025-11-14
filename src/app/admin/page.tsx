"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Receipt,
  Handshake,
  Wallet,
  BarChart3,
  Globe,
  FolderKanban,
} from "lucide-react";
import { DashboardMetrics } from "./components/DashboardMetrics";
import { Button } from "@/components/ui/button";

type Role =
  | "admin"
  | "voluntario"
  | "colaboradorfactura"
  | "colaboradorvoluntariado"
  | "colaboradorproyecto"
  | "colaboradorcontabilidad";

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
    "admin",
    "voluntario",
    "colaboradorfactura",
    "colaboradorvoluntariado",
    "colaboradorproyecto",
    "colaboradorcontabilidad",
  ];
  return (allowed as string[]).includes(low) ? (low as Role) : null;
}

export default function AdminDashboardPage() {
  const [role, setRole] = useState<Role | null>(null);

  // Lee el rol del JWT
  useEffect(() => {
    const t = getToken();
    const p = getJwtPayload<{ role?: string; rol?: string; roles?: string[] }>(t);
    const fromArray = Array.isArray(p?.roles) ? p!.roles[0] : undefined;
    setRole(normalizeRole(p?.role ?? p?.rol ?? fromArray) ?? null);
  }, []);

  // Configuración de tarjetas
  const MODULES = useMemo(
    () => [
      {
        key: "vol",
        title: "Voluntariado",
        desc: "Gestión de formularios, estados y participantes",
        href: "/admin/voluntariado",
        icon: Handshake,
        cardClasses:
          "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-teal-300",
        badgeClasses:
          "rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-teal-50 group-hover:border-teal-200",
        linkClasses:
          "mt-4 text-sm font-medium text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity",
        roles: ["admin", "colaboradorvoluntariado", "voluntario"] as Role[],
      },
      {
        key: "proy",
        title: "Proyectos",
        desc: "Gestión de proyectos activos y finalizados",
        href: "/admin/projects",
        icon: FolderKanban,
        cardClasses:
          "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300",
        badgeClasses:
          "rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200",
        linkClasses:
          "mt-4 text-sm font-medium text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity",
        roles: ["admin", "colaboradorproyecto"] as Role[],
      },
      {
        key: "billing",
        title: "Solicitudes y Facturación",
        desc: "Consulta y administración de Solicitudes",
        href: "/admin/BillingRequest",
        icon: Receipt,
        cardClasses:
          "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-green-300",
        badgeClasses:
          "rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-green-50 group-hover:border-green-200",
        linkClasses:
          "mt-4 text-sm font-medium text-green-700 opacity-0 group-hover:opacity-100 transition-opacity",
        roles: ["admin", "colaboradorfactura", "colaboradorcontabilidad"] as Role[],
      },
      {
        key: "colabs",
        title: "Colaboradores",
        desc: "Miembros, roles, permisos y estados",
        href: "/admin/Collaborators",
        icon: Users,
        cardClasses:
          "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-purple-300",
        badgeClasses:
          "rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-purple-50 group-hover:border-purple-200",
        linkClasses:
          "mt-4 text-sm font-medium text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity",
        roles: ["admin"] as Role[],
      },
      {
        key: "acct",
        title: "Contabilidad",
        desc: "Ingresos, egresos y reportes financieros",
        href: "/admin/accounting",
        icon: Wallet,
        cardClasses:
          "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-orange-300",
        badgeClasses:
          "rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-orange-50 group-hover:border-orange-200",
        linkClasses:
          "mt-4 text-sm font-medium text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity",
        roles: ["admin", "colaboradorcontabilidad"] as Role[],
      },
      {
        key: "recap",
        title: "Recapitulación",
        desc: "KPIs, métricas y resúmenes",
        href: "/admin/recapitulacion",
        icon: BarChart3,
        cardClasses:
          "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-red-300",
        badgeClasses:
          "rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-red-50 group-hover:border-red-200",
        linkClasses:
          "mt-4 text-sm font-medium text-red-700 opacity-0 group-hover:opacity-100 transition-opacity",
        roles: ["admin"] as Role[],
      },
      /*
      {
        key: "info",
        title: "Página Informativa",
        desc: "Contenido público del sitio y secciones (Inicio, Visión, Misión, etc.)",
        href: "/admin/informational-page",
        icon: Globe,
        cardClasses:
          "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-300",
        badgeClasses:
          "rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-200",
        linkClasses:
          "mt-4 text-sm font-medium text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity",
        roles: ["admin"] as Role[],
        fullWidth: true,
      },*/
    ],
    [] 
  );

  const visibleModules = useMemo(() => {
    if (!role || role === "admin") return MODULES; 
    return MODULES.filter((m) => !m.roles || m.roles.includes(role));
  }, [MODULES, role]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Módulos del Sistema</h1>
          <p className="text-slate-500">Gestiona cada área de la organización</p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Button>
        </Link>
      </div>

      {/* Tarjetas con altura igualada */}
      <section className="mb-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleModules.map((m) => {
            const Icon = m.icon;
            const colSpan = m.fullWidth ? "lg:col-span-3" : "";

            return (
              <Link key={m.key} href={m.href} className={`group ${colSpan}`}>
                <div
                  className={`${m.cardClasses} h-full min-h-[170px] flex flex-col justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div className={m.badgeClasses}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{m.title}</h3>
                      <p className="text-sm text-slate-500">{m.desc}</p>
                    </div>
                  </div>
                  <div className={m.linkClasses}>Ir →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Resumen general */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Resumen General</h2>
          <p className="text-slate-500">Métricas actualizadas en tiempo real</p>
        </div>
        {role ? <DashboardMetrics /> : null}
      </section>
    </main>
  );
}
