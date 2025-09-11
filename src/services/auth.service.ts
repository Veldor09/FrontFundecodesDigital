import API, { setAuthToken } from './api';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name?: string | null;
    roles?: string[];
    permissions?: string[];
  };
}

export async function login(email: string, password: string) {
  const res = await API.post<LoginResponse>('/auth/login', { email, password });
  const token = res.data.access_token;

  // Guardamos y fijamos el token para futuras peticiones
  setAuthToken(token);

  return res.data.user;
}

export function logout() {
  setAuthToken(undefined);
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
