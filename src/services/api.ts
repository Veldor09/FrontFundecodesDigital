import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
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

// Adjunta token si existe
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
    const path = error?.response?.data?.path as string | undefined;

    // Toaster con mensaje estándar
    if (data?.error === 'ACCOUNT_NOT_APPROVED') {
      toast.error(data.message || 'Su cuenta no ha sido aprobada aún');
    } else if (data?.message) {
      toast.error(Array.isArray(data.message) ? data.message.join(', ') : data.message);
    } else if (status) {
      if (status === 401) toast.error('No autorizado');
      else if (status === 403) toast.error('Acceso denegado');
      else toast.error('Error inesperado en la API');
    }

    // Redirección a pantalla estándar solo si es 401/403 y NO estamos en login
    const isAuthLogin = typeof path === 'string' ? path.includes('/auth/login') : false;
    if ((status === 401 || status === 403) && !isAuthLogin) {
      // limpiar token si el server dice 401/403 (opcional)
      // setAuthToken(undefined);
      window.location.href = '/error/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default API;
