import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InvestmentContribution, CreateInvestmentDto, InvestmentAccountType } from '@cantax-fyi/types';

@Injectable({ providedIn: 'root' })
export class InvestmentService {
  private http = inject(HttpClient);

  contributions = signal<InvestmentContribution[]>([]);
  loading = signal(false);

  async loadContributions(taxYearId: string, accountType?: InvestmentAccountType) {
    this.loading.set(true);
    try {
      let url = `/api/investments?taxYearId=${taxYearId}`;
      if (accountType) url += `&accountType=${accountType}`;
      const data = await firstValueFrom(this.http.get<InvestmentContribution[]>(url));
      this.contributions.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async getContribution(taxYearId: string, id: string) {
    return firstValueFrom(this.http.get<InvestmentContribution>(`/api/investments/${id}?taxYearId=${taxYearId}`));
  }

  async createContribution(taxYearId: string, dto: CreateInvestmentDto) {
    return firstValueFrom(this.http.post<InvestmentContribution>(`/api/investments?taxYearId=${taxYearId}`, dto));
  }

  async updateContribution(taxYearId: string, id: string, dto: Partial<CreateInvestmentDto>) {
    return firstValueFrom(this.http.put<InvestmentContribution>(`/api/investments/${id}?taxYearId=${taxYearId}`, dto));
  }

  async deleteContribution(taxYearId: string, id: string) {
    await firstValueFrom(this.http.delete(`/api/investments/${id}?taxYearId=${taxYearId}`));
  }
}
