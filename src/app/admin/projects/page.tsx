"use client";

import { useEffect, useMemo, useState } from "react";
import { listProjects, createProject, updateProject, removeProject } from "@/services/projects.service";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProjectForm from "@/app/admin/projects/ProjectForm"

// Tipos de payload en el front, alineados a tus DTOs del back
export type ProjectCreateInput = {
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverUrl?: string;
  category: string;
  place: string;
  area: string;
  status?: ProjectStatus;
  published?: boolean;
};

export type ProjectUpdateInput = Partial<ProjectCreateInput>;

// Modo de la vista (crear/editar/ninguno)
type Mode =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; item: Project };

export default function AdminProjectsPage() {
  // Filtros
  const [q, setQ] = useState<string>("");
  const [place, setPlace] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [published, setPublished] = useState<"" | "true" | "false">("");

  // Paginación
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Datos
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<Project[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Modo CRUD
  const [mode, setMode] = useState<Mode>({ kind: "none" });

  async function load(nextPage: number = page): Promise<void> {
    setLoading(true);
    try {
      const pub: boolean | undefined = published === "" ? undefined : published === "true";
      const { data, total: t } = await listProjects({
        q,
        place,
        category,
        area,
        status: status || undefined,
        page: nextPage,
        pageSize,
        published: pub,
      });
      setItems(Array.isArray(data) ? data : []);
      setTotal(typeof t === "number" ? t : 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Primera carga
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opciones derivadas del dataset (si no tienes catálogos independientes)
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

  // Handlers tipados (sin any)
  async function handleCreate(payload: ProjectCreateInput): Promise<void> {
    await createProject(payload);
    setMode({ kind: "none" });
    await load(1);
  }

  async function handleUpdate(payload: ProjectUpdateInput, id: number): Promise<void> {
    await updateProject(id, payload);
    setMode({ kind: "none" });
    await load(page);
  }

  async function handleRemove(id: number): Promise<void> {
    // confirm es global en DOM, no requiere import
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("¿Dar de baja/eliminar este proyecto?")) return;
    await removeProject(id);
    await load(page);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Proyectos (Admin)</h1>
        {mode.kind === "none" && (
          <Button onClick={() => setMode({ kind: "create" })}>Añadir proyecto</Button>
        )}
      </div>

      {/* Filtros */}
      {mode.kind === "none" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-3">
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

          <select
            className="border rounded px-3 py-2"
            value={published}
            onChange={(e) => setPublished(e.target.value as "" | "true" | "false")}
          >
            <option value="">Publicado (todos)</option>
            <option value="true">Publicado</option>
            <option value="false">No publicado</option>
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
                setPublished("");
                setPage(1);
                load(1);
              }}
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {/* Crear / Editar */}
      {mode.kind === "create" && (
        <ProjectForm
          onCancel={() => setMode({ kind: "none" })}
          onSubmit={handleCreate}
        />
      )}

      {mode.kind === "edit" && (
        <ProjectForm
          initial={mode.item}
          onCancel={() => setMode({ kind: "none" })}
          onSubmit={(payload: ProjectUpdateInput) => handleUpdate(payload, mode.item.id)}
        />
      )}

      {/* Lista */}
      {mode.kind === "none" && (
        <>
          {loading ? (
            <p>Cargando…</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => (
                <Card key={p.id} className="p-4">
                  {p.coverUrl && (
                    <img
                      src={p.coverUrl}
                      alt={p.title}
                      className="w-full h-36 object-cover rounded mb-3"
                    />
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{p.title}</h3>
                      <div className="mt-1 flex gap-2 flex-wrap">
                        {p.place && <Badge>{p.place}</Badge>}
                        {p.category && <Badge variant="secondary">{p.category}</Badge>}
                        {p.area && <Badge variant="outline">{p.area}</Badge>}
                        {p.status && <Badge variant="outline">{p.status}</Badge>}
                        {p.published && <Badge variant="outline">Publicado</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setMode({ kind: "edit", item: p })}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(p.id)}
                      >
                        Dar de baja
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

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
            <span className="text-sm">Página {page} de {totalPages}</span>
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
