"use client";

import { useState } from "react";
import API from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function VolunteerForm() {
  const [formData, setFormData] = useState({
    fullname: "",
    emailvolunteer: "",
    phonevolunteer: "",
    availability: "",
    areaInteres: "",
    observations: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const payloadBackend = {
      tipoFormulario: "VOLUNTARIADO",
      nombre: formData.fullname,
      correo: formData.emailvolunteer,
      telefono: formData.phonevolunteer,
      payload: {
        disponibilidad: formData.availability,
        areaInteres: formData.areaInteres,
        mensaje: formData.observations,
      },
    };

    try {
      await API.post("/respuestas-formulario", payloadBackend);

      setSuccessMessage(
        "Tu registro fue enviado correctamente. Pronto nos pondremos en contacto contigo."
      );

      setFormData({
        fullname: "",
        emailvolunteer: "",
        phonevolunteer: "",
        availability: "",
        areaInteres: "",
        observations: "",
      });
    } catch (error: any) {
      console.log("ERROR BACKEND:", error?.response?.data);

      setErrorMessage(
        "No se pudo enviar el registro. Verifica los datos e inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    
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
        <Label htmlFor="areaInteres">Área de interés *</Label>
        <Input
          id="areaInteres"
          name="areaInteres"
          placeholder="Conservación, educación ambiental, monitoreo, etc."
          value={formData.areaInteres}
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

      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-black hover:bg-gray-800 text-white"
      >
        {loading ? "Enviando..." : "Registrarme como voluntario"}
      </Button>
    </form>
  );
}