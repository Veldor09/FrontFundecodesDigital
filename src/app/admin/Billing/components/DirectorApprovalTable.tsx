"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ✅ Tipos (seguimos usando Program desde tus types)
import type { Program, PurchaseRequest } from "../types/billing.types";

/* ======================================================
   ALERTA LOCAL (reemplaza toasts)
   ====================================================== */
function LocalAlert({
  kind,
  text,
  onClose,
}: {
  kind: "success" | "error";
  text: string;
  onClose: () => void;
}) {
  const base =
    "flex items-start gap-2 rounded-md border px-3 py-2 text-sm";
  const styles =
    kind === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-red-50 border-red-200 text-red-800";

  return (
    <div className={`${base} ${styles}`}>
      <div className="font-medium">{kind === "success" ? "Éxito" : "Error"}</div>
      <div className="flex-1">{text}</div>
      <button className="text-inherit opacity-70 hover:opacity-100" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

/* ======================================================
   MODAL PARA OBSERVACIONES
   ====================================================== */
function NoteModal({
  open,
  title,
  placeholder = "Observaciones (opcional)",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="p-4 space-y-3">
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={4}
            value={note}
            placeholder={placeholder}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              onClick={() => onConfirm(note)}
              disabled={loading}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   DATOS QUEMADOS (Programas y Solicitudes)
   ====================================================== */
const PROGRAMS: Program[] = [
  { id: "P-001", name: "Reforestación Nicoya 2025" } as Program,
  { id: "P-002", name: "Educación Ambiental Comunidades" } as Program,
  { id: "P-003", name: "Senderos y Señalética" } as Program,
  { id: "P-004", name: "Vivero Forestal Regional" } as Program,
];

type MinimalRequest = Pick<PurchaseRequest, "id" | "concept" | "amount"> & {
  programId: string;
  status?: string;
};

const VALIDATED_REQUESTS: MinimalRequest[] = [
  { id: "REQ-001", concept: "Insumos para vivero", programId: "P-004", amount: 385000, status: "validated" },
  { id: "REQ-002", concept: "Herramientas de sendero", programId: "P-003", amount: 210000, status: "validated" },
  { id: "REQ-003", concept: "Capacitaciones escolares", programId: "P-002", amount: 150000, status: "validated" },
  { id: "REQ-004", concept: "Plántulas nativas", programId: "P-001", amount: 720000, status: "validated" },
  { id: "REQ-005", concept: "Guantes y palas", programId: "P-003", amount: 98000, status: "validated" },
  { id: "REQ-006", concept: "Impresión de material", programId: "P-002", amount: 64000, status: "validated" },
];

/* ======================================================
   COMPONENTE PRINCIPAL (sin useToast ni BillingApi)
   ====================================================== */
export default function DirectorApprovalTable() {
  // 🔔 Alerta local
  const [alert, setAlert] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [items, setItems] = useState<MinimalRequest[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // modales de nota
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Cargar datos quemados
  const fetchData = () => {
    setLoading(true);
    // Si querés simular delay, podés envolver en setTimeout
    setPrograms(PROGRAMS);
    setItems(VALIDATED_REQUESTS);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const programName = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of programs) map.set(p.id, (p as any).name ?? p.id);
    return (pid?: string) => (pid ? map.get(pid) ?? pid : "—");
  }, [programs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      [r.concept, programName(r.programId)].some((t) =>
        (t ?? "").toLowerCase().includes(q)
      )
    );
  }, [items, search, programName]);

  const openApprove = (id: string) => {
    setCurrentId(id);
    setApproveOpen(true);
  };

  const openReject = (id: string) => {
    setCurrentId(id);
    setRejectOpen(true);
  };

  const doApprove = async (_note: string) => {
    if (!currentId) return;
    try {
      setBusy(true);
      setLoadingAction(currentId);

      // Como es demo sin backend: quitamos la solicitud de la lista
      setItems((prev) => prev.filter((r) => r.id !== currentId));

      setApproveOpen(false);
      setCurrentId(null);
      setAlert({ kind: "success", text: "Solicitud aprobada por dirección." });
    } catch {
      setAlert({ kind: "error", text: "No se pudo aprobar la solicitud." });
    } finally {
      setBusy(false);
      setLoadingAction(null);
    }
  };

  const doReject = async (_note: string) => {
    if (!currentId) return;
    try {
      setBusy(true);
      setLoadingAction(currentId);

      // Demo sin backend: quitamos la solicitud de la lista
      setItems((prev) => prev.filter((r) => r.id !== currentId));

      setRejectOpen(false);
      setCurrentId(null);
      setAlert({ kind: "success", text: "Solicitud rechazada." });
    } catch {
      setAlert({ kind: "error", text: "No se pudo rechazar la solicitud." });
    } finally {
      setBusy(false);
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Alerta local */}
      {alert && (
        <LocalAlert
          kind={alert.kind}
          text={alert.text}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Aprobación de Solicitudes</h2>
          <p className="text-sm text-slate-500">Solicitudes validadas por contabilidad</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Buscar por concepto o programa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No hay solicitudes validadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Concepto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Programa</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">{r.id}</td>
                  <td className="px-4 py-3">{r.concept}</td>
                  <td className="px-4 py-3">{programName(r.programId)}</td>
                  <td className="px-4 py-3">₡{r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => openApprove(r.id)}
                        disabled={loadingAction === r.id}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {loadingAction === r.id ? "Aprobando..." : "Aprobar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-300 hover:bg-red-50"
                        onClick={() => openReject(r.id)}
                        disabled={loadingAction === r.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de nota para aprobar */}
      <NoteModal
        open={approveOpen}
        title="Aprobar solicitud"
        placeholder="Observaciones para la aprobación (opcional)"
        confirmText="Aprobar"
        onConfirm={doApprove}
        onClose={() => setApproveOpen(false)}
        loading={busy}
      />

      {/* Modal de nota para rechazar */}
      <NoteModal
        open={rejectOpen}
        title="Rechazar solicitud"
        placeholder="Indique el motivo del rechazo"
        confirmText="Rechazar"
        onConfirm={doReject}
        onClose={() => setRejectOpen(false)}
        loading={busy}
      />
    </div>
  );
}
