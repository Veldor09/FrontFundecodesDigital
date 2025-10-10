"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TransactionService } from "../services/transaction-service"
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

interface TransactionUI {
  id: string
  fecha: string
  tipo: "ingreso" | "egreso"
  categoria: string
  descripcion: string
  programa: string
  monto: number
  moneda: "CRC" | "USD" | "EUR"
  fechaCreacion: string
}

interface Filters {
  tipo: string
  categoria: string
  fechaDesde: string
  fechaHasta: string
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<TransactionUI[]>([])
  const [filters, setFilters] = useState<Filters>({ tipo: "all", categoria: "", fechaDesde: "", fechaHasta: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [newTransaction, setNewTransaction] = useState<Partial<TransactionUI>>({
    tipo: "ingreso",
    fecha: new Date().toISOString().split("T")[0],
    categoria: "",
    descripcion: "",
    monto: 0,
    programa: "",
    moneda: "CRC",
  })

  async function load() {
    const data = await TransactionService.getTransactions()
    setTransactions(
      data.map((t) => ({
        id: t.id,
        tipo: t.tipo,
        categoria: t.categoria,
        descripcion: t.descripcion,
        programa: t.programa ?? "",
        monto: t.monto,
        moneda: t.moneda || "CRC",
        fecha: new Date(t.fecha).toISOString().slice(0, 10),
        fechaCreacion: new Date(t.fechaCreacion).toISOString(),
      })),
    )
  }

  useEffect(() => { load() }, [])

  const programas = useMemo(() => Array.from(new Set(transactions.map(t => t.programa))).filter(Boolean), [transactions])
  const categorias = useMemo(() => Array.from(new Set(transactions.map(t => t.categoria))).filter(Boolean), [transactions])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTipo = filters.tipo === "all" || transaction.tipo === filters.tipo
    const matchesCategoria = !filters.categoria || transaction.categoria.toLowerCase().includes(filters.categoria.toLowerCase())
    const matchesFechaDesde = !filters.fechaDesde || transaction.fecha >= filters.fechaDesde
    const matchesFechaHasta = !filters.fechaHasta || transaction.fecha <= filters.fechaHasta
    return matchesTipo && matchesCategoria && matchesFechaDesde && matchesFechaHasta
  })

  const totals = filteredTransactions.reduce(
    (acc, t) => {
      const currency = t.moneda || "CRC"
      if (!acc[currency]) {
        acc[currency] = { ingresos: 0, egresos: 0, balance: 0 }
      }
      if (t.tipo === "ingreso") {
        acc[currency].ingresos += t.monto
      } else {
        acc[currency].egresos += t.monto
      }
      acc[currency].balance = acc[currency].ingresos - acc[currency].egresos
      return acc
    },
    {} as Record<string, { ingresos: number; egresos: number; balance: number }>,
  )

