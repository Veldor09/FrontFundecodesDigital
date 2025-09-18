"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import Modal from "@/components/ui/Modal";

import { Proyecto } from "../types/proyecto";
import ProyectoRow from "./ProyectoRow";
import { useProyectos } from "../hooks/useProyectos";
import AsignacionVoluntarios from "./AsignacionVoluntarios"; // <- modal por proyecto

export default function ProyectoTable() {
  const { data: proyectos, loading, assign, unassign, refetch } = useProyectos();

  const [modo, setModo] = useState<"crear" | "editar" | null>(null);
  const [proyectoEditar, setProyectoEditar] = useState<Proyecto | null>(null);

  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "activo" | "inactivo">("todos");
  const [search, setSearch] = useState("");

  // Modal de gestión de voluntarios
  const [proyectoGestion, setProyectoGestion] = useState<Proyecto | null>(null);

  const abrirModalCrear = () => {
    setModo("crear");
    setProyectoEditar(null);
  };
  const abrirModalEditar = (p: Proyecto) => {
    setModo("editar");
    setProyectoEditar(p);
  };
  const cerrarModal = () => {
    setModo(null);
    setProyectoEditar(null);
  };

  const filtered = (proyectos ?? [])
    .filter((p) => (estadoFiltro === "todos" ? true : p.estado === estadoFiltro))
    .filter((p) => [p.nombre, p.area, p.responsable]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
    );

  // Handlers que se pasan al modal de asignación por proyecto
  const handleAsignar = async (proyectoId: string, voluntarioId: string) => {
    await assign(Number(voluntarioId), proyectoId);
    await refetch();
  };
  const handleDesasignar = async (proyectoId: string, voluntarioId: string) => {
    await unassign(Number(voluntarioId), proyectoId);
    await refetch();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Proyectos</h2>
          <p className="text-sm text-slate-500">Crear, editar y administrar proyectos</p>
        </div>
        <Button onClick={abrirModalCrear} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /> Nuevo Proyecto
        </Button>
      </div>

      {/* TODO: Tu <ProyectoForm /> dentro de un <Modal> si lo usas en esta pantalla */}
      {/* <Modal open={modo !== null} onClose={cerrarModal} title={modo === "crear" ? "Agregar proyecto" : "Editar proyecto"}>
          <ProyectoForm initial={proyectoEditar ?? undefined} onSave={...} onCancel={cerrarModal} />
      </Modal> */}

      {/* Buscador y Filtro */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        {/* Buscador */}
        <div className="flex-1 max-w-lg">
          <label className="block text-sm font-medium text-slate-700 mb-1">Buscar por nombre, área o responsable</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Ej. Proyecto Ambiental"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtro por estado */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">Filtrar por estado</label>
          <Select value={estadoFiltro} onValueChange={(v) => setEstadoFiltro(v as typeof estadoFiltro)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      {loading && <p className="text-sm text-slate-500">Cargando proyectos...</p>}
      {!loading && filtered.length === 0 && <p className="text-sm text-slate-500">No se encontraron proyectos.</p>}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Área</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Responsable</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700"># Voluntarios</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: Proyecto) => (
                <ProyectoRow
                  key={String(p.id)}
                  proyecto={p}
                  onEdit={() => abrirModalEditar(p)}
                  onToggle={() => {/* aquí tu toggle proyecto */}}
                  onDelete={() => {/* aquí tu delete proyecto */}}
                  onManageVolunteers={() => setProyectoGestion(p)} // <- abrir modal
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Gestión de voluntarios por proyecto */}
      {proyectoGestion && (
        <AsignacionVoluntarios
          proyecto={proyectoGestion}
          onAsignar={handleAsignar}
          onDesasignar={handleDesasignar}
          onClose={() => setProyectoGestion(null)}
        />
      )}
    </div>
  );
}
