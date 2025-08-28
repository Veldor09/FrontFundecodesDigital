"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, ChevronDown, ChevronUp } from "lucide-react"

export default function FormularioContacto() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const toggleForm = () => {
    setIsExpanded(!isExpanded)
  }

  // Validación solo letras y espacios
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
    if (regex.test(value)) {
      e.target.value = value
      setErrors((prev) => ({ ...prev, name: "" }))
    } else {
      setErrors((prev) => ({ ...prev, name: "Solo se permiten letras y espacios" }))
    }
  }

  // Validación email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const regex = /^[a-zA-Z0-9@._-]*$/
    if (regex.test(value)) {
      e.target.value = value
      setErrors((prev) => ({ ...prev, email: "" }))

      // Validar formato completo de email
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Formato de email inválido" }))
      }
    } else {
      setErrors((prev) => ({ ...prev, email: "Solo se permiten letras, números, @, ., _ y -" }))
    }
  }

  // Validación teléfono (solo números, espacios, guiones y paréntesis)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const regex = /^[0-9\s\-$$$$+]*$/
    if (regex.test(value)) {
      e.target.value = value
      setErrors((prev) => ({ ...prev, phone: "" }))
    } else {
      setErrors((prev) => ({ ...prev, phone: "Solo se permiten números, espacios, guiones y paréntesis" }))
    }
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-md w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <span className="text-sm sm:text-base font-modern">FORMULARIO DE CONTACTO</span>
        </CardTitle>

        {/* Descripción cuando está colapsado */}
        {!isExpanded && (
          <div className="mt-3">
            <p className="text-gray-600 text-sm mb-4 font-modern">
              ¿Tienes alguna pregunta o necesitas más información? Completa nuestro formulario de contacto y te
              responderemos lo antes posible.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4 mb-4">
              <span className="font-modern">✓ Respuesta en 24 horas</span>
              <span className="font-modern">✓ Consulta gratuita</span>
              <span className="font-modern">✓ Sin compromiso</span>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          onClick={toggleForm}
          className="w-full flex items-center justify-center gap-2 mt-2 bg-transparent text-sm sm:text-base font-modern"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar formulario
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Completar formulario
            </>
          )}
        </Button>
      </CardHeader>

      {/* Formulario expandible */}
      {isExpanded && (
        <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300 p-4 sm:p-6 pt-0">
          <div>
            <Label htmlFor="name" className="text-sm font-modern">
              Nombre completo *
            </Label>
            <Input id="name" placeholder="Tu nombre completo" required className="mt-1" onChange={handleNameChange} />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-modern">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-modern">
              Correo electrónico *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="mt-1"
              onChange={handleEmailChange}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-modern">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-modern">
              Teléfono
            </Label>
            <Input id="phone" placeholder="Tu número de teléfono" className="mt-1" onChange={handlePhoneChange} />
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-modern">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="subject" className="text-sm font-modern">
              Asunto
            </Label>
            <Input id="subject" placeholder="¿Sobre qué quieres consultarnos?" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-modern">
              Mensaje *
            </Label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí... Cuéntanos más detalles sobre tu consulta."
              rows={4}
              required
              className="mt-1"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base font-modern">
              <Mail className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
            <Button
              variant="outline"
              onClick={toggleForm}
              className="w-full sm:flex-1 bg-transparent text-sm sm:text-base font-modern"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
