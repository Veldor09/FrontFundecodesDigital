import { solicitud } from "../types/solicitudes";


const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const RESOURCE = `${API}/solicitudes`;

/** GET*/
export async function fetchSolicitud(id: string): Promise<solicitud> {
  const res = await fetch(`${RESOURCE}/${id}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /solicitudes/${id} ${res.status}: ${text}`);
  }
  return res.json();
}

/** POST  */
export async function createSolicitud(payload: solicitud): Promise<solicitud> {
  const now = new Date().toISOString();
  const body: solicitud = {
    ...payload,
    status: payload.status || "pendiente",
  };

  const res = await fetch(RESOURCE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /solicitudes ${res.status}: ${text}`);
  }

  return res.json();
}
