import axios from 'axios';
import toast from 'react-hot-toast';

// Normaliza que el baseURL termine con /api
function normalizeBaseUrl(url: string) {
  const u = url.replace(/\/+$/, '');
  return u.endsWith('/api') ? u : `${u}/api`;
}

const API = axios.create({
  baseURL: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'),
  withCredentials: false, // usamos Authorization header, no cookies
});

// Helper para setear/quitar token
export function setAuthToken(token?: string) {
  if (token) {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
  }
}

// Adjunta token si existe (por si cambia en runtime)
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Manejo de errores + redirección a pantalla estándar
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const status = error?.response?.status as number | undefined;
    const data = error?.response?.data;
    const serverMsg =
      data?.message || data?.error || error?.message || 'Error inesperado en la API';

    // Toasters
    if (data?.error === 'ACCOUNT_NOT_APPROVED') {
      toast.error(
        data.message || 'Su cuenta no ha sido aprobada aún'
      );
    } else if (Array.isArray(data?.message)) {
      toast.error(data.message.join(', '));
    } else if (serverMsg) {
      toast.error(serverMsg);
    }

    // Redirección si 401/403 (evita loop en /auth/login)
    const reqUrl: string = error?.config?.url ?? '';
    const isLoginCall = /\/auth\/login\b/.test(reqUrl);
    if ((status === 401 || status === 403) && !isLoginCall) {
      // opcional: limpiar token
      // setAuthToken(undefined);
      window.location.href = '/error/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default API;
