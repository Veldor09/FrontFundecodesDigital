import { ListCollaboratorsParams, Paginated, Collaborator } from '@/lib/collaborators.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Si el @Controller no es 'collaborators', ajusta este segmento:
const BASE = '/collaborators';

function toQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  });
  return q.toString();
}

export async function listCollaborators(
  params: ListCollaboratorsParams = {}
): Promise<Paginated<Collaborator>> {
  const qs = toQuery({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    q: params.q,
    rol: params.rol,
    estado: params.estado,
  });

  const res = await fetch(`${API_URL}${BASE}?${qs}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(typeof window !== 'undefined' && localStorage.getItem('token')
        ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
        : {}),
    },
    credentials: 'include', // quítalo si no usan cookies
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${BASE} ${res.status}: ${text}`);
  }

  const data = await res.json();

  // Soporta { items, total, page, pageSize } o { data, total, page, pageSize }
  const items = Array.isArray(data?.items) ? data.items : (data?.data ?? []);
  return {
    items,
    total: Number(data?.total ?? 0),
    page: Number(data?.page ?? 1),
    pageSize: Number(data?.pageSize ?? (params.pageSize ?? 10)),
  };
}
