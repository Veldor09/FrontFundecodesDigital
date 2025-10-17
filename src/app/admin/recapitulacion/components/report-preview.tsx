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

interface ReportPreviewProps {
  data: {
    id?: string
    year: string
    reportType: string
    category: string
    department: string
    generatedAt: string
    author?: string
    data: {
      summary: {
        totalRecords: number
        totalAmount: number
        averageValue: number
        growth: number | string
      }
      monthlyData: Array<{
        month: string
        value: number
        records: number
      }>
      moduleData?: {
        voluntariado: {
          totalParticipantes: number
          formularios: number
          estadosActivos: number
          horasVoluntariado: number
        }
        proyectos: {
          activos: number
          finalizados: number
          enProceso: number
          presupuestoTotal: number
        }
        facturacion: {
          totalFacturas: number
          montoTotal: number
          facturasPendientes: number
          facturasPagadas: number
        }
        solicitudes: {
          totalSolicitudes: number
          aprobadas: number
          pendientes: number
          rechazadas: number
        }
        colaboradores: {
          totalColaboradores: number
          activos: number
          roles: number
          nuevosIngresos: number
        }
        contabilidad: {
          ingresos: number
          egresos: number
          balance: number
          reportesGenerados: number
        }
      }
    }
  }
}

export default function ReportPreview({ data }: ReportPreviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-ES", {
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
    general: "Informe General",
  }

  const categoryNames: Record<string, string> = {
    ventas: "Ventas",
    finanzas: "Finanzas",
    operaciones: "Operaciones",
    marketing: "Marketing",
    "recursos-humanos": "Recursos Humanos",
  }

  const departmentNames: Record<string, string> = {
    norte: "Región Norte",
    sur: "Región Sur",
    este: "Región Este",
    oeste: "Región Oeste",
    central: "Región Central",
  }

  const growthValue =
    typeof data.data.summary.growth === "string"
      ? Number.parseFloat(data.data.summary.growth)
      : data.data.summary.growth

  return (
    <div className="h-[600px] overflow-y-auto rounded-lg border border-border bg-background p-8">
      {/* Encabezado del informe */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {reportTypeNames[data.reportType] || data.reportType}
        </div>
        <h1 className="text-3xl font-bold text-foreground">Informe Anual {data.year}</h1>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>{categoryNames[data.category]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{departmentNames[data.department]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(data.generatedAt)}</span>
          </div>
        </div>
        {data.author && (
          <div className="mt-2 text-sm text-muted-foreground">
            Generado por: <span className="font-medium text-foreground">{data.author}</span>
          </div>
        )}
      </div>

      {/* Resumen ejecutivo */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Resumen Ejecutivo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Total de Registros</div>
            <div className="mt-2 text-2xl font-bold text-card-foreground">
              {data.data.summary.totalRecords.toLocaleString("es-ES")}
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
              <span className="text-2xl font-bold text-card-foreground">{growthValue}%</span>
              {growthValue > 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Datos mensuales */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Desglose Mensual</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Mes</th>
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

      {/* Resumen por Módulos */}
      {data.data.moduleData && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Resumen por Módulos</h2>

          {/* Voluntariado */}
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

          {/* Proyectos */}
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

          {/* Facturación */}
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

          {/* Solicitudes */}
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

          {/* Colaboradores */}
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

          {/* Contabilidad */}
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
        </div>
      )}

      {/* Pie de página */}
      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>Este informe fue generado automáticamente el {formatDate(data.generatedAt)}</p>
        <p className="mt-1">Documento confidencial - Solo para uso interno</p>
      </div>
    </div>
  )
}
