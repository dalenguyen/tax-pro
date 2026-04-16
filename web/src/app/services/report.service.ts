import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TaxSummary } from '@cantax-fyi/types';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  async getSummary(taxYearId: string) {
    return firstValueFrom(this.http.get<TaxSummary>(`/api/reports/summary?taxYearId=${taxYearId}`));
  }

  async getIncomeStatement(taxYearId: string) {
    return firstValueFrom(this.http.get<any>(`/api/reports/income-statement?taxYearId=${taxYearId}`));
  }

  async getExpenseBreakdown(taxYearId: string) {
    return firstValueFrom(this.http.get<any>(`/api/reports/expense-breakdown?taxYearId=${taxYearId}`));
  }

  async getRentalStatement(taxYearId: string) {
    return firstValueFrom(this.http.get<any>(`/api/reports/rental-statement?taxYearId=${taxYearId}`));
  }

  async getInvestmentSummary(taxYearId: string) {
    return firstValueFrom(this.http.get<any>(`/api/reports/investment-summary?taxYearId=${taxYearId}`));
  }

  async getT2125(taxYearId: string) {
    return firstValueFrom(this.http.get<any>(`/api/reports/t2125?taxYearId=${taxYearId}`));
  }

  async getMonthlyTrend(taxYearId: string) {
    return firstValueFrom(
      this.http.get<{ months: { month: string; income: number; expenses: number }[] }>(
        `/api/reports/monthly-trend?taxYearId=${taxYearId}`
      )
    );
  }
}
