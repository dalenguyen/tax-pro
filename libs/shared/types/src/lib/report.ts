export interface TaxSummary {
  taxYear: number;
  totalBusinessIncome: number;
  totalBusinessExpenses: number;
  netBusinessIncome: number;
  totalRentalIncome: number;
  totalRentalExpenses: number;
  netRentalIncome: number;
  rrspContributions: number;
  tfsaContributions: number;
  totalIncome: number;
  totalDeductions: number;
}

export interface IncomeBySource {
  sourceType: string;
  total: number;
  count: number;
}

export interface ExpenseByCategory {
  category: string;
  total: number;
  count: number;
}
