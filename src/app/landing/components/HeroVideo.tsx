"use client";

type HeroVideoProps = {
  videoUrl?: string; // <- opcional
};

export default function HeroVideo({
  videoUrl = "/videos/VideoFUNDECODES.mp4", // <- valor por defecto
}: HeroVideoProps) {
  return (
    <section
      id="inicio"
      className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden bg-black"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Texto principal */}
      <div className="relative z-10 text-white text-center px-4">
        <h1
          className="leading-none tracking-tight font-bold text-[clamp(3rem,12vw,8rem)] drop-shadow-2xl"
          style={{ fontFamily: "'Open Sans', sans-serif", letterSpacing: "0.02em" }}
        >
          Fundecodes
        </h1>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-green-400"></div>
          <p 
            className="text-lg sm:text-xl md:text-2xl font-light tracking-[0.15em] drop-shadow-lg uppercase"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            Equilibrio entre conservación y desarrollo
          </p>
          <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-green-400"></div>
        </div>
      </div>

      {/* Separador de olas */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full" aria-hidden="true">
        <svg
          className="block w-full h-[80px] sm:h-[120px]"
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,96 L60,90 C120,84 240,72 360,64 C480,56 600,52 720,58 C840,64 960,80 1080,90 C1200,100 1320,106 1380,108 L1440,110 L1440,120 L0,120 Z"
            fill="#1e3a8a"
            fillOpacity="0.65"
          />
          <path
            d="M0,64 L60,58 C120,52 240,40 360,53 C480,67 600,107 720,112 C840,117 960,85 1080,75 C1200,65 1320,76 1380,82 L1440,88 L1440,120 L0,120 Z"
            fill="#1e3a8a"
            fillOpacity="1"
          />
        </svg>
      </div>
    </section>
  );
}