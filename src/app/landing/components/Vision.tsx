"use client";

import Image from "next/image";
import { useLandingData } from "../services/LandingDataProvider";

export default function Vision() {
  const { data } = useLandingData();

  const title   = data?.vision?.title   || "VISIÓN";
  const content = data?.vision?.content || "Nos esforzamos por impulsar comunidades costeras prósperas y resilientes donde las personas, particularmente pescadores, acuicultores y comunidades costeras, tengan acceso equitativo a oportunidades económicas sostenibles que les permitan prosperar mientras protegen los recursos marinos para las generaciones futuras.";
  const image   = data?.vision?.imageUrl || "/Imagenes/Vision.jpg"; // usa el mismo path que ya tienes

  return (
    <section className="bg-white rounded-lg shadow-sm p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Imagen (izquierda) */}
          <div className="lg:col-span-3 flex justify-center lg:justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <Image
                src={image}
                alt="Visión de la fundación"
                width={380}
                height={500}
                className="rounded-lg w-full h-[500px] object-cover"
              />
            </div>
          </div>
          {/* Texto (derecha) */}
          <div className="lg:col-span-2 flex flex-col justify-center items-center text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-blue-600 font-modern tracking-wide">{title}</h2>
            <p className="text-gray-700 leading-relaxed font-modern text-base lg:text-lg">{content}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
