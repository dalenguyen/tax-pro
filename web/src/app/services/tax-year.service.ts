import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TaxYear, CreateTaxYearDto } from '@cantax-fyi/types';

@Injectable({ providedIn: 'root' })
export class TaxYearService {
  private http = inject(HttpClient);

  taxYears = signal<TaxYear[]>([]);
  loading = signal(false);

  async loadTaxYears() {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<TaxYear[]>('/api/tax-years'));
      this.taxYears.set(data || []);
    } finally {
      this.loading.set(false);
    }
  }

  async createTaxYear(dto: CreateTaxYearDto) {
    const result = await firstValueFrom(this.http.post<TaxYear>('/api/tax-years', dto));
    await this.loadTaxYears();
    return result;
  }

  async getTaxYear(id: string) {
    return firstValueFrom(this.http.get<TaxYear>(`/api/tax-years/${id}`));
  }

  async deleteTaxYear(id: string) {
    await firstValueFrom(this.http.delete(`/api/tax-years/${id}`));
    await this.loadTaxYears();
  }
}
