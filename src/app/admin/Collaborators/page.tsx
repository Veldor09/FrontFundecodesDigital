"use client";

import ColaboradoresNav from "@/components/collaborators/ColaboradoresNav";
import CollaboratorsTable from "@/components/collaborators/CollaboratorsTable";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ColaboradoresNav />
      <div className="p-6 max-w-7xl mx-auto">
        <CollaboratorsTable />
      </div>
    </main>
  );
}
