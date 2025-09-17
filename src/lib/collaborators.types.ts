export type CollaboratorRol = 'ADMIN' | 'COLABORADOR';
export type CollaboratorEstado = 'ACTIVO' | 'INACTIVO';

export type Collaborator = {
  id: number | string;
  fullName: string;
  email: string;
  phone: string;
  role: CollaboratorRol;        // mapea al campo que devuelva el back
  status?: CollaboratorEstado;  // idem
  area?: string;
  identification: string;       // cédula
  birthdate?: string;           // ISO
  createdAt?: string;
};

export type ListCollaboratorsParams = {
  page?: number;
  pageSize?: number;
  q?: string; // búsqueda general
  rol?: CollaboratorRol;
  estado?: CollaboratorEstado;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
