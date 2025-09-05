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

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await getDashboardMetrics();
      setData(metrics);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al cargar métricas');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
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

  const { metrics, quickAccess } = data;

  return (
    <div className="space-y-6">
      {/* Métricas Principales - AHORA INTERACTIVAS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Usuarios"
          value={metrics.users.total}
          label={metrics.users.label}
          icon={Users}
          color="text-blue-600"
          href="/admin/colaboradores" // ➡️ CLICK → VA A COLABORADORES
        />
        
        <MetricCard
          title="Proyectos Activos"
          value={metrics.projects.active}
          label={`${metrics.projects.active} de ${metrics.projects.total} total`}
          icon={FolderKanban}
          color="text-green-600"
          subtitle={`${metrics.projects.draft} borradores, ${metrics.projects.finished} finalizados`}
          href="/admin/projects" // ➡️ CLICK → VA A PROYECTOS
        />
        
        <MetricCard
          title="Archivos"
          value={metrics.files.total}
          label={`${metrics.files.documents} docs, ${metrics.files.images} imgs`}
          icon={FileText}
          color="text-purple-600"
          subtitle={metrics.files.lastUpload ? 
            `Último: ${metrics.files.lastUpload.name}` : 
            'Sin archivos aún'
          }
          href="/admin/proyectos" // ➡️ CLICK → VA A PROYECTOS (DONDE ESTÁN LOS ARCHIVOS)
        />
        
        <MetricCard
          title="Voluntarios"
          value={metrics.volunteering.total}
          label={`+${metrics.volunteering.thisMonth} este mes`}
          icon={Handshake}
          color="text-orange-600"
          href="/admin/voluntariado" // ➡️ CLICK → VA A VOLUNTARIADO
        />
        
        <MetricCard
          title="Contabilidad"
          value={metrics.accounting.total}
          label={metrics.accounting.label}
          icon={Wallet}
          color="text-red-600"
          href="/admin/contabilidad" // ➡️ CLICK → VA A CONTABILIDAD
        />
        
        <MetricCard
          title="Facturación"
          value={metrics.billing.total}
          label={metrics.billing.label}
          icon={Receipt}
          color="text-indigo-600"
          href="/admin/facturacion" // ➡️ CLICK → VA A FACTURACIÓN
        />
      </div>

      {/* Resto del contenido igual... */}
      {/* Recapitulación de Actividades */}
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
              <p className="text-sm text-muted-foreground">
                Actividades este mes
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.projects.finished}
              </div>
              <p className="text-sm text-muted-foreground">
                Proyectos finalizados
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {data.recap.lastActivity ? 
                  new Date(data.recap.lastActivity).toLocaleDateString() : 
                  'Sin actividad'
                }
              </div>
              <p className="text-sm text-muted-foreground">
                Última actividad
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accesos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {quickAccess.map((access) => (
              <Link key={access.href} href={access.href}>
                <Button variant="outline" className="w-full justify-start hover:bg-slate-50">
                  {access.name}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timestamp de actualización */}
      <div className="text-center text-xs text-muted-foreground">
        Última actualización: {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}