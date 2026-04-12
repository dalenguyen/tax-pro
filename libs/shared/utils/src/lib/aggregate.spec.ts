import { aggregateMonthlyTotals } from './aggregate';

describe('aggregateMonthlyTotals', () => {
  it('returns empty array when no entries', () => {
    expect(aggregateMonthlyTotals([], [])).toEqual([]);
  });

  it('groups income and expenses by YYYY-MM', () => {
    const income = [
      { date: '2025-01-15', amount: 1000 },
      { date: '2025-01-20', amount: 500 },
      { date: '2025-03-01', amount: 2000 },
    ];
    const expenses = [
      { date: '2025-01-05', amount: 100 },
      { date: '2025-02-10', amount: 250 },
    ];
    expect(aggregateMonthlyTotals(income, expenses)).toEqual([
      { month: '2025-01', income: 1500, expenses: 100 },
      { month: '2025-02', income: 0, expenses: 250 },
      { month: '2025-03', income: 2000, expenses: 0 },
    ]);
  });

  it('prefers amountCad when present', () => {
    const income = [{ date: '2025-02-01', amount: 100, amountCad: 136 }];
    expect(aggregateMonthlyTotals(income, [])).toEqual([
      { month: '2025-02', income: 136, expenses: 0 },
    ]);
  });

  it('skips entries without a usable date', () => {
    const income = [
      { date: '', amount: 10 },
      { amount: 20 },
      { date: '2025-04-01', amount: 30 },
    ];
    expect(aggregateMonthlyTotals(income as never[], [])).toEqual([
      { month: '2025-04', income: 30, expenses: 0 },
    ]);
  });
});
