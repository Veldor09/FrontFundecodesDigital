import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirecciones de listas (lo que ya tenías)
  async redirects() {
    return [
      { source: "/proyectos", destination: "/landing/projects", permanent: false },
      { source: "/landing/proyectos", destination: "/landing/projects", permanent: false },
      { source: "/admin/proyectos", destination: "/admin/projects", permanent: false },
    ];
  },

  // Rewrites para detalle por slug (lo que ya tenías)
  async rewrites() {
    return [
      { source: "/proyectos/:slug", destination: "/landing/projects/:slug" },
      { source: "/landing/proyectos/:slug", destination: "/landing/projects/:slug" },

      // 👇 NUEVO: proxy de API al backend en :4000
      { source: "/api/:path*", destination: "http://localhost:4000/:path*" },
    ];
  },
};

export default nextConfig;
