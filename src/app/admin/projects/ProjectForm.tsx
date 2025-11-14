"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { ProjectFilesManager } from "./ProjectFilesManager";
import { Upload, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { getProjectFiles } from "@/services/projects.service";

/* Opciones predefinidas */
const CATEGORIES = [
  "Conservación Marina",
  "Conservación Terrestre",
  "Restauración Ecológica",
  "Turismo Sostenible",
  "Educación y Cultura Ambiental",
  "Pesca Sostenible",
  "Gestión de Recursos Naturales",
  "Tecnología y Gestión de Datos",
  "Alianzas y Cooperación",
] as const;

const PLACES = [
  "Área de Conservación Tempisque (ACT)",
  "Parque Nacional Barra Honda",
  "Parque Nacional Marino Las Baulas",
  "Playa Matapalo",
  "Playa Ostional",
  "Playa Camaronal",
  "Playa San Juanillo",
  "Golfo de Papagayo",
  "Sector Cangrejal – Sámara",
  "Bolsón",
  "Tamarindo",
  "Iguanita",
  "Cipancí",
  "Cabo Blanco",
  "Caletas Arío",
  "Nicoya",
] as const;

const AREAS = [
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
  "Alianzas Público–Privadas",
] as const;

/* ===== Límites realistas ===== */
const LIMITS = {
  title:   { min: 3,  max: 50 },
  select:  { min: 3,  max: 40 },
  summary: { min: 10, max: 80 },
  content: {        max: 1000 },
  url:     {        max: 200 },
};

/* Tipos y validación */
type ProjectFormInput = {
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverUrl?: string;
  category: string;
  place: string;
  area: string;
  status?: ProjectStatus;
  published?: boolean;
};

type FormState = ProjectFormInput;

type Props = {
  initial?: Partial<Project>;
  onCancel: () => void;
  onSubmit: (payload: ProjectFormInput) => Promise<void>;
  mode?: "create" | "edit";
};

/* ======= Reglas de validación personalizadas ======= */
function validate(p: ProjectFormInput) {
  const errors: Record<string, string> = {};

  const t = (p.title ?? "").trim();
  if (t.length < LIMITS.title.min) errors.title = `El título debe tener al menos ${LIMITS.title.min} caracteres`;
  else if (t.length > LIMITS.title.max) errors.title = `El título no puede exceder ${LIMITS.title.max} caracteres`;

  const cat = (p.category ?? "").trim();
  if (cat.length < LIMITS.select.min) errors.category = `La categoría debe tener al menos ${LIMITS.select.min} caracteres`;
  else if (cat.length > LIMITS.select.max) errors.category = `La categoría no puede exceder ${LIMITS.select.max} caracteres`;

  const plc = (p.place ?? "").trim();
  if (plc.length < LIMITS.select.min) errors.place = `El lugar debe tener al menos ${LIMITS.select.min} caracteres`;
  else if (plc.length > LIMITS.select.max) errors.place = `El lugar no puede exceder ${LIMITS.select.max} caracteres`;

  const ar = (p.area ?? "").trim();
  if (ar.length < LIMITS.select.min) errors.area = `El área debe tener al menos ${LIMITS.select.min} caracteres`;
  else if (ar.length > LIMITS.select.max) errors.area = `El área no puede exceder ${LIMITS.select.max} caracteres`;

  const url = (p.coverUrl ?? "").trim();
  if (url) {
    if (url.length > LIMITS.url.max) {
      errors.coverUrl = `El URL no puede exceder ${LIMITS.url.max} caracteres`;
    } else {
      try {
        const u = new URL(url);
        if (u.protocol !== "https:") throw new Error();
      } catch {
        errors.coverUrl = "Este URL no es válido (debe iniciar con https://)";
      }
    }
  }

  const sum = (p.summary ?? "").trim();
  if (sum) {
    if (sum.length < LIMITS.summary.min) errors.summary = `El resumen debe tener al menos ${LIMITS.summary.min} caracteres`;
    else if (sum.length > LIMITS.summary.max) errors.summary = `El resumen no puede exceder ${LIMITS.summary.max} caracteres`;
  }

  const cont = (p.content ?? "");
  if (cont && cont.length > LIMITS.content.max) errors.content = `El contenido no debe exceder ${LIMITS.content.max} caracteres`;

  if (p.status && !["EN_PROCESO", "FINALIZADO", "PAUSADO"].includes(p.status)) {
    errors.status = "Estado inválido";
  }

  return errors;
}

/* Selector con menú contextual mejorado */
function PresetSelectInput({
  label,
  value,
  onChange,
  options,
  error,
  placeholder,
  maxLength,
  minLength,
  required,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[];
  error?: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  onBlur?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasValue = value.trim().length > 0;
  const isValid = hasValue && !error;

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Input
            className={`pr-8 ${
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : isValid 
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300'
            }`}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            maxLength={maxLength}
            minLength={minLength}
            required={required}
            aria-invalid={!!error}
          />
          {/* Indicador de estado dentro del input */}
          {hasValue && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          aria-label="Seleccionar de la lista"
          title="Seleccionar de la lista"
        >
          ⋮
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <ul className="max-h-48 overflow-y-auto">
            {options.map((o) => (
              <li
                key={o}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                {o}
              </li>
            ))}
            <li
              className="px-3 py-2 text-sm text-gray-500 italic hover:bg-gray-50 cursor-pointer border-t"
              onClick={() => setOpen(false)}
            >
              ✏️ Escribir otro manualmente
            </li>
          </ul>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1 mt-1">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

const DEFAULT_FORM: FormState = {
  title: "",
  summary: "",
  content: "",
  coverUrl: "",
  category: "",
  place: "",
  area: "",
  status: "EN_PROCESO",
  published: true,
};

export default function ProjectForm({
  initial,
  onCancel,
  onSubmit,
  mode = "create",
}: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<number>(initial?.id || 0);

  useEffect(() => {
    if (!initial) return;
    setForm((prev) => ({
      ...prev,
      title: initial.title ?? prev.title,
      summary: initial.summary ?? prev.summary,
      content: initial.content ?? prev.content,
      coverUrl: initial.coverUrl ?? prev.coverUrl,
      category: initial.category ?? prev.category,
      place: initial.place ?? prev.place,
      area: initial.area ?? prev.area,
      status: (initial.status as ProjectStatus | undefined) ?? prev.status,
      published: initial.published ?? prev.published,
    }));
    setProjectId(initial?.id || 0);
  }, [initial]);

  useEffect(() => {
    if (projectId > 0) {
      loadProjectFiles();
    }
  }, [projectId]);

  const loadProjectFiles = async () => {
    try {
      const files = await getProjectFiles(projectId);
      setProjectFiles(files);
    } catch (error) {
      console.error("Error al cargar archivos del proyecto:", error);
      setProjectFiles([]);
    }
  };

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function validateField(name: keyof ProjectFormInput) {
    const snapshot: ProjectFormInput = {
      title: form.title.trim(),
      slug: form.slug?.trim() || undefined,
      summary: form.summary?.trim() || undefined,
      content: form.content || undefined,
      coverUrl: form.coverUrl?.trim() || undefined,
      category: form.category.trim(),
      place: form.place.trim(),
      area: form.area.trim(),
      status: form.status,
      published: Boolean(form.published),
    };
    const v = validate(snapshot);
    setErrors((prev) => ({ ...prev, [name]: (v as any)[name] }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    const payload: ProjectFormInput = {
      title: form.title.trim(),
      slug: form.slug?.trim() || undefined,
      summary: form.summary?.trim() || undefined,
      content: form.content || undefined,
      coverUrl: form.coverUrl?.trim() || undefined,
      category: form.category.trim(),
      place: form.place.trim(),
      area: form.area.trim(),
      status: form.status,
      published: Boolean(form.published),
    };

    const errs = validate(payload);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      await onSubmit(payload);
    } finally {
      setBusy(false);
    }
  }

  // Contador de caracteres mejorado
  const CharacterCounter = ({ current, max, min }: { current: number; max: number; min?: number }) => {
    const isOverLimit = current > max;
    const isUnderMin = min && current > 0 && current < min;
    const isValid = current >= (min || 0) && current <= max;
    
    return (
      <div className="flex items-center gap-1 mt-1">
        {isOverLimit && <AlertCircle className="w-3 h-3 text-red-500" />}
        {isUnderMin && <Info className="w-3 h-3 text-amber-500" />}
        {isValid && current > 0 && <CheckCircle2 className="w-3 h-3 text-green-500" />}
        <span className={`text-xs ${
          isOverLimit ? 'text-red-600 font-medium' : 
          isUnderMin ? 'text-amber-600' : 
          isValid && current > 0 ? 'text-green-600' :
          'text-gray-500'
        }`}>
          {current}/{max}{min ? ` (mín: ${min})` : ""}
        </span>
      </div>
    );
  };

  // Helper para determinar el estilo del input
  const getInputClassName = (fieldName: keyof FormState, hasValue: boolean) => {
    const hasError = errors[fieldName];
    const isTouched = touched[fieldName];
    
    if (hasError) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (isTouched && hasValue) return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <Card className="p-6 shadow-sm">
      <form className="grid gap-6" onSubmit={handleSubmit} noValidate={false}>
        {/* Título con feedback visual */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Título <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              className={`pr-8 ${getInputClassName('title', form.title.length > 0)}`}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              onBlur={() => validateField("title")}
              placeholder={`Mínimo ${LIMITS.title.min} caracteres, máximo ${LIMITS.title.max}`}
              required
              minLength={LIMITS.title.min}
              maxLength={LIMITS.title.max}
              aria-invalid={!!errors.title}
              aria-describedby="title-error"
            />
            {form.title.length > 0 && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {errors.title ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : form.title.length >= LIMITS.title.min ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : null}
              </div>
            )}
          </div>
          {errors.title && (
            <div className="flex items-start gap-1 mt-1">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p id="title-error" className="text-xs text-red-600">{errors.title}</p>
            </div>
          )}
          <CharacterCounter current={form.title.length} max={LIMITS.title.max} min={LIMITS.title.min} />
        </div>

        {/* Grid de selectores */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <PresetSelectInput
              label="Categoría"
              value={form.category}
              onChange={(v) => set("category", v)}
              onBlur={() => validateField("category")}
              options={CATEGORIES}
              error={errors.category}
              placeholder="Selecciona o escribe"
              maxLength={LIMITS.select.max}
              minLength={LIMITS.select.min}
              required
            />
            <CharacterCounter current={form.category.length} max={LIMITS.select.max} min={LIMITS.select.min} />
          </div>

          <div>
            <PresetSelectInput
              label="Lugar"
              value={form.place}
              onChange={(v) => set("place", v)}
              onBlur={() => validateField("place")}
              options={PLACES}
              error={errors.place}
              placeholder="Selecciona o escribe"
              maxLength={LIMITS.select.max}
              minLength={LIMITS.select.min}
              required
            />
            <CharacterCounter current={form.place.length} max={LIMITS.select.max} min={LIMITS.select.min} />
          </div>

          <div>
            <PresetSelectInput
              label="Área"
              value={form.area}
              onChange={(v) => set("area", v)}
              onBlur={() => validateField("area")}
              options={AREAS}
              error={errors.area}
              placeholder="Selecciona o escribe"
              maxLength={LIMITS.select.max}
              minLength={LIMITS.select.min}
              required
            />
            <CharacterCounter current={form.area.length} max={LIMITS.select.max} min={LIMITS.select.min} />
          </div>
        </div>

        {/* Estado y Publicado */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={form.status ?? ""}
              onChange={(e) => set("status", (e.target.value as ProjectStatus | "") || undefined)}
              onBlur={() => validateField("status")}
              aria-invalid={!!errors.status}
            >
              <option value="">—</option>
              <option value="EN_PROCESO"> En proceso</option>
              <option value="FINALIZADO"> Finalizado</option>
              <option value="PAUSADO"> Pausado</option>
            </select>
            {errors.status && (
              <div className="flex items-start gap-1 mt-1">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                <p className="text-xs text-red-600">{errors.status}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="published"
              type="checkbox"
              checked={!!form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
              {form.published ? ' Publicado' : 'No publicado'}
            </label>
          </div>
        </div>

        {/* URL de portada */}
        <div>
          <label className="text-sm font-medium text-gray-700">URL de portada</label>
          <div className="relative">
            <Input
              className={getInputClassName('coverUrl', (form.coverUrl ?? '').length > 0)}
              value={form.coverUrl ?? ""}
              onChange={(e) => set("coverUrl", e.target.value)}
              onBlur={() => validateField("coverUrl")}
              placeholder="https://ejemplo.com/imagen.jpg"
              type="url"
              pattern="https://.*"
              title="Debe iniciar con https://"
              maxLength={LIMITS.url.max}
              aria-invalid={!!errors.coverUrl}
            />
          </div>
          {errors.coverUrl && (
            <div className="flex items-start gap-1 mt-1">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <p className="text-xs text-red-600">{errors.coverUrl}</p>
            </div>
          )}
        </div>

        {/* Resumen opcional */}
        <div>
          <label className="text-sm font-medium text-gray-700">Resumen (opcional)</label>
          <div className="relative">
            <Input
              className={getInputClassName('summary', (form.summary ?? '').length > 0)}
              value={form.summary ?? ""}
              onChange={(e) => set("summary", e.target.value)}
              onBlur={() => validateField("summary")}
              placeholder={`Mínimo ${LIMITS.summary.min} caracteres, máximo ${LIMITS.summary.max}`}
              maxLength={LIMITS.summary.max}
              aria-invalid={!!errors.summary}
            />
          </div>
          {errors.summary && (
            <div className="flex items-start gap-1 mt-1">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <p className="text-xs text-red-600">{errors.summary}</p>
            </div>
          )}
          {form.summary && (
            <CharacterCounter current={(form.summary ?? "").length} max={LIMITS.summary.max} min={LIMITS.summary.min} />
          )}
        </div>

        {/* Contenido opcional */}
        <div>
          <label className="text-sm font-medium text-gray-700">Contenido (opcional)</label>
          <textarea
            className={`border rounded-md px-3 py-2 w-full min-h-[120px] focus:outline-none focus:ring-2 ${getInputClassName('content', (form.content ?? '').length > 0)}`}
            value={form.content ?? ""}
            onChange={(e) => set("content", e.target.value)}
            onBlur={() => validateField("content")}
            placeholder={`Máximo ${LIMITS.content.max} caracteres`}
            maxLength={LIMITS.content.max}
            aria-invalid={!!errors.content}
          />
          {errors.content && (
            <div className="flex items-start gap-1 mt-1">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <p className="text-xs text-red-600">{errors.content}</p>
            </div>
          )}
          {form.content && <CharacterCounter current={(form.content ?? "").length} max={LIMITS.content.max} />}
        </div>

        {/* Archivos del Proyecto */}
        {mode === "edit" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Archivos del Proyecto
            </h3>

            {projectId === 0 ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-800 text-sm">
                      Primero guarda el proyecto para poder subir archivos
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ProjectFilesManager projectId={projectId} onFilesChange={setProjectFiles} />
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={busy}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Guardando…
              </span>
            ) : (
              mode === "create" ? "Siguiente" : "Guardar cambios"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}