"use client";

import { useState } from "react";
import { Edit, ToggleLeft, ToggleRight, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "./ConfirmDialog";
import { Collaborator } from "@/app/admin/Collaborators/types/collaborators.types";

interface Props {
  collaborator: Collaborator;
  onEdit: () => void;
  /** Puede ser sync o async */
  onToggle: () => void | Promise<void>;
  /** Puede ser sync o async */
  onDelete: () => void | Promise<void>;
}

export default function CollaboratorsRow({
  collaborator,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<"none" | "toggle" | "delete">("none");

  const isActive = collaborator.status === "ACTIVO";

  const exec = async (
    kind: "toggle" | "delete",
    fn: () => void | Promise<void>
  ) => {
    if (busy !== "none") return;
    setBusy(kind);
    try {
      await Promise.resolve(fn());
    } finally {
      setBusy("none");
    }
  };

  return (
    <>
      <tr
        className={`border-b hover:bg-slate-50 transition ${
          busy !== "none" ? "opacity-60 pointer-events-none" : ""
        }`}
        data-busy={busy !== "none"}
      >
        <td className="px-4 py-3 text-slate-800 font-medium">
          {collaborator.fullName}
        </td>
        <td className="px-4 py-3 text-slate-600">{collaborator.email}</td>
        <td className="px-4 py-3 text-slate-600">
          {collaborator.phone ?? "—"}
        </td>
        <td className="px-4 py-3 text-slate-600">{collaborator.role}</td>
        <td className="px-4 py-3 text-slate-600">
          {collaborator.identification}
        </td>
        <td className="px-4 py-3 text-slate-600">
          {collaborator.birthdate
            ? new Date(collaborator.birthdate).toLocaleDateString()
            : "—"}
        </td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </span>
        </td>

        <td className="px-4 py-3 flex gap-2">
          {/* Editar */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            title="Editar colaborador"
            aria-label="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>

          {/* Activar/Inactivar */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setConfirmToggle(true)}
            title={isActive ? "Inactivar colaborador" : "Activar colaborador"}
            aria-label={isActive ? "Inactivar" : "Activar"}
            className={
              isActive
                ? "text-amber-600 hover:text-amber-800"
                : "text-green-600 hover:text-green-800"
            }
            disabled={busy !== "none"}
          >
            {isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Eliminar */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            title="Eliminar colaborador"
            aria-label="Eliminar"
            className="text-red-600 hover:text-red-800"
            disabled={busy !== "none"}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </td>
      </tr>

      {/* Confirmar toggle */}
      <ConfirmDialog
        open={confirmToggle}
        onOpenChange={setConfirmToggle}
        title="¿Cambiar estado?"
        description={`El colaborador pasará a estar ${
          isActive ? "inactivo" : "activo"
        }.`}
        confirmText={isActive ? "Inactivar" : "Activar"}
        onConfirm={() => {
          setConfirmToggle(false);
          exec("toggle", onToggle);
        }}
      />

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="¿Eliminar colaborador?"
        description="Esta acción no se puede deshacer."
        confirmVariant="destructive"
        onConfirm={() => {
          setConfirmDelete(false);
          exec("delete", onDelete);
        }}
      />
    </>
  );
}
