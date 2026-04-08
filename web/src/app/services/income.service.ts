import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IncomeEntry, CreateIncomeEntryDto } from '@can-tax-pro/types';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private http = inject(HttpClient);

  entries = signal<IncomeEntry[]>([]);
  loading = signal(false);

  async loadEntries(taxYearId: string, sourceType?: string) {
    this.loading.set(true);
    try {
      let url = `/api/income?taxYearId=${taxYearId}`;
      if (sourceType) url += `&sourceType=${sourceType}`;
      const data = await firstValueFrom(this.http.get<IncomeEntry[]>(url));
      this.entries.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async createEntry(taxYearId: string, dto: CreateIncomeEntryDto) {
    return firstValueFrom(this.http.post<IncomeEntry>(`/api/income?taxYearId=${taxYearId}`, dto));
  }

  async updateEntry(taxYearId: string, id: string, dto: Partial<CreateIncomeEntryDto>) {
    return firstValueFrom(this.http.put<IncomeEntry>(`/api/income/${id}?taxYearId=${taxYearId}`, dto));
  }

  async deleteEntry(taxYearId: string, id: string) {
    await firstValueFrom(this.http.delete(`/api/income/${id}?taxYearId=${taxYearId}`));
  }

  async importEntries(taxYearId: string, entries: CreateIncomeEntryDto[]) {
    return firstValueFrom(
      this.http.post<{ imported: number }>(`/api/income/import?taxYearId=${taxYearId}`, { entries })
    );
  }
}
