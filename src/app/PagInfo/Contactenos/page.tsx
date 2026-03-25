"use client";

import Header from "@/app/landing/components/Header";
import Footer from "@/app/landing/components/Footer";
import ContactForm from "./ContactForm";

export default function ContactenosPage() {
  return (
    <div className="min-h-screen bg-[#1e3a8a] text-white">
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