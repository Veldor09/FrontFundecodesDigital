"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit2, Plus, Trash2 } from "lucide-react"

export function BudgetTable() {
  const [filters, setFilters] = useState({
    proyecto: "Todos los proyectos",
    mes: "Todos los meses",
    año: "Todos los años",
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    proyecto: "",
    mes: "",
    año: "",
    montoAsignado: "",
    montoEjecutado: "",
  })

  const [newBudgetForm, setNewBudgetForm] = useState({
    proyecto: "",
    mes: "",
    año: "",
    montoAsignado: "",
    montoEjecutado: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [budgetData, setBudgetData] = useState([
    {
      id: "1",
      proyecto: "Sistema de Gestión Educativa",
      mes: "Enero",
      año: "2024",
      montoAsignado: 100000,
      montoEjecutado: 75000,
    },
    {
      id: "2",
      proyecto: "Plataforma de Telemedicina",
      mes: "Enero",
      año: "2024",
      montoAsignado: 150000,
      montoEjecutado: 120000,
    },
    {
      id: "3",
      proyecto: "Infraestructura Digital",
      mes: "Febrero",
      año: "2024",
      montoAsignado: 110000,
      montoEjecutado: 95000,
    },
    {
      id: "4",
      proyecto: "Capacitación Docente Online",
      mes: "Marzo",
      año: "2024",
      montoAsignado: 80000,
      montoEjecutado: 65000,
    },
  ])

  // Función para filtrar los datos locales
  const filteredBudgetData = budgetData.filter((item) => {
    const proyectoMatch = filters.proyecto === "Todos los proyectos" || item.proyecto === filters.proyecto
    const mesMatch = filters.mes === "Todos los meses" || item.mes === filters.mes
    const añoMatch = filters.año === "Todos los años" || item.año === filters.año
    
    return proyectoMatch && mesMatch && añoMatch
  })

  // Obtener valores únicos para los filtros - solo proyectos que existen en los datos
  const uniqueProyectos = [...new Set(budgetData.map(item => item.proyecto))]
  
  // Lista completa de meses
  const todosMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  // Generar rango de años dinámicamente
  const currentYear = new Date().getFullYear()
  const startYear = 2020
  const endYear = currentYear + 3
  const todosAños = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => String(startYear + i)
  )

  const handleEditClick = (item: any) => {
    setEditingItem(item)
    setEditForm({
      proyecto: item.proyecto,
      mes: item.mes,
      año: item.año,
      montoAsignado: item.montoAsignado.toString(),
      montoEjecutado: item.montoEjecutado.toString(),
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setBudgetData(budgetData.filter((item) => item.id !== id))
    console.log("Registro eliminado:", id)
  }

  const validateEditForm = () => {
    const errors: Record<string, string> = {}

    if (!editForm.proyecto.trim()) errors.proyecto = "El proyecto es requerido"
    if (!editForm.mes) errors.mes = "El mes es requerido"
    if (!editForm.año) errors.año = "El año es requerido"
    if (!editForm.montoAsignado || Number(editForm.montoAsignado) < 0) {
      errors.montoAsignado = "El monto asignado debe ser mayor o igual a 0"
    }
    if (!editForm.montoEjecutado || Number(editForm.montoEjecutado) < 0) {
      errors.montoEjecutado = "El monto ejecutado debe ser mayor o igual a 0"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitEdit = () => {
    if (!validateEditForm()) return

    setBudgetData(
      budgetData.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              proyecto: editForm.proyecto.trim(),
              mes: editForm.mes,
              año: editForm.año,
              montoAsignado: Number(editForm.montoAsignado),
              montoEjecutado: Number(editForm.montoEjecutado),
            }
          : item,
      ),
    )

    setIsEditModalOpen(false)
    setEditingItem(null)
    setFormErrors({})
    console.log("Registro editado:", editForm)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!newBudgetForm.proyecto.trim()) errors.proyecto = "El proyecto es requerido"
    if (!newBudgetForm.mes) errors.mes = "El mes es requerido"
    if (!newBudgetForm.año) errors.año = "El año es requerido"
    if (!newBudgetForm.montoAsignado || Number(newBudgetForm.montoAsignado) < 0) {
      errors.montoAsignado = "El monto asignado debe ser mayor o igual a 0"
    }
    if (!newBudgetForm.montoEjecutado || Number(newBudgetForm.montoEjecutado) < 0) {
      errors.montoEjecutado = "El monto ejecutado debe ser mayor o igual a 0"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitNewBudget = async () => {
    if (!validateForm()) return

    const newId = (budgetData.length + 1).toString()
    const newBudget = {
      id: newId,
      proyecto: newBudgetForm.proyecto.trim(),
      mes: newBudgetForm.mes,
      año: newBudgetForm.año,
      montoAsignado: Number(newBudgetForm.montoAsignado),
      montoEjecutado: Number(newBudgetForm.montoEjecutado),
    }

    setBudgetData([...budgetData, newBudget])
    console.log("Nuevo presupuesto:", newBudgetForm)

    // Resetear formulario y cerrar modal
    setNewBudgetForm({
      proyecto: "",
      mes: "",
      año: "",
      montoAsignado: "",
      montoEjecutado: "",
    })
    setFormErrors({})
    setIsModalOpen(false)
  }

  const handleCloseModal = () => {
    setNewBudgetForm({
      proyecto: "",
      mes: "",
      año: "",
      montoAsignado: "",
      montoEjecutado: "",
    })
    setFormErrors({})
    setIsModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditForm({
      proyecto: "",
      mes: "",
      año: "",
      montoAsignado: "",
      montoEjecutado: "",
    })
    setFormErrors({})
    setIsEditModalOpen(false)
    setEditingItem(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const getExecutionPercentage = (assigned: number, executed: number) => {
    return assigned > 0 ? Math.round((executed / assigned) * 100) : 0
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">Gestión de Presupuesto por Proyectos</CardTitle>

        <div className="flex items-center justify-between gap-4 pt-4">
          <div className="flex gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Proyecto</label>
              <select
                className="w-56 border border-gray-300 rounded-md h-9 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.proyecto}
                onChange={(e) => {
                  console.log("Proyecto seleccionado:", e.target.value)
                  setFilters({ ...filters, proyecto: e.target.value })
                }}
              >
                <option value="Todos los proyectos">Todos los proyectos</option>
                {uniqueProyectos.map(proyecto => (
                  <option key={proyecto} value={proyecto}>{proyecto}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mes</label>
              <select
                className="w-40 border border-gray-300 rounded-md h-9 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.mes}
                onChange={(e) => {
                  console.log("Mes seleccionado:", e.target.value)
                  setFilters({ ...filters, mes: e.target.value })
                }}
              >
                <option value="Todos los meses">Todos los meses</option>
                {todosMeses.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Año</label>
              <select
                className="w-32 border border-gray-300 rounded-md h-9 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.año}
                onChange={(e) => {
                  console.log("Año seleccionado:", e.target.value)
                  setFilters({ ...filters, año: e.target.value })
                }}
              >
                <option value="Todos los años">Todos los años</option>
                {todosAños.map(año => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
            </div>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Presupuesto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proyecto *</label>
                  <Input
                    type="text"
                    placeholder="Escribir nombre del proyecto"
                    value={newBudgetForm.proyecto}
                    onChange={(e) => {
                      console.log("Nuevo proyecto:", e.target.value)
                      setNewBudgetForm({ ...newBudgetForm, proyecto: e.target.value })
                    }}
                    className="w-full"
                  />
                  {formErrors.proyecto && <p className="text-sm text-red-600">{formErrors.proyecto}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mes *</label>
                  <select
                    className="w-full border border-gray-300 rounded-md h-9 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newBudgetForm.mes}
                    onChange={(e) => {
                      console.log("Nuevo mes seleccionado:", e.target.value)
                      setNewBudgetForm({ ...newBudgetForm, mes: e.target.value })
                    }}
                  >
                    <option value="">Seleccionar mes</option>
                    {todosMeses.map(mes => (
                      <option key={mes} value={mes}>{mes}</option>
                    ))}
                  </select>
                  {formErrors.mes && <p className="text-sm text-red-600">{formErrors.mes}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Año *</label>
                  <select
                    className="w-full border border-gray-300 rounded-md h-9 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newBudgetForm.año}
                    onChange={(e) => {
                      console.log("Nuevo año seleccionado:", e.target.value)
                      setNewBudgetForm({ ...newBudgetForm, año: e.target.value })
                    }}
                  >
                    <option value="">Seleccionar año</option>
                    {todosAños.map(año => (
                      <option key={año} value={año}>{año}</option>
                    ))}
                  </select>
                  {formErrors.año && <p className="text-sm text-red-600">{formErrors.año}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Asignado (€) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newBudgetForm.montoAsignado}
                    onChange={(e) => setNewBudgetForm({ ...newBudgetForm, montoAsignado: e.target.value })}
                  />
                  {formErrors.montoAsignado && <p className="text-sm text-red-600">{formErrors.montoAsignado}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Ejecutado (€) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newBudgetForm.montoEjecutado}
                    onChange={(e) => setNewBudgetForm({ ...newBudgetForm, montoEjecutado: e.target.value })}
                  />
                  {formErrors.montoEjecutado && <p className="text-sm text-red-600">{formErrors.montoEjecutado}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmitNewBudget} className="bg-blue-600 hover:bg-blue-700">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando {filteredBudgetData.length} de {budgetData.length} registros
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {filteredBudgetData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron registros con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Proyecto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Mes</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Año</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Monto Asignado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Monto Ejecutado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">% Ejecución</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgetData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{item.proyecto}</td>
                    <td className="py-3 px-4">{item.mes}</td>
                    <td className="py-3 px-4">{item.año}</td>
                    <td className="py-3 px-4">{formatCurrency(item.montoAsignado)}</td>
                    <td className="py-3 px-4">{formatCurrency(item.montoEjecutado)}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                        {getExecutionPercentage(item.montoAsignado, item.montoEjecutado)}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el registro del
                                presupuesto para el proyecto "{item.proyecto}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Presupuesto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Proyecto *</label>
              <Input
                type="text"
                placeholder="Escribir nombre del proyecto"
                value={editForm.proyecto}
                onChange={(e) => {
                  console.log("Proyecto editado:", e.target.value)
                  setEditForm({ ...editForm, proyecto: e.target.value })
                }}
                className="w-full"
              />
              {formErrors.proyecto && <p className="text-sm text-red-600">{formErrors.proyecto}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mes *</label>
              <select
                className="w-full border border-gray-300 rounded-md h-9 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.mes}
                onChange={(e) => {
                  console.log("Mes editado seleccionado:", e.target.value)
                  setEditForm({ ...editForm, mes: e.target.value })
                }}
              >
                <option value="">Seleccionar mes</option>
                {todosMeses.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
              {formErrors.mes && <p className="text-sm text-red-600">{formErrors.mes}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Año *</label>
              <select
                className="w-full border border-gray-300 rounded-md h-9 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.año}
                onChange={(e) => {
                  console.log("Año editado seleccionado:", e.target.value)
                  setEditForm({ ...editForm, año: e.target.value })
                }}
              >
                <option value="">Seleccionar año</option>
                {todosAños.map(año => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
              {formErrors.año && <p className="text-sm text-red-600">{formErrors.año}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Monto Asignado (€) *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editForm.montoAsignado}
                onChange={(e) => setEditForm({ ...editForm, montoAsignado: e.target.value })}
              />
              {formErrors.montoAsignado && <p className="text-sm text-red-600">{formErrors.montoAsignado}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Monto Ejecutado (€) *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editForm.montoEjecutado}
                onChange={(e) => setEditForm({ ...editForm, montoEjecutado: e.target.value })}
              />
              {formErrors.montoEjecutado && <p className="text-sm text-red-600">{formErrors.montoEjecutado}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitEdit} className="bg-blue-600 hover:bg-blue-700">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}