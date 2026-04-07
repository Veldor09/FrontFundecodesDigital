"use client";

import { useMemo, useState } from "react";
import { useVoluntarios } from "../hooks/useVoluntarios";
import { useProgramaVoluntariado } from "../hooks/useProgramaVoluntariado";
import { Voluntario } from "../types/voluntario";
import { ProgramaVoluntariado, OrigenVoluntariado } from "../types/programaVoluntariado";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, X, Users } from "lucide-react";

type EstadoFiltro = "todos" | "activo" | "inactivo";
type FiltroAsignacion = "todos" | "asignados" | "sin-asignar";
type FiltroLugar = "todos" | string;

export default function Page() {
  const { data: voluntariosRaw } = useVoluntarios();
  const { data: programas, assign, unassign, setPago } = useProgramaVoluntariado();

  const voluntarios: Voluntario[] = useMemo(() => {
    if (Array.isArray(voluntariosRaw)) return voluntariosRaw as Voluntario[];
    if (voluntariosRaw && Array.isArray((voluntariosRaw as any).data))
      return (voluntariosRaw as any).data as Voluntario[];
    return [];
  }, [voluntariosRaw]);

  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState<EstadoFiltro>("todos");
  const [fLugar, setFLugar] = useState<FiltroLugar>("todos");
  const [fAsignacion, setFAsignacion] = useState<FiltroAsignacion>("todos");

  const getVolId = (v: Voluntario) => String((v as any).id);

  const getProgramaStats = (p: ProgramaVoluntariado) => {
    const asignados = p.voluntariosAsignados?.length || 0;
    const limite = Number(p.limiteParticipantes ?? 0);
    const sinLimite = limite === 0;
    const disponibles = sinLimite ? null : Math.max(limite - asignados, 0);
    const lleno = !sinLimite && asignados >= limite;
    return { asignados, limite, sinLimite, disponibles, lleno };
  };

  const asignacionesPorVoluntario: Record<string, ProgramaVoluntariado[]> = useMemo(() => {
    const map: Record<string, ProgramaVoluntariado[]> = {};
    for (const v of voluntarios) map[getVolId(v)] = [];
    for (const p of programas)
      for (const vid of p.voluntariosAsignados || []) {
        const key = String(vid);
        if (!map[key]) map[key] = [];
        map[key].push(p);
      }
    return map;
  }, [voluntarios, programas]);

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
        return (asignacionesPorVoluntario[getVolId(v)] || []).some((p) => p.lugar === fLugar);
      })
      .filter((v) =>
        [v.nombreCompleto, v.numeroDocumento, v.email].some((f) =>
          f?.toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [voluntarios, fEstado, fAsignacion, fLugar, search, asignacionesPorVoluntario]);

  const programasDisponiblesPorVol = (volIdStr: string) =>
    programas.filter((p) => {
      if ((p.voluntariosAsignados || []).map(String).includes(volIdStr)) return false;
      return !getProgramaStats(p).lleno;
    });

  // ── Selección ──
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );
  const selectedCount = selectedIds.length;
  const clearSelection = () => setSelected({});

  const allFilteredActive = filteredVols.filter((v) => v.estado === "ACTIVO");
  const allChecked = allFilteredActive.length > 0 && allFilteredActive.every((v) => selected[getVolId(v)]);
  const someChecked = allFilteredActive.some((v) => selected[getVolId(v)]);

  const toggleAll = (checked: boolean) => {
    const next = { ...selected };
    allFilteredActive.forEach((v) => {
      if (checked) next[getVolId(v)] = true;
      else delete next[getVolId(v)];
    });
    setSelected(next);
  };

  const toggleSelect = (volIdStr: string, checked: boolean) =>
    setSelected((prev) => ({ ...prev, [volIdStr]: checked }));

  // ── Modal masivo UNIFICADO ──
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkOrigen, setBulkOrigen] = useState<OrigenVoluntariado>("CUENTA_PROPIA");
  const [bulkEmpresa, setBulkEmpresa] = useState("");
  const [bulkProgramaId, setBulkProgramaId] = useState("");
  const [bulkPagoProgramaId, setBulkPagoProgramaId] = useState("");
  const [bulkPagoValue, setBulkPagoValue] = useState<"PAGO" | "NO_PAGO">("PAGO");
  const [bulkSaving, setBulkSaving] = useState(false);

  const handleBulkSubmit = async () => {
    const hasAsignar = !!bulkProgramaId;
    const hasPago = !!bulkPagoProgramaId;

    if (!hasAsignar && !hasPago) {
      toast.error("Seleccioná al menos un programa para asignar o marcar pago");
      return;
    }
    if (hasAsignar) {
      const programa = programas.find((p) => String(p.id) === bulkProgramaId);
      if (!programa) { toast.error("Programa de asignación no encontrado"); return; }
      if (getProgramaStats(programa).lleno) { toast.error("El programa está lleno"); return; }
      if (bulkOrigen === "INTERMEDIARIO" && !bulkEmpresa.trim()) { toast.error("Indicá el nombre de la empresa"); return; }
    }

    setBulkSaving(true);
    let okA = 0, dupA = 0, failA = 0;
    let okP = 0, skipP = 0, failP = 0;

    try {
      for (const vid of selectedIds) {
        if (hasAsignar) {
          try {
            const res: any = await assign(vid, bulkProgramaId, {
              origen: bulkOrigen,
              intermediario: bulkOrigen === "INTERMEDIARIO" ? bulkEmpresa.trim() : null,
            });
            res?.duplicated ? dupA++ : okA++;
          } catch { failA++; }
        }
        if (hasPago) {
          try {
            const prog = programas.find((p) => String(p.id) === bulkPagoProgramaId);
            if (!prog?.voluntariosAsignados?.map(String).includes(vid)) { skipP++; }
            else {
              await setPago(vid, bulkPagoProgramaId, bulkPagoValue === "PAGO");
              okP++;
            }
          } catch { failP++; }
        }
      }
      clearSelection();
      setBulkModal(false);
      const msgs = [];
      if (hasAsignar) msgs.push(`${okA} asignados${dupA ? ` · ${dupA} ya estaban` : ""}${failA ? ` · ${failA} fallaron` : ""}`);
      if (hasPago) msgs.push(`${okP} pagos actualizados${skipP ? ` · ${skipP} no asignados` : ""}${failP ? ` · ${failP} fallaron` : ""}`);
      toast.success(msgs.join(" | "));
    } finally { setBulkSaving(false); }
  };

  // ── Menú individual ──
  const [seleccionPrograma, setSeleccionPrograma] = useState<Record<string, string>>({});
  const [origenPorVol, setOrigenPorVol] = useState<Record<string, OrigenVoluntariado>>({});
  const [empresaPorVol, setEmpresaPorVol] = useState<Record<string, string>>({});
  const [openMenuVol, setOpenMenuVol] = useState<string | null>(null);

  const handleAsignar = async (vol: Voluntario) => {
    const vid = getVolId(vol);
    const programaId = seleccionPrograma[vid];
    if (!programaId) { toast.error("Selecciona un programa"); return; }
    const origen = origenPorVol[vid] ?? "CUENTA_PROPIA";
    const empresa = (empresaPorVol[vid] ?? "").trim();
    if (origen === "INTERMEDIARIO" && !empresa) { toast.error("Indicá el nombre de la empresa"); return; }
    try {
      await assign(vid, programaId, { origen, intermediario: origen === "INTERMEDIARIO" ? empresa : null });
      toast.success("Voluntario asignado");
      setSeleccionPrograma((prev) => ({ ...prev, [vid]: "" }));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "No se pudo asignar";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
    }
  };

  const handleDesasignar = async (volIdStr: string, programaId: number | string) => {
    try {
      await unassign(volIdStr, String(programaId));
      toast.success("Asignación eliminada");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Error";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
    }
  };

  const handleTogglePago = async (volIdStr: string, programa: ProgramaVoluntariado) => {
    const current = Boolean(programa.asignacionesPorVoluntario?.[volIdStr]?.pagoRealizado);
    try {
      await setPago(volIdStr, String(programa.id), !current);
      toast.success(!current ? "Marcado como pagado" : "Marcado como no pagado");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Error";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
    }
  };

  const hasSelection = selectedCount > 0;

  const selectCls = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 transition";

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Gestión de Voluntarios en Programas
          </h1>
          <p className="text-slate-500 text-sm">
            Visualiza y asigna voluntarios a programas de voluntariado
          </p>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Buscar voluntarios</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-10" placeholder="Nombre, cédula, email" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select value={fEstado} onChange={(e) => setFEstado(e.target.value as EstadoFiltro)} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="todos">todos</option>
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lugar del programa</label>
            <select value={fLugar} onChange={(e) => setFLugar(e.target.value as FiltroLugar)} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="todos">todos</option>
              {lugaresDisponibles.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asignación</label>
            <select value={fAsignacion} onChange={(e) => setFAsignacion(e.target.value as FiltroAsignacion)} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="todos">todos</option>
              <option value="asignados">asignados</option>
              <option value="sin-asignar">sin asignar</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

          {/* ── Cabecera selección ── */}
          {hasSelection && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-600 border-b border-slate-500">
              <input
                type="checkbox"
                className="rounded"
                checked={allChecked}
                ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <span className="text-sm font-medium text-white flex-1">
                {selectedCount} {selectedCount === 1 ? "seleccionado" : "seleccionados"}
              </span>

              <button
                onClick={() => setBulkModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-400 bg-slate-500 hover:bg-slate-400 text-white px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <Users size={13} />
                Asignar
              </button>

              <button
                onClick={clearSelection}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-500 transition-colors"
                title="Cancelar selección"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Cabecera tabla normal */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={hasSelection ? "hidden" : "bg-slate-50 border-b border-slate-200"}>
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Cédula</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Programas</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 w-16">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVols.map((v) => {
                  const vid = getVolId(v);
                  const programasV = asignacionesPorVoluntario[vid] || [];
                  const disponibles = programasDisponiblesPorVol(vid);
                  const menuAbierto = openMenuVol === vid;
                  const isSelected = Boolean(selected[vid]);

                  return (
                    <tr
                      key={vid}
                      className={`border-t border-slate-100 align-top group transition-colors ${
                        isSelected ? "bg-slate-50" : "hover:bg-slate-50/60"
                      }`}
                    >
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          className={`rounded transition-opacity ${
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                          disabled={v.estado !== "ACTIVO"}
                          checked={isSelected}
                          onChange={(e) => toggleSelect(vid, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{v.nombreCompleto}</td>
                      <td className="px-4 py-3 text-slate-500">{v.numeroDocumento}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          {programasV.length === 0 && <span className="text-slate-400 text-xs">Sin asignar</span>}
                          {programasV.map((p) => {
                            const info = p.asignacionesPorVoluntario?.[vid];
                            const pago = Boolean(info?.pagoRealizado);
                            const origen = info?.origen ?? "CUENTA_PROPIA";
                            const stats = getProgramaStats(p);
                            return (
                              <div key={`${vid}-${String(p.id)}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs w-fit">
                                <span className="font-medium text-slate-700">{p.nombre}</span>
                                <span className="text-slate-400 tabular-nums">{stats.sinLimite ? "∞" : `${stats.asignados}/${stats.limite}`}</span>
                                {origen === "INTERMEDIARIO" && (
                                  <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 border border-violet-100">empresa</span>
                                )}
                                <span className="text-slate-200 select-none">|</span>
                                <button
                                  onClick={() => handleTogglePago(vid, p)}
                                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                                    pago
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  {pago
                                    ? <><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>Pagó</>
                                    : <><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>No pagó</>
                                  }
                                </button>
                                <button onClick={() => handleDesasignar(vid, p.id)} className="text-slate-300 hover:text-red-400 transition-colors leading-none text-sm">×</button>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Acciones individuales */}
                      <td className="px-4 py-3 text-center w-16">
                        {v.estado !== "ACTIVO" ? (
                          <span className="text-slate-300 text-xs">—</span>
                        ) : (
                          <div className="relative inline-block">
                            <button
                              onClick={() => setOpenMenuVol(menuAbierto ? null : vid)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>

                            {menuAbierto && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuVol(null)} />
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                                  <div className="pointer-events-auto rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden" style={{ width: "300px" }}>
                                    <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                      <div className="min-w-0">
                                        <p className="text-slate-700 font-medium text-sm truncate">{v.nombreCompleto}</p>
                                        <p className="text-slate-400 text-xs">Asignar a programa</p>
                                      </div>
                                      <button onClick={() => setOpenMenuVol(null)} className="ml-3 shrink-0 p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={14} />
                                      </button>
                                    </div>
                                    <div className="p-3 space-y-2.5">
                                      <div className="space-y-1">
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Origen</label>
                                        <div className="relative">
                                          <select value={origenPorVol[vid] ?? "CUENTA_PROPIA"} onChange={(e) => setOrigenPorVol((prev) => ({ ...prev, [vid]: e.target.value as OrigenVoluntariado }))} className={selectCls + " appearance-none pr-7"}>
                                            <option value="CUENTA_PROPIA">Cuenta propia</option>
                                            <option value="INTERMEDIARIO">Empresa / Intermediario</option>
                                          </select>
                                          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                                        </div>
                                      </div>
                                      {(origenPorVol[vid] ?? "CUENTA_PROPIA") === "INTERMEDIARIO" && (
                                        <div className="space-y-1">
                                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Empresa</label>
                                          <Input value={empresaPorVol[vid] ?? ""} onChange={(e) => setEmpresaPorVol((prev) => ({ ...prev, [vid]: e.target.value }))} placeholder="Nombre de la empresa" className="h-8 text-sm rounded-lg border-slate-200" />
                                        </div>
                                      )}
                                      <div className="space-y-1">
                                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Programa</label>
                                        {disponibles.length === 0 ? (
                                          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                                            <span className="text-xs text-amber-600">Sin programas con cupo disponible</span>
                                          </div>
                                        ) : (
                                          <div className="relative">
                                            <select value={seleccionPrograma[vid] ?? ""} onChange={(e) => setSeleccionPrograma((prev) => ({ ...prev, [vid]: e.target.value }))} className={selectCls + " appearance-none pr-7"}>
                                              <option value="">Seleccionar programa...</option>
                                              {disponibles.map((p) => {
                                                const s = getProgramaStats(p);
                                                return <option key={String(p.id)} value={String(p.id)}>{s.sinLimite ? `${p.nombre} — sin límite` : `${p.nombre} — ${s.asignados}/${s.limite} (${s.disponibles} disp.)`}</option>;
                                              })}
                                            </select>
                                            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => { handleAsignar(v); setOpenMenuVol(null); }}
                                        disabled={!seleccionPrograma[vid]}
                                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 transition-colors"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                                        Asignar
                                      </button>
                                    </div>
                                    {programasV.length > 0 && (
                                      <>
                                        <div className="border-t border-slate-100" />
                                        <div className="p-2.5 space-y-0.5">
                                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1.5">Quitar de programa</p>
                                          {programasV.map((p) => (
                                            <button key={String(p.id)} onClick={() => { handleDesasignar(vid, p.id); setOpenMenuVol(null); }} className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-red-50 text-left group transition-colors">
                                              <span className="text-sm text-slate-600 group-hover:text-red-600 truncate max-w-[200px]">{p.nombre}</span>
                                              <span className="text-xs text-slate-300 group-hover:text-red-400 shrink-0 ml-2">× quitar</span>
                                            </button>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL MASIVO UNIFICADO ── */}
      {bulkModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setBulkModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden" style={{ width: "360px" }}>

              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-slate-800 font-semibold text-sm">Asignar voluntarios</p>
                  <p className="text-slate-400 text-xs">
                    {selectedCount} {selectedCount === 1 ? "voluntario seleccionado" : "voluntarios seleccionados"}
                  </p>
                </div>
                <button onClick={() => setBulkModal(false)} className="ml-3 shrink-0 p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="p-4 space-y-4">

                {/* Sección Asignación */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Asignación a programa</p>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Origen</label>
                    <div className="relative">
                      <select value={bulkOrigen} onChange={(e) => setBulkOrigen(e.target.value as OrigenVoluntariado)} className={selectCls + " appearance-none pr-7"}>
                        <option value="CUENTA_PROPIA">Cuenta propia</option>
                        <option value="INTERMEDIARIO">Empresa / Intermediario</option>
                      </select>
                      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </div>

                  {bulkOrigen === "INTERMEDIARIO" && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Empresa</label>
                      <Input value={bulkEmpresa} onChange={(e) => setBulkEmpresa(e.target.value)} placeholder="Nombre de la empresa" className="h-8 text-sm rounded-lg border-slate-200" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Programa</label>
                    <div className="relative">
                      <select value={bulkProgramaId} onChange={(e) => setBulkProgramaId(e.target.value)} className={selectCls + " appearance-none pr-7"}>
                        <option value="">Seleccionar programa... (opcional)</option>
                        {programas.map((p) => {
                          const s = getProgramaStats(p);
                          return (
                            <option key={String(p.id)} value={String(p.id)} disabled={s.lleno}>
                              {s.sinLimite ? `${p.nombre} — sin límite` : s.lleno ? `${p.nombre} — lleno` : `${p.nombre} — ${s.asignados}/${s.limite} (${s.disponibles} disp.)`}
                            </option>
                          );
                        })}
                      </select>
                      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>

                {/* Divisor */}
                <div className="border-t border-slate-100" />

                {/* Sección Pago */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Estado de pago</p>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Programa</label>
                    <div className="relative">
                      
                      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(["PAGO", "NO_PAGO"] as const).map((val) => (
                      <button
                        key={val}
                        onClick={() => setBulkPagoValue(val)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          bulkPagoValue === val
                            ? val === "PAGO"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                              : "bg-slate-100 border-slate-300 text-slate-700"
                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {val === "PAGO" ? "✓ Pagó" : "✗ No pagó"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón */}
                <button
                  onClick={handleBulkSubmit}
                  disabled={bulkSaving || (!bulkProgramaId && !bulkPagoProgramaId)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 transition-colors"
                >
                  <Users size={13} />
                  {bulkSaving ? "Aplicando..." : `Aplicar a ${selectedCount} voluntarios`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}