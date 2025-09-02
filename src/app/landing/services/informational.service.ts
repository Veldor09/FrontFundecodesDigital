// SOLO lectura para la landing
import type { InformationalPage } from "@/app/admin/informational-page/types/informational";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export async function getInformationalPagePublic(): Promise<InformationalPage> {
  const res = await fetch(`${API_BASE}/informational-page`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store", // evita contenido stale
  });
  if (!res.ok) throw new Error("Error al cargar la página informativa pública");
  return res.json();
}
