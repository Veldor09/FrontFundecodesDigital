"use client";

import { useForm } from "react-hook-form";
import { Voluntario, Area } from "../types/voluntario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { IdCard, User, Mail, Phone, Calendar, MapPin, CheckCircle, ChevronDown, Check } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import React from "react";

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

const tipoDocOptions = [
  { value: "Cédula costarricense", label: "Cédula costarricense" },
  { value: "Pasaporte", label: "Pasaporte" },
  { value: "DIMEX", label: "DIMEX" },
];

type TipoDoc = "Cédula costarricense" | "Pasaporte" | "DIMEX";

interface Props {
  initial?: Voluntario;
  onSave: (data: Omit<Voluntario, "id"> & { id?: string }) => Promise<void>;
  onCancel: () => void;
}

type FormValues = Omit<Voluntario, 'cedula'> & { 
  tipoDoc?: TipoDoc; 
  fechaNacimiento?: string;
};

export default function VoluntarioForm({ initial, onSave, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<FormValues>({
    defaultValues: initial
      ? { 
          ...initial, 
          tipoDoc: "Cédula costarricense" as TipoDoc, 
          fechaNacimiento: "" 
        }
      : { 
          estado: "activo" as "activo" | "inactivo", 
          tipoDoc: "Cédula costarricense" as TipoDoc, 
          fechaNacimiento: "", 
          area: "" as Area,
          nombre: "",
          email: "",
          telefono: ""
        },
  });

  const [guardando, setGuardando] = useState(false);
  const [pais, setPais] = useState(paises[0]);
  const [documento, setDocumento] = useState(initial?.cedula || "");
  const [documentoError, setDocumentoError] = useState("");

  const tipoDoc = watch("tipoDoc") || "Cédula costarricense";
  const areaSeleccionada = watch("area") || "";

  const onSubmit = async (data: FormValues) => {
    const docValidation = validateDocumento(documento);
    if (docValidation !== true) {
      setDocumentoError(docValidation);
      return;
    }

    setGuardando(true);
    try {
      const { tipoDoc, fechaNacimiento, ...rest } = data;
      const finalData = { ...rest, cedula: documento };
      await onSave(finalData);
      toast.success(initial ? "Voluntario actualizado" : "Voluntario creado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const validateDocumento = (v: string) => {
    if (!v) return "Requerido";
    const cleanValue = v.replace(/[\s-]/g, '');
    switch (tipoDoc) {
      case "Cédula costarricense":
        return /^[0-9]{9}$/.test(cleanValue) || "La cédula debe tener exactamente 9 dígitos";
      case "Pasaporte":
        return /^[A-Z]{3}[0-9]{6}$/.test(cleanValue.toUpperCase()) || "El pasaporte debe tener 3 letras seguidas de 6 números";
      case "DIMEX":
        return /^[0-9]{12}$/.test(cleanValue) || "El DIMEX debe tener exactamente 12 dígitos";
      default:
        return true;
    }
  };

  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v) || "Email inválido";
  
  const validateNombre = (v: string) => {
    if (!v) return "Requerido";
    const nombreLimpio = v.trim();
    if (nombreLimpio.length < 2) return "Muy corto (mínimo 2 caracteres)";
    if (nombreLimpio.length > 80) return "Muy largo (máximo 80 caracteres)";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']+$/.test(nombreLimpio))
      return "Solo letras, espacios, guiones y apóstrofes";
    if (/\s{2,}/.test(nombreLimpio))
      return "No usar espacios consecutivos";
    if (/^[\s\-]|[\s\-]$/.test(nombreLimpio))
      return "No puede empezar o terminar con espacio o guión";
    const palabras = nombreLimpio.split(/\s+/);
    if (palabras.length < 2)
      return "Ingresa al menos nombre y apellido";
    if (palabras.some((palabra) => palabra.length < 2))
      return "Cada nombre/apellido debe tener al menos 2 caracteres";
    return true;
  };

  const placeholderDocumento =
    tipoDoc === "Cédula costarricense" ? "123456789" :
    tipoDoc === "Pasaporte" ? "ABC123456" :
    "123456789012";

  const handleDocumentoInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;
    let newValue = "";
    switch (tipoDoc) {
      case "Cédula costarricense":
        newValue = value.replace(/[^0-9]/g, '').slice(0, 9);
        break;
      case "Pasaporte":
        const upper = value.toUpperCase();
        let letters = "";
        let numbers = "";
        for (let char of upper) {
          if (letters.length < 3 && /[A-Z]/.test(char)) {
            letters += char;
          } else if (letters.length === 3 && numbers.length < 6 && /[0-9]/.test(char)) {
            numbers += char;
          }
        }
        newValue = letters + numbers;
        break;
      case "DIMEX":
        newValue = value.replace(/[^0-9]/g, '').slice(0, 12);
        break;
    }
    if (newValue !== value) input.value = newValue;
    setDocumento(newValue);
    setDocumentoError("");
  };

  const handleTipoDocChange = (val: TipoDoc) => {
    setValue("tipoDoc", val);
    setDocumento("");
    setDocumentoError("");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Tipo de documento + Número */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <IdCard className="h-4 w-4" />
            Tipo de documento
          </Label>
          <Listbox value={tipoDoc} onChange={handleTipoDocChange}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-input bg-background py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <span className="block truncate">{tipoDoc}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </span>
              </Listbox.Button>
              <Transition leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {tipoDocOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-accent text-accent-foreground" : "text-foreground"
                        }`
                      }
                      value={option.value}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {option.label}
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

        <div>
          <Label className="text-slate-700">Número de documento *</Label>
          <Input
            placeholder={placeholderDocumento}
            value={documento}
            onInput={handleDocumentoInput}
            className={documentoError ? "border-red-500" : ""}
          />
          {documentoError && <p className="text-red-500 text-xs">{documentoError}</p>}
        </div>
      </div>

      {/* Nombre + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Nombre Completo *
          </Label>
          <Input
            placeholder="Ingresa el nombre completo"
            maxLength={80}
            {...register("nombre", {
              required: "Requerido",
              validate: validateNombre,
              onChange: (e) => {
                const value = e.target.value;
                if (value.length > 80) {
                  e.target.value = value.slice(0, 80);
                }
              }
            })}
          />
          {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre.message}</p>}
        </div>
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email *
          </Label>
          <Input
            placeholder="ejemplo@email.com"
            {...register("email", { required: "Requerido", validate: validateEmail })}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>
      </div>

      {/* País + Teléfono */}
      <div>
        <Label className="text-slate-700 flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Teléfono *
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <Listbox
            value={pais}
            onChange={(paisSeleccionado) => {
              setPais(paisSeleccionado);
              setValue("telefono", "");
            }}
          >
            <div className="relative col-span-1">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-input bg-background py-2 pl-3 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <span className="block truncate">{pais.nombre} ({pais.codigo})</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </span>
              </Listbox.Button>
              <Transition leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {paises.map((p) => (
                    <Listbox.Option
                      key={p.codigo}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-accent text-accent-foreground" : "text-foreground"
                        }`
                      }
                      value={p}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {p.nombre} ({p.codigo})
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

          <Input
            className="col-span-2"
            placeholder={pais.placeholder}
            {...register("telefono", {
              required: "Requerido",
              validate: (v) => /^[0-9\- ]{7,15}$/.test(v) || "Teléfono inválido para el país seleccionado",
            })}
          />
        </div>
        {errors.telefono && <p className="text-red-500 text-xs">{errors.telefono.message}</p>}
      </div>

      {/* Fecha Nacimiento + Área */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Nacimiento
          </Label>
          <Input type="date" {...register("fechaNacimiento")} className="w-full" />
        </div>
        <div>
          <Label className="text-slate-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Área de Interés
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
              required: "Debes seleccionar un área de interés"
            })}
          />
          {errors.area && (
            <p className="text-red-500 text-xs">{errors.area.message}</p>
          )}
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
              {initial ? "Actualizar" : "Crear"} Voluntario
            </>
          )}
        </Button>
      </div>
    </form>
  );
}