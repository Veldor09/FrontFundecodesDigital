"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { ProjectFilesManager } from "./ProjectFilesManager";
import { Upload } from "lucide-react";
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
  select:  { min: 3,  max: 40 }, // categoría/lugar/área
  summary: { min: 10, max: 80 }, // opcional
  content: {        max: 1000 },  // opcional
  url:     {        max: 200 },   // opcional (si se escribe)
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

  // Título 3–80
  const t = (p.title ?? "").trim();
  if (t.length < LIMITS.title.min) errors.title = `El título debe tener al menos ${LIMITS.title.min} caracteres`;
  else if (t.length > LIMITS.title.max) errors.title = `El título no puede exceder ${LIMITS.title.max} caracteres`;

  // Categoría/Lugar/Área 3–50
  const cat = (p.category ?? "").trim();
  if (cat.length < LIMITS.select.min) errors.category = `La categoría debe tener al menos ${LIMITS.select.min} caracteres`;
  else if (cat.length > LIMITS.select.max) errors.category = `La categoría no puede exceder ${LIMITS.select.max} caracteres`;

  const plc = (p.place ?? "").trim();
  if (plc.length < LIMITS.select.min) errors.place = `El lugar debe tener al menos ${LIMITS.select.min} caracteres`;
  else if (plc.length > LIMITS.select.max) errors.place = `El lugar no puede exceder ${LIMITS.select.max} caracteres`;

  const ar = (p.area ?? "").trim();
  if (ar.length < LIMITS.select.min) errors.area = `El área debe tener al menos ${LIMITS.select.min} caracteres`;
  else if (ar.length > LIMITS.select.max) errors.area = `El área no puede exceder ${LIMITS.select.max} caracteres`;

  // URL https (opcional, ≤200)
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

  // Resumen opcional 30–200
  const sum = (p.summary ?? "").trim();
  if (sum) {
    if (sum.length < LIMITS.summary.min) errors.summary = `El resumen debe tener al menos ${LIMITS.summary.min} caracteres`;
    else if (sum.length > LIMITS.summary.max) errors.summary = `El resumen no puede exceder ${LIMITS.summary.max} caracteres`;
  }

  // Contenido opcional ≤2000
  const cont = (p.content ?? "");
  if (cont && cont.length > LIMITS.content.max) errors.content = `El contenido no debe exceder ${LIMITS.content.max} caracteres`;

  // Estado (opcional)
  if (p.status && !["EN_PROCESO", "FINALIZADO", "PAUSADO"].includes(p.status)) {
    errors.status = "Estado inválido";
  }

  return errors;
}

