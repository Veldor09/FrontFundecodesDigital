import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, FolderOpen, UserCheck, Calculator, BarChart3, Globe } from "lucide-react"

const modules = [
  {
    title: "Voluntariado",
    description: "Gestión de formularios, estados y participantes.",
    icon: UserCheck,
    href: "/admin/voluntariado",
    color: "text-blue-600",
  },
  {
    title: "Facturación",
    description: "Consulta y administración de facturas.",
    icon: FileText,
    href: "/admin/facturacion",
    color: "text-green-600",
  },
  {
    title: "Proyectos",
    description: "Gestión de proyectos activos y finalizados.",
    icon: FolderOpen,
    href: "/admin/proyectos",
    color: "text-purple-600",
  },
  {
    title: "Colaboradores",
    description: "Miembros, roles, permisos y estados.",
    icon: Users,
    href: "/admin/colaboradores",
    color: "text-orange-600",
  },
  {
    title: "Contabilidad",
    description: "Ingresos, egresos y reportes financieros.",
    icon: Calculator,
    href: "/admin/contabilidad",
    color: "text-red-600",
  },
  {
    title: "Recapitulación",
    description: "KPIs, métricas y resúmenes.",
    icon: BarChart3,
    href: "/admin/recapitulacion",
    color: "text-indigo-600",
  },
{
  title: "Página informativa",
  description: "Contenido público del sitio y secciones.",
  icon: Globe,                 // <-- en minúscula
  href: "/admin/informational-page",
  color: "text-teal-600",
},

]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel administrativo</h1>
          <p className="text-gray-600">Elige un módulo para continuar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon
            return (
              <Link key={module.title} href={module.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${module.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{module.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
