import Image from "next/image"

export default function Mision() {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Imagen con altura fija, ancho completo y esquinas redondeadas */}
        <div className="w-full h-80 md:order-1 overflow-hidden rounded-lg">
          <Image
            src="/Imagenes/Mision.jpg"
            alt="Misión de la empresa"
            className="w-full h-full object-cover"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>

        {/* Texto */}
        <div className="md:order-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">MISIÓN</h2>
          <p className="text-gray-600 leading-relaxed">
            Somos una organización no gubernamental sin fines de lucro que gestiona recursos vinculados a la conservación de la biodiversidad marina y terrestre,
            impulsando el desarrollo sostenible con participación de actores sociales.
          </p>
        </div>
      </div>
    </section>
  )
}
