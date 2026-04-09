import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpenseCategoryType, Currency } from '@can-tax-pro/types';

export interface ExtractionFormData {
  vendor: string;
  amount: number | null;
  currency: string;
  date: string;
  category: string;
}

@Component({
  selector: 'app-receipt-extraction-review',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow p-4">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">AI Extraction Result</h2>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-500 block mb-1">Vendor</label>
          <input
            type="text"
            [(ngModel)]="form.vendor"
            placeholder="Vendor name"
            class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500 block mb-1">Amount</label>
            <input
              type="number"
              [(ngModel)]="form.amount"
              placeholder="0.00"
              step="0.01"
              class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 block mb-1">Currency</label>
            <select
              [(ngModel)]="form.currency"
              class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            >
              @for (c of currencies; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Date</label>
          <input
            type="date"
            [(ngModel)]="form.date"
            class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label class="text-xs text-gray-500 block mb-1">Category</label>
          <select
            [(ngModel)]="form.category"
            class="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">-- Select category --</option>
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
        <div class="flex gap-2 pt-1">
          <button
            (click)="onConfirm()"
            class="flex-1 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm font-medium"
          >
            Confirm &amp; Verify
          </button>
          <button
            (click)="onCreate()"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
          >
            Create Expense Entry
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ReceiptExtractionReviewComponent implements OnInit {
  @Input() extractedData: Record<string, unknown> = {};
  @Output() confirmed = new EventEmitter<ExtractionFormData>();
  @Output() createExpense = new EventEmitter<ExtractionFormData>();

  categories = Object.values(ExpenseCategoryType);
  currencies = Object.values(Currency);

  form: ExtractionFormData = {
    vendor: '',
    amount: null,
    currency: Currency.CAD,
    date: '',
    category: '',
  };

  ngOnInit() {
    this.form = {
      vendor: (this.extractedData['vendor'] as string) ?? '',
      amount: (this.extractedData['amount'] as number) ?? null,
      currency: (this.extractedData['currency'] as string) ?? Currency.CAD,
      date: (this.extractedData['date'] as string) ?? '',
      category: (this.extractedData['category'] as string) ?? '',
    };
  }

  onConfirm() {
    this.confirmed.emit({ ...this.form });
  }

  onCreate() {
    this.createExpense.emit({ ...this.form });
  }
}
