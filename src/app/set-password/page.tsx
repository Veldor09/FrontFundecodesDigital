"use client";

import { useState } from "react";
import axios from "axios";

export default function SetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = new URLSearchParams(window.location.search).get("token");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setMessage(null);
      return;
    }

    try {
      setError(null);
      const res = await axios.post("http://localhost:4000/auth/set-password", {
        token,
        newPassword,
        confirmPassword,
      });

      if (res.data.ok) {
        setMessage("¡Listo! Tu contraseña fue actualizada. Un administrador debe aprobar tu cuenta.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar la contraseña");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h3 className="text-lg font-semibold mb-4">Establecer contraseña</h3>
      <p className="mb-4">Ingresa tu nueva contraseña dos veces para activar tu cuenta.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Guardar contraseña
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {message && <p className="text-green-600 mt-2">{message}</p>}
    </div>
  );
}
