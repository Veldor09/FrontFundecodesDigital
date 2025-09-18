import API from "@/services/api";
import type {
  Collaborator,
  CreateCollaboratorDto,
  ListCollaboratorsParams,
  Paginated,
} from "@/app/admin/Collaborators/types/collaborators.types";

const BASE = "/collaborators";

/* ---------- utilidades ---------- */
function mapItem(x: any): Collaborator {
  return {
    id: x.id,
    fullName: x.fullName ?? x.nombreCompleto ?? x.nombre_completo,
    email: x.email ?? x.correo,
    phone: x.phone ?? x.telefono ?? "",
    role: (x.role ?? x.rol),
    status: (x.status ?? x.estado),
    identification: x.identification ?? x.cedula,
    birthdate: x.birthdate ?? x.fechaNacimiento ?? x.fecha_nacimiento,
    createdAt: x.createdAt ?? x.created_at,
  } as Collaborator;
}

function cleanParams(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}

function formatCedulaForBackend(raw: string): string {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length === 9)  return `${d[0]}-${d.slice(1, 5)}-${d.slice(5)}`;     // #-####-####
  if (d.length === 10) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`; // ##-####-####
  return raw; // si viene ya con guiones o no calza, lo dejamos igual
}


function genTempPassword(len = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%&*?";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

/* ---------- list ---------- */
export async function listCollaborators(
  params: ListCollaboratorsParams = {}
): Promise<Paginated<Collaborator>> {
  const { data } = await API.get(BASE, { params: cleanParams(params) });
  const itemsRaw = data.items ?? data.data ?? data.results ?? [];
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(mapItem) : [];
  return {
    items,
    total: data.total ?? data.count ?? items.length,
    page: data.page ?? params.page ?? 1,
    pageSize: data.pageSize ?? params.pageSize ?? items.length,
  };
}

/* ---------- get one ---------- */
export async function getCollaborator(id: number | string): Promise<Collaborator> {
  const { data } = await API.get(`${BASE}/${id}`);
  return mapItem(data);
}

/* ---------- create ---------- */
export async function createCollaborator(input: CreateCollaboratorDto): Promise<Collaborator> {
  // password: si no viene desde el UI, generamos una válida (8–100)
  const password = (input.password && String(input.password).trim().length >= 8)
    ? String(input.password).trim()
    : genTempPassword(12);

  // cédula: si son 9 dígitos, la formateamos a X-XXXX-XXXX (lo que suele requerir el back de CR)
  const cedulaFmt = formatCedulaForBackend(input.identification);

  const payload = {
    // claves que tu backend valida (español)
    nombreCompleto: input.fullName.trim(),
    correo: input.email.trim(),
    cedula: cedulaFmt,
    fechaNacimiento: input.birthdate,        // "YYYY-MM-DD"
    telefono: input.phone,                   // dígitos o E.164
    rol: input.role,                         // "ADMIN" | "COLABORADOR"
    password,                                // ⬅️ requerido por el back
  };

  try {
    const { data } = await API.post(BASE, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return mapItem(data);
  } catch (err: any) {
    const msg =
      err?.response?.data?.errors?.join?.(" • ") ??
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Request failed";
    throw new Error(msg);
  }
}

/* ---------- update ---------- */
export async function updateCollaborator(
  id: number | string,
  input: Partial<CreateCollaboratorDto>
): Promise<Collaborator> {
  const { data } = await API.patch(`${BASE}/${id}`, input);
  return mapItem(data);
}

/* ---------- toggle status ---------- */
export async function toggleCollaboratorStatus(id: number | string): Promise<void> {
  await API.patch(`${BASE}/${id}/toggle-status`);
}

/* ---------- delete ---------- */
export async function deleteCollaborator(id: number | string): Promise<void> {
  await API.delete(`${BASE}/${id}`);
}