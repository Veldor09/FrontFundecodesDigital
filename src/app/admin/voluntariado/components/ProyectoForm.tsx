"use client";

import { useForm } from "react-hook-form";
import { Proyecto } from "../types/proyecto";
import { Area, areas } from "../types/voluntario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { 
  FolderOpen, 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle, 
  ChevronDown, 
  Check 
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import React from "react";

interface Props {
  initial?: Proyecto;
  onSave: (data: Omit<Proyecto, "id" | "voluntariosAsignados"> & { id?: string }) => Promise<void>;
  onCancel: () => void;
}

type FormValues = Omit<Proyecto, "voluntariosAsignados">;

export default function ProyectoForm({ initial, onSave, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initial
      ? initial
      : { 
          estado: "activo" as "activo" | "inactivo" | "finalizado",
          area: "" as Area,
          nombre: "",
          descripcion: "",
          responsable: "",
          fechaInicio: "",
          fechaFin: ""
        },
  });

  const [guardando, setGuardando] = useState(false);
  const areaSeleccionada = watch("area") || "";

  const onSubmit = async (data: FormValues) => {
    setGuardando(true);
    try {
      const { voluntariosAsignados, ...rest } = data;
      await onSave(rest);
      toast.success(initial ? "Proyecto actualizado" : "Proyecto creado");
    } catch (error) {
      toast.error("Error al guardar el proyecto");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const validateNombre = (v: string) => {
    if (!v.trim()) return "El nombre es requerido";
    if (v.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
    if (v.trim().length > 100) return "El nombre no puede exceder 100 caracteres";
    return true;
  };

  const validateDescripcion = (v: string) => {
    if (!v.trim()) return "La descripción es requerida";
    if (v.trim().length < 10) return "La descripción debe tener al menos 10 caracteres";
    if (v.trim().length > 500) return "La descripción no puede exceder 500 caracteres";
    return true;
  };

  const validateResponsable = (v: string) => {
    if (!v.trim()) return "El responsable es requerido";
    if (v.trim().length < 2) return "El nombre del responsable es muy corto";
    if (v.trim().length > 80) return "El nombre del responsable es muy largo";
    return true;
  };

  const validateFechaInicio = (v: string) => {
    if (!v) return "La fecha de inicio es requerida";
    return true;
  };

  const validateFechaFin = (v: string, fechaInicio: string) => {
    if (v && fechaInicio && v <= fechaInicio) {
      return "La fecha de fin debe ser posterior a la fecha de inicio";
    }
    return true;
  };

  const fechaInicio = watch("fechaInicio");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nombre del Proyecto */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Nombre del Proyecto *
        </Label>
        <Input
          placeholder="Ingresa el nombre del proyecto"
          maxLength={100}
          {...register("nombre", {
            required: "El nombre es requerido",
            validate: validateNombre,
          })}
        />
        {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre.message}</p>}
      </div>

      {/* Descripción */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Descripción *
        </Label>
        <Textarea
          placeholder="Describe el proyecto, sus objetivos y alcance"
          maxLength={500}
          rows={4}
          {...register("descripcion", {
            required: "La descripción es requerida",
            validate: validateDescripcion,
          })}
        />
        {errors.descripcion && <p className="text-red-500 text-xs">{errors.descripcion.message}</p>}
      </div>

      {/* Área + Responsable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Área del Proyecto *
          </Label>
          <Listbox
            value={areaSeleccionada}
            onChange={(val) => setValue("area", val as Area)}
          >
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-input bg-background py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <span className="block truncate">{areaSeleccionada || "Selecciona un área"}</span>
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
          <input
            type="hidden"
            {...register("area", {
              required: "Debes seleccionar un área"
            })}
          />
          {errors.area && (
            <p className="text-red-500 text-xs">{errors.area.message}</p>
          )}
        </div>

        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Responsable *
          </Label>
          <Input
            placeholder="Nombre del responsable del proyecto"
            maxLength={80}
            {...register("responsable", {
              required: "El responsable es requerido",
              validate: validateResponsable,
            })}
          />
          {errors.responsable && <p className="text-red-500 text-xs">{errors.responsable.message}</p>}
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Inicio *
          </Label>
          <Input
            type="date"
            {...register("fechaInicio", {
              required: "La fecha de inicio es requerida",
              validate: validateFechaInicio,
            })}
          />
          {errors.fechaInicio && <p className="text-red-500 text-xs">{errors.fechaInicio.message}</p>}
        </div>

        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Fin (opcional)
          </Label>
          <Input
            type="date"
            {...register("fechaFin", {
              validate: (v) => validateFechaFin(v, fechaInicio),
            })}
          />
          {errors.fechaFin && <p className="text-red-500 text-xs">{errors.fechaFin.message}</p>}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={guardando}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={guardando}
          className="flex items-center gap-2"
        >
          {guardando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              {initial ? "Actualizar" : "Crear"} Proyecto
            </>
          )}
        </Button>
      </div>
    </form>
  );
}