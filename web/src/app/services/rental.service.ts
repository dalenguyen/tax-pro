import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RentalProperty, CreateRentalPropertyDto, RentalIncome, CreateRentalIncomeDto, RentalExpense, CreateRentalExpenseDto } from '@cantax-fyi/types';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private http = inject(HttpClient);

  properties = signal<RentalProperty[]>([]);
  loading = signal(false);

  async loadProperties(taxYearId: string) {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<RentalProperty[]>(`/api/rental/properties?taxYearId=${taxYearId}`));
      this.properties.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async getProperty(taxYearId: string, id: string) {
    return firstValueFrom(this.http.get<RentalProperty & { incomes: RentalIncome[]; expenses: RentalExpense[] }>(`/api/rental/properties/${id}?taxYearId=${taxYearId}`));
  }

  async createProperty(taxYearId: string, dto: CreateRentalPropertyDto) {
    return firstValueFrom(this.http.post<RentalProperty>(`/api/rental/properties?taxYearId=${taxYearId}`, dto));
  }

  async updateProperty(taxYearId: string, id: string, dto: Partial<CreateRentalPropertyDto>) {
    return firstValueFrom(this.http.put<RentalProperty>(`/api/rental/properties/${id}?taxYearId=${taxYearId}`, dto));
  }

  async deleteProperty(taxYearId: string, id: string) {
    await firstValueFrom(this.http.delete(`/api/rental/properties/${id}?taxYearId=${taxYearId}`));
  }

  // Rental Income
  async addIncome(taxYearId: string, propertyId: string, dto: CreateRentalIncomeDto) {
    return firstValueFrom(this.http.post<RentalIncome>(`/api/rental/income?taxYearId=${taxYearId}&propertyId=${propertyId}`, dto));
  }

  async updateIncome(taxYearId: string, propertyId: string, id: string, dto: Partial<CreateRentalIncomeDto>) {
    return firstValueFrom(this.http.put<RentalIncome>(`/api/rental/income/${id}?taxYearId=${taxYearId}&propertyId=${propertyId}`, dto));
  }

  async deleteIncome(taxYearId: string, propertyId: string, id: string) {
    await firstValueFrom(this.http.delete(`/api/rental/income/${id}?taxYearId=${taxYearId}&propertyId=${propertyId}`));
  }

  // Rental Expenses
  async addExpense(taxYearId: string, propertyId: string, dto: CreateRentalExpenseDto) {
    return firstValueFrom(this.http.post<RentalExpense>(`/api/rental/expenses?taxYearId=${taxYearId}&propertyId=${propertyId}`, dto));
  }

  async updateExpense(taxYearId: string, propertyId: string, id: string, dto: Partial<CreateRentalExpenseDto>) {
    return firstValueFrom(this.http.put<RentalExpense>(`/api/rental/expenses/${id}?taxYearId=${taxYearId}&propertyId=${propertyId}`, dto));
  }

  async deleteExpense(taxYearId: string, propertyId: string, id: string) {
    await firstValueFrom(this.http.delete(`/api/rental/expenses/${id}?taxYearId=${taxYearId}&propertyId=${propertyId}`));
  }
}
