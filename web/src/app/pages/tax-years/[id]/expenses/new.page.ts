import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../../services/expense.service';
import { ExpenseCategoryType, Currency } from '@can-tax-pro/types';

@Component({
  selector: 'app-expense-new',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/tax-years', taxYearId, 'expenses']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Add Expense</h1>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select [(ngModel)]="category" name="category" required
                      class="border border-gray-300 rounded px-3 py-2 text-sm w-full">
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input type="text" [(ngModel)]="vendor" name="vendor"
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                     placeholder="Optional vendor name..." />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" [(ngModel)]="description" name="description"
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                     placeholder="Optional description..." />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" [(ngModel)]="amount" name="amount" required min="0" step="0.01"
                       class="border border-gray-300 rounded px-3 py-2 text-sm w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select [(ngModel)]="currency" name="currency"
                        class="border border-gray-300 rounded px-3 py-2 text-sm w-full">
                  @for (c of currencies; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
            </div>

            @if (currency === 'USD') {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Exchange Rate (USD to CAD)</label>
                <input type="number" [(ngModel)]="exchangeRate" name="exchangeRate" min="0" step="0.0001"
                       class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                       placeholder="e.g. 1.35" />
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" [(ngModel)]="date" name="date" required
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-full" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <input type="text" [(ngModel)]="paymentMethod" name="paymentMethod"
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                     placeholder="e.g. Credit Card, Interac..." />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="submit"
                      class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm"
                      [disabled]="submitting()">
                {{ submitting() ? 'Saving...' : 'Save' }}
              </button>
              <a [routerLink]="['/tax-years', taxYearId, 'expenses']"
                 class="bg-gray-100 text-gray-700 px-6 py-2 rounded hover:bg-gray-200 text-sm">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export default class ExpenseNewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expenseService = inject(ExpenseService);

  taxYearId = '';
  category = ExpenseCategoryType.OTHER;
  vendor = '';
  description = '';
  amount = 0;
  currency = Currency.CAD;
  exchangeRate: number | null = null;
  date = new Date().toISOString().split('T')[0];
  paymentMethod = '';
  submitting = signal(false);

  categories = Object.values(ExpenseCategoryType);
  currencies = Object.values(Currency);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
  }

  async onSubmit() {
    this.submitting.set(true);
    try {
      await this.expenseService.createEntry(this.taxYearId, {
        category: this.category,
        vendor: this.vendor || undefined,
        description: this.description || undefined,
        amount: this.amount,
        currency: this.currency,
        exchangeRate: this.exchangeRate ?? undefined,
        date: this.date,
        paymentMethod: this.paymentMethod || undefined,
      });
      this.router.navigate(['/tax-years', this.taxYearId, 'expenses']);
    } finally {
      this.submitting.set(false);
    }
  }
}
