// src/app/set-password/page.tsx
'use client';

import { Suspense, useMemo, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';

const MIN_LEN = 8;
const MAX_LEN = 100;

function SetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawToken = searchParams.get('token') ?? '';
  const token = decodeURIComponent(rawToken).trim();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError('Token inválido o ausente. Usa el enlace del correo.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
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
        { headers: { 'Content-Type': 'application/json' } }
      );

      const ok = !!res.data?.ok;
      if (ok) {
        setMessage('¡Listo! Tu contraseña fue actualizada. Redirigiendo al login…');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(res.data?.message || 'No se pudo actualizar la contraseña.');
      }
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Error al guardar la contraseña.';
      setError(Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center text-teal-700">Establecer contraseña</h1>

        {!token && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Token inválido o ausente. Por favor abre el enlace que te enviamos por correo.
          </div>
        )}

        <p className="text-sm text-slate-600">Ingresa tu nueva contraseña dos veces para activar tu cuenta.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={MIN_LEN}
              maxLength={MAX_LEN}
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="mt-1 text-xs text-slate-500">Entre {MIN_LEN} y {MAX_LEN} caracteres.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={MIN_LEN}
              maxLength={MAX_LEN}
              required
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`w-full rounded-lg py-2 text-white font-semibold transition-colors ${
              !canSubmit || loading
                ? 'bg-teal-300 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {message && <p className="text-sm text-emerald-600 text-center">{message}</p>}
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetPasswordInner />
    </Suspense>
  );
}