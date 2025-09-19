"use client";

import { useMemo, useState } from "react";
import { useVoluntarios } from "../hooks/useVoluntarios";
import { useProyectos } from "../hooks/useProyectos";
import { Voluntario } from "../types/voluntario";
import { Proyecto } from "../types/proyecto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search } from "lucide-react";

type EstadoFiltro = "todos" | "activo" | "inactivo";
type FiltroAsignacion = "todos" | "asignados" | "sin-asignar";
type FiltroArea = "todas" | string;

export default function ProyectosAsignacionPage() {
  const { data: voluntariosRaw } = useVoluntarios();

  // Tu hook expone: { data, assign, unassign }
  const { data: proyectos, assign, unassign } = useProyectos();

  // Normaliza voluntarios
  const voluntarios: Voluntario[] = useMemo(() => {
    if (Array.isArray(voluntariosRaw)) return voluntariosRaw as Voluntario[];
    if (voluntariosRaw && Array.isArray((voluntariosRaw as any).data))
      return (voluntariosRaw as any).data as Voluntario[];
    return [];
  }, [voluntariosRaw]);

  // Filtros locales
  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState<EstadoFiltro>("todos");
  const [fArea, setFArea] = useState<FiltroArea>("todas");
  const [fAsignacion, setFAsignacion] = useState<FiltroAsignacion>("todos");

  const proyectosActivos = useMemo(
    () => proyectos.filter((p) => p.estado === "activo"),
    [proyectos]
  );
  const countProyectosActivos = proyectosActivos.length;
  const countVoluntariosActivos = voluntarios.filter((v) => v.estado === "ACTIVO").length;

  // Mapa: voluntarioId -> proyectos asignados
  const asignacionesPorVoluntario: Record<number, Proyecto[]> = useMemo(() => {
    const map: Record<number, Proyecto[]> = {};
    for (const v of voluntarios) map[(v as any).id as number] = [];
    for (const p of proyectos) {
      for (const vid of p.voluntariosAsignados || []) {
        if (!map[vid]) map[vid] = [];
        map[vid].push(p);
      }
    }
    return map;
  }, [voluntarios, proyectos]);

  const totalAsignaciones = useMemo(
    () => proyectos.reduce((acc, p) => acc + (p.voluntariosAsignados?.length || 0), 0),
    [proyectos]
  );

  const sinAsignar = useMemo(
    () =>
      voluntarios.filter(
        (v) => (asignacionesPorVoluntario[(v as any).id as number] || []).length === 0
      ).length,
    [voluntarios, asignacionesPorVoluntario]
  );

  const areasDisponibles = useMemo(() => {
    const set = new Set<string>();
    proyectos.forEach((p) => set.add(p.area));
    return Array.from(set);
  }, [proyectos]);

  const filteredVols = useMemo(() => {
    return voluntarios
      .filter((v) => (fEstado === "todos" ? true : v.estado.toLowerCase() === fEstado))
      .filter((v) => {
        if (fAsignacion === "todos") return true;
        const count = (asignacionesPorVoluntario[(v as any).id as number] || []).length;
        return fAsignacion === "asignados" ? count > 0 : count === 0;
      })
      .filter((v) => {
        if (fArea === "todas") return true;
        const proyectosV = asignacionesPorVoluntario[(v as any).id as number] || [];
        return proyectosV.some((p) => p.area === fArea);
      })
      .filter((v) =>
        [v.nombreCompleto, v.numeroDocumento, v.email].some((f) =>
          f?.toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [voluntarios, fEstado, fAsignacion, fArea, search, asignacionesPorVoluntario]);

  // ⬇️ Selección por fila: guardamos el id de proyecto como STRING
  const [seleccionProyecto, setSeleccionProyecto] = useState<Record<number, string>>({});

  const handleAsignar = async (vol: Voluntario) => {
    const vid = (vol as any).id as number;
    const pidStr = seleccionProyecto[vid]; // string | undefined
    if (!pidStr) {
      toast.error("Selecciona un proyecto para asignar");
      return;
    }
    try {
      // Forzamos strings porque tu hook/servicio construye URLs
      await assign(String(vid), String(pidStr));
      toast.success("Voluntario asignado");
      setSeleccionProyecto((prev) => ({ ...prev, [vid]: "" }));
    } catch (e) {
      toast.error("No se pudo asignar");
      console.error(e);
    }
  };

  const handleDesasignar = async (volId: number, proyectoId: number | string) => {
    try {
      // Igualamos a string por seguridad (URLs)
      await unassign(String(volId), String(proyectoId));
      toast.success("Asignación eliminada");
    } catch (e) {
      toast.error("No se pudo eliminar la asignación");
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Gestión de Voluntarios en Proyectos
          </h1>
          <p className="text-slate-500 text-sm">
            Visualiza y asigna voluntarios a proyectos activos
          </p>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-slate-500 text-sm">Proyectos Activos</div>
            <div className="text-3xl font-bold mt-1">{countProyectosActivos}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-slate-500 text-sm">Voluntarios Activos</div>
            <div className="text-3xl font-bold mt-1">{countVoluntariosActivos}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-slate-500 text-sm">Asignaciones Totales</div>
            <div className="text-3xl font-bold mt-1">{totalAsignaciones}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-slate-500 text-sm">Sin Asignar</div>
            <div className="text-3xl font-bold mt-1">{sinAsignar}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar voluntarios
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Nombre, cédula, email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado del voluntario
            </label>
            <select
              value={fEstado}
              onChange={(e) => setFEstado(e.target.value as EstadoFiltro)}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="todos">todos</option>
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Área de interés
            </label>
            <select
              value={fArea}
              onChange={(e) => setFArea(e.target.value as FiltroArea)}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="todas">todas</option>
              {areasDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Asignación a proyecto
            </label>
            <select
              value={fAsignacion}
              onChange={(e) => setFAsignacion(e.target.value as FiltroAsignacion)}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="todos">todos</option>
              <option value="asignados">asignados</option>
              <option value="sin-asignar">sin asignar</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Cédula</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Proyectos</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Asignar a</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVols.map((v) => {
                const vid = (v as any).id as number;
                const proyectosV = asignacionesPorVoluntario[vid] || [];
                return (
                  <tr key={vid} className="border-t">
                    <td className="px-4 py-3">{v.nombreCompleto}</td>
                    <td className="px-4 py-3">{v.numeroDocumento}</td>
                    <td className="px-4 py-3">{v.email}</td>
                    <td className="px-4 py-3">{v.telefono ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          v.estado === "ACTIVO"
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {v.estado.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {proyectosV.length === 0 && (
                          <span className="text-slate-400">Sin asignar</span>
                        )}
                        {proyectosV.map((p) => (
                          <span
                            key={`${vid}-${String(p.id)}`}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"
                          >
                            <span className="text-xs">{p.nombre}</span>
                            <button
                              onClick={() => handleDesasignar(vid, p.id)}
                              className="text-xs text-slate-500 hover:text-red-600"
                              title="Quitar"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {v.estado !== "ACTIVO" ? (
                        <span className="text-slate-400 text-xs">Voluntario inactivo</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={seleccionProyecto[vid] ?? ""}
                            onChange={(e) =>
                              setSeleccionProyecto((prev) => ({
                                ...prev,
                                [vid]: e.target.value, // guardamos string
                              }))
                            }
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                          >
                            <option value="">Seleccionar proyecto</option>
                            {proyectosActivos
                              .filter((p) => !(p.voluntariosAsignados || []).includes(vid))
                              .map((p) => (
                                <option key={String(p.id)} value={String(p.id)}>
                                  {p.nombre}
                                </option>
                              ))}
                          </select>
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => handleAsignar(v)}
                            disabled={!seleccionProyecto[vid]}
                          >
                            Asignar
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{/* Acciones adicionales */}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-sm text-slate-600">
          <span>
            Mostrando {filteredVols.length} de {voluntarios.length} voluntarios
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Anterior
            </Button>
            <Button size="sm" variant="outline">
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
