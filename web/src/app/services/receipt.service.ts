import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Receipt } from '@cantax-fyi/types';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private http = inject(HttpClient);

  receipts = signal<Receipt[]>([]);
  loading = signal(false);

  async loadReceipts(taxYearId: string, status?: string) {
    this.loading.set(true);
    try {
      let url = `/api/receipts?taxYearId=${taxYearId}`;
      if (status) url += `&status=${status}`;
      const data = await firstValueFrom(this.http.get<Receipt[]>(url));
      this.receipts.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async getUploadUrl(taxYearId: string, fileName: string, contentType: string) {
    return firstValueFrom(
      this.http.post<{ uploadUrl: string; storagePath: string }>(
        '/api/receipts/upload-url',
        { fileName, contentType, taxYearId },
      ),
    );
  }

  async registerReceipt(
    taxYearId: string,
    data: { fileName: string; mimeType: string; fileSize: number; storagePath: string },
  ) {
    return firstValueFrom(this.http.post<Receipt>(`/api/receipts?taxYearId=${taxYearId}`, data));
  }

  async getReceipt(taxYearId: string, id: string) {
    return firstValueFrom(
      this.http.get<Receipt & { downloadUrl: string }>(`/api/receipts/${id}?taxYearId=${taxYearId}`),
    );
  }

  async updateReceipt(taxYearId: string, id: string, data: Partial<Receipt>) {
    return firstValueFrom(
      this.http.put<Receipt>(`/api/receipts/${id}?taxYearId=${taxYearId}`, data),
    );
  }

  async deleteReceipt(taxYearId: string, id: string) {
    await firstValueFrom(this.http.delete(`/api/receipts/${id}?taxYearId=${taxYearId}`));
  }

  async extractReceipt(taxYearId: string, id: string) {
    return firstValueFrom(this.http.post<any>(`/api/receipts/${id}/extract?taxYearId=${taxYearId}`, {}));
  }

  async uploadFile(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
  }
}
