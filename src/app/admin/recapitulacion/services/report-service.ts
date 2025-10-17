import type { ReportData, SavedReport } from "../types/report"

export class ReportService {
  static async generateReport(filters: {
    dateMode: string
    year: string
    startDate: string
    endDate: string
    reportType: string
    category: string
    department: string
  }): Promise<{ success: boolean; data?: SavedReport; error?: string }> {
    // Simulación de llamada a API
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const random = Math.random()

    if (random < 0.1) {
      return { success: false, error: "no-data" }
    } else if (random < 0.2) {
      return {
        success: false,
        error: "Error al conectar con el servidor. Por favor, intenta nuevamente.",
      }
    }

    const reportData = this.generateMockData(filters.reportType)

    const newReport: SavedReport = {
      id: Date.now().toString(),
      year: filters.dateMode === "year" ? filters.year : `${filters.startDate} - ${filters.endDate}`,
      dateRange: filters.dateMode === "range" ? { start: filters.startDate, end: filters.endDate } : undefined,
      reportType: filters.reportType,
      category: filters.category,
      department: filters.department,
      generatedAt: new Date().toISOString(),
      author: "Usuario Actual",
      data: reportData,
    }

    return { success: true, data: newReport }
  }

  static generateMockData(reportType: string): ReportData {
    const baseData = {
      summary: {
        totalRecords: Math.floor(Math.random() * 2000) + 500,
        totalAmount: Math.random() * 3000000 + 1000000,
        averageValue: Math.random() * 3000 + 1000,
        growth: (Math.random() * 30 - 10).toFixed(1),
      },
      monthlyData: [
        { month: "Enero", value: 185000, records: 95 },
        { month: "Febrero", value: 192000, records: 102 },
        { month: "Marzo", value: 210000, records: 115 },
        { month: "Abril", value: 198000, records: 98 },
        { month: "Mayo", value: 225000, records: 125 },
        { month: "Junio", value: 215000, records: 110 },
        { month: "Julio", value: 230000, records: 118 },
        { month: "Agosto", value: 205000, records: 105 },
        { month: "Septiembre", value: 220000, records: 112 },
        { month: "Octubre", value: 240000, records: 128 },
        { month: "Noviembre", value: 235000, records: 122 },
        { month: "Diciembre", value: 201789.5, records: 117 },
      ],
    }

    if (reportType === "general") {
      return {
        ...baseData,
        moduleData: {
          voluntariado: {
            totalParticipantes: Math.floor(Math.random() * 500) + 200,
            formularios: Math.floor(Math.random() * 100) + 50,
            estadosActivos: Math.floor(Math.random() * 50) + 20,
            horasVoluntariado: Math.floor(Math.random() * 5000) + 2000,
          },
          proyectos: {
            activos: Math.floor(Math.random() * 30) + 10,
            finalizados: Math.floor(Math.random() * 50) + 20,
            enProceso: Math.floor(Math.random() * 20) + 5,
            presupuestoTotal: Math.random() * 2000000 + 500000,
          },
          facturacion: {
            totalFacturas: Math.floor(Math.random() * 300) + 100,
            montoTotal: Math.random() * 1500000 + 500000,
            facturasPendientes: Math.floor(Math.random() * 50) + 10,
            facturasPagadas: Math.floor(Math.random() * 250) + 90,
          },
          solicitudes: {
            totalSolicitudes: Math.floor(Math.random() * 200) + 80,
            aprobadas: Math.floor(Math.random() * 150) + 60,
            pendientes: Math.floor(Math.random() * 30) + 10,
            rechazadas: Math.floor(Math.random() * 20) + 5,
          },
          colaboradores: {
            totalColaboradores: Math.floor(Math.random() * 100) + 50,
            activos: Math.floor(Math.random() * 80) + 40,
            roles: Math.floor(Math.random() * 10) + 5,
            nuevosIngresos: Math.floor(Math.random() * 20) + 5,
          },
          contabilidad: {
            ingresos: Math.random() * 2000000 + 1000000,
            egresos: Math.random() * 1500000 + 500000,
            balance: Math.random() * 500000 + 100000,
            reportesGenerados: Math.floor(Math.random() * 50) + 20,
          },
        },
      }
    }

    return baseData
  }

  static async downloadPDF(fileName: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(`Descargando PDF: ${fileName}`)
  }

  static async downloadExcel(fileName: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(`Descargando Excel: ${fileName}`)
  }
}
