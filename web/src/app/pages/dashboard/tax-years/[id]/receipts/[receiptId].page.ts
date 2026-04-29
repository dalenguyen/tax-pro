import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReceiptService } from '../../../../../services/receipt.service';
import { ExpenseService } from '../../../../../services/expense.service';
import { Receipt, LinkedType, ExpenseCategoryType, Currency } from '@cantax-fyi/types';
import {
  ReceiptExtractionReviewComponent,
  ExtractionFormData,
} from '../../../../../components/receipt-extraction-review.component';
import { ConfirmDialogComponent } from '../../../../../components/confirm-dialog.component';

type ReceiptWithUrl = Receipt & { downloadUrl: string };

@Component({
  selector: 'app-receipt-detail',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe, ReceiptExtractionReviewComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-confirm-dialog
      [open]="deleteDialogOpen()"
      title="Delete Receipt"
      message="This will permanently delete this receipt."
      (confirm)="confirmDelete()"
      (cancel)="deleteDialogOpen.set(false)" />
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'receipts']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back to Receipts</a>
          <h1 class="text-2xl font-bold text-gray-900 truncate">{{ receipt()?.fileName || 'Receipt' }}</h1>
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (!receipt()) {
          <p class="text-gray-500">Receipt not found.</p>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Preview -->
            <div class="bg-white rounded-lg shadow p-4">
              <h2 class="text-sm font-semibold text-gray-700 mb-3">Preview</h2>
              @if (isImage()) {
                <img [src]="receipt()!.downloadUrl" [alt]="receipt()!.fileName"
                     class="w-full rounded border border-gray-200 object-contain max-h-96" />
              } @else {
                <div class="flex items-center justify-center h-40 bg-gray-50 rounded border border-gray-200">
                  <a [href]="receipt()!.downloadUrl" target="_blank" rel="noopener noreferrer"
                     class="text-blue-600 hover:text-blue-800 text-sm underline">
                    Open PDF in new tab &#8599;
                  </a>
                </div>
              }
            </div>

            <!-- Info -->
            <div class="flex flex-col gap-4">
              <div class="bg-white rounded-lg shadow p-4">
                <h2 class="text-sm font-semibold text-gray-700 mb-3">Details</h2>
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <dt class="text-gray-500">Status</dt>
                    <dd>
                      @switch (receipt()!.status) {
                        @case ('PENDING') { <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span> }
                        @case ('PROCESSING') { <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Processing</span> }
                        @case ('EXTRACTED') { <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Extracted</span> }
                        @case ('VERIFIED') { <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs">Verified</span> }
                        @case ('FAILED') { <span class="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">Failed</span> }
                      }
                    </dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-500">File type</dt>
                    <dd class="text-gray-900">{{ receipt()!.mimeType }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-500">File size</dt>
                    <dd class="text-gray-900">{{ receipt()!.fileSize | number }} bytes</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-500">Uploaded</dt>
                    <dd class="text-gray-900">{{ receipt()!.createdAt | date:'yyyy-MM-dd HH:mm' }}</dd>
                  </div>
                  @if (receipt()!.linkedType) {
                    <div class="flex justify-between">
                      <dt class="text-gray-500">Linked to</dt>
                      <dd class="text-gray-900">{{ receipt()!.linkedType }} / {{ receipt()!.linkedId }}</dd>
                    </div>
                  }
                </dl>
              </div>

              <!-- Link/Unlink section -->
              <div class="bg-white rounded-lg shadow p-4">
                <h2 class="text-sm font-semibold text-gray-700 mb-3">Link Receipt</h2>
                <div class="space-y-3">
                  <div>
                    <label class="text-xs text-gray-500 block mb-1">Type</label>
                    <select [(ngModel)]="linkedType"
                            class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm">
                      <option value="">None</option>
                      @for (lt of linkedTypes; track lt) {
                        <option [value]="lt">{{ lt }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-500 block mb-1">ID</label>
                    <input type="text" [(ngModel)]="linkedId" placeholder="Entry ID"
                           class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                  </div>
                  <button (click)="saveLink()"
                          class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                    Save Link
                  </button>
                </div>
              </div>

              <!-- Actions -->
              <div class="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
                <h2 class="text-sm font-semibold text-gray-700 mb-1">Actions</h2>
                <button
                  (click)="onExtract()"
                  [disabled]="extracting()"
                  class="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  @if (extracting()) {
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Extracting...
                  } @else {
                    Extract with AI
                  }
                </button>
                <button (click)="onDelete()"
                        class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                  Delete Receipt
                </button>
              </div>
            </div>
          </div>

          <!-- Extraction Review -->
          @if (extractionResult()) {
            <div class="mt-6">
              <app-receipt-extraction-review
                [extractedData]="extractionResult()!"
                (confirmed)="onExtractionConfirmed($event)"
                (createExpense)="onCreateExpense($event)"
              />
            </div>
          }
        }
      </div>
    </div>
  `,
})
export default class ReceiptDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private receiptService = inject(ReceiptService);
  private expenseService = inject(ExpenseService);

  taxYearId = '';
  receiptId = '';
  receipt = signal<ReceiptWithUrl | null>(null);
  loading = signal(true);
  extracting = signal(false);
  deleteDialogOpen = signal(false);
  extractionResult = signal<Record<string, unknown> | null>(null);
  linkedTypes = Object.values(LinkedType);
  linkedType = '';
  linkedId = '';

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.receiptId = this.route.snapshot.params['receiptId'];
    this.loadReceipt();
  }

  isImage() {
    return this.receipt()?.mimeType.startsWith('image/') ?? false;
  }

  private async loadReceipt() {
    this.loading.set(true);
    try {
      const data = await this.receiptService.getReceipt(this.taxYearId, this.receiptId);
      this.receipt.set(data);
      this.linkedType = (data.linkedType as string) ?? '';
      this.linkedId = data.linkedId ?? '';
      // Show extraction result if already extracted
      if (data.extractedRaw && Object.keys(data.extractedRaw).length > 0) {
        this.extractionResult.set(data.extractedRaw as Record<string, unknown>);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async saveLink() {
    await this.receiptService.updateReceipt(this.taxYearId, this.receiptId, {
      linkedType: (this.linkedType as LinkedType) || undefined,
      linkedId: this.linkedId || undefined,
    });
    await this.loadReceipt();
  }

  async onExtract() {
    this.extracting.set(true);
    try {
      const result = await this.receiptService.extractReceipt(this.taxYearId, this.receiptId);
      this.extractionResult.set(result.extracted ?? result.extractedRaw ?? {});
      await this.loadReceipt();
    } catch (err) {
      console.error('Extraction failed:', err);
      alert('Extraction failed. Please try again.');
    } finally {
      this.extracting.set(false);
    }
  }

  async onExtractionConfirmed(form: ExtractionFormData) {
    await this.receiptService.updateReceipt(this.taxYearId, this.receiptId, {
      status: 'VERIFIED' as any,
    });
    await this.loadReceipt();
  }

  async onCreateExpense(form: ExtractionFormData) {
    const expense = await this.expenseService.createEntry(this.taxYearId, {
      category: (form.category as ExpenseCategoryType) || ExpenseCategoryType.OTHER,
      vendor: form.vendor || undefined,
      amount: form.amount ?? 0,
      currency: (form.currency as Currency) || Currency.CAD,
      date: form.date || new Date().toISOString().slice(0, 10),
    });
    // Link receipt to new expense
    await this.receiptService.updateReceipt(this.taxYearId, this.receiptId, {
      linkedType: LinkedType.EXPENSE,
      linkedId: expense.id,
      status: 'VERIFIED' as any,
    });
    await this.loadReceipt();
  }

  onDelete() {
    this.deleteDialogOpen.set(true);
  }

  async confirmDelete() {
    this.deleteDialogOpen.set(false);
    await this.receiptService.deleteReceipt(this.taxYearId, this.receiptId);
    await this.router.navigate(['/dashboard/tax-years', this.taxYearId, 'receipts']);
  }
}
