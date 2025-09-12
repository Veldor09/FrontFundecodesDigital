"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listProjects } from "@/services/projects.service";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/ui/Modal";
import Footer from "@/app/landing/components/Footer";

export default function ProjectsPublicPage() {
  // Filtros y estado
  const [q, setQ] = useState("");
  const [place, setPlace] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<Project[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  async function load(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listProjects({
        q,
        place,
        category,
        area,
        status: status || undefined,
        page: nextPage,
        pageSize,
      });

      const arr = Array.isArray(data) ? data : [];
      const published = arr.filter((p) => p?.published === true);

      setItems(published);
      setTotal(published.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando proyectos");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opciones de filtros derivadas del dataset visible
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

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Topbar compacto */}
      <header className="bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1
            className="text-white text-xl font-bold tracking-wide"
            style={{ fontFamily: "Anton, sans-serif", letterSpacing: "-0.02em" }}
          >
            Proyectos FUNDECODES
          </h1>

          <Button asChild variant="secondary" className="bg-white/15 hover:bg-white/25 text-white">
            <Link href="/#inicio">Volver</Link>
          </Button>
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto p-6 flex-1 space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">Proyectos</h2>

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

        {/* Grid de tarjetas */}
        {error ? (
          <div className="p-4 rounded border border-red-300 bg-red-50 text-red-700">
            {error}
            <div className="mt-2">
              <Button variant="secondary" onClick={() => load(1)}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : loading ? (
          <p>Cargando…</p>
        ) : items.length === 0 ? (
          <p>No hay proyectos publicados que coincidan con los filtros.</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((p) => {
                const openModal = () => {
                  setSelected(p);
                  setOpen(true);
                };

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                  >
                    {/* Imagen */}
                    <div className="h-48 bg-slate-50">
                      {p.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.coverUrl}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-5">
                      {/* 🔧 FIX: Evitar overflow con títulos muy largos sin espacios */}
                      <h3 className="font-semibold text-slate-900 break-words hyphens-auto">
                        {p.title}
                      </h3>
                      {p.summary && (
                        <p className="mt-1 text-sm text-slate-600">{p.summary}</p>
                      )}

                      <div className="mt-3 flex gap-2 flex-wrap">
                        {p.place && <Badge>{p.place}</Badge>}
                        {p.category && (
                          <Badge variant="secondary">{p.category}</Badge>
                        )}
                        {p.area && <Badge variant="outline">{p.area}</Badge>}
                        {p.status && <Badge variant="outline">{p.status}</Badge>}
                      </div>

                      <div className="mt-4">
                        <Button size="sm" variant="secondary" onClick={openModal}>
                          Ver más
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-center gap-2 mt-8">
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
                Página {page} de {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <Button
                disabled={page >= Math.max(1, Math.ceil(total / pageSize))}
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

        {/* Modal “Ver más” */}
        <Modal open={open} onClose={() => setOpen(false)} title={selected?.title ?? ""}>
          {selected?.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.coverUrl}
              alt={selected.title}
              className="w-full h-56 object-cover rounded-md mb-4"
            />
          )}

          {selected?.summary && (
            <p className="text-slate-600 mb-3">{selected.summary}</p>
          )}

          <div className="flex gap-2 flex-wrap mb-3">
            {selected?.place && <Badge>{selected.place}</Badge>}
            {selected?.category && (
              <Badge variant="secondary">{selected.category}</Badge>
            )}
            {selected?.area && <Badge variant="outline">{selected.area}</Badge>}
            {selected?.status && <Badge variant="outline">{selected.status}</Badge>}
            {selected?.published && <Badge variant="outline">Publicado</Badge>}
          </div>

          {selected?.content && (
            <p className="text-slate-700 whitespace-pre-line">{selected.content}</p>
          )}
        </Modal>
      </main>

      {/* Footer global de la landing siempre visible */}
      <Footer />
    </div>
  );
}
