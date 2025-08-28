"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialPageData = {
  hero: {
    title: "FUNDECODES",
    backgroundImage: "/imagenes/Fondo_Inicio.jpg", // <- asegúrate que exista en /public/imagenes/
  },
  vision: {
    title: "Nuestra Visión",
    content:
      "Ser reconocidos como una organización líder en el desarrollo social, creando oportunidades y generando cambios positivos duraderos en la sociedad.",
  },
  mission: {
    title: "Nuestra Misión",
    content:
      "Facilitar el desarrollo integral de las comunidades a través de programas innovadores, trabajo colaborativo y el compromiso de nuestros voluntarios y colaboradores.",
  },
  projects: {
    title: "Portafolio de Proyectos",
    description: "Conoce los proyectos que estamos desarrollando para mejorar nuestra comunidad.",
  },
  contact: {
    title: "Formulario de Contacto",
    description: "¿Tienes alguna pregunta o sugerencia? Contáctanos.",
  },
  volunteer: {
    title: "Formulario de Voluntarios",
    description: "Únete a nuestro equipo de voluntarios y ayuda a hacer la diferencia.",
  },
  carousel: {
    title: "Galería de Fotos",
    description: "Momentos destacados de nuestro trabajo en la comunidad.",
  },
  comments: {
    title: "Comentarios",
    description: "Lo que dicen las personas sobre nuestro trabajo.",
  },
  footer: {
    copyright: "© 2024 FUNDECODES. Todos los derechos reservados.",
    socialLinks: {
      facebook: "#",
      twitter: "#",
      instagram: "#",
    },
  },
};

