"use client";

export type CarouselPhoto = { id: string; src: string; alt?: string };

export default function PhotoCarousel({ photos }: { photos?: CarouselPhoto[] }) {
  // Fallback demo si no llegan props
  const list: CarouselPhoto[] =
    photos?.filter(p => !!p.src) ?? [
      { id: "1", src: "/Img/sinac.png", alt: "SINAC" },
      { id: "2", src: "/Img/CostaRica-PorSiempre.png", alt: "Costa Rica Por Siempre" },
      { id: "3", src: "/Img/ACT logo.png", alt: "ACT" },
      { id: "4", src: "/Img/Fideicomiso CR.png", alt: "Fideicomiso CR" },
      { id: "5", src: "/Img/ACG-logo.png", alt: "ACG" },
      { id: "6", src: "/Img/CanjeNaturaleza.png", alt: "Canje Naturaleza" },
      { id: "7", src: "/Img/OlasVerdes.jpg", alt: "Olas Verdes" },
      { id: "8", src: "/Img/Harmony.jpg", alt: "Harmony" },
      { id: "9", src: "/Img/Ramsar_logo.svg.png", alt: "Ramsar" },
      { id: "10", src: "/Img/RIU.png", alt: "RIU" },
    ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl lg:text-5xl font-bold text-green-600 mb-12 text-center tracking-tight">
          NUESTROS ALIADOS
        </h2>

        {/* Carrusel infinito */}
        <div className="relative">
          <div className="flex animate-scroll gap-8">
            {[...list, ...list].map((foto, idx) => (
              <div
                key={`${foto.id}-${idx}`}
                className="flex-shrink-0 w-72 h-48 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 flex items-center justify-center border border-gray-100"
              >
                <img
                  src={foto.src || "/placeholder.svg"}
                  alt={foto.alt || "Colaborador"}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>


        </div>
       
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { 
          animation: scroll 40s linear infinite;
          will-change: transform;
        }
        .animate-scroll:hover { 
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}