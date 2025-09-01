"use client";
import { useLandingData } from "../services/LandingDataProvider";

type Block = { title?: string; content?: string; imageUrl?: string };

type Props = {
  vision?: Block;
  mission?: Block;
};

/**
 * Componente único que muestra VISIÓN y MISIÓN en la misma sección.
 * - Si recibe props (vision/mission) las usa.
 * - Si no, lee del context (landing normal).
 */
export default function VisionMision({ vision, mission }: Props) {
  const { data } = useLandingData();

  // VISIÓN
  const titleV   = vision?.title   ?? data?.vision?.title   ?? "VISIÓN";
  const contentV = vision?.content ?? data?.vision?.content ?? " Nos esforzamos por impulsar comunidades costeras prósperas y resilientes donde las personas, particularmente pescadores, acuicultores y comunidades costeras, tengan acceso equitativo a oportunidades económicas sostenibles que les permitan prosperar mientras protegen los recursos marinos para las generaciones futuras.";
  const imageV   = vision?.imageUrl ?? data?.vision?.imageUrl ?? "/Img/Vision.jpg";

  // MISIÓN
  const titleM   = mission?.title   ?? data?.mission?.title   ?? "MISIÓN";
  const contentM = mission?.content ?? data?.mission?.content ?? "Trabajamos de manera colaborativa con comunidades costeras para desarrollar e implementar soluciones innovadoras y sostenibles que fortalezcan los medios de vida, mejoren la seguridad alimentaria y promuevan la conservación marina a través de la educación, la capacitación técnica y el desarrollo de capacidades locales.";
  const imageM   = mission?.imageUrl ?? data?.mission?.imageUrl ?? "/Img/Mision.jpg";

  return (
    <section className="relative bg-white rounded-xl shadow-md py-12 lg:py-16 mx-4 sm:mx-6 overflow-hidden">
      {/* OLA IZQUIERDA (Visión) */}
      <svg
        className="absolute top-0 left-0 w-28 h-28 md:w-40 md:h-40 lg:w-52 lg:h-52 z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="clip-ola-left" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0,1 Q 0.35,0.70 0.55,0.40 Q 0.75,0.15 1,0 L 1,0 Z" />
          </clipPath>
          <linearGradient id="fade-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(30,58,138,0.10)" />
            <stop offset="100%" stopColor="rgba(30,58,138,0.0)" />
          </linearGradient>
        </defs>
        <image href={imageV} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" clipPath="url(#clip-ola-left)" />
        <rect width="100%" height="100%" clipPath="url(#clip-ola-left)" fill="url(#fade-left)" />
      </svg>

      {/* OLA DERECHA (Misión) */}
      <svg
        className="absolute bottom-0 right-0 w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="clip-ola-right" clipPathUnits="objectBoundingBox">
            <path d="M 1,1 L 0,1 Q 0.25,0.75 0.45,0.50 Q 0.70,0.20 1,0 L 1,0 Z" />
          </clipPath>
          <linearGradient id="fade-right" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(16,185,129,0.12)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0.0)" />
          </linearGradient>
        </defs>
        <image href={imageM} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" clipPath="url(#clip-ola-right)" />
        <rect width="100%" height="100%" clipPath="url(#clip-ola-right)" fill="url(#fade-right)" />
      </svg>

      {/* CONTENIDO EN LA MISMA SECCIÓN */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10">
        {/* VISIÓN */}
        <div className="max-w-2xl pl-6 sm:pl-10 lg:pl-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-blue-600 font-modern mb-3">{titleV}</h2>
          <p className="text-gray-700 leading-relaxed font-modern text-base lg:text-lg">{contentV}</p>
        </div>

        {/* MISIÓN */}
        <div className="max-w-2xl mt-8 md:mt-10 lg:mt-12 ml-auto text-right pr-6 sm:pr-10 lg:pr-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-green-600 font-modern mb-3">{titleM}</h2>
          <p className="text-gray-700 leading-relaxed font-modern text-base lg:text-lg">{contentM}</p>
        </div>
      </div>
    </section>
  );
}