/* Selector con menú contextual (ahora soporta min/max/required y onBlur) */
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

  return (
    <div className="relative">
      <label className="text-sm">{label}</label>
      <div className="flex gap-2 items-center">
        <Input
          className="flex-1"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          maxLength={maxLength}
          minLength={minLength}
          required={required}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-100"
          aria-label="Seleccionar de la lista"
          title="Seleccionar de la lista"
        >
          ⋮
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-white border rounded shadow-lg z-10">
          <ul className="max-h-48 overflow-y-auto">
            {options.map((o) => (
              <li
                key={o}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                {o}
              </li>
            ))}
            <li
              className="px-3 py-2 text-sm text-gray-500 italic hover:bg-gray-50 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Otro (escribir manualmente)
            </li>
          </ul>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
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
  }

  // feedback inmediato por campo
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

    // 1) Validación nativa del navegador
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    // 2) Validación personalizada
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
      await onSubmit(payload); // el padre maneja modal/flujo
    } finally {
      setBusy(false);
    }
  }

  // Contador de caracteres
  const CharacterCounter = ({ current, max, min }: { current: number; max: number; min?: number }) => (
    <div className={`text-xs mt-1 ${current > max ? 'text-red-600' : min && current > 0 && current < min ? 'text-orange-600' : 'text-gray-500'}`}>
      {current}/{max}{min ? ` (mín: ${min})` : ""}
    </div>
  );

  return (
    <Card className="p-4">
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate={false}>
        {/* Título 3–80 + contador */}
        <div>
          <label className="text-sm">Título *</label>
          <Input
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
          {errors.title && <p id="title-error" className="text-xs text-red-600 mt-1">{errors.title}</p>}
          <CharacterCounter current={form.title.length} max={LIMITS.title.max} min={LIMITS.title.min} />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <PresetSelectInput
              label="Categoría *"
              value={form.category}
              onChange={(v) => set("category", v)}
              onBlur={() => validateField("category")}
              options={CATEGORIES}
              error={errors.category}
              placeholder={`Ej. Conservación Marina (${LIMITS.select.min}–${LIMITS.select.max})`}
              maxLength={LIMITS.select.max}
              minLength={LIMITS.select.min}
              required
            />
            <CharacterCounter current={form.category.length} max={LIMITS.select.max} min={LIMITS.select.min} />
          </div>

          <div>
            <PresetSelectInput
              label="Lugar *"
              value={form.place}
              onChange={(v) => set("place", v)}
              onBlur={() => validateField("place")}
              options={PLACES}
              error={errors.place}
              placeholder={`Ej. Parque Nacional Barra Honda (${LIMITS.select.min}–${LIMITS.select.max})`}
              maxLength={LIMITS.select.max}
              minLength={LIMITS.select.min}
              required
            />
            <CharacterCounter current={form.place.length} max={LIMITS.select.max} min={LIMITS.select.min} />
          </div>

          <div>
            <PresetSelectInput
              label="Área *"
              value={form.area}
              onChange={(v) => set("area", v)}
              onBlur={() => validateField("area")}
              options={AREAS}
              error={errors.area}
              placeholder={`Ej. Conservación de Humedales (${LIMITS.select.min}–${LIMITS.select.max})`}
              maxLength={LIMITS.select.max}
              minLength={LIMITS.select.min}
              required
            />
            <CharacterCounter current={form.area.length} max={LIMITS.select.max} min={LIMITS.select.min} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Estado</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.status ?? ""}
              onChange={(e) => set("status", (e.target.value as ProjectStatus | "") || undefined)}
              onBlur={() => validateField("status")}
              aria-invalid={!!errors.status}
              aria-describedby="status-error"
            >
              <option value="">—</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="PAUSADO">Pausado</option>
            </select>
            {errors.status && <p id="status-error" className="text-xs text-red-600 mt-1">{errors.status}</p>}
          </div>

          <div className="flex items-end gap-3">
            <input
              id="published"
              type="checkbox"
              checked={!!form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="w-6 h-6 md:w-7 md:h-7 rounded-lg border-gray-300 accent-blue-600"
            />
            <label htmlFor="published" className="text-sm select-none">
              Publicado
            </label>
          </div>
        </div>

        {/* URL solo https + ≤200 */}
        <div>
          <label className="text-sm">URL de portada</label>
          <Input
            value={form.coverUrl ?? ""}
            onChange={(e) => set("coverUrl", e.target.value)}
            onBlur={() => validateField("coverUrl")}
            placeholder="https://ejemplo.com/imagen.jpg"
            type="url"
            pattern="https://.*"
            title="Debe iniciar con https://"
            maxLength={LIMITS.url.max}
            aria-invalid={!!errors.coverUrl}
            aria-describedby="cover-error"
          />
          {errors.coverUrl && <p id="cover-error" className="text-xs text-red-600 mt-1">{errors.coverUrl}</p>}
        </div>

        {/* Resumen opcional 30–200 + contador */}
        <div>
          <label className="text-sm">Resumen (opcional)</label>
          <Input
            value={form.summary ?? ""}
            onChange={(e) => set("summary", e.target.value)}
            onBlur={() => validateField("summary")}
            placeholder={`Mínimo ${LIMITS.summary.min} caracteres, máximo ${LIMITS.summary.max}`}
            maxLength={LIMITS.summary.max}
            aria-invalid={!!errors.summary}
            aria-describedby="summary-error"
          />
          {errors.summary && <p id="summary-error" className="text-xs text-red-600 mt-1">{errors.summary}</p>}
          {form.summary && (
            <CharacterCounter current={(form.summary ?? "").length} max={LIMITS.summary.max} min={LIMITS.summary.min} />
          )}
        </div>

        {/* Contenido opcional ≤2000 + contador */}
        <div>
          <label className="text-sm">Contenido (opcional)</label>
          <textarea
            className="border rounded px-3 py-2 w-full min-h-[120px]"
            value={form.content ?? ""}
            onChange={(e) => set("content", e.target.value)}
            onBlur={() => validateField("content")}
            placeholder={`Máximo ${LIMITS.content.max} caracteres`}
            maxLength={LIMITS.content.max}
            aria-invalid={!!errors.content}
            aria-describedby="content-error"
          />
          {errors.content && <p id="content-error" className="text-xs text-red-600 mt-1">{errors.content}</p>}
          {form.content && <CharacterCounter current={(form.content ?? "").length} max={LIMITS.content.max} />}
        </div>

        {/* Archivos del Proyecto: SOLO en edición */}
        {mode === "edit" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Archivos del Proyecto
            </h3>

            {projectId === 0 ? (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <p className="text-yellow-800 text-sm">
                    💡 Primero guarda el proyecto para poder subir archivos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ProjectFilesManager projectId={projectId} onFilesChange={setProjectFiles} />
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Guardando…" : mode === "create" ? "Siguiente" : "Guardar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}