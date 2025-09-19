"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setErr("Token no encontrado");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Las contraseñas no coinciden");
      setMsg(null);
      return;
    }
    try {
      setErr(null);
      const res = await axios.post("http://localhost:4000/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      if (res.data.ok) {
        setMsg("¡Listo! Tu contraseña fue actualizada. Ya puedes iniciar sesión.");
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Error al restablecer la contraseña");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h3 className="text-lg font-semibold mb-4">Restablecer contraseña</h3>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full mb-2 p-2 border rounded"
          minLength={8}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full mb-4 p-2 border rounded"
          minLength={8}
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Guardar contraseña
        </button>
      </form>
      {err && <p className="text-red-500 mt-2">{err}</p>}
      {msg && <p className="text-green-600 mt-2">{msg}</p>}
    </div>
  );
}
