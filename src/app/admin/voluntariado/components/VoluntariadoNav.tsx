"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const tabs = ["Voluntarios", "Proyectos", "Sanciones"] as const;
type Tab = typeof tabs[number];

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function VoluntariadoNav({ active, onChange }: Props) {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título principal */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Bienvenido al Área de Voluntariado
          </h1>
        </div>
        
        {/* Navegación */}
        <div className="relative flex items-center justify-center h-16">
          <Link href="/admin" className="absolute left-0">
            <Button 
              size="sm" 
              className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 font-medium"
            >
              Volver al Dashboard
            </Button>
          </Link>

          <nav className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                size="sm"
                onClick={() => onChange(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm ${
                  active === tab
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tab}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}