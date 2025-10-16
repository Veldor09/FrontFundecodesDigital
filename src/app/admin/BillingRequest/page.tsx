"use client";

import { useState } from "react";
import RequestNav, { type RequestTab } from "./components/RequestNav";

// Importar las vistas del módulo
import RequestsTable from "./components/RequestsTable";
import AccountantValidationTable from "./components/AccountantValidationTable";
import DirectorApprovalTable from "./components/DirectorApprovalTable";

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
        </div>
      </main>
    </>
  );
}
