"use client";

import { Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProyectCards from "./ProjectCards";
import type { Project, ProjectStatus } from "@/lib/projects.types";

type Props = {
  loading: boolean;
  items: Project[];

  // filtros
  q: string;
  onQChange: (v: string) => void;

  place: string;
  onPlaceChange: (v: string) => void;

  category: string;
  onCategoryChange: (v: string) => void;

  area: string;
  onAreaChange: (v: string) => void;

  status: ProjectStatus | "";
  onStatusChange: (v: ProjectStatus | "") => void;

  published: "" | "true" | "false";
  onPublishedChange: (v: "" | "true" | "false") => void;

  // opciones
  places: string[];
  categories: string[];
  areas: string[];

  // acciones
  onApply: () => void;
  onClear: () => void;
  onReload: () => void;
  onAdd: () => void;
  onEdit: (p: Project) => void;
  onDelete: (id: number) => void;

  // paginación
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function ProjectTable(props: Props) {
  const {
    loading, items,
    q, onQChange,
    place, onPlaceChange,
    category, onCategoryChange,
    area, onAreaChange,
    status, onStatusChange,
    published, onPublishedChange,
    places, categories, areas,
    onApply, onClear, onReload, onAdd, onEdit, onDelete,
    page, totalPages, onPrev, onNext,
  } = props;

  return (
    <section className="w-full">
      {/* ====== Barra superior: acciones principales ====== */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-slate-700 text-sm">
          {/* Puedes poner un subtítulo contextual aquí si lo deseas */}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onReload}
            className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-2 font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </Button>

          <Button
            size="sm"
            onClick={onAdd}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir proyecto
          </Button>
        </div>
      </div>

      {/* ====== Filtros (estilo RequestsTable) ====== */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          {/* Buscador */}
          <Input
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:max-w-xs"
            placeholder="Buscar por nombre…"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
          />

          {/* Selects */}
          <select
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:w-48"
            value={place}
            onChange={(e) => onPlaceChange(e.target.value)}
          >
            <option value="">Lugar (todos)</option>
            {places.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:w-48"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Categoría (todas)</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:w-48"
            value={area}
            onChange={(e) => onAreaChange(e.target.value)}
          >
            <option value="">Área (todas)</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:w-48"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as any)}
          >
            <option value="">Estado (todos)</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="PAUSADO">Pausado</option>
          </select>

          <select
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 sm:w-48"
            value={published}
            onChange={(e) => onPublishedChange(e.target.value as any)}
          >
            <option value="">Publicado (todos)</option>
            <option value="true">Publicado</option>
            <option value="false">No publicado</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onApply}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            Aplicar
          </Button>
          <Button
            variant="secondary"
            onClick={onClear}
            className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all duration-200"
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* ====== Lista (cards) ====== */}
      {loading ? (
        <div className="w-full border rounded-2xl bg-white py-8 text-center text-slate-600">
          Cargando…
        </div>
      ) : (
        <ProyectCards projects={items} onEdit={onEdit} onDelete={onDelete} />
      )}

      {/* ====== Paginación ====== */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={onPrev}
          className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all duration-200"
        >
          Anterior
        </Button>

        <span className="text-sm text-slate-600">
          Página {Math.min(page, totalPages)} de {totalPages}
        </span>

        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={onNext}
          className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all duration-200"
        >
          Siguiente
        </Button>
      </div>
    </section>
  );
}
