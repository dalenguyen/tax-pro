import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReceiptService } from '../../../../services/receipt.service';
import { Receipt, LinkedType } from '@can-tax-pro/types';

type ReceiptWithUrl = Receipt & { downloadUrl: string };

@Component({
  selector: 'app-receipt-detail',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/tax-years', taxYearId, 'receipts']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back to Receipts</a>
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
                  class="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm opacity-60 cursor-not-allowed"
                  disabled
                  title="Coming in issue #10">
                  Extract with AI (coming soon)
                </button>
                <button (click)="onDelete()"
                        class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                  Delete Receipt
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export default class ReceiptDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private receiptService = inject(ReceiptService);

  taxYearId = '';
  receiptId = '';
  receipt = signal<ReceiptWithUrl | null>(null);
  loading = signal(true);
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

  async onDelete() {
    if (confirm('Delete this receipt?')) {
      await this.receiptService.deleteReceipt(this.taxYearId, this.receiptId);
      await this.router.navigate(['/tax-years', this.taxYearId, 'receipts']);
    }
  }
}
