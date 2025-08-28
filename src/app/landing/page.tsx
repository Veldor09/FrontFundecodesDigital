import Image from "next/image";

import Header from "./components/Header";
import Vision from "./components/Vision";
import Mision from "./components/Mision";
import PortafolioProyectos from "./components/PortafolioProyectos";
import FormularioDeContacto from "./components/FormularioDeContacto";
import FormularioVoluntarios from "./components/FormularioVoluntarios";
import CarruselFotos from "./components/CarruselFotos";
import Comentarios from "./components/Comentarios";
import Footer from "./components/Footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* INICIO */}
      <section
        id="inicio"
        className="w-full relative text-center py-20 sm:py-28 bg-white overflow-hidden"
      >
        <h1
          className="w-full text-[clamp(5rem,16vw,12rem)] font-normal text-center text-transparent bg-clip-text bg-[url('/imagenes/Fondo_Inicio.jpg')] bg-cover bg-center leading-none"
          style={{ fontFamily: "Anton, sans-serif" }}
        >
          FUNDECODES
        </h1>
      </section>

      {/* CONTENIDO */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 bg-[#1e3a8a] text-white">
        <div id="vision">
          <Vision />
        </div>

        <div id="mision">
          <Mision />
        </div>

        <div id="proyectos">
          <PortafolioProyectos />
        </div>

        {/* Aliados */}
        <section id="aliados" className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center font-modern">
            NUESTROS ALIADOS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((aliado) => (
              <div
                key={aliado}
                className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <Image
                  src={`/ceholder-svg-height-80.png?height=80&width=120`}
                  alt={`Aliado ${aliado}`}
                  width={120}
                  height={80}
                  className="max-w-full h-auto opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Formularios */}
        <section id="contacto" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <FormularioDeContacto />
          <FormularioVoluntarios />
        </section>

        {/* Carrusel */}
        <CarruselFotos />

        {/* Comentarios */}
        <div id="comentarios">
          <Comentarios />
        </div>
      </main>

      <Footer />
    </div>
  );
}
