"use client";

import { useMemo, useState } from "react";
import { useProgramaVoluntariadoCrud } from "../hooks/useProgramaVoluntariadoCrud";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FormState = {
  id?: string | number;
  nombre: string;
  lugar: string;
  descripcion: string;
};

export default function Page() {
  const { data, loading, create, update, remove } = useProgramaVoluntariadoCrud();

  const programas = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombre: "",
    lugar: "",
    descripcion: "",
  });

  const editing = Boolean(form.id);

  function openCreate() {
    setForm({ nombre: "", lugar: "", descripcion: "" });
    setOpen(true);
  }

  function openEdit(p: any) {
    setForm({
      id: p.id,
      nombre: p.nombre ?? "",
      lugar: p.lugar ?? "",
      descripcion: p.descripcion ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.nombre.trim()) return toast.error("El nombre es requerido");
    if (!form.lugar.trim()) return toast.error("El lugar es requerido");

    setSaving(true);
    try {
      if (editing) {
        await update(form.id!, {
          nombre: form.nombre.trim(),
          lugar: form.lugar.trim(),
          descripcion: form.descripcion?.trim() || "",
        });
        toast.success("Programa actualizado");
      } else {
        await create({
          nombre: form.nombre.trim(),
          lugar: form.lugar.trim(),
          descripcion: form.descripcion?.trim() || "",
        });
        toast.success("Programa creado");
      }
      setOpen(false);
    } catch (e) {
      toast.error("No se pudo guardar");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string | number) {
    if (!confirm("¿Eliminar este programa?")) return;
    try {
      await remove(id);
      toast.success("Programa eliminado");
    } catch (e) {
      toast.error("No se pudo eliminar");
      console.error(e);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Programas de Voluntariado
            </h1>
            <p className="text-slate-500 text-sm">
              Crea y administra programas para luego asignar voluntarios.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
            + Nuevo programa
          </Button>
        </div>

        <div className="rounded-xl border bg-white overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Lugar</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Descripción</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700 w-[160px]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={4}>
                    Cargando...
                  </td>
                </tr>
              ) : programas.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={4}>
                    No hay programas todavía. Creá el primero.
                  </td>
                </tr>
              ) : (
                programas.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3">{p.lugar}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.descripcion ? p.descripcion : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => handleDelete(p.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal create/edit */}
        <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar programa" : "Nuevo programa"}>
          <div className="max-w-xl w-full space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Reforestación 2026"
              />
            </div>

            <div className="space-y-2">
              <Label>Lugar</Label>
              <Input
                value={form.lugar}
                onChange={(e) => setForm((prev) => ({ ...prev, lugar: e.target.value }))}
                placeholder="Ej: Nicoya, Guanacaste"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Opcional"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}