"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { Transaction } from "../types"
import { useTransactions } from "../hooks/use-transactions"

export function TransactionsList() {
  const [filters, setFilters] = useState({ tipo: "all", categoria: "" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    tipo: "ingreso",
    fecha: new Date(),
    categoria: "",
    descripcion: "",
    monto: 0,
    programa: "",
  })

  const { transactions, loading, totals, createTransaction, deleteTransaction } = useTransactions(filters)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createTransaction(newTransaction as Omit<Transaction, "id" | "fechaCreacion">)
    if (result.success) {
      setIsDialogOpen(false)
      setNewTransaction({
        tipo: "ingreso",
        fecha: new Date(),
        categoria: "",
        descripcion: "",
        monto: 0,
        programa: "",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar esta transacción?")) {
      await deleteTransaction(id)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO").format(new Date(date))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Transacciones</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transacción
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Transacción</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={newTransaction.tipo}
                    onValueChange={(value: "ingreso" | "egreso") =>
                      setNewTransaction({ ...newTransaction, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="egreso">Egreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Input
                    value={newTransaction.categoria}
                    onChange={(e) => setNewTransaction({ ...newTransaction, categoria: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="monto">Monto</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newTransaction.monto}
                    onChange={(e) => setNewTransaction({ ...newTransaction, monto: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="programa">Programa</Label>
                  <Input
                    value={newTransaction.programa}
                    onChange={(e) => setNewTransaction({ ...newTransaction, programa: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    value={newTransaction.descripcion}
                    onChange={(e) => setNewTransaction({ ...newTransaction, descripcion: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Crear Transacción
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ingreso">Ingresos</SelectItem>
              <SelectItem value="egreso">Egresos</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filtrar por categoría"
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            className="w-48"
          />
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600">Ingresos</div>
            <div className="text-xl font-bold text-green-700">{formatCurrency(totals.ingresos)}</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-600">Egresos</div>
            <div className="text-xl font-bold text-red-700">{formatCurrency(totals.egresos)}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600">Balance</div>
            <div className={`text-xl font-bold ${totals.balance >= 0 ? "text-blue-700" : "text-red-700"}`}>
              {formatCurrency(totals.balance)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando transacciones...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.fecha)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.tipo === "ingreso" ? "default" : "destructive"}>
                      {transaction.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.categoria}</TableCell>
                  <TableCell className="max-w-xs truncate">{transaction.descripcion}</TableCell>
                  <TableCell>{transaction.programa}</TableCell>
                  <TableCell className={transaction.tipo === "ingreso" ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(transaction.monto)}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(transaction.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
