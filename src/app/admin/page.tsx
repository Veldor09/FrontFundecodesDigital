// src/app/admin/page.tsx
"use client"

import Link from "next/link"
import { ArrowLeft, Users, Receipt, Handshake, Wallet, BarChart3, Globe, FolderKanban } from "lucide-react"
import { DashboardMetrics } from "./components/DashboardMetrics"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado de la sección */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Módulos del Sistema</h1>
          <p className="text-slate-500">Gestiona cada área de la organización</p>
        </div>

        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Button>
        </Link>
      </div>

      {/* Tarjetas de módulos */}
      <section className="mb-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Voluntariado */}
          <Link href="/admin/voluntariado" className="group">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-teal-300">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-teal-50 group-hover:border-teal-200">
                  <Handshake className="h-7 w-7 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-teal-700">Voluntariado</h3>
                  <p className="text-sm text-slate-500">Gestión de formularios, estados y participantes</p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Gestionar →
              </div>
            </div>
          </Link>

          {/* Proyectos */}
          <Link href="/admin/projects" className="group">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200">
                  <FolderKanban className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-700">Proyectos</h3>
                  <p className="text-sm text-slate-500">Gestión de proyectos activos y finalizados</p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Administrar →
              </div>
            </div>
          </Link>

          {/* Facturación */}
          <Link href="/admin/Invoicing" className="group">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-green-300">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-green-50 group-hover:border-green-200">
                  <Receipt className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-green-700">Facturación</h3>
                  <p className="text-sm text-slate-500">Consulta y administración de facturas</p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver facturas →
              </div>
            </div>
          </Link>

          {/* Solicitudes */}
          <Link href="/admin/Request" className="group">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-green-300">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-green-50 group-hover:border-green-200">
                  <Receipt className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-green-700">Solicitudes</h3>
                  <p className="text-sm text-slate-500">Consulta y administración de Solicitudes</p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver solicitudes →
              </div>
            </div>
          </Link>

          {/* Colaboradores */}
          <Link href="/admin/Collaborators" className="group">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-purple-300">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-purple-50 group-hover:border-purple-200">
                  <Users className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-purple-700">Colaboradores</h3>
                  <p className="text-sm text-slate-500">Miembros, roles, permisos y estados</p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Administrar →
              </div>
            </div>
          </Link>

          {/* Contabilidad */}
          <Link href="/admin/accounting" className="group">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-orange-300">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-orange-50 group-hover:border-orange-200">
                  <Wallet className="h-7 w-7 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-orange-700">Contabilidad</h3>
                  <p className="text-sm text-slate-500">Ingresos, egresos y reportes financieros</p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver reportes →
              </div>
            </div>
          </Link>

          {/* Recapitulación - AHORA CONECTADO */}
          <Link href="/admin/recapitulacion" className="group">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-red-300">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-red-50 group-hover:border-red-200">
                  <BarChart3 className="h-7 w-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-red-700">Recapitulación</h3>
                  <p className="text-sm text-slate-500">KPIs, métricas y resúmenes</p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver analytics →
              </div>
            </div>
          </Link>

          {/* Página Informativa */}
          <Link href="/admin/informational-page" className="group lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-300">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl p-3 bg-slate-50 border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-200">
                  <Globe className="h-7 w-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-700">
                    Página Informativa
                  </h3>
                  <p className="text-sm text-slate-500">
                    Contenido público del sitio y secciones (Inicio, Visión, Misión, etc.)
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Editar contenido →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Resumen General */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Resumen General</h2>
          <p className="text-slate-500">Métricas actualizadas en tiempo real</p>
        </div>
        <DashboardMetrics />
      </section>
    </main>
  )
}