import type { Document } from "../types"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const monthNameToNumber = (name: string) => MONTHS.indexOf(name) + 1

async function findProjectIdByTitle(title: string): Promise<number> {
  const res = await fetch(`${API}/projects`, { credentials: "include" })
  if (!res.ok) throw new Error("No se pudieron obtener proyectos")
  const projects = await res.json() as Array<{ id: number; title: string }>
  const match = projects.find(p => (p.title ?? "").toLowerCase() === title.toLowerCase())
  if (!match) throw new Error("Proyecto no encontrado: " + title)
  return match.id
}

function mimeToTipo(mime: string): string {
  if (mime.includes("pdf")) return "PDF"
  if (mime.includes("sheet")) return "Excel"
  if (mime.includes("image")) return "Imagen"
  return "Archivo"
}

function mapFromApi(x: any): Document {
  return {
    id: x.id,
    nombre: x.nombre,
    programa: x.proyecto,                    // UI mantiene "programa"
    mes: MONTHS[Number(x.mes) - 1] ?? "",
    año: Number(x.anio),
    tipo: mimeToTipo(x.tipoMime),
    tamaño: Number(x.bytes),
    url: `${API}${x.url}`,                   // asegura descarga correcta desde backend
    fechaSubida: x.createdAt ? new Date(x.createdAt) : new Date(),
  }
}

export class DocumentService {
  static async getDocuments(filters?: { programa?: string; mes?: string; anio?: number }): Promise<Document[]> {
    const p = new URLSearchParams()
    if (filters?.programa) {
      try {
        const pid = await findProjectIdByTitle(filters.programa)
        p.set("projectId", String(pid))
      } catch {/* ignora si no existe */}
    }
    if (filters?.mes) p.set("mes", String(monthNameToNumber(filters.mes)))
    if (filters?.anio) p.set("anio", String(filters.anio))

    const res = await fetch(`${API}/contabilidad/documentos?${p.toString()}`, { credentials: "include" })
    if (!res.ok) throw new Error("Error al obtener documentos")
    const data = await res.json()
    return (data as any[]).map(mapFromApi)
  }

  static async uploadDocument(
    file: File,
    metadata: Omit<Document, "id" | "url" | "fechaSubida" | "tamaño" | "tipo">,
  ): Promise<Document> {
    const projectId = await findProjectIdByTitle(metadata.programa)
    const form = new FormData()
    form.append("file", file)
    form.append("projectId", String(projectId))
    form.append("proyecto", metadata.programa)            // backend espera "proyecto"
    form.append("mes", String(monthNameToNumber(metadata.mes)))
    form.append("anio", String(metadata.año))

    const res = await fetch(`${API}/contabilidad/documentos/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    })
    if (!res.ok) throw new Error("Error al subir documento")
    return mapFromApi(await res.json())
  }

  static async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API}/contabilidad/documentos/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!res.ok) throw new Error("Error al eliminar documento")
  }
}
