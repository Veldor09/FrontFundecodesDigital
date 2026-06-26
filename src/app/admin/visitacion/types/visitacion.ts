export interface Visitacion {
  id: number;
  fecha: string;
  totalPersonas: number;
  nacionales: number;
  extranjeros: number;
  /** Distribución de extranjeros por país: { "Costa Rica": 3, "Nicaragua": 2 } */
  paisesExtranjeros?: Record<string, number> | null;
  notas?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisitacionCreateInput {
  fecha: string;
  totalPersonas: number;
  nacionales: number;
  /** Distribución de extranjeros por país */
  paisesExtranjeros?: Record<string, number> | null;
  notas?: string;
}

export type VisitacionUpdateInput = Partial<VisitacionCreateInput>;

export interface VisitacionListResponse {
  data: Visitacion[];
  total: number;
}
