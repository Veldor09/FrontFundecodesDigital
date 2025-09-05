import type { Project, ProjectQuery, ProjectStatus } from "@/lib/projects.types";
import API from './api';
import { uploadFile, deleteFile } from './files.service';

// Base: usamos el proxy del front (/api -> http://localhost:4000)
const API_BASE = "/api";

// -----------------------------
// Utilidades
// -----------------------------

type QueryParamPrimitive = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryParamPrimitive>;

function toQuery(params: QueryParams): string {
  const q = new URLSearchParams();
  (Object.entries(params) as [string, QueryParamPrimitive][])
    .forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === "string" && v.trim() === "") return;
      q.append(k, String(v));
    });
  return q.toString();
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new Error(`No se pudo conectar a la API: ${url}`);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${init?.method ?? "GET"} ${url} → ${res.status}: ${text}`);
  }
  return res;
}

// Normaliza cualquier forma de respuesta a { data, total, page, pageSize } sin usar `any`
function normalizeList(
  json: unknown
): { data: Project[]; total?: number; page?: number; pageSize?: number } {
  let data: Project[] = [];
  let total: number | undefined;
  let page: number | undefined;
  let pageSize: number | undefined;

  if (Array.isArray(json)) {
    // Respuesta: array plano
    data = json as Project[];
  } else if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;

    // data en distintas claves conocidas
    if (Array.isArray(obj.data)) data = obj.data as Project[];
    else if (Array.isArray(obj.items)) data = obj.items as Project[];
    else if (Array.isArray(obj.results)) data = obj.results as Project[];
    else if (Array.isArray(obj.rows)) data = obj.rows as Project[];

    // total directo
    if (typeof obj.total === "number") total = obj.total;
    else if (typeof obj.count === "number") total = obj.count;

    // meta.total / meta.page / meta.pageSize
    if (obj.meta && typeof obj.meta === "object") {
      const meta = obj.meta as Record<string, unknown>;
      if (typeof meta.total === "number") total ??= meta.total;
      if (typeof meta.page === "number") page = meta.page;
      if (typeof meta.pageSize === "number") pageSize = meta.pageSize;
    }

    // pagination.total / pagination.page / pagination.pageSize
    if (obj.pagination && typeof obj.pagination === "object") {
      const pag = obj.pagination as Record<string, unknown>;
      if (typeof pag.total === "number") total ??= pag.total;
      if (typeof pag.page === "number") page ??= pag.page;
      if (typeof pag.pageSize === "number") pageSize ??= pag.pageSize;
    }

    // fallback de total: largo del array
    if (total === undefined && Array.isArray(data)) {
      total = data.length;
    }
  }

  return { data, total, page, pageSize };
}

// -----------------------------
// API pública
// -----------------------------

type ListReturn = {
  data: Project[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export async function listProjects(params: ProjectQuery = {}): Promise<ListReturn> {
  const qs = toQuery(params as QueryParams);
  const url = `${API_BASE}/projects${qs ? `?${qs}` : ""}`;
  const res = await safeFetch(url, { headers: { "Content-Type": "application/json" } });
  const json: unknown = await res.json();
  return normalizeList(json);
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  const url = `${API_BASE}/projects/${encodeURIComponent(slug)}`;
  const res = await safeFetch(url, { headers: { "Content-Type": "application/json" } });
  const json: unknown = await res.json();
  // aquí asumimos que la API devuelve un Project
  return json as Project;
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
  const url = `${API_BASE}/projects`;
  const res = await safeFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json: unknown = await res.json();
  return json as Project;
}

export async function updateProject(id: number, payload: ProjectUpdateInput): Promise<Project> {
  const url = `${API_BASE}/projects/${id}`;
  const res = await safeFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json: unknown = await res.json();
  return json as Project;
}

export async function removeProject(id: number): Promise<{ success?: boolean } | Project> {
  const url = `${API_BASE}/projects/${id}`;
  const res = await safeFetch(url, { method: "DELETE" });
  const json: unknown = await res.json();
  return json as { success?: boolean } | Project;
}
// Subir archivo para un proyecto específico
export async function uploadProjectFile(projectId: number, file: File): Promise<any> {
  try {
    const uploadResponse = await uploadFile(file);
    
    // Asociar archivo al proyecto
    const response = await API.post(`/projects/${projectId}/add-document-url`, {
      url: uploadResponse.url,
      name: uploadResponse.name,
      mimeType: uploadResponse.mimeType
    });
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al subir archivo del proyecto: ${error.message}`);
    } else {
      throw new Error('Error desconocido al subir archivo del proyecto');
    }
  }
}

// Eliminar archivo de un proyecto
export async function deleteProjectFile(projectId: number, url: string): Promise<any> {
  try {
    // Primero eliminar del servidor de archivos
    await deleteFile(url);
    
    // Luego desasociar del proyecto (si existe endpoint)
    try {
      await API.delete(`/projects/${projectId}/documents`, {
        data: { url }
      });
    } catch (e) {
      // Si no existe endpoint, solo eliminar el archivo físico
      console.log('Documento desasociado del proyecto');
    }
    
    return { message: 'Archivo eliminado exitosamente' };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    } else {
      throw new Error('Error desconocido al eliminar archivo');
    }
  }
}

// Obtener archivos de un proyecto
export async function getProjectFiles(projectId: number): Promise<any[]> {
  try {
    const response = await API.get(`/projects/${projectId}/documents`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener archivos: ${error.message}`);
    } else {
      throw new Error('Error desconocido al obtener archivos');
    }
  }
}