export default function PaginaInformativaAdmin() {
  const [pageData, setPageData] = useState(initialPageData);
  const [activeTab, setActiveTab] = useState("preview");
  const { toast } = useToast();

  const handleSave = () => {
    // TODO: aquí conectarás con tu backend
    toast({
      title: "Cambios guardados",
      description: "La página de FUNDECODES ha sido actualizada correctamente.",
    });
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setPageData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editor de Landing FUNDECODES</h1>
              <p className="text-gray-600">Gestiona el contenido de tu página principal</p>
            </div>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="edit">Editor</TabsTrigger>
          </TabsList>

          {/* PREVIEW */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardContent className="p-0">
                {/* Hero */}
                <div className="w-full relative text-center py-20 bg-white overflow-hidden">
                  <h1
                    className="w-full text-[clamp(3rem,12vw,8rem)] font-normal text-center text-transparent bg-clip-text bg-[url('/imagenes/Fondo_Inicio.jpg')] bg-cover bg-center leading-none"
                    style={{ fontFamily: "Anton, sans-serif" }}
                  >
                    {pageData.hero.title}
                  </h1>
                </div>

                {/* Main */}
                <div className="w-full px-4 py-6 space-y-8 bg-[#1e3a8a] text-white">
                  {/* Vision */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{pageData.vision.title}</h2>
                    <p className="text-gray-200 max-w-4xl mx-auto">{pageData.vision.content}</p>
                  </div>
                  {/* Mission */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{pageData.mission.title}</h2>
                    <p className="text-gray-200 max-w-4xl mx-auto">{pageData.mission.content}</p>
                  </div>
                  {/* Projects */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{pageData.projects.title}</h2>
                    <p className="text-gray-200">{pageData.projects.description}</p>
                    <div className="mt-4 p-4 bg-blue-800 rounded-lg">
                      <p className="text-sm">Componente: PortafolioProyectos</p>
                    </div>
                  </div>
                  {/* Forms */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{pageData.contact.title}</h3>
                      <p className="text-gray-200 mb-4">{pageData.contact.description}</p>
                      <div className="p-4 bg-blue-800 rounded-lg">
                        <p className="text-sm">Componente: FormularioDeContacto</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{pageData.volunteer.title}</h3>
                      <p className="text-gray-200 mb-4">{pageData.volunteer.description}</p>
                      <div className="p-4 bg-blue-800 rounded-lg">
                        <p className="text-sm">Componente: FormularioVoluntarios</p>
                      </div>
                    </div>
                  </div>
                  {/* Carousel */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{pageData.carousel.title}</h2>
                    <p className="text-gray-200 mb-4">{pageData.carousel.description}</p>
                    <div className="p-4 bg-blue-800 rounded-lg">
                      <p className="text-sm">Componente: CarruselFotos</p>
                    </div>
                  </div>
                  {/* Comments */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{pageData.comments.title}</h2>
                    <p className="text-gray-200 mb-4">{pageData.comments.description}</p>
                    <div className="p-4 bg-blue-800 rounded-lg">
                      <p className="text-sm">Componente: Comentarios</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-900 text-white p-6 text-center">
                  <p>{pageData.footer.copyright}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EDITOR */}
          <TabsContent value="edit" className="space-y-6">
            {/* Hero */}
            <Card>
              <CardHeader>
                <CardTitle>Sección Principal (Hero)</CardTitle>
                <CardDescription>El título principal con imagen de fondo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Título Principal</Label>
                  <Input
                    id="hero-title"
                    value={pageData.hero.title}
                    onChange={(e) => handleInputChange("hero", "title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-bg">Imagen de Fondo (URL)</Label>
                  <Input
                    id="hero-bg"
                    value={pageData.hero.backgroundImage}
                    onChange={(e) => handleInputChange("hero", "backgroundImage", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vision & Mission */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Visión</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="vision-title">Título</Label>
                  <Input id="vision-title" value={pageData.vision.title} onChange={(e) => handleInputChange("vision", "title", e.target.value)} />
                  <Label htmlFor="vision-content">Contenido</Label>
                  <Textarea id="vision-content" rows={6} value={pageData.vision.content} onChange={(e) => handleInputChange("vision", "content", e.target.value)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Misión</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="mission-title">Título</Label>
                  <Input id="mission-title" value={pageData.mission.title} onChange={(e) => handleInputChange("mission", "title", e.target.value)} />
                  <Label htmlFor="mission-content">Contenido</Label>
                  <Textarea id="mission-content" rows={6} value={pageData.mission.content} onChange={(e) => handleInputChange("mission", "content", e.target.value)} />
                </CardContent>
              </Card>
            </div>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Portafolio de Proyectos</CardTitle>
                <CardDescription>Configuración de la sección de proyectos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="projects-title">Título</Label>
                <Input id="projects-title" value={pageData.projects.title} onChange={(e) => handleInputChange("projects", "title", e.target.value)} />
                <Label htmlFor="projects-description">Descripción</Label>
                <Textarea id="projects-description" rows={3} value={pageData.projects.description} onChange={(e) => handleInputChange("projects", "description", e.target.value)} />
              </CardContent>
            </Card>

            {/* Forms */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Formulario de Contacto</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="contact-title">Título</Label>
                  <Input id="contact-title" value={pageData.contact.title} onChange={(e) => handleInputChange("contact", "title", e.target.value)} />
                  <Label htmlFor="contact-description">Descripción</Label>
                  <Textarea id="contact-description" rows={3} value={pageData.contact.description} onChange={(e) => handleInputChange("contact", "description", e.target.value)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Formulario de Voluntarios</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="volunteer-title">Título</Label>
                  <Input id="volunteer-title" value={pageData.volunteer.title} onChange={(e) => handleInputChange("volunteer", "title", e.target.value)} />
                  <Label htmlFor="volunteer-description">Descripción</Label>
                  <Textarea id="volunteer-description" rows={3} value={pageData.volunteer.description} onChange={(e) => handleInputChange("volunteer", "description", e.target.value)} />
                </CardContent>
              </Card>
            </div>

            {/* Carousel & Comments */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Galería de Fotos</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="carousel-title">Título</Label>
                  <Input id="carousel-title" value={pageData.carousel.title} onChange={(e) => handleInputChange("carousel", "title", e.target.value)} />
                  <Label htmlFor="carousel-description">Descripción</Label>
                  <Textarea id="carousel-description" rows={3} value={pageData.carousel.description} onChange={(e) => handleInputChange("carousel", "description", e.target.value)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Comentarios</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="comments-title">Título</Label>
                  <Input id="comments-title" value={pageData.comments.title} onChange={(e) => handleInputChange("comments", "title", e.target.value)} />
                  <Label htmlFor="comments-description">Descripción</Label>
                  <Textarea id="comments-description" rows={3} value={pageData.comments.description} onChange={(e) => handleInputChange("comments", "description", e.target.value)} />
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>Información del pie de página</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="footer-copyright">Copyright</Label>
                <Input id="footer-copyright" value={pageData.footer.copyright}
                       onChange={(e) => handleInputChange("footer", "copyright", e.target.value)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
