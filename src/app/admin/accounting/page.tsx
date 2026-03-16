"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AccountingNav from "./components/accountingNav"
import { BudgetTable } from "./components/budget-table"
import { TransactionsList } from "./components/transactions-list"
import { DocumentsManager } from "./components/documents-manager"
import { ProjectsService } from "./services/projects-service"
import { BudgetService } from "./services/budget-service"
import { TransactionService } from "./services/transaction-service"

type ActiveModule = "Presupuestos" | "Transacciones" | "Documentos"
type ProjectTotals = { presupuestoInicial: number; ingresos: number; egresos: number; disponible: number }

export default function ContabilidadPage() {
  const [activeModule, setActiveModule] = useState<ActiveModule>("Presupuestos")
  const [projects, setProjects] = useState<{ id: number; title: string }[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [totalsByProject, setTotalsByProject] = useState<Record<string, ProjectTotals>>({})

  const loadDashboardData = async () => {
    try {
      const [projectsData, budgets, transactions] = await Promise.all([
        ProjectsService.list(),
        BudgetService.getBudgetItems(),
        TransactionService.getTransactions(),
      ])

      setProjects(projectsData)

      const nextTotals = projectsData.reduce((acc, project) => {
        const projectName = project.title
        const presupuestoInicial = budgets
          .filter((b) => b.programa === projectName)
          .reduce((sum, b) => sum + b.montoAsignado, 0)
        const ingresos = transactions
          .filter((t) => t.programa === projectName && t.tipo === "ingreso")
          .reduce((sum, t) => sum + t.monto, 0)
        const egresos = transactions
          .filter((t) => t.programa === projectName && t.tipo === "egreso")
          .reduce((sum, t) => sum + t.monto, 0)

        acc[projectName] = {
          presupuestoInicial,
          ingresos,
          egresos,
          disponible: presupuestoInicial + ingresos - egresos,
        }
        return acc
      }, {} as Record<string, ProjectTotals>)

      setTotalsByProject(nextTotals)
    } catch {
      setProjects([])
      setTotalsByProject({})
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(amount)

  const selectedProjectTotals = useMemo(
    () => (selectedProject ? totalsByProject[selectedProject] : null),
    [selectedProject, totalsByProject],
  )

  const renderActiveModule = () => {
    switch (activeModule) {
      case "Presupuestos":
        return <BudgetTable selectedProject={selectedProject ?? undefined} onDataChange={loadDashboardData} />
      case "Transacciones":
        return <TransactionsList selectedProject={selectedProject ?? undefined} onDataChange={loadDashboardData} />
      case "Documentos":
        return <DocumentsManager />
    }
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight text-center">
              Área de Contabilidad por Proyecto
            </h1>
            <p className="text-center text-slate-600 mt-2">
              Selecciona un proyecto para gestionar su presupuesto inicial, ingresos y egresos.
            </p>
            <div className="mt-4 flex justify-center">
              <a href="/admin">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Dashboard
                </Button>
              </a>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const totals = totalsByProject[project.title] ?? {
                presupuestoInicial: 0,
                ingresos: 0,
                egresos: 0,
                disponible: 0,
              }

              return (
                <Card key={project.id} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-slate-600">Presupuesto inicial: {formatCurrency(totals.presupuestoInicial)}</div>
                    <div className="text-sm text-green-700">Ingresos: +{formatCurrency(totals.ingresos)}</div>
                    <div className="text-sm text-red-700">Egresos: -{formatCurrency(totals.egresos)}</div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <div className="text-xs text-blue-700 uppercase tracking-wide">Total disponible</div>
                      <div className="text-xl font-bold text-blue-900 flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        {formatCurrency(totals.disponible)}
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => setSelectedProject(project.title)}>
                      Abrir proyecto
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AccountingNav active={activeModule} onChange={setActiveModule} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-blue-700">Proyecto seleccionado</p>
              <h2 className="text-xl font-bold text-blue-900">{selectedProject}</h2>
              <p className="text-sm text-blue-800 mt-1">
                Total disponible: {formatCurrency(selectedProjectTotals?.disponible ?? 0)}
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedProject(null)}>
              Cambiar proyecto
            </Button>
          </CardContent>
        </Card>
        {renderActiveModule()}
      </main>
    </div>
  )
}
