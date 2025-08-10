import Image from "next/image"

export default function Vision() {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Texto */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">VISIÓN</h2>
          <p className="text-gray-600 leading-relaxed">
            Ser líder en conservación de la biodiversidad y el desarrollo sostenible
            con amplia participación de actores sociales.
          </p>
        </div>

        {/* Imagen con altura fija, ancho completo y esquinas redondeadas */}
        <div className="w-full h-80 overflow-hidden rounded-lg">
          <Image
            src="/Imagenes/Vision.png"
            alt="Visión de la empresa"
            className="w-full h-full object-cover"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  )
}
