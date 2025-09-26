"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit2, Save, X } from "lucide-react"
import type { BudgetItem } from "../types"
import { useBudget } from "../hooks/use-budget"

export function BudgetTable() {
  const [filters, setFilters] = useState({ programa: "Todos los programas", mes: "Todos", año: "Todos" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<BudgetItem>>({})

  const { budgetItems, loading, updateBudgetItem } = useBudget(filters)

  const handleEdit = (item: BudgetItem) => {
    setEditingId(item.id)
    setEditValues({
      montoAsignado: item.montoAsignado,
      montoEjecutado: item.montoEjecutado,
    })
  }

  const handleSave = async (id: string) => {
    const result = await updateBudgetItem(id, editValues)
    if (result.success) {
      setEditingId(null)
      setEditValues({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  const getExecutionPercentage = (assigned: number, executed: number) => {
    return assigned > 0 ? Math.round((executed / assigned) * 100) : 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Presupuesto</CardTitle>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Select value={filters.programa} onValueChange={(value) => setFilters({ ...filters, programa: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por programa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos los programas">Todos los programas</SelectItem>
              <SelectItem value="Educación">Educación</SelectItem>
              <SelectItem value="Salud">Salud</SelectItem>
              <SelectItem value="Infraestructura">Infraestructura</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.mes} onValueChange={(value) => setFilters({ ...filters, mes: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Enero">Enero</SelectItem>
              <SelectItem value="Febrero">Febrero</SelectItem>
              <SelectItem value="Marzo">Marzo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.año} onValueChange={(value) => setFilters({ ...filters, año: value })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando datos...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programa</TableHead>
                <TableHead>Mes</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Monto Asignado</TableHead>
                <TableHead>Monto Ejecutado</TableHead>
                <TableHead>% Ejecución</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.programa}</TableCell>
                  <TableCell>{item.mes}</TableCell>
                  <TableCell>{item.año}</TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        value={editValues.montoAsignado || ""}
                        onChange={(e) => setEditValues({ ...editValues, montoAsignado: Number(e.target.value) })}
                        className="w-32"
                      />
                    ) : (
                      formatCurrency(item.montoAsignado)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        value={editValues.montoEjecutado || ""}
                        onChange={(e) => setEditValues({ ...editValues, montoEjecutado: Number(e.target.value) })}
                        className="w-32"
                      />
                    ) : (
                      formatCurrency(item.montoEjecutado)
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getExecutionPercentage(item.montoAsignado, item.montoEjecutado) > 80 ? "default" : "secondary"
                      }
                    >
                      {getExecutionPercentage(item.montoAsignado, item.montoEjecutado)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSave(item.id)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
