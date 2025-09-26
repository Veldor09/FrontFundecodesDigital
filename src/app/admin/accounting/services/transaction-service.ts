import type { Transaction } from "../types"

// Mock data for transactions
const mockTransactionData: Transaction[] = [
  {
    id: "1",
    fecha: new Date("2024-01-15"),
    tipo: "ingreso",
    categoria: "Donaciones",
    descripcion: "Donación mensual empresa ABC",
    monto: 25000,
    programa: "Educación",
    fechaCreacion: new Date("2024-01-15"),
  },
  {
    id: "2",
    fecha: new Date("2024-01-20"),
    tipo: "egreso",
    categoria: "Materiales",
    descripcion: "Compra de libros escolares",
    monto: 15000,
    programa: "Educación",
    fechaCreacion: new Date("2024-01-20"),
  },
]

export class TransactionService {
  static async getTransactions(filters?: any): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredData = [...mockTransactionData]

    if (filters?.tipo) {
      filteredData = filteredData.filter((item) => item.tipo === filters.tipo)
    }

    if (filters?.categoria) {
      filteredData = filteredData.filter((item) =>
        item.categoria.toLowerCase().includes(filters.categoria.toLowerCase()),
      )
    }

    return filteredData
  }

  static async createTransaction(transaction: Omit<Transaction, "id" | "fechaCreacion">): Promise<Transaction> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
    }

    mockTransactionData.push(newTransaction)
    return newTransaction
  }

  static async deleteTransaction(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockTransactionData.findIndex((item) => item.id === id)
    if (index !== -1) {
      mockTransactionData.splice(index, 1)
    }
  }
}
