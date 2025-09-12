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
import { Voluntario } from "../types/voluntario";
import VoluntarioRow from "./VoluntarioRow";
import VoluntarioForm from "./VoluntarioForm";
import { useVoluntarios } from "../hooks/useVoluntarios";
import { Plus, Search } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function VoluntarioTable() {
  const { data, total, loading, page, setPage, search, setSearch, refetch, save, toggle, remove } =
    useVoluntarios();

  const [modo, setModo] = useState<"crear" | "editar" | null>(null);
  const [voluntarioEditar, setVoluntarioEditar] = useState<Voluntario | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "activo" | "inactivo">("todos");

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

  const handleGuardar = async (v: Omit<Voluntario, "id"> & { id?: string }) => {
    await save(v);
    cerrarModal();
  };

  const filtered = data.filter((v) =>
    estadoFiltro === "todos" ? true : v.estado === estadoFiltro
  );

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

      {/* Modal */}
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

  {/* Filtro por estado */}
  <div className="w-full sm:w-48">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      Filtrar por estado
    </label>
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
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Área</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <VoluntarioRow
                  key={v.id}
                  voluntario={v}
                  onEdit={() => abrirModalEditar(v)}
                  onToggle={() => toggle(v.id)}
                  onDelete={() => remove(v.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
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