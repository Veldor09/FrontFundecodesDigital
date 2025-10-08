// src/app/admin/Billing/components/AccountantValidationTable.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AccountantRow from "./AccountantRow";
import TextPromptModal from "./TextPromptModal";
import RequestViewModal from "./RequestViewModal";
import {
  fetchSolicitudes,
  validateSolicitud,
  returnSolicitud,
  type SolicitudListItem,
} from "../services/solicitudes.api";

function LocalAlert({
  kind,
  text,
  onClose,
}: {
  kind: "success" | "error";
  text: string;
  onClose: () => void;
}) {
  const base = "flex items-start gap-2 rounded-md border px-3 py-2 text-sm";
  const styles =
    kind === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-red-50 border-red-200 text-red-800";
  return (
    <div className={`${base} ${styles}`}>
      <div className="font-medium">{kind === "success" ? "Éxito" : "Error"}</div>
      <div className="flex-1">{text}</div>
      <button className="opacity-70 hover:opacity-100" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

const normalize = (s?: string | null) => (s ?? "").toString().trim().toUpperCase();

export default function AccountantValidationTable() {
  const ACCOUNTANT_STATES = new Set(["PENDIENTE"]); // solo pendientes

  const RETURN_MIN = 5;
  const RETURN_MAX = 300;

  const [items, setItems] = useState<SolicitudListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");

  // modal devolución
  const [showReturn, setShowReturn] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  // modal detalle
  const [openView, setOpenView] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);

  const openReturn = (id: number) => { setTargetId(id); setShowReturn(true); };
  const closeReturn = () => { setShowReturn(false); setTargetId(null); };

  const openDetails = (id: number) => { setViewId(id); setOpenView(true); };
  const closeDetails = () => { setOpenView(false); setViewId(null); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSolicitudes({ estado: "PENDIENTE" });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setAlert({ kind: "error", text: e instanceof Error ? e.message : "No se pudo cargar." });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      // ✅ Filtramos por el estado de CONTADORA (no por r.estado)
      .filter((r) => ACCOUNTANT_STATES.has(normalize((r as any).estadoContadora)))
      .filter((r) =>
        q ? [r.titulo, r.descripcion].some((t) => (t ?? "").toLowerCase().includes(q)) : true
      );
  }, [items, search]);

  const handleValidate = async (id: number) => {
    try {
      await validateSolicitud(id);
    } finally {
      await load(); // desaparece de la bandeja
      setAlert({ kind: "success", text: "Solicitud validada. Pasó a Dirección." });
    }
  };

  const handleReturnSubmit = async (note: string) => {
    if (targetId == null) return;
    try {
      await returnSolicitud(targetId, note); // -> DEVUELTA
    } finally {
      await load(); // desaparece de la bandeja
      setShowReturn(false);
      setTargetId(null);
      setAlert({ kind: "success", text: "Solicitud devuelta con justificación." });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {alert && <LocalAlert {...alert} onClose={() => setAlert(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Validación de Solicitudes</h2>
          <p className="text-xs text-slate-500">
            Bandeja de contabilidad — solo solicitudes <span className="font-semibold">PENDIENTE</span>.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Buscar por título o descripción"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500">No hay solicitudes pendientes.</p>
      ) : (
        <div className="overflow-x-auto">
          {/* ✅ table-fixed para que títulos larguísimos no rompan el layout */}
          <table className="min-w-full table-fixed text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-20">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-36">Programa</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-28">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-56">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <AccountantRow
                  key={r.id}
                  req={{ id: r.id, concept: r.titulo, program: undefined, amount: null }}
                  onValidate={() => handleValidate(r.id)}
                  onReturnClick={() => openReturn(r.id)}
                  onViewClick={() => openDetails(r.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de justificación: devolver (CONTADORA => DEVUELTA) */}
      <TextPromptModal
        open={showReturn}
        title="Devolver solicitud"
        label="Escribe la justificación de la devolución"
        placeholder="Ej. Falta documento de soporte, monto no coincide, etc."
        minLen={RETURN_MIN}
        maxLen={RETURN_MAX}
        submitText="Devolver"
        onSubmit={handleReturnSubmit}
        onClose={closeReturn}
      />

      {/* Modal de detalle (ver adjuntos, motivo, etc.) */}
      {openView && viewId != null && (
        <RequestViewModal open={openView} solicitudId={viewId} onClose={closeDetails} />
      )}
    </div>
  );
}
