import { Button } from "@/components/ui/button"

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
           <p>
              📧{""}
              <a
                 href="mailto:fundecodeshojancha@gmail.com"
                  className="hover:underline text-blue-400"
              >
                 fundecodeshojancha@gmail.com
              </a>
            </p>
            <p>
               📞{""}
               <a
                   href="tel:+506 2659 8061"
                   className="hover:underline text-blue-400"
               >
                    2659806
                </a>
            </p>
            <p>
                📍{""}
              <a
                 href="https://maps.app.goo.gl/RBt2xJBbgamg9hPN6"
                 target="_blank"
                 rel="noopener noreferrer"
                  className="hover:underline text-blue-400"
              >
                 Guanacaste, Hojancha, Barrio Alto del Cementerio 
               </a>
             </p>
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
                className="group"
             >
               <button
               className="px-4 py-2 rounded-lg border border-transparent 
                     text-gray-300 font-modern transition-all duration-300
                      bg-transparent hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500
                      hover:text-white shadow-sm"
              >
                   Facebook
              </button>
            </a>

          <a
              href="https://www.instagram.com/hojanchafundecodes?igsh=cGl4aDBtNjY1Mnp1"
              target="_blank"
             rel="noopener noreferrer"
            className="group"
          >
            <button
                className="px-4 py-2 rounded-lg border border-transparent 
                   text-gray-300 font-modern transition-all duration-300
                    bg-transparent hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500
                   hover:text-white shadow-sm"
            >
               Instagram
            </button>
          </a>

          <a
             href="https://www.youtube.com"
              target="_blank"
             rel="noopener noreferrer"
              className="group"
          >
            <button
                  className="px-4 py-2 rounded-lg border border-transparent 
                       text-gray-300 font-modern transition-all duration-300
                       bg-transparent hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700
                       hover:text-white shadow-sm"
            >
               YouTube
            </button>
          </a>
          </div>
          </div>


        {/* Pie final */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p className="font-modern">
            &copy; 2025 FUNDECODES. Todos los derechos reservados.
          </p>
        </div>
      </div>
      </div>
    </footer>
  )
}
