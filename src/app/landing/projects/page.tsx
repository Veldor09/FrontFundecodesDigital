"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listProjects } from "@/services/projects.service";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/ui/Modal";
import Header from "@/app/landing/components/Header";
import Footer from "@/app/landing/components/Footer";
import { Leaf, Microscope, BookOpen, Users, Filter } from "lucide-react";

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

  // UI: mostrar/ocultar filtros avanzados
  const [showFilters, setShowFilters] = useState(false);

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
    <div className="min-h-screen bg-[#1e3a8a] text-white flex flex-col">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <section className="relative max-w-6xl mx-auto">
          {/* Tarjeta principal */}
          <div className="relative bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div
              className="px-6 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12 text-slate-700"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              {/* Encabezado de sección */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1e3a8a]">
                    Proyectos
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
                    Explora los proyectos publicados relacionados con conservación, educación
                    ambiental y trabajo con comunidades.
                  </p>
                </div>

                <div className="flex justify-start sm:justify-end">
                  <Button
                    asChild
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <Link href="/#inicio">Volver al inicio</Link>
                  </Button>
                </div>
              </div>

              {/* Buscador + botón de filtros */}
              <section className="mb-8">
                <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 lg:p-7 space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1e3a8a]">
                    Buscar proyectos
                  </h2>
                  <p className="text-sm text-slate-600">
                    Ingresa un nombre o utiliza filtros avanzados para afinar tu búsqueda.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar por nombre…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="h-11 border-slate-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFilters((prev) => !prev)}
                        className="h-11 px-3 border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm hidden sm:inline">
                          {showFilters ? "Ocultar filtros" : "Filtros"}
                        </span>
                        <span className="text-sm sm:hidden">
                          {showFilters ? "Ocultar" : "Filtros"}
                        </span>
                      </Button>

                      <Button
                        onClick={() => {
                          setPage(1);
                          load(1);
                        }}
                        className="h-11 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold"
                      >
                        Buscar
                      </Button>
                    </div>
                  </div>

                  {/* Filtros avanzados plegables */}
                  {showFilters && (
                    <div className="pt-4 mt-2 border-t border-slate-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <select
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={status}
                          onChange={(e) => setStatus(e.target.value as ProjectStatus | "")}
                        >
                          <option value="">Estado (todos)</option>
                          <option value="EN_PROCESO">En proceso</option>
                          <option value="FINALIZADO">Finalizado</option>
                          <option value="PAUSADO">Pausado</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                        <Button
                          onClick={() => {
                            setPage(1);
                            load(1);
                          }}
                          className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                          Aplicar filtros
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setQ("");
                            setPlace("");
                            setCategory("");
                            setArea("");
                            setStatus("");
                            setPage(1);
                            load(1);
                          }}
                          className="h-10 px-4 border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Grid de tarjetas / estados */}
              <section>
                {error ? (
                  <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-700">
                    <p className="font-medium">Ocurrió un problema al cargar los proyectos.</p>
                    <p className="text-sm mt-1">{error}</p>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        onClick={() => load(1)}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        Reintentar
                      </Button>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center py-10">
                    <p className="text-sm text-slate-500">Cargando proyectos…</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No hay proyectos publicados que coincidan con los filtros seleccionados.
                  </div>
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
                            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                            {/* Imagen */}
                            <div className="h-44 sm:h-48 bg-slate-50">
                              {p.coverUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.coverUrl}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs sm:text-sm">
                                  Sin imagen
                                </div>
                              )}
                            </div>

                            {/* Contenido */}
                            <div className="p-5">
                              <h3 className="font-semibold text-slate-900 break-words hyphens-auto text-base sm:text-lg">
                                {p.title}
                              </h3>
                              {p.summary && (
                                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                                  {p.summary}
                                </p>
                              )}

                              <div className="mt-3 flex gap-2 flex-wrap">
                                {p.place && <Badge>{p.place}</Badge>}
                                {p.category && (
                                  <Badge variant="secondary">{p.category}</Badge>
                                )}
                                {p.area && <Badge variant="outline">{p.area}</Badge>}
                                {p.status && (
                                  <Badge variant="outline" className="uppercase text-[11px]">
                                    {p.status}
                                  </Badge>
                                )}
                              </div>

                              <div className="mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={openModal}
                                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                                >
                                  Ver más
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Paginación */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                      <Button
                        disabled={page <= 1}
                        onClick={() => {
                          const n = page - 1;
                          setPage(n);
                          load(n);
                        }}
                        className="h-10 px-4 disabled:opacity-50"
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-slate-600">
                        Página {page} de {totalPages}
                      </span>
                      <Button
                        disabled={page >= totalPages}
                        onClick={() => {
                          const n = page + 1;
                          setPage(n);
                          load(n);
                        }}
                        className="h-10 px-4 disabled:opacity-50"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </>
                )}
              </section>

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
                  <p className="text-slate-600 mb-3 text-sm sm:text-base">{selected.summary}</p>
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
                  <p className="text-slate-700 whitespace-pre-line text-sm sm:text-base">
                    {selected.content}
                  </p>
                )}
              </Modal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
