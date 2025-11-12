// src/services/api.ts
import axios from 'axios';
import toast from 'react-hot-toast';

// Normaliza que el baseURL termine con /api (sin repetir slashes)
function normalizeBaseUrl(url: string) {
  const u = url.replace(/\/+$/, '');
  return u.endsWith('/api') ? u : `${u}/api`;
}

const API = axios.create({
  baseURL: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'),
  withCredentials: false,
  timeout: 20000,
  headers: { Accept: 'application/json' },
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

// Interceptor REQUEST: adjunta token + evita doble /api
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const base = (config.baseURL || '').replace(/\/+$/, '');
  let url = config.url || '';

  if (base.endsWith('/api')) {
    if (/^\/?api\//i.test(url)) url = url.replace(/^\/?api\//i, '/');
    else if (/^\/?api$/i.test(url)) url = '/';
  }

  url = url.replace(/([^:]\/)\/+/g, '$1'); // normaliza slashes
  config.url = url;
  return config;
});

// Interceptor RESPONSE: toasts + redirect 401/403
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const status = error?.response?.status as number | undefined;
    const data = error?.response?.data;
    const serverMsg =
      data?.message || data?.error || error?.message || 'Error inesperado en la API';

    if (data?.error === 'ACCOUNT_NOT_APPROVED') {
      toast.error(data.message || 'Su cuenta no ha sido aprobada aún');
    } else if (Array.isArray(data?.message)) {
      toast.error(data.message.join(', '));
    } else if (serverMsg) {
      toast.error(serverMsg);
    }

    const reqUrl: string = error?.config?.url ?? '';
    const isLoginCall = /\/auth\/login\b/.test(reqUrl);
    if ((status === 401 || status === 403) && !isLoginCall) {
      // setAuthToken(undefined); // opcional
      window.location.href = '/error/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default API;
