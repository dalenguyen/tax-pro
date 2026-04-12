import { estimateFederalTax } from './tax';

describe('estimateFederalTax', () => {
  it('returns 0 for non-positive taxable income', () => {
    expect(estimateFederalTax(0)).toBe(0);
    expect(estimateFederalTax(-100)).toBe(0);
  });

  it('applies 15% in the first bracket', () => {
    // $40,000 * 15% = $6,000
    expect(estimateFederalTax(40000)).toBeCloseTo(6000, 2);
  });

  it('applies 20.5% in the second bracket', () => {
    // first bracket 55,867 * 15% = 8,380.05
    // remainder (80,000 - 55,867) = 24,133 * 20.5% = 4,947.265
    // total = 13,327.315
    expect(estimateFederalTax(80000)).toBeCloseTo(13327.32, 1);
  });

  it('applies top bracket', () => {
    // 300,000 taxable income
    // 55,867 * 15%            = 8,380.05
    // (111,733-55,867)*20.5%  = 55,866 * 20.5% = 11,452.53
    // (173,205-111,733)*26%   = 61,472 * 26%   = 15,982.72
    // (246,752-173,205)*29%   = 73,547 * 29%   = 21,328.63
    // (300,000-246,752)*33%   = 53,248 * 33%   = 17,571.84
    // total                                    = 74,715.77
    expect(estimateFederalTax(300000)).toBeCloseTo(74715.77, 1);
  });
});
