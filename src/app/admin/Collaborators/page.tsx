"use client";

import ColaboradoresNav from "@/app/admin/Collaborators/components/ColaboradoresNav";
import CollaboratorsTable from "@/app/admin/Collaborators/components/CollaboratorsTable";

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
