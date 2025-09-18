"use client";

import { Voluntario } from "../types/voluntario";
import { Button } from "@/components/ui/button";
import { SquarePen, ToggleLeft, Trash } from "lucide-react";

interface Props {
  voluntario: Voluntario;
  onEdit: () => void;
  onToggle: () => void;   // cambia ACTIVO <-> INACTIVO
  onDelete: () => void;
}

export default function VoluntarioRow({
  voluntario,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  const isActivo = voluntario.estado === "ACTIVO";

  return (
    <tr className="border-b border-slate-200">
      <td className="px-4 py-3">{voluntario.nombreCompleto}</td>
      <td className="px-4 py-3">{voluntario.numeroDocumento}</td>
      <td className="px-4 py-3">{voluntario.email}</td>
      <td className="px-4 py-3">{voluntario.telefono ?? "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            isActivo ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
          }`}
        >
          {isActivo ? "Activo" : "Inactivo"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Editar: icono azul con trazo */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Editar"
            onClick={onEdit}
            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
          >
            <SquarePen className="h-5 w-5" strokeWidth={2.2} />
          </Button>

          {/* Cambiar estado: icono toggle ámbar */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title={isActivo ? "Marcar como inactivo" : "Marcar como activo"}
            onClick={onToggle}
            className="h-8 w-8 text-amber-500 hover:bg-amber-50"
          >
            <ToggleLeft
              className={`h-5 w-5 transition-transform ${
                isActivo ? "" : "rotate-180"
              }`}
              strokeWidth={2.2}
            />
          </Button>

          {/* Eliminar: icono rojo con trazo */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Eliminar"
            onClick={onDelete}
            className="h-8 w-8 text-red-600 hover:bg-red-50"
          >
            <Trash className="h-5 w-5" strokeWidth={2.2} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
