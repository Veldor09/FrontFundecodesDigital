"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileText } from "lucide-react"
import type { Document } from "../types"
import { DocumentService } from "../services/document-service"

export function DocumentsManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filters, setFilters] = useState({ programa: "todos", mes: "todos" })
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadData, setUploadData] = useState({
    programa: "Educación",
    mes: "Enero",
    año: new Date().getFullYear(),
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const docs = await DocumentService.getDocuments(filters)
      setDocuments(docs)
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]

    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 10MB.")
      return
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    if (!allowedTypes.includes(file.type)) {
      alert("Tipo de archivo no permitido. Solo PDF, JPG, PNG y Excel.")
      return
    }

    try {
      await DocumentService.uploadDocument(file, uploadData)
      setIsDialogOpen(false)
      fetchDocuments()
      alert("Documento subido correctamente")
    } catch (error) {
      alert("Error al subir el documento")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO").format(new Date(date))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Documentos</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <Label htmlFor="file">Archivo</Label>
                  <Input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx" required />
                  <p className="text-sm text-muted-foreground mt-1">
                    Formatos permitidos: PDF, JPG, PNG, Excel. Máximo 10MB.
                  </p>
                </div>
                <div>
                  <Label htmlFor="programa">Programa</Label>
                  <Select
                    value={uploadData.programa}
                    onValueChange={(value) => setUploadData({ ...uploadData, programa: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Infraestructura">Infraestructura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mes">Mes</Label>
                  <Select
                    value={uploadData.mes}
                    onValueChange={(value) => setUploadData({ ...uploadData, mes: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enero">Enero</SelectItem>
                      <SelectItem value="Febrero">Febrero</SelectItem>
                      <SelectItem value="Marzo">Marzo</SelectItem>
                      <SelectItem value="Abril">Abril</SelectItem>
                      <SelectItem value="Mayo">Mayo</SelectItem>
                      <SelectItem value="Junio">Junio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="año">Año</Label>
                  <Input
                    type="number"
                    value={uploadData.año}
                    onChange={(e) => setUploadData({ ...uploadData, año: Number(e.target.value) })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Subir Documento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Select value={filters.programa} onValueChange={(value) => setFilters({ ...filters, programa: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por programa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los programas</SelectItem>
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
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Enero">Enero</SelectItem>
              <SelectItem value="Febrero">Febrero</SelectItem>
              <SelectItem value="Marzo">Marzo</SelectItem>
              <SelectItem value="Abril">Abril</SelectItem>
              <SelectItem value="Mayo">Mayo</SelectItem>
              <SelectItem value="Junio">Junio</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchDocuments} variant="outline">
            Buscar
          </Button>
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
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {doc.nombre}
                  </TableCell>
                  <TableCell>{doc.programa}</TableCell>
                  <TableCell>{doc.mes}</TableCell>
                  <TableCell>{doc.año}</TableCell>
                  <TableCell>{doc.tipo}</TableCell>
                  <TableCell>{formatFileSize(doc.tamaño)}</TableCell>
                  <TableCell>{formatDate(doc.fechaSubida)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
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
