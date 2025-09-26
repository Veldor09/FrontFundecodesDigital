"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, CheckCircle, XCircle } from "lucide-react"
import type { Document } from "../types"

export function DocumentsManager() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      nombre: "Presupuesto_Educacion_Enero_2024.pdf",
      programa: "Educación",
      mes: "Enero",
      año: 2024,
      tipo: "PDF",
      tamaño: 2048576,
      fechaSubida: new Date("2024-01-15"),
      url: "/documents/presupuesto_educacion_enero.pdf",
    },
    {
      id: "2",
      nombre: "Informe_Salud_Febrero_2024.xlsx",
      programa: "Salud",
      mes: "Febrero",
      año: 2024,
      tipo: "Excel",
      tamaño: 1536000,
      fechaSubida: new Date("2024-02-10"),
      url: "/documents/informe_salud_febrero.xlsx",
    },
    {
      id: "3",
      nombre: "Comprobantes_Infraestructura_Marzo.pdf",
      programa: "Infraestructura",
      mes: "Marzo",
      año: 2024,
      tipo: "PDF",
      tamaño: 3145728,
      fechaSubida: new Date("2024-03-05"),
      url: "/documents/comprobantes_infraestructura.pdf",
    },
  ])

  // 🔹 Lista dinámica de programas
  const [programas, setProgramas] = useState<string[]>([
    "Educación",
    "Salud",
    "Infraestructura",
  ])

  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents)
  const [filters, setFilters] = useState({ programa: "todos", mes: "todos" })
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadData, setUploadData] = useState({
    programa: "",
    mes: "",
    año: new Date().getFullYear(),
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let filtered = documents
    if (filters.programa !== "todos") {
      filtered = filtered.filter((doc) => doc.programa === filters.programa)
    }
    if (filters.mes !== "todos") {
      filtered = filtered.filter((doc) => doc.mes === filters.mes)
    }
    setFilteredDocuments(filtered)
  }, [filters, documents])

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]

    if (!file) {
      setMessage({ type: "error", text: "Por favor selecciona un archivo" })
      return
    }

    if (!uploadData.programa) {
      setMessage({ type: "error", text: "Por favor escribe un programa" })
      return
    }

    if (!uploadData.mes) {
      setMessage({ type: "error", text: "Por favor selecciona un mes" })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "El archivo es demasiado grande. Máximo 10MB permitido." })
      return
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Tipo de archivo no permitido. Solo se permiten PDF, JPG, PNG y Excel." })
      return
    }

    try {
      setLoading(true)

      const newDocument: Document = {
        id: Date.now().toString(),
        nombre: file.name,
        programa: uploadData.programa,
        mes: uploadData.mes,
        año: uploadData.año,
        tipo: file.type.includes("pdf") ? "PDF" : file.type.includes("sheet") ? "Excel" : "Imagen",
        tamaño: file.size,
        fechaSubida: new Date(),
        url: URL.createObjectURL(file),
      }

      setDocuments((prev) => [...prev, newDocument])

      // 🔹 Agregar programa si no existe en la lista
      if (!programas.includes(newDocument.programa)) {
        setProgramas((prev) => [...prev, newDocument.programa])
      }

      setIsDialogOpen(false)
      setMessage({ type: "success", text: "Documento subido correctamente" })

      if (fileInputRef.current) fileInputRef.current.value = ""
      setUploadData({ programa: "", mes: "", año: new Date().getFullYear() })
    } catch {
      setMessage({ type: "error", text: "Error al subir el documento. Inténtalo nuevamente." })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (doc: Document) => {
    try {
      const link = document.createElement("a")
      link.href = doc.url
      link.download = doc.nombre
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setMessage({ type: "success", text: `Descargando ${doc.nombre}...` })
    } catch {
      setMessage({ type: "error", text: "Error al descargar el documento" })
    }
  }

  const resetForm = () => {
    setUploadData({ programa: "", mes: "", año: new Date().getFullYear() })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: Date) => new Intl.DateTimeFormat("es-CO").format(new Date(date))

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Documentos</CardTitle>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                resetForm()
                setMessage(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Nuevo Documento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="file">Archivo *</Label>
                  <Input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx" required />
                  <p className="text-sm text-muted-foreground mt-1">
                    Formatos permitidos: PDF, JPG, PNG, Excel. Máximo 10MB.
                  </p>
                </div>

                <div>
                  <Label htmlFor="proyecto">Proyecto *</Label>
                  <Input
                    type="text"
                    placeholder="Escribe el nombre del proyecto"
                    value={uploadData.programa}
                    onChange={(e) => setUploadData({ ...uploadData, programa: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mes">Mes *</Label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={uploadData.mes}
                    onChange={(e) => setUploadData({ ...uploadData, mes: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar mes</option>
                    <option value="Enero">Enero</option>
                    <option value="Febrero">Febrero</option>
                    <option value="Marzo">Marzo</option>
                    <option value="Abril">Abril</option>
                    <option value="Mayo">Mayo</option>
                    <option value="Junio">Junio</option>
                    <option value="Julio">Julio</option>
                    <option value="Agosto">Agosto</option>
                    <option value="Septiembre">Septiembre</option>
                    <option value="Octubre">Octubre</option>
                    <option value="Noviembre">Noviembre</option>
                    <option value="Diciembre">Diciembre</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="año">Año</Label>
                  <Input
                    type="number"
                    value={uploadData.año}
                    onChange={(e) => setUploadData({ ...uploadData, año: Number(e.target.value) })}
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Subiendo..." : "Subir Documento"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="flex gap-6 flex-wrap items-end">
          <div className="min-w-[200px]">
            <Label className="text-sm font-medium mb-2 block">Programa</Label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.programa}
              onChange={(e) => setFilters({ ...filters, programa: e.target.value })}
            >
              <option value="todos">Todos los programas</option>
              {programas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px]">
            <Label className="text-sm font-medium mb-2 block">Mes</Label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.mes}
              onChange={(e) => setFilters({ ...filters, mes: e.target.value })}
            >
              <option value="todos">Todos los meses</option>
              <option value="Enero">Enero</option>
              <option value="Febrero">Febrero</option>
              <option value="Marzo">Marzo</option>
              <option value="Abril">Abril</option>
              <option value="Mayo">Mayo</option>
              <option value="Junio">Junio</option>
              <option value="Julio">Julio</option>
              <option value="Agosto">Agosto</option>
              <option value="Septiembre">Septiembre</option>
              <option value="Octubre">Octubre</option>
              <option value="Noviembre">Noviembre</option>
              <option value="Diciembre">Diciembre</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando {filteredDocuments.length} de {documents.length} documentos
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando documentos...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Mes</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Fecha Subida</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {documents.length === 0
                      ? "No hay documentos registrados"
                      : "No se encontraron documentos con los filtros seleccionados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {doc.nombre}
                    </TableCell>
                    <TableCell>{doc.programa}</TableCell>
                    <TableCell>{doc.mes}</TableCell>
                    <TableCell>{doc.año}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.tipo}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.tamaño)}</TableCell>
                    <TableCell>{formatDate(doc.fechaSubida)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(doc)}
                        title={`Descargar ${doc.nombre}`}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
