"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { listProjects, createProject, updateProject, removeProject } from "@/services/projects.service";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProjectForm from "@/app/admin/projects/ProjectForm";
import Modal from "@/components/ui/Modal";

// Tipos de payload
export type ProjectCreateInput = {
  title: string;
  summary?: string;
  content?: string;
  coverUrl?: string;
  category: string;
  place: string;
  area: string;
  funds?: number;
  status?: ProjectStatus;
  published?: boolean;
};
export type ProjectUpdateInput = Partial<ProjectCreateInput>;

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

  // Estado del formulario
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
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opciones derivadas del dataset
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
    if (!confirm("¿Dar de baja/eliminar este proyecto?")) return;
    await removeProject(id);
    await load(page);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Proyectos (Admin)</h1>
              <p className="text-slate-600">Administra proyectos, crea nuevos y edita los existentes.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPage(1);
                load(1);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
            <Button size="sm" onClick={() => setMode({ kind: "create" })}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir proyecto
            </Button>
          </div>
        </div>

        {/* Filtros */}
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

        {/* Lista */}
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <Card key={p.id} className="p-4">
                {p.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
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

        
        {/* Modal SIEMPRE montado – solo cambia "open" */}
<Modal
  open={mode.kind !== "none"}
  onClose={() => setMode({ kind: "none" })}
  title={mode.kind === "create" ? "Añadir proyecto" : "Editar proyecto"}
>
  {/* Form CREATE – siempre en DOM */}
  <div style={{ display: mode.kind === "create" ? "block" : "none" }}>
    <ProjectForm
      key="create"
      onCancel={() => setMode({ kind: "none" })}
      onSubmit={handleCreate}
    />
  </div>

  {/* Form EDIT – siempre en DOM */}
  <div style={{ display: mode.kind === "edit" ? "block" : "none" }}>
    {mode.kind === "edit" && (
      <ProjectForm
        key={`edit-${mode.item.id}`}
        initial={mode.item}
        onCancel={() => setMode({ kind: "none" })}
        onSubmit={(p) => handleUpdate(p, mode.item.id)}
      />
    )}
  </div>
</Modal>
      </div>
    </main>
  );
}