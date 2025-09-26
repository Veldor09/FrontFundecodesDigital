"use client"

import { useState } from "react"
import AccountingNav from "./components/accountingNav"
import { BudgetTable } from "./components/budget-table"
import { TransactionsList } from "./components/transactions-list"
import { DocumentsManager } from "./components/documents-manager"

type ActiveModule = "Presupuestos" | "Transacciones" | "Documentos"

export default function ContabilidadPage() {
  const [activeModule, setActiveModule] = useState<ActiveModule>("Presupuestos")

  const renderActiveModule = () => {
    switch (activeModule) {
      case "Presupuestos":
        return <BudgetTable />
      case "Transacciones":
        return <TransactionsList />
      case "Documentos":
        return <DocumentsManager />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AccountingNav active={activeModule} onChange={setActiveModule} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderActiveModule()}</main>
    </div>
  )
}
