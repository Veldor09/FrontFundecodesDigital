"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Save, RefreshCw } from "lucide-react";

// UI (shadcn)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Toast (demo)
import { useToast } from "@/app/admin/informational-page/Hooks/use-toast";

// Componentes de la landing (Preview)
import Header from "@/app/landing/components/Header";
import VisionMision from "@/app/landing/components/VisionMision";
import ProjectPortfolio from "@/app/landing/components/ProjectPortfolio";
import ContactForm from "@/app/landing/components/ContactForm";
import PhotoCarousel from "@/app/landing/components/PhotoCarousel";
import Comments from "@/app/landing/components/Comments";
import Footer from "@/app/landing/components/Footer";

/* ------------------------------------------------------------------ */
/*  Estado local (demo). Ajusta los valores por defecto a tu contenido */
/* ------------------------------------------------------------------ */

const DEFAULT_DATA = {
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

  // Visión/Misión
  const updateVision = (patch: any) => setData((p) => ({ ...p, vision: { ...p.vision, ...patch } }));
  const updateMission = (patch: any) => setData((p) => ({ ...p, mission: { ...p.mission, ...patch } }));

  // Colaboradores
  const addCollaborator = () =>
    setData((p) => ({
      ...p,
      collaborators: [
        ...p.collaborators,
        {
          id: String(Date.now()),
          name: "Nuevo",
          role: "Rol",
          photoUrl: "/imagenes/colaboradores/default.jpg",
        },
      ],
    }));

  const updateCollaborator = (id: string, patch: any) =>
    setData((p) => ({
      ...p,
      collaborators: p.collaborators.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));

  const removeCollaborator = (id: string) =>
    setData((p) => ({ ...p, collaborators: p.collaborators.filter((c) => c.id !== id) }));

  // Comentarios (sin agregar)
  const updateComment = (id: string, patch: any) =>
    setData((p) => ({ ...p, comments: p.comments.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  const removeComment = (id: string) =>
    setData((p) => ({ ...p, comments: p.comments.filter((c) => c.id !== id) }));

  const toggleComment = (id: string) =>
    setData((p) => ({ ...p, comments: p.comments.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)) }));

  // Guardar / Reset (demo)
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
              <h1 className="text-2xl font-bold">Editor de Página informativa</h1>
              <p className="text-slate-600">
                Gestiona los contenidos visibles en la Landing (Visión, Misión, Colaboradores, Comentarios).
              </p>
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

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="edit">Editor</TabsTrigger>
          </TabsList>

          {/* --------- VISTA PREVIA --------- */}
          <TabsContent value="preview" className="space-y-10">
            <Header />

            <VisionMision
              vision={{
                title: data.vision.title,
                content: data.vision.content,
                imageUrl: data.vision.imageUrl,
              }}
              mission={{
                title: data.mission.title,
                content: data.mission.content,
                imageUrl: data.mission.imageUrl,
              }}
            />

            <section className="bg-[#1e3a8a] text-white px-4 py-10 space-y-10">
              <div className="max-w-7xl mx-auto">
                <ProjectPortfolio />

                <div className="mt-10">
                  {/* 👇 Carrusel alimentado por colaboradores */}
                  <PhotoCarousel
                    photos={data.collaborators.map((c) => ({
                      id: c.id,
                      src: c.photoUrl,
                      alt: c.name,
                    }))}
                  />
                </div>

                <div className="mt-10">
                  {/* 👇 Solo se muestran visibles */}
                  <Comments comments={data.comments} />
                </div>
              </div>
            </section>

            <Footer />
          </TabsContent>

          {/* ------------------------- EDITOR ------------------------- */}
          <TabsContent value="edit" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Visión */}
              <Card>
                <CardHeader>
                  <CardTitle>Visión</CardTitle>
                  <CardDescription>Texto e imagen mostrados en la landing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Label>Título</Label>
                  <Input value={data.vision.title} onChange={(e) => updateVision({ title: e.target.value })} />
                  <Label>Contenido</Label>
                  <Textarea
                    rows={6}
                    value={data.vision.content}
                    onChange={(e) => updateVision({ content: e.target.value })}
                  />
                  <Label>URL de imagen</Label>
                  <Input value={data.vision.imageUrl} onChange={(e) => updateVision({ imageUrl: e.target.value })} />
                </CardContent>
              </Card>

              {/* Misión */}
              <Card>
                <CardHeader>
                  <CardTitle>Misión</CardTitle>
                  <CardDescription>Texto e imagen mostrados en la landing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Label>Título</Label>
                  <Input value={data.mission.title} onChange={(e) => updateMission({ title: e.target.value })} />
                  <Label>Contenido</Label>
                  <Textarea
                    rows={6}
                    value={data.mission.content}
                    onChange={(e) => updateMission({ content: e.target.value })}
                  />
                  <Label>URL de imagen</Label>
                  <Input value={data.mission.imageUrl} onChange={(e) => updateMission({ imageUrl: e.target.value })} />
                </CardContent>
              </Card>
            </div>

            {/* Colaboradores */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Colaboradores</CardTitle>
                  <CardDescription>Agregar, editar o eliminar.</CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={addCollaborator}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.collaborators.map((c) => (
                  <div key={c.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[120px_1fr_1fr_auto]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.photoUrl} alt={c.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div>
                      <Label>Nombre</Label>
                      <Input value={c.name} onChange={(e) => updateCollaborator(c.id, { name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Rol</Label>
                      <Input value={c.role} onChange={(e) => updateCollaborator(c.id, { role: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Foto (URL)</Label>
                      <Input
                        value={c.photoUrl}
                        onChange={(e) => updateCollaborator(c.id, { photoUrl: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <Button variant="destructive" size="sm" onClick={() => removeCollaborator(c.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comentarios (sin agregar) */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Comentarios</CardTitle>
                  <CardDescription>Editar, ocultar/mostrar o eliminar.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.comments.map((cm) => (
                  <div
                    key={cm.id}
                    className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_2fr_auto_auto] md:items-center"
                  >
                    <div>
                      <Label>Autor</Label>
                      <Input value={cm.author} onChange={(e) => updateComment(cm.id, { author: e.target.value })} />
                    </div>
                    <div>
                      <Label>Comentario</Label>
                      <Textarea
                        rows={3}
                        value={cm.text}
                        onChange={(e) => updateComment(cm.id, { text: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleComment(cm.id)}>
                        {cm.visible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {cm.visible ? "Ocultar" : "Mostrar"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeComment(cm.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
