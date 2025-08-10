import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">FUNDECODES</h3>
            <p className="text-gray-300">Organización para la conservación del medio ambiente.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2 text-gray-300">
              <p>📧 fundecodeshojancha@gmail.com</p>
              <p>📞 +506 8670-3535</p>
              <p>📍 Hojancha, Guanacaste, Costa Rica</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Facebook
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Twitter
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                LinkedIn
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 FUNDECODES. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
