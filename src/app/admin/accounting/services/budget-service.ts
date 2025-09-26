import type { BudgetItem } from "../types"

// Mock data for budget items
const mockBudgetData: BudgetItem[] = [
  {
    id: "1",
    programa: "Educación",
    mes: "Enero",
    año: 2024,
    montoAsignado: 50000,
    montoEjecutado: 35000,
    fechaCreacion: new Date("2024-01-01"),
    fechaActualizacion: new Date("2024-01-15"),
  },
  {
    id: "2",
    programa: "Salud",
    mes: "Enero",
    año: 2024,
    montoAsignado: 75000,
    montoEjecutado: 60000,
    fechaCreacion: new Date("2024-01-01"),
    fechaActualizacion: new Date("2024-01-20"),
  },
]

export class BudgetService {
  static async getBudgetItems(filters?: Partial<BudgetItem>): Promise<BudgetItem[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredData = [...mockBudgetData]

    if (filters?.programa) {
      filteredData = filteredData.filter((item) =>
        item.programa.toLowerCase().includes(filters.programa!.toLowerCase()),
      )
    }

    if (filters?.mes) {
      filteredData = filteredData.filter((item) => item.mes === filters.mes)
    }

    if (filters?.año) {
      filteredData = filteredData.filter((item) => item.año === filters.año)
    }

    return filteredData
  }

  static async updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockBudgetData.findIndex((item) => item.id === id)
    if (index !== -1) {
      mockBudgetData[index] = {
        ...mockBudgetData[index],
        ...updates,
        fechaActualizacion: new Date(),
      }
      return mockBudgetData[index]
    }

    throw new Error("Budget item not found")
  }

  static async createBudgetItem(
    item: Omit<BudgetItem, "id" | "fechaCreacion" | "fechaActualizacion">,
  ): Promise<BudgetItem> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newItem: BudgetItem = {
      ...item,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }

    mockBudgetData.push(newItem)
    return newItem
  }
}
