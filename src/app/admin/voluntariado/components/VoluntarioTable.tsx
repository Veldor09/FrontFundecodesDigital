"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Voluntario, Estado } from "../types/voluntario";
import VoluntarioRow from "./VoluntarioRow";
import VoluntarioForm from "./VoluntarioForm";
import { useVoluntarios } from "../hooks/useVoluntarios";
import { Plus, Search } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AsignacionModal from "./AsignacionModal";

type EstadoFiltro = "TODOS" | "ACTIVO" | "INACTIVO";

export default function VoluntarioTable() {
  const { data: rawData, total: rawTotal, loading, save, toggle, remove } = useVoluntarios();

  // Normalización segura del array
  const lista: Voluntario[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData as Voluntario[];
    if (rawData && Array.isArray((rawData as any).data)) return (rawData as any).data as Voluntario[];
    return [];
  }, [rawData]);

  const total: number = useMemo(() => {
    if (typeof rawTotal === "number") return rawTotal;
    return lista.length;
  }, [rawTotal, lista.length]);

  const [modo, setModo] = useState<"crear" | "editar" | null>(null);
  const [voluntarioEditar, setVoluntarioEditar] = useState<Voluntario | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("TODOS");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Control del modal de asignación (fuera de la tabla)
  const [voluntarioAsignar, setVoluntarioAsignar] = useState<Voluntario | null>(null);

  const abrirModalCrear = () => {
    setModo("crear");
    setVoluntarioEditar(null);
  };

  const abrirModalEditar = (v: Voluntario) => {
    setModo("editar");
    setVoluntarioEditar(v);
  };

  const cerrarModal = () => {
    setModo(null);
    setVoluntarioEditar(null);
  };

  const handleGuardar = async (v: Omit<Voluntario, "id"> & { id?: number }) => {
    await save(v as any);
    cerrarModal();
  };

  const filtered: Voluntario[] = useMemo(() => {
    return lista
      .filter((v: Voluntario) =>
        estadoFiltro === "TODOS" ? true : (v.estado?.toUpperCase() as Estado) === estadoFiltro
      )
      .filter((v: Voluntario) =>
        [v.nombreCompleto, v.numeroDocumento, v.email].some((f) =>
          f?.toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [lista, estadoFiltro, search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Voluntarios</h2>
          <p className="text-sm text-slate-500">Crear, editar y administrar voluntarios registrados</p>
        </div>
        <Button onClick={abrirModalCrear} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /> Nuevo Voluntario
        </Button>
      </div>

      {/* Modal de crear/editar */}
      <Modal
        open={modo !== null}
        onClose={cerrarModal}
        title={modo === "crear" ? "Agregar voluntario" : "Editar voluntario"}
      >
        <VoluntarioForm
          initial={voluntarioEditar ?? undefined}
          onSave={handleGuardar}
          onCancel={cerrarModal}
        />
      </Modal>

      {/* Buscador y Filtro */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        {/* Buscador */}
        <div className="flex-1 max-w-lg">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Buscar por nombre, cédula o email
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Ej. María Gómez"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtro por estado — usando <select> nativo */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Filtrar por estado
          </label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value as EstadoFiltro)}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {loading && <p className="text-sm text-slate-500">Cargando voluntarios...</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-slate-500">No se encontraron voluntarios.</p>
      )}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Cédula</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <VoluntarioRow
                  key={`vol-${v.id ?? "noid"}-${i}`}
                  voluntario={v}
                  onEdit={() => abrirModalEditar(v)}
                  onToggle={() =>
                    toggle(v.id, v.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO")
                  }
                  onDelete={() => remove(v.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de asignación: fuera de la tabla */}
      {voluntarioAsignar && (
        <AsignacionModal
          voluntario={voluntarioAsignar}
          open={!!voluntarioAsignar}
          onClose={() => setVoluntarioAsignar(null)}
        />
      )}

      {/* Paginación local (opcional) */}
      <div className="flex justify-between items-center text-sm text-slate-600">
        <span>Mostrando {filtered.length} de {total} voluntarios</span>
        <div className="flex gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <Button size="sm" disabled={page * 10 >= total} onClick={() => setPage(page + 1)}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
