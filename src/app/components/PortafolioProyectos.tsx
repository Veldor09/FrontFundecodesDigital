import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PortafolioProyectos() {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">PORTAFOLIO DE PROYECTOS</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((project) => (
          <Card key={project} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Image
                src={`/placeholder.svg?height=150&width=250`}
                alt={`Proyecto ${project}`}
                width={250}
                height={150}
                className="w-full rounded-lg"
              />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">Proyecto {project}</CardTitle>
              <p className="text-gray-600 text-sm">Descripción breve del proyecto y sus características principales.</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center mt-8">
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/proyectos">Ver más proyectos</Link>
        </Button>
      </div>
    </section>
  )
}
