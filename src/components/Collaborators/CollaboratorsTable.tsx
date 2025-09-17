'use client';
import { useEffect, useMemo, useState } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { Collaborator, CollaboratorEstado, CollaboratorRol } from '@/lib/collaborators.types';
import { listCollaborators } from '@/services/collaborators.service';

const ROLES: CollaboratorRol[] = ['ADMIN', 'COLABORADOR'];
const ESTADOS: CollaboratorEstado[] = ['ACTIVO', 'INACTIVO'];

export default function CollaboratorsTable() {
  const [items, setItems] = useState<Collaborator[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState('');
  const [rol, setRol] = useState<CollaboratorRol | ''>('');
  const [estado, setEstado] = useState<CollaboratorEstado | ''>('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await listCollaborators({
        page, pageSize,
        q,
        rol: rol || undefined,
        estado: estado || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, pageSize, q, rol, estado]);

  const columns: Column<Collaborator>[] = useMemo(() => [
    { key: 'fullName', header: 'Nombre completo', sortable: true },
    { key: 'email', header: 'Correo', sortable: true },
    { key: 'phone', header: 'Teléfono', sortable: true },
    { key: 'role', header: 'Rol/Área', sortable: true },
    { key: 'identification', header: 'Cédula', sortable: true },
    { key: 'birthdate', header: 'Nacimiento', sortable: true, render: (r) => r.birthdate ? new Date(r.birthdate).toLocaleDateString() : '—' },
  ], []);

  return (
    <div className="space-y-3">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs mb-1">Búsqueda</label>
          <input
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            placeholder="Nombre, correo, cédula…"
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Rol</label>
          <select className="rounded border px-2 py-2 min-w-[160px]" value={rol} onChange={(e) => { setPage(1); setRol(e.target.value as CollaboratorRol | ''); }}>
            <option value="">Todos</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Estado</label>
          <select className="rounded border px-2 py-2 min-w-[160px]" value={estado} onChange={(e) => { setPage(1); setEstado(e.target.value as CollaboratorEstado | ''); }}>
            <option value="">Todos</option>
            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Tamaño de página</label>
          <select className="rounded border px-2 py-2" value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}>
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla con orden en cliente */}
      <DataTable columns={columns} data={items} loading={loading} defaultSortKey="fullName" />

      {/* Paginación */}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
    </div>
  );
}
