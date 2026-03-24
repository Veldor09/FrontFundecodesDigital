"use client";

export type CarouselPhoto = { id: string; src: string; alt?: string };

export default function PhotoCarousel({ photos }: { photos?: CarouselPhoto[] }) {
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
    <section className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mx-4 sm:mx-6">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-green-500 to-blue-600" />

      {/* Background decoration */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-green-50 rounded-full opacity-50 blur-3xl pointer-events-none" />

      <div className="relative px-8 md:px-10 pt-10 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            Nuestros{" "}
            <span className="text-green-600">Aliados</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1.5">Organizaciones que confían y trabajan junto a nosotros</p>
        </div>

        {/* Carousel with fade masks */}
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex animate-scroll gap-5">
            {[...list, ...list].map((foto, idx) => (
              <div
                key={`${foto.id}-${idx}`}
                className="flex-shrink-0 w-44 h-28 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 p-4 flex items-center justify-center"
              >
                <img
                  src={foto.src || "/placeholder.svg"}
                  alt={foto.alt || "Aliado"}
                 className="max-w-full max-h-full object-contain opacity-75 hover:opacity-100 transition-opacity duration-300"
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
          animation: scroll 35s linear infinite;
          will-change: transform;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}