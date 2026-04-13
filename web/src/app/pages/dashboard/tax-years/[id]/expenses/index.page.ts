import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ExpenseService } from '../../../../../services/expense.service';
import { ExpenseCategoryType } from '@can-tax-pro/types';

@Component({
  selector: 'app-expense-list',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId]" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Expenses</h1>
        </div>

        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Filter by category:</label>
            <select [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange($event)"
                    class="border border-gray-300 rounded px-3 py-1.5 text-sm">
              <option value="">All</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/dashboard/tax-years', taxYearId, 'expenses', 'import']"
               class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
              Import CSV
            </a>
            <a [routerLink]="['/dashboard/tax-years', taxYearId, 'expenses', 'new']"
               class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Add Expense
            </a>
          </div>
        </div>

        @if (expenseService.loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (expenseService.entries().length === 0) {
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <p class="text-gray-500">No expense entries yet.</p>
          </div>
        } @else {
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Vendor</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Currency</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">CAD</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (entry of expenseService.entries(); track entry.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm">{{ entry.date | date:'yyyy-MM-dd' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">{{ entry.category }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm">{{ entry.vendor || '—' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ entry.description || '—' }}</td>
                    <td class="px-4 py-3 text-sm text-right font-mono">{{ entry.amount | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm">{{ entry.currency }}</td>
                    <td class="px-4 py-3 text-sm text-right font-mono">{{ (entry.amountCad ?? entry.amount) | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm flex gap-2">
                      <a [routerLink]="['/dashboard/tax-years', taxYearId, 'expenses', entry.id]"
                         class="text-blue-600 hover:text-blue-800">Edit</a>
                      <button (click)="onDelete(entry.id)"
                              class="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export default class ExpenseListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  expenseService = inject(ExpenseService);

  taxYearId = '';
  selectedCategory = '';
  categories = Object.values(ExpenseCategoryType);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.expenseService.loadEntries(this.taxYearId);
  }

  onFilterChange(category: string) {
    this.expenseService.loadEntries(this.taxYearId, category || undefined);
  }

  async onDelete(id: string) {
    if (confirm('Delete this expense entry?')) {
      await this.expenseService.deleteEntry(this.taxYearId, id);
      await this.expenseService.loadEntries(this.taxYearId, this.selectedCategory || undefined);
    }
  }
}
