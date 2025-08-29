import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-modern">FUNDECODES</h3>
            <p className="text-gray-300 font-modern">
              Transformando ideas en soluciones innovadoras desde 2020.
            </p>
          </div>

          {/* Columna 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-modern">Contacto</h3>
            <div className="space-y-2 text-gray-300 font-modern">
              <p>📧 fundecodeshojancha@gmail.com</p>
              <p>📞 +506 2659 8061</p>
              <p>📍 3H8M+924, Guanacaste, Hojancha, Barrio Alto del Cementerio</p>
            </div>
          </div>

          {/* Columna 3 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-modern">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=100064332054124&locale=es_LA"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white font-modern"
                >
                  Facebook
                </Button>
              </a>
              <a
                href="https://www.instagram.com/hojanchafundecodes?igsh=cGl4aDBtNjY1Mnp1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white font-modern"
                >
                  Instagram
                </Button>
              </a>
              <a
                href="https://www.youtube.com" // 👉 cambia este link por el canal oficial cuando lo tengas
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white font-modern"
                >
                  YouTube
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Pie final */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p className="font-modern">
            &copy; 2025 FUNDECODES. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
