import { z } from 'zod';
import {
  Currency,
  ExpenseCategoryType,
  IncomeSourceType,
  InvestmentAccountType,
  LinkedType,
  RentalExpenseCategory,
} from '@can-tax-pro/types';

export const createTaxYearSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  notes: z.string().optional(),
});

export const createIncomeEntrySchema = z.object({
  sourceType: z.nativeEnum(IncomeSourceType),
  description: z.string().optional(),
  amount: z.number().positive(),
  currency: z.nativeEnum(Currency).default(Currency.CAD),
  exchangeRate: z.number().positive().optional(),
  date: z.string().date(),
  category: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createExpenseEntrySchema = z.object({
  category: z.nativeEnum(ExpenseCategoryType),
  vendor: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().positive(),
  currency: z.nativeEnum(Currency).default(Currency.CAD),
  exchangeRate: z.number().positive().optional(),
  date: z.string().date(),
  paymentMethod: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createRentalPropertySchema = z.object({
  address: z.string().min(1),
});

export const createRentalIncomeSchema = z.object({
  description: z.string().optional(),
  amount: z.number().positive(),
  date: z.string().date(),
});

export const createRentalExpenseSchema = z.object({
  category: z.nativeEnum(RentalExpenseCategory),
  description: z.string().optional(),
  amount: z.number().positive(),
  date: z.string().date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createInvestmentSchema = z.object({
  accountType: z.nativeEnum(InvestmentAccountType),
  amount: z.number().positive(),
  currency: z.nativeEnum(Currency).default(Currency.CAD),
  exchangeRate: z.number().positive().optional(),
  institution: z.string().optional(),
  date: z.string().date(),
  roomRemaining: z.number().optional(),
  notes: z.string().optional(),
});

export const createReceiptSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  storagePath: z.string().min(1),
});

export const updateReceiptSchema = z.object({
  linkedType: z.nativeEnum(LinkedType).optional(),
  linkedId: z.string().optional(),
});
