"use client"

import { Card } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Tag,
  Users,
  Briefcase,
  FileText,
  ClipboardList,
  DollarSign,
} from "lucide-react"
import type { SavedReport } from "../types/report"

interface ReportPreviewProps {
  data: SavedReport
}

export default function ReportPreview({ data }: ReportPreviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-CR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const reportTypeNames: Record<string, string> = {
    voluntariado: "Voluntariado",
    proyectos: "Proyectos",
    facturacion: "Facturación",
    solicitudes: "Solicitudes",
    colaboradores: "Colaboradores",
    contabilidad: "Contabilidad",
    mensual: "Mensual",
    trimestral: "Trimestral",
    cuatrimestral: "Cuatrimestral",
    semestral: "Semestral",
    anual: "Anual",
    general: "General",
  }

  const categoryNames: Record<string, string> = {
    ventas: "Ventas",
    finanzas: "Finanzas",
    operaciones: "Operaciones",
    marketing: "Marketing",
    "recursos-humanos": "Recursos Humanos",
    general: "General",
  }

  const departmentNames: Record<string, string> = {
    norte: "Región Norte",
    sur: "Región Sur",
    este: "Región Este",
    oeste: "Región Oeste",
    central: "Región Central",
    todos: "Todos los módulos",
    proyectos: "Proyectos",
    voluntariado: "Voluntariado",
    facturacion: "Facturación",
    solicitudes: "Solicitudes",
    colaboradores: "Colaboradores",
    contabilidad: "Contabilidad",
  }

  const growthValue =
    typeof data.data.summary.growth === "string"
      ? Number.parseFloat(data.data.summary.growth)
      : data.data.summary.growth

  // Determinar si mostrar múltiples módulos
  const isMultiModule = data.department === "todos" || (data.department && data.department.includes(","))

  return (
    <div className="h-[600px] overflow-y-auto rounded-lg border border-border bg-background p-8">
      {/* Encabezado del informe */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {reportTypeNames[data.reportType] || data.reportType}
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Informe {data.dateRange ? "de Período" : `Anual ${data.year}`}
        </h1>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          {data.category && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{categoryNames[data.category] || data.category}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>
              {data.department && (
                data.department === "todos" 
                  ? departmentNames["todos"]
                  : data.department.split(",").map(d => departmentNames[d] || d).join(", ")
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {data.dateRange 
                ? `${data.dateRange.start} a ${data.dateRange.end}`
                : data.year
              }
            </span>
          </div>
        </div>
        {data.author && (
          <div className="mt-2 text-sm text-muted-foreground">
            Generado por: <span className="font-medium text-foreground">{data.author}</span>
          </div>
        )}
        <div className="mt-1 text-xs text-muted-foreground">
          Fecha de generación: {formatDate(data.generatedAt)}
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Resumen Ejecutivo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Total de Registros</div>
            <div className="mt-2 text-2xl font-bold text-card-foreground">
              {data.data.summary.totalRecords.toLocaleString("es-CR")}
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Monto Total</div>
            <div className="mt-2 text-2xl font-bold text-card-foreground">
              {formatCurrency(data.data.summary.totalAmount)}
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Valor Promedio</div>
            <div className="mt-2 text-2xl font-bold text-card-foreground">
              {formatCurrency(data.data.summary.averageValue)}
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Crecimiento</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-bold text-card-foreground">{growthValue.toFixed(1)}%</span>
              {growthValue > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Datos mensuales */}
      {data.data.monthlyData && data.data.monthlyData.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Desglose por Período</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Período</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Registros</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {data.data.monthlyData.map((month, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium text-card-foreground">{month.month}</td>
                    <td className="px-4 py-3 text-right text-sm text-card-foreground">{month.records}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-card-foreground">
                      {formatCurrency(month.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumen por Módulos - Solo si es multi-módulo */}
      {isMultiModule && data.data.moduleData && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Resumen por Módulos</h2>

          {/* Voluntariado */}
          {data.data.moduleData.voluntariado && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Voluntariado
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Participantes</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.voluntariado.totalParticipantes}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Formularios</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.voluntariado.formularios}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Estados Activos</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.voluntariado.estadosActivos}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Horas Voluntariado</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.voluntariado.horasVoluntariado.toLocaleString()}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Proyectos */}
          {data.data.moduleData.proyectos && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground">
                <Briefcase className="h-5 w-5 text-primary" />
                Proyectos
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Activos</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.proyectos.activos}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Finalizados</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.proyectos.finalizados}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">En Proceso</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.proyectos.enProceso}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Presupuesto Total</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {formatCurrency(data.data.moduleData.proyectos.presupuestoTotal)}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Facturación */}
          {data.data.moduleData.facturacion && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Facturación
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Total Facturas</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.facturacion.totalFacturas}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Monto Total</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {formatCurrency(data.data.moduleData.facturacion.montoTotal)}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Pendientes</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.facturacion.facturasPendientes}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Pagadas</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.facturacion.facturasPagadas}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Solicitudes */}
          {data.data.moduleData.solicitudes && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground">
                <ClipboardList className="h-5 w-5 text-primary" />
                Solicitudes
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.solicitudes.totalSolicitudes}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Aprobadas</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.solicitudes.aprobadas}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Pendientes</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.solicitudes.pendientes}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Rechazadas</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.solicitudes.rechazadas}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Colaboradores */}
          {data.data.moduleData.colaboradores && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Colaboradores
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.colaboradores.totalColaboradores}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Activos</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.colaboradores.activos}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Roles</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.colaboradores.roles}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Nuevos Ingresos</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.colaboradores.nuevosIngresos}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Contabilidad */}
          {data.data.moduleData.contabilidad && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground">
                <DollarSign className="h-5 w-5 text-primary" />
                Contabilidad
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Ingresos</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {formatCurrency(data.data.moduleData.contabilidad.ingresos)}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Egresos</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {formatCurrency(data.data.moduleData.contabilidad.egresos)}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Balance</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {formatCurrency(data.data.moduleData.contabilidad.balance)}
                  </div>
                </Card>
                <Card className="border-border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Reportes</div>
                  <div className="mt-1 text-xl font-bold text-card-foreground">
                    {data.data.moduleData.contabilidad.reportesGenerados}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pie de página */}
      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>Este informe fue generado automáticamente el {formatDate(data.generatedAt)}</p>
        <p className="mt-1">FUNDECODES DIGITAL - Documento confidencial - Solo para uso interno</p>
      </div>
    </div>
  )
}