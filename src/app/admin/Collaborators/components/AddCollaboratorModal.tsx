"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCollaborator } from "@/app/admin/Collaborators/services/collaborators.service";
import type { CreateCollaboratorDto } from "@/app/admin/Collaborators/types/collaborators.types";

import {
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  isSupportedCountry,
} from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import metadata from "libphonenumber-js/metadata.full.json";
import examples from "libphonenumber-js/examples.mobile.json";
import PhoneInput from "react-phone-number-input";

/* ===== Límites ===== */
const LIMITS = {
  fullName: { min: 3, max: 80 },
  email: { max: 100 },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ===== Tipos de identificación ===== */
type IdType = "cedula" | "dimex" | "pasaporte" | "nite" | "juridica";

const ID_CONFIG = {
  cedula: {
    label: "Cédula (9–10 dígitos)",
    placeholder: "1-2345-6789",
    pattern: /^\d{9,10}$/,
    length: [9, 10],
    onlyNumbers: true,
  },
  dimex: {
    label: "DIMEX (12 dígitos)",
    placeholder: "123456789012",
    pattern: /^\d{12}$/,
    length: [12, 12],
    onlyNumbers: true,
  },
  pasaporte: {
    label: "Pasaporte (8–9 caracteres)",
    placeholder: "A12345678",
    pattern: /^[A-Za-z0-9]{8,9}$/,
    length: [8, 9],
    onlyNumbers: false,
  },
  nite: {
    label: "NITE (12 dígitos)",
    placeholder: "123456789012",
    pattern: /^\d{12}$/,
    length: [12, 12],
    onlyNumbers: true,
  },
  juridica: {
    label: "Cédula jurídica (10 dígitos)",
    placeholder: "3101123456",
    pattern: /^\d{10}$/,
    length: [10, 10],
    onlyNumbers: true,
  },
};

/* ===== Roles UI ===== */
type UIRole = "admin" | "editor" | "viewer";
const UI_ROLES: UIRole[] = ["admin", "editor", "viewer"];
const UI_TO_API_ROLE: Record<UIRole, "ADMIN" | "COLABORADOR"> = {
  admin: "ADMIN",
  editor: "COLABORADOR",
  viewer: "COLABORADOR",
};

/* ===== Estado del formulario ===== */
type FormState = Omit<CreateCollaboratorDto, "role" | "password"> & { role: UIRole };

const Counter = ({
  current,
  max,
  min,
}: { current: number; max?: number; min?: number }) => {
  const over = max !== undefined && current > max;
  const under = min !== undefined && current > 0 && current < min;
  const color = over ? "text-red-600" : under ? "text-orange-600" : "text-gray-500";
  return (
    <div className={`text-xs mt-1 ${color}`}>
      {`${current}${max ? `/${max}` : ""}`}
      {min ? ` (mín: ${min})` : ""}
    </div>
  );
};

function yearsOld(dateIso: string) {
  const d = new Date(dateIso);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function getMaxNationalLengthFor(country?: string): number | null {
  if (!country) return null;
  try {
    const ex = getExampleNumber(country as any, examples as any, metadata as any);
    if (ex?.nationalNumber) return String(ex.nationalNumber).length;
  } catch {}
  const fallback: Record<string, number> = {
    CR: 8, US: 10, CA: 10, MX: 10, ES: 9, AR: 10, CL: 9, CO: 10, PE: 9, BR: 11,
    EC: 9, PA: 8, NI: 8, HN: 8, SV: 8, GT: 8, DO: 10, PR: 10,
  };
  return fallback[country] ?? 15;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type Field = keyof FormState;

export default function AddCollaboratorModal({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    fullName: false,
    email: false,
    identification: false,
    birthdate: false,
    phone: false,
    role: false,
  });

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    identification: "",
    birthdate: "",
    phone: "+506",
    role: "viewer",
  });

  const [country, setCountry] = useState<string | undefined>("CR");
  const [idType, setIdType] = useState<IdType>("cedula");

  /* ===== Reiniciar formulario ===== */
  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      identification: "",
      birthdate: "",
      phone: "+506",
      role: "viewer",
    });
    setCountry("CR");
    setIdType("cedula");
    setTouched({
      fullName: false,
      email: false,
      identification: false,
      birthdate: false,
      phone: false,
      role: false,
    });
    setSubmitted(false);
    setServerError(null);
    setOkMsg(null);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  /* ===== Validación ===== */
  const errors = useMemo(() => {
    const e: Partial<Record<Field, string>> = {};

    const name = form.fullName.trim();
    if (name.length < LIMITS.fullName.min)
      e.fullName = `El nombre debe tener al menos ${LIMITS.fullName.min} caracteres`;
    else if (name.length > LIMITS.fullName.max)
      e.fullName = `El nombre no puede exceder ${LIMITS.fullName.max} caracteres`;

    const email = form.email.trim();
    if (!EMAIL_RE.test(email)) e.email = "Ingresa un correo válido (ej. nombre@dominio.com)";
    else if (email.length > LIMITS.email.max)
      e.email = `El correo no puede exceder ${LIMITS.email.max} caracteres`

    const config = ID_CONFIG[idType];
    const id = form.identification.trim();
    if (config.onlyNumbers && !/^\d+$/.test(id)) {
      e.identification = "Solo se permiten números";
    } else if (!config.pattern.test(id)) {
      e.identification = `Formato inválido para ${config.label.toLowerCase()}`;
    } else if (id.length < config.length[0] || id.length > config.length[1]) {
      e.identification = `Debe tener entre ${config.length[0]} y ${config.length[1]} caracteres`;
    }

    if (!form.birthdate) e.birthdate = "Selecciona la fecha de nacimiento";
    else if (yearsOld(form.birthdate) < 18) e.birthdate = "Debe ser mayor de 18 años";

    // ✅ VALIDACIÓN DE TELÉFONO CON PAÍS REAL
    const safeCountry = isSupportedCountry(country || "") ? (country as CountryCode) : "CR";
    const phoneClean = (form.phone || "").replace(/\s+/g, ""); // quita espacios
    const parsed = parsePhoneNumberFromString(phoneClean, safeCountry);

    if (!parsed || !parsed.isValid()) {
      e.phone = `Número inválido para el país seleccionado (${safeCountry.toUpperCase()})`;
    }

    if (!form.role) e.role = "Selecciona un rol";

    return e;
  }, [form, country, idType]);

  const showError = (field: Field) => (submitted || touched[field]) && !!errors[field];
  const markTouched = (field: Field) => setTouched((t) => ({ ...t, [field]: true }));

  const nationalDigits = useMemo(() => {
    const digits = (form.phone || "").replace(/\D/g, "");
    if (!country) return digits.length;
    try {
      const cc = getCountryCallingCode(country as any);
      return Math.max(0, digits.length - String(cc).length);
    } catch {
      return digits.length;
    }
  }, [form.phone, country]);

  /* ===== Submit ===== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setOkMsg(null);
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const dto: CreateCollaboratorDto = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        identification: form.identification.trim(),
        birthdate: form.birthdate,
        phone: (form.phone || "").replace(/\s+/g, ""), // ✅ sin espacios
        role: UI_TO_API_ROLE[form.role],
      };

      await createCollaborator(dto);
      setOkMsg("✅ Colaborador creado correctamente.");
      onCreated();
      resetForm();
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      setServerError(err?.message || "❌ No se pudo crear el colaborador.");
    } finally {
      setLoading(false);
    }
  }

  /* ===== Teléfono: límites + código fijo ===== */
  const maxNational = getMaxNationalLengthFor(country) ?? 15;

  function handlePhoneChange(value?: string) {
    const c = country || "CR";
    try {
      const cc = getCountryCallingCode(c as any);
      const digits = (value || "").replace(/\D/g, "");
      let national = digits.slice(String(cc).length);
      if (national.length > maxNational) national = national.slice(0, maxNational);
      setForm((prev) => ({ ...prev, phone: `+${cc}${national}` }));
    } catch {
      setForm((prev) => ({ ...prev, phone: value ?? prev.phone }));
    }
  }

  function handlePhoneCountryChange(c?: string) {
    const nextCountry = c || "CR";
    setCountry(nextCountry);
    try {
      const cc = getCountryCallingCode(nextCountry as any);
      setForm((prev) => ({ ...prev, phone: `+${cc}` }));
    } catch {
      setForm((prev) => ({ ...prev, phone: "" }));
    }
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const key = e.key;
    if (!/^\d$/.test(key)) return;
    const input = e.currentTarget;
    const val = input.value ?? "";
    try {
      const cc = getCountryCallingCode((country as any) || "CR");
      const ccLen = String(cc).length;
      const selStart = input.selectionStart ?? val.length;
      const selEnd = input.selectionEnd ?? val.length;
      const replacing = selStart !== selEnd;
      const digitsAll = val.replace(/\D/g, "");
      const natLen = Math.max(0, digitsAll.length - ccLen);
      if (natLen >= maxNational && !replacing) e.preventDefault();
    } catch {}
  }

  function handlePhonePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const pasteText = e.clipboardData.getData("text") || "";
    const pasteDigits = pasteText.replace(/\D/g, "");
    const val = input.value ?? "";
    try {
      const cc = getCountryCallingCode((country as any) || "CR");
      const ccLen = String(cc).length;

      const selStart = input.selectionStart ?? val.length;
      const selEnd = input.selectionEnd ?? val.length;

      const natIdxStart = Math.max(0, val.slice(0, selStart).replace(/\D/g, "").length - ccLen);
      const natIdxEnd = Math.max(0, val.slice(0, selEnd).replace(/\D/g, "").length - ccLen);

      const digitsAll = val.replace(/\D/g, "");
      const natCurrent = digitsAll.slice(ccLen);
      const before = natCurrent.slice(0, natIdxStart);
      const after = natCurrent.slice(natIdxEnd);

      const nextNat = (before + pasteDigits + after).slice(0, maxNational);
      setForm((prev) => ({ ...prev, phone: `+${cc}${nextNat}` }));
      e.preventDefault();
    } catch {}
  }

  if (!open) return null;

  const config = ID_CONFIG[idType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Añadir colaborador</h3>
          <button onClick={onClose} className="text-sm text-slate-500 hover:underline">
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                onBlur={() => markTouched("fullName")}
                placeholder={`Entre ${LIMITS.fullName.min} y ${LIMITS.fullName.max} caracteres`}
                minLength={LIMITS.fullName.min}
                maxLength={LIMITS.fullName.max}
                aria-invalid={showError("fullName")}
                aria-describedby="fullName-error"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Como aparece en el documento de identidad.</p>
              {showError("fullName") && (
                <p id="fullName-error" className="text-xs text-red-600 mt-1">
                  {errors.fullName}
                </p>
              )}
              <Counter current={form.fullName.length} max={LIMITS.fullName.max} min={LIMITS.fullName.min} />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => markTouched("email")}
                placeholder="nombre@dominio.com"
                maxLength={LIMITS.email.max}
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                title="Ingresa un correo válido (ej. nombre@dominio.com)"
                aria-invalid={showError("email")}
                aria-describedby="email-error"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Se usará para acceso y comunicaciones.</p>
              {showError("email") && (
                <p id="email-error" className="text-xs text-red-600 mt-1">
                  {errors.email}
                </p>
              )}
              <Counter current={form.email.length} max={LIMITS.email.max} />
            </div>

            {/* Tipo de identificación */}
            <div>
              <Label htmlFor="idType">Tipo de identificación</Label>
              <select
                id="idType"
                className="w-full rounded border px-3 py-2 h-10"
                value={idType}
                onChange={(e) => {
                  setIdType(e.target.value as IdType);
                  setForm({ ...form, identification: "" });
                }}
              >
                <option value="cedula">Cédula</option>
                <option value="dimex">DIMEX</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="nite">NITE</option>
                <option value="juridica">Cédula jurídica</option>
              </select>
            </div>

            {/* Identificación */}
            <div>
              <Label htmlFor="identification">{config.label} *</Label>
              <Input
                id="identification"
                value={form.identification}
                onChange={(e) => {
                  let val = e.target.value;
                  if (config.onlyNumbers) val = val.replace(/\D/g, "");
                  setForm({ ...form, identification: val.slice(0, config.length[1]) });
                }}
                onBlur={() => markTouched("identification")}
                inputMode={config.onlyNumbers ? "numeric" : "text"}
                placeholder={config.placeholder}
                maxLength={config.length[1]}
                aria-invalid={showError("identification")}
                aria-describedby="identification-error"
                required
              />
              {showError("identification") && (
                <p id="identification-error" className="text-xs text-red-600 mt-1">
                  {errors.identification}
                </p>
              )}
              <Counter current={form.identification.length} max={config.length[1]} min={config.length[0]} />
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <Label htmlFor="birthdate">Fecha de nacimiento *</Label>
              <Input
                id="birthdate"
                type="date"
                value={form.birthdate}
                onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                onBlur={() => markTouched("birthdate")}
                aria-invalid={showError("birthdate")}
                aria-describedby="birthdate-error"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Debe ser mayor de 18 años.</p>
              {showError("birthdate") && (
                <p id="birthdate-error" className="text-xs text-red-600 mt-1">
                  {errors.birthdate}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <Label htmlFor="phone">Teléfono *</Label>
              <PhoneInput
                id="phone"
                international
                withCountryCallingCode
                countryCallingCodeEditable={false}
                metadata={metadata as any}
                defaultCountry="CR"
                value={form.phone || undefined}
                onCountryChange={handlePhoneCountryChange}
                onChange={handlePhoneChange}
                onBlur={() => markTouched("phone")}
                className="PhoneInput"
                aria-invalid={showError("phone")}
                aria-describedby="phone-error"
                numberInputProps={{
                  inputMode: "tel",
                  autoComplete: "tel",
                  onKeyDown: handlePhoneKeyDown,
                  onPaste: handlePhonePaste,
                }}
              />
              <p className="text-xs text-slate-500 mt-1">
                El código del país se agrega automáticamente. Escribe sólo el número local.
              </p>
              {showError("phone") && (
                <p id="phone-error" className="text-xs text-red-600 mt-1">
                  {errors.phone}
                </p>
              )}
              <div className="text-xs mt-1 text-gray-500">
                {nationalDigits}/{getMaxNationalLengthFor(country) ?? "?"} dígitos (sin código)
              </div>
            </div>

            {/* Rol */}
            <div>
              <Label htmlFor="role">Rol *</Label>
              <select
                id="role"
                className="w-full rounded border px-3 py-2 h-10"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UIRole })}
                onBlur={() => markTouched("role")}
                aria-invalid={showError("role")}
                aria-describedby="role-error"
                required
              >
                {UI_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Define permisos iniciales.</p>
              {showError("role") && (
                <p id="role-error" className="text-xs text-red-600 mt-1">
                  {(errors as any).role}
                </p>
              )}
            </div>
          </div>

          {serverError && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </div>
          )}
          {okMsg && (
            <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {okMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}