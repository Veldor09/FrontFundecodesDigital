"use client";

import { Collaborator } from "@/app/admin/Collaborators/types/collaborators.types";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";
import { useState } from "react";
import { Edit, ToggleLeft, Trash } from "lucide-react";

interface Props {
  collaborator: Collaborator;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export default function CollaboratorsRow({ collaborator, onEdit, onToggle, onDelete }: Props) {
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <tr className="border-b hover:bg-slate-50 transition">
        <td className="px-4 py-3 text-slate-800 font-medium">{collaborator.fullName}</td>
        <td className="px-4 py-3 text-slate-600">{collaborator.email}</td>
        <td className="px-4 py-3 text-slate-600">{collaborator.phone}</td>
        <td className="px-4 py-3 text-slate-600">{collaborator.role}</td>
        <td className="px-4 py-3 text-slate-600">{collaborator.identification}</td>
        <td className="px-4 py-3 text-slate-600">
          {collaborator.birthdate ? new Date(collaborator.birthdate).toLocaleDateString() : "—"}
        </td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              collaborator.status === "ACTIVO"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {collaborator.status === "ACTIVO" ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td className="px-4 py-3 flex gap-2">
          <Button size="icon" variant="ghost" onClick={onEdit} className="text-blue-600 hover:text-blue-800">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setConfirmToggle(true)}
            className="text-amber-600 hover:text-amber-800"
          >
            <ToggleLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </td>
      </tr>

      <ConfirmDialog
        open={confirmToggle}
        onOpenChange={setConfirmToggle}
        title="¿Cambiar estado?"
        description={`El colaborador pasará a estar ${
          collaborator.status === "ACTIVO" ? "inactivo" : "activo"
        }.`}
        onConfirm={() => {
          onToggle();
          setConfirmToggle(false);
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="¿Eliminar colaborador?"
        description="Esta acción no se puede deshacer."
        onConfirm={() => {
          onDelete();
          setConfirmDelete(false);
        }}
      />
    </>
  );
}