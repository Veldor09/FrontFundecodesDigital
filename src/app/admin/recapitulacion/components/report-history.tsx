"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, Download, Calendar, User, FileText } from "lucide-react"

interface SavedReport {
  id: string
  year: string
  reportType: string
  category?: string
  department?: string
  generatedAt: string
  author: string
  data: any
}

interface ReportHistoryProps {
  reports: SavedReport[]
  onLoadReport: (report: SavedReport) => void
}

export default function ReportHistory({ reports, onLoadReport }: ReportHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const reportTypeNames: Record<string, string> = {
    proyectos: "Proyectos",
    voluntariado: "Voluntariado",
    alianzas: "Alianzas",
    general: "General",
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <History className="h-5 w-5 text-primary" />
          Historial de Informes
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Informes generados recientemente - Haz clic para volver a cargarlos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">
                    {reportTypeNames[report.reportType]} - {report.year}
                  </h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(report.generatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{report.author}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onLoadReport(report)}
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Ver
                </Button>
                <Button
                  onClick={() => {
                    const fileName = `informe-${report.reportType}-${report.year}.pdf`
                    console.log(`Descargando: ${fileName}`)
                  }}
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
