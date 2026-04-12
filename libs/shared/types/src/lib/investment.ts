import { Currency, InvestmentAccountType } from './enums';

export interface InvestmentContribution {
  id: string;
  accountType: InvestmentAccountType;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  amountCad?: number;
  institution?: string;
  date: Date;
  roomRemaining?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvestmentDto {
  accountType: InvestmentAccountType;
  amount: number;
  currency?: Currency;
  exchangeRate?: number;
  institution?: string;
  date: string;
  roomRemaining?: number;
  notes?: string;
}

export type UpdateInvestmentDto = Partial<CreateInvestmentDto>
