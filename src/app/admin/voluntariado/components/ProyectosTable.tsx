"use client";

import { areas } from "../types/voluntario";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const proyectosPorArea: Record<string, { nombre: string; estado: "Activo" | "Finalizado" }[]> = {
  "Vida Silvestre": [
    { nombre: "Monitoreo de jaguar", estado: "Activo" },
    { nombre: "Censo de aves migratorias", estado: "Finalizado" },
  ],
  "Conservación Marina": [
    { nombre: "Restauración de arrecifes", estado: "Activo" },
    { nombre: "Limpiando playas", estado: "Activo" },
  ],
  "Educación Ambiental": [
    { nombre: "Talleres escolares", estado: "Finalizado" },
    { nombre: "Charlas comunidad", estado: "Activo" },
  ],
  // agrega más según necesites
};

export default function ProyectosTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Proyectos por Área</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <Card key={area} className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-slate-800">{area}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(proyectosPorArea[area] || []).map((p) => (
                <div key={p.nombre} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{p.nombre}</span>
                  <Badge variant={p.estado === "Activo" ? "default" : "secondary"}>
                    {p.estado}
                  </Badge>
                </div>
              ))}
              {!(proyectosPorArea[area] || []).length && (
                <p className="text-xs text-slate-500">Sin proyectos aún</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}