import { Currency } from '@cantax-fyi/types';

export function convertToCAD(amount: number, exchangeRate: number): number {
  return Math.round(amount * exchangeRate * 100) / 100;
}

export function formatCurrency(amount: number, currency: Currency = Currency.CAD): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function computeAmountCad(
  amount: number,
  currency: Currency,
  exchangeRate?: number
): number {
  if (currency === Currency.CAD) return amount;
  if (!exchangeRate) throw new Error('Exchange rate required for non-CAD currency');
  return convertToCAD(amount, exchangeRate);
}
