// src/app/ClientProviders.tsx
"use client";

import { Toaster } from "sonner"; // o el toaster que uses
// importa aquí otros providers client-side si tienes (ThemeProvider, etc.)

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Toaster global */}
      <Toaster position="top-right" />
    </>
  );
}
