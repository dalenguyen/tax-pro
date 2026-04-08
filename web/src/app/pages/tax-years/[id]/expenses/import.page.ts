import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ExpenseService } from '../../../../services/expense.service';
import { ExpenseCategoryType, Currency, CreateExpenseEntryDto } from '@can-tax-pro/types';

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  valid: boolean;
}

@Component({
  selector: 'app-expense-import',
  imports: [RouterLink, FormsModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/tax-years', taxYearId, 'expenses']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Import Expenses CSV</h1>
        </div>

        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select [(ngModel)]="category" name="category"
                    class="border border-gray-300 rounded px-3 py-2 text-sm w-48">
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              CSV Data (date, description, amount)
            </label>
            <p class="text-xs text-gray-500 mb-2">Format: YYYY-MM-DD, Description, Amount</p>
            <textarea [(ngModel)]="csvText" name="csvText" rows="10"
                      (ngModelChange)="parseCsv()"
                      class="border border-gray-300 rounded px-3 py-2 text-sm w-full font-mono"
                      placeholder="2024-01-15, Google Cloud, 25.00&#10;2024-02-01, Namecheap renewal, 12.98"></textarea>
          </div>

          <button (click)="parseCsv()"
                  class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm mb-2">
            Preview
          </button>
        </div>

        @if (parsedRows().length > 0) {
          <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="font-semibold">Preview ({{ validRows().length }} valid rows)</h2>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (row of parsedRows(); track $index) {
                  <tr [class]="row.valid ? 'hover:bg-gray-50' : 'bg-red-50'">
                    <td class="px-4 py-3 text-sm">{{ row.date }}</td>
                    <td class="px-4 py-3 text-sm">{{ row.description }}</td>
                    <td class="px-4 py-3 text-sm text-right font-mono">{{ row.amount | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm">
                      @if (row.valid) {
                        <span class="text-green-600">Valid</span>
                      } @else {
                        <span class="text-red-600">Invalid</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <button (click)="onImport()"
                  class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm"
                  [disabled]="submitting() || validRows().length === 0">
            {{ submitting() ? 'Importing...' : 'Import ' + validRows().length + ' entries' }}
          </button>
        }
      </div>
    </div>
  `,
})
export default class ExpenseImportComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expenseService = inject(ExpenseService);

  taxYearId = '';
  category = ExpenseCategoryType.OTHER;
  csvText = '';
  parsedRows = signal<ParsedRow[]>([]);
  submitting = signal(false);

  validRows = computed(() => this.parsedRows().filter(r => r.valid));
  categories = Object.values(ExpenseCategoryType);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
  }

  parseCsv() {
    const lines = this.csvText.trim().split('\n').filter(l => l.trim());
    const rows: ParsedRow[] = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 3) return { date: '', description: '', amount: 0, valid: false };

      const [date, description, amountStr] = parts;
      const amount = parseFloat(amountStr);
      const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(date);
      const valid = dateValid && !isNaN(amount) && amount > 0;

      return { date, description, amount: isNaN(amount) ? 0 : amount, valid };
    });
    this.parsedRows.set(rows);
  }

  async onImport() {
    this.submitting.set(true);
    try {
      const entries: CreateExpenseEntryDto[] = this.validRows().map(row => ({
        category: this.category,
        description: row.description || undefined,
        amount: row.amount,
        currency: Currency.CAD,
        date: row.date,
      }));
      await this.expenseService.importEntries(this.taxYearId, entries);
      this.router.navigate(['/tax-years', this.taxYearId, 'expenses']);
    } finally {
      this.submitting.set(false);
    }
  }
}
