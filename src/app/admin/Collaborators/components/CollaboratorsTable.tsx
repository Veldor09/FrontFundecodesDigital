// src/app/admin/Collaborators/components/CollaboratorsTable.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCollaborators, type Estado } from "../hooks/useCollaborators";
import type { Collaborator as UiCollaborator } from "../types/collaborators.types";

import AddCollaboratorModal from "./AddCollaboratorModal";
import CollaboratorsRow from "./CollaboratorsRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

/* Debounce simple */
function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* Adaptador API -> UI (tolera ES/EN) */
function toUi(x: any): UiCollaborator {
  return {
    id: x.id,
    fullName: x.fullName ?? x.nombreCompleto ?? x.nombre_completo ?? "",
    email: x.email ?? x.correo ?? "",
    phone: x.phone ?? x.telefono ?? null,
    role: x.role ?? x.rol,
    identification: x.identification ?? x.cedula ?? "",
    birthdate: x.birthdate ?? x.fechaNacimiento ?? x.fecha_nacimiento ?? null,
    status: (x.status ?? x.estado) === "INACTIVO" ? "INACTIVO" : "ACTIVO",
  };
}

type EstadoFiltroLocal = "TODOS" | Estado;

export default function CollaboratorsTable() {
  const {
    data: itemsRaw,
    total,
    loading,
    page, setPage,
    pageSize, setPageSize,
    search, setSearch,
    estado, setEstado,        // del hook: "ALL" | "ACTIVO" | "INACTIVO"
    toggle, remove,
  } = useCollaborators();

  const [modo, setModo] = useState<"crear" | "editar" | null>(null);
  const [colaboradorEditar, setColaboradorEditar] = useState<UiCollaborator | null>(null);

  // Estado local para el <select> nativo: "TODOS" | "ACTIVO" | "INACTIVO"
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltroLocal>(
    estado === "ALL" ? "TODOS" : (estado as Estado)
  );

  // Mantener sincronía si algo externo cambia el filtro del hook
  useEffect(() => {
    setEstadoFiltro(estado === "ALL" ? "TODOS" : (estado as Estado));
  }, [estado]);

  const debouncedSearch = useDebouncedValue(search, 400);
  useEffect(() => { setPage(1); }, [debouncedSearch, setPage]);

  const abrirModalCrear = () => { setModo("crear"); setColaboradorEditar(null); };
  const abrirModalEditar = (c: UiCollaborator) => { setModo("editar"); setColaboradorEditar(c); };
  const cerrarModal = () => { setModo(null); setColaboradorEditar(null); };

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page * pageSize < total, [page, pageSize, total]);
  const items = useMemo(() => itemsRaw.map(toUi), [itemsRaw]);

  // Manejar cambio del <select> nativo y mapear a "ALL" | "ACTIVO" | "INACTIVO"
  const handleEstadoChange = (value: EstadoFiltroLocal) => {
    setEstadoFiltro(value);
    const mapped = value === "TODOS" ? "ALL" : value; // map a tipo del hook
    setEstado(mapped as any); // el hook ya hace setPage(1); si no, dejamos el de abajo
    setPage(1);
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

      {/* Modal crear/editar (key fuerza remount y limpia estados) */}
      <AddCollaboratorModal
        key={`${modo ?? "cerrado"}-${colaboradorEditar?.id ?? "nuevo"}`}
        open={modo !== null}
        mode={modo}
        initial={colaboradorEditar}
        onClose={cerrarModal}
        onSaved={(action) => {
          if (action === "created") setPage(1);
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

        {/* Filtro por estado — usando <select> nativo para evitar el bug */}
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Filtrar por estado
          </label>
          <select
            value={estadoFiltro}
            onChange={(e) => handleEstadoChange(e.target.value as EstadoFiltroLocal)}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {loading && <p className="text-sm text-slate-500">Cargando colaboradores...</p>}
      {!loading && items.length === 0 && <p className="text-sm text-slate-500">No se encontraron colaboradores.</p>}
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
              {items.map((c) => {
                const currentEstado: "ACTIVO" | "INACTIVO" =
                  c.status === "INACTIVO" ? "INACTIVO" : "ACTIVO";
                return (
                  <CollaboratorsRow
                    key={c.id}
                    collaborator={c}
                    onEdit={() => abrirModalEditar(c)}
                    onToggle={() => toggle(c.id, currentEstado)}
                    onDelete={() => remove(c.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center text-sm text-slate-600">
        <span>Mostrando {items.length} de {total} colaboradores</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Por página</span>
            <select
              value={String(pageSize)}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="block w-[100px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" disabled={!canPrev} onClick={() => setPage(page - 1)}>Anterior</Button>
            <Button size="sm" disabled={!canNext} onClick={() => setPage(page + 1)}>Siguiente</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
