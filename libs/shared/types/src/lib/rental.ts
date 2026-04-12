import { RentalExpenseCategory } from './enums';

export interface RentalProperty {
  id: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRentalPropertyDto {
  address: string;
}

export interface UpdateRentalPropertyDto {
  address?: string;
}

export interface RentalIncome {
  id: string;
  description?: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRentalIncomeDto {
  description?: string;
  amount: number;
  date: string;
}

export type UpdateRentalIncomeDto = Partial<CreateRentalIncomeDto>

export interface RentalExpense {
  id: string;
  category: RentalExpenseCategory;
  description?: string;
  amount: number;
  date: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRentalExpenseDto {
  category: RentalExpenseCategory;
  description?: string;
  amount: number;
  date: string;
  metadata?: Record<string, unknown>;
}

export type UpdateRentalExpenseDto = Partial<CreateRentalExpenseDto>
