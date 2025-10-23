"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listProjects,
  createProject,
  updateProject,
  removeProject,
} from "@/services/projects.service";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import type { ProjectCreateInput, ProjectUpdateInput } from "../types/project.types";

type Mode =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; item: Project };

export function useProjects() {
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

  // Estado formulario / modales
  const [mode, setMode] = useState<Mode>({ kind: "none" });

  // Archivos post-create
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

  // Acciones de filtros
  function applyFilters() {
    setPage(1);
    load(1);
  }

  function clearFilters() {
    setQ("");
    setPlace("");
    setCategory("");
    setArea("");
    setStatus("");
    setPublished("");
    setPage(1);
    load(1);
  }

  function reload() {
    setPage(1);
    load(1);
  }

  // Paginación
  function goPrev() {
    const n = Math.max(1, page - 1);
    setPage(n);
    load(n);
  }

  function goNext() {
    const n = Math.min(totalPages, page + 1);
    setPage(n);
    load(n);
  }

  // CRUD
  async function handleCreate(payload: ProjectCreateInput): Promise<void> {
    // 1) Abrir modal de archivos y cerrar el de crear
    setFilesModalOpen(true);
    setNewProjectId(null); // “Guardando…”
    setMode({ kind: "none" });

    // 2) Crear
    const created = await createProject(payload);
    const id = (created as any)?.id ?? (created as any)?.data?.id;

    // 3) Pasar id al modal
    setNewProjectId(id);

    // 4) Refrescar
    load(1);
  }

  async function handleUpdate(payload: ProjectUpdateInput, id: number) {
    await updateProject(id, payload);
    setMode({ kind: "none" });
    await load(page);
  }

  async function handleRemove(id: number) {
    await removeProject(id);
    await load(page);
  }

  return {
    // datos
    items, loading,

    // filtros
    q, setQ,
    place, setPlace,
    category, setCategory,
    area, setArea,
    status, setStatus,
    published, setPublished,

    // opciones
    places, categories, areas,

    // paginación
    page, totalPages, goPrev, goNext,

    // acciones
    applyFilters, clearFilters, reload,

    // CRUD / modal
    mode, setMode,
    handleCreate, handleUpdate, handleRemove,
    filesModalOpen, setFilesModalOpen, newProjectId,
  };
}
