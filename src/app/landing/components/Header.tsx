// src/app/components/Header.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  const menuItems = [
    { name: "Home", href: "#inicio" },
    { name: "Proyectos", href: "#proyectos" },
    { name: "Aliados", href: "#aliados" },
    { name: "Voluntariado", href: "#contacto" },
    { name: "Contacto", href: "#footer" },
  ];

  return (
    <header className="bg-gradient-to-r from-teal-600 to-blue-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-2 shadow-md">
              <Image
                src="/Imagenes/LOGOCODES_Logo.png"
                alt="Logo Fundación"
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold font-modern tracking-wide">FUNDECODES</h1>
              <p className="text-sm text-blue-100 font-medium font-modern">
                Haciendo la diferencia
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-blue-100 transition-colors duration-200 font-semibold text-lg tracking-wide font-modern"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Icono usuario -> redirige a /admin */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => router.push("/admin")}
              aria-label="Ir al panel administrativo"
            >
              <User className="h-6 w-6" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="lg:hidden text-white hover:bg-white/20"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/20">
            <nav className="flex flex-col space-y-3 mt-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:text-blue-100 transition-colors duration-200 font-semibold text-lg py-3 px-4 rounded-md hover:bg-white/10 font-modern tracking-wide"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
