// 2024 Canadian federal tax brackets (CRA).
// Used as a rough estimate — does not account for provincial tax,
// credits (basic personal amount, etc.), CPP/EI, or other adjustments.
const FEDERAL_BRACKETS_2024: Array<{ upTo: number; rate: number }> = [
  { upTo: 55867, rate: 0.15 },
  { upTo: 111733, rate: 0.205 },
  { upTo: 173205, rate: 0.26 },
  { upTo: 246752, rate: 0.29 },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.33 },
];

/**
 * Estimate federal income tax owed on a given taxable income using
 * the 2024 CRA brackets. Returns 0 for non-positive income. This is a
 * rough planning figure and NOT a substitute for a filed return.
 */
export function estimateFederalTax(taxableIncome: number): number {
  if (!Number.isFinite(taxableIncome) || taxableIncome <= 0) return 0;

  let remaining = taxableIncome;
  let previousCap = 0;
  let tax = 0;

  for (const bracket of FEDERAL_BRACKETS_2024) {
    const bandWidth = bracket.upTo - previousCap;
    const taxedInBand = Math.min(remaining, bandWidth);
    tax += taxedInBand * bracket.rate;
    remaining -= taxedInBand;
    previousCap = bracket.upTo;
    if (remaining <= 0) break;
  }

  return Math.round(tax * 100) / 100;
}
