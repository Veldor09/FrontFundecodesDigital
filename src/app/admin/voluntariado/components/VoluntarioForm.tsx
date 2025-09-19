"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IdCard, User, Mail, Calendar, CheckCircle, Phone } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  getCountryCallingCode,
  getExampleNumber,
  isSupportedCountry,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import { Voluntario } from "../types/voluntario";

const MAX_NATIONAL_DEFAULT = 15;

function getMaxNationalLength(country?: string): number {
  if (!country) return MAX_NATIONAL_DEFAULT;
  try {
    const ex = getExampleNumber(country as any, examples as any);
    if (ex?.nationalNumber) return String(ex.nationalNumber).length;
  } catch {}
  const map: Record<string, number> = {
    CR: 8, US: 10, CA: 10, MX: 10, ES: 9, AR: 10, CL: 9, CO: 10, PE: 9, BR: 11,
    EC: 9, PA: 8, NI: 8, HN: 8, SV: 8, GT: 8, DO: 10, PR: 10,
  };
  return map[country] ?? MAX_NATIONAL_DEFAULT;
}

type TipoDoc = "Cédula costarricense" | "Pasaporte" | "DIMEX";
type EstadoBackend = "ACTIVO" | "INACTIVO";

interface Props {
  initial?: Voluntario;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

type FormValues = {
  tipoDoc: TipoDoc;
  numeroDocumento: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  fechaIngreso: string;
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
  const telefono = watch("telefono") ?? "";
  const [country, setCountry] = useState<string | undefined>("CR");

  const maxNational = useMemo(() => getMaxNationalLength(country), [country]);
  const safeCountry = isSupportedCountry(country || "") ? (country as any) : "CR";

  // Validación de número
  const phoneClean = (telefono || "").replace(/\s+/g, "");
  const parsed = parsePhoneNumberFromString(phoneClean, safeCountry);
  const phoneError =
    telefono && (!parsed || !parsed.isValid())
      ? `Número inválido para ${safeCountry.toUpperCase()}`
      : null;

  // Control de escritura / pegado con límite
  function handlePhoneChange(val: string | undefined) {
    if (!val) {
      setValue("telefono", "");
      return;
    }
    const digits = val.replace(/\D/g, "");
    const cc = getCountryCallingCode(safeCountry);
    const national = digits.slice(String(cc).length);
    if (national.length > maxNational) {
      setValue("telefono", `+${cc}${national.slice(0, maxNational)}`);
    } else {
      setValue("telefono", val);
    }
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const key = e.key;
    if (!/^\d$/.test(key)) return;
    const input = e.currentTarget;
    const val = input.value ?? "";
    const ccLen = String(getCountryCallingCode(safeCountry)).length;
    const digitsAll = val.replace(/\D/g, "");
    const natLen = Math.max(0, digitsAll.length - ccLen);
    if (natLen >= maxNational) e.preventDefault();
  }

  function handlePhonePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const paste = e.clipboardData.getData("text")?.replace(/\D/g, "") || "";
    const cc = getCountryCallingCode(safeCountry);
    const national = paste.slice(String(cc).length);
    if (national.length > maxNational) {
      setValue("telefono", `+${cc}${national.slice(0, maxNational)}`);
      e.preventDefault();
    }
  }

  const validarIdentificacion = (value: string) => {
    if (!value) return "Requerido";
    if (tipoDoc === "Cédula costarricense") {
      return /^\d{9}$/.test(value) || "La cédula debe tener 9 dígitos";
    }
    if (tipoDoc === "DIMEX") {
      return /^\d{9,12}$/.test(value) || "DIMEX debe tener entre 9 y 12 dígitos";
    }
    if (tipoDoc === "Pasaporte") {
      return /^[A-Za-z0-9]{6,}$/.test(value) || "Pasaporte inválido (mínimo 6 caracteres)";
    }
    return true;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const dto = {
        tipoDocumento: data.tipoDoc,
        numeroDocumento: data.numeroDocumento,
        nombreCompleto: data.nombreCompleto,
        email: data.email,
        telefono: data.telefono || null,
        fechaNacimiento: data.fechaNacimiento
          ? new Date(data.fechaNacimiento).toISOString()
          : null,
        fechaIngreso: new Date(data.fechaIngreso).toISOString(),
        estado: data.estado,
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
          <p className="text-red-500 text-xs mt-1">
            {String(errors.numeroDocumento.message)}
          </p>
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
            <p className="text-red-500 text-xs mt-1">
              {String(errors.nombreCompleto.message)}
            </p>
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
            <p className="text-red-500 text-xs mt-1">
              {String(errors.email.message)}
            </p>
          )}
        </div>
      </div>

      {/* Teléfono (usa PhoneInput de la librería, sin props raras) */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Teléfono (opcional)
        </Label>

        <PhoneInput
  international
  withCountryCallingCode
  countryCallingCodeEditable={false}
  defaultCountry="CR"
  value={telefono}
  onChange={handlePhoneChange}
  onCountryChange={(c) => setCountry(c || "CR")}
  className="w-full"
  limitMaxLength
  numberInputProps={{
    onKeyDown: handlePhoneKeyDown,
    onPaste: handlePhonePaste,
  }}
/>


        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}

        <p className="text-xs text-slate-500 mt-1">
          {Math.max(
            0,
            (telefono || "").replace(/\D/g, "").length -
              String(getCountryCallingCode(safeCountry)).length
          )}
          /{maxNational} dígitos (sin código)
        </p>
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
            <p className="text-red-500 text-xs mt-1">
              {String(errors.fechaIngreso.message)}
            </p>
          )}
        </div>
      </div>

      {/* Estado */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Estado
        </Label>
        <select
          className="w-full border rounded-md h-9 px-2 text-sm"
          {...register("estado", { required: true })}
        >
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
