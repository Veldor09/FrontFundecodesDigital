"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReportGenerator from "./components/report-generator"
import ReportHistory from "./components/report-history"
import { useReportGenerator } from "./hooks/use-report-generator"

export default function RecapitulacionPage() {
  const { savedReports, loadReport } = useReportGenerator()

  const handleDeleteReport = (reportId: string) => {
    // Aquí podrías implementar la lógica para eliminar del localStorage
    console.log("Eliminar reporte:", reportId)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Recapitulación Anual</h1>
            <p className="text-slate-600 mt-1">
              Genera informes consolidados de todos los módulos del sistema
            </p>
          </div>

          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-2 bg-white border-slate-300 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        {/* Report Generator Component */}
        <ReportGenerator />

        {/* Report History - Solo mostrar si hay reportes */}
        {savedReports.length > 0 && (
          <div className="mt-8">
            <ReportHistory 
              reports={savedReports} 
              onLoadReport={loadReport}
              onDeleteReport={handleDeleteReport}
            />
          </div>
        )}
      </div>
    </main>
  )
}