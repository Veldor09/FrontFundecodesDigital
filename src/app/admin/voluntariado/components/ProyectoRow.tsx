"use client";

import { Proyecto } from "../types/proyecto";
import { Button } from "@/components/ui/button";

interface Props {
  proyecto: Proyecto;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onManageVolunteers: () => void; // <- NUEVO
}

export default function ProyectoRow({
  proyecto,
  onEdit,
  onToggle,
  onDelete,
  onManageVolunteers,
}: Props) {
  return (
    <tr className="border-t">
      <td className="px-4 py-3">{proyecto.nombre}</td>
      <td className="px-4 py-3">{proyecto.area ?? "—"}</td>
      <td className="px-4 py-3">{proyecto.responsable ?? "—"}</td>
      <td className="px-4 py-3 capitalize">{proyecto.estado}</td>
      <td className="px-4 py-3">{proyecto.voluntariosAsignados?.length ?? 0}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            Editar
          </Button>
          <Button size="sm" onClick={onToggle}>
            {proyecto.estado === "activo" ? "Desactivar" : "Activar"}
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            Eliminar
          </Button>
          <Button size="sm" className="bg-blue-600 text-white" onClick={onManageVolunteers}>
            Voluntarios
          </Button>
        </div>
      </td>
    </tr>
  );
}
