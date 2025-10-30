"use client";

import { useEffect, useMemo, useState } from "react";
import { getDashboardMetrics, type DashboardMetrics as DashboardData } from "@/services/dashboard.service";
import { MetricCard } from "./MetricCard";
import { Users, FolderKanban, FileText, Handshake, Wallet, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ===== Helpers para token/rol ===== */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
function getJwtPayload<T = any>(token: string | null): T | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
type Role =
  | "admin"
  | "colaboradorfactura"
  | "colaboradorvoluntariado"
  | "colaboradorproyecto"
  | "colaboradorcontabilidad";

function getRoleFromToken(): Role | null {
  const t = getToken();
  const p = getJwtPayload<any>(t);
  const raw: string | undefined =
    (Array.isArray(p?.roles) && p.roles[0]) ||
    p?.role ||
    p?.rol ||
    p?.Rol ||
    undefined;

  if (!raw) return null;
  const r = String(raw).toLowerCase();
  if (
    r === "admin" ||
    r === "colaboradorfactura" ||
    r === "colaboradorvoluntariado" ||
    r === "colaboradorproyecto" ||
    r === "colaboradorcontabilidad"
  ) {
    return r as Role;
  }
  return null;
}

export function DashboardMetrics() {
  // Estado base
  const [role, setRole] = useState<Role | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = role === "admin";
  const canVol = role === "admin" || role === "colaboradorvoluntariado";
  const canProy = role === "admin" || role === "colaboradorproyecto";
  const canBill = role === "admin" || role === "colaboradorfactura" || role === "colaboradorcontabilidad";
  const canAcct = role === "admin" || role === "colaboradorcontabilidad";

  // Efecto: obtener rol una sola vez
  useEffect(() => {
    setRole(getRoleFromToken());
  }, []);

  // Efecto: cargar métricas cuando cambia el rol
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!role) {
        // aún detectando rol
        setLoading(true);
        return;
      }

      setError(null);

      if (role === "admin") {
        setLoading(true);
        try {
          const metrics = await getDashboardMetrics();
          if (!cancelled) setData(metrics);
        } catch (err: any) {
          if (!cancelled) setError(err?.message || "Error desconocido al cargar métricas");
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        // No admin: no consultamos backend de métricas agregadas
        setData(null);
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [role]);

  // Hook SIEMPRE llamado: métrica computada segura para todos los roles
  const metrics = useMemo(() => {
    const zeroLabel = { total: 0, label: "–" as string };
    if (isAdmin && data) return data.metrics;

    return {
      users: zeroLabel,
      projects: { total: 0, active: 0, draft: 0, finished: 0 },
      files: { total: 0, documents: 0, images: 0, lastUpload: null as any },
      volunteering: { total: 0, thisMonth: 0 },
      accounting: zeroLabel,
      billing: zeroLabel,
    };
  }, [isAdmin, data]);

  // A partir de aquí ya podemos renderizar condicional sin romper el orden de hooks
  if (!role) {
    return (
      <div className="min-h-[120px] flex items-center justify-center text-slate-500">
        Detectando rol…
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && isAdmin) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => location.reload()} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principales (según rol) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* ADMIN ve todo */}
        {isAdmin && (
          <>
            <MetricCard
              title="Usuarios"
              value={metrics.users.total}
              label={metrics.users.label}
              icon={Users}
              color="text-blue-600"
              href="/admin/Collaborators"
            />

            <MetricCard
              title="Proyectos Activos"
              value={metrics.projects.active ?? 0}
              label={`${metrics.projects.active ?? 0} de ${metrics.projects.total ?? 0} total`}
              icon={FolderKanban}
              color="text-green-600"
              subtitle={`${metrics.projects.draft ?? 0} borradores, ${metrics.projects.finished ?? 0} finalizados`}
              href="/admin/projects"
            />

            <MetricCard
              title="Archivos"
              value={metrics.files.total}
              label={`${metrics.files.documents} docs, ${metrics.files.images} imgs`}
              icon={FileText}
              color="text-purple-600"
              subtitle={
                (metrics as any).files?.lastUpload
                  ? `Último: ${(metrics as any).files?.lastUpload?.name}`
                  : "Sin archivos aún"
              }
              href="/admin/projects"
            />

            <MetricCard
              title="Voluntarios"
              value={metrics.volunteering.total}
              label={`+${metrics.volunteering.thisMonth} este mes`}
              icon={Handshake}
              color="text-orange-600"
              href="/admin/voluntariado"
            />

            <MetricCard
              title="Contabilidad"
              value={metrics.accounting.total}
              label={metrics.accounting.label}
              icon={Wallet}
              color="text-red-600"
              href="/admin/contabilidad"
            />

            <MetricCard
              title="Facturación"
              value={metrics.billing.total}
              label={metrics.billing.label}
              icon={Receipt}
              color="text-indigo-600"
              href="/admin/facturacion"
            />
          </>
        )}

        {/* colaboradorvoluntariado (no admin) */}
        {canVol && !isAdmin && (
          <MetricCard
            title="Voluntarios"
            value={metrics.volunteering.total}
            label={"Acceso a Voluntariado"}
            icon={Handshake}
            color="text-orange-600"
            href="/admin/voluntariado"
          />
        )}

        {/* colaboradorproyecto (no admin) */}
        {canProy && !isAdmin && (
          <MetricCard
            title="Proyectos"
            value={metrics.projects.total ?? 0}
            label={"Gestión de proyectos"}
            icon={FolderKanban}
            color="text-green-600"
            href="/admin/projects"
          />
        )}

        {/* colaboradorfactura (no admin) */}
        {role === "colaboradorfactura" && (
          <MetricCard
            title="Facturación"
            value={metrics.billing.total}
            label={"Solicitudes y facturación"}
            icon={Receipt}
            color="text-indigo-600"
            href="/admin/facturacion"
          />
        )}

        {/* colaboradorcontabilidad (no admin) */}
        {role === "colaboradorcontabilidad" && (
          <>
            <MetricCard
              title="Contabilidad"
              value={metrics.accounting.total}
              label={"Reportes y estados"}
              icon={Wallet}
              color="text-red-600"
              href="/admin/contabilidad"
            />
            <MetricCard
              title="Facturación"
              value={metrics.billing.total}
              label={"Solicitudes y facturación"}
              icon={Receipt}
              color="text-indigo-600"
              href="/admin/facturacion"
            />
          </>
        )}
      </div>

      {/* Recapitulación: solo ADMIN con datos */}
      {isAdmin && data && (
        <Card>
          <CardHeader>
            <CardTitle>Recapitulación de Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.recap.monthlyActivities}
                </div>
                <p className="text-sm text-muted-foreground">Actividades este mes</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.metrics.projects.finished}
                </div>
                <p className="text-sm text-muted-foreground">Proyectos finalizados</p>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {data.recap.lastActivity
                    ? new Date(data.recap.lastActivity).toLocaleDateString()
                    : "Sin actividad"}
                </div>
                <p className="text-sm text-muted-foreground">Última actividad</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <div className="text-center text-xs text-muted-foreground">
          Última actualización: {new Date((data as any)?.timestamp ?? Date.now()).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default DashboardMetrics;
