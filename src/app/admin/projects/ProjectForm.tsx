"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Project, ProjectStatus } from "@/lib/projects.types";

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

const DEFAULT_FORM: ProjectFormInput = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  coverUrl: "",
  category: "",
  place: "",
  area: "",
  status: "EN_PROCESO",
  published: true,
};

export default function ProjectForm({ initial, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<ProjectFormInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!initial) return;

    // Mapeo seguro de initial (Partial<Project>) a ProjectFormInput
    setForm((prev) => ({
      ...prev,
      title: initial.title ?? prev.title,
      slug: initial.slug ?? prev.slug,
      summary: initial.summary ?? prev.summary,
      content: initial.content ?? prev.content,
      coverUrl: initial.coverUrl ?? prev.coverUrl,
      category: initial.category ?? prev.category,
      place: initial.place ?? prev.place,
      area: initial.area ?? prev.area,
      status: (initial.status as ProjectStatus | undefined) ?? prev.status,
      published: initial.published ?? prev.published,
    }));
  }, [initial]);

  function set<K extends keyof ProjectFormInput>(key: K, value: ProjectFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload: ProjectFormInput = {
      title: form.title?.trim(),
      slug: form.slug?.trim() || undefined,
      summary: form.summary?.trim() || undefined,
      content: form.content || undefined,
      coverUrl: form.coverUrl?.trim() || undefined,
      category: form.category?.trim(),
      place: form.place?.trim(),
      area: form.area?.trim(),
      status: form.status,
      published: Boolean(form.published),
    };

    const errs = validate(payload);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    try {
      await onSubmit(payload);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-4">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Título *</label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm">Slug (opcional)</label>
            <Input
              value={form.slug ?? ""}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="mi-proyecto-en-talamanca"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm">Categoría *</label>
            <Input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="text-sm">Lugar *</label>
            <Input
              value={form.place}
              onChange={(e) => set("place", e.target.value)}
            />
            {errors.place && <p className="text-xs text-red-600 mt-1">{errors.place}</p>}
          </div>

          <div>
            <label className="text-sm">Área *</label>
            <Input
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
            />
            {errors.area && <p className="text-xs text-red-600 mt-1">{errors.area}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Estado</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.status ?? ""}
              onChange={(e) =>
                set("status", (e.target.value as ProjectStatus | "") || undefined)
              }
            >
              <option value="">—</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="PAUSADO">Pausado</option>
            </select>
            {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status}</p>}
          </div>

          <div className="flex items-end gap-2">
            <input
              id="published"
              type="checkbox"
              checked={!!form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            <label htmlFor="published" className="text-sm">
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
          <Input
            value={form.summary ?? ""}
            onChange={(e) => set("summary", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Contenido (opcional)</label>
          <textarea
            className="border rounded px-3 py-2 w-full min-h-[120px]"
            value={form.content ?? ""}
            onChange={(e) => set("content", e.target.value)}
          />
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
