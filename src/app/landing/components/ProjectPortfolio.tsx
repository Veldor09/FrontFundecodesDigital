"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location?: string;
  category?: string;
  area?: string;
  status?: string;
};

export default function ProjectPortfolio({
  projects = [],
}: {
  projects?: Project[];
}) {
  const list = Array.isArray(projects) ? projects : [];

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center font-modern">
        PORTAFOLIO DE PROYECTOS
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Image
                src={project.imageUrl || "/placeholder-150px-height.png"}
                alt={project.title}
                width={250}
                height={150}
                className="w-full rounded-lg"
              />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2 font-modern">{project.title}</CardTitle>
              <p className="text-gray-600 text-sm font-modern">{project.description}</p>

              <div className="mt-2 text-xs text-gray-500 space-y-1">
                {project.location && <p><strong>Lugar:</strong> {project.location}</p>}
                {project.category && <p><strong>Categoría:</strong> {project.category}</p>}
                {project.area && <p><strong>Área:</strong> {project.area}</p>}
                {project.status && <p><strong>Estado:</strong> {project.status}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button asChild className="bg-blue-600 hover:bg-blue-700 font-modern">
          <Link href="/proyectos">Ver más proyectos</Link>
        </Button>
      </div>
    </section>
  );
}