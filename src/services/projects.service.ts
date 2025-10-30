// src/services/projects.service.ts
import type { Project, ProjectQuery, ProjectStatus } from "@/lib/projects.types";
import API from "./api";
import { uploadFile, deleteFile } from "./files.service";

// -----------------------------
// Tipos de documentos
// -----------------------------
export type ProjectDocument = {
  id: number;
  url: string;
  name: string;
  mimeType: string;
  size?: number;
  createdAt?: string;
};

// -----------------------------
// Normalización de respuestas con lista
// -----------------------------
function normalizeList(
  json: unknown
): { data: Project[]; total?: number; page?: number; pageSize?: number } {
  let data: Project[] = [];
  let total: number | undefined;
  let page: number | undefined;
  let pageSize: number | undefined;

  if (Array.isArray(json)) {
    data = json as Project[];
  } else if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;

    if (Array.isArray(obj.data)) data = obj.data as Project[];
    else if (Array.isArray(obj.items)) data = obj.items as Project[];
    else if (Array.isArray(obj.results)) data = obj.results as Project[];
    else if (Array.isArray(obj.rows)) data = obj.rows as Project[];

    if (typeof obj.total === "number") total = obj.total;
    else if (typeof obj.count === "number") total = obj.count;

    if (obj.meta && typeof obj.meta === "object") {
      const meta = obj.meta as Record<string, unknown>;
      if (typeof meta.total === "number") total ??= meta.total;
      if (typeof meta.page === "number") page = meta.page;
      if (typeof meta.pageSize === "number") pageSize = meta.pageSize;
    }

    if (obj.pagination && typeof obj.pagination === "object") {
      const pag = obj.pagination as Record<string, unknown>;
      if (typeof pag.total === "number") total ??= pag.total;
      if (typeof pag.page === "number") page ??= pag.page;
      if (typeof pag.pageSize === "number") pageSize ??= pag.pageSize;
    }

    if (total === undefined && Array.isArray(data)) total = data.length;
  }

  return { data, total, page, pageSize };
}

// -----------------------------
// API pública (Proyectos)
// -----------------------------
type ListReturn = {
  data: Project[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export async function listProjects(params: ProjectQuery = {}): Promise<ListReturn> {
  const { data } = await API.get("/projects", { params });
  return normalizeList(data as unknown);
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  const { data } = await API.get(`/projects/${encodeURIComponent(slug)}`);
  return data as Project;
}

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

export async function createProject(payload: ProjectCreateInput): Promise<Project> {
  const { data } = await API.post("/projects", payload);
  return data as Project;
}

export async function updateProject(id: number, payload: ProjectUpdateInput): Promise<Project> {
  const { data } = await API.patch(`/projects/${id}`, payload);
  return data as Project;
}

export async function removeProject(id: number): Promise<{ success?: boolean } | Project> {
  const res = await API.delete(`/projects/${id}`);
  // Si el back devuelve 204 No Content, axios deja data vacío; devolvemos success=true
  return (res.data ?? { success: true }) as { success?: boolean } | Project;
}

// -----------------------------
// Documentos del Proyecto
// -----------------------------

/**
 * Flujo “subida indirecta”:
 * 1) sube a /files (uploadFile) -> obtienes { url, name, mimeType }
 * 2) asocia al proyecto por URL.
 *    ⚠️ Requiere que el back tenga POST /projects/:id/add-document-url
 */
export async function uploadProjectFile(projectId: number, file: File): Promise<ProjectDocument> {
  const uploaded = await uploadFile(file); // { url, name, mimeType }
  const { data } = await API.post(`/projects/${projectId}/add-document-url`, {
    url: uploaded.url,
    name: uploaded.name,
    mimeType: uploaded.mimeType,
    size: (file as any).size ?? undefined,
  });
  return data as ProjectDocument;
}

/**
 * Eliminar documento por **ID** (recomendado).
 * DELETE /projects/:id/documents/:documentId
 */
export async function deleteProjectFile(projectId: number, documentId: number): Promise<{ message: string }> {
  const res = await API.delete(`/projects/${projectId}/documents/${documentId}`);
  return (res.data ?? { message: "Documento eliminado" }) as { message: string };
}

/**
 * (Opcional) Eliminar documento por **URL/nombre** – compat legacy.
 * Además intenta borrar el archivo físico vía deleteFile(url).
 */
export async function deleteProjectFileByUrl(projectId: number, url: string): Promise<{ message: string }> {
  await deleteFile(url).catch(() => void 0);

  const rawName = url.split("/").pop() || "";
  const decoded = decodeURIComponent(rawName);

  try {
    const res1 = await API.delete(`/projects/${projectId}/documents`, { params: { name: decoded } });
    return res1.data ?? { message: "Documento eliminado" };
  } catch {
    const res2 = await API.delete(`/projects/${projectId}/documents`, { data: { url } });
    return res2.data ?? { message: "Documento eliminado" };
  }
}

/**
 * Obtener documentos del proyecto
 * GET /projects/:id/documents
 */
export async function getProjectFiles(projectId: number): Promise<ProjectDocument[]> {
  const { data } = await API.get(`/projects/${projectId}/documents`);
  const items = Array.isArray(data) ? data : [];
  return items.map((d: any) => ({
    id: Number(d.id),
    url: String(d.url),
    name: String(d.name),
    mimeType: String(d.mimeType ?? "application/octet-stream"),
    size: typeof d.size === "number" ? d.size : undefined,
    createdAt: d.createdAt ? String(d.createdAt) : undefined,
  })) as ProjectDocument[];
}
