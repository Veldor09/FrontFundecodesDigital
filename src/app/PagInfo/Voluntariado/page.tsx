"use client";

import FormularioVoluntarios from "./VolunteerForm";
import Header from "@/app/landing/components/Header";
import Footer from "@/app/landing/components/Footer";
import { Leaf, Microscope, BookOpen, Users } from "lucide-react";

export default function VoluntariadoPage() {
  return (
    <div className="min-h-screen bg-[#1e3a8a] text-white">
      <Header />

      <main className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
        <section className="relative w-full max-w-6xl mx-auto">
          {/* Marco blanco */}
          <div className="relative bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div
              className="px-5 sm:px-7 lg:px-10 py-8 sm:py-10 lg:py-12 text-slate-700"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              {/* Título */}
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#1e3a8a]">
                  VOLUNTARIADO EN FUNDECODES
                </h1>
                <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
                  Sé parte de los esfuerzos reales de conservación y educación ambiental en Costa Rica.
                </p>
              </div>

              {/* ¿Qué es el voluntariado? */}
              <section className="max-w-4xl mx-auto">
                <div className="bg-slate-50 rounded-xl p-5 sm:p-6 lg:p-7 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">
                    ¿QUÉ ES EL VOLUNTARIADO?
                  </h2>

                  <p className="text-sm sm:text-base text-slate-700">
                    FUNDECODES trabaja con parques nacionales, refugios de vida silvestre
                    y comunidades locales para proteger ecosistemas marinos y terrestres.
                  </p>

                  {/* Leer más + Mostrar menos */}
                  <details className="group">
                    <summary className="cursor-pointer text-green-600 text-sm font-semibold hover:underline group-open:hidden">
                      Leer más...
                    </summary>

                    <div className="mt-3 text-slate-700 text-sm sm:text-base space-y-3">
                      <p>
                        Las personas voluntarias apoyan en labores como patrullajes, limpieza de playas,
                        educación ambiental, actividades con comunidades y apoyo logístico en proyectos.
                      </p>
                      <p>
                        El voluntariado busca fortalecer la ciencia ciudadana, promover la sostenibilidad y
                        sumar manos para la protección de los ecosistemas del Pacífico Norte y del Área de
                        Conservación Tempisque.
                      </p>

                      {/* Botón mostrar menos */}
                      <button
                        type="button"
                        onClick={(e) => {
                          const details = (e.currentTarget as HTMLButtonElement).closest("details");
                          if (details) details.removeAttribute("open");
                        }}
                        className="text-green-600 text-sm font-semibold hover:underline mt-2 group-open:block hidden"
                      >
                        Mostrar menos
                      </button>
                    </div>
                  </details>
                </div>
              </section>

              <hr className="my-8 sm:my-10 border-slate-200" />

              {/* TIPOS DE VOLUNTARIADO: Categorías oficiales */}
              <section className="max-w-4xl mx-auto">
                <div className="bg-slate-50 rounded-xl p-5 sm:p-6 lg:p-7 shadow-lg">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-[#1e3a8a]">
                    TIPOS DE VOLUNTARIADO
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    {[
                      {
                        t: "Conservación y manejo de áreas protegidas",
                        d: "Apoyo en patrullajes, limpieza de playas y apoyo en parques y refugios.",
                        icon: <Leaf className="w-7 h-7 text-green-600" />,
                      },
                      {
                        t: "Monitoreo biológico y apoyo a investigación",
                        d: "Registro de biodiversidad, monitoreo de tortugas y estudios ambientales.",
                        icon: <Microscope className="w-7 h-7 text-green-600" />,
                      },
                      {
                        t: "Educación y sensibilización ambiental",
                        d: "Charlas, guías a visitantes, actividades con centros educativos.",
                        icon: <BookOpen className="w-7 h-7 text-green-600" />,
                      },
                      {
                        t: "Proyectos comunitarios y sostenibilidad",
                        d: "Trabajo con comunidades, reciclaje y talleres e iniciativas productivas.",
                        icon: <Users className="w-7 h-7 text-green-600" />,
                      },
                    ].map((item) => (
                      <div
                        key={item.t}
                        className="flex items-start gap-4 p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 bg-green-100 rounded-xl p-3 shadow-inner">
                          {item.icon}
                        </div>

                        <div>
                          <h3 className="text-[#1e3a8a] font-bold text-base sm:text-lg mb-1">
                            {item.t}
                          </h3>
                          <p className="text-slate-600 text-sm sm:text-base">{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <hr className="my-8 sm:my-10 border-slate-200" />

              {/* ÁREAS DONDE PUEDES APOYAR */}
              <section className="max-w-5xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 text-[#1e3a8a] text-center sm:text-left">
                  ÁREAS DONDE PUEDES APOYAR
                </h2>

                <p className="text-slate-600 text-sm sm:text-base max-w-3xl mb-5">
                  El voluntariado se realiza en colaboración con distintas áreas protegidas y comunidades,
                  siempre en coordinación con el personal oficial y los proyectos vigentes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {[
                    {
                      t: "Parques y refugios costeros",
                      d: "Apoyo en la conservación de tortugas marinas y ecosistemas de playa.",
                    },
                    {
                      t: "Bosques y cuencas",
                      d: "Colaboración en actividades de restauración y protección de nacientes y bosques.",
                    },
                    {
                      t: "Comunidades locales",
                      d: "Trabajo conjunto con organizaciones y grupos locales en iniciativas sostenibles.",
                    },
                    {
                      t: "Gestión y apoyo institucional",
                      d: "Apoyo en tareas organizativas, comunicación y seguimiento de proyectos.",
                    },
                  ].map((item) => (
                    <div
                      key={item.t}
                      className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-slate-50 shadow-sm"
                    >
                      <h3 className="text-[#16a34a] font-semibold text-base sm:text-lg mb-1">
                        {item.t}
                      </h3>
                      <p className="text-slate-700 text-sm sm:text-base">{item.d}</p>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="my-8 sm:my-10 border-slate-200" />

              {/* FORMULARIO */}
              <section className="max-w-3xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-[#1e3a8a]">
                  ¡ÚNETE COMO VOLUNTARIO(A)!
                </h2>

                <p className="text-center text-slate-600 mb-5 text-sm sm:text-base">
                  Completa el formulario y FUNDECODES te contactará con las oportunidades disponibles
                  según tu perfil, intereses y disponibilidad.
                </p>

                <div className="bg-slate-50 rounded-xl p-5 sm:p-6 lg:p-7 shadow-md">
                  <FormularioVoluntarios />
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
