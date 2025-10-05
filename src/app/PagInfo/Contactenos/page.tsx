"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Header from "@/app/landing/components/Header";
import Footer from "@/app/landing/components/Footer";

export default function ContactenosPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#1e3a8a] text-white">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-10">
        <section className="relative max-w-6xl mx-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="px-6 sm:px-10 lg:px-14 py-10">
              
              {/* Título principal */}
              <div className="text-center mb-10">
                <h1
                  className="text-4xl sm:text-5xl font-bold leading-none tracking-tight text-[#1e3a8a]"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  CONTÁCTANOS
                </h1>
                <p className="mt-4 text-lg text-slate-600" style={{ fontFamily: "Open Sans, sans-serif" }}>
                  ¿Tienes alguna pregunta o proyecto en mente? Estamos aquí para ayudarte.
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                {/* Formulario */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Send className="h-5 w-5 text-green-600" />
                    </div>
                    <h2
                      className="text-2xl font-bold text-[#1e3a8a]"
                      style={{ fontFamily: "Open Sans, sans-serif" }}
                    >
                      ENVÍANOS UN MENSAJE
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: "Open Sans, sans-serif" }}>
                    <div className="bg-slate-50 rounded-xl p-6 space-y-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Datos de información</h3>
                      <p className="text-sm text-slate-600 -mt-2 mb-4">¿Cómo te podemos contactar?</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-slate-700 font-semibold mb-2 block text-sm">
                            Nombre <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Ej: Juan"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="h-11 border-slate-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-slate-700 font-semibold mb-2 block text-sm">
                            Correo electrónico <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-11 border-slate-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">¿Cómo te podemos ayudar?</h3>
                      <p className="text-sm text-slate-600 mb-4">¿Tienes alguna pregunta o quieres dejar algún comentario?</p>
                      
                      <div>
                        <Label htmlFor="message" className="text-slate-700 font-semibold mb-2 block text-sm">
                          Comentarios / Preguntas <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Escribe tu mensaje aquí..."
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="resize-none border-slate-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {status === "success" && (
                      <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                        <p className="text-green-700 font-medium flex items-center gap-2">
                          <span className="text-xl">✓</span>
                          Mensaje enviado correctamente. Te responderemos pronto.
                        </p>
                      </div>
                    )}

                    {status === "error" && (
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                        <p className="text-red-700 font-medium flex items-center gap-2">
                          <span className="text-xl">✗</span>
                          Error al enviar el mensaje. Por favor, intenta de nuevo.
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={status === "sending"}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-base rounded-lg transition-colors duration-200"
                    >
                      {status === "sending" ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Enviando...
                        </span>
                      ) : (
                        "Enviar mensaje"
                      )}
                    </Button>
                  </form>

                  {/* 🗺️ Mapa debajo del formulario */}
                  <div className="mt-10 rounded-2xl overflow-hidden shadow-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1167.9230036965548!2d-85.41807338512878!3d10.065528638250798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f9fbab8ad2ae131%3A0xd7416bb8610367e!2sFundecodes!5e0!3m2!1ses!2scr!4v1759641458147!5m2!1ses!2scr"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Ubicación FUNDECODES"
                      className="w-full"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
