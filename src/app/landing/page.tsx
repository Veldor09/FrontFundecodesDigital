import Image from "next/image";

import Header from "./components/Header";
import PortafolioProyectos from "./components/ProjectPortfolio";
import CarruselFotos from "./components/PhotoCarousel";
import Comentarios from "./components/Comments";
import Footer from "./components/Footer";
import VisionMision from "./components/VisionMision";
import HeroVideo from "./components/HeroVideo"; // 👈 import nuevo

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* INICIO (extraído a componente) */}
      <HeroVideo />

      {/* CONTENIDO */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 bg-[#1e3a8a] text-white">
        <div id="vision-mision">
          <VisionMision />
        </div>

        <div id="proyectos">
          <PortafolioProyectos />
        </div>

        <CarruselFotos />

        <div id="comentarios">
          <Comentarios />
        </div>
      </main>

      <Footer />
    </div>
  );
}
