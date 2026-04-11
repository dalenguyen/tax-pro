export interface MonthlyTotal {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
}

interface DatedEntry {
  date?: string;
  amount?: number;
  amountCad?: number;
}

function monthKey(date: string | undefined): string | null {
  if (!date) return null;
  const match = /^(\d{4}-\d{2})/.exec(date);
  return match ? match[1] : null;
}

function amountOf(entry: DatedEntry): number {
  return entry.amountCad ?? entry.amount ?? 0;
}

/**
 * Aggregates income and expense entries into monthly totals for use in
 * trend charts. Months with only income or only expenses still appear
 * (the missing side is 0). Result is sorted ascending by month.
 */
export function aggregateMonthlyTotals(
  incomeEntries: DatedEntry[],
  expenseEntries: DatedEntry[]
): MonthlyTotal[] {
  const byMonth = new Map<string, MonthlyTotal>();

  const ensure = (month: string): MonthlyTotal => {
    let row = byMonth.get(month);
    if (!row) {
      row = { month, income: 0, expenses: 0 };
      byMonth.set(month, row);
    }
    return row;
  };

  for (const entry of incomeEntries) {
    const key = monthKey(entry.date);
    if (!key) continue;
    ensure(key).income += amountOf(entry);
  }

  for (const entry of expenseEntries) {
    const key = monthKey(entry.date);
    if (!key) continue;
    ensure(key).expenses += amountOf(entry);
  }

  return Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
}
