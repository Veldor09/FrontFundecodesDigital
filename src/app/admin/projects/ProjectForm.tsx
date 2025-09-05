"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Project, ProjectStatus } from "@/lib/projects.types";
import { ProjectFilesManager } from "./ProjectFilesManager";
import { Upload } from "lucide-react";
import { uploadProjectFile, deleteProjectFile, getProjectFiles } from "@/services/projects.service";

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
};

function validate(p: ProjectFormInput) {
  const errors: Record<string, string> = {};
  if (!p.title || p.title.trim().length < 3) errors.title = "Título mínimo 3 caracteres";
  if (!p.category || p.category.trim().length === 0) errors.category = "Categoría es obligatoria";
  if (!p.place || p.place.trim().length === 0) errors.place = "Lugar es obligatorio";
  if (!p.area || p.area.trim().length === 0) errors.area = "Área es obligatoria";

  if (p.coverUrl && p.coverUrl.trim() !== "") {
    try {
      const u = new URL(p.coverUrl);
      if (!(u.protocol === "http:" || u.protocol === "https:")) throw new Error();
    } catch {
      errors.coverUrl = "URL de imagen inválida";
    }
  }

  if (p.status && !["EN_PROCESO", "FINALIZADO", "PAUSADO"].includes(p.status)) {
    errors.status = "Estado inválido";
  }

  return errors;
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

/* Selector con menú contextual */
function PresetSelectInput({
  label,
  value,
  onChange,
  options,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[];
  error?: string;
  placeholder?: string;
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
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-100"
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

/* Formulario principal */
export default function ProjectForm({ initial, onCancel, onSubmit }: Props) {
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

  // Cargar archivos cuando hay un proyecto existente
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
      console.error('Error al cargar archivos del proyecto:', error);
      setProjectFiles([]);
    }
  };

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Funciones para manejar archivos
  const handleFileSelect = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|gif|txt)$/i)) {
      alert('Tipo de archivo no permitido. Use: PDF, JPG, PNG, GIF, TXT');
      return false;
    }
    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (projectId === 0) {
      alert('Primero debes guardar el proyecto antes de subir archivos');
      throw new Error('Proyecto no guardado');
    }

    try {
      await uploadProjectFile(projectId, file);
      await loadProjectFiles();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error al subir archivo: ${error.message}`);
      } else {
        alert('Error desconocido al subir archivo');
      }
      throw error;
    }
  };

  const handleFilesChange = (files: any[]) => {
    setProjectFiles(files);
  };

  const handleDeleteFile = async (file: any) => {
    if (!confirm(`¿Estás seguro de eliminar el archivo "${file.name}"?`)) return;

    try {
      await deleteProjectFile(projectId, file.url);
      await loadProjectFiles();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error al eliminar archivo: ${error.message}`);
      } else {
        alert('Error desconocido al eliminar archivo');
      }
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
      // Si es un proyecto nuevo, el ID se actualizará cuando initial cambie
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-4">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm">Título *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <PresetSelectInput
            label="Categoría *"
            value={form.category}
            onChange={(v) => set("category", v)}
            options={CATEGORIES}
            error={errors.category}
            placeholder="Ej. Conservación Marina"
          />

          <PresetSelectInput
            label="Lugar *"
            value={form.place}
            onChange={(v) => set("place", v)}
            options={PLACES}
            error={errors.place}
            placeholder="Ej. Parque Nacional Barra Honda"
          />

          <PresetSelectInput
            label="Área *"
            value={form.area}
            onChange={(v) => set("area", v)}
            options={AREAS}
            error={errors.area}
            placeholder="Ej. Conservación de Humedales"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Estado</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.status ?? ""}
              onChange={(e) => set("status", (e.target.value as ProjectStatus | "") || undefined)}
            >
              <option value="">—</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="PAUSADO">Pausado</option>
            </select>
            {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status}</p>}
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

        <div>
          <label className="text-sm">URL de portada</label>
          <Input
            value={form.coverUrl ?? ""}
            onChange={(e) => set("coverUrl", e.target.value)}
            placeholder="https://…"
          />
          {errors.coverUrl && <p className="text-xs text-red-600 mt-1">{errors.coverUrl}</p>}
        </div>

        <div>
          <label className="text-sm">Resumen (opcional)</label>
          <Input value={form.summary ?? ""} onChange={(e) => set("summary", e.target.value)} />
        </div>

        <div>
          <label className="text-sm">Contenido (opcional)</label>
          <textarea
            className="border rounded px-3 py-2 w-full min-h-[120px]"
            value={form.content ?? ""}
            onChange={(e) => set("content", e.target.value)}
          />
        </div>

        {/* ➡️ SECCIÓN COMPLETA: Archivos del Proyecto */}
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
            <>
              <ProjectFilesManager 
                projectId={projectId}
                onFilesChange={handleFilesChange}
              />
            </>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}