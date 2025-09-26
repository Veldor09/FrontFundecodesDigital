"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

const MIN_LEN = 8;
const MAX_LEN = 100;

export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawToken = searchParams.get("token") ?? "";
  const token = decodeURIComponent(rawToken).trim();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Usamos el rewrite /api-auth -> http://localhost:4000/auth
  const requestUrl = `/api-auth/set-password`;

  const canSubmit = useMemo(() => {
    if (!token) return false;
    if (!newPassword || !confirmPassword) return false;
    if (newPassword !== confirmPassword) return false;
    if (newPassword.length < MIN_LEN || newPassword.length > MAX_LEN) return false;
    return true;
  }, [token, newPassword, confirmPassword]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Token inválido o ausente. Usa el enlace del correo.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < MIN_LEN || newPassword.length > MAX_LEN) {
      setError(`La contraseña debe tener entre ${MIN_LEN} y ${MAX_LEN} caracteres.`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        requestUrl,
        { token, newPassword, confirmPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      const ok = !!res.data?.ok;
      if (ok) {
        setMessage("¡Listo! Tu contraseña fue actualizada. Redirigiendo a la página principal...");
        setNewPassword("");
        setConfirmPassword("");
       
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(res.data?.message || "No se pudo actualizar la contraseña.");
      }
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al guardar la contraseña.";
      setError(Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h3 className="text-lg font-semibold mb-4">Establecer contraseña</h3>

      {!token && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Token inválido o ausente. Por favor abre el enlace que te enviamos por correo.
        </div>
      )}

      <p className="mb-4">Ingresa tu nueva contraseña dos veces para activar tu cuenta.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={MIN_LEN}
            maxLength={MAX_LEN}
            required
            className="w-full p-2 border rounded"
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-slate-500">
            Debe tener entre {MIN_LEN} y {MAX_LEN} caracteres.
          </p>
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={MIN_LEN}
            maxLength={MAX_LEN}
            required
            className="w-full p-2 border rounded"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className={`w-full p-2 rounded text-white ${
            !canSubmit || loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-3">{error}</p>}
      {message && <p className="text-green-600 mt-3">{message}</p>}
    </div>
  );
}
