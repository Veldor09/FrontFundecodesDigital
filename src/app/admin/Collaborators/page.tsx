"use client";

import { useState } from "react";
import ColaboradoresNav from "@/app/admin/Collaborators/components/ColaboradoresNav";
import CollaboratorsTable from "@/app/admin/Collaborators/components/CollaboratorsTable";
import AsignacionesPanel from "@/app/admin/Collaborators/components/AsignacionesPanel";

type ActiveTab = "colaboradores" | "asignaciones";

export default function Page() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("colaboradores");

  return (
    <main className="min-h-screen bg-slate-50">
      <ColaboradoresNav />
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab("colaboradores")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "colaboradores"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Colaboradores
          </button>
          <button
            onClick={() => setActiveTab("asignaciones")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "asignaciones"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Asignación de proyectos
          </button>
        </div>

        {activeTab === "colaboradores" && <CollaboratorsTable />}
        {activeTab === "asignaciones" && <AsignacionesPanel />}
      </div>
    </main>
  );
}
