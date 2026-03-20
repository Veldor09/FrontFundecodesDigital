"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
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

type ProjectTotals = {
  presupuestoInicial: number
  ingresos: number
  egresos: number
  disponible: number
}

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
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(amount)

  const selectedProjectTotals = useMemo(
    () => (selectedProject ? totalsByProject[selectedProject] : null),
    [selectedProject, totalsByProject]
  )

  const renderActiveModule = () => {
    switch (activeModule) {
      case "Presupuestos":
        return (
          <BudgetTable
            selectedProject={selectedProject ?? undefined}
            onDataChange={loadDashboardData}
          />
        )
      case "Transacciones":
        return (
          <TransactionsList
            selectedProject={selectedProject ?? undefined}
            onDataChange={loadDashboardData}
          />
        )
      case "Documentos":
        return <DocumentsManager />
      default:
        return null
    }
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-center text-3xl font-bold text-slate-900">
              Bienvenido al área de Contabilidad por Proyecto
            </h1>

            <p className="mt-2 text-center text-slate-600">
              Selecciona un proyecto para gestionar su presupuesto inicial, ingresos y egresos.
            </p>

            <div className="mt-6">
              <Link href="/admin">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const totals = totalsByProject[project.title] ?? {
                presupuestoInicial: 0,
                ingresos: 0,
                egresos: 0,
                disponible: 0,
              }

              return (
                <Card
                  key={project.id}
                  className="border-slate-200 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">
                      {project.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="text-sm text-slate-600">
                      Presupuesto inicial: {formatCurrency(totals.presupuestoInicial)}
                    </div>

                    <div className="text-sm text-green-700">
                      Ingresos: +{formatCurrency(totals.ingresos)}
                    </div>

                    <div className="text-sm text-red-700">
                      Egresos: -{formatCurrency(totals.egresos)}
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="text-xs uppercase tracking-wide text-blue-700">
                        Total disponible
                      </div>

                      <div className="flex items-center gap-2 text-xl font-bold text-blue-900">
                        <Wallet className="h-5 w-5" />
                        {formatCurrency(totals.disponible)}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => setSelectedProject(project.title)}
                    >
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

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-blue-700">Proyecto seleccionado</p>
              <h2 className="text-xl font-bold text-blue-900">{selectedProject}</h2>
              <p className="mt-1 text-sm text-blue-800">
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