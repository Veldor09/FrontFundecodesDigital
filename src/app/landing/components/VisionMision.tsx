"use client";
import { Target, Users } from "lucide-react";

type Block = { title?: string; content?: string; imageUrl?: string };

type Props = {
  vision?: Block;
  mission?: Block;
};

/**
 * Componente único que muestra VISIÓN y MISIÓN en tarjetas separadas.
 */
export default function VisionMision({ vision, mission }: Props) {
  // VISIÓN
  const titleV   = vision?.title   ?? "Visión";
  const contentV = vision?.content ?? "Ser líder en conservación de la biodiversidad y el desarrollo sostenible con amplia participación de actores sociales.";

  // MISIÓN
  const titleM   = mission?.title   ?? "Misión";
  const contentM = mission?.content ?? "Somos una organización no gubernamental sin fines de lucro que gestiona recursos vinculados a la conservación de la biodiversidad marina y terrestre, impulsando el desarrollo sostenible con participación de actores sociales.";

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white rounded-3xl shadow-md mx-4 sm:mx-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* TARJETA VISIÓN */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border-t-4 border-blue-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-blue-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {titleV}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-base lg:text-lg" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              {contentV}
            </p>
            <div className="flex gap-2 mt-6">
              <div className="h-1 w-12 bg-blue-600 rounded"></div>
              <div className="h-1 w-8 bg-blue-400 rounded"></div>
              <div className="h-1 w-4 bg-blue-300 rounded"></div>
            </div>
          </div>

          {/* TARJETA MISIÓN */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border-t-4 border-teal-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-teal-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-teal-600" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {titleM}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-base lg:text-lg" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              {contentM}
            </p>
            <div className="flex gap-2 mt-6">
              <div className="h-1 w-12 bg-teal-600 rounded"></div>
              <div className="h-1 w-8 bg-teal-400 rounded"></div>
              <div className="h-1 w-4 bg-teal-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}