"use client";

import { useEffect, useState } from "react";
import { Heart, MapPin, Users, ChevronDown } from "lucide-react";

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
  try {
    const res = await fetch(`${API_URL}/api/programa-voluntariado`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch {
    return [];
  }
}

export default function ProgramasCatalogo() {
  const [items, setItems] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | string | null>(null);

  useEffect(() => {
    fetchProgramas()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-12 w-12 text-green-300 mb-4" />
        <p className="text-slate-500 font-medium">No hay programas disponibles en este momento.</p>
        <p className="text-slate-400 text-sm mt-1">Vuelve pronto — estamos trabajando en nuevas oportunidades.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p) => {
        const asignados = Array.isArray(p.voluntarios) ? p.voluntarios.length : (p._count?.asignaciones ?? 0);
        const limite = Number(p.limiteParticipantes ?? 0);
        const sinLimite = limite === 0;
        const disponibles = sinLimite ? null : Math.max(limite - asignados, 0);
        const lleno = !sinLimite && asignados >= limite;
        const isExpanded = expanded === p.id;

        return (
          <div
            key={p.id}
            className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Imagen */}
            <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
              {p.imagenUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imagenUrl}
                  alt={p.nombre}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = "none";
                    const fb = img.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="h-full w-full items-center justify-center"
                style={{ display: p.imagenUrl ? "none" : "flex" }}
              >
                <Heart className="w-12 h-12 text-green-200" />
              </div>

              {/* Cupos badge */}
              <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
                lleno
                  ? "bg-red-100/90 text-red-700 border-red-200"
                  : sinLimite
                  ? "bg-blue-100/90 text-blue-700 border-blue-200"
                  : "bg-green-100/90 text-green-700 border-green-200"
              }`}>
                <Users className="w-3 h-3" />
                {lleno ? "Cupos llenos" : sinLimite ? "Sin límite" : `${disponibles} disponibles`}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-5">
              <h3 className="font-bold text-[#1e3a8a] text-lg leading-snug mb-1 group-hover:text-green-700 transition-colors">
                {p.nombre}
              </h3>

              {p.lugar && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 mb-3">
                  <MapPin className="w-3 h-3" /> {p.lugar}
                </span>
              )}

              {p.descripcion && (
                <div className="mb-4">
                  <p className={`text-slate-600 text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
                    {p.descripcion}
                  </p>
                  {p.descripcion.length > 120 && (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className="text-green-600 text-xs font-medium mt-1 flex items-center gap-0.5 hover:underline"
                    >
                      {isExpanded ? "Ver menos" : "Ver más"}
                      <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-slate-100">
                <a
                  href="#formulario"
                  className="block w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-md shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-300"
                >
                  {lleno ? "Unirse a lista de espera" : "Quiero participar"}
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
