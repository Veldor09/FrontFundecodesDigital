"use client";

import { useForm } from "react-hook-form";
import { Voluntario, Area } from "../types/voluntario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { IdCard, User, Mail, Phone, Calendar, MapPin, CheckCircle } from "lucide-react";

const areas: Area[] = [
  "Vida Silvestre",
  "Conservación Marina",
  "Conservación de Humedales",
  "Restauración Ecológica",
  "Turismo Comunitario",
  "Turismo Cultural",
  "Pesca Artesanal",
  "Educación Ambiental",
  "Gestión de Datos Ambientales",
  "Desarrollo Sostenible",
  "Alianzas Público–Privada",
];

const paises = [
  { nombre: "Costa Rica", codigo: "+506", placeholder: "8888-8888" },
  { nombre: "México", codigo: "+52", placeholder: "55-1234-5678" },
  { nombre: "Colombia", codigo: "+57", placeholder: "300-123-4567" },
  { nombre: "España", codigo: "+34", placeholder: "600-123-456" },
  { nombre: "Estados Unidos", codigo: "+1", placeholder: "201-555-0123" },
];

type TipoDoc = "Cédula costarricense" | "Pasaporte" | "DIMEX";

interface Props {
  initial?: Voluntario;
  onSave: (data: Omit<Voluntario, "id"> & { id?: string }) => Promise<void>;
  onCancel: () => void;
}

type FormValues = Voluntario & { tipoDoc?: TipoDoc; fechaNacimiento?: string };

export default function VoluntarioForm({ initial, onSave, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initial
      ? { ...initial, tipoDoc: "Cédula costarricense", fechaNacimiento: "" }
      : { estado: "activo", tipoDoc: "Cédula costarricense", fechaNacimiento: "" },
  });

  const [guardando, setGuardando] = useState(false);
  const tipoDoc = watch("tipoDoc");
  const [pais, setPais] = useState(paises[0]);

  // ✅ Refs para cerrar selects automáticamente
  const tipoTriggerRef = useRef<HTMLButtonElement>(null);
  const paisTriggerRef = useRef<HTMLButtonElement>(null);
  const areaTriggerRef = useRef<HTMLButtonElement>(null);

  const onSubmit = async (data: FormValues) => {
    setGuardando(true);
    try {
      const { tipoDoc, fechaNacimiento, ...rest } = data;
      await onSave(rest);
      toast.success(initial ? "Voluntario actualizado" : "Voluntario creado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const validateDocumento = (v: string) => {
    if (!v) return "Requerido";
    switch (tipoDoc) {
      case "Cédula costarricense":
        return /^[0-9]{9,10}$/.test(v) || "Cédula debe tener 9-10 dígitos";
      case "Pasaporte":
        return /^[A-Z0-9]{6,12}$/.test(v) || "Pasaporte inválido";
      case "DIMEX":
        return /^[0-9]{11,12}$/.test(v) || "DIMEX debe tener 11-12 dígitos";
      default:
        return true;
    }
  };

  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v) || "Email inválido";

  const validateNombre = (v: string) => {
    if (!v) return "Requerido";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) return "Solo letras y espacios";
    if (v.trim().split(/\s+/).length < 3) return "Escribe nombre y al menos un apellido";
    return true;
  };

  const placeholderDocumento =
    tipoDoc === "Cédula costarricense"
      ? "123456789"
      : tipoDoc === "Pasaporte"
      ? "A12345678"
      : "123456789012";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Tipo de documento + Número */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2"><IdCard className="h-4 w-4" />Tipo de documento</Label>
          <Select
            value={tipoDoc}
            onValueChange={(val) => {
              setValue("tipoDoc", val as TipoDoc);
              setTimeout(() => tipoTriggerRef.current?.click(), 0); // ✅ cierra después
            }}
          >
            <SelectTrigger ref={tipoTriggerRef}>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cédula costarricense">Cédula costarricense</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
              <SelectItem value="DIMEX">DIMEX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-700">Número de documento *</Label>
          <Input
            placeholder={placeholderDocumento}
            {...register("cedula", { required: "Requerido", validate: validateDocumento })}
          />
          {errors.cedula && <p className="text-red-500 text-xs">{errors.cedula.message}</p>}
        </div>
      </div>

      {/* Nombre + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2"><User className="h-4 w-4" />Nombre Completo *</Label>
          <Input
            placeholder="Ingresa el nombre completo"
            {...register("nombre", { required: "Requerido", validate: validateNombre })}
          />
          {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre.message}</p>}
        </div>
        <div>
          <Label className="text-slate-700 flex items-center gap-2"><Mail className="h-4 w-4" />Email *</Label>
          <Input
            placeholder="ejemplo@email.com"
            {...register("email", { required: "Requerido", validate: validateEmail })}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>
      </div>

      {/* País + Teléfono */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2"><Phone className="h-4 w-4" />Teléfono *</Label>
        <div className="grid grid-cols-3 gap-2">
          <Select
            value={pais.codigo}
            onValueChange={(val) => {
              const p = paises.find((x) => x.codigo === val) || paises[0];
              setPais(p);
              setValue("telefono", "");
              setTimeout(() => paisTriggerRef.current?.click(), 0); // ✅ cierra después
            }}
          >
            <SelectTrigger ref={paisTriggerRef} className="col-span-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paises.map((p) => (
                <SelectItem key={p.codigo} value={p.codigo}>
                  {p.nombre} ({p.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className="col-span-2"
            placeholder={pais.placeholder}
            {...register("telefono", {
              required: "Requerido",
              validate: (v) =>
                /^[0-9\- ]{7,15}$/.test(v) || "Teléfono inválido para el país seleccionado",
            })}
          />
        </div>
        {errors.telefono && <p className="text-red-500 text-xs">{errors.telefono.message}</p>}
      </div>

      {/* Fecha Nacimiento + Área */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2"><Calendar className="h-4 w-4" />Fecha de Nacimiento</Label>
          <Input type="date" {...register("fechaNacimiento")} className="w-full" />
        </div>
        <div>
          <Label className="text-slate-700 flex items-center gap-2"><MapPin className="h-4 w-4" />Área de Interés</Label>
          <Select
            value={watch("area")}
            onValueChange={(val) => {
              setValue("area", val as Area);
              setTimeout(() => areaTriggerRef.current?.click(), 0); // ✅ cierra después
            }}
          >
            <SelectTrigger ref={areaTriggerRef}>
              <SelectValue placeholder="Selecciona un área" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estado */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" />Estado</Label>
        <div className="flex gap-4 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input type="radio" value="activo" {...register("estado")} className="accent-blue-600" />
            Activo
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="inactivo" {...register("estado")} className="accent-gray-500" />
            Inactivo
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-700 text-white">
          {guardando ? "Guardando..." : "Guardar Voluntario"}
        </Button>
      </div>
    </form>
  );
}