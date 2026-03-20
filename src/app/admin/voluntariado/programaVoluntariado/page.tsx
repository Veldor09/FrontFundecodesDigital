"use client";

import { useMemo, useState } from "react";
import { useVoluntarios } from "../hooks/useVoluntarios";
import { useProgramaVoluntariado } from "../hooks/useProgramaVoluntariado";
import { Voluntario } from "../types/voluntario";
import { ProgramaVoluntariado, OrigenVoluntariado } from "../types/programaVoluntariado";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search } from "lucide-react";

type EstadoFiltro = "todos" | "activo" | "inactivo";
type FiltroAsignacion = "todos" | "asignados" | "sin-asignar";
type FiltroLugar = "todos" | string;

export default function Page() {
  const { data: voluntariosRaw } = useVoluntarios();
  const { data: programas, assign, unassign, setPago } = useProgramaVoluntariado();

  const voluntarios: Voluntario[] = useMemo(() => {
    if (Array.isArray(voluntariosRaw)) return voluntariosRaw as Voluntario[];
    if (voluntariosRaw && Array.isArray((voluntariosRaw as any).data)) {
      return (voluntariosRaw as any).data as Voluntario[];
    }
    return [];
  }, [voluntariosRaw]);

  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState<EstadoFiltro>("todos");
  const [fLugar, setFLugar] = useState<FiltroLugar>("todos");
  const [fAsignacion, setFAsignacion] = useState<FiltroAsignacion>("todos");

  const countProgramas = programas.length;
  const countVoluntariosActivos = voluntarios.filter((v) => v.estado === "ACTIVO").length;

  const getVolId = (v: Voluntario) => String((v as any).id);

  const getProgramaStats = (p: ProgramaVoluntariado) => {
    const asignados = p.voluntariosAsignados?.length || 0;
    const limite = Number(p.limiteParticipantes ?? 0);
    const sinLimite = limite === 0;
    const disponibles = sinLimite ? null : Math.max(limite - asignados, 0);
    const lleno = !sinLimite && asignados >= limite;

    return {
      asignados,
      limite,
      sinLimite,
      disponibles,
      lleno,
    };
  };

  const asignacionesPorVoluntario: Record<string, ProgramaVoluntariado[]> = useMemo(() => {
    const map: Record<string, ProgramaVoluntariado[]> = {};
    for (const v of voluntarios) map[getVolId(v)] = [];

    for (const p of programas) {
      for (const vid of p.voluntariosAsignados || []) {
        const key = String(vid);
        if (!map[key]) map[key] = [];
        map[key].push(p);
      }
    }

    return map;
  }, [voluntarios, programas]);

  const totalAsignaciones = useMemo(
    () => programas.reduce((acc, p) => acc + (p.voluntariosAsignados?.length || 0), 0),
    [programas]
  );

  const sinAsignar = useMemo(
    () =>
      voluntarios.filter((v) => (asignacionesPorVoluntario[getVolId(v)] || []).length === 0)
        .length,
    [voluntarios, asignacionesPorVoluntario]
  );

  const lugaresDisponibles = useMemo(() => {
    const set = new Set<string>();
    programas.forEach((p) => set.add(p.lugar));
    return Array.from(set);
  }, [programas]);

  const filteredVols = useMemo(() => {
    return voluntarios
      .filter((v) => (fEstado === "todos" ? true : v.estado.toLowerCase() === fEstado))
      .filter((v) => {
        if (fAsignacion === "todos") return true;
        const count = (asignacionesPorVoluntario[getVolId(v)] || []).length;
        return fAsignacion === "asignados" ? count > 0 : count === 0;
      })
      .filter((v) => {
        if (fLugar === "todos") return true;
        const programasV = asignacionesPorVoluntario[getVolId(v)] || [];
        return programasV.some((p) => p.lugar === fLugar);
      })
      .filter((v) =>
        [v.nombreCompleto, v.numeroDocumento, v.email].some((f) =>
          f?.toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [voluntarios, fEstado, fAsignacion, fLugar, search, asignacionesPorVoluntario]);

  const [seleccionPrograma, setSeleccionPrograma] = useState<Record<string, string>>({});
  const [origenPorVol, setOrigenPorVol] = useState<Record<string, OrigenVoluntariado>>({});
  const [empresaPorVol, setEmpresaPorVol] = useState<Record<string, string>>({});

  const programasDisponiblesPorVol = (volIdStr: string) =>
    programas.filter((p) => {
      const yaAsignado = (p.voluntariosAsignados || []).map(String).includes(volIdStr);
      if (yaAsignado) return false;

      const stats = getProgramaStats(p);
      if (stats.lleno) return false;

      return true;
    });

  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkOrigen, setBulkOrigen] = useState<OrigenVoluntariado>("CUENTA_PROPIA");
  const [bulkEmpresa, setBulkEmpresa] = useState("");
  const [bulkProgramaId, setBulkProgramaId] = useState<string>("");
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [bulkPagoProgramaId, setBulkPagoProgramaId] = useState<string>("");
  const [bulkPagoValue, setBulkPagoValue] = useState<"PAGO" | "NO_PAGO">("PAGO");
  const [bulkPagoSaving, setBulkPagoSaving] = useState(false);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const selectedCount = selectedIds.length;

  const toggleSelect = (volIdStr: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [volIdStr]: checked }));
  };

  const clearSelection = () => setSelected({});

  const selectAllFiltered = () => {
    const next: Record<string, boolean> = { ...selected };
    for (const v of filteredVols) {
      const id = getVolId(v);
      if (v.estado === "ACTIVO") next[id] = true;
    }
    setSelected(next);
  };

  const unselectAllFiltered = () => {
    const next: Record<string, boolean> = { ...selected };
    for (const v of filteredVols) {
      const id = getVolId(v);
      delete next[id];
    }
    setSelected(next);
  };

  const handleBulkAssign = async () => {
    if (!bulkProgramaId) {
      toast.error("Selecciona un programa para asignar");
      return;
    }

    if (selectedCount === 0) {
      toast.error("Selecciona al menos 1 voluntario");
      return;
    }

    const programa = programas.find((p) => String(p.id) === String(bulkProgramaId));
    if (!programa) {
      toast.error("Programa no encontrado");
      return;
    }

    const stats = getProgramaStats(programa);
    if (stats.lleno) {
      toast.error(`El programa ya alcanzó su límite de ${stats.limite} participantes`);
      return;
    }

    const empresaTrim = bulkEmpresa.trim();
    if (bulkOrigen === "INTERMEDIARIO" && !empresaTrim) {
      toast.error("Debes indicar el nombre de la empresa/intermediario");
      return;
    }

    setBulkAssigning(true);

    let ok = 0;
    let duplicated = 0;
    let failed = 0;

    try {
      for (const vid of selectedIds) {
        try {
          const res: any = await assign(vid, bulkProgramaId, {
            origen: bulkOrigen,
            intermediario: bulkOrigen === "INTERMEDIARIO" ? empresaTrim : null,
          });

          if (res?.duplicated) duplicated += 1;
          else ok += 1;
        } catch (e: any) {
          failed += 1;
          console.error("Bulk assign error for", vid, e);
        }
      }

      clearSelection();

      toast.success(
        `Asignación masiva completada: ${ok} ok${
          duplicated ? ` · ${duplicated} ya estaban` : ""
        }${failed ? ` · ${failed} fallaron` : ""}`
      );
    } finally {
      setBulkAssigning(false);
    }
  };

  const handleAsignar = async (vol: Voluntario) => {
    const vid = getVolId(vol);
    const programaId = seleccionPrograma[vid];

    if (!programaId) {
      toast.error("Selecciona un programa para asignar");
      return;
    }

    const origen = origenPorVol[vid] ?? "CUENTA_PROPIA";
    const empresa = (empresaPorVol[vid] ?? "").trim();

    if (origen === "INTERMEDIARIO" && !empresa) {
      toast.error("Debes indicar el nombre de la empresa/intermediario");
      return;
    }

    try {
      await assign(vid, String(programaId), {
        origen,
        intermediario: origen === "INTERMEDIARIO" ? empresa : null,
      });

      toast.success("Voluntario asignado");
      setSeleccionPrograma((prev) => ({ ...prev, [vid]: "" }));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "No se pudo asignar";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
      console.error(e);
    }
  };

  const handleDesasignar = async (volIdStr: string, programaId: number | string) => {
    try {
      await unassign(volIdStr, String(programaId));
      toast.success("Asignación eliminada");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? e?.message ?? "No se pudo eliminar la asignación";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
      console.error(e);
    }
  };

  const handleTogglePago = async (volIdStr: string, programa: ProgramaVoluntariado) => {
    const info = programa.asignacionesPorVoluntario?.[volIdStr];
    const current = Boolean(info?.pagoRealizado);

    try {
      await setPago(volIdStr, String(programa.id), !current);
      toast.success(!current ? "Marcado como pagado" : "Marcado como no pagado");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "No se pudo actualizar el pago";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Gestión de Voluntarios en Programas
          </h1>
          <p className="text-slate-500 text-sm">
            Visualiza y asigna voluntarios a programas de voluntariado
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-slate-500 text-sm">Programas</div>
            <div className="text-3xl font-bold mt-1">{countProgramas}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-slate-500 text-sm">Voluntarios Activos</div>
            <div className="text-3xl font-bold mt-1">{countVoluntariosActivos}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-slate-500 text-sm">Asignaciones Totales</div>
            <div className="text-3xl font-bold mt-1">{totalAsignaciones}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-slate-500 text-sm">Sin Asignar</div>
            <div className="text-3xl font-bold mt-1">{sinAsignar}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bulkMode}
                onChange={(e) => {
                  setBulkMode(e.target.checked);
                  if (!e.target.checked) clearSelection();
                }}
              />
              <span className="text-sm font-medium text-slate-800">Selección múltiple</span>

              {bulkMode && (
                <span className="text-xs text-slate-500">({selectedCount} seleccionados)</span>
              )}
            </div>

            {bulkMode && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={selectAllFiltered}>
                  Seleccionar todos (filtrados)
                </Button>
                <Button size="sm" variant="outline" onClick={unselectAllFiltered}>
                  Quitar selección (filtrados)
                </Button>
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>

          {bulkMode && (
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-6">
                <div className="text-xs font-semibold text-slate-700 mb-2">Asignación masiva</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Origen
                    </label>
                    <select
                      value={bulkOrigen}
                      onChange={(e) => setBulkOrigen(e.target.value as OrigenVoluntariado)}
                      className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="CUENTA_PROPIA">Cuenta propia</option>
                      <option value="INTERMEDIARIO">Empresa / Intermediario</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Empresa (si aplica)
                    </label>
                    <Input
                      value={bulkEmpresa}
                      onChange={(e) => setBulkEmpresa(e.target.value)}
                      placeholder="Nombre empresa/intermediario"
                      disabled={bulkOrigen !== "INTERMEDIARIO"}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Programa
                    </label>
                    <select
                      value={bulkProgramaId}
                      onChange={(e) => setBulkProgramaId(e.target.value)}
                      className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar programa</option>
                      {programas.map((p) => {
                        const stats = getProgramaStats(p);
                        return (
                          <option
                            key={String(p.id)}
                            value={String(p.id)}
                            disabled={stats.lleno}
                          >
                            {stats.sinLimite
                              ? `${p.nombre} — sin límite`
                              : stats.lleno
                              ? `${p.nombre} — lleno`
                              : `${p.nombre} — ${stats.asignados}/${stats.limite} (${stats.disponibles} disponibles)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                      disabled={bulkAssigning || selectedCount === 0 || !bulkProgramaId}
                      onClick={handleBulkAssign}
                    >
                      {bulkAssigning ? "Asignando..." : `Asignar (${selectedCount})`}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 pt-3 border-t">
                <div className="text-xs font-semibold text-slate-700 mb-2">Pago masivo</div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Programa (para pago)
                    </label>
                    <select
                      value={bulkPagoProgramaId}
                      onChange={(e) => setBulkPagoProgramaId(e.target.value)}
                      className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar programa</option>
                      {programas.map((p) => (
                        <option key={String(p.id)} value={String(p.id)}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Estado de pago
                    </label>
                    <select
                      value={bulkPagoValue}
                      onChange={(e) => setBulkPagoValue(e.target.value as "PAGO" | "NO_PAGO")}
                      className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="PAGO">Pagó</option>
                      <option value="NO_PAGO">No pagó</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <Button
                      className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                      disabled={bulkPagoSaving || selectedCount === 0 || !bulkPagoProgramaId}
                      onClick={async () => {
                        if (!bulkPagoProgramaId || selectedCount === 0) return;

                        setBulkPagoSaving(true);

                        let ok = 0;
                        let skipped = 0;
                        let failed = 0;

                        try {
                          const pagoBool = bulkPagoValue === "PAGO";

                          for (const vid of selectedIds) {
                            try {
                              const programa = programas.find(
                                (p) => String(p.id) === String(bulkPagoProgramaId)
                              );

                              const estaAsignado = Boolean(
                                programa?.voluntariosAsignados?.map(String).includes(String(vid))
                              );

                              if (!estaAsignado) {
                                skipped += 1;
                                continue;
                              }

                              await setPago(String(vid), String(bulkPagoProgramaId), pagoBool);
                              ok += 1;
                            } catch (e) {
                              failed += 1;
                              console.error("Bulk pago error for", vid, e);
                            }
                          }

                          toast.success(
                            `Pago masivo completado: ${ok} actualizados${
                              skipped ? ` · ${skipped} no estaban asignados` : ""
                            }${failed ? ` · ${failed} fallaron` : ""}`
                          );
                        } finally {
                          setBulkPagoSaving(false);
                        }
                      }}
                    >
                      {bulkPagoSaving ? "Aplicando..." : `Aplicar pago (${selectedCount})`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar voluntarios
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Nombre, cédula, email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado del voluntario
            </label>
            <select
              value={fEstado}
              onChange={(e) => setFEstado(e.target.value as EstadoFiltro)}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="todos">todos</option>
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lugar del programa
            </label>
            <select
              value={fLugar}
              onChange={(e) => setFLugar(e.target.value as FiltroLugar)}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="todos">todos</option>
              {lugaresDisponibles.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Asignación a programa
            </label>
            <select
              value={fAsignacion}
              onChange={(e) => setFAsignacion(e.target.value as FiltroAsignacion)}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="todos">todos</option>
              <option value="asignados">asignados</option>
              <option value="sin-asignar">sin asignar</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {bulkMode && (
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Sel.</th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Cédula</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Programas</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Asignar</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredVols.map((v) => {
                const vid = getVolId(v);
                const programasV = asignacionesPorVoluntario[vid] || [];
                const disponibles = programasDisponiblesPorVol(vid);

                return (
                  <tr key={vid} className="border-t align-top">
                    {bulkMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          disabled={v.estado !== "ACTIVO"}
                          checked={Boolean(selected[vid])}
                          onChange={(e) => toggleSelect(vid, e.target.checked)}
                        />
                      </td>
                    )}

                    <td className="px-4 py-3">{v.nombreCompleto}</td>
                    <td className="px-4 py-3">{v.numeroDocumento}</td>
                    <td className="px-4 py-3">{v.email}</td>
                    <td className="px-4 py-3">{v.telefono ?? "—"}</td>

                    <td className="px-4 py-3">
                      <Badge
                        className={
                          v.estado === "ACTIVO"
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {v.estado.toLowerCase()}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {programasV.length === 0 && (
                          <span className="text-slate-400">Sin asignar</span>
                        )}

                        {programasV.map((p) => {
                          const info = p.asignacionesPorVoluntario?.[vid];
                          const pago = Boolean(info?.pagoRealizado);
                          const origen = info?.origen ?? "CUENTA_PROPIA";
                          const stats = getProgramaStats(p);

                          return (
                            <span
                              key={`${vid}-${String(p.id)}`}
                              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"
                            >
                              <span className="text-xs">
                                {p.nombre}
                                <span className="ml-2 text-[10px] text-slate-500">
                                  {stats.sinLimite
                                    ? "(sin límite)"
                                    : `(${stats.asignados}/${stats.limite})`}
                                </span>
                                <span className="ml-2 text-[10px] text-slate-500">
                                  ({origen === "INTERMEDIARIO" ? "empresa" : "solo"})
                                </span>
                              </span>

                              <button
                                onClick={() => handleTogglePago(vid, p)}
                                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  pago
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-white text-slate-600 border-slate-200"
                                }`}
                                title="Cambiar pago"
                              >
                                {pago ? "Pagó" : "No pagó"}
                              </button>

                              <button
                                onClick={() => handleDesasignar(vid, p.id)}
                                className="text-xs text-slate-500 hover:text-red-600"
                                title="Quitar"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {v.estado !== "ACTIVO" ? (
                        <span className="text-slate-400 text-xs">Voluntario inactivo</span>
                      ) : (
                        <div className="flex flex-col gap-2 min-w-[260px]">
                          <select
                            value={origenPorVol[vid] ?? "CUENTA_PROPIA"}
                            onChange={(e) =>
                              setOrigenPorVol((prev) => ({
                                ...prev,
                                [vid]: e.target.value as OrigenVoluntariado,
                              }))
                            }
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                          >
                            <option value="CUENTA_PROPIA">Cuenta propia</option>
                            <option value="INTERMEDIARIO">Empresa / Intermediario</option>
                          </select>

                          {(origenPorVol[vid] ?? "CUENTA_PROPIA") === "INTERMEDIARIO" && (
                            <Input
                              value={empresaPorVol[vid] ?? ""}
                              onChange={(e) =>
                                setEmpresaPorVol((prev) => ({
                                  ...prev,
                                  [vid]: e.target.value,
                                }))
                              }
                              placeholder="Nombre de empresa/intermediario"
                              className="h-8 text-xs"
                            />
                          )}

                          <div className="flex items-center gap-2">
                            <select
                              value={seleccionPrograma[vid] ?? ""}
                              onChange={(e) =>
                                setSeleccionPrograma((prev) => ({
                                  ...prev,
                                  [vid]: e.target.value,
                                }))
                              }
                              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs flex-1"
                            >
                              <option value="">Seleccionar programa</option>
                              {disponibles.map((p) => {
                                const stats = getProgramaStats(p);
                                return (
                                  <option key={String(p.id)} value={String(p.id)}>
                                    {stats.sinLimite
                                      ? `${p.nombre} — sin límite`
                                      : `${p.nombre} — ${stats.asignados}/${stats.limite} (${stats.disponibles} disponibles)`}
                                  </option>
                                );
                              })}
                            </select>

                            <Button
                              size="sm"
                              className="bg-blue-600 text-white hover:bg-blue-700"
                              onClick={() => handleAsignar(v)}
                              disabled={!seleccionPrograma[vid]}
                            >
                              Asignar
                            </Button>
                          </div>

                          {disponibles.length === 0 && (
                            <span className="text-xs text-amber-600">
                              No hay programas disponibles con cupo para este voluntario
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-sm text-slate-600">
          <span>
            Mostrando {filteredVols.length} de {voluntarios.length} voluntarios
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Anterior
            </Button>
            <Button size="sm" variant="outline">
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}