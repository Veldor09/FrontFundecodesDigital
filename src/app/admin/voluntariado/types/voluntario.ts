// types/voluntario.ts

export interface Voluntario {
  id: number; // Prisma: Int autoincrement
  tipoDocumento: string;     // "Cédula costarricense" | "Pasaporte" | "DIMEX"
  numeroDocumento: string;   // único
  nombreCompleto: string;
  email: string;             // único
  telefono?: string | null;
  fechaNacimiento?: string | null; // ISO
  fechaIngreso: string;            // ISO
  estado: "ACTIVO" | "INACTIVO";
  createdAt?: string;
  updatedAt?: string;
}
