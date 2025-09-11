'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

// IMPORTS RELATIVOS (sin alias @/)
import RequirePermission from '../components/RequirePermission';
import {
  listUsers,
  type UserItem,
  addRoleByName,
  removeRoleByName,
  assignRoles,
  approveUser,
  verifyUser,
} from '../../../services/users.services';
import { listRoles, type Role } from '../../../services/roles.service';

// --- Helpers locales para leer permisos del JWT ---
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
function getJwtPayload<T = any>(token: string | null): T | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
function hasPermission(perm: string, token: string | null): boolean {
  const payload = getJwtPayload<{ perms?: string[] }>(token);
  return (payload?.perms ?? []).includes(perm);
}

export default function UsersPage() {
  // tabla
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // paginación
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // filtros
  const [search, setSearch] = useState<string>('');
  const [verified, setVerified] = useState<'all' | 'true' | 'false'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // acciones por nombre
  const [roleInputs, setRoleInputs] = useState<Record<number, string>>({});

  // selector por ID (si tiene roles.manage)
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectValues, setSelectValues] = useState<Record<number, number | ''>>({});

  const token = useMemo(() => getToken(), []);
  const canManageRoles = useMemo(() => hasPermission('roles.manage', token), [token]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsers({
        page,
        limit,
        search: search || undefined,
        verified: verified === 'all' ? undefined : verified === 'true',
        role: roleFilter || undefined,
      });
      setItems(res.items);
      setTotal(res.total);

      if (canManageRoles) {
        const roles = await listRoles();
        setAllRoles(roles);
      }
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, verified, roleFilter, canManageRoles]);

  // Quitar rol por nombre
  async function onRemoveRole(userId: number, roleName: string) {
    try {
      await removeRoleByName(userId, roleName);
      toast.success('Rol quitado');
      await load();
    } catch {}
  }

  // Agregar rol por nombre
  async function onAddRoleByName(userId: number) {
    const roleName = (roleInputs[userId] || '').trim();
    if (!roleName) return;
    try {
      await addRoleByName(userId, roleName);
      setRoleInputs((prev) => ({ ...prev, [userId]: '' }));
      toast.success('Rol agregado');
      await load();
    } catch {}
  }

  // Agregar rol por ID (selector)
  async function onAddRoleById(userId: number) {
    const roleId = selectValues[userId];
    if (!roleId || typeof roleId !== 'number') return;
    try {
      await assignRoles(userId, [roleId]);
      setSelectValues((prev) => ({ ...prev, [userId]: '' }));
      toast.success('Rol asignado');
      await load();
    } catch {}
  }

  // Toggle aprobado
  async function onToggleApproved(userId: number, next: boolean) {
    try {
      await approveUser(userId, next);
      toast.success(next ? 'Usuario aprobado' : 'Aprobación removida');
      await load();
    } catch {}
  }

  // Toggle verificado
  async function onToggleVerified(userId: number, next: boolean) {
    try {
      await verifyUser(userId, next);
      toast.success(next ? 'Usuario verificado' : 'Verificación removida');
      await load();
    } catch {}
  }

  function availableRolesFor(user: UserItem): Role[] {
    const assigned = new Set(user.roles?.map((r) => r.role.name) ?? []);
    return allRoles.filter((r) => !assigned.has(r.name));
  }

  // paginación helpers
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  function gotoPrev() { if (canPrev) setPage((p) => p - 1); }
  function gotoNext() { if (canNext) setPage((p) => p + 1); }
  function onChangeLimit(e: React.ChangeEvent<HTMLSelectElement>) {
    setLimit(Number(e.target.value));
    setPage(1);
  }

  // filtros helpers
  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }
  function onChangeVerified(e: React.ChangeEvent<HTMLSelectElement>) {
    setVerified(e.target.value as 'all' | 'true' | 'false');
    setPage(1);
  }
  function onChangeRoleFilter(e: React.ChangeEvent<HTMLSelectElement>) {
    setRoleFilter(e.target.value);
    setPage(1);
  }

  return (
    <RequirePermission require={['users.manage']}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

          {/* FILTROS */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Buscar */}
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por email o nombre…"
                className="border rounded px-3 py-2 text-sm w-64"
              />
              <button
                type="submit"
                className="px-3 py-2 text-sm bg-gray-800 text-white rounded"
                title="Buscar"
              >
                Buscar
              </button>
            </form>

            {/* Verificado */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Verificado:</span>
              <select
                value={verified}
                onChange={onChangeVerified}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Rol */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rol:</span>
              <select
                value={roleFilter}
                onChange={onChangeRoleFilter}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Todos</option>
                {(allRoles.length ? allRoles : [{ id: 0, name: 'admin' }, { id: 1, name: 'editor' }]).map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* PAGINACIÓN */}
        <div className="flex items-center justify-end gap-3 mb-3 text-sm">
          <div className="text-gray-600">
            Total: <span className="font-medium">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={gotoPrev}
              disabled={!canPrev}
              className="px-3 py-1 border rounded disabled:opacity-50"
              title="Anterior"
            >
              ◀
            </button>
            <span>
              Página <strong>{page}</strong> / {totalPages}
            </span>
            <button
              type="button"
              onClick={gotoNext}
              disabled={!canNext}
              className="px-3 py-1 border rounded disabled:opacity-50"
              title="Siguiente"
            >
              ▶
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Mostrar:</span>
            <select
              value={limit}
              onChange={onChangeLimit}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-gray-600">Cargando…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Nombre</th>
                  <th className="p-3 border-b">Aprobado</th>
                  <th className="p-3 border-b">Verificado</th>
                  <th className="p-3 border-b">Roles</th>
                  <th className="p-3 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 align-top">
                    <td className="p-3 border-b">{u.id}</td>
                    <td className="p-3 border-b">{u.email}</td>
                    <td className="p-3 border-b">{u.name ?? '-'}</td>

                    {/* ✅ Toggle Aprobado */}
                    <td className="p-3 border-b">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={u.approved}
                          onChange={(e) => onToggleApproved(u.id, e.target.checked)}
                        />
                        <span className="text-sm">{u.approved ? 'Sí' : 'No'}</span>
                      </label>
                    </td>

                    {/* ✅ Toggle Verificado */}
                    <td className="p-3 border-b">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={u.verified}
                          onChange={(e) => onToggleVerified(u.id, e.target.checked)}
                        />
                        <span className="text-sm">{u.verified ? 'Sí' : 'No'}</span>
                      </label>
                    </td>

                    {/* Roles existentes */}
                    <td className="p-3 border-b">
                      <div className="flex flex-wrap gap-2">
                        {u.roles?.length ? (
                          u.roles.map((rel: { role: { name: string } }) => (
                            <span
                              key={rel.role.name}
                              className="inline-flex items-center gap-2 bg-gray-100 border rounded px-2 py-1"
                            >
                              <span className="text-sm">{rel.role.name}</span>
                              <button
                                type="button"
                                onClick={() => onRemoveRole(u.id, rel.role.name)}
                                className="text-red-600 text-sm hover:underline"
                                title="Quitar rol"
                              >
                                Quitar
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Acciones: agregar rol por nombre y por ID */}
                    <td className="p-3 border-b">
                      {/* Asignar por nombre */}
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="rol a agregar (ej: admin)"
                          className="border rounded px-2 py-1 text-sm"
                          value={roleInputs[u.id] ?? ''}
                          onChange={(e) =>
                            setRoleInputs((prev) => ({ ...prev, [u.id]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => onAddRoleByName(u.id)}
                          className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
                        >
                          Agregar
                        </button>
                      </div>

                      {/* Asignar por ID (si tiene permiso roles.manage) */}
                      {canManageRoles && (
                        <div className="flex gap-2">
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={selectValues[u.id] ?? ''}
                            onChange={(e) =>
                              setSelectValues((prev) => ({
                                ...prev,
                                [u.id]: e.target.value ? Number(e.target.value) : '',
                              }))
                            }
                          >
                            <option value="">Selecciona un rol…</option>
                            {availableRolesFor(u).map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => onAddRoleById(u.id)}
                            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                          >
                            Asignar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="p-3 text-gray-500" colSpan={7}>
                      Sin usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Info de página */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                Mostrando {(items.length ? (page - 1) * limit + 1 : 0)}–
                {(page - 1) * limit + items.length} de {total}
              </span>
              <span>Página {page} de {totalPages}</span>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
