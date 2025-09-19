// src/components/SancionForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, Calendar, FileText, CheckCircle, User } from "lucide-react";
import type { Sancion, SancionTipo } from "../types/sancion";
import type { Voluntario } from "../types/voluntario";
import { useVoluntarios } from "../hooks/useVoluntarios";

const TIPOS_SANCION: readonly SancionTipo[] = [
  "LEVE",
  "GRAVE",
  "MUY_GRAVE",
  "EXTREMADAMENTE_GRAVE",
] as const;

interface Props {
  initial?: Sancion;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  voluntarioPreseleccionado?: Voluntario;
}

type FormValues = {
  voluntarioId: number;
  tipo: SancionTipo | "";
  motivo: string;
  descripcion?: string;
  fechaInicio: string;           // yyyy-MM-dd
  fechaVencimiento?: string;     // yyyy-MM-dd
  creadaPor?: string;
  esPermanente: boolean;
};

export default function SancionForm({
  initial,
  onSave,
  onCancel,
  voluntarioPreseleccionado,
}: Props) {
  const { data: voluntarios } = useVoluntarios();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initial
      ? {
          voluntarioId: initial.voluntarioId,
          tipo: initial.tipo,
          motivo: initial.motivo,
          descripcion: initial.descripcion || "",
          fechaInicio: initial.fechaInicio
            ? new Date(initial.fechaInicio).toISOString().slice(0, 10)
            : "",
          fechaVencimiento: initial.fechaVencimiento
            ? new Date(initial.fechaVencimiento).toISOString().slice(0, 10)
            : "",
          creadaPor: initial.creadaPor || "",
          esPermanente: !initial.fechaVencimiento,
        }
      : {
          voluntarioId: voluntarioPreseleccionado?.id || 0,
          tipo: "",
          motivo: "",
          descripcion: "",
          fechaInicio: new Date().toISOString().slice(0, 10),
          fechaVencimiento: "",
          creadaPor: "",
          esPermanente: false,
        },
  });

  const esPermanente = watch("esPermanente");

  useEffect(() => {
    if (voluntarioPreseleccionado) {
      setValue("voluntarioId", voluntarioPreseleccionado.id);
    }
  }, [voluntarioPreseleccionado, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (!data.tipo) {
        toast.error("Debe seleccionar un tipo de sanción");
        return;
      }
      const dto = {
        voluntarioId: data.voluntarioId,
        tipo: data.tipo as SancionTipo,
        motivo: data.motivo,
        descripcion: data.descripcion || undefined,
        fechaInicio: new Date(data.fechaInicio).toISOString(),
        fechaVencimiento: data.esPermanente
          ? null
          : data.fechaVencimiento
          ? new Date(data.fechaVencimiento).toISOString()
          : null,
        creadaPor: data.creadaPor || "Sistema",
      };

      await onSave(dto);
      toast.success(initial ? "Sanción actualizada" : "Sanción registrada");
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar la sanción");
    }
  };

  const voluntarioSeleccionado = voluntarios.find(
    (v) => v.id === watch("voluntarioId")
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Voluntario */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <User className="h-4 w-4" />
          Voluntario *
        </Label>
        {voluntarioPreseleccionado ? (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="font-medium text-blue-900">
              {voluntarioPreseleccionado.nombreCompleto}
            </p>
            <p className="text-sm text-blue-700">
              {voluntarioPreseleccionado.numeroDocumento} •{" "}
              {voluntarioPreseleccionado.email}
            </p>
          </div>
        ) : (
          <>
            <select
              className="w-full border rounded-md h-10 px-2 text-sm"
              {...register("voluntarioId", {
                required: "Debe seleccionar un voluntario",
                min: { value: 1, message: "Debe seleccionar un voluntario válido" },
              })}
            >
              <option value={0}>Seleccione un voluntario</option>
              {voluntarios.map((vol) => (
                <option key={vol.id} value={vol.id}>
                  {vol.nombreCompleto} - {vol.numeroDocumento}
                </option>
              ))}
            </select>
            {errors.voluntarioId && (
              <p className="text-red-500 text-xs mt-1">
                {String(errors.voluntarioId.message)}
              </p>
            )}
          </>
        )}
      </div>

      {/* Tipo */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Tipo de Sanción *
        </Label>
        <select
          className="w-full border rounded-md h-10 px-2 text-sm"
          {...register("tipo", { required: "Debe seleccionar un tipo de sanción" })}
        >
          <option value="">Seleccione el tipo de sanción</option>
          {TIPOS_SANCION.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        {errors.tipo && (
          <p className="text-red-500 text-xs mt-1">
            {String(errors.tipo.message)}
          </p>
        )}
      </div>

      {/* Motivo */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Motivo *
        </Label>
        <Input
          placeholder="Indique el motivo de la sanción"
          {...register("motivo", { required: "El motivo es requerido" })}
        />
        {errors.motivo && (
          <p className="text-red-500 text-xs mt-1">
            {String(errors.motivo.message)}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <Label className="text-slate-700">Descripción Detallada</Label>
        <Textarea
          placeholder="Proporcione detalles adicionales sobre la sanción..."
          rows={3}
          {...register("descripcion")}
        />
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
            {...register("fechaInicio", { required: "La fecha de inicio es requerida" })}
          />
          {errors.fechaInicio && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.fechaInicio.message)}
            </p>
          )}
        </div>

        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Vencimiento
          </Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="esPermanente"
                {...register("esPermanente")}
                className="rounded"
              />
              <label htmlFor="esPermanente" className="text-sm text-slate-600">
                Sanción permanente (sin fecha de vencimiento)
              </label>
            </div>
            {!esPermanente && (
              <Input
                type="date"
                {...register("fechaVencimiento")}
                min={watch("fechaInicio")}
              />
            )}
          </div>
        </div>
      </div>

      {/* Creada por */}
      <div>
        <Label className="text-slate-700">Sanción aplicada por</Label>
        <Input placeholder="Nombre de quien aplica la sanción" {...register("creadaPor")} />
      </div>

      {/* Info voluntario */}
      {voluntarioSeleccionado && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <h4 className="font-medium text-slate-800 mb-2">Información del Voluntario</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            <div>
              <strong>Nombre:</strong> {voluntarioSeleccionado.nombreCompleto}
            </div>
            <div>
              <strong>Documento:</strong> {voluntarioSeleccionado.numeroDocumento}
            </div>
            <div>
              <strong>Email:</strong> {voluntarioSeleccionado.email}
            </div>
            <div>
              <strong>Estado:</strong>{" "}
              <span
                className={
                  voluntarioSeleccionado.estado === "ACTIVO"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {voluntarioSeleccionado.estado}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CheckCircle className="h-4 w-4" />
          {initial ? "Actualizar" : "Registrar"} Sanción
        </Button>
      </div>
    </form>
  );
}
