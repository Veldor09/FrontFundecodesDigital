"use client";


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/app/landing/components/Header";
import Footer from "@/app/landing/components/Footer";
import ContactForm from "./ContactForm";

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

  const contactInfo = [
    {
      icon: Phone,
      title: "Teléfono",
      value: "+506 2222-2222",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Mail,
      title: "Correo",
      value: "info@fundecodes.org",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: MapPin,
      title: "Ubicación",
      value: "Guanacaste, Costa Rica",
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: Clock,
      title: "Horario",
      value: "Lun - Vie: 8am - 5pm",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="px-3 py-8 sm:px-4 sm:py-10 md:px-6 lg:px-8 lg:py-14">
        <section className="relative mx-auto w-full max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
            <div
              className="px-5 py-8 text-slate-700 sm:px-7 sm:py-10 lg:px-10 lg:py-12"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#1e3a8a] sm:text-4xl lg:text-5xl">
                  CONTÁCTANOS
                </h1>
                <p className="mx-auto mt-3 max-w-3xl text-base text-slate-600 sm:text-lg">
                  ¿Tienes alguna pregunta o proyecto en mente? Estamos aquí para ayudarte.
                </p>
              </div>
            ))}
          </div>
        </section>

              <section className="mx-auto max-w-3xl">
                <div className="rounded-xl bg-slate-50 p-5 shadow-md sm:p-6 lg:p-7">
                  <ContactForm />
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}