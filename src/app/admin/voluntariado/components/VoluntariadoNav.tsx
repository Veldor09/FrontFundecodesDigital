"use client";

import { Button } from "@/components/ui/button";

const tabs = ["Voluntarios", "Proyectos","Historial", "Sanciones"] as const;
type Tab = typeof tabs[number];

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function VoluntariadoNav({ active, onChange }: Props) {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <nav className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                size="sm"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm ${
                  active === tab
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => onChange(tab)}
              >
                {tab}
              </Button>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/admin")}
            className="text-slate-600 hover:text-slate-900"
          >
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}