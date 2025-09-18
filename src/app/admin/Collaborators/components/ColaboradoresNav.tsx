"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ColaboradoresNav() {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título centrado */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Bienvenido al área Gestión de Colaboradores
          </h1>
        </div>

        {/* Contenedor para alinear botón a la izquierda (sin menú) */}
        <div className="relative flex items-center justify-center h-16">
          <Link href="/admin" className="absolute left-0">
            <Button 
              size="sm" 
              className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 font-medium"
            >
              Volver al Dashboard
            </Button>
          </Link>

          {/* Espacio vacío para mantener el equilibrio visual */}
          <div className="w-[100px]" />
        </div>
      </div>
    </div>
  );
}