"use client"

import { useState, useEffect } from "react"
import type { BudgetItem } from "../types"
import { BudgetService } from "../services/budget-service"

export function useBudget(filters?: Partial<BudgetItem>) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgetItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const items = await BudgetService.getBudgetItems(filters)
      setBudgetItems(items)
    } catch (err) {
      setError("Error al cargar los datos del presupuesto")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      await BudgetService.updateBudgetItem(id, updates)
      await fetchBudgetItems() // Refresh data
      return { success: true, message: "Presupuesto actualizado correctamente" }
    } catch (err) {
      return { success: false, message: "Error al actualizar el presupuesto" }
    }
  }

  const createBudgetItem = async (item: Omit<BudgetItem, "id" | "fechaCreacion" | "fechaActualizacion">) => {
    try {
      await BudgetService.createBudgetItem(item)
      await fetchBudgetItems() // Refresh data
      return { success: true, message: "Presupuesto creado correctamente" }
    } catch (err) {
      return { success: false, message: "Error al crear el presupuesto" }
    }
  }

  useEffect(() => {
    fetchBudgetItems()
  }, [filters])

  return {
    budgetItems,
    loading,
    error,
    updateBudgetItem,
    createBudgetItem,
    refetch: fetchBudgetItems,
  }
}
