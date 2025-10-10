import type { Transaction } from "../types"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

async function findProjectIdByTitle(title: string): Promise<number> {
  const res = await fetch(`${API}/projects`, { credentials: "include" })
  if (!res.ok) throw new Error("No se pudieron obtener proyectos")
  const projects = await res.json() as Array<{ id: number; title: string }>
  const match = projects.find(p => (p.title ?? "").toLowerCase() === title.toLowerCase())
  if (!match) throw new Error("Proyecto no encontrado: " + title)
  return match.id
}

function mapFromApi(x: any): Transaction {
  return {
    id: x.id,
    fecha: new Date(x.fecha),
    tipo: x.tipo,
    categoria: x.categoria,
    descripcion: x.descripcion,
    monto: Number(x.monto),
    moneda: x.moneda || "CRC",
    programa: x.proyecto,
    fechaCreacion: x.createdAt ? new Date(x.createdAt) : new Date(),
  }
}

export class TransactionService {
  static async getTransactions(filters?: {
    tipo?: "ingreso" | "egreso"; categoria?: string; fechaInicio?: string; fechaFin?: string; programa?: string;
  }): Promise<Transaction[]> {
    const p = new URLSearchParams()
    if (filters?.tipo) p.set("tipo", filters.tipo)
    if (filters?.categoria) p.set("categoria", filters.categoria)
    if (filters?.fechaInicio) p.set("fechaInicio", filters.fechaInicio)
    if (filters?.fechaFin) p.set("fechaFin", filters.fechaFin)
    if (filters?.programa) {
      try {
        const pid = await findProjectIdByTitle(filters.programa)
        p.set("projectId", String(pid))
      } catch {/* ignora si no existe */}
    }

    const res = await fetch(`${API}/contabilidad/transacciones?${p.toString()}`, { credentials: "include" })
    if (!res.ok) throw new Error("Error al obtener transacciones")
    const data = await res.json()
    return (data as any[]).map(mapFromApi)
  }

  static async createTransaction(
    t: Omit<Transaction, "id" | "fechaCreacion">,
  ): Promise<Transaction> {
    const projectId = await findProjectIdByTitle(t.programa ?? "")
    const body = {
      tipo: t.tipo,
      categoria: t.categoria,
      descripcion: t.descripcion,
      monto: t.monto,
      moneda: t.moneda || "CRC",
      fecha: (t.fecha instanceof Date ? t.fecha : new Date(t.fecha as any)).toISOString().slice(0, 10),
      projectId,
      proyecto: t.programa,
    }
    const res = await fetch(`${API}/contabilidad/transacciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Error al crear transacción")
    return mapFromApi(await res.json())
  }

  static async updateTransaction(
    id: string,
    t: Partial<Transaction>,
  ): Promise<Transaction> {
    const body: any = {}
    if (t.tipo) body.tipo = t.tipo
    if (t.categoria) body.categoria = t.categoria
    if (t.descripcion) body.descripcion = t.descripcion
    if (t.monto != null) body.monto = t.monto
    if (t.moneda) body.moneda = t.moneda
    if (t.fecha) body.fecha = (t.fecha instanceof Date ? t.fecha : new Date(t.fecha as any)).toISOString().slice(0, 10)
    if (t.programa) body.proyecto = t.programa

    const res = await fetch(`${API}/contabilidad/transacciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error("Error al actualizar transacción")
    return mapFromApi(await res.json())
  }

  static async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${API}/contabilidad/transacciones/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!res.ok) throw new Error("Error al eliminar transacción")
  }
}