  const activeCurrencies = Object.keys(totals).filter(c => totals[c].ingresos > 0 || totals[c].egresos > 0)
  const allCurrencies = ["CRC", "USD", "EUR"]
  const displayCurrencies = activeCurrencies.length > 0 ? activeCurrencies : allCurrencies

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!newTransaction.categoria?.trim()) errors.categoria = "La categoría es requerida"
    if (!newTransaction.descripcion?.trim()) errors.descripcion = "La descripción es requerida"
    if (!newTransaction.programa?.trim()) errors.programa = "El programa es requerido"
    if (!newTransaction.monto || newTransaction.monto <= 0) errors.monto = "El monto debe ser mayor a 0"
    if (!newTransaction.fecha) errors.fecha = "La fecha es requerida"
    if (!newTransaction.moneda) errors.moneda = "La moneda es requerida"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (isEditing) {
      await TransactionService.updateTransaction(editingId!, {
        tipo: newTransaction.tipo!,
        categoria: newTransaction.categoria!,
        descripcion: newTransaction.descripcion!,
        monto: Number(newTransaction.monto!),
        fecha: newTransaction.fecha!,
        programa: newTransaction.programa!,
        moneda: newTransaction.moneda!,
      } as any)
    } else {
      await TransactionService.createTransaction({
        tipo: newTransaction.tipo as "ingreso" | "egreso",
        categoria: newTransaction.categoria!,
        descripcion: newTransaction.descripcion!,
        monto: Number(newTransaction.monto!),
        fecha: newTransaction.fecha!,
        programa: newTransaction.programa!,
        moneda: newTransaction.moneda!,
      } as any)
    }

    await load()
    setIsDialogOpen(false)
    setIsEditing(false)
    setEditingId(null)
    setFormErrors({})
    setNewTransaction({ tipo: "ingreso", fecha: new Date().toISOString().split("T")[0], categoria: "", descripcion: "", monto: 0, programa: "", moneda: "CRC" })
  }

  const handleEdit = (t: TransactionUI) => {
    setNewTransaction({ ...t })
    setIsEditing(true)
    setEditingId(t.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await TransactionService.deleteTransaction(id)
    await load()
  }

  const formatCurrency = (amount: number, currency: string = "CRC") => {
    const currencyConfig = {
      CRC: { locale: "es-CR", currency: "CRC" },
      USD: { locale: "en-US", currency: "USD" },
      EUR: { locale: "es-ES", currency: "EUR" }
    }
    const config = currencyConfig[currency as keyof typeof currencyConfig] || currencyConfig.CRC
    return new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency }).format(amount)
  }

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
                setNewTransaction({ tipo: "ingreso", fecha: new Date().toISOString().split("T")[0], categoria: "", descripcion: "", monto: 0, programa: "", moneda: "CRC" })
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
                  <Input type="date" value={newTransaction.fecha} onChange={(e) => setNewTransaction({ ...newTransaction, fecha: e.target.value })} className={formErrors.fecha ? "border-red-500" : ""} />
                  {formErrors.fecha && <p className="text-red-500 text-sm mt-1">{formErrors.fecha}</p>}
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <select className="w-full border rounded-md h-9 px-2 text-sm" value={newTransaction.tipo}
                          onChange={(e) => setNewTransaction({ ...newTransaction, tipo: e.target.value as "ingreso" | "egreso" })}>
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input value={newTransaction.categoria} onChange={(e) => setNewTransaction({ ...newTransaction, categoria: e.target.value })}
                         className={formErrors.categoria ? "border-red-500" : ""} placeholder="Ej: Gastos Operativos, Presupuesto Asignado" list="categorias-list" />
                  <datalist id="categorias-list">
                    {categorias.map((c) => <option key={c} value={c} />)}
                  </datalist>
                  {formErrors.categoria && <p className="text-red-500 text-sm mt-1">{formErrors.categoria}</p>}
                </div>

                <div>
                  <Label htmlFor="programa">Proyecto</Label>
                  <Input value={newTransaction.programa} onChange={(e) => setNewTransaction({ ...newTransaction, programa: e.target.value })}
                         className={formErrors.programa ? "border-red-500" : ""} placeholder="Escribe o selecciona un proyecto" list="programas-list" />
                  <datalist id="programas-list">
                    {programas.map((p) => <option key={p} value={p} />)}
                  </datalist>
                  {formErrors.programa && <p className="text-red-500 text-sm mt-1">{formErrors.programa}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="moneda">Moneda</Label>
                    <select 
                      className={`w-full border rounded-md h-9 px-2 text-sm ${formErrors.moneda ? "border-red-500" : ""}`}
                      value={newTransaction.moneda}
                      onChange={(e) => setNewTransaction({ ...newTransaction, moneda: e.target.value as "CRC" | "USD" | "EUR" })}
                    >
                      <option value="CRC">₡ Colones</option>
                      <option value="USD">$ Dólares</option>
                      <option value="EUR">€ Euros</option>
                    </select>
                    {formErrors.moneda && <p className="text-red-500 text-sm mt-1">{formErrors.moneda}</p>}
                  </div>

                  <div>
                    <Label htmlFor="monto">Monto</Label>
                    <Input type="number" min="0" step="0.01" value={newTransaction.monto}
                           onChange={(e) => setNewTransaction({ ...newTransaction, monto: Number(e.target.value) })}
                           className={formErrors.monto ? "border-red-500" : ""} placeholder="0.00" />
                    {formErrors.monto && <p className="text-red-500 text-sm mt-1">{formErrors.monto}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea value={newTransaction.descripcion} onChange={(e) => setNewTransaction({ ...newTransaction, descripcion: e.target.value })}
                            className={formErrors.descripcion ? "border-red-500" : ""} placeholder="Descripción detallada de la transacción" rows={3} />
                  {formErrors.descripcion && <p className="text-red-500 text-sm mt-1">{formErrors.descripcion}</p>}
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {isEditing ? "Actualizar Transacción" : "Crear Transacción"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Tipo</Label>
            <select className="w-full border rounded-md h-9 px-2 text-sm" value={filters.tipo}
                    onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
              <option value="all">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="egreso">Egresos</option>
            </select>
          </div>

          <div>
            <Label>Categoría</Label>
            <Input placeholder="Filtrar por categoría" value={filters.categoria}
                   onChange={(e) => setFilters({ ...filters, categoria: e.target.value })} list="categorias-list" />
          </div>

          <div>
            <Label>Fecha Desde</Label>
            <Input type="date" value={filters.fechaDesde} onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })} />
          </div>

          <div>
            <Label>Fecha Hasta</Label>
            <Input type="date" value={filters.fechaHasta} onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {displayCurrencies.map((currency) => {
            const data = totals[currency] || { ingresos: 0, egresos: 0, balance: 0 }
            
            return (
              <div key={currency}>
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  {currency === "CRC" ? "₡ Colones (CRC)" : currency === "USD" ? "$ Dólares (USD)" : "€ Euros (EUR)"}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-600 font-medium">Total Ingresos</div>
                    <div className="text-2xl font-bold text-green-700">{formatCurrency(data.ingresos, currency)}</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm text-red-600 font-medium">Total Egresos</div>
                    <div className="text-2xl font-bold text-red-700">{formatCurrency(data.egresos, currency)}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium">Balance Neto</div>
                    <div className={`text-2xl font-bold ${data.balance >= 0 ? "text-blue-700" : "text-red-700"}`}>
                      {formatCurrency(data.balance, currency)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-sm text-gray-600 mt-2">Mostrando {filteredTransactions.length} de {transactions.length} transacciones</div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Fecha</th>
                <th className="text-left p-3 font-medium">Tipo</th>
                <th className="text-left p-3 font-medium">Categoría</th>
                <th className="text-left p-3 font-medium">Programa</th>
                <th className="text-left p-3 font-medium">Descripción</th>
                <th className="text-left p-3 font-medium">Monto</th>
                <th className="text-left p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">No se encontraron transacciones con los filtros aplicados</td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{formatDate(t.fecha)}</td>
                    <td className="p-3">
                      <Badge 
                        variant={t.tipo === "ingreso" ? "default" : "destructive"} 
                        className={`capitalize ${t.tipo === "ingreso" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                      >
                        {t.tipo}
                      </Badge>
                    </td>
                    <td className="p-3">{t.categoria}</td>
                    <td className="p-3">{t.programa}</td>
                    <td className="p-3 max-w-xs truncate" title={t.descripcion}>{t.descripcion}</td>
                    <td className={`p-3 font-semibold ${t.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(t.monto, t.moneda)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(t)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 bg-transparent">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente la transacción:
                                <br />
                                <strong>{t.descripcion}</strong> por {formatCurrency(t.monto, t.moneda)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-red-600 hover:bg-red-700">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}