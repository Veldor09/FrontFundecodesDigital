// src/app/admin/recapitulacion/hooks/use-report-generator.ts
"use client"

import { useState } from "react"
import type { ReportStatus, DateMode, SavedReport } from "../types/report"
import { ReportService } from "../services/report-service"

export function useReportGenerator() {
  const [dateMode, setDateMode] = useState<DateMode>("year")
  const [year, setYear] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [reportType, setReportType] = useState<string>("")
  const [department, setDepartment] = useState<string>("")
  const [status, setStatus] = useState<ReportStatus>("idle")
  const [reportData, setReportData] = useState<SavedReport | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])

  const isFormValid =
    reportType !== "" &&
    department !== "" &&
    (dateMode === "year" ? year !== "" : startDate !== "" && endDate !== "")

  const clearFilters = () => {
    setYear("")
    setStartDate("")
    setEndDate("")
    setReportType("")
    setDepartment("")
    setStatus("idle")
    setReportData(null)
    setErrorMessage("")
    setProgress(0)
  }

  const generateReport = async () => {
    setStatus("generating")
    setErrorMessage("")
    setProgress(0)

    // Simulación de progreso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    const result = await ReportService.generateReport({
      dateMode,
      year,
      startDate,
      endDate,
      reportType,
      category: "general", // Valor por defecto
      department,
    })

    clearInterval(progressInterval)
    setProgress(100)

    if (!result.success) {
      if (result.error === "no-data") {
        setStatus("no-data")
        setReportData(null)
      } else {
        setStatus("error")
        setErrorMessage(result.error || "Error desconocido")
        setReportData(null)
      }
    } else if (result.data) {
      setStatus("success")
      setReportData(result.data)
      setSavedReports((prev) => [result.data!, ...prev])
    }
  }

  const downloadPDF = async () => {
    const fileName = `informe-${reportType}-${dateMode === "year" ? year : `${startDate}-${endDate}`}.pdf`
    await ReportService.downloadPDF(fileName)
  }

  const downloadExcel = async () => {
    const fileName = `informe-${reportType}-${dateMode === "year" ? year : `${startDate}-${endDate}`}.xlsx`
    await ReportService.downloadExcel(fileName)
  }

  const loadReport = (report: SavedReport) => {
    setReportData(report)
    setStatus("success")
    setYear(report.year)
    setReportType(report.reportType)
    setDepartment(report.department || "")
  }

  return {
    // Estados
    dateMode,
    year,
    startDate,
    endDate,
    reportType,
    department,
    status,
    reportData,
    errorMessage,
    progress,
    savedReports,
    isFormValid,
    // Setters
    setDateMode,
    setYear,
    setStartDate,
    setEndDate,
    setReportType,
    setDepartment,
    // Acciones
    clearFilters,
    generateReport,
    downloadPDF,
    downloadExcel,
    loadReport,
  }
}