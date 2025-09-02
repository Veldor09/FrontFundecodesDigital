"use client";

export default function HeroVideo() {
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
        <source src="/videos/VideoFUNDECODES.mp4" type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Texto principal */}
      <h1
        className="relative z-10 text-white text-center leading-none tracking-tight font-extrabold text-[clamp(4rem,14vw,10rem)] drop-shadow-md"
        style={{ fontFamily: "Anton, sans-serif", letterSpacing: "-0.04em" }}
      >
        FUNDECODES
      </h1>

      {/* Separador de olas */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full"
        aria-hidden="true"
      >
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
