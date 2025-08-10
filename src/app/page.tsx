import Header from "./components/Header"
import Vision from "./components/Vision"
import Mision from "./components/Mision"
import PortafolioProyectos from "./components/PortafolioProyectos"
import FormularioContacto from "./components/FormularioDeContacto"
import FormularioVoluntario from "./components/FormularioVoluntarios"
import Comentarios from "./components/Comentarios"
import Footer from "./components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔵 Sección de INICIO expandida al 100% del ancho */}
      <section
        id="inicio"
        className="w-full relative text-center py-20 sm:py-28 bg-white overflow-hidden"
      >
        <h1
          className="w-full text-[clamp(5rem,16vw,12rem)] font-normal text-center text-transparent bg-clip-text bg-[url('/imagenes/Fondo_Inicio.jpg')] bg-cover bg-center leading-none"
          style={{ fontFamily: 'Anton, sans-serif' }}
        >
          FUNDECODES
        </h1>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg
            className="relative block w-[calc(200%+1.3px)] h-[60px]"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M0,0V46.29c47.84,22,103.69,29.05,158,17.56,70.41-15.71,136.26-57.15,207-61.88C438.89-.61,511.62,31.59,584,50.69c69.89,18.36,137.41,15.63,206.5,0,65.72-14.8,130.09-44.76,195.5-37.4,41.67,4.86,82,22.09,120,41.33V0Z"
              opacity="0.25"
              className="fill-blue-600 animate-wave1"
            />
            <path
              d="M0,0V15.81C47.84,34,103.69,45.59,158,42.61c70.41-3.77,136.26-33.93,207-38.66C438.89-.61,511.62,20.63,584,30.72c69.89,9.3,137.41,7.92,206.5,0,65.72-7.48,130.09-22.59,195.5-18.9,41.67,2.45,82,11.14,120,20.85V0Z"
              opacity="0.5"
              className="fill-blue-700 animate-wave2"
            />
            <path
              d="M0,0V5.63C47.84,19.51,103.69,27.63,158,26.59c70.41-1.26,136.26-14.1,207-16.09C438.89,9.12,511.62,18.09,584,23.07c69.89,5.47,137.41,4.66,206.5,0,65.72-4.4,130.09-13.31,195.5-11.13,41.67,1.45,82,6.46,120,11.9V0Z"
              className="fill-blue-800 animate-wave3"
            />
          </svg>
        </div>
      </section>

      {/* 🔵 Resto del contenido dentro del contenedor */}
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

        {/* Forms Section - Responsive Grid */}
        <section id="contacto" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <FormularioContacto />
          <FormularioVoluntario />
        </section>

        <div id="comentarios">
          <Comentarios />
        </div>
      </main>

      <Footer />
    </div>
  )
}
