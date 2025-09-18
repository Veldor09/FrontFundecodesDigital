"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IdCard, User, Mail, Calendar, CheckCircle } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Voluntario } from "../types/voluntario";

type TipoDoc = "Cédula costarricense" | "Pasaporte" | "DIMEX";
type EstadoBackend = "ACTIVO" | "INACTIVO";

interface Props {
  initial?: Voluntario;
  onSave: (data: any) => Promise<void>; // enviamos DTO correcto al servicio
  onCancel: () => void;
}

type FormValues = {
  tipoDoc: TipoDoc;
  numeroDocumento: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string; // yyyy-mm-dd
  fechaIngreso: string;     // yyyy-mm-dd  (requerido)
  estado: EstadoBackend;
};

export default function VoluntarioForm({ initial, onSave, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initial
      ? {
          tipoDoc: (initial as any).tipoDocumento ?? "Cédula costarricense",
          numeroDocumento: (initial as any).numeroDocumento ?? "",
          nombreCompleto: (initial as any).nombreCompleto ?? "",
          email: initial.email ?? "",
          telefono: initial.telefono ?? "",
          fechaNacimiento: initial.fechaNacimiento
            ? new Date(initial.fechaNacimiento).toISOString().slice(0, 10)
            : "",
          fechaIngreso: initial.fechaIngreso
            ? new Date(initial.fechaIngreso).toISOString().slice(0, 10)
            : "",
          estado: (initial.estado as EstadoBackend) ?? "ACTIVO",
        }
      : {
          tipoDoc: "Cédula costarricense",
          numeroDocumento: "",
          nombreCompleto: "",
          email: "",
          telefono: "",
          fechaNacimiento: "",
          fechaIngreso: "",
          estado: "ACTIVO",
        },
  });

  const tipoDoc = watch("tipoDoc");

  // Validaciones por tipo de documento
  const validarIdentificacion = (value: string) => {
    if (!value) return "Requerido";
    if (tipoDoc === "Cédula costarricense") {
      return /^\d{9}$/.test(value) || "La cédula debe tener 9 dígitos";
    }
    if (tipoDoc === "DIMEX") {
      return /^\d{9,12}$/.test(value) || "DIMEX debe tener entre 9 y 12 dígitos";
    }
    // Pasaporte (mínimo 6 alfanuméricos)
    if (tipoDoc === "Pasaporte") {
      return /^[A-Za-z0-9]{6,}$/.test(value) || "Pasaporte inválido (mínimo 6 caracteres)";
    }
    return true;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Mapeo exacto a lo que espera el backend
      const dto = {
        tipoDocumento: data.tipoDoc,
        numeroDocumento: data.numeroDocumento,
        nombreCompleto: data.nombreCompleto,
        email: data.email,
        telefono: data.telefono || null,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString() : null,
        fechaIngreso: new Date(data.fechaIngreso).toISOString(),
        estado: data.estado, // "ACTIVO" | "INACTIVO"
      };

      await onSave(dto);
      toast.success(initial ? "Voluntario actualizado" : "Voluntario creado");
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar el voluntario");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Tipo de documento */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <IdCard className="h-4 w-4" />
          Tipo de documento
        </Label>
        <select
          className="w-full border rounded-md h-9 px-2 text-sm"
          {...register("tipoDoc", { required: true })}
        >
          <option value="Cédula costarricense">Cédula costarricense</option>
          <option value="Pasaporte">Pasaporte</option>
          <option value="DIMEX">DIMEX</option>
        </select>
      </div>

      {/* Número de Identificación */}
      <div>
        <Label className="text-slate-700">Número de Identificación *</Label>
        <Input
          placeholder={
            tipoDoc === "Cédula costarricense"
              ? "9 dígitos"
              : tipoDoc === "DIMEX"
              ? "9–12 dígitos"
              : "Pasaporte"
          }
          {...register("numeroDocumento", {
            required: "Requerido",
            validate: validarIdentificacion,
          })}
        />
        {errors.numeroDocumento && (
          <p className="text-red-500 text-xs mt-1">{String(errors.numeroDocumento.message)}</p>
        )}
      </div>

      {/* Nombre + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Nombre Completo *
          </Label>
          <Input
            placeholder="Nombre completo"
            {...register("nombreCompleto", { required: "Requerido" })}
          />
          {errors.nombreCompleto && (
            <p className="text-red-500 text-xs mt-1">{String(errors.nombreCompleto.message)}</p>
          )}
        </div>
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email *
          </Label>
          <Input
            type="email"
            placeholder="ejemplo@email.com"
            {...register("email", {
              required: "Requerido",
              pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>
          )}
        </div>
      </div>

      {/* Teléfono con flags correctas */}
      <div>
        <Label className="text-slate-700">Teléfono (opcional)</Label>
        <div className="rounded-md border px-2 py-1">
          <PhoneInput
            country={"cr"}
            // estilos para que las banderas sean pequeñas/consistentes
            buttonClass="!border-0 !bg-transparent"
            containerClass="!w-full"
            inputClass="!w-full !h-8 !text-sm !border-0 !shadow-none"
            dropdownClass="!text-sm"
            enableSearch
            value={watch("telefono") || ""}
            onChange={(val) => setValue("telefono", val || "")}
          />
        </div>
        {/* Tip opcional de formato */}
        <p className="text-xs text-slate-500 mt-1">Incluye el código de país (ej. +506 8888-8888).</p>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Nacimiento
          </Label>
          <Input type="date" {...register("fechaNacimiento")} />
        </div>
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Ingreso al Programa *
          </Label>
          <Input
            type="date"
            {...register("fechaIngreso", { required: "Requerido" })}
          />
          {errors.fechaIngreso && (
            <p className="text-red-500 text-xs mt-1">{String(errors.fechaIngreso.message)}</p>
          )}
        </div>
      </div>
      {/* Fecha de Ingreso al Programa — OPCIONAL en create */}

      {/* Estado */}
      <div>
        <Label className="text-slate-700">Estado</Label>
        <select className="w-full border rounded-md h-9 px-2 text-sm" {...register("estado", { required: true })}>
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex items-center gap-2 bg-blue-600 text-white">
          <CheckCircle className="h-4 w-4" />
          {initial ? "Actualizar" : "Crear"} Voluntario
        </Button>
      </div>
    </form>
  );
}
