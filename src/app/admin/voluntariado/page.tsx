"use client";

import { useState } from "react";
import VoluntariadoNav from "./components/VoluntariadoNav";
import VoluntarioTable from "./components/VoluntarioTable";
import SancionTable from "./components/SancionTable";

// ✅ Asignación (antes proyectos, ahora programas)
import ProgramasAsignacion from "./programaVoluntariado/page";

// ✅ NUEVO: CRUD de programas (ajusta esta ruta a donde lo creaste)
import ProgramasCrudPage from "./programas/page";

type Vista = "Programas" | "Asignación" | "Voluntarios" | "Sanciones";

export default function VoluntariadoPage() {
  const [vista, setVista] = useState<Vista>("Programas");

  return (
    <>
      <VoluntariadoNav active={vista} onChange={setVista} />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {vista === "Asignación" && <ProgramasAsignacion />}
          {vista === "Programas" && <ProgramasCrudPage />}
          {vista === "Voluntarios" && <VoluntarioTable />}
          {vista === "Sanciones" && <SancionTable />}
        </div>
      </main>
    </>
  );
}