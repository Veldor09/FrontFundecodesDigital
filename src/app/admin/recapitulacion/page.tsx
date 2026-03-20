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
    console.log("Eliminar reporte:", reportId)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 border-b border-slate-200 pb-6">
          <h1 className="text-center text-3xl font-bold text-slate-900">
            Bienvenido al área de Recapitulación Anual
          </h1>

          <div className="mt-6">
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Recapitulación Anual
            </h2>
            <p className="mt-1 text-slate-600">
              Genera informes consolidados de todos los módulos del sistema
            </p>
          </div>
        </section>

        <ReportGenerator />

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