'use client'

import { useState } from 'react'
import API from '@/services/api'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function VolunteerForm() {
  const [formData, setFormData] = useState({
    fullname: '',
    emailvolunteer: '',
    phonevolunteer: '',
    availability: '',
    observations: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mapeo al español que espera el backend
    const payload = {
      nombre: formData.fullname,
      email: formData.emailvolunteer,
      telefono: formData.phonevolunteer,
      disponibilidad: formData.availability,
      mensaje: formData.observations,
    }

    try {
      await API.post('/volunteers', payload)
      alert('✅ ¡Registro enviado con éxito!')
      setFormData({
        fullname: '',
        emailvolunteer: '',
        phonevolunteer: '',
        availability: '',
        observations: '',
      })
    } catch (error) {
      alert('❌ Error al enviar el formulario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-md w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-sm sm:text-base font-modern">FORMULARIO DE VOLUNTARIOS</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullname">Nombre completo *</Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="emailvolunteer">Correo electrónico *</Label>
            <Input
              id="emailvolunteer"
              name="emailvolunteer"
              type="email"
              value={formData.emailvolunteer}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="phonevolunteer">Número de teléfono *</Label>
            <Input
              id="phonevolunteer"
              name="phonevolunteer"
              type="tel"
              value={formData.phonevolunteer}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="availability">Disponibilidad *</Label>
            <Input
              id="availability"
              name="availability"
              placeholder="¿Qué días y horarios tienes disponibles?"
              value={formData.availability}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              name="observations"
              rows={4}
              placeholder="Cuéntanos más sobre ti, tus motivaciones, habilidades especiales..."
              value={formData.observations}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? 'Enviando...' : 'Registrarme como voluntario'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}