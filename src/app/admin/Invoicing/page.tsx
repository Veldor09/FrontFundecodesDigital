// src/app/admin/Invoicing/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import BillingNav, { type BillingTab } from "./components/BillingNav";
import { ToastProvider } from "../Request/hooks/useToast";

// Import dinámico para evitar errores de Props obligatorias en el page
const BillingTable: any = dynamic(() => import("./components/BillingTable"), { ssr: false });
const PaymentForm: any = dynamic(() => import("./components/PaymentForm"), { ssr: false });
const ReceiptUploader: any = dynamic(() => import("./components/ReceiptUploader"), { ssr: false });
const ProgramLedger: any = dynamic(() => import("./components/ProgramLedger"), { ssr: false });

export default function InvoicingPage() {
  // Mantiene el layout/diseño original, solo renombradas las tabs
  const [vista, setVista] = useState<BillingTab>("Facturación Final");

  return (
    <ToastProvider>
      <BillingNav active={vista} onChange={setVista} />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {vista === "Facturación Final" && <BillingTable />}
          {vista === "Pagos" && <PaymentForm />}
          {vista === "Recibos" && <ReceiptUploader />}
          {vista === "Historial" && <ProgramLedger />}
        </div>
      </main>
    </ToastProvider>
  );
}
