"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText, ChevronDown, Loader2 } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

function authHeader(): Record<string, string> {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

interface Props {
  /** Clave(s) de módulo del backend, ej. "volunteers" o "solicitudes,billing" */
  moduloKey: string;
  /** Clave de módulo para exportar la selección actual (útil cuando moduloKey es compuesto) */
  currentModuloKey?: string;
  /** Etiqueta visible del botón */
  label?: string;
  /** Filas actualmente visibles en el módulo (activa la opción "Página actual") */
  currentData?: any[];
  /** Transformación opcional antes de enviar currentData al backend */
  mapCurrentRow?: (row: any) => any;
}

type Formato = "pdf" | "excel";
type LoadingKey = `all-${"pdf" | "excel"}` | `current-${"pdf" | "excel"}` | null;

export default function ModuleExportButton({
  moduloKey,
  currentModuloKey,
  label = "Exportar",
  currentData,
  mapCurrentRow,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loadingKey, setLoadingKey] = useState<LoadingKey>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /** Exporta todos los registros desde el backend */
  async function handleExportAll(formato: Formato) {
    setLoadingKey(`all-${formato}`);
    setOpen(false);
    try {
      const today = new Date().toISOString().split("T")[0];
      const params = new URLSearchParams({
        periodo: "RANGO",
        fechaInicio: "2000-01-01",
        fechaFin: today,
        tipoReporte: "Anual",
        modulos: moduloKey,
        formato,
      });
      const resp = await fetch(`${API_URL}/api/reportes/exportar?${params}`, {
        headers: authHeader(),
      });
      if (!resp.ok) throw new Error("Error al generar el reporte");
      await downloadBlob(resp, `reporte-${moduloKey.replace(/,/g, "-")}`, formato);
    } catch {
      toast.error("Error al generar el reporte. Intenta nuevamente.");
    } finally {
      setLoadingKey(null);
    }
  }

  /** Exporta solo las filas actualmente visibles */
  async function handleExportCurrent(formato: Formato) {
    if (!currentData || currentData.length === 0) {
      toast.warning("No hay datos en la vista actual para exportar.");
      return;
    }
    setLoadingKey(`current-${formato}`);
    setOpen(false);
    try {
      const modulo = currentModuloKey ?? moduloKey;
      const datos = mapCurrentRow ? currentData.map(mapCurrentRow) : currentData;
      const resp = await fetch(`${API_URL}/api/reportes/exportar-seleccion`, {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ modulo, datos, formato }),
      });
      if (!resp.ok) throw new Error("Error al generar el reporte");
      await downloadBlob(resp, `seleccion-${modulo}`, formato);
    } catch {
      toast.error("Error al generar el reporte. Intenta nuevamente.");
    } finally {
      setLoadingKey(null);
    }
  }

  async function downloadBlob(resp: Response, baseName: string, formato: Formato) {
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date().toISOString().split("T")[0];
    a.download = `${baseName}-${today}.${formato === "pdf" ? "pdf" : "xlsx"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const isLoading = loadingKey !== null;
  const hasCurrent = Array.isArray(currentData) && currentData.length > 0;

  function loadingLabel(): string {
    if (!loadingKey) return label;
    if (loadingKey.endsWith("pdf")) return "Generando PDF…";
    return "Generando Excel…";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {loadingLabel()}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 text-sm">
          {hasCurrent && (
            <>
              <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Página actual ({currentData.length})
              </p>
              <button
                type="button"
                onClick={() => handleExportCurrent("pdf")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-red-500" />
                PDF — Página actual
              </button>
              <button
                type="button"
                onClick={() => handleExportCurrent("excel")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Excel — Página actual
              </button>
              <div className="my-1 border-t border-slate-100" />
              <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Todos los registros
              </p>
            </>
          )}
          <button
            type="button"
            onClick={() => handleExportAll("pdf")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-red-500" />
            {hasCurrent ? "PDF — Todos" : "Exportar PDF"}
          </button>
          <button
            type="button"
            onClick={() => handleExportAll("excel")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            {hasCurrent ? "Excel — Todos" : "Exportar Excel"}
          </button>
        </div>
      )}
    </div>
  );
}
