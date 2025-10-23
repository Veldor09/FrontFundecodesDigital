"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { Project } from "@/lib/projects.types";

type Props = {
  projects: Project[];
  onEdit: (p: Project) => void;
  onDelete: (id: number) => void;
};

export default function ProyectCards({ projects, onEdit, onDelete }: Props) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <Card
          key={p.id}
          className="p-4 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl"
        >
          {p.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.coverUrl}
              alt={p.title}
              className="w-full h-36 object-cover rounded-lg mb-3"
            />
          )}

          {/* Contenedor principal: texto a la izquierda (flex-1) y acciones a la derecha (shrink-0) */}
          <div className="flex flex-row justify-between items-start gap-3">
            {/* Lado izquierdo: título + badges */}
            <div className="flex-1 min-w-0">
              {/* Título: evita que invada el área de botones */}
              <h3 className="font-semibold text-slate-800 break-words truncate">
                {p.title}
              </h3>

              {/* Badges: permiten múltiples líneas y no empujan los botones */}
              <div className="mt-2 flex flex-wrap gap-2">
                {p.place && (
                  <Badge className="inline-block max-w-full whitespace-normal break-words text-left bg-blue-100 text-blue-800 border-blue-200">
                    {p.place}
                  </Badge>
                )}
                {p.category && (
                  <Badge className="inline-block max-w-full whitespace-normal break-words text-left bg-green-100 text-green-800 border-green-200">
                    {p.category}
                  </Badge>
                )}
                {p.area && (
                  <Badge className="inline-block max-w-full whitespace-normal break-words text-left bg-blue-100 text-blue-800 border-blue-200">
                    {p.area}
                  </Badge>
                )}
                {p.status && (
                  <Badge
                    className={`whitespace-nowrap ${
                      p.status === "FINALIZADO"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : p.status === "EN_PROCESO"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {p.status}
                  </Badge>
                )}
                {p.published && (
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                    Publicado
                  </Badge>
                )}
              </div>
            </div>

            {/* Lado derecho: botones fijos */}
            <div className="flex flex-col gap-2 shrink-0 ml-2 self-start">
              <Button
                size="sm"
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                onClick={() => onEdit(p)}
              >
                Editar
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700"
                  >
                    Dar de baja
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará
                      permanentemente el registro del proyecto &quot;
                      {p.title}&quot;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(p.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
