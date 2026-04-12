import { Currency, IncomeSourceType } from './enums';

export interface IncomeEntry {
  id: string;
  sourceType: IncomeSourceType;
  description?: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  amountCad?: number;
  date: Date;
  category?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncomeEntryDto {
  sourceType: IncomeSourceType;
  description?: string;
  amount: number;
  currency?: Currency;
  exchangeRate?: number;
  date: string; // ISO date string from client
  category?: string;
  metadata?: Record<string, unknown>;
}

export type UpdateIncomeEntryDto = Partial<CreateIncomeEntryDto>
