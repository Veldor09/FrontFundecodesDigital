"use client";

import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useRespuestasFormulario,
  useUpdateEstadoRespuestaFormulario,
} from "@/hooks/useRespuestasFormulario";
import { usePendingRespuestasFormularioCount } from "@/hooks/usePendingRespuestasFormularioCount";
import { Button } from "@/components/ui/button";

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString("es-CR");
}

function prettyTipo(tipo: string) {
  switch (tipo) {
    case "CONTACTO":
      return "Contáctenos";
    case "VOLUNTARIADO":
      return "Voluntariado";
    case "ALIANZA":
      return "Alianza";
    case "COMENTARIO":
      return "Comentario";
    default:
      return tipo;
  }
}

function prettyPayloadKey(key: string) {
  switch (key) {
    case "mensaje":
      return "Mensaje";
    case "disponibilidad":
      return "Disponibilidad";
    case "areaInteres":
      return "Área de interés";
    case "organizacion":
      return "Organización";
    case "propuesta":
      return "Propuesta";
    case "comentario":
      return "Comentario";
    default:
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase());
  }
}

function renderPayloadFields(payload: Record<string, any>) {
  const entries = Object.entries(payload || {}).filter(([, value]) => {
    if (value === null || value === undefined) return false;
    return String(value).trim() !== "";
  });

  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-500">No hay contenido disponible.</p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {prettyPayloadKey(key)}
          </p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">
            {String(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

type EstadoFormulario = "PENDIENTE" | "ACEPTADO" | "RECHAZADO";
type TipoGestionFormulario = "CONTACTO" | "VOLUNTARIADO";

type RespuestaFormularioItem = {
  id: string;
  tipoFormulario: string;
  nombre?: string | null;
  correo?: string | null;
  telefono?: string | null;
  payload: Record<string, any>;
  estado: EstadoFormulario;
  createdAt: string;
  updatedAt?: string;
};

export default function RespuestasFormularioAdminPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<RespuestaFormularioItem | null>(null);

  const [tipoActivo, setTipoActivo] =
    useState<TipoGestionFormulario>("CONTACTO");

  const [estadoActivo, setEstadoActivo] =
    useState<EstadoFormulario>("PENDIENTE");

  const params = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      tipoFormulario: tipoActivo,
      estado: estadoActivo,
    }),
    [page, limit, search, tipoActivo, estadoActivo]
  );

  const { data, isLoading, isError, error } = useRespuestasFormulario(params);
  const updateEstado = useUpdateEstadoRespuestaFormulario();

  const {
    data: pendingCounts,
    refetch: refetchPendingCounts,
  } = usePendingRespuestasFormularioCount();

  const contactoCount = pendingCounts?.contacto ?? 0;
  const voluntariadoCount = pendingCounts?.voluntariado ?? 0;

  const items = (data?.data ?? []) as RespuestaFormularioItem[];
  const meta = data?.meta;

  function handleChangeEstado(id: string, nuevoEstado: EstadoFormulario) {
    updateEstado.mutate(
      { id, estado: nuevoEstado },
      {
        onSuccess: () => {
          refetchPendingCounts();
        },
      }
    );
  }

  function handleClearFilters() {
    setPage(1);
    setSearch("");
  }

  const tituloSeccion =
    tipoActivo === "CONTACTO"
      ? estadoActivo === "PENDIENTE"
        ? "Formularios de Contáctenos Pendientes"
        : estadoActivo === "ACEPTADO"
        ? "Formularios de Contáctenos Aceptados"
        : "Formularios de Contáctenos Rechazados"
      : estadoActivo === "PENDIENTE"
      ? "Formularios de Voluntariado Pendientes"
      : estadoActivo === "ACEPTADO"
      ? "Formularios de Voluntariado Aceptados"
      : "Formularios de Voluntariado Rechazados";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 border-b border-slate-200 pb-6">
        <h1 className="text-center text-3xl font-bold text-slate-900">
          Bienvenido al área Gestión de Respuestas de Formularios
        </h1>

        <div className="mt-6">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* TABS TIPO FORMULARIO */}
      <section className="mb-4">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              setTipoActivo("CONTACTO");
              setPage(1);
            }}
            className={`relative gap-2 ${
              tipoActivo === "CONTACTO"
                ? "bg-sky-700 text-white hover:bg-sky-800"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>Contáctenos</span>

            {contactoCount > 0 && (
              <span
                className={`inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                  tipoActivo === "CONTACTO"
                    ? "bg-white text-sky-700"
                    : "bg-red-600 text-white"
                }`}
              >
                {contactoCount > 99 ? "99+" : contactoCount}
              </span>
            )}
          </Button>

          <Button
            type="button"
            onClick={() => {
              setTipoActivo("VOLUNTARIADO");
              setPage(1);
            }}
            className={`relative gap-2 ${
              tipoActivo === "VOLUNTARIADO"
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>Voluntariado</span>

            {voluntariadoCount > 0 && (
              <span
                className={`inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                  tipoActivo === "VOLUNTARIADO"
                    ? "bg-white text-emerald-700"
                    : "bg-red-600 text-white"
                }`}
              >
                {voluntariadoCount > 99 ? "99+" : voluntariadoCount}
              </span>
            )}
          </Button>
        </div>
      </section>

      {/* TABS ESTADO */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              setEstadoActivo("PENDIENTE");
              setPage(1);
            }}
            className={
              estadoActivo === "PENDIENTE"
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }
          >
            Pendientes
          </Button>

          <Button
            type="button"
            onClick={() => {
              setEstadoActivo("ACEPTADO");
              setPage(1);
            }}
            className={
              estadoActivo === "ACEPTADO"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }
          >
            Aceptados
          </Button>

          <Button
            type="button"
            onClick={() => {
              setEstadoActivo("RECHAZADO");
              setPage(1);
            }}
            className={
              estadoActivo === "RECHAZADO"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }
          >
            Rechazados
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{tituloSeccion}</h2>

          <p className="text-slate-500">
            Visualiza, filtra y gestiona las respuestas enviadas desde los
            formularios públicos.
          </p>
        </div>

        {/* FILTROS */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-medium hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* TABLA */}
        {isLoading ? (
          <div className="rounded-lg border border-slate-200 p-4 text-slate-600">
            Cargando respuestas...
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            Ocurrió un error al cargar las respuestas.
            <div className="mt-1 text-xs">
              {error instanceof Error ? error.message : "Error desconocido"}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-800">
                    Tipo
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800">
                    Nombre
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800">
                    Correo
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800">
                    Fecha
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800">
                    Detalle
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      No hay formularios en esta sección.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-200 align-top"
                    >
                      <td className="px-4 py-3">
                        {prettyTipo(item.tipoFormulario)}
                      </td>
                      <td className="px-4 py-3">{item.nombre || "—"}</td>
                      <td className="px-4 py-3">{item.correo || "—"}</td>
                      <td className="px-4 py-3">{item.telefono || "—"}</td>

                      <td className="px-4 py-3">
                        <select
                          value={item.estado}
                          onChange={(e) =>
                            handleChangeEstado(
                              item.id,
                              e.target.value as EstadoFormulario
                            )
                          }
                          className="rounded border border-slate-300 px-2 py-1"
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="ACEPTADO">Aceptado</option>
                          <option value="RECHAZADO">Rechazado</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">{formatDate(item.createdAt)}</td>

                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          onClick={() => setSelectedItem(item)}
                        >
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {meta ? (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Página {meta.page} de {meta.totalPages} · Total: {meta.total}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Detalle del formulario
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Revisa toda la información enviada por el usuario.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tipo
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {prettyTipo(selectedItem.tipoFormulario)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedItem.estado}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedItem.nombre || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Correo
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-900">
                    {selectedItem.correo || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Teléfono
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedItem.telefono || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha de envío
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {formatDate(selectedItem.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contenido del formulario
                </p>
                <div className="mt-3">
                  {renderPayloadFields(selectedItem.payload)}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-4">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent"
                onClick={() => setSelectedItem(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}