// next.config.ts
import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Todo lo de /api -> backend con prefijo /api
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
      // Auth separado, también con prefijo /api
      {
        source: "/api-auth/:path*",
        destination: `${API_URL}/api/auth/:path*`,
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
  reactStrictMode: true,
};

export default nextConfig;
