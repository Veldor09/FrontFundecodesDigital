import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 font-modern">Mi Empresa</h3>
            <p className="text-gray-300 font-modern">Transformando ideas en soluciones innovadoras desde 2020.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-modern">Contacto</h3>
            <div className="space-y-2 text-gray-300 font-modern">
              <p>📧 info@miempresa.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 Ciudad, País</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 font-modern">Síguenos</h3>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white font-modern">
                Facebook
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white font-modern">
                Twitter
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white font-modern">
                LinkedIn
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p className="font-modern">&copy; 2024 Mi Empresa. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
