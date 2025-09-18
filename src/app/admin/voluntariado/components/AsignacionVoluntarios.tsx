"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, UserPlus, UserMinus, X } from "lucide-react";
import { Proyecto } from "../types/proyecto";
import { Voluntario } from "../types/voluntario";
import { useVoluntarios } from "../hooks/useVoluntarios";
import Modal from "@/components/ui/Modal";

interface Props {
  proyecto: Proyecto;
  onAsignar: (proyectoId: string, voluntarioId: string) => Promise<void>;
  onDesasignar: (proyectoId: string, voluntarioId: string) => Promise<void>;
  onClose: () => void;
}

export default function AsignacionVoluntarios({
  proyecto,
  onAsignar,
  onDesasignar,
  onClose,
}: Props) {
  const { data: voluntariosRaw } = useVoluntarios();
  const voluntarios: Voluntario[] = (voluntariosRaw as Voluntario[]) ?? [];

  const [asignando, setAsignando] = useState(false);
  const [voluntariosAsignados, setVoluntariosAsignados] = useState<Voluntario[]>([]);
  const [search, setSearch] = useState("");

  const voluntariosDisponibles: Voluntario[] = useMemo(
    () =>
      voluntarios
        .filter(
          (v: Voluntario) =>
            v.estado === "ACTIVO" && !proyecto.voluntariosAsignados.includes(v.id)
        )
        .filter((v: Voluntario) =>
          [v.nombreCompleto, v.email].some((f) =>
            f?.toLowerCase().includes(search.toLowerCase())
          )
        ),
    [voluntarios, proyecto.voluntariosAsignados, search]
  );

  useEffect(() => {
    const asignados = voluntarios.filter((v: Voluntario) =>
      proyecto.voluntariosAsignados.includes(v.id)
    );
    setVoluntariosAsignados(asignados);
  }, [voluntarios, proyecto.voluntariosAsignados]);

  const handleAsignar = async (voluntarioId: string) => {
    setAsignando(true);
    try {
      await onAsignar(proyecto.id, voluntarioId);
      toast.success("Voluntario asignado correctamente");
    } catch (error) {
      toast.error("Error al asignar voluntario");
      console.error(error);
    } finally {
      setAsignando(false);
    }
  };

  const handleDesasignar = async (voluntarioId: string) => {
    setAsignando(true);
    try {
      await onDesasignar(proyecto.id, voluntarioId);
      toast.success("Voluntario desasignado correctamente");
    } catch (error) {
      toast.error("Error al desasignar voluntario");
      console.error(error);
    } finally {
      setAsignando(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Gestión de Voluntarios">
      {/* Ancho controlado dentro */}
      <div className="max-w-4xl w-full space-y-6">
        {/* Info del proyecto */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900">{proyecto.nombre}</h3>
          <p className="text-sm text-blue-700 mt-1">{proyecto.descripcion}</p>
          <div className="flex items-center gap-2 mt-2">
            {proyecto.area && (
              <Badge className="bg-blue-100 text-blue-800">Área: {proyecto.area}</Badge>
            )}
            <Badge className="bg-gray-100 text-gray-800">
              {voluntariosAsignados.length} voluntario
              {voluntariosAsignados.length !== 1 ? "s" : ""} asignado
              {voluntariosAsignados.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Voluntarios Asignados */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Voluntarios Asignados ({voluntariosAsignados.length})
          </h4>

          {voluntariosAsignados.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <UserMinus className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p>No hay voluntarios asignados a este proyecto</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {voluntariosAsignados.map((vol: Voluntario) => (
                <div
                  key={vol.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-green-900">{vol.nombreCompleto}</div>
                    <div className="text-sm text-green-700">{vol.email}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDesasignar(String(vol.id))}
                    disabled={asignando}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <UserMinus className="h-3 w-3 mr-1" />
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buscador de Voluntarios Disponibles */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">
            Voluntarios Disponibles ({voluntariosDisponibles.length})
          </h4>

          <div className="mb-3">
            <Label className="text-sm text-slate-600 mb-1">
              Buscar voluntarios para asignar
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {voluntariosDisponibles.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <Search className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p>
                {search
                  ? "No se encontraron voluntarios disponibles con ese criterio"
                  : "No hay voluntarios disponibles para asignar"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {voluntariosDisponibles.map((vol: Voluntario) => (
                <div
                  key={vol.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{vol.nombreCompleto}</div>
                    <div className="text-sm text-slate-600">{vol.email}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAsignar(String(vol.id))}
                    disabled={asignando}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Asignar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cerrar */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={asignando}>
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
