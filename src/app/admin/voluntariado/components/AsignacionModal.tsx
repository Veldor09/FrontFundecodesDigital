"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, X, MapPin, FolderOpen, ChevronDown, Check } from "lucide-react";
import { Voluntario, Area, areas } from "../types/voluntario";
import { Proyecto } from "../types/proyecto";
import Modal from "@/components/ui/Modal";
import { Listbox, Transition } from "@headlessui/react";

interface Props {
  voluntario: Voluntario;
  proyectos: Proyecto[];
  open: boolean;
  onClose: () => void;
  onAsignar: (voluntarioId: string, area: Area, proyectoId: string) => Promise<void>;
  onActualizarArea: (voluntarioId: string, area: Area) => Promise<void>;
}

export default function AsignacionModal({ 
  voluntario, 
  proyectos, 
  open, 
  onClose, 
  onAsignar,
  onActualizarArea 
}: Props) {
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area>(voluntario.area);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>("");
  const [guardando, setGuardando] = useState(false);

  // Filtrar proyectos activos disponibles para este voluntario
  const proyectosDisponibles = proyectos.filter(p => 
    p.estado === "activo" && !p.voluntariosAsignados.includes(voluntario.id)
  );

  // Proyectos donde ya está asignado
  const proyectosAsignados = proyectos.filter(p => 
    p.voluntariosAsignados.includes(voluntario.id)
  );

  const handleGuardar = async () => {
    if (!proyectoSeleccionado) {
      toast.error("Debes seleccionar un proyecto");
      return;
    }

    setGuardando(true);
    try {
      // Asignar a proyecto y actualizar área si cambió
      await onAsignar(voluntario.id, areaSeleccionada, proyectoSeleccionado);
      
      // Si cambió el área, actualizarla también
      if (areaSeleccionada !== voluntario.area) {
        await onActualizarArea(voluntario.id, areaSeleccionada);
      }
      
      toast.success("Voluntario asignado correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al asignar voluntario");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizarSoloArea = async () => {
    if (areaSeleccionada === voluntario.area) {
      toast.info("El área no ha cambiado");
      return;
    }

    setGuardando(true);
    try {
      await onActualizarArea(voluntario.id, areaSeleccionada);
      toast.success("Área actualizada correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al actualizar área");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose}
      title="Asignar Voluntario"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Info del voluntario */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900">{voluntario.nombre}</h3>
          <p className="text-sm text-blue-700">{voluntario.email}</p>
          <p className="text-sm text-blue-700">Área actual: {voluntario.area}</p>
        </div>

        {/* Proyectos ya asignados */}
        {proyectosAsignados.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Proyectos asignados actualmente:</h4>
            <div className="space-y-2">
              {proyectosAsignados.map(p => (
                <div key={p.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-medium text-green-900">{p.nombre}</div>
                  <div className="text-sm text-green-700">{p.descripcion}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selección de área */}
        <div>
          <Label className="text-slate-700 flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4" />
            Área de Interés
          </Label>
          <Listbox value={areaSeleccionada} onChange={setAreaSeleccionada}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-input bg-background py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <span className="block truncate">{areaSeleccionada}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </span>
              </Listbox.Button>
              <Transition leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {areas.map((area) => (
                    <Listbox.Option
                      key={area}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-accent text-accent-foreground" : "text-foreground"
                        }`
                      }
                      value={area}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {area}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Selección de proyecto */}
        <div>
          <Label className="text-slate-700 flex items-center gap-2 mb-2">
            <FolderOpen className="h-4 w-4" />
            Asignar a Proyecto (opcional)
          </Label>
          {proyectosDisponibles.length === 0 ? (
            <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p>No hay proyectos disponibles para asignar</p>
            </div>
          ) : (
            <Listbox value={proyectoSeleccionado} onChange={setProyectoSeleccionado}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-md border border-input bg-background py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <span className="block truncate">
                    {proyectoSeleccionado 
                      ? proyectos.find(p => p.id === proyectoSeleccionado)?.nombre 
                      : "Seleccionar proyecto (opcional)"
                    }
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </span>
                </Listbox.Button>
                <Transition leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <Listbox.Option value="" className="relative cursor-default select-none py-2 pl-10 pr-4 text-sm text-gray-400">
                      No asignar a proyecto
                    </Listbox.Option>
                    {proyectosDisponibles.map((proyecto) => (
                      <Listbox.Option
                        key={proyecto.id}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 text-sm ${
                            active ? "bg-accent text-accent-foreground" : "text-foreground"
                          }`
                        }
                        value={proyecto.id}
                      >
                        {({ selected }) => (
                          <>
                            <div>
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                {proyecto.nombre}
                              </span>
                              <span className="text-xs text-gray-500 block truncate">
                                {proyecto.area} - {proyecto.responsable}
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

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={guardando}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          {/* Botón para solo actualizar área (si cambió) */}
          {areaSeleccionada !== voluntario.area && (
            <Button
              variant="outline"
              onClick={handleActualizarSoloArea}
              disabled={guardando}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Solo actualizar área
            </Button>
          )}
          
          {/* Botón principal - asignar a proyecto */}
          <Button
            onClick={handleGuardar}
            disabled={guardando || !proyectoSeleccionado}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {proyectoSeleccionado ? "Asignar a proyecto" : "Actualizar"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}