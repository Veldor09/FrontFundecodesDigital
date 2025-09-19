export type Estado = "ACTIVO" | "INACTIVO";

export interface Voluntario {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  email: string;
  telefono?: string | null;
  fechaNacimiento?: string | null; // ISO (yyyy-mm-dd) opcional
  fechaIngreso?: string | null;    // ISO (yyyy-mm-dd) opcional
  estado: Estado;
}

export type VoluntarioCreateDTO = {
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  email: string;
  telefono?: string | null;
  fechaNacimiento?: string | null;
  /** En el back es opcional; si no viene, Prisma usa default(now()) */
  fechaIngreso?: string | null;
  /** Opcional al crear (default ACTIVO en BD) */
  estado?: Estado;
};

export type VoluntarioUpdateDTO = Partial<VoluntarioCreateDTO>;
