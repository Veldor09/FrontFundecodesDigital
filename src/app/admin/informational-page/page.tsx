"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Save, RefreshCw } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/app/admin/informational-page/Hooks/use-toast";

// Landing preview components
import Header from "@/app/landing/components/Header";
import HeroVideo from "@/app/landing/components/HeroVideo";
import VisionMision from "@/app/landing/components/VisionMision";
import ProjectPortfolio from "@/app/landing/components/ProjectPortfolio";
import PhotoCarousel from "@/app/landing/components/PhotoCarousel";
import Comments from "@/app/landing/components/Comments";
import Footer from "@/app/landing/components/Footer";

// Select options
const PROJECT_LOCATIONS = ["Costa Rica", "Puntarenas", "Guanacaste", "Limón"];
const PROJECT_CATEGORIES = ["Ambiental", "Social", "Educación", "Productivo"];
const PROJECT_AREAS = ["Pesca", "Acuicultura", "Turismo", "Conservación"];
const PROJECT_STATUSES = ["Planeación", "En ejecución", "Finalizado", "Pausado"];

// Default data with updated Vision and Mission text
const DEFAULT_DATA = {
  hero: { videoUrl: "/videos/VideoFUNDECODES.mp4" },
  vision: {
    title: "VISIÓN",
    content:
      "Nos esforzamos por impulsar comunidades costeras prósperas y resilientes donde las personas, particularmente pescadores, acuicultores y comunidades costeras, tengan acceso equitativo a oportunidades económicas sostenibles que les permitan prosperar mientras protegen los recursos marinos para las generaciones futuras.",
    imageUrl: "/Imagenes/Vision.jpg",
  },
  mission: {
    title: "MISIÓN",
    content:
      "Trabajamos de manera colaborativa con comunidades costeras para desarrollar e implementar soluciones innovadoras y sostenibles que fortalezcan los medios de vida, mejoren la seguridad alimentaria y promuevan la conservación marina a través de la educación, la capacitación técnica y el desarrollo de capacidades locales.",
    imageUrl: "/Imagenes/Mision.jpg",
  },
  projects: [
    {
      id: "p1",
      title: "Proyecto Comunitario",
      description: "Fortalecimiento de capacidades locales para la pesca sostenible.",
      imageUrl: "/imagenes/proyectos/default.jpg",
      location: "Puntarenas",
      category: "Social",
      area: "Pesca",
      status: "En ejecución",
    },
    {
      id: "p2",
      title: "Conservación Marina",
      description: "Protección de ecosistemas marinos mediante educación ambiental.",
      imageUrl: "/imagenes/proyectos/default.jpg",
      location: "Guanacaste",
      category: "Ambiental",
      area: "Conservación",
      status: "Planeación",
    },
  ],
  collaborators: [
    { id: "c1", name: "Colaborador 1", role: "Rol / Área", photoUrl: "/imagenes/colaboradores/default.jpg" },
  ],
  comments: [
    { id: "cm1", author: "María", text: "Gran labor de la fundación.", visible: true },
    { id: "cm2", author: "Pedro", text: "Me gustaría ser voluntario.", visible: true },
  ],
};

