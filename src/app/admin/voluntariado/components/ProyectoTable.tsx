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
import { Badge } from "@/components/ui/badge";
import { Voluntario, Area } from "../types/voluntario";
import { Proyecto } from "../types/proyecto";
import { useVoluntarios } from "../hooks/useVoluntarios";
import { useProyectos } from "../hooks/useProyectos";
import { Search, FolderOpen, UserPlus } from "lucide-react";
import AsignacionModal from "./AsignacionModal";

// Componente para la fila de voluntario con asignación simplificada
function VoluntarioProyectoRow({ 
  voluntario, 
  proyectos, 
  onAsignar
}: {
  voluntario: Voluntario;
  proyectos: Proyecto[];
  onAsignar: () => void;
}) {
  // Obtener proyectos donde ya está asignado
  const proyectosAsignados = proyectos.filter(p => 
    p.voluntariosAsignados.includes(voluntario.id)
  );

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="px-4 py-3 text-sm text-slate-900">{voluntario.nombre}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{voluntario.cedula}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{voluntario.email}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{voluntario.telefono}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{voluntario.area}</td>
      <td className="px-4 py-3">
        <Badge className={`text-xs ${
          voluntario.estado === "activo" 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-red-100 text-red-800 border-red-200"
        }`}>
          {voluntario.estado}
        </Badge>
      </td>
      
      {/* Columna: Proyectos Asignados */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          {proyectosAsignados.length > 0 ? (
            proyectosAsignados.map(p => (
              <Badge key={p.id} className="text-xs bg-blue-100 text-blue-800 border-blue-200 block w-fit">
                {p.nombre}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400">Sin proyectos</span>
          )}
        </div>
      </td>
      
      {/* Columna: Asignar a */}
      <td className="px-4 py-3">
        {voluntario.estado === "activo" ? (
          <span className="text-xs text-slate-500">Usar botón asignar →</span>
        ) : (
          <span className="text-xs text-slate-400">Voluntario inactivo</span>
        )}
      </td>
      
      {/* Columna de acciones simplificada */}
      <td className="px-4 py-3">
        <Button
          size="sm"
          onClick={onAsignar}
          disabled={voluntario.estado === "inactivo"}
          className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          title="Asignar a área y proyecto"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Asignar
        </Button>
      </td>
    </tr>
  );
}

export default function ProyectosTable() {
  // Hooks para voluntarios y proyectos
  const voluntariosHook = useVoluntarios();
  const proyectosHook = useProyectos();
  
  // Modal de asignación
  const [voluntarioAsignar, setVoluntarioAsignar] = useState<Voluntario | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "activo" | "inactivo">("todos");
  const [areaFiltro, setAreaFiltro] = useState<string>("todas");
  const [proyectoFiltro, setProyectoFiltro] = useState<string>("todos");

  // Estados para voluntarios
  const { 
    data: voluntarios, 
    total, 
    loading: loadingVoluntarios, 
    page, 
    setPage, 
    search, 
    setSearch,
    save: saveVoluntario
  } = voluntariosHook;

  // Estados para proyectos
  const { 
    data: proyectos, 
    loading: loadingProyectos,
    asignarVoluntario,
    refetch: refetchProyectos
  } = proyectosHook;

  const abrirModalAsignar = (voluntario: Voluntario) => {
    setVoluntarioAsignar(voluntario);
  };

  const cerrarModalAsignar = () => {
    setVoluntarioAsignar(null);
  };

  const handleAsignarVoluntario = async (voluntarioId: string, area: Area, proyectoId: string) => {
    try {
      await asignarVoluntario(proyectoId, voluntarioId);
      // Refrescar datos
      await voluntariosHook.refetch();
      await refetchProyectos();
    } catch (error) {
      throw error; // El modal manejará el error
    }
  };

  const handleActualizarArea = async (voluntarioId: string, area: Area) => {
    try {
      const voluntario = voluntarios.find(v => v.id === voluntarioId);
      if (voluntario) {
        await saveVoluntario({ ...voluntario, area });
      }
    } catch (error) {
      throw error; // El modal manejará el error
    }
  };

  // Filtrado múltiple
  const filtered = voluntarios.filter((v) => {
    // Filtro por estado
    if (estadoFiltro !== "todos" && v.estado !== estadoFiltro) return false;
    
    // Filtro por área
    if (areaFiltro !== "todas" && v.area !== areaFiltro) return false;
    
    // Filtro por proyecto
    if (proyectoFiltro === "sin-proyectos") {
      const tieneProyectos = proyectos.some(p => p.voluntariosAsignados.includes(v.id));
      if (tieneProyectos) return false;
    } else if (proyectoFiltro !== "todos") {
      const proyecto = proyectos.find(p => p.id === proyectoFiltro);
      if (!proyecto || !proyecto.voluntariosAsignados.includes(v.id)) return false;
    }
    
    return true;
  });

  // Obtener áreas únicas de los voluntarios
  const areasDisponibles = [...new Set(voluntarios.map(v => v.area))].sort();

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestión de Voluntarios en Proyectos</h2>
            <p className="text-sm text-slate-500">Visualiza y asigna voluntarios a proyectos activos</p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Proyectos Activos</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {proyectos.filter(p => p.estado === "activo").length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <span className="text-sm font-medium text-green-900">Voluntarios Activos</span>
            <p className="text-2xl font-bold text-green-800 mt-1">
              {voluntarios.filter(v => v.estado === "activo").length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <span className="text-sm font-medium text-purple-900">Asignaciones Totales</span>
            <p className="text-2xl font-bold text-purple-800 mt-1">
              {proyectos.reduce((sum, p) => sum + p.voluntariosAsignados.length, 0)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <span className="text-sm font-medium text-orange-900">Sin Asignar</span>
            <p className="text-2xl font-bold text-orange-800 mt-1">
              {voluntarios.filter(v => 
                v.estado === "activo" && 
                !proyectos.some(p => p.voluntariosAsignados.includes(v.id))
              ).length}
            </p>
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Buscador */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar voluntarios
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Nombre, cédula, email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado del voluntario
            </label>
            <Select value={estadoFiltro} onValueChange={(v) => setEstadoFiltro(v as typeof estadoFiltro)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">Solo activos</SelectItem>
                <SelectItem value="inactivo">Solo inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por área */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Área de interés
            </label>
            <Select value={areaFiltro} onValueChange={setAreaFiltro}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {areasDisponibles.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por proyecto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Asignación a proyecto
            </label>
            <Select value={proyectoFiltro} onValueChange={setProyectoFiltro}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sin-proyectos">Sin proyectos</SelectItem>
                {proyectos
                  .filter(p => p.estado === "activo")
                  .map(proyecto => (
                    <SelectItem key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {(estadoFiltro !== "todos" || areaFiltro !== "todas" || proyectoFiltro !== "todos" || search) && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-900">Filtros activos:</span>
            {estadoFiltro !== "todos" && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Estado: {estadoFiltro}
              </Badge>
            )}
            {areaFiltro !== "todas" && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Área: {areaFiltro}
              </Badge>
            )}
            {proyectoFiltro === "sin-proyectos" && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Sin proyectos
              </Badge>
            )}
            {proyectoFiltro !== "todos" && proyectoFiltro !== "sin-proyectos" && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Proyecto: {proyectos.find(p => p.id === proyectoFiltro)?.nombre}
              </Badge>
            )}
            {search && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Búsqueda: "{search}"
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEstadoFiltro("todos");
                setAreaFiltro("todas");
                setProyectoFiltro("todos");
                setSearch("");
              }}
              className="text-blue-600 hover:bg-blue-100 h-6 px-2 text-xs"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Tabla */}
        {(loadingVoluntarios || loadingProyectos) && (
          <p className="text-sm text-slate-500">Cargando datos...</p>
        )}
        {!loadingVoluntarios && !loadingProyectos && filtered.length === 0 && (
          <p className="text-sm text-slate-500">No se encontraron voluntarios.</p>
        )}
        {!loadingVoluntarios && !loadingProyectos && filtered.length > 0 && (
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
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Proyectos</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Asignar a</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <VoluntarioProyectoRow
                    key={v.id}
                    voluntario={v}
                    proyectos={proyectos}
                    onAsignar={() => abrirModalAsignar(v)}
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

      {/* Modal de Asignación */}
      {voluntarioAsignar && (
        <AsignacionModal
          voluntario={voluntarioAsignar}
          proyectos={proyectos}
          open={true}
          onClose={cerrarModalAsignar}
          onAsignar={handleAsignarVoluntario}
          onActualizarArea={handleActualizarArea}
        />
      )}
    </>
  );
}