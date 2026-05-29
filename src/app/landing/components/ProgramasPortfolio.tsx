"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, MapPin, Heart } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

type Programa = {
  id: number | string;
  nombre: string;
  lugar?: string;
  descripcion?: string;
  limiteParticipantes?: number;
  imagenUrl?: string | null;
  voluntarios?: any[];
  _count?: { asignaciones?: number };
};

async function fetchProgramas(): Promise<Programa[]> {
  const res = await fetch(`${API_URL}/api/programa-voluntariado`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const items: Programa[] = Array.isArray(data) ? data : data?.items ?? [];
  return items.slice(0, 3);
}

export default function ProgramasPortfolio() {
  const [items, setItems] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgramas()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 sm:mx-6">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />

      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-50 rounded-full opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-50 rounded-full opacity-60 blur-3xl pointer-events-none" />

      <div className="relative p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            <span className="text-green-600">Programas</span> de{" "}
            <span className="text-emerald-600">Voluntariado</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm">
            Únete a nuestros programas de conservación y marca la diferencia en Costa Rica.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Cargando programas…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-green-400" />
            </div>
            <p className="text-gray-500 font-medium">Próximamente nuevos programas.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((p, i) => {
              const asignados = Array.isArray(p.voluntarios) ? p.voluntarios.length : (p._count?.asignaciones ?? 0);
              const limite = Number(p.limiteParticipantes ?? 0);
              const sinLimite = limite === 0;
              const disponibles = sinLimite ? null : Math.max(limite - asignados, 0);
              const lleno = !sinLimite && asignados >= limite;

              return (
                <div
                  key={p.id}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Imagen */}
                  <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                    {p.imagenUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imagenUrl}
                        alt={p.nombre}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.style.display = "none";
                          const fallback = img.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="h-full w-full items-center justify-center"
                      style={{ display: p.imagenUrl ? "none" : "flex" }}
                    >
                      <Heart className="w-10 h-10 text-green-200" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Cupos badge */}
                    <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                      lleno
                        ? "bg-red-100/90 text-red-700 border-red-200"
                        : sinLimite
                        ? "bg-blue-100/90 text-blue-700 border-blue-200"
                        : "bg-green-100/90 text-green-700 border-green-200"
                    }`}>
                      <Users className="w-3 h-3" />
                      {lleno ? "Cupos llenos" : sinLimite ? "Cupos libres" : `${disponibles} disponibles`}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-green-700 transition-colors">
                      {p.nombre}
                    </h3>

                    {p.lugar && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <MapPin className="w-3 h-3" /> {p.lugar}
                      </span>
                    )}

                    {p.descripcion && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
                        {p.descripcion}
                      </p>
                    )}

                    <Link
                      href="/PagInfo/Voluntariado#programas"
                      className="w-full py-2 px-4 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-500 hover:text-white hover:border-transparent transition-all duration-300 text-center block"
                    >
                      Ver programa
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center mt-10">
          <Link
            href="/PagInfo/Voluntariado#programas"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
          >
            Explorar todos los programas
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
