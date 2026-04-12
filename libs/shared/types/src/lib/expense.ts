import { Currency, ExpenseCategoryType } from './enums';

export interface ExpenseEntry {
  id: string;
  category: ExpenseCategoryType;
  vendor?: string;
  description?: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  amountCad?: number;
  date: Date;
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseEntryDto {
  category: ExpenseCategoryType;
  vendor?: string;
  description?: string;
  amount: number;
  currency?: Currency;
  exchangeRate?: number;
  date: string;
  paymentMethod?: string;
  metadata?: Record<string, unknown>;
}

export type UpdateExpenseEntryDto = Partial<CreateExpenseEntryDto>
