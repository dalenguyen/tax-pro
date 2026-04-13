import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ReportService } from '../../../../../services/report.service';

interface T2125Expenses {
  advertising: number;
  internet: number;
  officeExpenses: number;
  otherExpenses: number;
}

interface T2125Data {
  grossIncome: number;
  expenses: T2125Expenses;
  totalExpenses: number;
  netIncome: number;
}

@Component({
  selector: 'app-t2125',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @media print { .no-print { display: none !important; } }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-6 no-print">
          <div class="flex items-center gap-4">
            <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Reports</a>
            <h1 class="text-3xl font-bold text-gray-900">T2125 — Statement of Business Activities</h1>
          </div>
          <button (click)="print()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
            Print / Save PDF
          </button>
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (data()) {
          <div class="bg-white rounded-lg shadow print-page p-8 space-y-8">
            <div class="border-b pb-4">
              <h2 class="text-xl font-bold text-gray-900">T2125 — Statement of Business or Professional Activities</h2>
              <p class="text-sm text-gray-500 mt-1">Canada Revenue Agency</p>
            </div>

            <!-- Income section -->
            <section>
              <h3 class="text-base font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded mb-3">
                Part 1 — Income
              </h3>
              <div class="space-y-2 px-2">
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-gray-700">
                    <span class="text-xs text-gray-400 font-mono mr-2">8000</span>
                    Gross business income
                  </span>
                  <span class="font-mono font-semibold w-36 text-right">\${{ data()!.grossIncome | number:'1.2-2' }}</span>
                </div>
              </div>
            </section>

            <!-- Expenses section -->
            <section>
              <h3 class="text-base font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded mb-3">
                Part 2 — Expenses
              </h3>
              <div class="space-y-2 px-2">
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-gray-700">
                    <span class="text-xs text-gray-400 font-mono mr-2">8520</span>
                    Advertising
                  </span>
                  <span class="font-mono w-36 text-right">\${{ data()!.expenses.advertising | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-gray-700">
                    <span class="text-xs text-gray-400 font-mono mr-2">8590</span>
                    Internet and telephone
                  </span>
                  <span class="font-mono w-36 text-right">\${{ data()!.expenses.internet | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-gray-700">
                    <span class="text-xs text-gray-400 font-mono mr-2">8810</span>
                    Office expenses (email, hosting, GCP, domains)
                  </span>
                  <span class="font-mono w-36 text-right">\${{ data()!.expenses.officeExpenses | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-gray-700">
                    <span class="text-xs text-gray-400 font-mono mr-2">9270</span>
                    Other expenses
                  </span>
                  <span class="font-mono w-36 text-right">\${{ data()!.expenses.otherExpenses | number:'1.2-2' }}</span>
                </div>

                <!-- Total expenses -->
                <div class="flex justify-between items-center py-2 bg-gray-50 px-3 rounded font-semibold">
                  <span class="text-gray-900">
                    <span class="text-xs text-gray-400 font-mono mr-2">9368</span>
                    Total expenses
                  </span>
                  <span class="font-mono w-36 text-right text-red-700">\${{ data()!.totalExpenses | number:'1.2-2' }}</span>
                </div>
              </div>
            </section>

            <!-- Net income -->
            <section>
              <h3 class="text-base font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded mb-3">
                Part 3 — Net Income
              </h3>
              <div class="px-2">
                <div class="flex justify-between items-center py-3 border border-gray-300 rounded px-4 bg-blue-50">
                  <span class="font-bold text-gray-900">
                    <span class="text-xs text-gray-500 font-mono mr-2">9369</span>
                    Net income (loss)
                  </span>
                  <span [class]="data()!.netIncome >= 0 ? 'font-mono font-bold text-xl text-blue-800 w-36 text-right' : 'font-mono font-bold text-xl text-red-700 w-36 text-right'">
                    \${{ data()!.netIncome | number:'1.2-2' }}
                  </span>
                </div>
              </div>
            </section>

            <p class="text-xs text-gray-400 text-center pt-4 border-t">
              Generated by Can Tax Pro — for reference only. Verify with your tax professional before filing.
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export default class T2125Component implements OnInit {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);

  taxYearId = '';
  data = signal<T2125Data | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.load();
  }

  private async load() {
    this.loading.set(true);
    try {
      const d = await this.reportService.getT2125(this.taxYearId);
      this.data.set(d);
    } finally {
      this.loading.set(false);
    }
  }

  print() { window.print(); }
}
