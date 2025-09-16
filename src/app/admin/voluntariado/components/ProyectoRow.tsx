"use client";

import { Proyecto } from "../types/proyecto";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Power, Trash2, Users } from "lucide-react";

interface Props {
  proyecto: Proyecto;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onManageVolunteers: () => void;
}

export default function ProyectoRow({ proyecto, onEdit, onToggle, onDelete, onManageVolunteers }: Props) {
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "activo": return "bg-green-100 text-green-800 border-green-200";
      case "inactivo": return "bg-red-100 text-red-800 border-red-200";
      case "finalizado": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return "No definida";
    return new Date(fecha).toLocaleDateString('es-CR');
  };

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-slate-900">{proyecto.nombre}</div>
          <div className="text-xs text-slate-500 mt-1 line-clamp-2">
            {proyecto.descripcion}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600">{proyecto.area}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600">{proyecto.responsable}</span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-600">
          <div>Inicio: {formatFecha(proyecto.fechaInicio)}</div>
          {proyecto.fechaFin && (
            <div>Fin: {formatFecha(proyecto.fechaFin)}</div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${getBadgeColor(proyecto.estado)}`}>
            {proyecto.estado}
          </Badge>
          <span className="text-xs text-slate-500">
            ({proyecto.voluntariosAsignados.length} vol.)
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="h-8 w-8 p-0 hover:bg-blue-100"
            title="Editar proyecto"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onManageVolunteers}
            className="h-8 w-8 p-0 hover:bg-purple-100"
            title="Gestionar voluntarios"
          >
            <Users className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className={`h-8 w-8 p-0 ${
              proyecto.estado === "activo" 
                ? "hover:bg-red-100" 
                : "hover:bg-green-100"
            }`}
            title={proyecto.estado === "activo" ? "Desactivar" : "Activar"}
            disabled={proyecto.estado === "finalizado"}
          >
            <Power className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 p-0 hover:bg-red-100"
            title="Eliminar proyecto"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}