"use client";

import Image from "next/image";

export type CarouselPhoto = { id: string; src: string; alt?: string };

export default function PhotoCarousel({ photos }: { photos?: CarouselPhoto[] }) {
  // Fallback demo si no llegan props
  const list: CarouselPhoto[] =
    photos?.filter(p => !!p.src) ?? [
      { id: "1", src: "/placeholder.svg?height=300&width=400&text=Proyecto+Comunitario+1", alt: "Proyecto comunitario 1" },
      { id: "2", src: "/placeholder.svg?height=300&width=400&text=Conservación+Marina", alt: "Conservación marina" },
      { id: "3", src: "/placeholder.svg?height=300&width=400&text=Educación+Ambiental", alt: "Educación ambiental" },
      { id: "4", src: "/placeholder.svg?height=300&width=400&text=Voluntarios+Trabajando", alt: "Voluntarios trabajando" },
      { id: "5", src: "/placeholder.svg?height=300&width=400&text=Pesca+Sostenible", alt: "Pesca sostenible" },
    ];

  return (
    <section className="bg-white rounded-lg shadow-sm p-8 lg:p-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-green-600 mb-8 text-center font-modern">
          NUESTROS COLABORADORES
        </h2>

        {/* Carrusel infinito */}
        <div className="relative">
          <div className="flex animate-scroll space-x-6">
            {[...list, ...list].map((foto, idx) => (
              <div
                key={`${foto.id}-${idx}`}
                className="flex-shrink-0 w-80 h-60 bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <Image
                  src={foto.src || "/placeholder.svg"}
                  alt={foto.alt || "Colaborador"}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>

          {/* Gradientes de borde */}
          <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scroll 30s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}
