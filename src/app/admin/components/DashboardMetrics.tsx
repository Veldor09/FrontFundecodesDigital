"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardMetrics, type DashboardMetrics as DashboardData } from "@/services/dashboard.service";
import { MetricCard } from "./MetricCard";
import { Users, FolderKanban, FileText, Handshake, Wallet, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DashboardMetrics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMetrics() {
    try {
      setLoading(true);
      setError(null);
      const metrics = await getDashboardMetrics();
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar métricas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

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

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadMetrics} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { metrics } = data;

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Usuarios"
          value={metrics.users.total}
          label={metrics.users.label}
          icon={Users}
          color="text-blue-600"
          href="/admin/Collaborators"  // ← ruta con mayúscula como dijiste
        />

       <MetricCard
  title="Proyectos Activos"
  value={metrics.projects.active ?? 0}
  label={`${metrics.projects.active ?? 0} de ${metrics.projects.total ?? 0} total`}
  icon={FolderKanban}
  color="text-green-600"
  subtitle={`${metrics.projects.draft ?? 0} borradores, ${metrics.projects.finished ?? 0} finalizados`}
/>

        <MetricCard
          title="Archivos"
          value={metrics.files.total}
          label={`${metrics.files.documents} docs, ${metrics.files.images} imgs`}
          icon={FileText}
          color="text-purple-600"
          subtitle={
            metrics.files.lastUpload
              ? `Último: ${metrics.files.lastUpload.name}`
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
      </div>

      {/* Recapitulación */}
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
                {metrics.projects.finished}
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

      <div className="text-center text-xs text-muted-foreground">
        Última actualización: {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
