"use client";

import { BookOpen } from "lucide-react";

export default function ManualButton() {
  return (
    <button
      onClick={() => window.open("/manuales/manual-externo.pdf", "_blank")}
      title="Manual de usuario"
      aria-label="Abrir manual de usuario"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-colors"
    >
      <BookOpen className="h-6 w-6" />
    </button>
  );
}
