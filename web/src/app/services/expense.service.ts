import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ExpenseEntry, CreateExpenseEntryDto } from '@can-tax-pro/types';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);

  entries = signal<ExpenseEntry[]>([]);
  loading = signal(false);

  async loadEntries(taxYearId: string, category?: string) {
    this.loading.set(true);
    try {
      let url = `/api/expenses?taxYearId=${taxYearId}`;
      if (category) url += `&category=${category}`;
      const data = await firstValueFrom(this.http.get<ExpenseEntry[]>(url));
      this.entries.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async createEntry(taxYearId: string, dto: CreateExpenseEntryDto) {
    return firstValueFrom(this.http.post<ExpenseEntry>(`/api/expenses?taxYearId=${taxYearId}`, dto));
  }

  async updateEntry(taxYearId: string, id: string, dto: Partial<CreateExpenseEntryDto>) {
    return firstValueFrom(this.http.put<ExpenseEntry>(`/api/expenses/${id}?taxYearId=${taxYearId}`, dto));
  }

  async deleteEntry(taxYearId: string, id: string) {
    await firstValueFrom(this.http.delete(`/api/expenses/${id}?taxYearId=${taxYearId}`));
  }

  async importEntries(taxYearId: string, entries: CreateExpenseEntryDto[]) {
    return firstValueFrom(
      this.http.post<{ imported: number }>(`/api/expenses/import?taxYearId=${taxYearId}`, { entries })
    );
  }
}
