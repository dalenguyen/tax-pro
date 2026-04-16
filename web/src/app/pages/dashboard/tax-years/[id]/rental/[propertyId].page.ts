import { Component, inject, OnInit, ChangeDetectionStrategy, signal, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RentalService } from '../../../../../services/rental.service';
import { RentalIncome, RentalExpense, RentalExpenseCategory } from '@cantax-fyi/types';

@Component({
  selector: 'app-rental-detail',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'rental']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Rental Property</h1>
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else {
          <!-- Property Address -->
          <div class="bg-white rounded-lg shadow p-4 mb-6">
            <div class="flex items-center gap-3">
              @if (editingAddress()) {
                <input type="text" [(ngModel)]="address" name="address"
                       class="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1" />
                <button (click)="saveAddress()"
                        class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">Save</button>
                <button (click)="cancelEditAddress()"
                        class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200">Cancel</button>
              } @else {
                <p class="text-lg font-medium text-gray-900 flex-1">{{ address }}</p>
                <button (click)="startEditAddress()"
                        class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              }
            </div>
          </div>

          <!-- Rental Income Section -->
          <div class="bg-white rounded-lg shadow mb-6">
            <div class="px-4 py-3 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Rental Income</h2>
            </div>

            @if (incomes().length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    @for (income of incomes(); track income.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">{{ income.date | date:'yyyy-MM-dd' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ income.description || '—' }}</td>
                        <td class="px-4 py-3 text-sm text-right font-mono">{{ income.amount | number:'1.2-2' }}</td>
                        <td class="px-4 py-3 text-sm">
                          <button (click)="deleteIncome(income.id)"
                                  class="text-red-600 hover:text-red-800">Delete</button>
                        </td>
                      </tr>
                    }
                    <tr class="bg-gray-50 font-medium">
                      <td class="px-4 py-3 text-sm" colspan="2">Total</td>
                      <td class="px-4 py-3 text-sm text-right font-mono">{{ totalIncome() | number:'1.2-2' }}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }

            <!-- Add Income Form -->
            <div class="p-4 border-t border-gray-100">
              <p class="text-sm font-medium text-gray-700 mb-2">Add Income</p>
              <div class="flex gap-2 flex-wrap">
                <input type="text" [(ngModel)]="newIncome.description" name="incomeDescription"
                       placeholder="Description (optional)"
                       class="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-32" />
                <input type="number" [(ngModel)]="newIncome.amount" name="incomeAmount"
                       placeholder="Amount" min="0" step="0.01"
                       class="border border-gray-300 rounded px-3 py-1.5 text-sm w-32" />
                <input type="date" [(ngModel)]="newIncome.date" name="incomeDate"
                       class="border border-gray-300 rounded px-3 py-1.5 text-sm" />
                <button (click)="addIncome()" [disabled]="submittingIncome()"
                        class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
                  {{ submittingIncome() ? 'Adding...' : 'Add' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Rental Expenses Section -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-4 py-3 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Rental Expenses</h2>
            </div>

            @if (expenses().length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
                      <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    @for (expense of expenses(); track expense.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">{{ expense.date | date:'yyyy-MM-dd' }}</td>
                        <td class="px-4 py-3 text-sm">
                          <span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">{{ expense.category }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ expense.description || '—' }}</td>
                        <td class="px-4 py-3 text-sm text-right font-mono">{{ expense.amount | number:'1.2-2' }}</td>
                        <td class="px-4 py-3 text-sm">
                          <button (click)="deleteExpense(expense.id)"
                                  class="text-red-600 hover:text-red-800">Delete</button>
                        </td>
                      </tr>
                    }
                    <tr class="bg-gray-50 font-medium">
                      <td class="px-4 py-3 text-sm" colspan="3">Total</td>
                      <td class="px-4 py-3 text-sm text-right font-mono">{{ totalExpenses() | number:'1.2-2' }}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }

            <!-- Add Expense Form -->
            <div class="p-4 border-t border-gray-100">
              <p class="text-sm font-medium text-gray-700 mb-2">Add Expense</p>
              <div class="flex gap-2 flex-wrap">
                <select [(ngModel)]="newExpense.category" name="expenseCategory"
                        class="border border-gray-300 rounded px-3 py-1.5 text-sm">
                  @for (cat of expenseCategories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
                <input type="text" [(ngModel)]="newExpense.description" name="expenseDescription"
                       placeholder="Description (optional)"
                       class="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-32" />
                <input type="number" [(ngModel)]="newExpense.amount" name="expenseAmount"
                       placeholder="Amount" min="0" step="0.01"
                       class="border border-gray-300 rounded px-3 py-1.5 text-sm w-32" />
                <input type="date" [(ngModel)]="newExpense.date" name="expenseDate"
                       class="border border-gray-300 rounded px-3 py-1.5 text-sm" />
                <button (click)="addExpense()" [disabled]="submittingExpense()"
                        class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">
                  {{ submittingExpense() ? 'Adding...' : 'Add' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export default class RentalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rentalService = inject(RentalService);
  private cdr = inject(ChangeDetectorRef);

  taxYearId = '';
  propertyId = '';
  loading = signal(true);
  editingAddress = signal(false);
  submittingIncome = signal(false);
  submittingExpense = signal(false);

  address = '';
  incomes = signal<RentalIncome[]>([]);
  expenses = signal<RentalExpense[]>([]);

  totalIncome = signal(0);
  totalExpenses = signal(0);

  expenseCategories = Object.values(RentalExpenseCategory);

  newIncome = {
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  };

  newExpense = {
    category: RentalExpenseCategory.OTHER,
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  };

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.propertyId = this.route.snapshot.params['propertyId'];
    this.loadProperty();
  }

  private async loadProperty() {
    this.loading.set(true);
    try {
      const data = await this.rentalService.getProperty(this.taxYearId, this.propertyId);
      this.address = data.address;
      this.incomes.set(data.incomes);
      this.expenses.set(data.expenses);
      this.recalcTotals();
    } finally {
      this.loading.set(false);
    }
  }

  private recalcTotals() {
    this.totalIncome.set(this.incomes().reduce((sum, i) => sum + i.amount, 0));
    this.totalExpenses.set(this.expenses().reduce((sum, e) => sum + e.amount, 0));
  }

  startEditAddress() {
    this.editingAddress.set(true);
  }

  cancelEditAddress() {
    this.editingAddress.set(false);
  }

  async saveAddress() {
    await this.rentalService.updateProperty(this.taxYearId, this.propertyId, { address: this.address });
    this.editingAddress.set(false);
  }

  async addIncome() {
    if (!this.newIncome.amount || !this.newIncome.date) return;
    this.submittingIncome.set(true);
    try {
      const income = await this.rentalService.addIncome(this.taxYearId, this.propertyId, {
        description: this.newIncome.description || undefined,
        amount: this.newIncome.amount,
        date: this.newIncome.date,
      });
      this.incomes.update(list => [...list, income]);
      this.recalcTotals();
      this.newIncome = { description: '', amount: 0, date: new Date().toISOString().split('T')[0] };
    } finally {
      this.submittingIncome.set(false);
    }
  }

  async deleteIncome(id: string) {
    if (confirm('Delete this income entry?')) {
      await this.rentalService.deleteIncome(this.taxYearId, this.propertyId, id);
      this.incomes.update(list => list.filter(i => i.id !== id));
      this.recalcTotals();
    }
  }

  async addExpense() {
    if (!this.newExpense.amount || !this.newExpense.date) return;
    this.submittingExpense.set(true);
    try {
      const expense = await this.rentalService.addExpense(this.taxYearId, this.propertyId, {
        category: this.newExpense.category,
        description: this.newExpense.description || undefined,
        amount: this.newExpense.amount,
        date: this.newExpense.date,
      });
      this.expenses.update(list => [...list, expense]);
      this.recalcTotals();
      this.newExpense = { category: RentalExpenseCategory.OTHER, description: '', amount: 0, date: new Date().toISOString().split('T')[0] };
    } finally {
      this.submittingExpense.set(false);
    }
  }

  async deleteExpense(id: string) {
    if (confirm('Delete this expense?')) {
      await this.rentalService.deleteExpense(this.taxYearId, this.propertyId, id);
      this.expenses.update(list => list.filter(e => e.id !== id));
      this.recalcTotals();
    }
  }
}
