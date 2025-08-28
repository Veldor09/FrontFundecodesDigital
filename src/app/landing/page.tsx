import Image from "next/image";

import Header from "./components/Header";
import Vision from "./components/Vision";
import Mision from "./components/Mission";
import PortafolioProyectos from "./components/ProjectPortfolio";
import FormularioDeContacto from "./components/ContactForm";
import FormularioVoluntarios from "./components/VolunteerForm";
import CarruselFotos from "./components/PhotoCarousel";
import Comentarios from "./components/Comments";
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
