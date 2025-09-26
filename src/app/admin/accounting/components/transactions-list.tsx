"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit } from "lucide-react"

interface Transaction {
  id: string
  fecha: string
  tipo: "ingreso" | "egreso"
  categoria: string
  descripcion: string
  programa: string
  monto: number
  fechaCreacion: string
}

interface Filters {
  tipo: string
  categoria: string
  fechaDesde: string
  fechaHasta: string
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      fecha: "2024-01-15",
      tipo: "ingreso",
      categoria: "Presupuesto Asignado",
      descripcion: "Asignación presupuestal Programa A - Enero",
      programa: "Programa A",
      monto: 100000,
      fechaCreacion: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      fecha: "2024-01-20",
      tipo: "egreso",
      categoria: "Gastos Operativos",
      descripcion: "Compra de materiales para proyecto",
      programa: "Programa A",
      monto: 25000,
      fechaCreacion: "2024-01-20T14:30:00Z",
    },
    {
      id: "3",
      fecha: "2024-02-01",
      tipo: "ingreso",
      categoria: "Presupuesto Asignado",
      descripcion: "Asignación presupuestal Programa B - Febrero",
      programa: "Programa B",
      monto: 150000,
      fechaCreacion: "2024-02-01T09:00:00Z",
    },
    {
      id: "4",
      fecha: "2024-02-10",
      tipo: "egreso",
      categoria: "Servicios",
      descripcion: "Pago de consultoría externa",
      programa: "Programa B",
      monto: 45000,
      fechaCreacion: "2024-02-10T16:45:00Z",
    },
  ])

  // 🔹 Estados dinámicos
  const [programas, setProgramas] = useState<string[]>(["Programa A", "Programa B"])
  const [categorias, setCategorias] = useState<string[]>(["Presupuesto Asignado", "Gastos Operativos", "Servicios"])

  const [filters, setFilters] = useState<Filters>({
    tipo: "all",
    categoria: "",
    fechaDesde: "",
    fechaHasta: "",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    tipo: "ingreso",
    fecha: new Date().toISOString().split("T")[0],
    categoria: "",
    descripcion: "",
    monto: 0,
    programa: "",
  })

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTipo = filters.tipo === "all" || transaction.tipo === filters.tipo
    const matchesCategoria =
      !filters.categoria || transaction.categoria.toLowerCase().includes(filters.categoria.toLowerCase())
    const matchesFechaDesde = !filters.fechaDesde || transaction.fecha >= filters.fechaDesde
    const matchesFechaHasta = !filters.fechaHasta || transaction.fecha <= filters.fechaHasta

    return matchesTipo && matchesCategoria && matchesFechaDesde && matchesFechaHasta
  })

  const totals = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.tipo === "ingreso") {
        acc.ingresos += transaction.monto
      } else {
        acc.egresos += transaction.monto
      }
      acc.balance = acc.ingresos - acc.egresos
      return acc
    },
    { ingresos: 0, egresos: 0, balance: 0 },
  )

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!newTransaction.categoria?.trim()) {
      errors.categoria = "La categoría es requerida"
    }
    if (!newTransaction.descripcion?.trim()) {
      errors.descripcion = "La descripción es requerida"
    }
    if (!newTransaction.programa?.trim()) {
      errors.programa = "El programa es requerido"
    }
    if (!newTransaction.monto || newTransaction.monto <= 0) {
      errors.monto = "El monto debe ser mayor a 0"
    }
    if (!newTransaction.fecha) {
      errors.fecha = "La fecha es requerida"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const transactionData = {
      ...newTransaction,
      id: isEditing ? editingId! : Date.now().toString(),
      fechaCreacion: isEditing
        ? transactions.find((t) => t.id === editingId)?.fechaCreacion || new Date().toISOString()
        : new Date().toISOString(),
    } as Transaction

    if (isEditing) {
      setTransactions((prev) => prev.map((t) => (t.id === editingId ? transactionData : t)))
    } else {
      setTransactions((prev) => [...prev, transactionData])
    }

    // 🔹 Actualizar listas dinámicas
    if (newTransaction.programa && !programas.includes(newTransaction.programa)) {
      setProgramas((prev) => [...prev, newTransaction.programa!])
    }
    if (newTransaction.categoria && !categorias.includes(newTransaction.categoria)) {
      setCategorias((prev) => [...prev, newTransaction.categoria!])
    }

    // Reset form
    setIsDialogOpen(false)
    setIsEditing(false)
    setEditingId(null)
    setFormErrors({})
    setNewTransaction({
      tipo: "ingreso",
      fecha: new Date().toISOString().split("T")[0],
      categoria: "",
      descripcion: "",
      monto: 0,
      programa: "",
    })
  }

  const handleEdit = (transaction: Transaction) => {
    setNewTransaction({ ...transaction })
    setIsEditing(true)
    setEditingId(transaction.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)

  const formatDate = (dateString: string) => new Intl.DateTimeFormat("es-ES").format(new Date(dateString))

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Transacciones</CardTitle>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setIsEditing(false)
                setEditingId(null)
                setFormErrors({})
                setNewTransaction({
                  tipo: "ingreso",
                  fecha: new Date().toISOString().split("T")[0],
                  categoria: "",
                  descripcion: "",
                  monto: 0,
                  programa: "",
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Transacción" : "Agregar Nueva Transacción"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    type="date"
                    value={newTransaction.fecha}
                    onChange={(e) => setNewTransaction({ ...newTransaction, fecha: e.target.value })}
                    className={formErrors.fecha ? "border-red-500" : ""}
                  />
                  {formErrors.fecha && <p className="text-red-500 text-sm mt-1">{formErrors.fecha}</p>}
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    className="w-full border rounded-md h-9 px-2 text-sm"
                    value={newTransaction.tipo}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, tipo: e.target.value as "ingreso" | "egreso" })
                    }
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    value={newTransaction.categoria}
                    onChange={(e) => setNewTransaction({ ...newTransaction, categoria: e.target.value })}
                    className={formErrors.categoria ? "border-red-500" : ""}
                    placeholder="Ej: Gastos Operativos, Presupuesto Asignado"
                    list="categorias-list"
                  />
                  <datalist id="categorias-list">
                    {categorias.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  {formErrors.categoria && <p className="text-red-500 text-sm mt-1">{formErrors.categoria}</p>}
                </div>

                <div>
                  <Label htmlFor="programa">Proyecto</Label>
                  <Input
                    value={newTransaction.programa}
                    onChange={(e) => setNewTransaction({ ...newTransaction, programa: e.target.value })}
                    className={formErrors.programa ? "border-red-500" : ""}
                    placeholder="Escribe o selecciona un proyecto"
                    list="programas-list"
                  />
                  <datalist id="programas-list">
                    {programas.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                  {formErrors.programa && <p className="text-red-500 text-sm mt-1">{formErrors.programa}</p>}
                </div>

                <div>
                  <Label htmlFor="monto">Monto (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newTransaction.monto}
                    onChange={(e) => setNewTransaction({ ...newTransaction, monto: Number(e.target.value) })}
                    className={formErrors.monto ? "border-red-500" : ""}
                    placeholder="0.00"
                  />
                  {formErrors.monto && <p className="text-red-500 text-sm mt-1">{formErrors.monto}</p>}
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    value={newTransaction.descripcion}
                    onChange={(e) => setNewTransaction({ ...newTransaction, descripcion: e.target.value })}
                    className={formErrors.descripcion ? "border-red-500" : ""}
                    placeholder="Descripción detallada de la transacción"
                    rows={3}
                  />
                  {formErrors.descripcion && <p className="text-red-500 text-sm mt-1">{formErrors.descripcion}</p>}
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {isEditing ? "Actualizar Transacción" : "Crear Transacción"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Tipo</Label>
            <select
              className="w-full border rounded-md h-9 px-2 text-sm"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            >
              <option value="all">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="egreso">Egresos</option>
            </select>
          </div>

          <div>
            <Label>Categoría</Label>
            <Input
              placeholder="Filtrar por categoría"
              value={filters.categoria}
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
              list="categorias-list"
            />
          </div>

          <div>
            <Label>Fecha Desde</Label>
            <Input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
            />
          </div>

          <div>
            <Label>Fecha Hasta</Label>
            <Input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Total Ingresos</div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totals.ingresos)}</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-red-600 font-medium">Total Egresos</div>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totals.egresos)}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Balance Neto</div>
            <div className={`text-2xl font-bold ${totals.balance >= 0 ? "text-blue-700" : "text-red-700"}`}>
              {formatCurrency(totals.balance)}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-2">
          Mostrando {filteredTransactions.length} de {transactions.length} transacciones
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Programa</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No se encontraron transacciones con los filtros aplicados
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{formatDate(transaction.fecha)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.tipo === "ingreso" ? "default" : "destructive"} className="capitalize">
                      {transaction.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.categoria}</TableCell>
                  <TableCell>{transaction.programa}</TableCell>
                  <TableCell className="max-w-xs truncate" title={transaction.descripcion}>
                    {transaction.descripcion}
                  </TableCell>
                  <TableCell
                    className={`font-semibold ${transaction.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(transaction.monto)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(transaction)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente la transacción:
                              <br />
                              <strong>{transaction.descripcion}</strong> por {formatCurrency(transaction.monto)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
