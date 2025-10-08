export type Currency = 'CRC' | 'USD';

export interface Program {
  id: string;
  name: string;
}

export type RequestStatus = 'pending' | 'validated' | 'approved' | 'rejected';
export type RequestAction = RequestStatus | 'returned';

export interface RequestHistoryEntry {
  at: string;   // ISO date
  by: string;   // userId o rol ("accountant", "director", etc.)
  action: RequestAction;
  note?: string;
}

export interface PurchaseRequest {
  id: string;
  amount: number;        // monto solicitado/aprobado
  concept: string;
  programId: string;
  comentarioContadora?: string;  
  comentarioDirector?: string;   
  draftInvoiceUrl?: string;
  status: RequestStatus;
  createdBy: string;     // <-- útil para "mis solicitudes"
  history: RequestHistoryEntry[]; // <-- faltaba
}

/* Factura final */
export interface FinalInvoiceInput {
  requestId: string;
  number: string;
  date: string;           // ISO yyyy-mm-dd
  total: number;
  currency: Currency;
  file?: File | null;
}

export interface FinalInvoice {
  id: string;
  requestId: string;
  number: string;
  date: string;
  total: number;
  currency: Currency;
  url?: string;
  isValid: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
}
