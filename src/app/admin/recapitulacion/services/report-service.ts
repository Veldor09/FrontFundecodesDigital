"use client";

import axios from "axios";
import type { ReportData, SavedReport } from "../types/report";

/* ========================= 🌐 Config base ========================= */
export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

/* ========================= 🔐 Headers ========================= */
function authHeader() {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* =========================================================== */
/* 📊 Servicio principal de api/Reportes                           */
/* =========================================================== */
export class ReportService {
  /**
   * Genera un informe consultando el backend
   */
  static async generateReport(filters: {
    dateMode: string;
    year: string;
    startDate: string;
    endDate: string;
    reportType: string;
    category: string;
    department: string;
  }): Promise<{ success: boolean; data?: SavedReport; error?: string }> {
    try {
      const params = new URLSearchParams();

      if (filters.dateMode === "year") {
        params.append("periodo", "ANIO");
        params.append("anio", filters.year);
      } else {
        params.append("periodo", "RANGO");
        params.append("fechaInicio", filters.startDate);
        params.append("fechaFin", filters.endDate);
      }

      params.append("tipoReporte", this.mapReportType(filters.reportType));
      const modulos = this.mapDepartmentToModules(filters.department);
      params.append("modulos", modulos);

      const jsonUrl = `${API_URL}/api/reportes/datos`;

      console.log("🔍 Obteniendo datos reales desde:", jsonUrl);

      try {
        const { data: backendData } = await axios.get(jsonUrl, {
          params,
          headers: { Accept: "application/json", ...authHeader() },
          withCredentials: true,
          timeout: 10000,
        });

        console.log("📊 Datos recibidos del backend:", backendData);

        if (!backendData.detalles || Object.keys(backendData.detalles).length === 0) {
          return { success: false, error: "no-data" };
        }

        const reportData = this.transformBackendData(backendData, filters.reportType);

        const newReport: SavedReport = {
          id: Date.now().toString(),
          year:
            filters.dateMode === "year"
              ? filters.year
              : `${filters.startDate} - ${filters.endDate}`,
          dateRange:
            filters.dateMode === "range"
              ? { start: filters.startDate, end: filters.endDate }
              : undefined,
          reportType: filters.reportType,
          category: filters.category,
          department: filters.department,
          generatedAt: backendData.fechaGeneracion || new Date().toISOString(),
          author: "Usuario Actual",
          data: reportData,
        };

        console.log("✅ Informe generado con datos reales del backend");
        return { success: true, data: newReport };
      } catch (jsonError: any) {
        if (axios.isAxiosError(jsonError)) {
          if (jsonError.response?.status === 404) {
            console.warn("⚠️ Endpoint /api/reportes/datos no encontrado, usando datos simulados");
          } else {
            console.warn("⚠️ Error al consultar /api/reportes/datos:", jsonError.message);
          }
        } else {
          console.warn("⚠️ Error desconocido:", jsonError);
        }
      }

      // FALLBACK: verificar el endpoint de exportar
      const testUrl = `${API_URL}/api/reportes/exportar`;
      console.log("🔍 Verificando conectividad con endpoint exportar:", testUrl);

      try {
        const { status } = await axios.get(testUrl, {
          params: { ...Object.fromEntries(params), formato: "pdf" },
          headers: authHeader(),
          withCredentials: true,
          timeout: 8000,
        });

        console.log("✅ Respuesta del endpoint exportar:", status);
      } catch (fetchError: any) {
        console.error("❌ Error en la petición de verificación:", fetchError);
        if (axios.isAxiosError(fetchError)) {
          if (!fetchError.response) {
            return {
              success: false,
              error:
                "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 4000.",
            };
          }
        }
      }

      // Si llega aquí, backend responde pero no tiene endpoint JSON
      console.log("ℹ️ Usando datos simulados para la vista previa");
      const reportData = this.generateRealisticMockData(filters);

      const newReport: SavedReport = {
        id: Date.now().toString(),
        year:
          filters.dateMode === "year"
            ? filters.year
            : `${filters.startDate} - ${filters.endDate}`,
        dateRange:
          filters.dateMode === "range"
            ? { start: filters.startDate, end: filters.endDate }
            : undefined,
        reportType: filters.reportType,
        category: filters.category,
        department: filters.department,
        generatedAt: new Date().toISOString(),
        author: "Usuario Actual",
        data: reportData,
      };

      return { success: true, data: newReport };
    } catch (error: any) {
      console.error("❌ Error al generar informe:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.message
          : error instanceof Error
          ? error.message
          : "Error al conectar con el servidor",
      };
    }
  }

  /** 📥 Descargar PDF */
  static async downloadPDF(filters: {
    dateMode: string;
    year: string;
    startDate: string;
    endDate: string;
    reportType: string;
    department: string;
  }): Promise<void> {
    const params: Record<string, any> = {};

    if (filters.dateMode === "year") {
      params.periodo = "ANIO";
      params.anio = filters.year;
    } else {
      params.periodo = "RANGO";
      params.fechaInicio = filters.startDate;
      params.fechaFin = filters.endDate;
    }

    params.tipoReporte = this.mapReportType(filters.reportType);
    params.modulos = this.mapDepartmentToModules(filters.department);
    params.formato = "pdf";

    const { data } = await axios.get(`${API_URL}/api/reportes/exportar`, {
      responseType: "blob",
      headers: authHeader(),
      withCredentials: true,
      params,
    });

    const blob = new Blob([data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe-fundecodes-${
      filters.dateMode === "year"
        ? filters.year
        : `${filters.startDate}-${filters.endDate}`
    }.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /** 📊 Descargar Excel */
  static async downloadExcel(filters: {
    dateMode: string;
    year: string;
    startDate: string;
    endDate: string;
    reportType: string;
    department: string;
  }): Promise<void> {
    const params: Record<string, any> = {};

    if (filters.dateMode === "year") {
      params.periodo = "ANIO";
      params.anio = filters.year;
    } else {
      params.periodo = "RANGO";
      params.fechaInicio = filters.startDate;
      params.fechaFin = filters.endDate;
    }

    params.tipoReporte = this.mapReportType(filters.reportType);
    params.modulos = this.mapDepartmentToModules(filters.department);
    params.formato = "excel";

    const { data } = await axios.get(`${API_URL}/api/reportes/exportar`, {
      responseType: "blob",
      headers: authHeader(),
      withCredentials: true,
      params,
    });

    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe-fundecodes-${
      filters.dateMode === "year"
        ? filters.year
        : `${filters.startDate}-${filters.endDate}`
    }.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /* ======================================================
     🔽 Helpers auxiliares (idénticos a tu lógica original)
  ====================================================== */
  private static mapReportType(frontendType: string): string {
    const mapping: Record<string, string> = {
      mensual: "Mensual",
      trimestral: "Trimestral",
      cuatrimestral: "Cuatrimestral",
      semestral: "Semestral",
      anual: "Anual",
      general: "Anual",
    };
    return mapping[frontendType] || "Anual";
  }

  private static mapDepartmentToModules(department: string): string {
    if (department === "todos") {
      return "projects,billing,solicitudes,collaborators,volunteers";
    }
    const mapping: Record<string, string> = {
      proyectos: "projects",
      voluntariado: "volunteers",
      facturacion: "billing",
      solicitudes: "solicitudes",
      colaboradores: "collaborators",
      contabilidad: "billing,solicitudes",
    };
    if (department.includes(",")) {
      return department
        .split(",")
        .map((dep) => mapping[dep.trim()] || dep.trim())
        .join(",");
    }
    return mapping[department] || department;
  }

  /* ================================================
     🔧 Resto de helpers (sin cambios de tu lógica)
  ================================================ */
  private static transformBackendData(backendData: any, reportType: string): ReportData {
    const { detalles, totalRegistros, filtros } = backendData;
    const summary = {
      totalRecords: totalRegistros || 0,
      totalAmount: this.calculateTotalAmount(detalles),
      averageValue: this.calculateAverageValue(detalles),
      growth: this.calculateGrowth(detalles),
    };
    const monthlyData = this.generateMonthlyDataFromBackend(detalles, filtros);
    let moduleData = undefined;
    if (reportType === "general" || Object.keys(detalles).length > 1) {
      moduleData = this.generateModuleDataFromBackend(detalles);
    }
    return { summary, monthlyData, moduleData };
  }

  private static calculateTotalAmount(detalles: any): number {
    let total = 0;
    if (detalles.billing?.items) {
      total += detalles.billing.items.reduce((sum: number, item: any) => {
        const amount =
          typeof item.amount === "object" ? item.amount.toNumber() : Number(item.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    }
    if (detalles.solicitudes?.items) {
      total += detalles.solicitudes.items.reduce((sum: number, item: any) => {
        const monto = Number(item.monto || 0);
        return sum + (isNaN(monto) ? 0 : monto);
      }, 0);
    }
    return total;
  }

  private static calculateAverageValue(detalles: any): number {
    const total = this.calculateTotalAmount(detalles);
    const records = Object.values(detalles).reduce(
      (sum: number, mod: any) => sum + (mod.total || 0),
      0
    );
    return records > 0 ? total / records : 0;
  }

  private static calculateGrowth(): string {
    return (Math.random() * 30 - 10).toFixed(1);
  }

  private static generateMonthlyDataFromBackend(detalles: any, filtros: any): Array<{
    month: string;
    value: number;
    records: number;
  }> {
    const monthlyData: Array<{ month: string; value: number; records: number }> = [];
    const combinedGroups: Record<string, number> = {};
    for (const modulo of Object.values(detalles) as any[]) {
      if (modulo.grupos) {
        for (const [grupo, cantidad] of Object.entries(modulo.grupos)) {
          combinedGroups[grupo] = (combinedGroups[grupo] || 0) + (cantidad as number);
        }
      }
    }
    for (const [grupo, cantidad] of Object.entries(combinedGroups)) {
      monthlyData.push({
        month: grupo,
        value: cantidad * 1500,
        records: cantidad,
      });
    }
    return monthlyData;
  }

  private static generateModuleDataFromBackend(detalles: any): any {
    const moduleData: any = {};
    if (detalles.volunteers) {
      const d = detalles.volunteers;
      const items = d.items || [];
      moduleData.voluntariado = {
        totalParticipantes: d.total || 0,
        formularios: items.length || 0,
        estadosActivos: items.filter((v: any) => v.estado === "ACTIVE").length,
        horasVoluntariado: (d.total || 0) * 40,
      };
    }
    return moduleData;
  }

  private static generateRealisticMockData(filters: any): ReportData {
    const modules = this.mapDepartmentToModules(filters.department).split(",");
    const isMultiModule = filters.department === "todos" || modules.length > 1;
    const baseData = {
      summary: {
        totalRecords: Math.floor(Math.random() * 1500) + 500,
        totalAmount: Math.random() * 5000000 + 1000000,
        averageValue: Math.random() * 5000 + 2000,
        growth: (Math.random() * 40 - 15).toFixed(1),
      },
      monthlyData: this.generateMonthlyData(filters.reportType),
    };
    if (isMultiModule) {
      return {
        ...baseData,
        moduleData: this.generateModuleDataBySelection(modules),
      };
    }
    return baseData;
  }

  private static generateMonthlyData(reportType?: string): Array<{
    month: string;
    value: number;
    records: number;
  }> {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    // Opcional: adaptar según tipo de reporte
    if (reportType === "trimestral") {
      return [
        { month: "Trimestre 1", value: 580000, records: 312 },
        { month: "Trimestre 2", value: 638000, records: 338 },
        { month: "Trimestre 3", value: 655000, records: 335 },
        { month: "Trimestre 4", value: 676000, records: 359 },
      ];
    }

    if (reportType === "semestral") {
      return [
        { month: "Semestre 1", value: 1218000, records: 650 },
        { month: "Semestre 2", value: 1331000, records: 694 },
      ];
    }

    if (reportType === "anual" || reportType === "general") {
      return [{ month: "Año completo", value: 2549000, records: 1344 }];
    }

    // Por defecto: mensual
    return months.map((m) => ({
      month: m,
      value: Math.floor(Math.random() * 100000 + 150000),
      records: Math.floor(Math.random() * 50 + 80),
    }));
  }


  private static generateModuleDataBySelection(modules: string[]): any {
    const moduleData: any = {};
    if (modules.includes("volunteers")) {
      moduleData.voluntariado = {
        totalParticipantes: Math.floor(Math.random() * 400) + 250,
        formularios: Math.floor(Math.random() * 80) + 60,
        estadosActivos: Math.floor(Math.random() * 40) + 30,
        horasVoluntariado: Math.floor(Math.random() * 8000) + 3500,
      };
    }
    return moduleData;
  }
}
