"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, X, FolderOpen, ChevronDown, Check } from "lucide-react";
import { Voluntario } from "../types/voluntario";
import Modal from "@/components/ui/Modal";
import { Listbox, Transition } from "@headlessui/react";
import { useProyectos } from "../hooks/useProyectos";

interface Props {
  voluntario: Voluntario;
  open: boolean;
  onClose: () => void;
}

export default function AsignacionModal({ voluntario, open, onClose }: Props) {
  const { data: proyectos, loading, assign, refetch } = useProyectos();
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>("");
  const [guardando, setGuardando] = useState(false);

  const proyectosDisponibles = useMemo(
    () =>
      (proyectos ?? []).filter(
        (p) => p.estado === "activo" && !p.voluntariosAsignados.includes(voluntario.id)
      ),
    [proyectos, voluntario.id]
  );

  const proyectosAsignados = useMemo(
    () => (proyectos ?? []).filter((p) => p.voluntariosAsignados.includes(voluntario.id)),
    [proyectos, voluntario.id]
  );

  const handleGuardar = async () => {
    if (!proyectoSeleccionado) {
      toast.error("Debes seleccionar un proyecto");
      return;
    }
    setGuardando(true);
    try {
      await assign(voluntario.id, proyectoSeleccionado);
      toast.success("Voluntario asignado correctamente");
      await refetch();
      onClose();
    } catch (error) {
      toast.error("Error al asignar voluntario");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Asignar Voluntario a Proyecto">
      {/* Controla el ancho dentro del contenido */}
      <div className="max-w-2xl w-full space-y-6">
        {/* Info del voluntario */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900">{voluntario.nombreCompleto}</h3>
          <p className="text-sm text-blue-700">{voluntario.email}</p>
        </div>

        {/* Proyectos ya asignados */}
        {proyectosAsignados.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Proyectos asignados actualmente:</h4>
            <div className="space-y-2">
              {proyectosAsignados.map((p) => (
                <div key={p.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-medium text-green-900">{p.nombre}</div>
                  <div className="text-sm text-green-700">{p.descripcion}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selección de proyecto */}
        <div>
          <Label className="text-slate-700 flex items-center gap-2 mb-2">
            <FolderOpen className="h-4 w-4" />
            Asignar a Proyecto
          </Label>
          {loading ? (
            <div className="text-sm text-slate-500">Cargando proyectos...</div>
          ) : proyectosDisponibles.length === 0 ? (
            <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p>No hay proyectos disponibles para asignar</p>
            </div>
          ) : (
            <Listbox value={proyectoSeleccionado} onChange={setProyectoSeleccionado}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-md border border-input bg-background py-2 pl-3 pr-10 text-left text-sm focus:outline-none">
                  <span className="block truncate">
                    {proyectoSeleccionado
                      ? proyectosDisponibles.find((p) => String(p.id) === String(proyectoSeleccionado))?.nombre
                      : "Seleccionar proyecto"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </span>
                </Listbox.Button>
                <Transition leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                    {proyectosDisponibles.map((proyecto) => (
                      <Listbox.Option
                        key={proyecto.id}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 text-sm ${
                            active ? "bg-accent text-accent-foreground" : "text-foreground"
                          }`
                        }
                        value={String(proyecto.id)}
                      >
                        {({ selected }) => (
                          <>
                            <div>
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                {proyecto.nombre}
                              </span>
                              <span className="text-xs text-gray-500 block truncate">
                                {proyecto.area ?? "—"} {proyecto.responsable ? `· ${proyecto.responsable}` : ""}
                              </span>
                            </div>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={guardando || !proyectoSeleccionado} className="bg-blue-600 hover:bg-blue-700 text-white">
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Asignar a proyecto
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
