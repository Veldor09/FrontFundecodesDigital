"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth.service";
import toast from "react-hot-toast";
import axios from "axios";

/* ========== Modal Recuperar contraseña ========== */

function RecoverPasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const EMAIL_RE = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const canSubmit = useMemo(() => EMAIL_RE.test(email.trim()), [EMAIL_RE, email]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg(null);
    setErrMsg(null);

    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setErrMsg("Ingresa un correo válido.");
      return;
    }

    setSubmitting(true);
    try {
      // rewrite: /api-auth -> http://localhost:4000/auth
      const res = await axios.post(
        "/api-auth/forgot-password",
        { email: clean },
        { headers: { "Content-Type": "application/json" } },
      );
      if (res.status >= 200 && res.status < 300) {
        setOkMsg(
          "Correo enviado con éxito. Revisa tu bandeja de entrada."
        );
      } else {
        setErrMsg(res.data?.message || "No se pudo procesar la solicitud.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al procesar la solicitud.";
      setErrMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recuperar contraseña</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Ingresa tu correo electrónico. Si existe una cuenta asociada, te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Correo electrónico</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              className="w-full rounded border p-2"
              placeholder="tu@correo.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className={`w-full rounded p-2 text-white ${
              !canSubmit || submitting
                ? "bg-emerald-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {submitting ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>

        {okMsg && <p className="mt-3 text-sm text-emerald-600">{okMsg}</p>}
        {errMsg && <p className="mt-3 text-sm text-red-600">{errMsg}</p>}

        <div className="mt-4 text-right">
          <button onClick={onClose} className="text-sm text-slate-500 hover:underline">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Página de Login ========== */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false); // ← nuevo
  const [errores, setErrores] = useState<{ email?: string; password?: string; general?: string }>({});
  const [cargando, setCargando] = useState(false);
  const [showRecover, setShowRecover] = useState(false);

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});
    setCargando(true);

    const nuevosErrores: typeof errores = {};
    if (!validarEmail(email)) nuevosErrores.email = "Correo inválido";
    if (password.length < 8) nuevosErrores.password = "Mínimo 8 caracteres";

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setCargando(false);
      return;
    }

    try {
      const user = await login(email, password);
      if (user) {
        toast.success(`Bienvenido, ${user.email}`);
        router.push("/admin");
      }
    } catch {
      setErrores({ general: "No se pudo iniciar sesión" });
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
            autoComplete="email"
          />
          {errores.email && <p className="text-xs text-red-600 mt-1">{errores.email}</p>}
        </div>

        {/* Contraseña con toggle de visibilidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div className="relative">
            <input
              type={mostrarPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pr-11 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errores.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500"
              }`}
              placeholder="Mínimo 8 caracteres"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setMostrarPass((v) => !v)}
              aria-pressed={mostrarPass}
              aria-label={mostrarPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={mostrarPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {/* Icono simple en SVG para no agregar dependencias */}
              {mostrarPass ? (
                // ojo abierto
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.206.07.438 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                // ojo tachado
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.32 16.168 7.258 18.678 11.898 18.678c2.005 0 3.885-.472 5.52-1.307M9.878 9.879a3 3 0 104.243 4.243M6.1 6.1l11.8 11.8" />
                </svg>
              )}
            </button>
          </div>
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


        {/* Olvidaste tu contraseña */}
        <p className="text-center text-sm text-gray-600">
          <button
            type="button"
            onClick={() => setShowRecover(true)}
            className="text-teal-600 hover:underline font-medium"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </p>


      </form>

      <RecoverPasswordModal open={showRecover} onClose={() => setShowRecover(false)} />
    </main>
  );
}
