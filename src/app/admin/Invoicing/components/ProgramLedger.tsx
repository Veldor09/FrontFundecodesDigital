// src/app/admin/Invoicing/components/ProgramLedger.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LedgerEvent, ProgramOption } from "../types/billing.types";
import { useProgramLedger, usePrograms } from "../hooks/billing.hooks";
import ProgramSelect from "./ProgramSelect";

type Props = {
  className?: string;
};

function formatDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(+dt)) return "";
  return dt.toLocaleDateString();
}

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProgramLedger({ className }: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Cargamos programas
  const { data: programs } = usePrograms({ refetchOnWindowFocus: false });
  const programOptions: ProgramOption[] = useMemo(
    () =>
      (programs ?? []).map((p) => ({
        id: String(p.id),
        name: p.name ?? (p as any).title ?? String(p.id),
      })),
    [programs]
  );

  // Ledger del programa seleccionado
  const projectNum = selectedProjectId ? Number(selectedProjectId) : undefined;
  const {
    data: ledger,
    isLoading,
    isError,
    refetch,
  } = useProgramLedger(projectNum ?? null, { enabled: !!projectNum, refetchOnWindowFocus: false });

  // Si al cargar hay al menos un programa, seleccionamos el primero
  useEffect(() => {
    if (!selectedProjectId && programOptions.length > 0) {
      setSelectedProjectId(programOptions[0]!.id);
    }
  }, [programOptions, selectedProjectId]);

  const total = useMemo(() => {
    const rows = ledger ?? [];
    return rows.reduce((acc, row) => acc + Number(row.amount || 0), 0);
  }, [ledger]);

  return (
    <div className={`w-full bg-white rounded-2xl shadow ${className ?? ""}`}>
      {/* Header / Filtros */}
      <div className="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">Historial del programa</h2>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* Selector de programa */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Programa</label>
            <ProgramSelect
              programs={programOptions}
              value={selectedProjectId}
              onChange={(v: string) => setSelectedProjectId(v)}
            />
          </div>

          <button
            onClick={() => refetch()}
            className="rounded-md bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm font-medium"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Estado de carga / error */}
      {(!projectNum || isLoading) && (
        <div className="p-6 text-center text-gray-500">
          {!projectNum ? "Selecciona un programa para ver su historial." : "Cargando historial…"}
        </div>
      )}

      {isError && !isLoading && (
        <div className="p-6 text-center text-red-600">
          Ocurrió un error al cargar el historial.
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !isError && projectNum && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3">Detalle</th>
                  <th className="text-right px-4 py-3">Monto</th>
                </tr>
              </thead>
              <tbody>
                {(ledger ?? []).map((row: LedgerEvent, idx: number) => {
                  const date = formatDate(row.date);
                  let type = row.type;
                  let detail = "";
                  let amount = Number(row.amount || 0);

                  if (row.type === "BUDGET") {
                    detail = `Presupuesto ${row.meta.anio ?? ""}${row.meta.mes ? `-${String(row.meta.mes).padStart(2, "0")}` : ""}`.trim();
                  } else if (row.type === "ALLOCATION") {
                    detail = row.meta.concept;
                  } else if (row.type === "INVOICE") {
                    detail = `Factura ${row.meta.number} (${row.meta.currency})${row.meta.valid ? "" : " — inválida"}`;
                  } else if (row.type === "PAYMENT") {
                    detail = `Pago ref. ${row.meta.reference} (${row.meta.currency})`;
                  } else if (row.type === "RECEIPT") {
                    detail = `Recibo ${row.meta.filename}`;
                  }

                  return (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-3">{date}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                          ${
                            row.type === "BUDGET"
                              ? "bg-emerald-100 text-emerald-800"
                              : row.type === "ALLOCATION"
                              ? "bg-amber-100 text-amber-800"
                              : row.type === "INVOICE"
                              ? "bg-blue-100 text-blue-800"
                              : row.type === "PAYMENT"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[520px] truncate" title={detail}>
                          {detail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatMoney(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t bg-gray-50">
                  <td className="px-4 py-3" colSpan={3}>
                    <span className="text-sm font-medium">Total</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatMoney(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {(!ledger || ledger.length === 0) && (
            <div className="p-6 text-center text-gray-500">
              No hay movimientos para este programa.
            </div>
          )}
        </>
      )}
    </div>
  );
}
