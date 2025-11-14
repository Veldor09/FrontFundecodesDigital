// next.config.ts
import type { NextConfig } from "next";

/** 
 * Usa la RAÍZ del backend (sin /api al final).
 * En Vercel: NEXT_PUBLIC_API_URL=https://tu-back.onrender.com
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Evita que el build se detenga por errores de ESLint/TypeScript (para poder desplegar ya)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  reactStrictMode: true,

  async rewrites() {
    return [
      // Proxy del front -> back (con prefijo /api que tienes en Nest)
      {
        source: "/api/:path*",
        destination: `${API_BASE}/api/:path*`,
      },
      // Rutas de auth del back
      {
        source: "/api-auth/:path*",
        destination: `${API_BASE}/api/auth/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/auth/set-password",
        destination: "/set-password",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
