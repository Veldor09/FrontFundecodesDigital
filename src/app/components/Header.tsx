"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Home,
  Eye,
  Target,
  Briefcase,
  Mail,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type HeaderProps = {
  /** Clase opcional para tipografía. Ej: "font-poppins" */
  poppinsFont?: string;
};

export default function Header({ poppinsFont = "" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  const menuItems = [
    { name: "Inicio", href: "#inicio", icon: Home },
    { name: "Visión", href: "#vision", icon: Eye },
    { name: "Misión", href: "#mision", icon: Target },
    { name: "Proyectos", href: "#proyectos", icon: Briefcase },
    { name: "Todos los Proyectos", href: "/proyectos", icon: Briefcase },
    { name: "Contacto", href: "#contacto", icon: Mail },
    { name: "Comentarios", href: "#comentarios", icon: MessageSquare },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Menú hamburguesa */}
            <div className="flex items-center space-x-2 sm:space-x-4 relative">
              <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Abrir menú">
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Título */}
              <div className={`hidden sm:block text-lg font-bold tracking-wide ${poppinsFont}`}>
                FUNDECODES
              </div>

              {/* Dropdown */}
              {isMenuOpen && (
                <div className="absolute top-12 left-0 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-3 sm:p-4">
                    <nav className="space-y-1">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-3 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-50 transition-colors group text-sm"
                          >
                            <Icon className="h-4 w-4 text-gray-500 group-hover:text-blue-600 flex-shrink-0" />
                            <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                              {item.name}
                            </span>
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Contacto rápido */}
                    <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 mb-2">Contacto Rápido</p>
                      <p className="text-xs text-gray-600 flex items-center">
                        <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">fundecodeshojancha@gmail.com</span>
                      </p>
                      <p className="text-xs text-gray-600">📞 +506 8670-3535</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logo (asegúrate de que exista en /public/imagenes) */}
            <div className="flex items-center">
              <Image
                src="/imagenes/FUNDECODES_Logo.png"
                width={120}
                height={40}
                alt="Logo de FUNDECODES"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      {/* Cerrar menú haciendo click fuera */}
      {isMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />}
    </>
  );
}
