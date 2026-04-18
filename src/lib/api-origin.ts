const FALLBACK_API_ORIGIN = "http://localhost:4000";

export function resolveApiOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    FALLBACK_API_ORIGIN;

  const trimmed = raw.replace(/\/+$/, "");
  if (!trimmed) return FALLBACK_API_ORIGIN;

  // Permite configurar NEXT_PUBLIC_API_URL con o sin sufijo /api
  return trimmed.replace(/\/api$/i, "");
}
