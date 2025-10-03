"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DirectorRow from "./DirectorRow";
import TextPromptModal from "./TextPromptModal";
import {
  fetchSolicitudes,
  approveSolicitud,
  rejectSolicitud,
  type SolicitudListItem,
} from "../services/solicitudes";

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

const normalize = (s?: string) => (s ?? "").toString().trim().toUpperCase();

export default function DirectorApprovalTable() {
  const DIRECTOR_STATES = new Set(["VALIDADA"]);

  // límites para motivo de rechazo
  const REJECT_MIN = 5;
  const REJECT_MAX = 300;

  const [items, setItems] = useState<SolicitudListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");

  // modal estado
  const [showReject, setShowReject] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const openReject = (id: number) => { setTargetId(id); setShowReject(true); };
  const closeReject = () => { setShowReject(false); setTargetId(null); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSolicitudes();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setAlert({ kind: "error", text: e instanceof Error ? e.message : "No se pudo cargar." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((r) => DIRECTOR_STATES.has(normalize(r.estado)))
      .filter((r) =>
        q
          ? [r.titulo, r.descripcion].some((t) => (t ?? "").toLowerCase().includes(q))
          : true
      );
  }, [items, search]);

  const openApprove = async (id: number) => {
    try {
      await approveSolicitud(id);
      await load();
      setAlert({ kind: "success", text: "Solicitud aprobada." });
    } catch (e) {
      setAlert({ kind: "error", text: e instanceof Error ? e.message : "No se pudo aprobar." });
    }
  };

  const handleRejectSubmit = async (obs: string) => {
    if (targetId == null) return;
    try {
      await rejectSolicitud(targetId, obs);
      await load();
      setAlert({ kind: "success", text: "Solicitud rechazada." });
    } catch (e) {
      setAlert({ kind: "error", text: e instanceof Error ? e.message : "No se pudo rechazar." });
    } finally {
      closeReject();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {alert && <LocalAlert {...alert} onClose={() => setAlert(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Aprobación de Solicitudes</h2>
          <p className="text-sm text-slate-500">Solicitudes validadas por contabilidad</p>
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
        <p className="text-sm text-slate-500">No hay solicitudes validadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Programa</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <DirectorRow
                  key={r.id}
                  req={{ id: r.id, concept: r.titulo, program: undefined, amount: null }}
                  onApprove={() => openApprove(r.id)}
                  onRejectClick={() => openReject(r.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de motivo: rechazo */}
      <TextPromptModal
        open={showReject}
        title="Rechazar solicitud"
        label="Indique el motivo del rechazo"
        placeholder="Ej. Documentación insuficiente, presupuesto no disponible, etc."
        minLen={REJECT_MIN}
        maxLen={REJECT_MAX}
        submitText="Rechazar"
        onSubmit={handleRejectSubmit}
        onClose={closeReject}
      />
    </div>
  );
}
