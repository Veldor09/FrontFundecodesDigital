// src/app/admin/BillingRequest/page.tsx
"use client";

import { useState } from "react";
import RequestNav, { type RequestTab } from "./components/RequestNav";

import RequestsTable from "./components/RequestsTable";
import AccountantValidationTable from "./components/AccountantValidationTable";
import DirectorApprovalTable from "./components/DirectorApprovalTable";

// PAGO + HISTORIAL
import PaymentTable from "./components/PaymentTable";
import HistoryTable from "./components/HistoryTable"; // ⬅️ nuevo

export default function RequestPage() {
  const [vista, setVista] = useState<RequestTab>("Solicitudes");

  return (
    <>
      <RequestNav active={vista} onChange={setVista} />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {vista === "Solicitudes" && <RequestsTable />}
          {vista === "Validación Contable" && <AccountantValidationTable />}
          {vista === "Aprobación Dirección" && <DirectorApprovalTable />}

          {vista === "Pendientes de pago" && <PaymentTable />}
          {vista === "Historial" && <HistoryTable />} {/* ⬅️ reemplazo */}
        </div>
      </main>
    </>
  );
}
