const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export type ProjectOption = { id: number; title: string }

export class ProjectsService {
  static async list(): Promise<ProjectOption[]> {
    const res = await fetch(`${API}/projects`, { credentials: "include" })
    if (!res.ok) throw new Error("No se pudieron obtener proyectos")
    return res.json()
  }
}
