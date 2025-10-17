"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReportGenerator from "./components/report-generator"  // ← CAMBIA ESTO

export default function RecapitulacionPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Recapitulacion Anual</h1>
            <p className="text-slate-600 mt-1">Genera informes consolidados de todos los módulos del sistema</p>
          </div>

          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        {/* Report Generator Component */}
        <ReportGenerator />
      </div>
    </main>
  )
}