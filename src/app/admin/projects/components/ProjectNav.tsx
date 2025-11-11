"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  backHref: string;
};

export default function ProjectNav({ title, backHref }: Props) {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ====== Título principal ====== */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crea, edita y administra tus proyectos publicados o en proceso.
          </p>
        </div>

        {/* ====== Botón volver ====== */}
        <div className="relative flex items-center justify-center h-12 mb-2">
          <Link href={backHref} className="absolute left-0">
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
