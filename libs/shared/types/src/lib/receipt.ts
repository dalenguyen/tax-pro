import { Currency, LinkedType, ReceiptStatus } from './enums';

export interface Receipt {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  status: ReceiptStatus;
  extractedVendor?: string;
  extractedAmount?: number;
  extractedCurrency?: Currency;
  extractedDate?: Date;
  extractedCategory?: string;
  extractedRaw?: Record<string, unknown>;
  linkedType?: LinkedType;
  linkedId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReceiptDto {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
}

export interface UpdateReceiptDto {
  status?: ReceiptStatus;
  linkedType?: LinkedType;
  linkedId?: string;
}

export interface ReceiptExtractionResult {
  vendor?: string;
  amount?: number;
  currency?: Currency;
  date?: string;
  category?: string;
  lineItems?: Array<{ description: string; amount: number }>;
  taxAmount?: number;
  subtotal?: number;
  raw: Record<string, unknown>;
}
