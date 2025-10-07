import type { BudgetItem } from "../types"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const monthNameToNumber = (name: string) => MONTHS.indexOf(name) + 1
const numberToMonth = (n: number) => MONTHS[n - 1] ?? ""

/** Busca el id del proyecto por su título (UI usa `programa` = nombre del proyecto) */
async function findProjectIdByTitle(title: string): Promise<number> {
  const res = await fetch(`${API}/projects`, { credentials: "include" })
  if (!res.ok) throw new Error("No se pudieron obtener proyectos")
  const projects = await res.json() as Array<{ id: number; title: string }>
  const match = projects.find(p => (p.title ?? "").toLowerCase() === title.toLowerCase())
  if (!match) throw new Error("Proyecto no encontrado: " + title)
  return match.id
}

function mapFromApi(x: any): BudgetItem {
  return {
    id: x.id,
    programa: x.proyecto, // UI sigue llamándolo "programa"
    mes: numberToMonth(Number(x.mes)),
    año: Number(x.anio),
    montoAsignado: Number(x.montoAsignado),
    montoEjecutado: Number(x.montoEjecutado),
    fechaCreacion: x.createdAt ? new Date(x.createdAt) : new Date(),
    fechaActualizacion: x.updatedAt ? new Date(x.updatedAt) : new Date(),
  }
}

export class BudgetService {
  static async getBudgetItems(filters?: Partial<BudgetItem>): Promise<BudgetItem[]> {
    const params = new URLSearchParams()
    if (filters?.programa) {
      try {
        const pid = await findProjectIdByTitle(filters.programa)
        params.set("projectId", String(pid))
      } catch {/* si no existe, traemos todo y filtra el front */}
    }
    if (filters?.mes) params.set("mes", String(monthNameToNumber(filters.mes)))
    if (filters?.año) params.set("anio", String(filters.año))

    const res = await fetch(`${API}/contabilidad/presupuestos?${params.toString()}`, { credentials: "include" })
    if (!res.ok) throw new Error("Error al obtener presupuestos")
    const data = await res.json()
    return (data as any[]).map(mapFromApi)
  }

  static async createBudgetItem(
    item: Omit<BudgetItem, "id" | "fechaCreacion" | "fechaActualizacion">,
  ): Promise<BudgetItem> {
    const projectId = await findProjectIdByTitle(item.programa)
    const body = {
      projectId,
      proyecto: item.programa,
      mes: monthNameToNumber(item.mes),
      anio: item.año,
      montoAsignado: item.montoAsignado,
      montoEjecutado: item.montoEjecutado,
    }
    const res = await fetch(`${API}/contabilidad/presupuestos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Error al crear presupuesto")
    return mapFromApi(await res.json())
  }

  static async updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem> {
    const body: any = {}
    if (updates.programa) body.proyecto = updates.programa
    if (updates.mes) body.mes = monthNameToNumber(updates.mes)
    if (updates.año != null) body.anio = updates.año
    if (updates.montoAsignado != null) body.montoAsignado = updates.montoAsignado
    if (updates.montoEjecutado != null) body.montoEjecutado = updates.montoEjecutado

    const res = await fetch(`${API}/contabilidad/presupuestos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Error al actualizar presupuesto")
    return mapFromApi(await res.json())
  }

  static async deleteBudgetItem(id: string): Promise<void> {
    const res = await fetch(`${API}/contabilidad/presupuestos/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!res.ok) throw new Error("Error al eliminar presupuesto")
  }
}
