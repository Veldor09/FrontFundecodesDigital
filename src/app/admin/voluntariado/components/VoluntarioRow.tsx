"use client";

import { Voluntario } from "../types/voluntario";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  onToggle: () => void; // cambia ACTIVO <-> INACTIVO
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
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            isActivo
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          {isActivo ? "Activo" : "Inactivo"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Switch
            checked={isActivo}
            onCheckedChange={onToggle}
            aria-label={isActivo ? "Desactivar voluntario" : "Activar voluntario"}
            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-400"
          />

          <Button
            type="button"
            size="sm"
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Editar
          </Button>

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
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  el registro del voluntario{" "}
                  <strong>{voluntario.nombreCompleto}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
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