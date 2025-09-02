"use client";

import FormularioVoluntarios from "./VolunteerForm";
import Header from "@/app/landing/components/Header";
import Footer from "@/app/landing/components/Footer";

export default function VoluntariadoPage() {
  return (
    <div className="min-h-screen bg-[#1e3a8a] text-white font-sans">
      <Header />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Título principal */}
        <section className="text-center">
          <h1
            className="text-4xl font-extrabold tracking-tight leading-none"
            style={{ fontFamily: "Anton, sans-serif", letterSpacing: "-0.04em" }}
          >
            Voluntariado en FUNDECODES
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Únete a nuestra red de voluntarios y convierte tu tiempo en impacto social.
          </p>
        </section>

        {/* ¿Qué es el voluntariado? */}
        <section className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-blue-200">
            ¿Qué es el voluntariado?
          </h2>
          <p className="text-blue-100 leading-relaxed">
            El voluntariado es una actividad libre y solidaria que permite a las personas
            contribuir con sus conocimientos, habilidades y tiempo a favor de causas
            sociales, ambientales o comunitarias.
          </p>
        </section>

        {/* Tipos de voluntariado */}
        <section className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-blue-200">
            Tipos de voluntariado
          </h2>
          <ul className="list-disc list-inside space-y-2 text-blue-100">
            <li><strong>Presencial:</strong> Actividades en terreno (talleres, brigadas, eventos).</li>
            <li><strong>Virtual:</strong> Tareas remotas (redacción, diseño, soporte técnico).</li>
            <li><strong>Ocasional:</strong> Participación puntual en campañas o jornadas.</li>
            <li><strong>Recurrente:</strong> Compromiso semanal o mensual.</li>
          </ul>
        </section>

        {/* Áreas de voluntariado */}
        <section className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-blue-200">
            Áreas donde puedes ayudar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-100">
            <div className="border border-blue-400/30 p-4 rounded-md">
              <h3 className="font-bold text-blue-200">Educación</h3>
              <p>Talleres, alfabetización digital, tutorías.</p>
            </div>
            <div className="border border-blue-400/30 p-4 rounded-md">
              <h3 className="font-bold text-blue-200">Medio Ambiente</h3>
              <p>Reforestación, reciclaje, charlas sostenibles.</p>
            </div>
            <div className="border border-blue-400/30 p-4 rounded-md">
              <h3 className="font-bold text-blue-200">Tecnología</h3>
              <p>Desarrollo web, redes sociales, soporte técnico.</p>
            </div>
            <div className="border border-blue-400/30 p-4 rounded-md">
              <h3 className="font-bold text-blue-200">Comunicación</h3>
              <p>Redacción, fotografía, diseño gráfico.</p>
            </div>
          </div>
        </section>

        {/* Galería placeholder */}
        <section className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-blue-200">
            Galería de voluntariado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <img src="/images/vol-1.jpg" alt="Brigada" className="rounded shadow" />
            <img src="/images/vol-2.jpg" alt="Taller" className="rounded shadow" />
            <img src="/images/vol-3.jpg" alt="Ambiental" className="rounded shadow" />
          </div>
        </section>

        {/* Formulario */}
        <section className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-blue-200">
            ¡Únete ahora!
          </h2>
          <FormularioVoluntarios />
        </section>
      </main>

      <Footer />
    </div>
  );
}