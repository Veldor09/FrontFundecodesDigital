"use client";

import { useState } from "react";
import API from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const payloadBackend = {
      tipoFormulario: "CONTACTO",
      nombre: formData.nombre,
      correo: formData.correo,
      telefono: formData.telefono,
      payload: {
        mensaje: formData.mensaje,
      },
    };

    try {
      await API.post("/respuestas-formulario", payloadBackend);

      setSuccessMessage("Tu mensaje fue enviado correctamente. Pronto nos pondremos en contacto contigo.");

      setFormData({
        nombre: "",
        correo: "",
        telefono: "",
        mensaje: "",
      });
    } catch (error: any) {
      console.log("ERROR BACKEND:", error?.response?.data);
      setErrorMessage("No se pudo enviar el mensaje. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-[#1e3a8a]">
          ENVÍANOS UN MENSAJE
        </h2>
      </div>

      {successMessage ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-xl font-semibold text-slate-900">
          Datos de información
        </h3>
        <p className="mb-4 text-slate-500">¿Cómo te podemos contactar?</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Juan"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="correo">Correo electrónico *</Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              placeholder="8888-8888"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-xl font-semibold text-slate-900">
          ¿Cómo te podemos ayudar?
        </h3>
        <p className="mb-4 text-slate-500">
          ¿Tienes alguna pregunta o quieres dejar algún comentario?
        </p>

        <div>
          <Label htmlFor="mensaje">Comentarios / Preguntas *</Label>
          <Textarea
            id="mensaje"
            name="mensaje"
            placeholder="Escribe tu mensaje aquí..."
            value={formData.mensaje}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white hover:bg-green-700"
      >
        {loading ? "Enviando..." : "Enviar mensaje"}
      </Button>
    </form>
  );
}