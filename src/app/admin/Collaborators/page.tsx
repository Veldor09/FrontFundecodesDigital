export const dynamic = 'force-dynamic';
import CollaboratorsTable from '@/components/Collaborators/CollaboratorsTable';

export default function Page() {
  return (
    <main className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Colaboradores</h1>
      <p className="text-sm text-gray-500">Lista de colaboradores con búsqueda, filtros, orden y paginación.</p>
      <CollaboratorsTable />
    </main>
  );
}
