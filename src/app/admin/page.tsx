"use client";

import Link from "next/link";
import {
  Users,
  Receipt,
  Handshake,
  Wallet,
  BarChart3,
  Globe,
  FolderKanban,
} from "lucide-react";

type CardItem = {
  title: string;
  href: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const CARDS: CardItem[] = [
  {
    title: "Voluntariado",
    href: "/admin/voluntariado",
    description: "Gestión de formularios, estados y participantes.",
    Icon: Handshake,
  },
  {
    title: "Facturación",
    href: "/admin/facturacion",
    description: "Consulta y administración de facturas.",
    Icon: Receipt,
  },
  {
    title: "Proyectos",
    href: "/admin/proyectos",
    description: "Gestión de proyectos activos y finalizados.",
    Icon: FolderKanban,
  },
  {
    title: "Colaboradores",
    href: "/admin/colaboradores",
    description: "Miembros, roles, permisos y estados.",
    Icon: Users,
  },
  {
    title: "Contabilidad",
    href: "/admin/contabilidad",
    description: "Ingresos, egresos y reportes financieros.",
    Icon: Wallet,
  },
  {
    title: "Recapitulación",
    href: "/admin/recapitulacion",
    description: "KPIs, métricas y resúmenes.",
    Icon: BarChart3,
  },
  {
    title: "Página informativa",
    href: "/admin/informational-page", // 👈 aquí entras al editor de landing
    description: "Contenido público del sitio y secciones.",
    Icon: Globe,
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Panel administrativo
          </h1>
          <p className="text-slate-500 mt-1">
            Elige un módulo para continuar.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ title, href, description, Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                    {title}
                  </h2>
                  <p className="text-sm text-slate-500">{description}</p>
                </div>
              </div>

              <div className="mt-4 text-sm font-medium text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Entrar →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
