"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ColaboradoresNav() {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título principal */}
        <div className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Gestión de Colaboradores
            </h1>
            <p className="text-slate-500 text-sm">
              Administra miembros, roles y datos de contacto
            </p>
          </div>

          <Link href="/admin">
            <Button
              size="sm"
              className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 font-medium"
            >
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
