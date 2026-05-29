"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/ui/Modal";
import ConfirmModal, { type ConfirmState } from "@/components/ui/ConfirmModal";
import { toast } from "sonner";
import {
  apiListExternalCollaborators,
  apiCreateExternalCollaborator,
  apiUpdateExternalCollaborator,
  apiDeleteExternalCollaborator,
} from "../services/collaborators.api";
import { listAreasSelector } from "@/services/areas.service";
import type { AreaSelector } from "@/services/areas.service";

type ExternalRol =
  | "colaboradorsolicitante"
  | "colaboradorvoluntariadoexterno";

interface ExternalColaborador {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string | null;
  rol: ExternalRol;
  estado: string;
  areaId?: number | null;
  areaOrg?: { id: number; nombre: string } | null;
}

type FormState = {
  id?: number;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  rol: ExternalRol;
  areaId: string;
};

const EMPTY_FORM: FormState = {
  nombreCompleto: "",
  correo: "",
  telefono: "",
  rol: "colaboradorsolicitante",
  areaId: "",
};

const ROL_LABELS: Record<ExternalRol, string> = {
  colaboradorsolicitante: "Solicitante",
  colaboradorvoluntariadoexterno: "Vol. Externo",
};

export default function ExternalCollaboratorsPanel() {
  const [items, setItems] = useState<ExternalColaborador[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [areas, setAreas] = useState<AreaSelector[]>([]);

  const editing = Boolean(form.id);

  const load = useCallback(
    async (pg = page) => {
      setLoading(true);
      try {
        const res = await apiListExternalCollaborators({
          q: q || undefined,
          page: pg,
          pageSize,
        });
        setItems(res.items ?? []);
        setTotal(res.total ?? 0);
      } catch {
        toast.error("No se pudieron cargar los colaboradores externos");
      } finally {
        setLoading(false);
      }
    },
    [q, page, pageSize]
  );

  useEffect(() => {
    load(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    listAreasSelector().then(setAreas).catch(() => {});
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(c: ExternalColaborador) {
    setForm({
      id: c.id,
      nombreCompleto: c.nombreCompleto,
      correo: c.correo,
      telefono: c.telefono ?? "",
      rol: c.rol,
      areaId: c.areaId ? String(c.areaId) : "",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.nombreCompleto.trim()) return toast.error("El nombre es obligatorio");
    if (!form.correo.trim()) return toast.error("El correo es obligatorio");
    if (!form.areaId) return toast.error("Debe seleccionar un área");

    // Validar formato de teléfono si se ingresó
    const tel = form.telefono.trim();
    if (tel && !/^\+\d{6,20}$/.test(tel)) {
      return toast.error("El teléfono debe estar en formato E.164 (ej: +50688888888)");
    }

    setSaving(true);
    try {
      if (editing && form.id) {
        await apiUpdateExternalCollaborator(form.id, {
          nombreCompleto: form.nombreCompleto.trim(),
          correo: form.correo.trim(),
          telefono: tel || null,
          rol: form.rol,
          areaId: Number(form.areaId),
        });
        toast.success("Colaborador actualizado");
      } else {
        await apiCreateExternalCollaborator({
          nombreCompleto: form.nombreCompleto.trim(),
          correo: form.correo.trim(),
          telefono: tel || null,
          rol: form.rol,
          areaId: Number(form.areaId),
        });
        toast.success("Colaborador externo creado — se le enviará un correo para configurar su contraseña");
      }
      setOpen(false);
      load(editing ? page : 1);
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(c: ExternalColaborador) {
    setConfirmState({
      title: "Eliminar colaborador",
      message: `¿Eliminar a ${c.nombreCompleto}? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await apiDeleteExternalCollaborator(c.id);
          toast.success("Colaborador eliminado");
          load(1);
          setPage(1);
        } catch {
          toast.error("No se pudo eliminar");
        }
      },
    });
  }

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Colaboradores Externos</h2>
          <p className="text-sm text-slate-500">
            Usuarios externos asignados a un área: solicitantes de factura y voluntariado externo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => load(page)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Recargar
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> Nuevo externo
          </Button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="max-w-xs">
        <Input
          placeholder="Buscar por nombre o correo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-sm text-slate-400 py-6 text-center">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          No hay colaboradores externos registrados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Nombre</th>
                <th className="px-4 py-2 text-left font-medium">Correo</th>
                <th className="px-4 py-2 text-left font-medium">Teléfono</th>
                <th className="px-4 py-2 text-center font-medium">Rol</th>
                <th className="px-4 py-2 text-center font-medium">Área</th>
                <th className="px-4 py-2 text-center font-medium">Estado</th>
                <th className="px-4 py-2 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 font-medium text-slate-800">{c.nombreCompleto}</td>
                  <td className="px-4 py-2 text-slate-600">{c.correo}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {c.telefono ?? <span className="italic text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                      {ROL_LABELS[c.rol] ?? c.rol}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-center text-xs text-blue-600 font-medium">
                    {c.areaOrg?.nombre ?? (
                      <span className="italic text-slate-300">Sin área</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge
                      className={
                        c.estado === "ACTIVO"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }
                    >
                      {c.estado}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        title="Editar"
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        title="Eliminar"
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </Button>
          <span className="text-sm text-slate-500">
            Página {page} de {totalPages} ({total} registros)
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente →
          </Button>
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-6 space-y-4 min-w-[340px]">
          <h2 className="text-lg font-bold text-slate-800">
            {editing ? "Editar colaborador externo" : "Nuevo colaborador externo"}
          </h2>

          <div className="space-y-1">
            <Label htmlFor="ext-nombre">
              Nombre completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ext-nombre"
              value={form.nombreCompleto}
              onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
              placeholder="Ej: María García"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ext-correo">
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ext-correo"
              type="email"
              value={form.correo}
              onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
              placeholder="usuario@ejemplo.com"
              disabled={editing}
            />
            {editing && (
              <p className="text-xs text-slate-400">El correo no se puede cambiar una vez creado.</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="ext-tel">Teléfono (formato E.164)</Label>
            <Input
              id="ext-tel"
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              placeholder="+50688888888"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ext-rol">
              Rol <span className="text-red-500">*</span>
            </Label>
            <select
              id="ext-rol"
              value={form.rol}
              onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value as ExternalRol }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="colaboradorsolicitante">Solicitante (crea solicitudes de factura)</option>
              <option value="colaboradorvoluntariadoexterno">Voluntariado Externo (gestiona voluntarios)</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="ext-area">
              Área asignada <span className="text-red-500">*</span>
            </Label>
            <select
              id="ext-area"
              value={form.areaId}
              onChange={(e) => setForm((f) => ({ ...f, areaId: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Seleccionar área —</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
            {areas.length === 0 && (
              <p className="text-xs text-amber-500">
                No hay áreas activas. Primero crea un área en la sección Proyectos → Áreas.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear colaborador"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}
