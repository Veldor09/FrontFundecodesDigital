"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, ChevronDown, ChevronUp, MapPin, Calendar } from "lucide-react"

export default function FormularioVoluntario() {
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
      setErrors((prev) => ({ ...prev, fullname: "" }))
    } else {
      setErrors((prev) => ({ ...prev, fullname: "Solo se permiten letras y espacios" }))
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

  // Validación edad (solo números)
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const regex = /^[0-9]*$/
    if (regex.test(value)) {
      const numValue = Number.parseInt(value)
      if (value === "" || (numValue >= 16 && numValue <= 99)) {
        e.target.value = value
        setErrors((prev) => ({ ...prev, age: "" }))
      } else {
        setErrors((prev) => ({ ...prev, age: "La edad debe estar entre 16 y 99 años" }))
      }
    } else {
      setErrors((prev) => ({ ...prev, age: "Solo se permiten números" }))
    }
  }

  // Validación cédula (solo números y guiones)
  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const regex = /^[0-9-]*$/
    if (regex.test(value)) {
      e.target.value = value
      setErrors((prev) => ({ ...prev, cedula: "" }))
    } else {
      setErrors((prev) => ({ ...prev, cedula: "Solo se permiten números y guiones" }))
    }
  }

  // Validación país y ciudad (solo letras y espacios)
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
    if (regex.test(value)) {
      e.target.value = value
      setErrors((prev) => ({ ...prev, [field]: "" }))
    } else {
      setErrors((prev) => ({ ...prev, [field]: "Solo se permiten letras y espacios" }))
    }
  }

  // Validación teléfono
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
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
          <span className="text-sm sm:text-base">FORMULARIO DE VOLUNTARIOS</span>
        </CardTitle>

        {/* Descripción cuando está colapsado */}
        {!isExpanded && (
          <div className="mt-3">
            <p className="text-gray-600 text-sm mb-4">
              ¿Quieres formar parte de nuestro equipo de voluntarios? Únete a nosotros y ayuda a hacer la diferencia en
              nuestra comunidad.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4 mb-4">
              <span>✓ Experiencia enriquecedora</span>
              <span>✓ Certificado de participación</span>
              <span>✓ Horarios flexibles</span>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          onClick={toggleForm}
          className="w-full flex items-center justify-center gap-2 mt-2 bg-transparent text-sm sm:text-base"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar formulario
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Registrarse como voluntario
            </>
          )}
        </Button>
      </CardHeader>

      {/* Formulario expandible */}
      {isExpanded && (
        <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300 p-4 sm:p-6 pt-0">
          <div>
            <Label htmlFor="fullname" className="text-sm">
              Nombre completo *
            </Label>
            <Input
              id="fullname"
              placeholder="Tu nombre completo"
              required
              className="mt-1"
              onChange={handleNameChange}
            />
            {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
          </div>

          <div>
            <Label htmlFor="email-volunteer" className="text-sm">
              Correo electrónico *
            </Label>
            <Input
              id="email-volunteer"
              type="email"
              placeholder="tu@email.com"
              required
              className="mt-1"
              onChange={handleEmailChange}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age" className="text-sm">
                Edad *
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="age" placeholder="Tu edad" className="pl-10" required onChange={handleAgeChange} />
              </div>
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
            </div>

            <div>
              <Label htmlFor="cedula" className="text-sm">
                Número de cédula *
              </Label>
              <Input
                id="cedula"
                placeholder="Número de identificación"
                required
                className="mt-1"
                onChange={handleCedulaChange}
              />
              {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country" className="text-sm">
                País *
              </Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="country"
                  placeholder="Tu país de residencia"
                  className="pl-10"
                  required
                  onChange={(e) => handleLocationChange(e, "country")}
                />
              </div>
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
            </div>

            <div>
              <Label htmlFor="city" className="text-sm">
                Ciudad/Región *
              </Label>
              <Input
                id="city"
                placeholder="¿De dónde eres?"
                required
                className="mt-1"
                onChange={(e) => handleLocationChange(e, "city")}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="phone-volunteer" className="text-sm">
              Número de teléfono *
            </Label>
            <Input
              id="phone-volunteer"
              placeholder="+1 (555) 123-4567"
              required
              className="mt-1"
              onChange={handlePhoneChange}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="experience" className="text-sm">
              Experiencia previa como voluntario
            </Label>
            <Input id="experience" placeholder="¿Has sido voluntario antes? ¿Dónde?" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="availability" className="text-sm">
              Disponibilidad
            </Label>
            <Input id="availability" placeholder="¿Qué días y horarios tienes disponibles?" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="interests" className="text-sm">
              Áreas de interés
            </Label>
            <Input id="interests" placeholder="¿En qué actividades te gustaría participar?" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="observations" className="text-sm">
              Observaciones
            </Label>
            <Textarea
              id="observations"
              placeholder="Cuéntanos más sobre ti, tus motivaciones, habilidades especiales, o cualquier información adicional que consideres importante..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <input type="checkbox" id="terms" className="mt-1 flex-shrink-0" required />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-700">
                Acepto los términos y condiciones del programa de voluntarios y autorizo el tratamiento de mis datos
                personales de acuerdo con la política de privacidad. *
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button className="w-full sm:flex-1 bg-red-500 hover:bg-red-600 text-sm sm:text-base">
              <Heart className="h-4 w-4 mr-2" />
              Registrarme como voluntario
            </Button>
            <Button
              variant="outline"
              onClick={toggleForm}
              className="w-full sm:flex-1 bg-transparent text-sm sm:text-base"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