export default function InformationalAdminPage() {
  const [tab, setTab] = useState<"preview" | "edit">("preview");
  const [data, setData] = useState(DEFAULT_DATA);
  const { toast } = useToast();

  /* Handlers */
  const updateHero = (patch: any) => setData((p) => ({ ...p, hero: { ...p.hero, ...patch } }));
  const updateVision = (patch: any) => setData((p) => ({ ...p, vision: { ...p.vision, ...patch } }));
  const updateMission = (patch: any) => setData((p) => ({ ...p, mission: { ...p.mission, ...patch } }));

  const addProject = () =>
    setData((p) => ({
      ...p,
      projects: [
        ...p.projects,
        {
          id: String(Date.now()),
          title: "Nuevo Proyecto",
          description: "Descripción breve…",
          imageUrl: "/imagenes/proyectos/default.jpg",
          location: PROJECT_LOCATIONS[0],
          category: PROJECT_CATEGORIES[0],
          area: PROJECT_AREAS[0],
          status: PROJECT_STATUSES[0],
        },
      ],
    }));
  const updateProject = (id: string, patch: any) =>
    setData((p) => ({ ...p, projects: p.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const removeProject = (id: string) =>
    setData((p) => ({ ...p, projects: p.projects.filter((x) => x.id !== id) }));

  const addCollaborator = () =>
    setData((p) => ({
      ...p,
      collaborators: [
        ...p.collaborators,
        { id: String(Date.now()), name: "Nuevo", role: "Rol", photoUrl: "/imagenes/colaboradores/default.jpg" },
      ],
    }));
  const updateCollaborator = (id: string, patch: any) =>
    setData((p) => ({ ...p, collaborators: p.collaborators.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const removeCollaborator = (id: string) =>
    setData((p) => ({ ...p, collaborators: p.collaborators.filter((c) => c.id !== id) }));

  const updateComment = (id: string, patch: any) =>
    setData((p) => ({ ...p, comments: p.comments.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const removeComment = (id: string) =>
    setData((p) => ({ ...p, comments: p.comments.filter((c) => c.id !== id) }));
  const toggleComment = (id: string) =>
    setData((p) => ({ ...p, comments: p.comments.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)) }));

  const onSave = () =>
    toast({ title: "Guardado (demo)", description: "Conecta aquí tu servicio al backend para persistir." });
  const onReset = () => {
    setData(DEFAULT_DATA);
    toast({ title: "Restablecido", description: "Se restauraron los valores por defecto." });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Editor de Página Informativa</h1>
              <p className="text-slate-600">Gestiona los contenidos de la Landing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
            <Button onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="edit">Editor</TabsTrigger>
          </TabsList>

          {/* ✅ Vista Previa (sin cambios) */}
          <TabsContent value="preview" className="space-y-10">
            <Header />
            <HeroVideo videoUrl={data.hero.videoUrl} />
            <VisionMision
              vision={{ title: data.vision.title, content: data.vision.content, imageUrl: data.vision.imageUrl }}
              mission={{ title: data.mission.title, content: data.mission.content, imageUrl: data.mission.imageUrl }}
            />
            <section className="bg-[#1e3a8a] text-white px-4 py-10 space-y-10">
              <div className="max-w-7xl mx-auto">
                <ProjectPortfolio projects={data.projects} />
                <div className="mt-10">
                  <PhotoCarousel photos={data.collaborators.map((c) => ({ id: c.id, src: c.photoUrl, alt: c.name }))} />
                </div>
                <div className="mt-10">
                  <Comments comments={data.comments} />
                </div>
              </div>
            </section>
            <Footer />
          </TabsContent>

          {/* ✅ Editor con Open Sans y letra más grande */}
          <TabsContent value="edit" className="space-y-10">
            <style jsx global>{`
              .editor-wrapper * {
                font-family: 'Open Sans', sans-serif !important;
                font-size: 17px;
                line-height: 1.6;
              }
              .editor-wrapper h2 {
                font-size: 28px;
                font-weight: 600;
              }
              .editor-wrapper label {
                font-size: 15px;
                font-weight: 500;
              }
            `}</style>

            <div className="editor-wrapper">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">🛠️ Gestiona los contenidos</h2>
                <p className="text-slate-500">Actualiza la información que se muestra en la Landing</p>
              </div>

              <SectionCard title="🎬 Video Principal" description="URL del video que aparece en la parte superior">
                <Input
                  value={data.hero.videoUrl}
                  onChange={(e) => updateHero({ videoUrl: e.target.value })}
                  placeholder="/videos/VideoFUNDECODES.mp4"
                />
              </SectionCard>

              <div className="grid md:grid-cols-2 gap-6">
                <SectionCard title="🌅 Visión" description="Texto e imagen de la sección Visión">
                  <Input value={data.vision.title} onChange={(e) => updateVision({ title: e.target.value })} placeholder="Título" />
                  <Textarea rows={4} value={data.vision.content} onChange={(e) => updateVision({ content: e.target.value })} placeholder="Contenido" />
                  <Input value={data.vision.imageUrl} onChange={(e) => updateVision({ imageUrl: e.target.value })} placeholder="https://ejemplo.com/vision.jpg" />
                </SectionCard>

                <SectionCard title="🎯 Misión" description="Texto e imagen de la sección Misión">
                  <Input value={data.mission.title} onChange={(e) => updateMission({ title: e.target.value })} placeholder="Título" />
                  <Textarea rows={4} value={data.mission.content} onChange={(e) => updateMission({ content: e.target.value })} placeholder="Contenido" />
                  <Input value={data.mission.imageUrl} onChange={(e) => updateMission({ imageUrl: e.target.value })} placeholder="https://ejemplo.com/mision.jpg" />
                </SectionCard>
              </div>

              <SectionCard
                title="📂 Proyectos"
                description="Agrega, edita o elimina los proyectos que se mostrarán en la Landing"
                action={
                  <Button size="sm" onClick={addProject}>
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Proyecto
                  </Button>
                }
              >
                <div className="space-y-6">
                  {data.projects.map((p) => (
                    <ProjectEditCard key={p.id} project={p} onChange={(patch: any) => updateProject(p.id, patch)} onDelete={() => removeProject(p.id)} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="👥 Colaboradores"
                description="Fotos y datos de los colaboradores del carrusel"
                action={
                  <Button size="sm" onClick={addCollaborator}>
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Colaborador
                  </Button>
                }
              >
                <div className="space-y-6">
                  {data.collaborators.map((c) => (
                    <CollaboratorEditCard key={c.id} collaborator={c} onChange={(patch: any) => updateCollaborator(c.id, patch)} onDelete={() => removeCollaborator(c.id)} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="💬 Comentarios" description="Revisa, oculta o elimina los comentarios públicos">
                <div className="space-y-6">
                  {data.comments.map((cm) => (
                    <CommentEditRow
                      key={cm.id}
                      comment={cm}
                      onChange={(patch: any) => updateComment(cm.id, patch)}
                      onToggle={() => toggleComment(cm.id)}
                      onDelete={() => removeComment(cm.id)}
                    />
                  ))}
                </div>
              </SectionCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

/* -------------------------------------------------
   Componentes de ayuda para el editor
   ------------------------------------------------- */

function SectionCard({ title, description, children, action }: any) {
  return (
    <Card>
      <CardHeader className="flex items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ProjectEditCard({ project, onChange, onDelete }: any) {
  return (
    <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-[100px_1fr_auto]">
      <img src={project.imageUrl} alt="" className="h-20 w-20 rounded object-cover" />
      <div className="grid gap-2 md:grid-cols-2">
        <Input value={project.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Título" />
        <Input value={project.imageUrl} onChange={(e) => onChange({ imageUrl: e.target.value })} placeholder="Imagen URL" />
        <Textarea
          value={project.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          placeholder="Descripción"
          className="md:col-span-2"
        />
        <SelectField label="Lugar" options={PROJECT_LOCATIONS} value={project.location} onChange={(v) => onChange({ location: v })} />
        <SelectField label="Categoría" options={PROJECT_CATEGORIES} value={project.category} onChange={(v) => onChange({ category: v })} />
        <SelectField label="Área" options={PROJECT_AREAS} value={project.area} onChange={(v) => onChange({ area: v })} />
        <SelectField label="Estado" options={PROJECT_STATUSES} value={project.status} onChange={(v) => onChange({ status: v })} />
      </div>
      <Button variant="outline" size="sm" onClick={onDelete} className="self-start">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function CollaboratorEditCard({ collaborator, onChange, onDelete }: any) {
  return (
    <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-[100px_1fr_auto]">
      <img src={collaborator.photoUrl} alt="" className="h-20 w-20 rounded object-cover" />
      <div className="grid gap-2 md:grid-cols-2">
        <Input value={collaborator.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Nombre" />
        <Input value={collaborator.role} onChange={(e) => onChange({ role: e.target.value })} placeholder="Rol" />
        <Input value={collaborator.photoUrl} onChange={(e) => onChange({ photoUrl: e.target.value })} placeholder="Foto URL" className="md:col-span-2" />
      </div>
      <Button variant="outline" size="sm" onClick={onDelete} className="self-start">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function CommentEditRow({ comment, onChange, onToggle, onDelete }: any) {
  return (
    <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-[150px_1fr_auto_auto]">
      <Input value={comment.author} onChange={(e) => onChange({ author: e.target.value })} placeholder="Autor" />
      <Textarea value={comment.text} onChange={(e) => onChange({ text: e.target.value })} rows={2} placeholder="Comentario" />
      <Button variant="outline" size="sm" onClick={onToggle}>
        {comment.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>
      <Button variant="outline" size="sm" onClick={onDelete}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function SelectField({ label, options, value, onChange }: any) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}