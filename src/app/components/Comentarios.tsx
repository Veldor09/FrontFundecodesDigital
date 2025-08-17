import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, User } from "lucide-react"

export default function Comentarios() {
  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 font-modern">
        <MessageSquare className="h-6 w-6" />
        SECCIÓN DE COMENTARIOS
      </h2>
      <div className="space-y-6">
        {[1, 2, 3].map((comment) => (
          <div key={comment} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 font-modern">Cliente {comment}</h4>
                <p className="text-sm text-gray-500 font-modern">Hace 2 días</p>
              </div>
            </div>
            <p className="text-gray-600 font-modern">
              Excelente servicio y atención al cliente. Los resultados superaron nuestras expectativas y el equipo fue
              muy profesional durante todo el proceso.
            </p>
          </div>
        ))}
      </div>

      {/* Add Comment Form */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4 font-modern">Deja tu comentario</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="comment-name" className="font-modern">
              Nombre
            </Label>
            <Input id="comment-name" placeholder="Tu nombre" className="font-modern" />
          </div>
          <div>
            <Label htmlFor="comment-text" className="font-modern">
              Comentario
            </Label>
            <Textarea id="comment-text" placeholder="Escribe tu comentario..." rows={3} className="font-modern" />
          </div>
          <Button className="font-modern">Publicar Comentario</Button>
        </div>
      </div>
    </section>
  )
}
