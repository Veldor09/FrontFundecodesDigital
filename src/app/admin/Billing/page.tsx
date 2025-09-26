// src/app/admin/Billing/page.tsx
"use client";

import { useState } from "react";
import BillingNav, { type BillingTab } from "./components/BillingNav";
import RequestsTable from "./components/RequestsTable";
import AccountantValidationTable from "./components/AccountantValidationTable";
import DirectorApprovalTable from "./components/DirectorApprovalTable";
import BillingTable from "./components/BillingTable";
import { ToastProvider } from "./hooks/useToast"; // <-- importa el provider

export default function BillingPage() {
  const [tab, setTab] = useState<BillingTab>("Solicitudes");

  return (
    <ToastProvider>
      <div className="space-y-6">
        <BillingNav active={tab} onChange={setTab} />

        {tab === "Solicitudes" && <RequestsTable />}
        {tab === "Contadora" && <AccountantValidationTable />}
        {tab === "Director" && <DirectorApprovalTable />}
        {tab === "Facturas" && <BillingTable />}
      </div>
    </ToastProvider>
  );
}
