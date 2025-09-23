// src/services/auth.service.ts
import API, { setAuthToken } from "./api";

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name?: string | null;
    roles?: string[];
    // el backend suele devolver 'perms', lo normalizamos a 'permissions'
    perms?: string[];
    permissions?: string[];
    approved?: boolean;
    verified?: boolean;
  };
}

export type User = LoginResponse["user"];

/**
 * Inicia sesión y guarda el token para siguientes peticiones.
 */
export async function login(email: string, password: string): Promise<User> {
  try {
    const res = await API.post<LoginResponse>("/auth/login", { email, password });
    const token = res.data?.access_token;

    if (!token) {
      throw new Error("Respuesta inválida del servidor (sin token).");
    }

    // Guarda el token (debería actualizar axios.defaults y localStorage)
    setAuthToken(token);
    // Por si tu setAuthToken no persiste, aseguramos:
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }

    // Normaliza permisos
    const user = res.data.user ?? ({} as User);
    const permissions = user.permissions ?? user.perms ?? [];
    return { ...user, permissions };
  } catch (err: any) {
    // Intenta extraer mensaje legible desde el backend
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "No se pudo iniciar sesión";
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
}

/**
 * Solicita recuperación de contraseña.
 * - Si tu backend devuelve 400 cuando el correo no existe, este método lanzará ese error.
 * - Si tu backend devuelve siempre { ok: true }, simplemente resuelve sin error.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  try {
    const { data } = await API.post<{ ok: true }>("/auth/forgot-password", { email });
    return data ?? { ok: true };
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "No se pudo procesar la solicitud.";
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
}

/**
 * Establece la contraseña con el token de invitación.
 */
export async function setPassword(
  token: string,
  newPassword: string,
  confirmPassword?: string
): Promise<{ ok: true }> {
  try {
    const payload: any = { token, newPassword };
    if (confirmPassword) payload.confirmPassword = confirmPassword;

    const { data } = await API.post<{ ok: true }>("/auth/set-password", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data ?? { ok: true };
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "No se pudo establecer la contraseña.";
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
}

/**
 * Cierra sesión: limpia el token.
 */
export function logout() {
  setAuthToken(undefined);
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

/**
 * Obtiene el token guardado (si existe).
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Reaplica el token guardado (útil al montar la app/SPA).
 * Llama esto en el layout raíz o en un _app para mantener sesión tras recarga.
 */
export function ensureAuthFromStorage() {
  const t = getStoredToken();
  if (t) setAuthToken(t);
}
