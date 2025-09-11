"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<{ email?: string; password?: string; general?: string }>({});
  const [cargando, setCargando] = useState(false);

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});
    setCargando(true);

    const nuevosErrores: typeof errores = {};

    if (!validarEmail(email)) nuevosErrores.email = "Correo inválido";
    if (password.length < 6) nuevosErrores.password = "Mínimo 6 caracteres";

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setCargando(false);
      return;
    }

   try {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.message || "Correo o contraseña incorrectos";
    setErrores({ general: Array.isArray(msg) ? msg.join(", ") : msg });
    setCargando(false);
    return;
  }

  // Cookie httpOnly ya está puesta por el route handler
  router.push("/admin");
} catch {
  setErrores({ general: "No se pudo conectar con el servidor" });
} finally {
  setCargando(false);
}

  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100">
      <form
        onSubmit={manejarSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-teal-700">Iniciar sesión</h1>

        {errores.general && <p className="text-sm text-red-600 text-center">{errores.general}</p>}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errores.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500"
            }`}
            placeholder="Mínimo 6 caracteres"
            required
          />
          {errores.password && <p className="text-xs text-red-600 mt-1">{errores.password}</p>}
        </div>

        {/* Botón Entrar */}
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {cargando ? "Entrando…" : "Entrar"}
        </button>

        {/* Enlace a registro → debajo del botón Entrar */}
        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <button
            type="button"
            onClick={() => router.push("/registro")}
            className="text-teal-600 hover:underline font-medium"
          >
            Regístrate
          </button>
        </p>
      </form>
    </main>
  );
}