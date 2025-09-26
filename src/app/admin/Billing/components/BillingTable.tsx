"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import BillingRow from "./BillingRow";
import FinalInvoiceModal from "./FinalInvoiceModal";
import { FinalInvoice } from "../types/billing.types";

export default function BillingTable() {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  // ⚠️ Mock temporal, luego se reemplaza con hook/API
  const [invoices, setInvoices] = useState<FinalInvoice[]>([
    {
      id: "1",
      requestId: "req-1001",
      number: "FAC-001",
      date: new Date().toISOString(),
      total: 250000,
      currency: "CRC",
      isValid: true,
    },
  ]);

  const filtered = invoices.filter((f) =>
    f.number.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = () => {
    // Aquí puedes refrescar desde API o añadir un mock nuevo
    setInvoices((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        requestId: "req-100" + (prev.length + 1),
        number: `FAC-00${prev.length + 1}`,
        date: new Date().toISOString(),
        total: 100000,
        currency: "CRC",
        isValid: true,
      },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Facturas finales</h2>
          <p className="text-sm text-slate-500">Lista de facturas registradas</p>
        </div>
        <Button
          onClick={() => setOpenModal(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" /> Nueva Factura
        </Button>
      </div>

      {/* Buscador */}
      <div className="max-w-md">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Buscar factura
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Ej. FAC-001"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-slate-200 rounded-lg">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Número
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Fecha
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Monto
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Estado
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((inv) => (
                <BillingRow
                  key={inv.id}
                  invoice={inv}
                  onView={() => alert("Ver factura " + inv.number)}
                  onDelete={() =>
                    setInvoices((prev) => prev.filter((x) => x.id !== inv.id))
                  }
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-3 text-center text-slate-500"
                >
                  No se encontraron facturas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de nueva factura */}
      <FinalInvoiceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
