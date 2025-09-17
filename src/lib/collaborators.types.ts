export type CollaboratorEstado = "ACTIVO" | "INACTIVO";
export type CollaboratorRol = "ADMIN" | "COLABORADOR";

export type Collaborator = {
  id: number | string;
  fullName: string;
  email: string;
  phone: string;
  role: CollaboratorRol;
  status?: CollaboratorEstado;
  identification: string;
  birthdate?: string;
  createdAt?: string;
};

export type ListCollaboratorsParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  rol?: CollaboratorRol;
  estado?: CollaboratorEstado;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export interface CreateCollaboratorDto {
  fullName: string;
  email: string;
  identification: string;  // cédula (puedes capturar 9 dígitos)
  birthdate: string;       // YYYY-MM-DD
  phone: string;           // dígitos o E.164 según back
  role: CollaboratorRol;   // "ADMIN" | "COLABORADOR"
  password?: string;       // ⬅️ opcional en el front; el service la genera si falta
}
