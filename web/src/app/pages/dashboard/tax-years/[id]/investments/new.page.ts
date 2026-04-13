import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvestmentService } from '../../../../../services/investment.service';
import { InvestmentAccountType, Currency } from '@can-tax-pro/types';

@Component({
  selector: 'app-investments-new',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'investments']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Add Contribution</h1>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                <select [(ngModel)]="accountType" name="accountType" required
                        class="border border-gray-300 rounded px-3 py-2 text-sm w-full">
                  @for (t of accountTypes; track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" [(ngModel)]="date" name="date" required
                       class="border border-gray-300 rounded px-3 py-2 text-sm w-full" />
              </div>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <input type="text" [(ngModel)]="institution" name="institution"
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                     placeholder="e.g. TD Bank, Wealthsimple" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Room Remaining</label>
              <input type="number" [(ngModel)]="roomRemaining" name="roomRemaining" min="0" step="0.01"
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                     placeholder="Optional" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea [(ngModel)]="notes" name="notes" rows="2"
                        class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                        placeholder="Optional notes..."></textarea>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="submit"
                      class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm"
                      [disabled]="submitting()">
                {{ submitting() ? 'Saving...' : 'Save' }}
              </button>
              <a [routerLink]="['/dashboard/tax-years', taxYearId, 'investments']"
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
export default class InvestmentsNewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private investmentService = inject(InvestmentService);

  taxYearId = '';
  accountType = InvestmentAccountType.RRSP;
  amount = 0;
  currency = Currency.CAD;
  exchangeRate: number | null = null;
  institution = '';
  date = new Date().toISOString().split('T')[0];
  roomRemaining: number | null = null;
  notes = '';
  submitting = signal(false);

  accountTypes = Object.values(InvestmentAccountType);
  currencies = Object.values(Currency);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
  }

  async onSubmit() {
    this.submitting.set(true);
    try {
      await this.investmentService.createContribution(this.taxYearId, {
        accountType: this.accountType,
        amount: this.amount,
        currency: this.currency,
        exchangeRate: this.exchangeRate ?? undefined,
        institution: this.institution || undefined,
        date: this.date,
        roomRemaining: this.roomRemaining ?? undefined,
        notes: this.notes || undefined,
      });
      this.router.navigate(['/dashboard/tax-years', this.taxYearId, 'investments']);
    } finally {
      this.submitting.set(false);
    }
  }
}
