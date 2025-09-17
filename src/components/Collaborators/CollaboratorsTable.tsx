'use client';
import { useEffect, useMemo, useState } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { Collaborator, CollaboratorEstado, CollaboratorRol } from '@/lib/collaborators.types';
import { listCollaborators } from '@/services/collaborators.service';
import AddCollaboratorModal from './AddCollaboratorModal';

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
  const [openAdd, setOpenAdd] = useState(false);

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
      {/* Barra superior con botón */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-end gap-2">
          {/* ...tus filtros existentes... */}
        </div>
        <button onClick={() => setOpenAdd(true)} className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">
          + Añadir colaborador
        </button>
      </div>

      <DataTable columns={columns} data={items} loading={loading} defaultSortKey="fullName" />
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <AddCollaboratorModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => { setPage(1); load(); }}
      />
    </div>
  );
}
