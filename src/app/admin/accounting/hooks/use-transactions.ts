"use client"

import { useState, useEffect } from "react"
import type { Transaction } from "../types"
import { TransactionService } from "../services/transaction-service"

export function useTransactions(filters?: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const items = await TransactionService.getTransactions(filters)
      setTransactions(items)
    } catch (err) {
      setError("Error al cargar las transacciones")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transaction: Omit<Transaction, "id" | "fechaCreacion">) => {
    try {
      await TransactionService.createTransaction(transaction)
      await fetchTransactions() // Refresh data
      return { success: true, message: "Transacción creada correctamente" }
    } catch (err) {
      return { success: false, message: "Error al crear la transacción" }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await TransactionService.deleteTransaction(id)
      await fetchTransactions() // Refresh data
      return { success: true, message: "Transacción eliminada correctamente" }
    } catch (err) {
      return { success: false, message: "Error al eliminar la transacción" }
    }
  }

  // Calculate totals based on current transactions
  const totals = {
    ingresos: transactions.filter((t) => t.tipo === "ingreso").reduce((sum, t) => sum + t.monto, 0),
    egresos: transactions.filter((t) => t.tipo === "egreso").reduce((sum, t) => sum + t.monto, 0),
    balance: 0,
  }
  totals.balance = totals.ingresos - totals.egresos

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  return {
    transactions,
    loading,
    error,
    totals,
    createTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  }
}
