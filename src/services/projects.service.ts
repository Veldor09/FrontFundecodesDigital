import type { Project, ProjectQuery, ProjectStatus } from "@/lib/projects.types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Tipado explícito para los params de query (sin any)
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

type ListReturn = {
  data: Project[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export async function listProjects(params: ProjectQuery = {}): Promise<ListReturn> {
  const qs = toQuery(params as QueryParams);
  const res = await fetch(`${API_BASE}/projects${qs ? `?${qs}` : ""}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET /projects ${res.status}`);
  return res.json();
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(slug)}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GET /projects/${slug} ${res.status}`);
  return res.json();
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
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /projects ${res.status}`);
  return res.json();
}

export async function updateProject(id: number, payload: ProjectUpdateInput): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PATCH /projects/${id} ${res.status}`);
  return res.json();
}

export async function removeProject(id: number): Promise<{ success?: boolean } | Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /projects/${id} ${res.status}`);
  return res.json();
}
