"use client";

import FormularioVoluntarios from "./VolunteerForm";
import Header from "@/app/landing/components/Header";
import Footer from "@/app/landing/components/Footer";

export default function VoluntariadoPage() {
  return (
    <div className="min-h-screen bg-[#1e3a8a] text-white">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-10">
        <section className="relative max-w-6xl mx-auto">
          {/* Marco blanco envolviendo todo */}
          <div className="relative bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="px-6 sm:px-10 lg:px-14 py-10 text-slate-700">
              {/* Título principal */}
              <div className="text-center mb-10">
                <h1
                  className="text-4xl sm:text-5xl font-extrabold leading-none tracking-tight text-[#1e3a8a]"
                  style={{ fontFamily: "Anton, sans-serif", letterSpacing: "-0.04em" }}
                >
                  VOLUNTARIADO EN FUNDECODES
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                  Únete a nuestra red de voluntarios y convierte tu tiempo en impacto social.
                </p>
              </div>

              {/* ¿Qué es el voluntariado? */}
              <section className="max-w-4xl mx-auto">
                <h2
                  className="text-3xl font-extrabold mb-3 text-[#1e3a8a]"
                  style={{ fontFamily: "Anton, sans-serif" }}
                >
                  ¿QUÉ ES EL VOLUNTARIADO?
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  El voluntariado es una actividad libre y solidaria que permite a las personas
                  contribuir con sus conocimientos, habilidades y tiempo a favor de causas
                  sociales, ambientales o comunitarias.
                </p>
              </section>

              <hr className="my-10 border-slate-200" />

              {/* Tipos de voluntariado */}
              <section className="max-w-4xl mx-auto">
                <h2
                  className="text-3xl font-extrabold mb-3 text-[#1e3a8a]"
                  style={{ fontFamily: "Anton, sans-serif" }}
                >
                  TIPOS DE VOLUNTARIADO
                </h2>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>
                    <h3 className="text-[#16a34a] font-bold">Presencial</h3>
                    Actividades en terreno (talleres, brigadas, eventos).
                  </li>
                  <li>
                    <h3 className="text-[#16a34a] font-bold">Virtual</h3>
                    Tareas remotas (redacción, diseño, soporte técnico).
                  </li>
                  <li>
                    <h3 className="text-[#16a34a] font-bold">Ocasional</h3>
                    Participación puntual en campañas o jornadas.
                  </li>
                  <li>
                    <h3 className="text-[#16a34a] font-bold">Recurrente</h3>
                    Compromiso semanal o mensual.
                  </li>
                </ul>
              </section>

              <hr className="my-10 border-slate-200" />

              {/* Áreas de voluntariado */}
              <section className="max-w-5xl mx-auto">
                <h2
                  className="text-3xl font-extrabold mb-6 text-[#1e3a8a]"
                  style={{ fontFamily: "Anton, sans-serif" }}
                >
                  ÁREAS DONDE PUEDES AYUDAR
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { t: "Educación", d: "Talleres, alfabetización digital, tutorías." },
                    { t: "Medio Ambiente", d: "Reforestación, reciclaje, charlas sostenibles." },
                    { t: "Tecnología", d: "Desarrollo web, redes sociales, soporte técnico." },
                    { t: "Comunicación", d: "Redacción, fotografía, diseño gráfico." },
                  ].map((item) => (
                    <div
                      key={item.t}
                      className="rounded-xl border border-slate-200 p-5 bg-white/60 shadow-sm"
                    >
                      <h3 className="text-[#16a34a] font-bold text-lg mb-1">{item.t}</h3>
                      <p className="text-slate-700">{item.d}</p>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="my-10 border-slate-200" />

              {/* Galería */}
              <section className="max-w-5xl mx-auto">
                <h2
                  className="text-3xl font-extrabold mb-6 text-[#1e3a8a]"
                  style={{ fontFamily: "Anton, sans-serif" }}
                >
                  GALERÍA DE VOLUNTARIADO
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <img src="/images/vol-1.jpg" alt="Brigada" className="rounded-xl shadow" />
                  <img src="/images/vol-2.jpg" alt="Taller" className="rounded-xl shadow" />
                  <img src="/images/vol-3.jpg" alt="Ambiental" className="rounded-xl shadow" />
                </div>
              </section>

              <hr className="my-10 border-slate-200" />

              {/* Formulario */}
              <section className="max-w-3xl mx-auto">
                <h2
                  className="text-3xl font-extrabold mb-4 text-center text-[#1e3a8a]"
                  style={{ fontFamily: "Anton, sans-serif" }}
                >
                  ¡ÚNETE AHORA!
                </h2>
                <FormularioVoluntarios />
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
