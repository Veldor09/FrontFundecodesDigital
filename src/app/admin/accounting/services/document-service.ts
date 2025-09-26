import type { Document } from "../types"

// Mock data for documents
const mockDocumentData: Document[] = [
  {
    id: "1",
    nombre: "Factura_Enero_2024.pdf",
    programa: "Educación",
    mes: "Enero",
    año: 2024,
    tipo: "PDF",
    tamaño: 245760,
    url: "/documents/factura_enero_2024.pdf",
    fechaSubida: new Date("2024-01-15"),
  },
]

export class DocumentService {
  static async getDocuments(filters?: any): Promise<Document[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredData = [...mockDocumentData]

    if (filters?.programa) {
      filteredData = filteredData.filter((item) => item.programa.toLowerCase().includes(filters.programa.toLowerCase()))
    }

    if (filters?.mes) {
      filteredData = filteredData.filter((item) => item.mes === filters.mes)
    }

    return filteredData
  }

  static async uploadDocument(
    file: File,
    metadata: Omit<Document, "id" | "url" | "fechaSubida" | "tamaño" | "tipo">,
  ): Promise<Document> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newDocument: Document = {
      ...metadata,
      id: Date.now().toString(),
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size,
      url: `/documents/${file.name}`,
      fechaSubida: new Date(),
    }

    mockDocumentData.push(newDocument)
    return newDocument
  }
}
