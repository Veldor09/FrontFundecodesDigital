"use client";

import { FileText, Server, ArrowLeft } from "lucide-react";
import Link from "next/link";

const MANUALES = [
  {
    key: "interno",
    title: "Manual de Usuarios Internos",
    desc: "Guía de uso del sistema para el personal administrativo",
    icon: FileText,
    url: "/manuales/manual-interno.pdf",
  },
  {
    key: "despliegue",
    title: "Manual de Despliegue",
    desc: "Documentación técnica para instalar y desplegar el sistema",
    icon: Server,
    url: "/manuales/manual-despliegue.pdf",
  },
];

export default function ManualesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manuales del sistema</h1>
          <p className="text-slate-500">Documentación de uso y despliegue</p>
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {MANUALES.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.key}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[170px]"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 shrink-0">
                  <Icon className="h-7 w-7 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{m.title}</h3>
                  <p className="text-sm text-slate-500">{m.desc}</p>
                </div>
              </div>

              <button
                onClick={() => window.open(m.url, "_blank")}
                className="mt-4 w-fit rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
              >
                Abrir manual
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
