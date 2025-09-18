"use client";

import { useState } from "react";
import { useCollaborators } from "../hooks/useCollaborators";
import { Collaborator } from "../types/collaborators.types";
import AddCollaboratorModal from "./AddCollaboratorModal";
import CollaboratorsRow from "./CollaboratorsRow";
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

export default function CollaboratorsTable() {
  const {
    data: items,
    total,
    loading,
    page,
    setPage,
    search,
    setSearch,
    estado,
    setEstado,
    save,
    toggle,
    remove,
  } = useCollaborators();

  const [modo, setModo] = useState<"crear" | "editar" | null>(null);
  const [colaboradorEditar, setColaboradorEditar] = useState<Collaborator | null>(null);

  const abrirModalCrear = () => {
    setModo("crear");
    setColaboradorEditar(null);
  };

  const abrirModalEditar = (c: Collaborator) => {
    setModo("editar");
    setColaboradorEditar(c);
  };

  const cerrarModal = () => {
    setModo(null);
    setColaboradorEditar(null);
  };

  const handleGuardar = async (c: Omit<Collaborator, "id"> & { id?: number | string }) => {
    await save(c);
    cerrarModal();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Colaboradores</h2>
          <p className="text-sm text-slate-500">Crear, editar y administrar colaboradores registrados</p>
        </div>
        <Button onClick={abrirModalCrear} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /> Añadir Colaborador
        </Button>
      </div>

      {/* Modal */}
      <AddCollaboratorModal
        open={modo !== null}
        onClose={cerrarModal}
        onCreated={() => {
          setPage(1);
        }}
      />

      {/* Buscador y Filtro */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="flex-1 max-w-lg">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Buscar por nombre, correo o identificación
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

        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">Filtrar por estado</label>
          <Select value={estado} onValueChange={(v) => setEstado(v as typeof estado)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="ACTIVO">Activo</SelectItem>
              <SelectItem value="INACTIVO">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      {loading && <p className="text-sm text-slate-500">Cargando colaboradores...</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-slate-500">No se encontraron colaboradores.</p>
      )}
      {!loading && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Correo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Rol/Área</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Identificación</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nacimiento</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <CollaboratorsRow
                  key={c.id}
                  collaborator={c}
                  onEdit={() => abrirModalEditar(c)}
                  onToggle={() => toggle(c.id)}
                  onDelete={() => remove(c.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-between items-center text-sm text-slate-600">
        <span>Mostrando {items.length} de {total} colaboradores</span>
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