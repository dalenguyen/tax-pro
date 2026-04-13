import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReceiptService } from '../../../../../services/receipt.service';
import { ReceiptStatus } from '@can-tax-pro/types';

@Component({
  selector: 'app-receipts-list',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId]" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Receipts</h1>
        </div>

        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Filter by status:</label>
            <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange($event)"
                    class="border border-gray-300 rounded px-3 py-1.5 text-sm">
              <option value="">All</option>
              @for (s of statuses; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>
          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'receipts', 'upload']"
             class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Upload Receipt
          </a>
        </div>

        @if (receiptService.loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (receiptService.receipts().length === 0) {
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <p class="text-gray-500 mb-4">No receipts yet.</p>
            <a [routerLink]="['/dashboard/tax-years', taxYearId, 'receipts', 'upload']"
               class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Upload your first receipt
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (receipt of receiptService.receipts(); track receipt.id) {
              <div class="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ receipt.fileName }}</p>
                  @switch (receipt.status) {
                    @case ('PENDING') { <span class="shrink-0 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span> }
                    @case ('PROCESSING') { <span class="shrink-0 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Processing</span> }
                    @case ('EXTRACTED') { <span class="shrink-0 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Extracted</span> }
                    @case ('VERIFIED') { <span class="shrink-0 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">Verified</span> }
                    @case ('FAILED') { <span class="shrink-0 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Failed</span> }
                  }
                </div>
                <div class="text-xs text-gray-500">
                  <p>{{ receipt.mimeType }}</p>
                  <p>{{ receipt.fileSize | number }} bytes</p>
                  <p>{{ receipt.createdAt | date:'yyyy-MM-dd' }}</p>
                </div>
                <div class="flex gap-2 mt-auto">
                  <a [routerLink]="['/dashboard/tax-years', taxYearId, 'receipts', receipt.id]"
                     class="flex-1 text-center text-blue-600 hover:text-blue-800 text-sm border border-blue-200 rounded py-1">
                    View
                  </a>
                  <button (click)="onDelete(receipt.id)"
                          class="text-red-600 hover:text-red-800 text-sm border border-red-200 rounded px-3 py-1">
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export default class ReceiptsListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  receiptService = inject(ReceiptService);

  taxYearId = '';
  selectedStatus = '';
  statuses = Object.values(ReceiptStatus);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.receiptService.loadReceipts(this.taxYearId);
  }

  onFilterChange(status: string) {
    this.receiptService.loadReceipts(this.taxYearId, status || undefined);
  }

  async onDelete(id: string) {
    if (confirm('Delete this receipt?')) {
      await this.receiptService.deleteReceipt(this.taxYearId, id);
      await this.receiptService.loadReceipts(this.taxYearId, this.selectedStatus || undefined);
    }
  }
}
