"use client";

import { useState } from "react";
import VoluntariadoNav from "./components/VoluntariadoNav";
import VoluntarioTable from "./components/VoluntarioTable";
import ProyectosTable from "./components/ProyectoTable";
import SancionesTable from "./components/SancionesTable";

type Vista = "Voluntarios" | "Proyectos" | "Sanciones";

export default function VoluntariadoPage() {
  const [vista, setVista] = useState<Vista>("Voluntarios");

  return (
    <>
      <VoluntariadoNav active={vista} onChange={setVista} />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {vista === "Voluntarios" && <VoluntarioTable />}
          {vista === "Proyectos" && <ProyectosTable />}
          {vista === "Sanciones" && <SancionesTable />}
        </div>
      </main>
    </>
  );
}