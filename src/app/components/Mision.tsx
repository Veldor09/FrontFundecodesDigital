import Image from "next/image"

export default function Mision() {
  return (
    <section className="bg-white rounded-lg shadow-sm p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Contenido centrado - Izquierda (2 columnas) */}
          <div className="lg:col-span-2 flex flex-col justify-center items-center text-center space-y-6 lg:order-1">
            <h2 className="text-4xl lg:text-5xl font-bold text-green-600 font-modern tracking-wide">MISIÓN</h2>
            <p className="text-gray-700 leading-relaxed font-modern text-base lg:text-lg">
              Trabajamos de manera colaborativa con comunidades costeras para desarrollar e implementar soluciones
              innovadoras y sostenibles que fortalezcan los medios de vida, mejoren la seguridad alimentaria y promuevan
              la conservación marina a través de la educación, la capacitación técnica y el desarrollo de capacidades
              locales.
            </p>
          </div>

          {/* Imagen grande vertical - Derecha (3 columnas) */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end lg:order-2">
            <div className="bg-gray-100 rounded-lg p-4">
              <Image
                src="/imagenes/Mision.jpg"
                alt="Voluntarios trabajando en comunidad costera"
                width={380}
                height={500}
                className="rounded-lg w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
