"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import {
  listProjects,
  createProject,
  updateProject,
  removeProject,
} from "@/services/projects.service";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProjectForm from "@/app/admin/projects/ProjectForm";
import Modal from "@/components/ui/Modal";
import ProjectFilesModal from "./ProjectFilesModal";

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

  // Estado del formulario (modal padre)
  const [mode, setMode] = useState<Mode>({ kind: "none" });

  // Estado para modal de archivos
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [newProjectId, setNewProjectId] = useState<number | null>(null);

  async function load(nextPage: number = page): Promise<void> {
    setLoading(true);
    try {
      const pub: boolean | undefined =
        published === "" ? undefined : published === "true";
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

  // Opciones derivadas
  const places = useMemo(
    () => Array.from(new Set(items.map((i) => i.place).filter(Boolean))).sort(),
    [items]
  );
  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort(),
    [items]
  );
  const areas = useMemo(
    () => Array.from(new Set(items.map((i) => i.area).filter(Boolean))).sort(),
    [items]
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function handleCreate(payload: ProjectCreateInput): Promise<void> {
    // 1) Abrir modal de archivos y cerrar el de crear
    setFilesModalOpen(true);
    setNewProjectId(null); // mostrará "Guardando…"
    setMode({ kind: "none" });

    // 2) Crear el proyecto
    const created = await createProject(payload);
    const id = (created as any)?.id ?? (created as any)?.data?.id;

    // 3) Pasar el id al modal
    setNewProjectId(id);

    // 4) Refrescar lista
    load(1);
  }

  async function handleUpdate(
    payload: ProjectUpdateInput,
    id: number
  ): Promise<void> {
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
              {/* 🎨 Navegación secundaria: outline neutral */}
              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Proyectos (Admin)</h1>
              <p className="text-slate-600">
                Administra proyectos, crea nuevos y edita los existentes.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* 🎨 Acción secundaria: gris neutro */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPage(1);
                load(1);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
            {/* 🎨 Acción primaria: azul (igual que Aplicar) */}
            <Button
              size="sm"
              onClick={() => {
                setMode({ kind: "create" });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
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
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />

          <select
            className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
            className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
            className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
            className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus | "")}
          >
            <option value="">Estado (todos)</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="PAUSADO">Pausado</option>
          </select>

          <select
            className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={published}
            onChange={(e) =>
              setPublished(e.target.value as "" | "true" | "false")
            }
          >
            <option value="">Publicado (todos)</option>
            <option value="true">Publicado</option>
            <option value="false">No publicado</option>
          </select>

          <div className="flex gap-2">
            {/* 🎨 Aplicar filtros: azul (acción principal) */}
            <Button
              onClick={() => {
                setPage(1);
                load(1);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Aplicar
            </Button>
            {/* 🎨 Limpiar filtros: gris neutro */}
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
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Cargando…</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <Card key={p.id} className="p-4 hover:shadow-lg transition-shadow">
                {p.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.coverUrl}
                    alt={p.title}
                    className="w-full h-36 object-cover rounded mb-3"
                  />
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold break-words hyphens-auto">
                      {p.title}
                    </h3>
                    <div className="mt-1 flex gap-2 flex-wrap">
                      {p.place && <Badge className="bg-blue-100 text-blue-700 border-blue-200">{p.place}</Badge>}
                      {p.category && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">{p.category}</Badge>
                      )}
                      {p.area && <Badge variant="outline" className="border-gray-300 text-gray-600">{p.area}</Badge>}
                      {p.status && <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">{p.status}</Badge>}
                      {p.published && (
                        <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">Publicado</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {/* 🎨 Editar: azul (acción informativa/modificación) */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setMode({ kind: "edit", item: p })}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200"
                    >
                      Editar
                    </Button>
                    {/* 🎨 Eliminar: rojo (acción destructiva) */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(p.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
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
          {/* 🎨 Navegación: gris neutro con estados disabled claros */}
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => {
              const n = Math.max(1, page - 1);
              setPage(n);
              load(n);
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Anterior
          </Button>

          <span className="text-sm font-medium text-gray-700 px-4">
            Página {Math.min(page, totalPages)} de {totalPages}
          </span>

          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => {
              const n = Math.min(totalPages, page + 1);
              setPage(n);
              load(n);
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Siguiente
          </Button>
        </div>

        {/* Modal del formulario */}
        <Modal
          open={mode.kind !== "none"}
          onClose={() => setMode({ kind: "none" })}
          title={mode.kind === "create" ? "Añadir proyecto" : "Editar proyecto"}
        >
          {/* CREATE */}
          <div style={{ display: mode.kind === "create" ? "block" : "none" }}>
            <ProjectForm
              key="create"
              mode="create"
              onCancel={() => setMode({ kind: "none" })}
              onSubmit={handleCreate}
            />
          </div>

          {/* EDIT */}
          <div style={{ display: mode.kind === "edit" ? "block" : "none" }}>
            {mode.kind === "edit" && (
              <ProjectForm
                key={`edit-${mode.item.id}`}
                mode="edit"
                initial={mode.item}
                onCancel={() => setMode({ kind: "none" })}
                onSubmit={(p) => handleUpdate(p, mode.item.id)}
              />
            )}
          </div>
        </Modal>

        {/* Modal de archivos */}
        <ProjectFilesModal
          open={filesModalOpen}
          onOpenChange={setFilesModalOpen}
          projectId={newProjectId}
        />
      </div>
    </main>
  );
}