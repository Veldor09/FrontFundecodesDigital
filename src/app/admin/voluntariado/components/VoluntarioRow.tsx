"use client";

import { Voluntario } from "../types/voluntario";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
        <div className="flex items-center gap-2">
          {/* Editar: botón azul */}
          <Button
            type="button"
            size="sm"
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Editar
          </Button>

          {/* Cambiar estado: botón ámbar */}
          <Button
            type="button"
            size="sm"
            onClick={onToggle}
            className="bg-amber-500 hover:bg-amber-600 text-white"
            title={isActivo ? "Marcar como inactivo" : "Marcar como activo"}
          >
            {isActivo ? "Desactivar" : "Activar"}
          </Button>

          {/* Eliminar: botón rojo con diálogo de confirmación */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el registro del voluntario <strong>{voluntario.nombreCompleto}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
}