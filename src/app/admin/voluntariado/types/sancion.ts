// types/sancion.ts

export interface Sancion {
  id: number;
  voluntarioId: number;
  tipo: string; // "Amonestación", "Suspensión temporal", "Expulsión", etc.
  motivo: string;
  descripcion?: string;
  fechaInicio: string; // ISO string
  fechaVencimiento?: string | null; // ISO string, null si es permanente
  estado: "ACTIVA" | "EXPIRADA" | "REVOCADA";
  creadaPor?: string; // quien creó la sanción
  revocadaPor?: string | null; // quien la revocó (si aplica)
  fechaRevocacion?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Relación con voluntario
  voluntario?: {
    id: number;
    nombreCompleto: string;
    numeroDocumento: string;
    email: string;
  };
}

export type SancionEstado = "ACTIVA" | "EXPIRADA" | "REVOCADA";

export interface SancionCreateDTO {
  voluntarioId: number;
  tipo: string;
  motivo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaVencimiento?: string | null;
  creadaPor?: string;
}

export interface SancionUpdateDTO extends SancionCreateDTO {
  id: number;
}