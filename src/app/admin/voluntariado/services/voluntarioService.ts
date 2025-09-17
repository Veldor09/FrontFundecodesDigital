import { Voluntario } from "../types/voluntario";

let voluntarios: Voluntario[] = [
  {
    id: "1",
    nombre: "María González",
    cedula: "12345678",
    email: "maria@email.com",
    telefono: "5550123",
    area: "Educación Ambiental",
    estado: "activo",
  },
  {
    id: "2",
    nombre: "Carlos Rodríguez",
    cedula: "87654321",
    email: "carlos@email.com",
    telefono: "5550456",
    area: "Conservación Marina",
    estado: "inactivo",
  },
];

let nextId = 3;

export async function getVoluntarios(page = 1, search = ""): Promise<{
  data: Voluntario[];
  total: number;
}> {
  const filtered = voluntarios.filter(
    (v) =>
      v.nombre.toLowerCase().includes(search.toLowerCase()) ||
      v.cedula.includes(search) ||
      v.email.toLowerCase().includes(search.toLowerCase())
  );
  const start = (page - 1) * 10;
  return {
    data: filtered.slice(start, start + 10),
    total: filtered.length,
  };
}

export async function saveVoluntario(
  data: Omit<Voluntario, "id"> & { id?: string }
): Promise<void> {
  if (data.id) {
    const index = voluntarios.findIndex((v) => v.id === data.id);
    if (index !== -1) voluntarios[index] = data as Voluntario;
  } else {
    voluntarios.push({ ...data, id: String(nextId++) });
  }
}

export async function toggleEstado(id: string): Promise<void> {
  const v = voluntarios.find((v) => v.id === id);
  if (v) v.estado = v.estado === "activo" ? "inactivo" : "activo";
}

export async function deleteVoluntario(id: string): Promise<void> {
  voluntarios = voluntarios.filter((v) => v.id !== id);
}