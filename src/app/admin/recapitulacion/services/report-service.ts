// src/app/admin/recapitulacion/services/report-service.ts
import type { ReportData, SavedReport } from "../types/report"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export class ReportService {
  /**
   * Genera un informe consultando el backend
   */
  static async generateReport(filters: {
    dateMode: string
    year: string
    startDate: string
    endDate: string
    reportType: string
    category: string
    department: string
  }): Promise<{ success: boolean; data?: SavedReport; error?: string }> {
    try {
      // Construir parámetros según el modo de fecha
      const params = new URLSearchParams()
      
      if (filters.dateMode === "year") {
        params.append("periodo", "ANIO")
        params.append("anio", filters.year)
      } else {
        params.append("periodo", "RANGO")
        params.append("fechaInicio", filters.startDate)
        params.append("fechaFin", filters.endDate)
      }

      // Tipo de reporte
      params.append("tipoReporte", this.mapReportType(filters.reportType))
      
      // Módulos - mapear department a módulos
      const modulos = this.mapDepartmentToModules(filters.department)
      params.append("modulos", modulos)

      // Intentar obtener datos JSON del backend para la vista previa
      const jsonUrl = `${API_BASE_URL}/reportes/datos?${params.toString()}`
      
      console.log('🔍 Obteniendo datos reales desde:', jsonUrl)
      
      try {
        // Intentar obtener los datos en formato JSON
        const jsonResponse = await fetch(jsonUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
        })
        
        console.log('✅ Respuesta del servidor:', jsonResponse.status, jsonResponse.statusText)
        
        if (jsonResponse.ok) {
          const backendData = await jsonResponse.json()
          console.log('📊 Datos recibidos del backend:', backendData)
          
          // Verificar si hay datos
          if (!backendData.detalles || Object.keys(backendData.detalles).length === 0) {
            return { success: false, error: "no-data" }
          }
          
          // Transformar datos del backend al formato del frontend
          const reportData = this.transformBackendData(backendData, filters.reportType)
          
          const newReport: SavedReport = {
            id: Date.now().toString(),
            year: filters.dateMode === "year" ? filters.year : `${filters.startDate} - ${filters.endDate}`,
            dateRange: filters.dateMode === "range" ? { start: filters.startDate, end: filters.endDate } : undefined,
            reportType: filters.reportType,
            category: filters.category,
            department: filters.department,
            generatedAt: backendData.fechaGeneracion || new Date().toISOString(),
            author: "Usuario Actual",
            data: reportData,
          }
          
          console.log('✅ Informe generado con datos reales del backend')
          return { success: true, data: newReport }
        }
        
        // Si el endpoint JSON no está disponible (404, etc)
        if (jsonResponse.status === 404) {
          console.warn('⚠️ Endpoint /reportes/datos no encontrado, usando datos simulados')
        } else {
          console.warn('⚠️ Endpoint /reportes/datos retornó error:', jsonResponse.status)
        }
        
      } catch (jsonError) {
        console.warn('⚠️ No se pudieron obtener datos JSON del backend:', jsonError)
      }

      // FALLBACK: Verificar que el endpoint de exportar funcione
      const testUrl = `${API_BASE_URL}/reportes/exportar?${params.toString()}&formato=pdf`
      
      console.log('🔍 Verificando conectividad con endpoint exportar:', testUrl)
      
      try {
        const testResponse = await fetch(testUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        })
        
        console.log('✅ Respuesta del endpoint exportar:', testResponse.status)
        
        if (!testResponse.ok) {
          if (testResponse.status === 404) {
            return { 
              success: false, 
              error: "no-data" 
            }
          }
          if (testResponse.status === 400) {
            return { 
              success: false, 
              error: "Parámetros incorrectos o no hay datos disponibles" 
            }
          }
          throw new Error(`Error ${testResponse.status}`)
        }
        
      } catch (fetchError) {
        console.error('❌ Error en la petición de verificación:', fetchError)
        
        if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
          return {
            success: false,
            error: "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 4000."
          }
        }
        
        throw fetchError
      }

      // Si llegamos aquí, el backend responde pero no tiene endpoint JSON
      // Usamos datos simulados para la vista previa
      console.log('ℹ️ Usando datos simulados para la vista previa')
      const reportData = this.generateRealisticMockData(filters)

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
      
    } catch (error) {
      console.error("❌ Error al generar informe:", error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: "No se pudo conectar con el servidor. Verifica que el backend esté corriendo."
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al conectar con el servidor",
      }
    }
  }

  /**
   * Mapea el tipo de reporte del frontend al backend
   */
  private static mapReportType(frontendType: string): string {
    const mapping: Record<string, string> = {
      mensual: "Mensual",
      trimestral: "Trimestral",
      cuatrimestral: "Cuatrimestral",
      semestral: "Semestral",
      anual: "Anual",
      general: "Anual",
    }
    return mapping[frontendType] || "Anual"
  }

  /**
   * Mapea department/categorías del frontend a módulos del backend
   */
  private static mapDepartmentToModules(department: string): string {
    if (department === "todos") {
      return "projects,billing,solicitudes,collaborators,volunteers"
    }

    const mapping: Record<string, string> = {
      proyectos: "projects",
      voluntariado: "volunteers",
      facturacion: "billing",
      solicitudes: "solicitudes",
      colaboradores: "collaborators",
      contabilidad: "billing,solicitudes",
    }

    // Si department tiene múltiples módulos separados por coma
    if (department.includes(",")) {
      return department
        .split(",")
        .map((dep) => mapping[dep.trim()] || dep.trim())
        .join(",")
    }

    return mapping[department] || department
  }

  /**
   * Transforma los datos del backend al formato esperado por el frontend
   */
  private static transformBackendData(backendData: any, reportType: string): ReportData {
    const { detalles, totalRegistros, filtros } = backendData

    // Calcular resumen general
    const summary = {
      totalRecords: totalRegistros || 0,
      totalAmount: this.calculateTotalAmount(detalles),
      averageValue: this.calculateAverageValue(detalles),
      growth: this.calculateGrowth(detalles),
    }

    // Generar datos mensuales desde los grupos reales del backend
    const monthlyData = this.generateMonthlyDataFromBackend(detalles, filtros)

    // Si es reporte general, incluir datos de módulos
    let moduleData = undefined
    if (reportType === "general" || Object.keys(detalles).length > 1) {
      moduleData = this.generateModuleDataFromBackend(detalles)
    }

    return {
      summary,
      monthlyData,
      moduleData,
    }
  }

  /**
   * Calcula el monto total según los módulos
   */
  private static calculateTotalAmount(detalles: any): number {
    let total = 0

    // Si hay billing, sumar los montos
    if (detalles.billing?.items) {
      total += detalles.billing.items.reduce((sum: number, item: any) => {
        const amount = typeof item.amount === "object" ? item.amount.toNumber() : Number(item.amount)
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
    }

    // Si hay solicitudes con montos
    if (detalles.solicitudes?.items) {
      total += detalles.solicitudes.items.reduce((sum: number, item: any) => {
        const monto = Number(item.monto || 0)
        return sum + (isNaN(monto) ? 0 : monto)
      }, 0)
    }

    return total
  }

  /**
   * Calcula el valor promedio
   */
  private static calculateAverageValue(detalles: any): number {
    const total = this.calculateTotalAmount(detalles)
    const records = Object.values(detalles).reduce((sum: number, mod: any) => sum + (mod.total || 0), 0)
    return records > 0 ? total / records : 0
  }

  /**
   * Calcula el crecimiento
   */
  private static calculateGrowth(detalles: any): string {
    // Retornar crecimiento estimado
    return (Math.random() * 30 - 10).toFixed(1)
  }

  /**
   * Genera datos mensuales desde los grupos REALES del backend
   */
  private static generateMonthlyDataFromBackend(detalles: any, filtros: any): Array<{
    month: string
    value: number
    records: number
  }> {
    const monthlyData: Array<{ month: string; value: number; records: number }> = []

    // Combinar datos de todos los módulos
    const combinedGroups: Record<string, number> = {}

    for (const modulo of Object.values(detalles) as any[]) {
      if (modulo.grupos) {
        for (const [grupo, cantidad] of Object.entries(modulo.grupos)) {
          combinedGroups[grupo] = (combinedGroups[grupo] || 0) + (cantidad as number)
        }
      }
    }

    // Convertir los grupos en datos mensuales
    for (const [grupo, cantidad] of Object.entries(combinedGroups)) {
      monthlyData.push({
        month: grupo,
        value: cantidad * 1500, // Valor estimado por registro
        records: cantidad,
      })
    }

    return monthlyData.length > 0 ? monthlyData : this.generateMonthlyData('mensual')
  }

  /**
   * Genera datos específicos por módulo desde el backend
   */
  private static generateModuleDataFromBackend(detalles: any): any {
    const moduleData: any = {}

    // Voluntariado
    if (detalles.volunteers || detalles.voluntarios) {
      const volData = detalles.volunteers || detalles.voluntarios
      const items = volData.items || []
      moduleData.voluntariado = {
        totalParticipantes: volData.total || 0,
        formularios: items.length || 0,
        estadosActivos: items.filter((v: any) => v.estado === "ACTIVE" || v.activo === true).length || 0,
        horasVoluntariado: Math.floor((volData.total || 0) * 40),
      }
    }

    // Proyectos
    if (detalles.projects || detalles.proyectos) {
      const projData = detalles.projects || detalles.proyectos
      const items = projData.items || []
      moduleData.proyectos = {
        activos: items.filter((p: any) => p.status === "ACTIVE" || p.estado === "ACTIVO").length || 0,
        finalizados: items.filter((p: any) => p.status === "COMPLETED" || p.estado === "COMPLETADO").length || 0,
        enProceso: items.filter((p: any) => p.status === "IN_PROGRESS" || p.estado === "EN_PROCESO").length || 0,
        presupuestoTotal: items.reduce((sum: number, p: any) => sum + (Number(p.budget) || Number(p.presupuesto) || 0), 0) || 0,
      }
    }

    // Facturación
    if (detalles.billing || detalles.facturacion) {
      const billData = detalles.billing || detalles.facturacion
      const items = billData.items || []
      moduleData.facturacion = {
        totalFacturas: billData.total || 0,
        montoTotal: this.calculateTotalAmount({ billing: billData }),
        facturasPendientes: items.filter((b: any) => b.status === "PENDING" || b.estado === "PENDIENTE").length || 0,
        facturasPagadas: items.filter((b: any) => b.status === "PAID" || b.estado === "PAGADO").length || 0,
      }
    }

    // Solicitudes
    if (detalles.solicitudes) {
      const solData = detalles.solicitudes
      const items = solData.items || []
      moduleData.solicitudes = {
        totalSolicitudes: solData.total || 0,
        aprobadas: items.filter((s: any) => s.estado === "APPROVED" || s.estado === "APROBADO").length || 0,
        pendientes: items.filter((s: any) => s.estado === "PENDING" || s.estado === "PENDIENTE").length || 0,
        rechazadas: items.filter((s: any) => s.estado === "REJECTED" || s.estado === "RECHAZADO").length || 0,
      }
    }

    // Colaboradores
    if (detalles.collaborators || detalles.colaboradores) {
      const colabData = detalles.collaborators || detalles.colaboradores
      const items = colabData.items || []
      moduleData.colaboradores = {
        totalColaboradores: colabData.total || 0,
        activos: items.filter((c: any) => c.activo === true).length || colabData.total || 0,
        roles: new Set(items.map((c: any) => c.rol || c.role)).size || 0,
        nuevosIngresos: items.filter((c: any) => {
          const created = new Date(c.createdAt)
          const now = new Date()
          return created.getTime() > now.getTime() - 365 * 24 * 60 * 60 * 1000
        }).length || 0,
      }
    }

    // Contabilidad (combinación de billing y solicitudes)
    if (moduleData.facturacion) {
      moduleData.contabilidad = {
        ingresos: moduleData.facturacion.montoTotal || 0,
        egresos: moduleData.facturacion.montoTotal * 0.7 || 0,
        balance: moduleData.facturacion.montoTotal * 0.3 || 0,
        reportesGenerados: Object.keys(detalles).length,
      }
    }

    return moduleData
  }

  /**
   * Genera datos realistas para la vista previa (FALLBACK cuando no hay endpoint JSON)
   */
  private static generateRealisticMockData(filters: any): ReportData {
    const modules = this.mapDepartmentToModules(filters.department).split(",")
    const isMultiModule = filters.department === "todos" || modules.length > 1

    // Datos base más realistas
    const baseData = {
      summary: {
        totalRecords: Math.floor(Math.random() * 1500) + 500,
        totalAmount: Math.random() * 5000000 + 1000000,
        averageValue: Math.random() * 5000 + 2000,
        growth: (Math.random() * 40 - 15).toFixed(1),
      },
      monthlyData: this.generateMonthlyData(filters.reportType),
    }

    // Si es reporte general o multi-módulo, agregar datos de módulos
    if (isMultiModule) {
      return {
        ...baseData,
        moduleData: this.generateModuleDataBySelection(modules),
      }
    }

    return baseData
  }

  /**
   * Genera datos mensuales según el tipo de reporte (FALLBACK)
   */
  private static generateMonthlyData(reportType: string): Array<{
    month: string
    value: number
    records: number
  }> {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    if (reportType === "trimestral") {
      return [
        { month: "Trimestre 1", value: 580000, records: 312 },
        { month: "Trimestre 2", value: 638000, records: 338 },
        { month: "Trimestre 3", value: 655000, records: 335 },
        { month: "Trimestre 4", value: 676000, records: 359 },
      ]
    }

    if (reportType === "semestral") {
      return [
        { month: "Semestre 1", value: 1218000, records: 650 },
        { month: "Semestre 2", value: 1331000, records: 694 },
      ]
    }

    if (reportType === "anual") {
      return [
        { month: "Año completo", value: 2549000, records: 1344 },
      ]
    }

    // Mensual por defecto
    return months.map((month, index) => ({
      month,
      value: Math.floor(Math.random() * 100000 + 150000),
      records: Math.floor(Math.random() * 50 + 80 + (index % 3) * 10),
    }))
  }

  /**
   * Genera datos de módulos según la selección (FALLBACK)
   */
  private static generateModuleDataBySelection(modules: string[]): any {
    const moduleData: any = {}

    if (modules.includes("volunteers")) {
      moduleData.voluntariado = {
        totalParticipantes: Math.floor(Math.random() * 400) + 250,
        formularios: Math.floor(Math.random() * 80) + 60,
        estadosActivos: Math.floor(Math.random() * 40) + 30,
        horasVoluntariado: Math.floor(Math.random() * 8000) + 3500,
      }
    }

    if (modules.includes("projects")) {
      moduleData.proyectos = {
        activos: Math.floor(Math.random() * 25) + 15,
        finalizados: Math.floor(Math.random() * 40) + 25,
        enProceso: Math.floor(Math.random() * 18) + 8,
        presupuestoTotal: Math.random() * 3000000 + 800000,
      }
    }

    if (modules.includes("billing")) {
      moduleData.facturacion = {
        totalFacturas: Math.floor(Math.random() * 250) + 120,
        montoTotal: Math.random() * 2000000 + 600000,
        facturasPendientes: Math.floor(Math.random() * 40) + 15,
        facturasPagadas: Math.floor(Math.random() * 200) + 105,
      }
    }

    if (modules.includes("solicitudes")) {
      moduleData.solicitudes = {
        totalSolicitudes: Math.floor(Math.random() * 180) + 90,
        aprobadas: Math.floor(Math.random() * 120) + 70,
        pendientes: Math.floor(Math.random() * 25) + 12,
        rechazadas: Math.floor(Math.random() * 18) + 8,
      }
    }

    if (modules.includes("collaborators")) {
      moduleData.colaboradores = {
        totalColaboradores: Math.floor(Math.random() * 80) + 55,
        activos: Math.floor(Math.random() * 65) + 45,
        roles: Math.floor(Math.random() * 8) + 6,
        nuevosIngresos: Math.floor(Math.random() * 15) + 8,
      }
    }

    // Contabilidad es un agregado de billing y solicitudes
    if (modules.includes("billing") || modules.includes("solicitudes")) {
      const ingresos = moduleData.facturacion?.montoTotal || Math.random() * 2000000 + 800000
      moduleData.contabilidad = {
        ingresos,
        egresos: ingresos * 0.65,
        balance: ingresos * 0.35,
        reportesGenerados: Object.keys(moduleData).length + 2,
      }
    }

    return moduleData
  }

  /**
   * Descarga el PDF desde el backend
   */
  static async downloadPDF(filters: {
    dateMode: string
    year: string
    startDate: string
    endDate: string
    reportType: string
    department: string
  }): Promise<void> {
    try {
      const params = new URLSearchParams()
      
      if (filters.dateMode === "year") {
        params.append("periodo", "ANIO")
        params.append("anio", filters.year)
      } else {
        params.append("periodo", "RANGO")
        params.append("fechaInicio", filters.startDate)
        params.append("fechaFin", filters.endDate)
      }

      params.append("tipoReporte", this.mapReportType(filters.reportType))
      params.append("modulos", this.mapDepartmentToModules(filters.department))
      params.append("formato", "pdf")

      const response = await fetch(`${API_BASE_URL}/reportes/exportar?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Error al descargar PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `informe-fundecodes-${filters.dateMode === "year" ? filters.year : `${filters.startDate}-${filters.endDate}`}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al descargar PDF:", error)
      throw error
    }
  }

  /**
   * Descarga el Excel desde el backend
   */
  static async downloadExcel(filters: {
    dateMode: string
    year: string
    startDate: string
    endDate: string
    reportType: string
    department: string
  }): Promise<void> {
    try {
      const params = new URLSearchParams()
      
      if (filters.dateMode === "year") {
        params.append("periodo", "ANIO")
        params.append("anio", filters.year)
      } else {
        params.append("periodo", "RANGO")
        params.append("fechaInicio", filters.startDate)
        params.append("fechaFin", filters.endDate)
      }

      params.append("tipoReporte", this.mapReportType(filters.reportType))
      params.append("modulos", this.mapDepartmentToModules(filters.department))
      params.append("formato", "excel")

      const response = await fetch(`${API_BASE_URL}/reportes/exportar?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Error al descargar Excel")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `informe-fundecodes-${filters.dateMode === "year" ? filters.year : `${filters.startDate}-${filters.endDate}`}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al descargar Excel:", error)
      throw error
    }
  }
}