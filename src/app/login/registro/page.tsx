"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

export default function RegistroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarCedula = (cedula: string) => /^[0-9A-Za-z\-]{6,}$/.test(cedula);
  const validarPassword = (pass: string) => pass.length >= 8;

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});
    setCargando(true);

    const nuevosErrores: Record<string, string> = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!validarCedula(form.cedula)) nuevosErrores.cedula = "Cédula/pasaporte inválido (mínimo 6 caracteres)";
    if (!form.telefono) nuevosErrores.telefono = "Teléfono incompleto";
    if (!validarEmail(form.email)) nuevosErrores.email = "Correo inválido";
    if (!validarPassword(form.password)) nuevosErrores.password = "Mínimo 8 caracteres";
    if (form.password !== form.confirmarPassword) nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setCargando(false);
      return;
    }

    // 🔥 QUEMADO: simulamos registro exitoso
    localStorage.setItem("autenticado", "true");
    router.push("/admin");

    setCargando(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100">
      <form
        onSubmit={manejarSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-5"
      >
        <h1 className="text-2xl font-bold text-center text-teal-700">Crear cuenta</h1>

        {/* Nombre completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={manejarCambio}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errores.nombre ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500"
            }`}
            placeholder="Juan Pérez"
            required
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </div>

        {/* Cédula / Pasaporte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / Pasaporte / ID</label>
          <input
            name="cedula"
            value={form.cedula}
            onChange={manejarCambio}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errores.cedula ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500"
            }`}
            placeholder="123456789"
            required
          />
          {errores.cedula && <p className="text-xs text-red-600 mt-1">{errores.cedula}</p>}
        </div>

        {/* Teléfono con selector de país */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de teléfono</label>
          <PhoneInput
            defaultCountry="cr"
            value={form.telefono}
            onChange={(tel) => setForm((prev) => ({ ...prev, telefono: tel }))}
            inputClassName={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errores.telefono ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500"
            }`}
          />
          {errores.telefono && <p className="text-xs text-red-600 mt-1">{errores.telefono}</p>}
        </div>

        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={manejarCambio}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errores.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500"
            }`}
            placeholder="tu@correo.org"
            required
          />
          {errores.email && <p className="text-xs text-red-600 mt-1">{errores.email}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={manejarCambio}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errores.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500"
            }`}
            placeholder="Mínimo 8 caracteres"
            required
          />
          {errores.password && <p className="text-xs text-red-600 mt-1">{errores.password}</p>}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <input
            name="confirmarPassword"
            type="password"
            value={form.confirmarPassword}
            onChange={manejarCambio}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errores.confirmarPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500"
            }`}
            placeholder="Repite la contraseña"
            required
          />
          {errores.confirmarPassword && <p className="text-xs text-red-600 mt-1">{errores.confirmarPassword}</p>}
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {cargando ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-teal-600 hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </main>
  );
}