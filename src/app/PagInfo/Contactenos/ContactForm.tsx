"use client";

import { useState } from "react";
import API from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle2, XCircle } from "lucide-react";

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

      setSuccessMessage(
        "Mensaje enviado correctamente. Te responderemos pronto."
      );

      setFormData({
        nombre: "",
        correo: "",
        telefono: "",
        mensaje: "",
      });
    } catch (error: any) {
      console.log("ERROR BACKEND:", error?.response?.data);

      setErrorMessage(
        "Error al enviar el mensaje. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
          <Send className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Envíanos un mensaje
          </h2>
          <p className="text-slate-500 text-sm">
            Te responderemos lo antes posible
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label
              htmlFor="nombre"
              className="text-slate-700 font-medium text-sm"
            >
              Nombre completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="correo"
              className="text-slate-700 font-medium text-sm"
            >
              Correo electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={handleChange}
              required
              className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="telefono"
            className="text-slate-700 font-medium text-sm"
          >
            Teléfono <span className="text-red-500">*</span>
          </Label>
          <Input
            id="telefono"
            name="telefono"
            type="tel"
            placeholder="8888-8888"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="mensaje"
            className="text-slate-700 font-medium text-sm"
          >
            Tu mensaje <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="mensaje"
            name="mensaje"
            placeholder="Cuéntanos en qué podemos ayudarte..."
            rows={6}
            value={formData.mensaje}
            onChange={handleChange}
            required
            className="resize-none border-slate-200 bg-slate-50/50 focus:bg-white focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-200"
          />
        </div>
      </div>

      {successMessage ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 font-medium text-sm">
            {successMessage}
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 font-medium text-sm">
            {errorMessage}
          </p>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-emerald-600 text-white font-semibold h-14 text-base rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            Enviando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Enviar mensaje
          </span>
        )}
      </Button>
    </form>
  );
}