"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Modal from "../../../components/ui/Modal";
import { listProjects } from "@/services/projects.service";
import type { Project } from "@/lib/projects.types";

export default function PortafolioProyectos() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await listProjects({ page: 1, pageSize: 12 });
        const published = (Array.isArray(data) ? data : []).filter((p) => p?.published === true);
        setItems(published.slice(0, 3));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando proyectos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center font-modern">
        PORTAFOLIO DE PROYECTOS
      </h2>

      {error ? (
        <div className="p-4 rounded border border-red-300 bg-red-50 text-red-700 text-center">
          {error}
          <div className="mt-2">
            <Button variant="secondary" onClick={() => location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      ) : loading ? (
        <p className="text-center text-gray-600">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-600">Aún no hay proyectos publicados.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow overflow-hidden rounded-2xl">
              <div className="h-48 bg-slate-50">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                    Sin imagen
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                {/* 🔧 FIX: evita overflow de títulos larguísimos sin espacios */}
                <h3 className="text-lg font-semibold text-gray-900 font-modern break-words hyphens-auto">
                  {p.title}
                </h3>

                {p.summary && (
                  <p className="text-gray-600 text-sm font-modern mt-1 line-clamp-3">
                    {p.summary}
                  </p>
                )}

                <div className="mt-3 flex gap-2 flex-wrap">
                  {p.place && <Badge>{p.place}</Badge>}
                  {p.category && <Badge variant="secondary">{p.category}</Badge>}
                  {p.area && <Badge variant="outline">{p.area}</Badge>}
                </div>

                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelected(p);
                      setOpen(true);
                    }}
                  >
                    Ver más
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Button asChild className="bg-blue-600 hover:bg-blue-700 font-modern">
          <Link href="/landing/projects">Ver más proyectos</Link>
        </Button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={selected?.title ?? ""}>
        {selected?.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.coverUrl} alt={selected.title} className="w-full h-56 object-cover rounded-md mb-4" />
        )}
        {selected?.summary && <p className="text-slate-600 mb-3">{selected.summary}</p>}
        <div className="flex gap-2 flex-wrap mb-3">
          {selected?.place && <Badge>{selected.place}</Badge>}
          {selected?.category && <Badge variant="secondary">{selected.category}</Badge>}
          {selected?.area && <Badge variant="outline">{selected.area}</Badge>}
          {selected?.status && <Badge variant="outline">{selected.status}</Badge>}
        </div>
        {selected?.content && <p className="text-slate-700 whitespace-pre-line">{selected.content}</p>}
      </Modal>
    </section>
  );
}
