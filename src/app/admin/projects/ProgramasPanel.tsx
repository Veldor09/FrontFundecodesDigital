"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { useProgramaVoluntariadoCrud } from "@/app/admin/voluntariado/hooks/useProgramaVoluntariadoCrud";

type FormState = {
  id?: string | number;
  nombre: string;
  lugar: string;
  descripcion: string;
  limiteParticipantes: string;
};

export default function ProgramasPanel() {
  const { data, loading, create, update, remove } = useProgramaVoluntariadoCrud();
  const programas = Array.isArray(data) ? data : [];

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombre: "",
    lugar: "",
    descripcion: "",
    limiteParticipantes: "0",
  });

  const editing = Boolean(form.id);

  function openCreate() {
    setForm({ nombre: "", lugar: "", descripcion: "", limiteParticipantes: "0" });
    setOpen(true);
  }

  function openEdit(p: any) {
    setForm({
      id: p.id,
      nombre: p.nombre ?? "",
      lugar: p.lugar ?? "",
      descripcion: p.descripcion ?? "",
      limiteParticipantes: String(p.limiteParticipantes ?? 0),
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.nombre.trim()) return toast.error("El nombre es requerido");
    if (!form.lugar.trim()) return toast.error("El lugar es requerido");
    const limite = Number(form.limiteParticipantes);
    if (!Number.isFinite(limite) || limite < 0) return toast.error("Límite inválido");

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        lugar: form.lugar.trim(),
        descripcion: form.descripcion?.trim() || "",
        limiteParticipantes: limite,
      };
      if (editing) {
        await update(form.id!, payload);
        toast.success("Programa actualizado");
      } else {
        await create(payload);
        toast.success("Programa creado");
      }
      setOpen(false);
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string | number) {
    if (!confirm("¿Eliminar este programa?")) return;
    try {
      await remove(id);
      toast.success("Programa eliminado");
    } catch {
      toast.error("No se pudo eliminar");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Programas</h2>
          <p className="text-sm text-slate-500">Crea y administra programas para luego asignar voluntarios.</p>
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
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Límite</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Cupos</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>Cargando...</td>
              </tr>
            ) : programas.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={6}>No hay programas todavía. Crea el primero.</td>
              </tr>
            ) : (
              programas.map((p: any) => {
                const asignados = Array.isArray(p?.voluntarios) ? p.voluntarios.length : 0;
                const limite = Number(p?.limiteParticipantes ?? 0);
                const sinLimite = limite === 0;
                const disponibles = sinLimite ? null : Math.max(limite - asignados, 0);
                const lleno = !sinLimite && asignados >= limite;

                return (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{p.lugar}</td>
                    <td className="px-4 py-3 text-slate-600">{p.descripcion || "—"}</td>
                    <td className="px-4 py-3">{sinLimite ? "Sin límite" : limite}</td>
                    <td className="px-4 py-3">
                      {sinLimite ? (
                        <span className="text-slate-500">Ilimitado</span>
                      ) : (
                        <span className={lleno ? "text-red-600 font-medium" : "text-slate-700"}>
                          {asignados}/{limite} · {disponibles} disponibles
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:border-red-300"
                          onClick={() => handleDelete(p.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-xl font-bold mb-4">{editing ? "Editar programa" : "Nuevo programa"}</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="lugar">Lugar *</Label>
            <Input id="lugar" value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="desc">Descripción</Label>
            <Input id="desc" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="limite">Límite de participantes (0 = sin límite)</Label>
            <Input
              id="limite"
              type="number"
              min="0"
              value={form.limiteParticipantes}
              onChange={(e) => setForm({ ...form, limiteParticipantes: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear programa"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
