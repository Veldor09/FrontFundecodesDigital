"use client";

import { Voluntario } from "../types/voluntario";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";
import { useState } from "react";
import { Edit, ToggleLeft, Trash } from "lucide-react";

interface Props {
  voluntario: Voluntario;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export default function VoluntarioRow({ voluntario, onEdit, onToggle, onDelete }: Props) {
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <tr className="border-b hover:bg-slate-50 transition">
        <td className="px-4 py-3 text-slate-800 font-medium">{voluntario.nombre}</td>
        <td className="px-4 py-3 text-slate-600">{voluntario.cedula}</td>
        <td className="px-4 py-3 text-slate-600">{voluntario.email}</td>
        <td className="px-4 py-3 text-slate-600">{voluntario.telefono}</td>
        <td className="px-4 py-3 text-slate-600">{voluntario.area}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              voluntario.estado === "activo"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {voluntario.estado === "activo" ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td className="px-4 py-3 flex gap-2">
          <Button size="icon" variant="ghost" onClick={onEdit} className="text-blue-600 hover:text-blue-800">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setConfirmToggle(true)} className="text-amber-600 hover:text-amber-800">
            <ToggleLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(true)} className="text-red-600 hover:text-red-800">
            <Trash className="h-4 w-4" />
          </Button>
        </td>
      </tr>

      <ConfirmDialog
        open={confirmToggle}
        onOpenChange={setConfirmToggle}
        title="¿Cambiar estado?"
        description={`El voluntario pasará a estar ${voluntario.estado === "activo" ? "inactivo" : "activo"}.`}
        onConfirm={() => {
          onToggle();
          setConfirmToggle(false);
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="¿Eliminar voluntario?"
        description="Esta acción no se puede deshacer."
        onConfirm={() => {
          onDelete();
          setConfirmDelete(false);
        }}
      />
    </>
  );
}