import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReceiptService } from '../../../../../services/receipt.service';

interface UploadItem {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

@Component({
  selector: 'app-receipt-upload',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'receipts']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back to Receipts</a>
          <h1 class="text-3xl font-bold text-gray-900">Upload Receipts</h1>
        </div>

        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <!-- Drag and drop zone -->
          <div
            class="border-2 border-dashed rounded-lg p-10 text-center transition-colors"
            [class]="isDragging() ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave()"
            (drop)="onDrop($event)"
          >
            <div class="text-4xl mb-3">&#128247;</div>
            <p class="text-gray-600 mb-2">Drag and drop files here</p>
            <p class="text-gray-400 text-sm mb-4">Supports images (JPEG, PNG, HEIC) and PDF</p>
            <label class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Choose Files
              <input
                type="file"
                class="hidden"
                accept="image/*,application/pdf"
                multiple
                (change)="onFileSelected($event)"
              />
            </label>
          </div>
        </div>

        @if (queue().length > 0) {
          <div class="bg-white rounded-lg shadow p-6 mb-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Files ({{ queue().length }})</h2>
              @if (!uploading()) {
                <button (click)="uploadAll()"
                        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                  Upload All
                </button>
              }
            </div>
            <ul class="divide-y divide-gray-100">
              @for (item of queue(); track item.file.name) {
                <li class="py-3 flex items-center gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.file.name }}</p>
                    <p class="text-xs text-gray-500">{{ item.file.type }} &mdash; {{ item.file.size | number }} bytes</p>
                  </div>
                  @switch (item.status) {
                    @case ('pending') { <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Pending</span> }
                    @case ('uploading') { <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Uploading...</span> }
                    @case ('done') { <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Done</span> }
                    @case ('error') { <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs" [title]="item.error">Failed</span> }
                  }
                </li>
              }
            </ul>
          </div>

          @if (allDone()) {
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <p class="text-green-800 text-sm font-medium">All files uploaded successfully!</p>
              <div class="flex gap-2">
                <button (click)="resetQueue()" class="text-sm text-green-700 underline hover:no-underline">Upload more</button>
                <a [routerLink]="['/dashboard/tax-years', taxYearId, 'receipts']"
                   class="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm">
                  View Receipts
                </a>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export default class ReceiptUploadComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private receiptService = inject(ReceiptService);

  taxYearId = '';
  queue = signal<UploadItem[]>([]);
  isDragging = signal(false);
  uploading = signal(false);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
  }

  allDone() {
    const q = this.queue();
    return q.length > 0 && q.every((i) => i.status === 'done' || i.status === 'error');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.addFiles(files);
    input.value = '';
  }

  private addFiles(files: File[]) {
    const accepted = files.filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf',
    );
    const items: UploadItem[] = accepted.map((f) => ({ file: f, status: 'pending' }));
    this.queue.update((q) => [...q, ...items]);
  }

  async uploadAll() {
    if (this.uploading()) return;
    this.uploading.set(true);

    const q = this.queue();
    for (let i = 0; i < q.length; i++) {
      if (q[i].status !== 'pending') continue;

      this.queue.update((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'uploading' } : item)),
      );

      try {
        const file = q[i].file;
        const { uploadUrl, storagePath } = await this.receiptService.getUploadUrl(
          this.taxYearId,
          file.name,
          file.type,
        );
        await this.receiptService.uploadFile(uploadUrl, file);
        await this.receiptService.registerReceipt(this.taxYearId, {
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          storagePath,
        });

        this.queue.update((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'done' } : item)),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        this.queue.update((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error', error: msg } : item,
          ),
        );
      }
    }

    this.uploading.set(false);
  }

  resetQueue() {
    this.queue.set([]);
  }
}
