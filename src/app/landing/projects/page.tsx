"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listProjects } from "@/services/projects.service";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPublicPage() {
  // Filtros y estado de UI
  const [q, setQ] = useState("");
  const [place, setPlace] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);

  // Datos
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Project[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const { data, total: t } = await listProjects({
        q,
        place,
        category,
        area,
        status: status || undefined,
        page: nextPage,
        pageSize,
        published: true,
      });
      setItems(Array.isArray(data) ? data : []);
      setTotal(typeof t === "number" ? t : undefined);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // primera carga
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opciones de filtros derivadas del dataset actual (si no tienes catálogos separados)
  const places = useMemo(
    () => Array.from(new Set(items.map((i) => i.place).filter(Boolean))).sort(),
    [items]
  );
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort(),
    [items]
  );
  const areas = useMemo(
    () => Array.from(new Set(items.map((i) => i.area).filter(Boolean))).sort(),
    [items]
  );

  // Evitar mezclar ?? y ||: calculamos un total base seguro
  const rawTotal = typeof total === "number" ? total : items.length;
  const totalPages = Math.max(1, Math.ceil(rawTotal / pageSize));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Proyectos</h1>

      {/* Buscador + filtros */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Buscar por nombre…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        >
          <option value="">Lugar (todos)</option>
          {places.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Categoría (todas)</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          <option value="">Área (todas)</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus | "")}
        >
          <option value="">Estado (todos)</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="PAUSADO">Pausado</option>
        </select>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setPage(1);
              load(1);
            }}
          >
            Aplicar
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setQ("");
              setPlace("");
              setCategory("");
              setArea("");
              setStatus("");
              setPage(1);
              load(1);
            }}
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* Grid de proyectos */}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => {
              // slug puede venir undefined en tu tipo: definimos un href seguro
              const projectHref = p.slug
                ? `/landing/projects/${encodeURIComponent(p.slug)}`
                : `/landing/projects`; // fallback a la lista si no hay slug

              return (
                <Card key={p.id} className="p-4">
                  {p.coverUrl && (
                    <img
                      src={p.coverUrl}
                      alt={p.title}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}

                  <h3 className="font-semibold">
                    <Link href={projectHref}>{p.title}</Link>
                  </h3>

                  {p.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {p.summary}
                    </p>
                  )}

                  <div className="mt-2 flex gap-2 flex-wrap">
                    {/* Variants soportados: default (sin prop), secondary, outline, destructive */}
                    {p.place && <Badge>{p.place}</Badge>}
                    {p.category && <Badge variant="secondary">{p.category}</Badge>}
                    {p.area && <Badge variant="outline">{p.area}</Badge>}
                    {p.status && <Badge variant="outline">{p.status}</Badge>}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              disabled={page <= 1}
              onClick={() => {
                const n = page - 1;
                setPage(n);
                load(n);
              }}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {page} de {totalPages}
            </span>
            <Button
              disabled={page >= totalPages}
              onClick={() => {
                const n = page + 1;
                setPage(n);
                load(n);
              }}
            >
              Siguiente
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
