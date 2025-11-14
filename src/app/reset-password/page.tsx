// src/app/reset-password/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token');
    setToken(t ? decodeURIComponent(t).trim() : null);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!token) {
      setErr('Token no encontrado');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setErr('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setLoading(true);
      // ✅ Usa el rewrite: /api-auth -> <BACK>/api/auth
      const res = await axios.post('/api-auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });

      if (res.data?.ok) {
        setMsg('¡Listo! Tu contraseña fue actualizada. Redirigiendo al login…');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setErr(res.data?.message || 'No se pudo restablecer la contraseña');
      }
    } catch (e: any) {
      const m =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Error al restablecer la contraseña';
      setErr(Array.isArray(m) ? m.join(', ') : m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h3 className="text-lg font-semibold mb-4">Restablecer contraseña</h3>

      {!token && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Token inválido o ausente. Abre el enlace que te enviamos por correo.
        </div>
      )}

      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full mb-2 p-2 border rounded"
          minLength={8}
          autoComplete="new-password"
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full mb-4 p-2 border rounded"
          minLength={8}
          autoComplete="new-password"
        />
        <button
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={!token || loading}
        >
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>

      {err && <p className="text-red-500 mt-2">{err}</p>}
      {msg && <p className="text-green-600 mt-2">{msg}</p>}
    </div>
  );
}
