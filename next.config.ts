import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirecciones de listas
  async redirects() {
    return [
      { source: "/proyectos", destination: "/landing/projects", permanent: false },
      { source: "/landing/proyectos", destination: "/landing/projects", permanent: false },
      { source: "/admin/proyectos", destination: "/admin/projects", permanent: false },
    ];
  },

  // Rewrites para detalle (slug) en español -> detalle real
  async rewrites() {
    return [
      { source: "/proyectos/:slug", destination: "/landing/projects/:slug" },
      { source: "/landing/proyectos/:slug", destination: "/landing/projects/:slug" },
    ];
  },
};

export default nextConfig;
