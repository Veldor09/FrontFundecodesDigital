import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react"

export default function ProyectosPage() {
  const proyectos = [
    {
      id: 1,
      titulo: "Sistema de Gestión Empresarial",
      descripcion: "Plataforma web completa para la gestión de recursos humanos y contabilidad empresarial.",
      tecnologias: ["React", "Node.js", "PostgreSQL"],
      fecha: "2024",
      categoria: "Web Development",
    },
    {
      id: 2,
      titulo: "Aplicación Móvil de E-commerce",
      descripcion: "App móvil para tienda online con sistema de pagos integrado y gestión de inventario.",
      tecnologias: ["React Native", "Firebase", "Stripe"],
      fecha: "2024",
      categoria: "Mobile App",
    },
    {
      id: 3,
      titulo: "Dashboard de Analytics",
      descripcion: "Panel de control interactivo para visualización de datos y métricas empresariales.",
      tecnologias: ["Vue.js", "D3.js", "Python"],
      fecha: "2023",
      categoria: "Data Visualization",
    },
    {
      id: 4,
      titulo: "Sistema de Reservas Online",
      descripcion: "Plataforma de reservas para hoteles y restaurantes con calendario interactivo.",
      tecnologias: ["Next.js", "MongoDB", "Tailwind"],
      fecha: "2023",
      categoria: "Web Development",
    },
    {
      id: 5,
      titulo: "Chatbot Inteligente",
      descripcion: "Bot conversacional con IA para atención al cliente automatizada 24/7.",
      tecnologias: ["Python", "OpenAI", "FastAPI"],
      fecha: "2023",
      categoria: "AI/ML",
    },
    {
      id: 6,
      titulo: "Plataforma de Cursos Online",
      descripcion: "Sistema de aprendizaje virtual con videos, exámenes y certificaciones.",
      tecnologias: ["Laravel", "MySQL", "AWS"],
      fecha: "2022",
      categoria: "Education",
    },
    {
      id: 7,
      titulo: "App de Delivery",
      descripcion: "Aplicación para pedidos de comida con tracking en tiempo real y múltiples restaurantes.",
      tecnologias: ["Flutter", "Firebase", "Google Maps"],
      fecha: "2022",
      categoria: "Mobile App",
    },
    {
      id: 8,
      titulo: "Sistema de Inventario",
      descripcion: "Software de gestión de inventario con códigos QR y reportes automatizados.",
      tecnologias: ["Angular", "Spring Boot", "MySQL"],
      fecha: "2022",
      categoria: "Enterprise",
    },
    {
      id: 9,
      titulo: "Red Social Corporativa",
      descripcion: "Plataforma interna para comunicación y colaboración entre empleados.",
      tecnologias: ["React", "GraphQL", "PostgreSQL"],
      fecha: "2021",
      categoria: "Social Platform",
    },
    {
      id: 10,
      titulo: "Sistema de Facturación",
      descripcion: "Software de facturación electrónica con integración a SUNAT y reportes fiscales.",
      tecnologias: ["PHP", "MySQL", "Bootstrap"],
      fecha: "2021",
      categoria: "Finance",
    },
  ]

  const categorias = [...new Set(proyectos.map((p) => p.categoria))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" className="flex items-center gap-2 font-modern">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-900 font-modern">Todos los Proyectos</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-modern">Nuestro Portafolio</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-modern">
            Explora todos nuestros proyectos y descubre cómo hemos ayudado a empresas de diferentes sectores a alcanzar
            sus objetivos tecnológicos.
          </p>
        </section>

        {/* Filter Categories */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100 font-modern">
              Todos
            </Badge>
            {categorias.map((categoria) => (
              <Badge key={categoria} variant="outline" className="cursor-pointer hover:bg-blue-50 font-modern">
                {categoria}
              </Badge>
            ))}
          </div>
        </section>

        {/* Projects Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {proyectos.map((proyecto) => (
            <Card key={proyecto.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={`/placeholder.svg?height=200&width=300`}
                    alt={proyecto.titulo}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs font-modern">
                      {proyecto.categoria}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-modern">{proyecto.fecha}</span>
                </div>
                <CardTitle className="text-lg mb-2 line-clamp-2 font-modern">{proyecto.titulo}</CardTitle>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-modern">{proyecto.descripcion}</p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {proyecto.tecnologias.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs font-modern">
                      {tech}
                    </Badge>
                  ))}
                  {proyecto.tecnologias.length > 3 && (
                    <Badge variant="outline" className="text-xs font-modern">
                      +{proyecto.tecnologias.length - 3}
                    </Badge>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-blue-50 bg-transparent font-modern"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Call to Action */}
        <section className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-modern">¿Tienes un proyecto en mente?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto font-modern">
            Nos encantaría conocer tu idea y ayudarte a convertirla en realidad. Contáctanos para una consulta gratuita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 font-modern">
              <Link href="/#contacto">Contactar ahora</Link>
            </Button>
            <Button asChild variant="outline" className="font-modern bg-transparent">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
