"use client";

import { ArrowLeft } from "lucide-react";

const tabs = [
  "Solicitudes",
  "Validación Contable",
  "Aprobación Dirección",
  "Pendientes de pago",
  "Historial",
] as const;

export type RequestTab = typeof tabs[number];

interface Props {
  active: RequestTab;
  onChange: (tab: RequestTab) => void;
}

export default function RequestNav({ active, onChange }: Props) {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ====== Título principal ====== */}
        <div className="text-center py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Gestión de Solicitudes
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Crea, valida y aprueba solicitudes. Administra pagos y consulta el historial.
          </p>
        </div>

        {/* ====== Navegación - Desktop ====== */}
        <div className="hidden lg:block">
          <div className="relative flex items-center justify-center h-16">
            <a href="/admin" className="absolute left-0">
              <button className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 font-medium rounded-md text-sm flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard
              </button>
            </a>

            <nav className="flex flex-wrap gap-2 justify-center max-w-3xl">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => onChange(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm whitespace-nowrap ${
                    active === tab
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ====== Navegación - Tablet ====== */}
        <div className="hidden md:block lg:hidden pb-4">
          {/* Botón volver */}
          <div className="mb-3">
            <a href="/admin">
              <button className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-200 px-4 py-2.5 font-medium rounded-md text-sm flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard
              </button>
            </a>
          </div>

          {/* Tabs en grid 2 columnas */}
          <nav className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onChange(tab)}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm ${
                  active === tab
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* ====== Navegación - Mobile ====== */}
        <div className="md:hidden pb-4">
          {/* Botón volver */}
          <div className="mb-3">
            <a href="/admin">
              <button className="w-full bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-200 px-4 py-2.5 font-medium rounded-md text-sm flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard
              </button>
            </a>
          </div>

          {/* Tabs en columna */}
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onChange(tab)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm ${
                  active === tab
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}