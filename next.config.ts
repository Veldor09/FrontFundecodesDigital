// next.config.ts
import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy general → todo lo que empiece con /api pasa al backend Nest
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`,
      },
      // Proxy específico para auth (mantiene /api-auth separado)
      {
        source: "/api-auth/:path*",
        destination: `${API_URL}/auth/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      // Si alguien abre un link viejo /auth/set-password en el frontend,
      // lo mandamos a la nueva página pública /set-password
      {
        source: "/auth/set-password",
        destination: "/set-password",
        permanent: false,
      },
    ];
  },
  // Puedes habilitar strict mode de React si lo deseas
  reactStrictMode: true,
};

export default nextConfig;
